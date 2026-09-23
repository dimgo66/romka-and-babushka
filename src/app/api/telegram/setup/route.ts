import { NextResponse } from 'next/server';

import { registerWebhook, sendTelegramMessage } from '@/lib/telegram';
import { isAuthenticated } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/telegram/setup — разовая настройка вебхука бота.
 * Доступно только авторизованному администратору CRM
 * (или при наличии секрета в query-параметре для первичной установки).
 *
 *   /api/telegram/setup?secret=<TELEGRAM_WEBHOOK_SECRET>
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  const allowedBySecret = Boolean(process.env.TELEGRAM_WEBHOOK_SECRET) && secret === process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!allowedBySecret && !(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const publicUrl = url.searchParams.get('url') || process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const result = await registerWebhook(publicUrl);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, webhook: `${publicUrl.replace(/\/$/, '')}/api/telegram/webhook` });
}

/** POST /api/telegram/setup — тестовое сообщение в чат менеджера */
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const result = await sendTelegramMessage(
    '✅ Проверка связи: сайт «Рассказы о Ромке и его бабушке» подключён к этому чату.',
  );
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
