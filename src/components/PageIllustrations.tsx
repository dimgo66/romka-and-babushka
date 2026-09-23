import Image from 'next/image';

import type { Dict } from '@/lib/dictionaries';
import { PAGE_ILLUSTRATIONS } from '@/lib/config';

type Props = {
  dict: Dict;
};

/**
 * Галерея разворотов книги: три широких иллюстрации (1615×808).
 * На мобильных — горизонтальная прокрутка, на десктопе — сетка из трёх колонок.
 */
export function PageIllustrations({ dict }: Props) {
  return (
    <div className="mt-8">
      <h3 className="font-display text-base font-bold text-brand-ink">{dict.about.illustrationsTitle}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-brand-ink-soft">{dict.about.illustrationsNote}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {PAGE_ILLUSTRATIONS.map((src, index) => (
          <figure
            key={src}
            className="overflow-hidden rounded-xl2 border border-brand-beige-dark bg-white/70 p-1.5 shadow-soft"
          >
            <Image
              src={src}
              alt={dict.about.illustrationsAlt[index] ?? dict.about.illustrationsTitle}
              width={1615}
              height={808}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 30vw"
              className="h-auto w-full rounded-lg object-cover"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
