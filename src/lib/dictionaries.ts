import type { Locale } from './i18n';

export type Dict = {
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  nav: {
    about: string;
    listen: string;
    order: string;
    languageLabel: string;
    skipToContent: string;
  };
  hero: {
    eyebrow: string;
    titleRu: string;
    titleEn: string;
    lead: string;
    facts: string[];
    ctaOrder: string;
    ctaListen: string;
    illustrationAlt: string;
  };
  about: {
    heading: string;
    body: string;
    note: string;
    authorLinkLabel: string;
    seriesTitle: string;
    seriesPoints: { title: string; text: string }[];
    fragmentLinkLabel: string;
  };
  stories: {
    heading: string;
    subheading: string;
    platformLabel: string;
    platformNote: string;
    storyLabel: string;
    watchOn: string;
    embedTitle: string;
    playLabel: string;
    collapseLabel: string;
    openExternal: string;
    hint: string;
  };
  form: {
    heading: string;
    subheading: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    comment: string;
    commentPlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    successAgain: string;
    errors: {
      nameRequired: string;
      nameTooLong: string;
      emailRequired: string;
      emailInvalid: string;
      commentTooLong: string;
      consentRequired: string;
      generic: string;
      network: string;
      rateLimited: string;
    };
    requiredHint: string;
    selectedStories: string;
    clearSelection: string;
    consentPrefix: string;
    consentLink: string;
    consentSuffix: string;
    privacyNote: string;
  };
  footer: {
    tagline: string;
    authorHeading: string;
    authorText: string;
    authorLink: string;
    contactsHeading: string;
    emailLabel: string;
    telegramLabel: string;
    legalHeading: string;
    privacy: string;
    consent: string;
    rights: string;
    builtWith: string;
  };
  legal: {
    back: string;
    updated: string;
    privacyTitle: string;
    consentTitle: string;
  };
  admin: {
    loginTitle: string;
    loginSubtitle: string;
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
    signOut: string;
    invalidCredentials: string;
    dashboard: string;
    stats: {
      total: string;
      byStatus: string;
      byLanguage: string;
      last7days: string;
    };
    table: {
      id: string;
      name: string;
      email: string;
      comment: string;
      locale: string;
      createdAt: string;
      status: string;
      notes: string;
      actions: string;
      empty: string;
    };
    filters: {
      search: string;
      searchPlaceholder: string;
      status: string;
      locale: string;
      all: string;
      from: string;
      to: string;
      apply: string;
      reset: string;
      export: string;
    };
    statuses: {
      new: string;
      in_progress: string;
      contacted: string;
      confirmed: string;
      cancelled: string;
    };
    actions: {
      save: string;
      saving: string;
      saved: string;
      edit: string;
      close: string;
      delete: string;
      confirmDelete: string;
    };
    notesPlaceholder: string;
  };
};

