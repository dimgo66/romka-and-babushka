import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { createLead, getStats, listLeads, storageKind, type Lead } from '@/lib/store';
import { validateLeadInput } from '@/lib/validation';
import { notifyNewLead, telegramConfigured } from '@/lib/telegram';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { isAuthenticated } from '@/lib/auth';
import { isLeadStatus, type LeadStatus } from '@/lib/config';
import { isLocale, type Locale } from '@/lib/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/leads — список заявок и статистика для CRM.
 * Доступно только авторизованному администратору.
 */
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const localeParam = url.searchParams.get('locale');

  const leads = await listLeads({
    search: url.searchParams.get('search') ?? undefined,
    status: statusParam && isLeadStatus(statusParam) ? (statusParam as LeadStatus) : 'all',
    locale: localeParam && isLocale(localeParam) ? (localeParam as Locale) : 'all',
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
    limit: 1000,
  });

  return NextResponse.json(
    { ok: true, leads, stats: await getStats(), storage: storageKind() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

/**
 * POST /api/leads
 * 1. валидирует данные;
 * 2. сохраняет заявку в PostgreSQL (Prisma) или в локальное JSON-хранилище;
 * 3. отправляет уведомление в Telegram-бот менеджеру;
 * 4. возвращает результат на фронтенд.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);

  const limit = rateLimit(`leads:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'rateLimited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalidJson' }, { status: 400 });
  }

  // Honeypot: скрытое поле заполняют только боты — отвечаем «успехом», ничего не сохраняя
  const honeypot = (payload as { website?: unknown } | null)?.website;
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true, spam: true });
  }

  const validation = validateLeadInput(payload);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: 'validation', fieldErrors: validation.fieldErrors }, { status: 400 });
  }

  try {
    const lead = await createLead({
      ...validation.value,
      ip,
      userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
    });

    // Уведомление не должно ломать приём заявки: ошибка только логируется
    if (telegramConfigured()) {
      const notified = await notifyNewLead(lead);
      if (!notified.ok) console.error('[telegram] не удалось отправить уведомление:', notified.error);
    }

    return NextResponse.json({ ok: true, id: lead.id, storage: storageKind() }, { status: 201 });
  } catch (error) {
    console.error('[api/leads] ошибка сохранения заявки:', error);

    // Запасной путь: если сохранить не удалось (например, на Vercel не задан
    // DATABASE_URL, а файловая система только для чтения), заявка всё равно
    // уходит менеджеру в Telegram — иначе обращение клиента теряется молча.
    if (telegramConfigured()) {
      const fallback = buildUnsavedLead(validation.value, ip, request);
      const notified = await notifyNewLead(fallback);
      if (notified.ok) {
        console.warn('[api/leads] заявка не сохранена, но доставлена в Telegram:', fallback.id);
        return NextResponse.json(
          { ok: true, id: fallback.id, storage: storageKind(), saved: false, delivered: true },
          { status: 201 },
        );
      }
      console.error('[telegram] запасная доставка тоже не удалась:', notified.error);
    }

    return NextResponse.json({ ok: false, error: 'serverError' }, { status: 500 });
  }
}

/**
 * Заявка, которую не удалось записать в хранилище.
 * Используется только для уведомления, чтобы обращение не потерялось.
 */
function buildUnsavedLead(
  value: { name: string; email: string; comment?: string | null; locale: Locale },
  ip: string | null,
  request: Request,
): Lead {
  const now = new Date().toISOString();
  return {
    id: `unsaved-${randomUUID()}`,
    name: value.name,
    email: value.email,
    comment: value.comment ?? null,
    locale: value.locale,
    status: 'new',
    notes: null,
    consent: true,
    source: 'not-saved',
    ip,
    userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
    createdAt: now,
    updatedAt: now,
  };
}
