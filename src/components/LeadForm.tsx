'use client';

import { useState } from 'react';

import type { Dict } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { LIMITS } from '@/lib/config';
import { EMAIL_RE } from '@/lib/config';
import { STORIES, storyTitle } from '@/lib/stories';
import { METRIKA_GOALS, reachGoal } from '@/lib/metrika';

type Props = {
  locale: Locale;
  dict: Dict;
};

type FieldErrors = Partial<Record<'name' | 'email' | 'comment' | 'consent' | 'form', string>>;

export function LeadForm({ locale, dict }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');

  function toggleStory(order: number) {
    setPicked((current) =>
      current.includes(order) ? current.filter((value) => value !== order) : [...current, order],
    );
  }

  function buildComment(): string {
    const parts: string[] = [];
    if (picked.length > 0) {
      const titles = picked
        .sort((a, b) => a - b)
        .map((order) => {
          const story = STORIES.find((item) => item.order === order);
          return story ? `${order}. ${storyTitle(story, locale)}` : String(order);
        });
      parts.push(`${dict.form.selectedStories}: ${titles.join('; ')}`);
    }
    if (comment.trim()) parts.push(comment.trim());
    return parts.join('\n\n');
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) next.name = dict.form.errors.nameRequired;
    else if (trimmedName.length > LIMITS.name) next.name = dict.form.errors.nameTooLong;

    if (!trimmedEmail) next.email = dict.form.errors.emailRequired;
    else if (!EMAIL_RE.test(trimmedEmail) || trimmedEmail.length > LIMITS.email)
      next.email = dict.form.errors.emailInvalid;

    if (comment.trim().length > LIMITS.comment) next.comment = dict.form.errors.commentTooLong;
    if (!consent) next.consent = dict.form.errors.consentRequired;

    return next;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      const firstKey = ['name', 'email', 'comment', 'consent'].find((key) => key in validation);
      document.getElementById(`lead-${firstKey}`)?.focus();
      return;
    }

    setState('sending');
    reachGoal(METRIKA_GOALS.formSubmit, { locale, stories: picked.length });

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          comment: buildComment() || null,
          locale,
          consent: true,
          // honeypot: у людей это поле всегда пустое
          website: honeypot,
        }),
      });

      if (response.status === 429) {
        setErrors({ form: dict.form.errors.rateLimited });
        setState('idle');
        return;
      }

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok || !data.ok) {
        if (data.fieldErrors) {
          setErrors(
            Object.fromEntries(
              Object.entries(data.fieldErrors).map(([key, value]) => [
                key,
                dict.form.errors[value as keyof Dict['form']['errors']] ?? value,
              ]),
            ) as FieldErrors,
          );
        } else {
          setErrors({ form: dict.form.errors.generic });
        }
        setState('idle');
        return;
      }

      reachGoal(METRIKA_GOALS.formSuccess, { locale, stories: picked.length });
      setState('done');
      setName('');
      setEmail('');
      setComment('');
      setPicked([]);
      setConsent(false);
    } catch {
      setErrors({ form: dict.form.errors.network });
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <section id="order" tabIndex={-1} className="section">
        <div className="container-page">
          <div
            role="status"
            aria-live="polite"
            className="mx-auto max-w-2xl rounded-xl2 border border-brand-green/40 bg-white/90 p-8 text-center shadow-card"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/15 text-2xl">
              ✓
            </div>
            <h2 className="heading-lg mt-4">{dict.form.successTitle}</h2>
            <p className="prose-warm mt-2">{dict.form.successBody}</p>
            <button type="button" onClick={() => setState('idle')} className="btn-ghost mt-6">
              {dict.form.successAgain}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="order" tabIndex={-1} className="section">
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">{dict.nav.order}</p>
          <h2 className="heading-lg mt-3">{dict.form.heading}</h2>
          <p className="prose-warm mt-3">{dict.form.subheading}</p>

          <form onSubmit={onSubmit} noValidate className="card mt-6 grid gap-5 p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="lead-name">
                  {dict.form.name} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="lead-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={LIMITS.name}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={dict.form.namePlaceholder}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'lead-name-error' : undefined}
                  className={`field ${errors.name ? 'field-error' : ''}`}
                />
                {errors.name && (
                  <p id="lead-name-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="lead-email">
                  {dict.form.email} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="lead-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  maxLength={LIMITS.email}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={dict.form.emailPlaceholder}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'lead-email-error' : undefined}
                  className={`field ${errors.email ? 'field-error' : ''}`}
                />
                {errors.email && (
                  <p id="lead-email-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <fieldset>
              <legend className="label">{dict.form.selectedStories}</legend>
              <ul className="flex flex-wrap gap-2">
                {STORIES.map((story) => {
                  const active = picked.includes(story.order);
                  return (
                    <li key={story.order}>
                      <button
                        type="button"
                        onClick={() => toggleStory(story.order)}
                        aria-pressed={active}
                        title={storyTitle(story, locale)}
                        className={[
                          'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
                          active
                            ? 'border-brand-green bg-brand-green text-white'
                            : 'border-brand-sand bg-white text-brand-ink-soft hover:border-brand-orange',
                        ].join(' ')}
                      >
                        {story.order}
                      </button>
                    </li>
                  );
                })}
                {picked.length > 0 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setPicked([])}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-brand-ink-soft underline underline-offset-2"
                    >
                      {dict.form.clearSelection}
                    </button>
                  </li>
                )}
              </ul>
            </fieldset>

            <div>
              <label className="label" htmlFor="lead-comment">
                {dict.form.comment}
              </label>
              <textarea
                id="lead-comment"
                name="comment"
                rows={4}
                maxLength={LIMITS.comment}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={dict.form.commentPlaceholder}
                aria-invalid={Boolean(errors.comment)}
                className={`field resize-y ${errors.comment ? 'field-error' : ''}`}
              />
              {errors.comment && (
                <p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.comment}
                </p>
              )}
            </div>

            {/* Honeypot: скрыто от людей, заполняется только ботами */}
            <div className="hp-field" aria-hidden="true">
              <label htmlFor="lead-website">Website</label>
              <input
                id="lead-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-ink-soft">
                <input
                  id="lead-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-sand text-brand-green focus:ring-brand-green"
                />
                <span>
                  {dict.form.consentPrefix}{' '}
                  <a href="/privacy" className="link-underline" target="_blank" rel="noopener noreferrer">
                    {dict.form.consentLink}
                  </a>{' '}
                  {dict.form.consentSuffix}
                </span>
              </label>
              {errors.consent && (
                <p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.consent}
                </p>
              )}
            </div>

            {errors.form && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errors.form}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" disabled={state === 'sending'} className="btn-primary disabled:opacity-70">
                {state === 'sending' ? dict.form.submitting : dict.form.submit}
              </button>
              <p className="text-xs text-brand-ink-soft">
                {dict.form.requiredHint} {dict.form.privacyNote}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