const ru: Dict = {
  meta: {
    title: 'Рассказы о Ромке и его бабушке — слушать и заказать книги',
    description:
      'Семь новелл Софии Агачер для билингвальных семей. Слушайте рассказы в исполнении автора на VK Video и YouTube и оставьте предварительную заявку на покупку книг серии.',
    keywords: [
      'Рассказы о Ромке и его бабушке',
      'София Агачер',
      'билингвальные книги',
      'детские рассказы',
      'аудиокниги для детей',
      'семейное чтение',
    ],
  },
  nav: {
    about: 'О цикле',
    listen: 'Слушать рассказы',
    order: 'Оставить заявку',
    languageLabel: 'Язык сайта',
    skipToContent: 'Перейти к содержанию',
  },
  hero: {
    eyebrow: 'София Агачер · цикл из 7 книг',
    titleRu: 'Рассказы о Ромке и его бабушке',
    titleEn: 'The Adventures of Romka and his Grandmother',
    lead: 'Семь отдельных книг для билингвальных семей: около 80–100 страниц каждая, формат тетради в клеточку, тёплые акварельные иллюстрации. Русская и английская версии — в одной серии.',
    facts: ['7 книг в цикле', '80–100 страниц', 'Формат тетради в клеточку', 'Русский и английский'],
    ctaOrder: 'Оставить заявку',
    ctaListen: 'Слушать рассказы',
    illustrationAlt: 'Акварельная иллюстрация: чёрный кот Ромка и его бабушка',
  },
  about: {
    heading: 'О цикле',
    body:
      'ДОРОГИЕ ЧИТАТЕЛИ! Пока новеллы из цикла «Рассказы о Ромке и его бабушке» готовятся к изданию, вы можете прослушать их в исполнении автора -- Софии Агачер. Если вы захотите приобрести одну или несколько книг цикла, оставьте свою предварительную заявку здесь.',
    note: 'Пока новеллы готовятся к печати, мы собираем предварительные заявки — без оплаты и обязательств. Мы напишем вам, когда книги будут готовы.',
    authorLinkLabel: 'Сайт Софии Агачер',
    seriesTitle: 'Что такое цикл «Рассказы о Ромке и его бабушке»',
    seriesPoints: [
      {
        title: '7 отдельных книг',
        text: 'Каждый рассказ выходит отдельной книгой — можно читать по порядку или выбрать любимую историю.',
      },
      {
        title: '80–100 страниц',
        text: 'Комфортный объём для семейного чтения: одна-две главы перед сном.',
      },
      {
        title: 'Формат тетради в клеточку',
        text: 'Знакомый с детства формат — книга удобно ложится в руки и в школьный рюкзак.',
      },
      {
        title: 'Два языка',
        text: 'Русский и английский тексты для билингвальных семей и русскоязычных читателей за рубежом.',
      },
    ],
    fragmentLinkLabel: 'Скачать фрагмент книги (PDF)',
  },
  stories: {
    heading: 'Слушать рассказы',
    subheading:
      'Рассказы читает автор — София Агачер. Записи звучат на русском языке и выложены на двух площадках: на VK Video и на YouTube. Это одна и та же аудиоверсия — выбирайте ту площадку, которая вам удобнее.',
    platformLabel: 'Площадка для просмотра',
    platformNote: 'Записи на обеих площадках на русском языке — разницы в содержании нет.',
    storyLabel: 'Рассказ',
    watchOn: 'Смотреть на',
    embedTitle: 'Плеер',
    playLabel: 'Включить плеер',
    collapseLabel: 'Свернуть плеер',
    openExternal: 'Открыть в новой вкладке',
    hint: 'Плеер загружается только после нажатия — так сайт остаётся быстрым.',
  },
  form: {
    heading: 'Предварительный заказ',
    subheading:
      'Оставьте имя и email — мы свяжемся с вами, когда книги будут готовы к печати. Заявка ничего не стоит и ни к чему не обязывает.',
    name: 'Имя',
    namePlaceholder: 'Как к вам обращаться',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    comment: 'Комментарий / какие книги интересуют',
    commentPlaceholder: 'Например: интересны книги 1 и 5, нужны обе языковые версии',
    submit: 'Отправить заявку',
    submitting: 'Отправляем…',
    successTitle: 'Спасибо! Ваша заявка принята.',
    successBody: 'Мы свяжемся с вами, когда книги будут готовы к печати.',
    successAgain: 'Отправить ещё одну заявку',
    errors: {
      nameRequired: 'Пожалуйста, укажите имя.',
      nameTooLong: 'Имя слишком длинное (максимум 120 символов).',
      emailRequired: 'Пожалуйста, укажите email.',
      emailInvalid: 'Проверьте, пожалуйста, адрес email.',
      commentTooLong: 'Комментарий слишком длинный (максимум 2000 символов).',
      consentRequired: 'Нужно согласие на обработку персональных данных.',
      generic: 'Не удалось отправить заявку. Попробуйте ещё раз.',
      network: 'Сеть недоступна. Проверьте подключение и попробуйте снова.',
      rateLimited: 'Слишком много попыток. Попробуйте через минуту.',
    },
    requiredHint: 'Поля со звёздочкой обязательны.',
    selectedStories: 'Выбранные рассказы',
    clearSelection: 'Сбросить',
    consentPrefix: 'Я согласен с',
    consentLink: 'политикой конфиденциальности',
    consentSuffix: 'и на обработку персональных данных.',
    privacyNote: 'Мы используем ваши данные только для связи по предварительному заказу.',
  },
  footer: {
    tagline: 'Рассказы о Ромке и его бабушке — цикл книг для семейного чтения на русском и английском.',
    authorHeading: 'Автор',
    authorText: 'София Агачер — автор цикла и чтец аудиоверсий рассказов.',
    authorLink: 'agacher.com',
    contactsHeading: 'Контакты',
    emailLabel: 'Email',
    telegramLabel: 'Telegram',
    legalHeading: 'Документы',
    privacy: 'Политика конфиденциальности',
    consent: 'Согласие на обработку данных',
    rights: 'Все права защищены.',
    builtWith: 'Сайт-лендинг цикла книг.',
  },
  legal: {
    back: '← На главную',
    updated: 'Обновлено',
    privacyTitle: 'Политика конфиденциальности',
    consentTitle: 'Согласие на обработку персональных данных',
  },
  admin: {
    loginTitle: 'Вход в CRM',
    loginSubtitle: 'Панель управления заявками на книги цикла «Рассказы о Ромке и его бабушке».',
    email: 'Email',
    password: 'Пароль',
    signIn: 'Войти',
    signingIn: 'Входим…',
    signOut: 'Выйти',
    invalidCredentials: 'Неверный email или пароль.',
    dashboard: 'Заявки',
    stats: {
      total: 'Всего заявок',
      byStatus: 'По статусам',
      byLanguage: 'По языкам',
      last7days: 'За 7 дней',
    },
    table: {
      id: 'ID',
      name: 'Имя',
      email: 'Email',
      comment: 'Комментарий',
      locale: 'Язык',
      createdAt: 'Создана',
      status: 'Статус',
      notes: 'Заметки',
      actions: 'Действия',
      empty: 'Заявок пока нет.',
    },
    filters: {
      search: 'Поиск',
      searchPlaceholder: 'Имя или email',
      status: 'Статус',
      locale: 'Язык',
      all: 'Все',
      from: 'С даты',
      to: 'По дату',
      apply: 'Применить',
      reset: 'Сбросить',
      export: 'Экспорт CSV',
    },
    statuses: {
      new: 'Новая',
      in_progress: 'В работе',
      contacted: 'Связались',
      confirmed: 'Подтверждена',
      cancelled: 'Отменена',
    },
    actions: {
      save: 'Сохранить',
      saving: 'Сохраняем…',
      saved: 'Сохранено',
      edit: 'Открыть',
      close: 'Закрыть',
      delete: 'Удалить',
      confirmDelete: 'Удалить заявку безвозвратно?',
    },
    notesPlaceholder: 'Заметка менеджера…',
  },
};

