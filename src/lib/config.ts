/** Общие настройки сайта / Site-wide constants */

export const SITE = {
  authorSite: 'https://agacher.com/',
  contactEmail: 'agacher.bragbook@gmail.com',
  seriesSize: 7,
} as const;

/** Иллюстрации страниц фрагмента в виде широких разворотов (1615×808) */
export const PAGE_ILLUSTRATIONS = [
  '/files/bilingual-golden-bean-fragment_Страница_1.jpg',
  '/files/bilingual-golden-bean-fragment_Страница_2.jpg',
  '/files/bilingual-golden-bean-fragment_Страница_3.jpg',
] as const;

/**
 * Пиксельный размер файлов-иллюстраций (все три одинаковые).
 * Нужен лайтбоксу, чтобы считать масштаб: 1:1 — это полный размер файла.
 */
export const PAGE_ILLUSTRATION_SIZE = { width: 1615, height: 808 } as const;

/**
 * Публичный адрес сайта (canonical, Open Graph, sitemap, robots, вебхук).
 *
 * Читается только на сервере, поэтому префикс NEXT_PUBLIC_ не нужен:
 * он бы встроил значение в клиентский бандл без всякой пользы.
 * Старое имя поддерживается, чтобы уже заданные переменные не сломались.
 */
export function siteUrl(): string {
  const raw = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

/** То же, но без запасного значения — для случаев, где нужен именно заданный адрес */
export function siteUrlOrNull(): string | null {
  const raw = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  return raw ? raw.replace(/\/$/, '') : null;
}

export const LEAD_STATUSES = [
  'new',
  'in_progress',
  'contacted',
  'confirmed',
  'cancelled',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}

/** Простая, но достаточно строгая проверка email */
export const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const LIMITS = {
  name: 120,
  email: 254,
  comment: 2000,
  notes: 4000,
} as const;
