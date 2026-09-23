import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';

import { LOCALE_COOKIE, normalizeLocale } from '@/lib/i18n';
import { getDict } from '@/lib/dictionaries';
import { SITE } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Согласие на обработку персональных данных / Personal Data Consent',
  description: 'Согласие на обработку персональных данных при отправке предварительной заявки.',
};

export default async function ConsentPage() {
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
        {locale === 'en' ? 'Consent to Personal Data Processing' : 'Согласие на обработку персональных данных'}
      </h1>
      <p className="mt-2 text-xs text-brand-ink-soft">
        {dict.legal.updated}: {updated}
      </p>

      {locale === 'en' ? (
        <div className="prose-warm mt-6 space-y-4 text-sm sm:text-base">
          <p>
            By ticking the consent checkbox and submitting the pre-order form on this Site I, the data
            subject, freely, of my own will and in my own interest, give consent to Sofia Agacher
            (contact:{' '}
            <a href={`mailto:${SITE.contactEmail}`} className="link-underline">
              {SITE.contactEmail}
            </a>
            ) to process my personal data.
          </p>
          <p>
            <strong>Data covered:</strong> name, email address, optional comment, interface language,
            submission date and time, IP address and User-Agent string.
          </p>
          <p>
            <strong>Purpose:</strong> contacting me when the “The Adventures of Romka and his
            Grandmother” book series is ready for print, and clarifying my pre-order.
          </p>
          <p>
            <strong>Operations:</strong> collection, recording, storage, clarification, use, blocking,
            deletion — by automated and non-automated means.
          </p>
          <p>
            <strong>Term:</strong> until the purpose is achieved or the consent is withdrawn, and no
            longer than 3 years from submission.
          </p>
          <p>
            Consent may be withdrawn at any time by writing to the address above. Requests to correct or
            delete data are handled within 30 days.
          </p>
        </div>
      ) : (
        <div className="prose-warm mt-6 space-y-4 text-sm sm:text-base">
          <p>
            Отмечая чекбокс согласия и отправляя форму предварительного заказа на этом Сайте, я, как
            субъект персональных данных, свободно, своей волей и в своём интересе даю согласие Софии
            Агачер (контакт:{' '}
            <a href={`mailto:${SITE.contactEmail}`} className="link-underline">
              {SITE.contactEmail}
            </a>
            ) на обработку моих персональных данных.
          </p>
          <p>
            <strong>Состав данных:</strong> имя, адрес электронной почты, необязательный комментарий,
            язык интерфейса, дата и время отправки заявки, IP-адрес и строка User-Agent.
          </p>
          <p>
            <strong>Цель обработки:</strong> связь со мной, когда книги цикла «Рассказы о Ромке и его
            бабушке» будут готовы к печати, и уточнение состава предварительного заказа.
          </p>
          <p>
            <strong>Действия с данными:</strong> сбор, запись, хранение, уточнение, использование,
            блокирование, удаление — с использованием средств автоматизации и без них.
          </p>
          <p>
            <strong>Срок:</strong> до достижения цели обработки либо до отзыва согласия, но не более
            3 лет с момента отправки заявки.
          </p>
          <p>
            Согласие может быть отозвано в любой момент письмом на указанный адрес. Запросы об
            уточнении или удалении данных рассматриваются в течение 30 дней.
          </p>
        </div>
      )}
    </main>
  );
}
