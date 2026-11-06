import type { Dict } from '@/lib/dictionaries';
import { SITE } from '@/lib/config';
import { PageIllustrations } from '@/components/PageIllustrations';

type Props = {
  dict: Dict;
};

export function About({ dict }: Props) {
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

        {/* Развороты книги — во всю ширину страницы, вне двухколоночной сетки */}
        <PageIllustrations dict={dict} />

        {/*
          Конкурс рисунка. На разворотах выше художник оставил пустой белый
          квадрат — это место для рисунка читателя, поэтому блок идёт сразу
          под слайдером: видно, о каком квадрате речь.
        */}
        <div className="mt-8 rounded-xl2 border border-brand-orange/50 bg-white/85 p-5 shadow-soft sm:p-7">
          <h3 className="font-display text-lg font-bold text-brand-ink sm:text-xl">{dict.about.contest.heading}</h3>

          <p className="prose-warm mt-3">{dict.about.contest.lead}</p>

          <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-brand-ink-soft">{dict.about.contest.emailLabel}:</span>
            <a href={`mailto:${SITE.contactEmail}`} className="link-underline break-all text-base">
              {SITE.contactEmail}
            </a>
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[dict.about.contest.schedule, dict.about.contest.prize].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-brand-beige-dark bg-brand-beige/70 px-4 py-3 text-sm leading-relaxed text-brand-ink-soft"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
