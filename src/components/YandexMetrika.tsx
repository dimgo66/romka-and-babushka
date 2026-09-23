import Script from 'next/script';

/**
 * Счётчик Яндекс.Метрики с включёнными вебвизором, картой скроллинга
 * и аналитикой форм. Не рендерится, если счётчик не настроен.
 */
export function YandexMetrika() {
  const raw = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  const id = raw ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(id) || id <= 0) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

ym(${id}, "init", {
  ssr: true,
  webvisor: true,
  clickmap: true,
  ecommerce: "dataLayer",
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce: true,
  trackLinks: true,
  trackHash: true,
  params: { site: "romka-and-babushka" }
});
        `}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
