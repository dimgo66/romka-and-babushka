'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { LOCALE_COOKIE, LOCALES, LOCALE_LABEL, type Locale } from '@/lib/i18n';
import { METRIKA_GOALS, reachGoal } from '@/lib/metrika';

type Props = {
  locale: Locale;
  label: string;
};

/**
 * Переключатель языка «RU | EN» в правом верхнем углу.
 * Язык хранится в cookie, поэтому серверные компоненты сразу
 * отдают нужные тексты и ссылки на видео (VK для RU, YouTube для EN).
 */
export function LanguageSwitcher({ locale, label }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Locale>(locale);

  function switchTo(next: Locale) {
    if (next === optimistic) return;
    setOptimistic(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    reachGoal(METRIKA_GOALS.languageSwitch, { to: next });
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full border border-brand-sand bg-white/80 p-0.5 shadow-sm"
    >
      {LOCALES.map((code) => {
        const active = code === optimistic;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            aria-pressed={active}
            lang={code}
            className={[
              'min-w-[2.75rem] rounded-full px-3 py-1.5 text-xs font-bold tracking-wide transition',
              active
                ? 'bg-brand-green text-white shadow-sm'
                : 'text-brand-ink-soft hover:text-brand-orange-dark',
              pending && active ? 'opacity-90' : '',
            ].join(' ')}
          >
            {LOCALE_LABEL[code]}
          </button>
        );
      })}
    </div>
  );
}
