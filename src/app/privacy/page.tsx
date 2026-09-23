import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';

import { LOCALE_COOKIE, normalizeLocale } from '@/lib/i18n';
import { getDict } from '@/lib/dictionaries';
import { SITE } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности / Privacy Policy',
  description: 'Политика конфиденциальности сайта цикла «Рассказы о Ромке и его бабушке».',
  robots: { index: true, follow: true },
};

export default async function PrivacyPage() {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  const dict = getDict(locale);
  const updated = '2026-01-01';

  return (
    <main className="container-page max-w-3xl py-14">
      <Link href="/" className="link-underline text-sm">
        {dict.legal.back}
      </Link>

      <h1 className="heading-lg mt-6">
        {locale === 'en' ? 'Privacy Policy' : 'Политика конфиденциальности'}
      </h1>
      <p className="mt-2 text-xs text-brand-ink-soft">
        {dict.legal.updated}: {updated}
      </p>

      {locale === 'en' ? <PrivacyEn /> : <PrivacyRu />}
    </main>
  );
}

function PrivacyRu() {
  return (
    <div className="prose-warm mt-6 space-y-5 text-sm sm:text-base">
      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">1. Общие положения</h2>
        <p>
          Настоящая политика описывает, как сайт цикла «Рассказы о Ромке и его бабушке» (далее — Сайт)
          обрабатывает персональные данные посетителей. Оператор персональных данных — автор цикла
          София Агачер. Связь с оператором:{' '}
          <a href={`mailto:${SITE.contactEmail}`} className="link-underline">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">2. Какие данные мы собираем</h2>
        <p>
          Через форму предварительного заказа Сайт получает: имя, адрес электронной почты, необязательный
          комментарий, выбранный язык интерфейса. Дополнительно автоматически фиксируются дата и время
          отправки, IP-адрес и строка User-Agent — для защиты формы от спама.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">3. Зачем мы их используем</h2>
        <p>
          Единственная цель обработки — связаться с вами, когда книги цикла будут готовы к печати, и
          уточнить состав предварительного заказа. Данные не используются для рекламных рассылок,
          не передаются третьим лицам и не продаются.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">4. Правовые основания и сроки</h2>
        <p>
          Обработка выполняется на основании вашего согласия, которое вы подтверждаете отметкой в форме.
          Данные хранятся до достижения цели обработки либо до отзыва согласия, но не более 3 лет с
          момента отправки заявки.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">5. Где хранятся данные</h2>
        <p>
          Заявки сохраняются в защищённой базе данных PostgreSQL, размещённой у поставщика облачных
          услуг (Vercel Postgres / Neon / Supabase), и дублируются уведомлением в закрытый чат
          менеджера в Telegram. Доступ к панели управления заявками защищён паролем.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">6. Аналитика</h2>
        <p>
          На Сайте установлен счётчик Яндекс.Метрики с включёнными вебвизором, картой скроллинга и
          аналитикой форм. Счётчик собирает обезличенные данные о посещениях (страницы, устройство,
          источник перехода, записи действий на странице). Отключить сбор можно в настройках браузера
          (блокировка сторонних скриптов) или с помощью расширений-блокировщиков.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">7. Cookie</h2>
        <p>
          Сайт использует техническую cookie, в которой хранится выбранный язык интерфейса (ru/en).
          Она не содержит персональных данных. Cookie Яндекс.Метрики устанавливаются сервисом
          аналитики.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">8. Ваши права</h2>
        <p>
          Вы можете запросить сведения об обработке ваших данных, потребовать их уточнения,
          блокирования или удаления, а также отозвать согласие. Для этого напишите на{' '}
          <a href={`mailto:${SITE.contactEmail}`} className="link-underline">
            {SITE.contactEmail}
          </a>
          . Мы ответим в течение 30 дней.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">9. Изменения</h2>
        <p>
          Актуальная редакция политики всегда доступна на этой странице. Дата последнего обновления
          указана в начале документа.
        </p>
      </section>
    </div>
  );
}

function PrivacyEn() {
  return (
    <div className="prose-warm mt-6 space-y-5 text-sm sm:text-base">
      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">1. General</h2>
        <p>
          This policy describes how the website of the book series “The Adventures of Romka and his
          Grandmother” (the “Site”) processes visitors’ personal data. The data controller is the author of the series,
          Sofia Agacher. Contact:{' '}
          <a href={`mailto:${SITE.contactEmail}`} className="link-underline">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">2. What we collect</h2>
        <p>
          Through the pre-order form the Site collects: your name, email address, an optional comment and
          the interface language you selected. The submission date and time, your IP address and the
          User-Agent string are recorded automatically to protect the form from spam.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">3. Why we use it</h2>
        <p>
          The only purpose is to contact you when the books are ready for print and to confirm your
          pre-order. The data is not used for marketing, not shared with third parties and never sold.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">4. Legal basis and retention</h2>
        <p>
          Processing is based on your consent, confirmed by the checkbox in the form. Data is kept until
          the purpose is achieved or consent is withdrawn, and for no longer than 3 years from submission.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">5. Where data is stored</h2>
        <p>
          Requests are stored in a secured PostgreSQL database hosted by a cloud provider (Vercel
          Postgres / Neon / Supabase) and mirrored by a notification into a private manager chat in
          Telegram. Access to the management panel is password-protected.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">6. Analytics</h2>
        <p>
          The Site uses Yandex.Metrica with Webvisor, scroll map and form analytics enabled. The counter
          collects anonymised visit data (pages, device, referrer, on-page session recordings). You can
          opt out with browser settings or a tracker-blocking extension.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">7. Cookies</h2>
        <p>
          The Site uses one technical cookie storing your interface language (ru/en). It contains no
          personal data. Yandex.Metrica cookies are set by the analytics service.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">8. Your rights</h2>
        <p>
          You may request information about processing, ask for correction, blocking or deletion of your
          data, and withdraw your consent by writing to{' '}
          <a href={`mailto:${SITE.contactEmail}`} className="link-underline">
            {SITE.contactEmail}
          </a>
          . We reply within 30 days.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-brand-ink">9. Changes</h2>
        <p>
          The current version of this policy is always available on this page; the last update date is
          shown at the top.
        </p>
      </section>
    </div>
  );
}
