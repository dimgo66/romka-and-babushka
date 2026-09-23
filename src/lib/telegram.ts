import 'server-only';

import { createHash } from 'node:crypto';

import type { Lead } from './store';

/**
 * Уведомления в Telegram через Bot API.
 * Бот не принимает команд от пользователя — только отправляет сообщения
 * в чат менеджера (TELEGRAM_CHAT_ID).
 */

function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

function chatIds(): string[] {
  return (process.env.TELEGRAM_CHAT_ID ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function telegramConfigured(): boolean {
  return Boolean(botToken()) && chatIds().length > 0;
}

export function formatLeadMessage(lead: Lead): string {
  const unsaved = lead.source === 'not-saved';

  const lines = [
    unsaved ? '⚠️ Заявка НЕ сохранена в базе — сохраните данные вручную!' : '🎉 Новая заявка!',
    ...(unsaved ? ['Хранилище недоступно, эти данные есть только в сообщении.', ''] : ['']),
    `Имя: ${lead.name}`,
    `Email: ${lead.email}`,
    `Комментарий: ${lead.comment?.trim() || '—'}`,
    `Язык: ${lead.locale}`,
    `Дата: ${new Date(lead.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
    `ID: ${lead.id}`,
  ];

  if (lead.source && !unsaved) lines.push(`Источник: ${lead.source}`);
  return lines.join('\n');
}

type TelegramResult = { ok: boolean; error?: string };

export async function sendTelegramMessage(text: string): Promise<TelegramResult> {
  const token = botToken();
  const ids = chatIds();
  if (!token || ids.length === 0) {
    return { ok: false, error: 'Telegram не настроен (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)' };
  }

  const errors: string[] = [];
  for (const chatId of ids) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const detail = await response.text();
        errors.push(`${chatId}: HTTP ${response.status} ${detail.slice(0, 200)}`);
      }
    } catch (error) {
      errors.push(`${chatId}: ${(error as Error).message}`);
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, error: errors.join('; ') };
}

/** Экранирование для parse_mode=HTML */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function notifyNewLead(lead: Lead): Promise<TelegramResult> {
  // Пользовательские данные экранируются, поэтому формат сообщения собирается здесь.
  const safe: Lead = {
    ...lead,
    name: escapeHtml(lead.name),
    email: escapeHtml(lead.email),
    comment: lead.comment ? escapeHtml(lead.comment) : null,
  };
  return sendTelegramMessage(formatLeadMessage(safe));
}

export async function registerWebhook(publicUrl: string): Promise<TelegramResult> {
  const token = botToken();
  if (!token) return { ok: false, error: 'TELEGRAM_BOT_TOKEN не задан' };

  const url = `${publicUrl.replace(/\/$/, '')}/api/telegram/webhook`;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
        allowed_updates: ['message'],
        drop_pending_updates: true,
      }),
      cache: 'no-store',
    });
    const data = (await response.json()) as { ok: boolean; description?: string };
    return data.ok ? { ok: true } : { ok: false, error: data.description ?? 'unknown error' };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/** Живая проверка токена через Bot API: getMe. Возвращает имя бота либо ошибку. */
export async function verifyBotToken(): Promise<{
  ok: boolean;
  botUsername?: string;
  botName?: string;
  botId?: number;
  error?: string;
}> {
  const token = botToken();
  if (!token) return { ok: false, error: 'TELEGRAM_BOT_TOKEN не задан' };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, { cache: 'no-store' });
    const data = (await response.json()) as {
      ok: boolean;
      description?: string;
      result?: { id: number; username?: string; first_name?: string };
    };
    if (!data.ok) {
      return {
        ok: false,
        error:
          data.description === 'Unauthorized'
            ? 'Unauthorized — токен недействителен (отозван или искажён при вставке)'
            : (data.description ?? 'неизвестная ошибка'),
      };
    }
    return {
      ok: true,
      botId: data.result?.id,
      botUsername: data.result?.username,
      botName: data.result?.first_name,
    };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Диагностика настроек Telegram без раскрытия секретов.
 * Помогает понять, почему Bot API отвечает 401 Unauthorized:
 * токен обрезан, содержит лишние символы или относится к другому боту.
 */
export function telegramDiagnostics() {
  const raw = process.env.TELEGRAM_BOT_TOKEN ?? '';
  const token = botToken();
  const ids = chatIds();

  // Токен Bot API: <числовой id бота>:<35 символов [A-Za-z0-9_-]>
  const shape = token ? /^\d+:[A-Za-z0-9_-]{35}$/.test(token) : false;
  const secretPart = token?.split(':')[1] ?? '';

  // Отпечаток (не сам токен): позволяет сверить значение на разных
  // окружениях, не раскрывая секрет. Совпал отпечаток — совпал токен.
  const fingerprint = token
    ? createHash('sha256').update(token).digest('hex').slice(0, 8)
    : null;

  return {
    tokenSet: Boolean(token),
    /** Длина как задано в окружении — покажет лишние пробелы или кавычки */
    rawLength: raw.length,
    lengthAfterTrim: token?.length ?? 0,
    hasSurroundingWhitespace: raw !== raw.trim(),
    hasQuotes: /^["']|["']$/.test(raw),
    formatValid: shape,
    /** Числовой id бота — не секрет, виден в ссылке на бота. Сверить с ожидаемым. */
    botId: token?.split(':')[0] ?? null,
    /** Длина секретной части: у корректного токена ровно 35 */
    secretPartLength: secretPart.length,
    /** Первые 8 символов sha256 от токена — для сверки окружений */
    fingerprint,
    chatIds: ids,
    chatIdCount: ids.length,
    configured: telegramConfigured(),
    verdict: !token
      ? 'Токен не задан'
      : !shape
        ? 'Формат неверен: ожидается «<id бота>:<35 символов>». Проверьте, не потерялись ли символы и нет ли пробелов/кавычек'
        : ids.length === 0
          ? 'Формат верный, но не задан TELEGRAM_CHAT_ID'
          : 'Формат верный. Ответ 401 значит, что токен отозван или недействителен — перевыпустите в @BotFather (/revoke)',
  };
}
