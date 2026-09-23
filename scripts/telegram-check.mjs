/**
 * Проверка Telegram-бота для сайта «Рассказы о Ромке и его бабушке».
 *
 * Запуск (токен и chat_id должны быть в .env):
 *
 *   node scripts/telegram-check.mjs          # проверить бота и показать чаты
 *   node scripts/telegram-check.mjs --send   # дополнительно отправить тестовое сообщение
 *
 * Скрипт ничего не меняет на сайте: он только обращается к Telegram Bot API.
 * Токен нигде не печатается — выводятся лишь его маска и имя бота.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

/** Простой парсер .env — без внешних зависимостей */
async function loadEnv(file) {
  const env = { ...process.env };
  try {
    const raw = await fs.readFile(file, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (value) env[key] = value;
    }
  } catch {
    /* файла может не быть — тогда работаем на process.env */
  }
  return env;
}

async function api(token, method, params) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(
    url,
    params
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          cache: 'no-store',
        }
      : { cache: 'no-store' },
  );
  return (await response.json());
}

const env = await loadEnv(path.join(root, '.env'));
const token = env.TELEGRAM_BOT_TOKEN?.trim();
const chatId = env.TELEGRAM_CHAT_ID?.trim();

console.log('── Проверка Telegram-бота ─────────────────────────────');

if (!token) {
  console.log('✗ TELEGRAM_BOT_TOKEN не задан в .env');
  console.log('  1. Создайте бота у @BotFather → /newbot');
  console.log('  2. Впишите токен в .env:  TELEGRAM_BOT_TOKEN=123456:AA...');
  process.exit(1);
}

console.log(`token: ...${token.slice(-6)} (маска, длина ${token.length})`);

const me = await api(token, 'getMe');
if (!me.ok) {
  console.log(`✗ Бот недоступен: ${me.description ?? 'неизвестная ошибка'}`);
  console.log('  Проверьте, что токен скопирован целиком и не отозван в @BotFather.');
  process.exit(1);
}

console.log(`✓ Бот: @${me.result.username} (${me.result.first_name}) id=${me.result.id}`);

// ── Поиск chat_id через необработанные обновления ─────────────
console.log('\n── Чаты ───────────────────────────────────────────────');
const updates = await api(token, 'getUpdates');
const found = new Map();

if (updates.ok) {
  for (const update of updates.result ?? []) {
    const chat = update.message?.chat ?? update.channel_post?.chat;
    if (chat) found.set(String(chat.id), chat);
  }
}

if (found.size === 0) {
  console.log('Активных чатов не найдено.');
  console.log('👉 Напишите боту любое сообщение в Telegram, затем запустите скрипт снова —');
  console.log('   он покажет ID чата. Либо добавьте бота в нужную группу и напишите там.');
} else {
  for (const [id, chat] of found) {
    const title = chat.title ?? [chat.first_name, chat.last_name].filter(Boolean).join(' ') ?? '';
    const type = chat.type === 'private' ? 'личный' : chat.type === 'group' || chat.type === 'supergroup' ? 'группа' : chat.type;
    console.log(`  ${id}  ${type}  ${title}`);
  }
}

// ── Текущий chat_id из .env ──────────────────────────────────
if (chatId) {
  const ids = chatId.split(',').map((s) => s.trim()).filter(Boolean);
  console.log(`\nTELEGRAM_CHAT_ID в .env: ${ids.join(', ')}`);

  for (const id of ids) {
    const chat = await api(token, 'getChat', { chat_id: id });
    if (chat.ok) {
      const title = chat.result.title ?? [chat.result.first_name, chat.result.last_name].filter(Boolean).join(' ');
      console.log(`  ✓ ${id} доступен: ${chat.result.type} ${title}`);
    } else {
      console.log(`  ✗ ${id}: ${chat.description ?? 'недоступен'}`);
      console.log('    Убедитесь, что бот добавлен в чат и получил права писать сообщения.');
    }
  }
} else {
  console.log('\n! TELEGRAM_CHAT_ID не задан в .env — уведомления отправляться не будут.');
  console.log('  Впишите ID из списка выше (несколько — через запятую).');
}

// ── Тестовое сообщение ───────────────────────────────────────
if (process.argv.includes('--send')) {
  console.log('\n── Тестовое сообщение ─────────────────────────────────');
  if (!chatId) {
    console.log('✗ Сначала задайте TELEGRAM_CHAT_ID.');
    process.exit(1);
  }
  for (const id of chatId.split(',').map((s) => s.trim()).filter(Boolean)) {
    const sent = await api(token, 'sendMessage', {
      chat_id: id,
      text: '✅ Проверка связи: сайт «Рассказы о Ромке и его бабушке» подключён к этому чату.',
      disable_web_page_preview: true,
    });
    console.log(sent.ok ? `✓ отправлено в ${id}` : `✗ ${id}: ${sent.description}`);
  }
}

console.log('\nГотово. Токен в вывод не печатался.');
