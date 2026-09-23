'use client';

/**
 * Помощник для целей Яндекс.Метрики.
 * Если счётчик не установлен (NEXT_PUBLIC_YANDEX_METRIKA_ID пуст),
 * вызовы становятся безопасными no-op.
 */

declare global {
  interface Window {
    ym?: (counterId: number, action: string, goal?: string, params?: Record<string, unknown>) => void;
  }
}

export const METRIKA_GOALS = {
  /** Отправка формы предзаказа */
  formSubmit: 'lead_form_submit',
  /** Успешная отправка (сервер подтвердил) */
  formSuccess: 'lead_form_success',
  /** Клик по кнопке «Оставить заявку» */
  ctaOrder: 'cta_order_click',
  /** Клик по ссылке на VK Video или YouTube */
  videoClick: 'video_click',
  /** Переключение площадки просмотра (VK / YouTube) */
  platformSwitch: 'platform_switch',
  /** Клик по кнопке «Слушать рассказы» */
  ctaListen: 'cta_listen_click',
  /** Переключение языка */
  languageSwitch: 'language_switch',
  /** Открытие плеера внутри карточки рассказа */
  playerOpen: 'story_player_open',
} as const;

export type MetrikaGoal = (typeof METRIKA_GOALS)[keyof typeof METRIKA_GOALS];

function counterId(): number | null {
  const raw = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (!raw) return null;
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function reachGoal(goal: MetrikaGoal | string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const id = counterId();
  if (!id || typeof window.ym !== 'function') return;
  try {
    window.ym(id, 'reachGoal', goal, params);
  } catch {
    /* аналитика не должна ломать интерфейс */
  }
}

/** Навигация по якорю + цель Метрики */
export function scrollToSection(id: string, goal?: MetrikaGoal): void {
  if (goal) reachGoal(goal);
  if (typeof document === 'undefined') return;
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Обновляем адресную строку без прыжка страницы
  if (typeof history !== 'undefined') {
    history.replaceState(null, '', `#${id}`);
  }
  target.focus?.({ preventScroll: true });
}
