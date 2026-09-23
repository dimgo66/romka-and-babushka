'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Dict } from '@/lib/dictionaries';
import { PAGE_ILLUSTRATIONS } from '@/lib/config';
import { METRIKA_GOALS, reachGoal } from '@/lib/metrika';

type Props = {
  dict: Dict;
};

/**
 * Развороты книги: слайдер на всю ширину с переключением стрелками,
 * клавиатурой и свайпом. По клику картинка открывается крупно (лайтбокс).
 * Все три изображения одинакового размера — 1615×808.
 */
export function PageIllustrations({ dict }: Props) {
  const total = PAGE_ILLUSTRATIONS.length;
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const alt = useCallback(
    (i: number) => dict.about.illustrationsAlt[i] ?? dict.about.illustrationsTitle,
    [dict],
  );

  const go = useCallback(
    (next: number, goal: 'arrow' | 'keyboard' | 'swipe') => {
      const bounded = (next + total) % total;
      setIndex(bounded);
      reachGoal(METRIKA_GOALS.galleryNext, { to: bounded + 1, via: goal });
    },
    [total],
  );

  const prev = useCallback(() => go(index - 1, 'arrow'), [go, index]);
  const next = useCallback(() => go(index + 1, 'arrow'), [go, index]);

  // Открытие/закрытие крупного просмотра + цель Метрики
  const openZoom = useCallback(() => {
    setZoomed(true);
    reachGoal(METRIKA_GOALS.galleryZoom, { spread: index + 1 });
  }, [index]);

  const closeZoom = useCallback(() => setZoomed(false), []);

  // Клавиатура: стрелки листают, Esc закрывает, Tab не уводит фокус за пределы окна
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && zoomed) {
        event.preventDefault();
        closeZoom();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomed, closeZoom, prev, next]);

  // Пока открыт лайтбокс — блокируем прокрутку страницы под ним
  useEffect(() => {
    if (!zoomed) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [zoomed]);

  // Свайп для мобильных
  function onTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const end = event.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < 40) return; // слишком короткое движение — не свайп
    go(delta < 0 ? index + 1 : index - 1, 'swipe');
  }

  const current = PAGE_ILLUSTRATIONS[index];

  return (
    <div className="mt-8">
      <h3 className="font-display text-base font-bold text-brand-ink">{dict.about.illustrationsTitle}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-brand-ink-soft">{dict.about.illustrationsNote}</p>

      {/* Слайдер на всю ширину доступного места */}
      <div
        className="relative mt-4 overflow-hidden rounded-xl2 border border-brand-beige-dark bg-white/70 shadow-soft"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="group"
        aria-roledescription="carousel"
        aria-label={dict.about.illustrationsTitle}
      >
        <button
          type="button"
          onClick={openZoom}
          className="group relative block w-full cursor-zoom-in"
          aria-label={`${dict.about.galleryZoom}: ${alt(index)}`}
        >
          <Image
            src={current}
            alt={alt(index)}
            width={1615}
            height={808}
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 1100px"
            className="h-auto w-full object-contain"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-brand-ink/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            <span aria-hidden="true">⤢</span>
            {dict.about.galleryZoom}
          </span>
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label={dict.about.galleryPrev}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-brand-ink shadow-soft transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-orange sm:left-3"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={dict.about.galleryNext}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-brand-ink shadow-soft transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-orange sm:right-3"
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </div>

      {/* Индикатор: номер разворота и точки-переключатели */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-brand-ink-soft" aria-live="polite">
          {dict.about.galleryCounter} {index + 1} / {total}
        </p>
        {total > 1 && (
          <div className="flex items-center gap-1.5">
            {PAGE_ILLUSTRATIONS.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => go(i, 'arrow')}
                aria-label={`${dict.about.galleryCounter} ${i + 1}`}
                aria-current={i === index}
                className={[
                  'h-2.5 w-2.5 rounded-full transition',
                  i === index ? 'bg-brand-orange' : 'bg-brand-beige-dark hover:bg-brand-orange-soft',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-brand-ink-soft">{dict.about.galleryHint}</p>

      {/* Лайтбокс: крупный просмотр во весь экран */}
      {zoomed && (
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={alt(index)}
          className="fixed inset-0 z-50 flex flex-col bg-brand-ink/95 p-3 sm:p-6"
          onClick={closeZoom}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 text-white">
            <p className="text-sm font-semibold">
              {dict.about.galleryCounter} {index + 1} / {total}
            </p>
            <button
              type="button"
              onClick={closeZoom}
              aria-label={dict.about.galleryClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl font-bold transition hover:bg-white/25"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {/* content не закрывает окно: клик по подложке закрывает */}
          <div className="flex min-h-0 flex-1 items-center justify-center py-3" onClick={(e) => e.stopPropagation()}>
            <Image
              src={current}
              alt={alt(index)}
              width={1615}
              height={808}
              sizes="100vw"
              className="h-auto max-h-full w-auto max-w-full rounded-lg object-contain"
            />
          </div>

          {total > 1 && (
            <div className="flex shrink-0 items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={prev}
                aria-label={dict.about.galleryPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white transition hover:bg-white/25"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label={dict.about.galleryNext}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white transition hover:bg-white/25"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}