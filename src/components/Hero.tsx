'use client';

import Image from 'next/image';

import type { Dict } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { METRIKA_GOALS, scrollToSection } from '@/lib/metrika';

type Props = {
  locale: Locale;
  dict: Dict;
};

export function Hero({ locale, dict }: Props) {
  const secondaryTitle = locale === 'en' ? dict.hero.titleRu : dict.hero.titleEn;

  return (
    <section id="hero" tabIndex={-1} className="relative overflow-hidden">
      <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:py-20">
        <div>
          <p className="eyebrow">{dict.hero.eyebrow}</p>
          <h1 className="heading-xl mt-3">
            <span className="block">{locale === 'en' ? dict.hero.titleEn : dict.hero.titleRu}</span>
            <span
              lang={locale === 'en' ? 'ru' : 'en'}
              className="mt-2 block font-display text-base font-semibold text-brand-green-dark sm:text-lg"
            >
              {secondaryTitle}
            </span>
          </h1>

          <p className="prose-warm mt-5 max-w-2xl">{dict.hero.lead}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {dict.hero.facts.map((fact) => (
              <li key={fact} className="chip">
                {fact}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#order"
              className="btn-primary"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection('order', METRIKA_GOALS.ctaOrder);
              }}
            >
              {dict.hero.ctaOrder}
            </a>
            <a
              href="#stories"
              className="btn-secondary"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection('stories', METRIKA_GOALS.ctaListen);
              }}
            >
              {dict.hero.ctaListen}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl2 border border-brand-beige-dark bg-white/70 p-2 shadow-card sm:p-3">
            <Image
              src="/babushka.jpg"
              alt={dict.hero.illustrationAlt}
              width={1132}
              height={1027}
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="h-auto w-full rounded-xl object-cover"
            />
          </div>
          <div className="pointer-events-none absolute -bottom-6 -left-4 hidden h-20 w-20 animate-float-slow rounded-full bg-brand-orange-soft/40 blur-2xl sm:block" />
        </div>
      </div>
    </section>
  );
}

