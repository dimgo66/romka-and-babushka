import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';

import './globals.css';
import { HTML_LANG, LOCALE_COOKIE, OG_LOCALE, normalizeLocale } from '@/lib/i18n';
import { getDict } from '@/lib/dictionaries';
import { SITE, siteUrl } from '@/lib/config';
import { YandexMetrika } from '@/components/YandexMetrika';

export async function generateMetadata(): Promise<Metadata> {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  const dict = getDict(locale);
  const base = siteUrl();

  return {
    metadataBase: new URL(base),
    title: {
      default: dict.meta.title,
      template: '%s · Рассказы о Ромке и его бабушке',
    },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    applicationName: 'Stories About Romka and His Grandmother',
    authors: [{ name: 'София Агачер / Sofia Agacher', url: SITE.authorSite }],
    alternates: {
      canonical: '/',
      languages: { ru: '/', en: '/' },
    },
    openGraph: {
      type: 'website',
      url: base,
      siteName: 'Stories About Romka and His Grandmother',
      locale: OG_LOCALE[locale],
      title: dict.meta.title,
      description: dict.meta.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.title,
      description: dict.meta.description,
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/icon.svg' }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#E4763C',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);

  return (
    <html lang={HTML_LANG[locale]}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;600;700&display=swap"
        />
      </head>
      <body className="paper-texture min-h-screen antialiased">
        {children}
        <YandexMetrika />
      </body>
    </html>
  );
}
