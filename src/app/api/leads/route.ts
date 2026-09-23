import { NextResponse } from 'next/server';

import { createLead, getStats, listLeads, storageKind } from '@/lib/store';
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
    return NextResponse.json({ ok: false, error: 'serverError' }, { status: 500 });
  }
}
