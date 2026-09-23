# Рассказы о Ромке и его бабушке · The Adventures of Romka and his Grandmother

Двуязычный (RU/EN) сайт-лендинг цикла из 7 книг Софии Агачер: прослушивание рассказов
в исполнении автора и сбор предварительных заявок на покупку книг до их издания.

**Стек:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL ·
Telegram Bot API · Яндекс.Метрика · деплой на Vercel. Без конструкторов — только код.

---

## 1. Что реализовано

| Раздел ТЗ | Реализация |
| --- | --- |
| 3.1 Hero | Двуязычный заголовок, состав цикла (7 книг, 80–100 стр., тетрадь в клеточку), две кнопки-якоря. Акварельная SVG-иллюстрация. |
| 3.2 О цикле | Дословные тексты RU/EN из ТЗ, ссылка на <https://agacher.com/>, состав цикла, ссылка на скачивание фрагмента PDF. |
| 3.3 Слушать рассказы | 7 карточек: номер, RU- и EN-название, описание, **ленивый плеер** (iframe по клику). Переключатель площадки **VK Video / YouTube** (выбор запоминается). Ссылка «Смотреть на …». |
| 3.4 Предварительный заказ | Имя\*, Email\* (валидация), комментарий, «какие книги интересуют» — чипы с номерами рассказов. Текст подтверждения RU/EN. Honeypot + rate limit. |
| 3.5 Футер | Автор, контакты, юридические документы, копирайт. |
| 4 Двуязычность | Переключатель «RU \| EN» в шапке, cookie `romka_locale`, серверный рендер нужного словаря, смена текстов и `lang` у `<html>`. Язык интерфейса **не влияет** на площадку просмотра: записи на обеих площадках на русском. |
| 5.1 Приём заявок | `POST /api/leads` → валидация → БД → Telegram → ответ фронтенду. |
| 5.2 CRM | `/admin`: вход по email/паролю, статистика, таблица заявок, смена статуса, заметки, поиск, фильтры по статусу/языку/датам, экспорт CSV. |
| 5.3 Telegram-бот | `POST /api/telegram/webhook` + уведомления менеджеру в формате из ТЗ. Настройка вебхука: `GET /api/telegram/setup`. |
| 6 Яндекс.Метрика | Счётчик + вебвизор, карта скроллинга, аналитика форм. Цели: отправка формы, клик «Оставить заявку», клики по VK/YouTube, переключение языка, открытие плеера. |
| 7 Хостинг | `vercel.json`, инструкция по деплою и переменным окружения. |
| 8 Доп. требования | SEO-метаданные на двух языках, Schema.org `BookSeries` + `Book` + `AudioObject`, robots/sitemap, HSTS и security-заголовки, политика конфиденциальности и согласие на обработку данных. PDF — **обычной ссылкой на скачивание**, без интерактивного вьюера. |

---

## 2. Быстрый старт (локально)

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:3000
```

Готовый `.env` для разработки уже создан: PostgreSQL не подключён, заявки пишутся
в `.data/leads.json`, вход в CRM — `admin@romka.local` / `romka-admin`.

Наполнить CRM демо-заявками:

```bash
npm run db:seed
```

---

## 3. Структура проекта

```
src/
  app/
    layout.tsx              # <html lang>, метаданные, шрифты, Яндекс.Метрика
    page.tsx                # лендинг + JSON-LD (BookSeries/Book/AudioObject)
    globals.css             # Tailwind + акварельная палитра, «клетка»
    privacy/ consent/       # юридические документы (RU/EN)
    robots.ts sitemap.ts
    admin/page.tsx          # CRM: вход или дашборд
    api/
      leads/route.ts        # POST — приём заявки, GET — список для CRM
      leads/[id]/route.ts   # GET / PATCH / DELETE заявки
      leads/export/route.ts # экспорт CSV (BOM, разделитель «;»)
      auth/login|logout     # JWT-сессия администратора
      telegram/webhook      # вебхук Bot API
      telegram/setup        # регистрация вебхука + тестовое сообщение
  components/               # Header, Hero, About, StoriesGrid, LeadForm, Footer, LanguageSwitcher, admin/*
  lib/
    dictionaries.ts         # словари ru/en
    stories.ts              # 7 рассказов + преобразование ссылок в embed
    store.ts                # Prisma (PostgreSQL) или локальное JSON-хранилище
    auth.ts telegram.ts validation.ts rate-limit.ts metrika.ts config.ts i18n.ts
