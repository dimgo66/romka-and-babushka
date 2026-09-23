import type { Dict } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { SITE } from '@/lib/config';

type Props = {
  locale: Locale;
  dict: Dict;
};

export function About({ locale, dict }: Props) {
  return (
    <section id="about" tabIndex={-1} className="section">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow">{dict.about.heading}</p>
            <h2 className="heading-lg mt-3">{dict.about.seriesTitle}</h2>

            <blockquote className="mt-6 rounded-xl2 border-l-4 border-brand-orange bg-white/80 p-5 text-base leading-relaxed text-brand-ink shadow-soft sm:p-6 sm:text-lg">
              {dict.about.body}
            </blockquote>

            <p className="prose-warm mt-5">{dict.about.note}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a href={SITE.authorSite} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                {dict.about.authorLinkLabel}
                <span aria-hidden="true">↗</span>
              </a>
              <a
                href={SITE.pdfFragment}
                download
                className="link-underline text-sm"
                lang={locale === 'en' ? 'ru' : undefined}
              >
                {dict.about.fragmentLinkLabel}
              </a>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {dict.about.seriesPoints.map((point) => (
              <li key={point.title} className="card">
                <h3 className="font-display text-base font-bold text-brand-ink">{point.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-ink-soft">{point.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
