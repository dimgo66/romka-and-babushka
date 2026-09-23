import { NextResponse } from 'next/server';

import { sendTelegramMessage } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/telegram/webhook — вебхук Telegram Bot API.
 *
 * Бот работает в режиме «только уведомления»: заявки приходят менеджеру
 * в чат. Вебхук нужен, чтобы Telegram не накапливал необработанные
 * обновления, и чтобы можно было ответить на служебные команды.
 */
export async function POST(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expected) {
    const provided = request.headers.get('x-telegram-bot-api-secret-token');
    if (provided !== expected) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }
  }

  let update: {
    message?: { text?: string; chat?: { id?: number | string } };
    edited_message?: { text?: string };
  };

  try {
    update = (await request.json()) as typeof update;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const text = update.message?.text?.trim() ?? '';
  const chatId = update.message?.chat?.id;

  // Отвечаем только на явные команды; обычные сообщения игнорируются.
  if (text.startsWith('/start') || text.startsWith('/help')) {
    await sendTelegramMessage(
      [
        '<b>Бот уведомлений сайта «Рассказы о Ромке и его бабушке»</b>',
        '',
        'Заявки с сайта приходят в этот чат автоматически.',
        'Команды не требуются.',
        '',
        'Админ-панель: /admin',
      ].join('\n'),
    );
  } else if (text.startsWith('/id') && chatId !== undefined) {
    await sendTelegramMessage(`ID этого чата: <code>${String(chatId)}</code>`);
  }

  // Telegram ожидает 200 в любом случае, иначе будет повторять доставку.
  return NextResponse.json({ ok: true });
}

/** GET — проверка, что вебхук доступен */
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'telegram-webhook' });
}
