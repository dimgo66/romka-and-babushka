import type { Locale } from './i18n';

export type Story = {
  /** Порядковый номер в цикле */
  order: number;
  /** Название на русском */
  titleRu: string;
  /** Название на английском */
  titleEn: string;
  /** Ссылка на VK Video (русская версия) */
  vk: string;
  /** Ссылка на YouTube (английская версия) */
  youtube: string;
  /** Короткое описание для SEO / микроразметки */
  blurbRu: string;
  blurbEn: string;
};

/** 7 новелл цикла «Рассказы о Ромке и его бабушке» */
export const STORIES: Story[] = [
  {
    order: 1,
    titleRu: 'Зеркальный боб желаний, или Ромка из племени чёрных котов',
    titleEn: 'The Mirror Bean of Wishes, or Romka from the Black Cat Tribe',
    vk: 'https://vkvideo.ru/video-211448735_456239205',
    youtube: 'https://youtu.be/w49AiBvo1Ik',
    blurbRu: 'История о волшебном бобе, который исполняет желания, и о Ромке из племени чёрных котов.',
    blurbEn: 'A tale of a magic bean that grants wishes, and of Romka from the Black Cat Tribe.',
  },
  {
    order: 2,
    titleRu: 'Грустный телевизор',
    titleEn: 'The Sad TV',
    vk: 'https://vkvideo.ru/video-211448735_456239210',
    youtube: 'https://youtu.be/ygxw0p6GIOk',
    blurbRu: 'Что происходит, когда телевизор перестаёт быть главным в доме — и кто его пожалеет.',
    blurbEn: 'What happens when the television is no longer the centre of the home — and who feels sorry for it.',
  },
  {
    order: 3,
    titleRu: 'Каникулы в Пуэрто-Вальярта',
    titleEn: 'Romka’s Puerto Vallarta Vacation',
    vk: 'https://vkvideo.ru/video-211448735_456239208',
    youtube: 'https://youtu.be/1OeT3gi04cQ',
    blurbRu: 'Семейные каникулы у океана: новые друзья, жара и маленькие открытия.',
    blurbEn: 'A family holiday by the ocean: new friends, heat and small discoveries.',
  },
  {
    order: 4,
    titleRu: 'Кинозатеи',
    titleEn: 'Film Fun',
    vk: 'https://vkvideo.ru/video-211448735_456239207',
    youtube: 'https://youtu.be/lhja1LNDuWc',
    blurbRu: 'Домашняя киностудия, где бабушка — режиссёр, а Ромка — главная звезда.',
    blurbEn: 'A home film studio where Grandmother directs and Romka is the star.',
  },
  {
    order: 5,
    titleRu: 'Часы Тота',
    titleEn: 'The Clock of Thoth',
    vk: 'https://vkvideo.ru/video-211448735_456239209',
    youtube: 'https://youtu.be/vEHMWIy_B8k',
    blurbRu: 'Путешествие во времени начинается с обычных часов на бабушкиной стене.',
    blurbEn: 'A journey through time begins with an ordinary clock on Grandmother’s wall.',
  },
  {
    order: 6,
    titleRu: 'Счастливая встреча',
    titleEn: 'Serendipity',
    vk: 'https://vkvideo.ru/video-211448735_456239206',
    youtube: 'https://youtu.be/v76tjSJ3lxo',
    blurbRu: 'О том, как случайная встреча становится самой счастливой в жизни.',
    blurbEn: 'How a chance encounter turns into the happiest meeting of a lifetime.',
  },
  {
    order: 7,
    titleRu: 'Картина для губернатора',
    titleEn: 'A Painting for the Governor',
    vk: 'https://vkvideo.ru/video-211448735_456239203',
    youtube: 'https://youtu.be/k4CgmHTVa5w',
    blurbRu: 'Ромка, бабушка и картина, которая должна понравиться самому губернатору.',
    blurbEn: 'Romka, Grandmother, and a painting that simply must please the Governor himself.',
  },
];

export function storyTitle(story: Story, locale: Locale): string {
  return locale === 'en' ? story.titleEn : story.titleRu;
}

export function storyBlurb(story: Story, locale: Locale): string {
  return locale === 'en' ? story.blurbEn : story.blurbRu;
}

/**
 * Платформа просмотра.
 *
 * ВАЖНО: на обеих платформах записи звучат на русском языке — это одна и та же
 * аудиоверсия в исполнении автора. VK Video и YouTube предлагаются как
 * равнозначный выбор: кому-то удобнее смотреть на VK, кому-то на YouTube.
 * Поэтому платформа НЕ зависит от языка интерфейса сайта.
 */
export type Platform = 'vk' | 'youtube';

export const PLATFORMS: Platform[] = ['vk', 'youtube'];

export function isPlatform(value: unknown): value is Platform {
  return value === 'vk' || value === 'youtube';
}

/** Ссылка для встраивания во фрейм на выбранной платформе */
export function embedUrl(story: Story, platform: Platform): string {
  return platform === 'youtube' ? youtubeEmbed(story.youtube) : vkEmbed(story.vk);
}

/** Внешняя ссылка на выбранную платформу */
export function watchUrl(story: Story, platform: Platform): string {
  return platform === 'youtube' ? story.youtube : story.vk;
}

export function platformName(platform: Platform): string {
  return platform === 'youtube' ? 'YouTube' : 'VK Video';
}

/** Отображаемое имя платформы на языке интерфейса */
export function platformLabel(platform: Platform, locale: Locale): string {
  if (platform === 'vk') return 'VK Video';
  return 'YouTube';
}

/** https://youtu.be/ID | https://www.youtube.com/watch?v=ID → https://www.youtube.com/embed/ID */
export function youtubeEmbed(url: string): string {
  const id = youTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : url;
}

export function youTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([\w-]{6,})/,
    /[?&]v=([\w-]{6,})/,
    /youtube\.com\/embed\/([\w-]{6,})/,
    /youtube\.com\/shorts\/([\w-]{6,})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/** https://vkvideo.ru/video-211448735_456239205 → https://vkvideo.ru/video_ext.php?oid=-211448735&id=456239205 */
export function vkEmbed(url: string): string {
  const m = url.match(/video(-?\d+)_(\d+)/);
  if (!m) return url;
  const [, oid, id] = m;
  return `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${id}&hd=2&autoplay=0`;
}
