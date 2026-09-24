'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Dict } from '@/lib/dictionaries';
import { PAGE_ILLUSTRATIONS, PAGE_ILLUSTRATION_SIZE } from '@/lib/config';
import { METRIKA_GOALS, reachGoal } from '@/lib/metrika';

type Props = {
  dict: Dict;
};

const MAX_ZOOM = 3; // 3× от реального размера — с запасом для мелкого текста
const ZOOM_STEP = 0.25;

/** Тач-устройство? По возможности CSS, без разбора user-agent-строк */
function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/** Расстояние между двумя первыми пальцами — база для щипка */
function touchDistance(touches: TouchList): number {
  const a = touches[0];
  const b = touches[1];
  if (!a || !b) return 0;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

type Offset = { x: number; y: number };
const NO_OFFSET: Offset = { x: 0, y: 0 };

/**
 * Развороты книги: слайдер на всю ширину с переключением стрелками,
 * клавиатурой и свайпом. По клику картинка открывается в лайтбоксе.
 *
 * В лайтбоксе используется обычный <img> с исходным файлом, а не
 * оптимизатор Next: тот пережимает JPEG (q=75), и мелкий текст на развороте
 * становится мыльным. Здесь важно качество, а не вес.
 *
 * Картинка показывается в реальных пикселях (1:1). Если она больше экрана,
 * её можно тащить мышкой или пальцем; сдвиг ограничен так, чтобы любой край
 * был достижим, но разворот нельзя было «потерять» за пределами окна.
 */
export function PageIllustrations({ dict }: Props) {
  const total = PAGE_ILLUSTRATIONS.length;
  const natW = PAGE_ILLUSTRATION_SIZE.width;
  const natH = PAGE_ILLUSTRATION_SIZE.height;

  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>(NO_OFFSET);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState({ w: 0, h: 0 });

  const touchStartX = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const startedRef = useRef(false);
  /** Актуальный масштаб для слушателей, которые нельзя перерегистрировать на каждое движение */
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const alt = useCallback(
    (i: number) => dict.about.illustrationsAlt[i] ?? dict.about.illustrationsTitle,
    [dict],
  );

  /** Масштаб, при котором разворот целиком влезает в область просмотра */
  const fitZoom = useMemo(() => {
    if (!stage.w || !stage.h) return 1;
    // Выше 1:1 не поднимаем — растягивать картинку смысла нет
    return Math.min(1, stage.w / natW, stage.h / natH);
  }, [stage.w, stage.h, natW, natH]);

  /** Сдвиг держим так, чтобы края были достижимы, а картинка — не потеряна */
  const clampOffset = useCallback(
    (x: number, y: number, atZoom: number): Offset => {
      if (!stage.w || !stage.h) return NO_OFFSET;
      const maxX = Math.max(0, (natW * atZoom - stage.w) / 2);
      const maxY = Math.max(0, (natH * atZoom - stage.h) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      };
    },
    [stage.w, stage.h, natW, natH],
  );

  /** Смена масштаба с ограничением и пересчётом сдвига */
  const applyZoom = useCallback(
    (next: number) => {
      if (!stage.w || !stage.h) return;
      const clamped = Math.min(MAX_ZOOM, Math.max(fitZoom, Number(next.toFixed(3))));
      setZoom(clamped);
      setOffset((current) =>
        clamped <= fitZoom + 0.001 ? NO_OFFSET : clampOffset(current.x, current.y, clamped),
      );
    },
    [fitZoom, clampOffset, stage.w, stage.h],
  );

  const showFit = useCallback(() => {
    setZoom(fitZoom);
    setOffset(NO_OFFSET);
  }, [fitZoom]);

  const showActual = useCallback(() => {
    if (!stage.w || !stage.h) return;
    setZoom(1);
    setOffset(clampOffset(0, 0, 1));
  }, [clampOffset, stage.w, stage.h]);

  const zoomIn = useCallback(() => applyZoom(zoom + ZOOM_STEP), [applyZoom, zoom]);
  const zoomOut = useCallback(() => applyZoom(zoom - ZOOM_STEP), [applyZoom, zoom]);

  const go = useCallback(
    (next: number, goal: 'arrow' | 'keyboard' | 'swipe') => {
      const bounded = (next + total) % total;
      setIndex(bounded);
      // при смене разворота сбрасываем масштаб к «вписано»
      setOffset(NO_OFFSET);
      startedRef.current = false;
      reachGoal(METRIKA_GOALS.galleryNext, { to: bounded + 1, via: goal });
    },
    [total],
  );

  const prev = useCallback(() => go(index - 1, 'arrow'), [go, index]);
  const next = useCallback(() => go(index + 1, 'arrow'), [go, index]);

  const openZoom = useCallback(() => {
    setZoomed(true);
    setOffset(NO_OFFSET);
    startedRef.current = false;
    reachGoal(METRIKA_GOALS.galleryZoom, { spread: index + 1 });
  }, [index]);

  const closeZoom = useCallback(() => setZoomed(false), []);

  /** Следим за размером области просмотра (поворот экрана, ресайз окна) */
  useEffect(() => {
    if (!zoomed) return;
    const node = stageRef.current;
    if (!node) return;
    const measure = () => setStage({ w: node.clientWidth, h: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [zoomed]);

  /**
   * Стартовый масштаб. На десктопе открываем в реальном размере (1:1) —
   * так буквы читаются лучше всего. На телефоне 1:1 показал бы только центр
   * разворота, то есть пустой стык между страницами, поэтому там стартуем от
   * «вписано целиком», а крупный план включают кнопкой «Реальный размер»
   * или щипком.
   */
  useEffect(() => {
    if (!zoomed || startedRef.current || !stage.w || !stage.h) return;
    startedRef.current = true;
    setZoom(isCoarsePointer() ? fitZoom : 1);
    setOffset(NO_OFFSET);
  }, [zoomed, stage.w, stage.h, fitZoom]);

  /**
   * При ресайзе окна держим состояние согласованным: масштаб не опускаем
   * ниже «вписано», а сдвиг — в допустимых границах. Состояние трогаем
   * только при реальном изменении, чтобы не мешать перетаскиванию.
   */
  useEffect(() => {
    if (!zoomed || !startedRef.current || !stage.w || !stage.h) return;

    setZoom((current) => (current < fitZoom ? fitZoom : current));
    setOffset((current) => {
      const next = clampOffset(current.x, current.y, Math.max(zoom, fitZoom));
      const same = Math.abs(next.x - current.x) < 0.5 && Math.abs(next.y - current.y) < 0.5;
      return same ? current : next;
    });
  }, [zoomed, fitZoom, clampOffset, stage.w, stage.h, zoom]);

  // Клавиатура: Esc закрывает, стрелки листают, +/− масштаб, 0 — вписать
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!zoomed) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          prev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          next();
        }
        return;
      }
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          closeZoom();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          prev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          next();
          break;
        case '+':
        case '=':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
        case '_':
          event.preventDefault();
          zoomOut();
          break;
        case '0':
          event.preventDefault();
          showFit();
          break;
        case '1':
          event.preventDefault();
          showActual();
          break;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomed, closeZoom, prev, next, zoomIn, zoomOut, showFit, showActual]);

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

  /**
   * Колесо мыши меняет масштаб. Слушатель вешаем вручную с passive: false —
   * иначе preventDefault не сработает и начнёт масштабироваться вся страница.
   */
  useEffect(() => {
    if (!zoomed) return;
    const node = dialogRef.current;
    if (!node) return;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const step = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoom((current) => {
        const clamped = Math.min(MAX_ZOOM, Math.max(fitZoom, Number((current + step).toFixed(3))));
        setOffset((currentOffset) =>
          clamped <= fitZoom + 0.001 ? NO_OFFSET : clampOffset(currentOffset.x, currentOffset.y, clamped),
        );
        return clamped;
      });
    }
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [zoomed, fitZoom, clampOffset]);

  /**
   * Щипок двумя пальцами — мобильная замена колесу мыши. Слушатели вешаем
   * вручную с passive: false, иначе браузер заберёт жест себе и картинка
   * будет масштабировать всю страницу.
   *
   * Текущий масштаб читаем из ref: попади он в зависимости эффекта, слушатели
   * перерегистрировались бы на каждом движении пальца, и базовое расстояние
   * сбрасывалось бы посреди жеста.
   */
  useEffect(() => {
    if (!zoomed) return;
    const node = stageRef.current;
    if (!node) return;

    let baseDistance = 0;
    let baseZoom = 1;

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length !== 2) return;
      baseDistance = touchDistance(event.touches);
      baseZoom = zoomRef.current;
      dragRef.current = null;
      setDragging(false);
      event.preventDefault();
    }

    function onTouchMove(event: TouchEvent) {
      if (event.touches.length !== 2 || !baseDistance) return;
      event.preventDefault();
      const ratio = touchDistance(event.touches) / baseDistance;
      setZoom((current) => {
        const next = Math.min(MAX_ZOOM, Math.max(fitZoom, Number((baseZoom * ratio).toFixed(3))));
        if (Math.abs(next - current) < 0.001) return current;
        setOffset((currentOffset) =>
          next <= fitZoom + 0.001 ? NO_OFFSET : clampOffset(currentOffset.x, currentOffset.y, next),
        );
        return next;
      });
    }

    function onTouchEnd(event: TouchEvent) {
      if (event.touches.length < 2) baseDistance = 0;
    }

    node.addEventListener('touchstart', onTouchStart, { passive: false });
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    node.addEventListener('touchend', onTouchEnd);
    node.addEventListener('touchcancel', onTouchEnd);
    return () => {
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('touchend', onTouchEnd);
      node.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [zoomed, fitZoom, clampOffset]);

  /** Двигать есть смысл, только когда разворот больше области просмотра */
  const canDrag = zoom > fitZoom + 0.001;
  const atFit = zoom <= fitZoom + 0.001;
  const atActual = Math.abs(zoom - 1) < 0.005;

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // второй палец при щипке не должен начинать перетаскивание
    if (!canDrag || !event.isPrimary) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { px: event.clientX, py: event.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  }

  /**
   * Панорамирование без нажатия кнопки: если разворот больше области
   * просмотра, он плавно следует за курсором. Так всю картинку можно
   * посмотреть простым движением мышки, а не только перетаскиванием.
   * Коэффициент усиления помогает добраться до краёв, не уводя курсор
   * к самому краю экрана.
   */
  /**
   * Панорамирование без нажатия кнопки: когда разворот больше области
   * просмотра, он плавно едет за курсором. Так всю картинку можно
   * посмотреть простым движением мышки, без перетаскивания.
   *
   * В центральной зоне (DEAD_ZONE) картинка стоит на месте — иначе буквы
   * «плыли» бы под курсором и читать текст было бы невозможно. Реакция
   * включается только у краёв экрана и нарастает квадратично, поэтому
   * движение получается предсказуемым.
   */
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag) {
      setOffset(
        clampOffset(drag.ox + (event.clientX - drag.px), drag.oy + (event.clientY - drag.py), zoom),
      );
      return;
    }
    // Следящее движение — только для мыши, и только когда есть что двигать
    if (!canDrag || event.pointerType === 'touch') return;

    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width || !box.height) return;

    const maxX = Math.max(0, (natW * zoom - box.width) / 2);
    const maxY = Math.max(0, (natH * zoom - box.height) / 2);
    if (maxX <= 0 && maxY <= 0) return;

    const DEAD_ZONE = 0.55; // центральные 55% — картинка неподвижна
    const nx = (event.clientX - box.left - box.width / 2) / (box.width / 2);
    const ny = (event.clientY - box.top - box.height / 2) / (box.height / 2);

    /** 0 в мёртвой зоне, 0..1 у края, с плавным нарастанием */
    const ramp = (v: number) => {
      const t = (Math.abs(v) - DEAD_ZONE) / (1 - DEAD_ZONE);
      if (t <= 0) return 0;
      const clamped = Math.min(1, t);
      return -Math.sign(v) * clamped * clamped;
    };

    setOffset({ x: ramp(nx) * maxX, y: ramp(ny) * maxY });
  }

  function endDrag() {
    dragRef.current = null;
    setDragging(false);
  }
  /** Двойной клик переключает «вписано» ↔ 1:1 */
  function onDoubleClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (atFit) showActual();
    else showFit();
  }

  // Свайп по превью для мобильных
  function onTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const end = event.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < 40) return;
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
            width={natW}
            height={natH}
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

      {/* Лайтбокс: исходный файл, реальный размер, зум и перетаскивание */}
      {zoomed && (
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={alt(index)}
          className="fixed inset-0 z-50 flex flex-col bg-brand-ink/95"
        >
          {/* Панель управления */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 bg-brand-ink/85 px-3 py-2 text-white sm:gap-3 sm:px-4">
            <p className="text-sm font-semibold">
              {dict.about.galleryCounter} {index + 1} / {total}
              <span className="ml-2 font-normal text-white/70">{Math.round(zoom * 100)}%</span>
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={showFit}
                disabled={atFit}
                className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {dict.about.galleryFit}
              </button>
              <button
                type="button"
                onClick={showActual}
                disabled={atActual}
                className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {dict.about.galleryActual}
              </button>

              <span className="mx-0.5 hidden h-5 w-px bg-white/25 sm:block" aria-hidden="true" />

              <button
                type="button"
                onClick={zoomOut}
                disabled={atFit}
                aria-label={dict.about.galleryZoomOut}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg font-bold transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">−</span>
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                aria-label={dict.about.galleryZoomIn}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg font-bold transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">+</span>
              </button>
              <button
                type="button"
                onClick={closeZoom}
                aria-label={dict.about.galleryClose}
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl font-bold transition hover:bg-white/25"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>

          {/*
            Область просмотра. Картинка позиционируется абсолютно по центру
            (margin = половина натурального размера), поэтому увеличение
            и сдвиг не «съедают» её края, как это бывает при flex-центрировании.
            Закрытие — только по крестику или Esc: при панорамировании клик
            по фону слишком легко срабатывает случайно.

            touch-none обязателен: без него браузер на тач-экране забирает
            жест себе, прерывает pointer-последовательность (pointercancel),
            и разворот не двигается за пальцем.
          */}
          <div
            ref={stageRef}
            className="relative min-h-0 flex-1 touch-none overflow-hidden"
            style={{ cursor: canDrag ? (dragging ? 'grabbing' : 'grab') : 'default' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={onDoubleClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current}
              alt={alt(index)}
              width={natW}
              height={natH}
              draggable={false}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: -natW / 2,
                marginTop: -natH / 2,
                width: natW,
                height: natH,
                transformOrigin: 'center center',
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: dragging ? 'none' : 'transform 120ms ease-out',
              }}
              className="touch-none select-none rounded-lg"
            />
          </div>

          {/* Подсказка + переключение разворотов */}
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-4 px-3 pb-3">
            <p className="order-last w-full text-center text-xs text-white/60 sm:order-none sm:w-auto">
              {dict.about.galleryDragHint}
            </p>
            {total > 1 && (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}