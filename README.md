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
| 3.2 О цикле | Дословные тексты RU/EN из ТЗ, ссылка на <https://agacher.com/>, состав цикла, галерея иллюстраций-разворотов страниц. |
| 3.3 Слушать рассказы | 7 карточек: номер, RU- и EN-название, описание, **ленивый плеер** (iframe по клику). Переключатель площадки **VK Video / YouTube** (выбор запоминается). Ссылка «Смотреть на …». |
| 3.4 Предварительный заказ | Имя\*, Email\* (валидация), комментарий, «какие книги интересуют» — чипы с номерами рассказов. Текст подтверждения RU/EN. Honeypot + rate limit. |
| 3.5 Футер | Автор, контакты, юридические документы, копирайт. |
| 4 Двуязычность | Переключатель «RU \| EN» в шапке, cookie `romka_locale`, серверный рендер нужного словаря, смена текстов и `lang` у `<html>`. Язык интерфейса **не влияет** на площадку просмотра: записи на обеих площадках на русском. |
| 5.1 Приём заявок | `POST /api/leads` → валидация → БД → Telegram → ответ фронтенду. |
| 5.2 CRM | `/admin`: вход по email/паролю, статистика, таблица заявок, смена статуса, заметки, поиск, фильтры по статусу/языку/датам, экспорт CSV. |
| 5.3 Telegram-бот | `POST /api/telegram/webhook` + уведомления менеджеру в формате из ТЗ. Настройка вебхука: `GET /api/telegram/setup`. |
| 6 Яндекс.Метрика | Счётчик + вебвизор, карта скроллинга, аналитика форм. Цели: отправка формы, клик «Оставить заявку», клики по VK/YouTube, переключение языка, открытие плеера. |
| 7 Хостинг | `vercel.json`, инструкция по деплою и переменным окружения. |
| 8 Доп. требования | SEO-метаданные на двух языках, Schema.org `BookSeries` + `Book` + `AudioObject`, robots/sitemap, HSTS и security-заголовки, политика конфиденциальности и согласие на обработку данных. Показ иллюстраций страниц — картинками в разделе «О цикле». |

---

## 2. Быстрый старт (локально)

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:3000
```

Готовый `.env` для разработки уже создан: заявки пишутся в PostgreSQL (если задан
`DATABASE_URL`) либо в `.data/leads.json`. Вход в CRM — `admin@romka.local` / `romka-admin`
(те же данные на проде, см. раздел 6).

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
      telegram/setup        # вебхук, тестовое сообщение, диагностика (diagnose=1)
  components/               # Header, Hero, About, StoriesGrid, LeadForm, Footer, LanguageSwitcher, admin/*
  lib/
    dictionaries.ts         # словари ru/en
    stories.ts              # 7 рассказов + преобразование ссылок в embed
    store.ts                # Prisma (PostgreSQL) или локальное JSON-хранилище
    auth.ts telegram.ts validation.ts rate-limit.ts metrika.ts config.ts i18n.ts
prisma/schema.prisma        # модели Lead и AdminUser
prisma/seed.mjs             # демо-данные
public/files/               # иллюстрации-развороты страниц (JPG)
```

---

## 4. Переменные окружения

| Переменная | Назначение |
| --- | --- |
| `SITE_URL` | Публичный адрес сайта (канонические ссылки, sitemap, вебхук). |
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

### Настройка Telegram-бота

