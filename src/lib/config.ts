/** Общие настройки сайта / Site-wide constants */

export const SITE = {
  authorSite: 'https://sofia-agacher.vercel.app/',
  contactEmail: 'agacher.bragbook@gmail.com',
  seriesSize: 7,
  /** Сборник пьес Софии Агачер «Живая книга» на платформе Ridero */
  playsBookUrl: 'https://ridero.ru/books/sbornik_pes_zhivaya_kniga/',
  /** Сайт ежегодного фестиваля «Живая книга» по этим пьесам */
  festivalUrl: 'https://festival-zhivaya-kniga.vercel.app/',
} as const;

/**
 * Изображения книги: обложка и развороты (стр. 2–3, 4–5, 6–7, 8–9, 10–11,
 * 12–13, 22–23 и 32–33 вёрстки «Билингва_Золотой БОБ-3_30.10.pdf»).
 *
 * Обложка в макете квадратная (1615×1615), развороты — 1615×808, поэтому
 * размеры хранятся у каждого слайда: по ним лайтбокс считает масштаб и
 * ограничивает перетаскивание. На разворотах 4–5, 22–23 и 32–33 художник
 * оставил пустой белый квадрат — место для рисунка читателя (см. блок
 * конкурса в секции «О цикле»).
 *
 * Имена файлов — только ASCII. Лайтбокс грузит исходник напрямую, минуя
 * оптимизатор Next, а не-ASCII в сыром `src` по пути от браузера до Vercel
 * теряется на части мобильных браузеров и прокси (перекодирование пути),
 * поэтому на телефоне разворот не загружался вовсе.
 */
export type PageIllustration = {
  src: string;
  width: number;
  height: number;
  /** Обложка подписывается иначе, чем разворот */
  kind: 'cover' | 'spread';
};

export const PAGE_ILLUSTRATIONS: readonly PageIllustration[] = [
  { src: '/files/bilingual-p01.jpg', width: 1615, height: 1615, kind: 'cover' },
  { src: '/files/bilingual-p02-03.jpg', width: 1615, height: 808, kind: 'spread' },
  { src: '/files/bilingual-p04-05.jpg', width: 1615, height: 808, kind: 'spread' },
  { src: '/files/bilingual-p06-07.jpg', width: 1615, height: 808, kind: 'spread' },
  { src: '/files/bilingual-p08-09.jpg', width: 1615, height: 808, kind: 'spread' },
  { src: '/files/bilingual-p10-11.jpg', width: 1615, height: 808, kind: 'spread' },
  { src: '/files/bilingual-p12-13.jpg', width: 1615, height: 808, kind: 'spread' },
  { src: '/files/bilingual-p22-23.jpg', width: 1615, height: 808, kind: 'spread' },
  { src: '/files/bilingual-p32-33.jpg', width: 1615, height: 808, kind: 'spread' },
] as const;

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