const en: Dict = {
  meta: {
    title: 'The Adventures of Romka and his Grandmother — listen and pre-order the books',
    description:
      'Seven stories by Sofia Agacher for bilingual families. Listen to the stories narrated by the author on VK Video and YouTube, and leave a pre-order request for the book series.',
    keywords: [
      'The Adventures of Romka and his Grandmother',
      'Sofia Agacher',
      'bilingual children books',
      'stories for children',
      'audio stories for kids',
      'family reading',
    ],
  },
  nav: {
    about: 'About the series',
    listen: 'Listen to the stories',
    order: 'Pre-order',
    languageLabel: 'Site language',
    skipToContent: 'Skip to content',
  },
  hero: {
    eyebrow: 'Sofia Agacher · a series of 7 books',
    titleRu: 'Рассказы о Ромке и его бабушке',
    titleEn: 'The Adventures of Romka and his Grandmother',
    lead: 'Seven separate books for bilingual families: about 80–100 pages each, in the familiar squared-notebook format, with warm watercolour illustrations. Russian and English editions in one series.',
    facts: ['7 books in the series', '80–100 pages', 'Squared-notebook format', 'Russian and English'],
    ctaOrder: 'Leave a request',
    ctaListen: 'Listen to the stories',
    illustrationAlt: 'Watercolour illustration: Romka the black cat and his grandmother',
  },
  about: {
    heading: 'About the series',
    body:
      'DEAR READERS! While the stories in the “The Adventures of Romka and his Grandmother” series are being prepared for publication, you can listen to them, narrated by Sofia Agacher. If you would like to purchase one or more books in the series, please leave your pre-order request here.',
    note: 'While the books are being prepared for print we are collecting pre-order requests — no payment, no obligation. We will write to you as soon as the books are ready.',
    authorLinkLabel: 'Sofia Agacher’s website',
    seriesTitle: 'What the series “The Adventures of Romka and his Grandmother” is',
    seriesPoints: [
      {
        title: '7 separate books',
        text: 'Each story is published as its own book — read them in order or pick your favourite.',
      },
      {
        title: '80–100 pages',
        text: 'A comfortable length for family reading: one or two chapters before bedtime.',
      },
      {
        title: 'Squared-notebook format',
        text: 'The familiar format from childhood — easy to hold and easy to fit in a school bag.',
      },
      {
        title: 'Two languages',
        text: 'Russian and English texts for bilingual families and Russian-speaking readers abroad.',
      },
    ],
    fragmentLinkLabel: 'Download a book fragment (PDF)',
  },
  stories: {
    heading: 'Listen to the stories',
    subheading:
      'The stories are narrated by the author, Sofia Agacher. The recordings are in Russian and are available on two platforms: VK Video and YouTube. It is the same audio version — just pick whichever platform you find more convenient.',
    platformLabel: 'Viewing platform',
    platformNote: 'Both platforms host the same Russian-language recordings.',
    storyLabel: 'Story',
    watchOn: 'Watch on',
    embedTitle: 'Player',
    playLabel: 'Load the player',
    collapseLabel: 'Hide the player',
    openExternal: 'Open in a new tab',
    hint: 'The player loads only after you click — that keeps the site fast.',
  },
  form: {
    heading: 'Pre-order request',
    subheading:
      'Leave your name and email — we will contact you when the books are ready for print. A request costs nothing and commits you to nothing.',
    name: 'Name',
    namePlaceholder: 'What should we call you',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    comment: 'Comment / which books interest you',
    commentPlaceholder: 'For example: books 1 and 5, both language editions',
    submit: 'Send request',
    submitting: 'Sending…',
    successTitle: 'Thank you! Your request has been received.',
    successBody: 'We will contact you when the books are ready for print.',
    successAgain: 'Send another request',
    errors: {
      nameRequired: 'Please enter your name.',
      nameTooLong: 'The name is too long (120 characters maximum).',
      emailRequired: 'Please enter your email.',
      emailInvalid: 'Please check your email address.',
      commentTooLong: 'The comment is too long (2000 characters maximum).',
      consentRequired: 'Consent to personal data processing is required.',
      generic: 'We could not send your request. Please try again.',
      network: 'The network is unavailable. Check your connection and try again.',
      rateLimited: 'Too many attempts. Please try again in a minute.',
    },
    requiredHint: 'Fields marked with an asterisk are required.',
    selectedStories: 'Selected stories',
    clearSelection: 'Clear',
    consentPrefix: 'I agree to the',
    consentLink: 'privacy policy',
    consentSuffix: 'and to the processing of my personal data.',
    privacyNote: 'We use your data only to contact you about your pre-order.',
  },
  footer: {
    tagline: 'The Adventures of Romka and his Grandmother — a book series for family reading in Russian and English.',
    authorHeading: 'Author',
    authorText: 'Sofia Agacher — author of the series and narrator of the audio versions.',
    authorLink: 'agacher.com',
    contactsHeading: 'Contacts',
    emailLabel: 'Email',
    telegramLabel: 'Telegram',
    legalHeading: 'Documents',
    privacy: 'Privacy policy',
    consent: 'Personal data consent',
    rights: 'All rights reserved.',
    builtWith: 'Landing page for the book series.',
  },
  legal: {
    back: '← Back to the home page',
    updated: 'Updated',
    privacyTitle: 'Privacy Policy',
    consentTitle: 'Consent to Personal Data Processing',
  },
  admin: {
    loginTitle: 'CRM sign in',
    loginSubtitle: 'Lead management panel for “The Adventures of Romka and his Grandmother”.',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    signOut: 'Sign out',
    invalidCredentials: 'Wrong email or password.',
    dashboard: 'Requests',
    stats: {
      total: 'Total requests',
      byStatus: 'By status',
      byLanguage: 'By language',
      last7days: 'Last 7 days',
    },
    table: {
      id: 'ID',
      name: 'Name',
      email: 'Email',
      comment: 'Comment',
      locale: 'Language',
      createdAt: 'Created',
      status: 'Status',
      notes: 'Notes',
      actions: 'Actions',
      empty: 'No requests yet.',
    },
    filters: {
      search: 'Search',
      searchPlaceholder: 'Name or email',
      status: 'Status',
      locale: 'Language',
      all: 'All',
      from: 'From',
      to: 'To',
      apply: 'Apply',
      reset: 'Reset',
      export: 'Export CSV',
    },
    statuses: {
      new: 'New',
      in_progress: 'In progress',
      contacted: 'Contacted',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
    },
    actions: {
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved',
      edit: 'Open',
      close: 'Close',
      delete: 'Delete',
      confirmDelete: 'Delete this request permanently?',
    },
    notesPlaceholder: 'Manager note…',
  },
};

export const DICTIONARIES: Record<Locale, Dict> = { ru, en };

export function getDict(locale: Locale): Dict {
  return DICTIONARIES[locale] ?? ru;
}
