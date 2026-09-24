import type { Dict } from '@/lib/dictionaries';
import { SITE } from '@/lib/config';

type Props = {
  dict: Dict;
};

/**
 * Пьесы Софии Агачер по мотивам цикла и ежегодный фестиваль «Живая книга».
 * Серверный компонент: только ссылки, без клиентского JS.
 */
export function Plays({ dict }: Props) {
  return (
    <section id="plays" tabIndex={-1} className="section border-t border-brand-beige-dark/60">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow">{dict.plays.heading}</p>
            <h2 className="heading-lg mt-3">{dict.plays.title}</h2>
            <p className="prose-warm mt-5">{dict.plays.body}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={SITE.playsBookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                {dict.plays.playsBookLabel}
                <span aria-hidden="true">↗</span>
              </a>
              <a href={SITE.festivalUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                {dict.plays.festivalLabel}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {dict.plays.points.map((point) => (
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
