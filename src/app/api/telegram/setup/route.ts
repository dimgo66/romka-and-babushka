import { NextResponse } from 'next/server';

import {
  registerWebhook,
  sendTelegramMessage,
  telegramDiagnostics,
  verifyBotToken,
} from '@/lib/telegram';
import { isAuthenticated } from '@/lib/auth';
import { siteUrlOrNull } from '@/lib/config';
import { storageDiagnostics, verifyDatabase } from '@/lib/store';

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

  // ?diagnose=1 — проверка настроек без попытки поставить вебхук.
  // Показывает форму токена (не раскрывая секрет), живой ответ Bot API,
  // состояние хранилища и живую проверку базы (доступна ли таблица заявок).
  if (url.searchParams.get('diagnose') === '1') {
    const bot = await verifyBotToken();
    const database = await verifyDatabase();
    return NextResponse.json(
      {
        ok: bot.ok,
        diagnostics: telegramDiagnostics(),
        storage: storageDiagnostics(),
        database,
        bot,
      },
      { status: bot.ok ? 200 : 500 },
    );
  }

  const publicUrl = url.searchParams.get('url') || siteUrlOrNull() || url.origin;
  const result = await registerWebhook(publicUrl);

  if (!result.ok) {
    // На ошибке прикладываем диагностику: чаще всего причина — неверный токен
    const bot = await verifyBotToken();
    return NextResponse.json(
      { ok: false, error: result.error, diagnostics: telegramDiagnostics(), bot },
      { status: 500 },
    );
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
  if (result.ok) return NextResponse.json(result, { status: 200 });

  // Ошибка отправки: показываем, дело в токене или в чате
  const bot = await verifyBotToken();
  return NextResponse.json(
    { ...result, diagnostics: telegramDiagnostics(), bot },
    { status: 500 },
  );
}