prisma/schema.prisma        # модели Lead и AdminUser
prisma/seed.mjs             # демо-данные
public/files/               # фрагмент книги PDF для скачивания
```

---

## 4. Переменные окружения

| Переменная | Назначение |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Публичный адрес сайта (канонические ссылки, sitemap, вебхук). |
| `DATABASE_URL` | Строка подключения PostgreSQL. **Без неё на Vercel данные не сохранятся.** |
| `TELEGRAM_BOT_TOKEN` | Токен бота от [@BotFather](https://t.me/BotFather). |
| `TELEGRAM_CHAT_ID` | ID чата менеджера; несколько — через запятую. |
| `TELEGRAM_WEBHOOK_SECRET` | Секрет проверки вебхука (`X-Telegram-Bot-Api-Secret-Token`). |
| `AUTH_SECRET` | Секрет подписи JWT-сессии CRM, минимум 32 символа. |
| `ADMIN_CREDENTIALS` | `email:пароль`, несколько администраторов — через `;`. Пароль можно задать как `sha256:<hex>`. |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | Номер счётчика Метрики. Пусто — скрипт не загружается. |
| `LOCAL_DATA_DIR` | Каталог JSON-хранилища для разработки (по умолчанию `.data`). |

Хеш пароля администратора:

```bash
node -e "console.log('sha256:'+require('crypto').createHash('sha256').update('МОЙ_ПАРОЛЬ','utf8').digest('hex'))"
```

---

## 5. Деплой на Vercel

1. **База данных.** Создайте PostgreSQL в Vercel Postgres, Neon или Supabase и скопируйте   строку подключения.
2. **Схема.** Локально с `DATABASE_URL` в `.env`:
   ```bash
   npm i -D prisma @prisma/client
   npm run db:generate
   npm run db:push
   ```
3. **Git.** Запушьте репозиторий и импортируйте его в Vercel (Framework: Next.js,
   build command берётся из `vercel.json`: `prisma generate && next build`).
4. **Переменные окружения** — добавьте все из таблицы выше в Settings → Environment Variables.
5. **Первый деплой.** После публикации включите зависимости Prisma в прод-сборку
   (они намеренно не обязательны, чтобы сайт собирался и без БД):
   ```bash
   npm i @prisma/client && git commit -am "enable prisma client" && git push
   ```
6. **Вебхук Telegram.** Откройте один раз
   `https://<домен>/api/telegram/setup?secret=<TELEGRAM_WEBHOOK_SECRET>`
   — бот зарегистрирует вебхук. Проверить связь: POST на тот же адрес из CRM под администратором.

---

## 6. CRM

Адрес: `/admin`. Вход по email и паролю из `ADMIN_CREDENTIALS`.

Возможности: статистика (всего / за 7 дней / по статусам / по языкам), таблица заявок,
смена статуса (`new → in_progress → contacted → confirmed → cancelled`), заметки менеджера,
поиск по имени и email, фильтры по статусу, языку и диапазону дат, экспорт CSV.

> На Vercel без `DATABASE_URL` заявки сохранить нельзя (файловая система только для чтения).
> Интерфейс при этом откроется в режиме локального JSON-хранилища — для разработки.

---

## 7. Защита от спама

- **Honeypot** — скрытое поле `website`: заполнено → запрос молча «принимается», но не сохраняется.
- **Rate limit** — 5 заявок в минуту с одного IP, 8 попыток входа в CRM за 5 минут.
- **Серверная валидация** имени, email и длины комментария (независимо от клиентской).
- Доступ к списку заявок и экспорту — только по JWT-сессии администратора.

Если нужна reCAPTCHA — добавьте её виджет в `LeadForm.tsx` и проверку токена
в `src/app/api/leads/route.ts` рядом с проверкой honeypot.

---

## 8. Цели Яндекс.Метрики

| Цель (`reachGoal`) | Событие |
| --- | --- |
| `lead_form_submit` | Нажата кнопка «Отправить заявку». |
| `lead_form_success` | Сервер подтвердил сохранение заявки. |
| `cta_order_click` | Клик по кнопкам «Оставить заявку» (hero, шапка). |
| `cta_listen_click` | Клик по кнопке «Слушать рассказы». |
| `video_click` | Переход по ссылке на VK Video / YouTube. |
| `platform_switch` | Переключение площадки просмотра (VK / YouTube). |
| `language_switch` | Переключение языка RU/EN. |
| `story_player_open` | Открытие встроенного плеера в карточке. |

Создайте эти цели в интерфейсе Метрики (тип — JavaScript-событие) с теми же идентификаторами.

---

## 9. Проверено в этой сборке

- `next build` — успешно, 9 маршрутов, без ошибок типов.
- Страницы `/`, `/privacy`, `/consent`, `/admin`, `/robots.txt`, `/sitemap.xml` — HTTP 200.
- Переключение языка: `lang="ru"` ↔ `lang="en"`, полный перевод интерфейса; площадка просмотра не зависит от языка.
- Все 7 названий рассказов и 7 ссылок на видео на месте; в разметке — корректные
  `youtube-nocookie.com/embed/...` и `vkvideo.ru/video_ext.php?oid=-211448735&id=...`.
- API заявок: валидация email, обязательное согласие, honeypot, лимит запросов, сохранение в БД.
- CRM: вход, отказ при неверном пароле, список заявок, PATCH статуса и заметок, экспорт CSV
  (UTF-8 BOM), 401 без сессии.
