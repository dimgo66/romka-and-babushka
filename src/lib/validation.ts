import { EMAIL_RE, LIMITS, isLeadStatus, type LeadStatus } from './config';
import { isLocale, type Locale } from './i18n';

export type LeadInput = {
  name: string;
  email: string;
  comment: string | null;
  locale: Locale;
  source: string | null;
};

export type ValidationResult =
  | { ok: true; value: LeadInput }
  | { ok: false; fieldErrors: Record<string, string> };

/** Коды ошибок совпадают с ключами dict.form.errors на клиенте */
export function validateLeadInput(payload: unknown): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const body = (payload ?? {}) as Record<string, unknown>;

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const rawComment = typeof body.comment === 'string' ? body.comment.trim() : '';
  const source = typeof body.source === 'string' ? body.source.slice(0, 200) : null;

  if (!name) fieldErrors.name = 'nameRequired';
  else if (name.length > LIMITS.name) fieldErrors.name = 'nameTooLong';

  if (!email) fieldErrors.email = 'emailRequired';
  else if (!EMAIL_RE.test(email) || email.length > LIMITS.email) fieldErrors.email = 'emailInvalid';

  if (rawComment.length > LIMITS.comment) fieldErrors.comment = 'commentTooLong';

  if (!body.consent) fieldErrors.consent = 'consentRequired';

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    value: {
      name,
      email,
      comment: rawComment || null,
      locale: isLocale(body.locale) ? body.locale : 'ru',
      source,
    },
  };
}

export function validateStatus(value: unknown): LeadStatus | null {
  return isLeadStatus(value) ? value : null;
}
