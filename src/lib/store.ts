import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import type { Locale } from './i18n';
import type { LeadStatus } from './config';
import { LEAD_STATUSES, isLeadStatus } from './config';

/**
 * Хранилище заявок.
 *
 * 1. Если задан DATABASE_URL — используется PostgreSQL через Prisma
 *    (см. prisma/schema.prisma, модель Lead).
 * 2. Иначе — локальное JSON-хранилище в LOCAL_DATA_DIR (по умолчанию .data).
 *    Оно предназначено только для разработки: на Vercel файловая система
 *    доступна лишь на чтение, поэтому в продакшене обязательно DATABASE_URL.
 *
 * Prisma Client импортируется статически: так сборщик Next.js трассирует пакет
 * вместе с query-движком и включает их в серверный бандл на Vercel.
 * Без DATABASE_URL клиент не создаётся и код работает на JSON-хранилище.
 */

export type Lead = {
  id: string;
  name: string;
  email: string;
  comment: string | null;
  locale: Locale;
  status: LeadStatus;
  notes: string | null;
  consent: boolean;
  source: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewLead = {
  name: string;
  email: string;
  comment?: string | null;
  locale: Locale;
  source?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export type LeadQuery = {
  search?: string;
  status?: LeadStatus | 'all';
  locale?: Locale | 'all';
  from?: string;
  to?: string;
  limit?: number;
};

export type LeadPatch = {
  status?: LeadStatus;
  notes?: string | null;
};

export type LeadStats = {
  total: number;
  last7days: number;
  byStatus: Record<LeadStatus, number>;
  byLocale: Record<Locale, number>;
};

/* ──────────────────────────  выбор бэкенда  ────────────────────────── */

/**
 * Имена переменных с адресом базы, которые встречаются в реальности.
 * Neon через интеграцию Vercel создаёт сразу несколько: DATABASE_URL,
 * POSTGRES_PRISMA_URL (пулер), POSTGRES_URL_NON_POOLING (прямое подключение)
 * и другие. Порядок — от самого предпочтительного к запасному: сначала
 * пулер (он нужен serverless-функциям), затем прямое подключение.
 */
const DB_URL_VARS = [
  'DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
] as const;

/** Первое заданное имя из DB_URL_VARS либо null. */
function databaseUrl(): string | null {
  for (const name of DB_URL_VARS) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}

/** Имя переменной, из которой взяли адрес (для диагностики). */
function databaseUrlVar(): string | null {
  for (const name of DB_URL_VARS) {
    if (process.env[name]?.trim()) return name;
  }
  return null;
}

const HAS_DATABASE = databaseUrl() !== null;

type PrismaLike = {
  lead: {
    create: (args: unknown) => Promise<Record<string, unknown>>;
    findMany: (args?: unknown) => Promise<Record<string, unknown>[]>;
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    update: (args: unknown) => Promise<Record<string, unknown>>;
    delete: (args: unknown) => Promise<unknown>;
    count: (args?: unknown) => Promise<number>;
    groupBy: (args: unknown) => Promise<Record<string, unknown>[]>;
  };
};

/** Опции конструктора PrismaClient: datasourceUrl поддержан в Prisma 6. */
type PrismaOptions = { datasourceUrl?: string };

let prismaClient: PrismaLike | null = null;

async function getPrisma(): Promise<PrismaLike> {
  if (prismaClient) return prismaClient;

  // Статический импорт: Next.js трассирует @prisma/client и его движок
  // в серверный бандл. Пакет уже в зависимостях, генерация — `npm run db:generate`.
  const mod = await import('@prisma/client');
  const PrismaClient =
    mod.PrismaClient ??
    (mod as { default?: { PrismaClient: new (options?: PrismaOptions) => PrismaLike } }).default?.PrismaClient;
  if (!PrismaClient) {
    throw new Error('Prisma Client не сгенерирован: выполните `npm run db:generate`');
  }

  // Адрес передаём явно: схема Prisma читает только env("DATABASE_URL"),
  // а Neon через интеграцию Vercel может создать переменную с другим именем
  // (POSTGRES_URL, POSTGRES_PRISMA_URL и т. п.).
  const url = databaseUrl();
  if (!url) {
    throw new Error('Адрес базы не найден: задайте DATABASE_URL или POSTGRES_URL');
  }

  prismaClient = new PrismaClient({ datasourceUrl: url }) as unknown as PrismaLike;
  return prismaClient;
}

/* ──────────────────────────  JSON-хранилище  ───────────────────────── */

function dataFile(): string {
  const dir = process.env.LOCAL_DATA_DIR || '.data';
  return path.resolve(process.cwd(), dir, 'leads.json');
}

async function readAll(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(dataFile(), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Lead[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function writeAll(leads: Lead[]): Promise<void> {
  const file = dataFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(leads, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

/* ──────────────────────────  сериализация  ─────────────────────────── */

function rowToLead(row: Record<string, unknown>): Lead {
  const iso = (value: unknown): string =>
    value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : new Date().toISOString();

  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    comment: (row.comment as string | null) ?? null,
    locale: row.locale === 'en' ? 'en' : 'ru',
    status: isLeadStatus(row.status) ? row.status : 'new',
    notes: (row.notes as string | null) ?? null,
    consent: row.consent === false ? false : true,
    source: (row.source as string | null) ?? null,
    ip: (row.ip as string | null) ?? null,
    userAgent: (row.userAgent as string | null) ?? null,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

/* ──────────────────────────  публичный API  ────────────────────────── */

export function storageKind(): 'postgres' | 'json' {
  return HAS_DATABASE ? 'postgres' : 'json';
}

/**
 * Диагностика хранилища без раскрытия адреса базы.
 * Помогает понять, почему на проде всё ещё JSON: переменная не задана,
 * задана не в том окружении или задана с другим именем.
 */
export function storageDiagnostics() {
  const host = (() => {
    const url = databaseUrl();
    if (!url) return null;
    try {
      return new URL(url).host;
    } catch {
      return 'не удалось разобрать адрес';
    }
  })();

  // На случай неожиданного имени: перечисляем ВСЕ переменные окружения,
  // которые похожи на адрес базы (только имена, без значений).
  // Помогает, когда интеграция Vercel создаёт переменную со своим названием.
  const suspicious = Object.keys(process.env)
    .filter((name) => /DATABASE|POSTGRES|NEON|_PG_|^PG/i.test(name))
    .sort();

  return {
    kind: storageKind(),
    /** Какое имя переменной реально найдено в окружении */
    urlVarFound: databaseUrlVar(),
    /** Все имена, которые проверялись */
    checkedVars: [...DB_URL_VARS],
    /** Какие из них заданы (без значений) */
    presentVars: DB_URL_VARS.filter((name) => Boolean(process.env[name]?.trim())),
    /** Заданы, но пусты — например DATABASE_URL="" (частая ошибка при вставке шаблона) */
    emptyVars: DB_URL_VARS.filter((name) => name in process.env && !process.env[name]?.trim()),
    /** Прочие переменные с адресом базы (имена без значений) */
    otherDbLikeVars: suspicious,
    /** Хост базы — не секрет, помогает убедиться, что это нужный проект */
    host,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    verdict: HAS_DATABASE
      ? 'База подключена'
      : DB_URL_VARS.some((name) => name in process.env && !process.env[name]?.trim())
        ? 'Переменная с адресом базы ЗАДАНА, НО ПУСТА. Вставьте строку подключения в её значение (Vercel: Settings → Environment Variables → ⋮ → Edit) и сделайте Redeploy'
        : 'Адрес базы не найден. Проверьте, что переменная добавлена для окружения Production (Settings → Environment Variables → Environments)',
  };
}

/**
 * Живая проверка подключения к базе: получается ли запросить таблицу заявок.
 * Нужна, чтобы отличить «база не подключена» от «подключена, но таблиц нет»
 * (таблицы создаёт `npm run db:push`).
 */
export async function verifyDatabase(): Promise<{
  connected: boolean;
  tableReady: boolean;
  leadCount?: number;
  error?: string;
}> {
  if (!HAS_DATABASE) {
    return { connected: false, tableReady: false, error: 'Адрес базы не задан' };
  }

  try {
    const prisma = await getPrisma();
    const leadCount = await prisma.lead.count();
    return { connected: true, tableReady: true, leadCount };
  } catch (error) {
    const message = (error as Error).message ?? String(error);

    // P2021 — таблица не существует: соединение есть, схемы нет.
    // Всё остальное (P1001 «can't reach», таймаут, неверный пароль) —
    // это именно отсутствие связи, а не готовая база без таблиц.
    const tableMissing = /P2021|relation .* does not exist|table .* does not exist/i.test(message);

    if (tableMissing) {
      return {
        connected: true,
        tableReady: false,
        error:
          'База доступна, но таблицы нет. Выполните `npm run db:push` со строкой подключения этой базы',
      };
    }

    return {
      connected: false,
      tableReady: false,
      error: summarizeDbError(message),
    };
  }
}

/** Короткая суть ошибки Prisma: самая полезная строка вместо всего стека. */
function summarizeDbError(message: string): string {
  const lines = message
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  // Prisma кладёт понятное объяснение в отдельную строку
  const meaningful = lines.find((line) =>
    /can't reach|authentication failed|does not exist|timed out|timeout|denied|ENOTFOUND|ECONNREFUSED|password/i.test(
      line,
    ),
  );

  return (meaningful ?? lines[0] ?? 'неизвестная ошибка').slice(0, 200);
}

export async function createLead(input: NewLead): Promise<Lead> {
  const now = new Date().toISOString();
  const payload = {
    name: input.name,
    email: input.email,
    comment: input.comment ?? null,
    locale: input.locale,
    status: 'new' as LeadStatus,
    notes: null,
    consent: true,
    source: input.source ?? null,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  };

  if (HAS_DATABASE) {
    const prisma = await getPrisma();
    const created = await prisma.lead.create({ data: payload });
    return rowToLead(created);
  }

  const leads = await readAll();
  const lead: Lead = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  leads.unshift(lead);
  await writeAll(leads);
  return lead;
}

function applyFilters(leads: Lead[], query: LeadQuery): Lead[] {
  const search = query.search?.trim().toLowerCase();
  const from = query.from ? Date.parse(query.from) : null;
  const to = query.to ? Date.parse(`${query.to}T23:59:59.999Z`) : null;

  return leads.filter((lead) => {
    if (query.status && query.status !== 'all' && lead.status !== query.status) return false;
    if (query.locale && query.locale !== 'all' && lead.locale !== query.locale) return false;
    if (search && !`${lead.name} ${lead.email}`.toLowerCase().includes(search)) return false;
    const created = Date.parse(lead.createdAt);
    if (from !== null && Number.isFinite(from) && created < from) return false;
    if (to !== null && Number.isFinite(to) && created > to) return false;
    return true;
  });
}

export async function listLeads(query: LeadQuery = {}): Promise<Lead[]> {
  if (HAS_DATABASE) {
    const prisma = await getPrisma();
    const where: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') where.status = query.status;
    if (query.locale && query.locale !== 'all') where.locale = query.locale;
    if (query.search?.trim()) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { email: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }
    if (query.from || query.to) {
      const createdAt: Record<string, Date> = {};
      if (query.from) createdAt.gte = new Date(query.from);
      if (query.to) createdAt.lte = new Date(`${query.to}T23:59:59.999Z`);
      where.createdAt = createdAt;
    }
    const rows = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 500,
    });
    return rows.map(rowToLead);
  }

  const leads = await readAll();
  return applyFilters(leads, query)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, query.limit ?? 500);
}

export async function getLead(id: string): Promise<Lead | null> {
  if (HAS_DATABASE) {
    const prisma = await getPrisma();
    const row = await prisma.lead.findUnique({ where: { id } });
    return row ? rowToLead(row) : null;
  }
  const leads = await readAll();
  return leads.find((lead) => lead.id === id) ?? null;
}

export async function updateLead(id: string, patch: LeadPatch): Promise<Lead | null> {
  if (HAS_DATABASE) {
    const prisma = await getPrisma();
    try {
      const row = await prisma.lead.update({ where: { id }, data: patch });
      return rowToLead(row);
    } catch {
      return null;
    }
  }

  const leads = await readAll();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index === -1) return null;
  leads[index] = { ...leads[index], ...patch, updatedAt: new Date().toISOString() };
  await writeAll(leads);
  return leads[index];
}

export async function deleteLead(id: string): Promise<boolean> {
  if (HAS_DATABASE) {
    const prisma = await getPrisma();
    try {
      await prisma.lead.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  const leads = await readAll();
  const next = leads.filter((lead) => lead.id !== id);
  if (next.length === leads.length) return false;
  await writeAll(next);
  return true;
}

export async function getStats(): Promise<LeadStats> {
  const leads = await listLeads({ limit: Number.MAX_SAFE_INTEGER });

  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  const byLocale: Record<Locale, number> = { ru: 0, en: 0 };
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let last7days = 0;

  for (const lead of leads) {
    byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1;
    byLocale[lead.locale] = (byLocale[lead.locale] ?? 0) + 1;
    if (Date.parse(lead.createdAt) >= weekAgo) last7days += 1;
  }

  return { total: leads.length, last7days, byStatus, byLocale };
}

/** Экранирование значения для CSV */
function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",;\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function leadsToCsv(query: LeadQuery = {}): Promise<string> {
  const leads = await listLeads(query);
  const header = ['ID', 'Name', 'Email', 'Comment', 'Locale', 'Status', 'Notes', 'Created at', 'Updated at'];
  const lines = [header.join(';')];

  for (const lead of leads) {
    lines.push(
      [
        lead.id,
        lead.name,
        lead.email,
        lead.comment,
        lead.locale,
        lead.status,
        lead.notes,
        lead.createdAt,
        lead.updatedAt,
      ]
        .map(csvCell)
        .join(';'),
    );
  }

  // BOM, чтобы Excel корректно открыл кириллицу
  return `\uFEFF${lines.join('\r\n')}`;
}
