/** Общие настройки сайта / Site-wide constants */

export const SITE = {
  authorSite: 'https://agacher.com/',
  contactEmail: 'info@agacher.com',
  telegram: 'https://t.me/agacher',
  pdfFragment: '/files/bilingual-golden-bean-fragment.pdf',
  seriesSize: 7,
} as const;

export const LEAD_STATUSES = [
  'new',
  'in_progress',
  'contacted',
  'confirmed',
  'cancelled',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}

/** Простая, но достаточно строгая проверка email */
export const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const LIMITS = {
  name: 120,
  email: 254,
  comment: 2000,
  notes: 4000,
} as const;
