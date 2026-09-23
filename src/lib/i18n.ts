export const LOCALES = ['ru', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALE_COOKIE = 'romka_locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export const LOCALE_LABEL: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
};

/** html lang attribute */
export const HTML_LANG: Record<Locale, string> = {
  ru: 'ru',
  en: 'en',
};

export const OG_LOCALE: Record<Locale, string> = {
  ru: 'ru_RU',
  en: 'en_US',
};