1. Создайте бота у [@BotFather](https://t.me/BotFather) командой `/newbot` и скопируйте токен.
2. Впишите токен **только в `.env`** (файл в `.gitignore`, в репозиторий не попадёт):
   ```
   TELEGRAM_BOT_TOKEN=123456789:AA...
   ```
3. Напишите вашему боту любое сообщение в Telegram (или добавьте его в рабочую группу
   и напишите там) — иначе Telegram не покажет ID чата.
4. Узнайте `chat_id` и проверьте связь:
   ```bash
   npm run telegram:check          # покажет бота и доступные чаты
   npm run telegram:check -- --send  # + отправит тестовое сообщение
   ```
5. Впишите полученный ID в `.env` и на Vercel:
   ```
   TELEGRAM_CHAT_ID=123456789
   ```
   Несколько получателей — через запятую.
6. На проде зарегистрируйте вебхук (один раз):
   `https://<домен>/api/telegram/setup?secret=<TELEGRAM_WEBHOOK_SECRET>`

Токен и ID чата нигде не выводятся в логи — скрипт печатает только маску токена.
Если уведомления не нужны, оставьте `TELEGRAM_BOT_TOKEN` пустым: заявки продолжат
сохраняться, а шаг с Telegram просто пропускается.

---

## 5. Деплой на Vercel

### 5.1. Переменные окружения (обязательный шаг)

Добавляются в дашборде: **Project → Settings → Environment Variables**.
Для каждой переменной выберите окружения **Production** и **Preview**, затем **Save**.

| Переменная | Обязательна | Значение |
| --- | --- | --- |
| `SITE_URL` | да | `https://<ваш-домен>` — без слэша в конце |
| `DATABASE_URL` | **да** | строка подключения PostgreSQL |
| `AUTH_SECRET` | **да** | случайная строка ≥ 32 символов |
| `ADMIN_CREDENTIALS` | **да** | `email:пароль` или `email:sha256:<hex>` |
| `TELEGRAM_BOT_TOKEN` | нет | токен от @BotFather |
| `TELEGRAM_CHAT_ID` | нет | ID чата менеджера |
| `TELEGRAM_WEBHOOK_SECRET` | нет | случайная строка |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | нет | номер счётчика Метрики |

> **Без `DATABASE_URL` заявки не сохраняются:** файловая система Vercel доступна
> только для чтения, поэтому запись в JSON-хранилище падает. Локальное
> JSON-хранилище работает лишь при разработке.
>
> Если при этом настроен Telegram, заявка **не теряется**: она уходит менеджеру
> с пометкой «НЕ сохранена в базе» и пометкой сохранить данные вручную (HTTP 201,
> в ответе `saved: false, delivered: true`). Это временная страховка — базу всё
> равно нужно подключить, иначе заявок не будет в CRM и в экспорте CSV.
>
> Проверить, видит ли базу конкретное окружение, можно диагностикой
> `GET /api/telegram/setup?diagnose=1` (под администратором): поле `storage`
> покажет `kind: postgres|json`, имя найденной переменной и хост базы.

> **Почему у `SITE_URL` нет префикса `NEXT_PUBLIC_`.** Vercel предупреждает, что
> публичный префикс раскрывает значение в браузере. Адрес сайта читается только
> на сервере (canonical, Open Graph, sitemap, robots, вебхук), поэтому префикс
> здесь не нужен и только зря раскрывал бы значение. Префикс `NEXT_PUBLIC_`
> оставлен **только** у `NEXT_PUBLIC_YANDEX_METRIKA_ID` — номер счётчика
> действительно читается в браузере (`src/lib/metrika.ts`), без префикса он
> был бы `undefined` и цели Метрики не отправлялись бы.

Сгенерировать секреты:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # AUTH_SECRET
node -e "console.log('sha256:'+require('crypto').createHash('sha256').update('МОЙ_ПАРОЛЬ','utf8').digest('hex'))"
```

**После добавления переменных нужен Redeploy** (Deployments → ⋯ → Redeploy):
значения `NEXT_PUBLIC_*` встраиваются в бандл на этапе сборки, без пересборки
они не применятся.

### 5.2. База данных

Создайте PostgreSQL и скопируйте строку подключения. Варианты:

- **Neon** — через Vercel: Storage → Marketplace → Neon. Интеграция создаёт
  переменные автоматически, и код читает **любую** из них:
  `DATABASE_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`,
  `DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING` (в этом порядке).
  Если Vercel сообщает «already has an existing environment variable with name
  `DATABASE_URL`» — переменная уже создана, создавать её вручную не нужно:
  откройте существующую и проверьте, что она отмечена для **Production**
  (галочки Environments внизу формы).

  > **Важно про интеграцию Neon через Marketplace.** Она не создаёт
  > `DATABASE_URL` напрямую. Вместо этого она создаёт **префикс** (поле «Custom
  > Prefix», по умолчанию — `DATABASE_URL`) и добавляет его к собственным
  > именам: `DATABASE_URL_DATABASE_URL`, `DATABASE_URL_POSTGRES_URL`,
  > `DATABASE_URL_PGHOST` и ещё ~15 переменных. В итоге в проекте появляется
  > пустая `DATABASE_URL` и заполненные `DATABASE_URL_*` — код их не видит, и
  > заявки уходят в JSON-фолбэк (в Telegram приходят, в CRM нет).
  >
  > Диагностика показывает это как `emptyVars: ["DATABASE_URL"]`, `kind: "json"`.
  > Посмотреть список переменных проекта:
  > ```bash
  > vercel env ls production --project <проект>
  > ```
  > **Решение** — задать `DATABASE_URL` вручную настоящей строкой подключения
  > (возьмите значение `DATABASE_URL_POSTGRES_URL` или строку из консоли Neon;
  > хост должен содержать `-pooler`), затем сделать **Redeploy**. Переменные
  > `DATABASE_URL_*` можно оставить — они безвредны и просто не читаются.
  >
  > **Порядок важен:** интеграция создаёт переменные позже последнего деплоя,
  > поэтому создания переменной недостаточно — нужен новый деплой, иначе
  > рантайм продолжит видеть старое пустое значение.
- **Supabase** — Project Settings → Database → Connection string → URI.

Затем локально, с этим адресом в `.env`:

```bash
npm run db:generate   # prisma generate — создаёт Prisma Client
npm run db:push       # prisma db push — создаёт таблицы lead и admin_users
```

Prisma уже в зависимостях (`prisma` 6.19.3 + `@prisma/client` 6.19.3).

### 5.3. Деплой

1. **Git.** Импортируйте репозиторий в Vercel (Framework: Next.js, build command
   берётся из `vercel.json`: `prisma generate && next build`).
2. **Деплой.** Vercel выполнит `npm install` → `prisma generate` → `next build`
   автоматически. Отдельных действий с Prisma не требуется.
3. **Проверка.** Откройте сайт, отправьте тестовую заявку — она должна появиться
   в CRM (`/admin`) и прийти в Telegram.
4. **Вебхук Telegram** (необязательно — нужен только для команд боту).
   Откройте один раз
   `https://<домен>/api/telegram/setup?secret=<TELEGRAM_WEBHOOK_SECRET>`
   — бот зарегистрирует вебхук. Проверить связь: POST на тот же адрес из CRM под администратором.
5. **Если Telegram отвечает `401 Unauthorized`** — токен бота недействителен.
   Проверьте его, не раскрывая секрет:

   ```
   https://<домен>/api/telegram/setup?diagnose=1     # под сессией администратора CRM
   ```

   В ответе `diagnostics.formatValid` и `diagnostics.secretPartLength` покажут,
   корректен ли токен: у верного токена секретная часть ровно **35 символов**.
   Если длина меньше — при вставке в Vercel потерялись символы. Если формат
   верный, а `bot.ok: false` — токен отозван, перевыпустите его в @BotFather
   (`/revoke`) и обновите переменную. Диагностика не выводит сам токен,
   только его форму и числовой id бота.

> **Важно про мажорные версии Prisma.** Установлена ветка **6.19.3** — намеренно.
> Prisma 7 убрала `url = env("DATABASE_URL")` из схемы: теперь подключение задаётся
> через `prisma.config.ts` и драйвер-адаптер (`@prisma/adapter-pg`), который передаётся
> в конструктор `PrismaClient`. Обновление до 7 потребует переписать
> `prisma/schema.prisma` и `src/lib/store.ts`. Раз PRISMA-клиент подключается в коде
> лениво и без адаптера, ветка 6 остаётся рабочей и совместимой с текущим кодом.

> **Про `allowScripts` в package.json.** npm 12 блокирует lifecycle-скрипты
> зависимостей по умолчанию, а postinstall у `@prisma/engines` скачивает
> query-движок — без него Prisma не работает. Поэтому в `package.json` явно
> разрешены скрипты трёх пакетов Prisma:
>
> ```json
> "allowScripts": {
>   "prisma@6.19.3": true,
>   "@prisma/client@6.19.3": true,
>   "@prisma/engines@6.19.3": true
> }
> ```
>
> Записи привязаны к версии: при обновлении Prisma их нужно обновить.
> Проверить, что ничего не пропущено: `npx npm@12 install-scripts ls`
> (должно ответить «No packages with unreviewed install scripts»).

> **Про версию Node.** В `engines` указано `22.x` — точная мажорная версия, а не
> диапазон `>=20`. Диапазон заставляет Vercel при выходе новой мажорной версии
> Node автоматически переключать проект на неё, что может сломать сборку.
> Зафиксированная версия делает поведение предсказуемым.

---

## 6. CRM

Адрес: `/admin`. Вход по email и паролю из `ADMIN_CREDENTIALS`.

| Окружение | Адрес | Логин | Пароль |
| --- | --- | --- | --- |
| Прод | `https://o-romke-and-babushke.vercel.app/admin` | `admin@romka.local` | `romka-admin` |
| Локально | `http://localhost:3000/admin` | `admin@romka.local` | `romka-admin` |

На проде пароль хранится хешем (`email:sha256:<hex>`), в открытом виде — только
локально в `.env`. Пароль намеренно простой: CRM закрывает лишь список заявок,
а вход защищён лимитом 8 попыток за 5 минут с одного IP. Смена пароля:

```bash
# 1. Посчитать хеш (Node 22)
node -e "console.log(require('node:crypto').createHash('sha256').update('НОВЫЙ_ПАРОЛЬ','utf8').digest('hex'))"

# 2. Записать в Vercel (Value: admin@romka.local:sha256:<хеш>) и сделать Redeploy
vercel env rm ADMIN_CREDENTIALS production --yes && vercel env add ADMIN_CREDENTIALS production
vercel deploy --prod
```

> Смена `AUTH_SECRET` разлогинивает все активные сессии CRM (подпись JWT
> перестаёт совпадать). Делайте это вместе со сменой пароля.

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
| `gallery_switch` | Переключение разворота в галерее иллюстраций. |
| `gallery_zoom` | Открытие иллюстрации крупно (лайтбокс). |

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
