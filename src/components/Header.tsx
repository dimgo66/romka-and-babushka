'use client';

import { LanguageSwitcher } from './LanguageSwitcher';
import type { Dict } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { METRIKA_GOALS, scrollToSection } from '@/lib/metrika';

type Props = {
  locale: Locale;
  dict: Dict;
};

const NAV_ITEMS = [
  { id: 'about', key: 'about' as const },
  { id: 'stories', key: 'listen' as const },
  { id: 'order', key: 'order' as const },
];

export function Header({ locale, dict }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-beige-dark/70 bg-brand-beige/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a
          href="#hero"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection('hero');
          }}
          className="flex items-center gap-2.5"
        >
          <CatMark className="h-8 w-8 shrink-0" />
          <span className="font-display text-xs font-extrabold leading-tight text-brand-ink sm:text-sm">
            {locale === 'en'
              ? 'The Adventures of Romka and his Grandmother'
              : 'Рассказы о Ромке и его бабушке'}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(
                  item.id,
                  item.id === 'order' ? METRIKA_GOALS.ctaOrder : undefined,
                );
              }}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-brand-ink-soft transition hover:bg-white/70 hover:text-brand-orange-dark"
            >
              {dict.nav[item.key]}
            </a>
          ))}
        </nav>

        <LanguageSwitcher locale={locale} label={dict.nav.languageLabel} />
      </div>

      <nav
        aria-label="Primary mobile"
        className="container-page flex items-center gap-1 overflow-x-auto pb-2 md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToSection(item.id, item.id === 'order' ? METRIKA_GOALS.ctaOrder : undefined);
            }}
            className="whitespace-nowrap rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-brand-ink-soft"
          >
            {dict.nav[item.key]}
          </a>
        ))}
      </nav>
    </header>
  );
}

/** Небольшой акварельный силуэт кота — логотип-заглушка без внешних файлов */
export function CatMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="36" rx="19" ry="17" fill="#3B2E25" opacity="0.92" />
      <path d="M15 22 L18 8 L30 18 Z" fill="#3B2E25" opacity="0.92" />
      <path d="M49 22 L46 8 L34 18 Z" fill="#3B2E25" opacity="0.92" />
      <circle cx="25" cy="33" r="3.4" fill="#A8C49B" />
      <circle cx="39" cy="33" r="3.4" fill="#A8C49B" />
      <circle cx="25" cy="33" r="1.5" fill="#3B2E25" />
      <circle cx="39" cy="33" r="1.5" fill="#3B2E25" />
      <path d="M32 41 l-4 3 h8 Z" fill="#F6A96B" />
      <path d="M44 52 q10 -4 6 -14" stroke="#3B2E25" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
