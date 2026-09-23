import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { StoriesGrid } from '@/components/StoriesGrid';
import { LeadForm } from '@/components/LeadForm';
import { Footer } from '@/components/Footer';

import { LOCALE_COOKIE, normalizeLocale } from '@/lib/i18n';
import { getDict } from '@/lib/dictionaries';
import { SITE } from '@/lib/config';
import { STORIES, PLATFORMS, embedUrl, platformName, storyBlurb, storyTitle, watchUrl } from '@/lib/stories';

export async function generateMetadata(): Promise<Metadata> {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  const dict = getDict(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  const dict = getDict(locale);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  // Микроразметка Schema.org: серия книг и каждая новелла с аудиоверсией
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BookSeries',
        '@id': `${base}/#series`,
        name:
          locale === 'en'
            ? 'The Adventures of Romka and his Grandmother'
            : 'Рассказы о Ромке и его бабушке',
        alternateName:
          locale === 'en'
            ? 'Рассказы о Ромке и его бабушке'
            : 'The Adventures of Romka and his Grandmother',
        numberOfItems: STORIES.length,
        inLanguage: ['ru', 'en'],
        author: { '@type': 'Person', name: 'София Агачер', alternateName: 'Sofia Agacher', url: SITE.authorSite },
        url: base,
        publisher: { '@type': 'Organization', name: 'Sofia Agacher', url: SITE.authorSite },
      },
      ...STORIES.map((story) => ({
        '@type': 'Book',
        '@id': `${base}/#story-${story.order}`,
        position: story.order,
        name: storyTitle(story, locale),
        alternateName: locale === 'en' ? story.titleRu : story.titleEn,
        description: storyBlurb(story, locale),
        inLanguage: ['ru', 'en'],
        isPartOf: { '@id': `${base}/#series` },
        author: { '@type': 'Person', name: 'София Агачер', alternateName: 'Sofia Agacher' },
        numberOfPages: '80-100',
        bookFormat: 'https://schema.org/Paperback',
        // Аудиоверсия одна: записи на русском языке, размещены на двух площадках
        audio: PLATFORMS.map((platform) => ({
          '@type': 'AudioObject',
          name: `${storyTitle(story, locale)} — ${platformName(platform)}`,
          contentUrl: watchUrl(story, platform),
          embedUrl: embedUrl(story, platform),
          inLanguage: 'ru',
        })),
      })),
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: base,
        name: dict.meta.title,
        inLanguage: locale,
        publisher: { '@type': 'Organization', name: 'Sofia Agacher', url: SITE.authorSite },
      },
    ],
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-orange focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {dict.nav.skipToContent}
      </a>

      <Header locale={locale} dict={dict} />

      <main id="main">
        <Hero locale={locale} dict={dict} />
        <About locale={locale} dict={dict} />
        <StoriesGrid locale={locale} dict={dict} />
        <LeadForm locale={locale} dict={dict} />
      </main>

      <Footer locale={locale} dict={dict} />

      <script
        type="application/ld+json"
        // JSON-LD не содержит данных пользователя — только статический контент
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
