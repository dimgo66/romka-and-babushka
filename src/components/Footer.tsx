import type { Dict } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { SITE } from '@/lib/config';

type Props = {
  locale: Locale;
  dict: Dict;
};

export function Footer({ locale, dict }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-brand-beige-dark bg-brand-beige/80">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <p className="font-display text-lg font-extrabold text-brand-ink">
            {locale === 'en' ? 'Stories About Romka and His Grandmother' : 'Рассказы о Ромке и его бабушке'}
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-green-dark" lang={locale === 'en' ? 'ru' : 'en'}>
            {locale === 'en' ? 'Рассказы о Ромке и его бабушке' : 'Stories About Romka and His Grandmother'}
          </p>
          <p className="prose-warm mt-3 max-w-md text-sm">{dict.footer.tagline}</p>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-brand-ink">
            {dict.footer.authorHeading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-ink-soft">{dict.footer.authorText}</p>
          <a
            href={SITE.authorSite}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline mt-3 inline-block text-sm"
          >
            {dict.footer.authorLink} ↗
          </a>

          <h2 className="mt-5 font-display text-sm font-bold uppercase tracking-wide text-brand-ink">
            {dict.footer.playsHeading}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={SITE.playsBookUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                {dict.footer.playsBook} ↗
              </a>
            </li>
            <li>
              <a href={SITE.festivalUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                {dict.footer.festival} ↗
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-brand-ink">
            {dict.footer.contactsHeading}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-brand-ink-soft">
            <li>
              {dict.footer.emailLabel}:{' '}
              <a href={`mailto:${SITE.contactEmail}`} className="link-underline">
                {SITE.contactEmail}
              </a>
            </li>
          </ul>

          <h2 className="mt-5 font-display text-sm font-bold uppercase tracking-wide text-brand-ink">
            {dict.footer.legalHeading}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="/privacy" className="link-underline">
                {dict.footer.privacy}
              </a>
            </li>
            <li>
              <a href="/consent" className="link-underline">
                {dict.footer.consent}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-beige-dark/70">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-brand-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} София Агачер / Sofia Agacher. {dict.footer.rights}
          </p>
          <p>{dict.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
