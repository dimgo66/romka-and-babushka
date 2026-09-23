'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Dict } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import {
  PLATFORMS,
  STORIES,
  embedUrl,
  platformName,
  storyBlurb,
  storyTitle,
  watchUrl,
  type Platform,
  type Story,
} from '@/lib/stories';
import { METRIKA_GOALS, reachGoal } from '@/lib/metrika';

const PLATFORM_STORAGE_KEY = 'romka_platform';

type Props = {
  locale: Locale;
  dict: Dict;
  /** Рассказы, отмеченные в форме заявки */
  selected?: number[];
};

export function StoriesGrid({ locale, dict, selected = [] }: Props) {
  /**
   * Выбранная платформа — общая для всех карточек, запоминается между визитами.
   * На обеих платформах записи звучат на русском языке, поэтому выбор площадки
   * не связан с языком интерфейса сайта.
   */
  const [platform, setPlatform] = useState<Platform>('vk');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PLATFORM_STORAGE_KEY);
      if (saved === 'vk' || saved === 'youtube') setPlatform(saved);
    } catch {
      /* localStorage может быть недоступен — остаётся значение по умолчанию */
    }
  }, []);

  const choosePlatform = useCallback(
    (next: Platform) => {
      setPlatform(next);
      try {
        window.localStorage.setItem(PLATFORM_STORAGE_KEY, next);
      } catch {
        /* игнорируем */
      }
      reachGoal(METRIKA_GOALS.platformSwitch, { platform: next, locale });
    },
    [locale],
  );

  return (
    <section id="stories" tabIndex={-1} className="section">
      <div className="container-page">
        <p className="eyebrow">{dict.nav.listen}</p>
        <h2 className="heading-lg mt-3">{dict.stories.heading}</h2>
        <p className="prose-warm mt-3 max-w-3xl">{dict.stories.subheading}</p>

        <PlatformSwitch
          platform={platform}
          onChange={choosePlatform}
          label={dict.stories.platformLabel}
          note={dict.stories.platformNote}
        />

        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((story) => (
            <StoryCard
              key={story.order}
              story={story}
              locale={locale}
              dict={dict}
              platform={platform}
              selected={selected.includes(story.order)}
            />
          ))}
        </ul>

        <p className="mt-6 text-xs text-brand-ink-soft">{dict.stories.hint}</p>
      </div>
    </section>
  );
}

/** Переключатель «VK Video | YouTube» над сеткой рассказов */
function PlatformSwitch({
  platform,
  onChange,
  label,
  note,
}: {
  platform: Platform;
  onChange: (next: Platform) => void;
  label: string;
  note: string;
}) {
  return (
    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div
        role="group"
        aria-label={label}
        className="inline-flex items-center rounded-full border border-brand-sand bg-white/80 p-1 shadow-sm"
      >
        {PLATFORMS.map((code) => {
          const active = code === platform;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onChange(code)}
              aria-pressed={active}
              className={[
                'rounded-full px-4 py-2 text-sm font-bold transition',
                active
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-brand-ink-soft hover:text-brand-orange-dark',
              ].join(' ')}
            >
              {platformName(code)}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-brand-ink-soft">{note}</p>
    </div>
  );
}

type CardProps = {
  story: Story;
  locale: Locale;
  dict: Dict;
  platform: Platform;
  selected: boolean;
};

function StoryCard({ story, locale, dict, platform, selected }: CardProps) {
  const [playing, setPlaying] = useState(false);
  const title = storyTitle(story, locale);
  const platformDisplay = platformName(platform);
  const external = watchUrl(story, platform);

  function openPlayer() {
    setPlaying(true);
    reachGoal(METRIKA_GOALS.playerOpen, { story: story.order, locale, platform });
  }

  function openExternal() {
    reachGoal(METRIKA_GOALS.videoClick, { story: story.order, locale, platform, url: external });
  }

  return (
    <li
      className={[
        'card flex flex-col',
        selected ? 'ring-2 ring-brand-green ring-offset-2 ring-offset-brand-beige' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 font-display text-sm font-extrabold text-brand-orange-dark">
          {story.order}
        </span>
        <span className="chip">{platformDisplay}</span>
      </div>

      <h3 className="mt-3 font-display text-base font-bold leading-snug text-brand-ink">{title}</h3>
      <p
        lang={locale === 'en' ? 'ru' : 'en'}
        className="mt-1 text-xs font-semibold text-brand-green-dark"
      >
        {locale === 'en' ? story.titleRu : story.titleEn}
      </p>
      <p className="mt-2.5 text-sm leading-relaxed text-brand-ink-soft">{storyBlurb(story, locale)}</p>

      <div className="mt-4 overflow-hidden rounded-xl border border-brand-beige-dark bg-brand-ink/90">
        {playing ? (
          <div className="relative aspect-video">
            <iframe
              src={embedUrl(story, platform)}
              title={`${dict.stories.embedTitle}: ${title} — ${platformDisplay}`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={openPlayer}
            className="group relative flex aspect-video w-full items-center justify-center bg-gradient-to-br from-brand-ink to-brand-green-dark"
          >
            <span className="grid-paper absolute inset-0 opacity-25" aria-hidden="true" />
            <span className="relative flex flex-col items-center gap-2 text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-lg shadow-soft transition group-hover:scale-105">
                ▶
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest">
                {dict.stories.playLabel}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 pt-1">
        <a
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          onClick={openExternal}
          className="link-underline text-sm"
        >
          {dict.stories.watchOn} {platformDisplay}
        </a>
        {playing && (
          <button
            type="button"
            onClick={() => setPlaying(false)}
            className="text-xs font-semibold text-brand-ink-soft underline underline-offset-2 hover:text-brand-orange-dark"
          >
            {dict.stories.collapseLabel}
          </button>
        )}
      </div>
    </li>
  );
}
