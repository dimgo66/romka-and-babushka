'use client';

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
          <div className="grid-paper rounded-xl2 border border-brand-beige-dark bg-white/70 p-4 shadow-card">
            <WatercolorCat alt={dict.hero.illustrationAlt} />
          </div>
          <div className="pointer-events-none absolute -bottom-6 -left-4 hidden h-20 w-20 animate-float-slow rounded-full bg-brand-orange-soft/40 blur-2xl sm:block" />
        </div>
      </div>
    </section>
  );
}

/** Акварельная иллюстрация-заглушка (SVG, без внешних файлов) */
function WatercolorCat({ alt }: { alt: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label={alt}
      className="h-auto w-full rounded-xl"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDF6E9" />
          <stop offset="100%" stopColor="#F2E2C8" />
        </linearGradient>
        <linearGradient id="catFur" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4A3B31" />
          <stop offset="100%" stopColor="#2E241D" />
        </linearGradient>
        <radialGradient id="wash" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#A8C49B" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#A8C49B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="480" height="360" fill="url(#sky)" />
      <circle cx="110" cy="90" r="120" fill="url(#wash)" />
      <circle cx="390" cy="300" r="130" fill="#F6A96B" opacity="0.16" />

      {/* Бабушка */}
      <ellipse cx="176" cy="262" rx="86" ry="72" fill="#5F8A5A" opacity="0.9" />
      <circle cx="176" cy="170" r="44" fill="#F4D6BC" />
      <path d="M132 168 q44 -66 88 0 q-44 -26 -88 0" fill="#E7D3B3" />
      <circle cx="162" cy="172" r="4.5" fill="#3B2E25" />
      <circle cx="192" cy="172" r="4.5" fill="#3B2E25" />
      <path d="M164 190 q12 10 24 0" stroke="#C85C27" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="158" cy="186" rx="9" ry="6" fill="#F6A96B" opacity="0.35" />
      <ellipse cx="198" cy="186" rx="9" ry="6" fill="#F6A96B" opacity="0.35" />

      {/* Ромка */}
      <ellipse cx="326" cy="272" rx="66" ry="54" fill="url(#catFur)" />
      <circle cx="322" cy="206" r="42" fill="url(#catFur)" />
      <path d="M288 182 L292 148 L318 172 Z" fill="#2E241D" />
      <path d="M356 182 L352 148 L326 172 Z" fill="#2E241D" />
      <circle cx="308" cy="204" r="7.5" fill="#A8C49B" />
      <circle cx="338" cy="204" r="7.5" fill="#A8C49B" />
      <circle cx="308" cy="204" r="3.2" fill="#241C16" />
      <circle cx="338" cy="204" r="3.2" fill="#241C16" />
      <path d="M322 220 l-6 5 h12 Z" fill="#F6A96B" />
      <path d="M322 225 v8" stroke="#F6A96B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M322 233 q-12 10 -20 0 M322 233 q12 10 20 0" stroke="#F6A96B" strokeWidth="2.5" fill="none" />
      <path
        d="M392 300 q34 -18 18 -58"
        stroke="#2E241D"
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />

      {/* Тетрадная клетка поверх — отсылка к формату книги */}
      <g opacity="0.3">
        {Array.from({ length: 16 }).map((_, index) => (
          <line
            key={`v${index}`}
            x1={index * 32}
            y1="0"
            x2={index * 32}
            y2="360"
            stroke="#5F8A5A"
            strokeWidth="0.6"
          />
        ))}
        {Array.from({ length: 12 }).map((_, index) => (
          <line
            key={`h${index}`}
            x1="0"
            y1={index * 32}
            x2="480"
            y2={index * 32}
            stroke="#5F8A5A"
            strokeWidth="0.6"
          />
        ))}
      </g>
    </svg>
  );
}
