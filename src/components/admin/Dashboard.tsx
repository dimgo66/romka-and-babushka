'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Dict } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/config';

type Lead = {
  id: string;
  name: string;
  email: string;
  comment: string | null;
  locale: Locale;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  source: string | null;
};

type Stats = {
  total: number;
  last7days: number;
  byStatus: Record<LeadStatus, number>;
  byLocale: Record<Locale, number>;
};

type Filters = {
  search: string;
  status: LeadStatus | 'all';
  locale: Locale | 'all';
  from: string;
  to: string;
};

const EMPTY_FILTERS: Filters = { search: '', status: 'all', locale: 'all', from: '', to: '' };

export function Dashboard({ dict, locale }: { dict: Dict; locale: Locale }) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (applied.search.trim()) params.set('search', applied.search.trim());
    if (applied.status !== 'all') params.set('status', applied.status);
    if (applied.locale !== 'all') params.set('locale', applied.locale);
    if (applied.from) params.set('from', applied.from);
    if (applied.to) params.set('to', applied.to);
    return params.toString();
  }, [applied]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/leads?${queryString}`, { cache: 'no-store' });
      if (response.status === 401) {
        router.refresh();
        return;
      }
      const data = (await response.json()) as { ok: boolean; leads?: Lead[]; stats?: Stats };
      if (!data.ok) throw new Error('request failed');
      setLeads(data.leads ?? []);
      setStats(data.stats ?? null);
    } catch {
      setError(dict.form.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [dict.form.errors.generic, queryString, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchLead(id: string, patch: Partial<Pick<Lead, 'status' | 'notes'>>) {
    const response = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      setError(dict.form.errors.generic);
      return;
    }
    const data = (await response.json()) as { ok: boolean; lead?: Lead };
    if (data.lead) {
      setLeads((current) => current.map((lead) => (lead.id === data.lead!.id ? data.lead! : lead)));
      void load();
    }
  }

  async function removeLead(id: string) {
    if (!window.confirm(dict.admin.actions.confirmDelete)) return;
    const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setError(dict.form.errors.generic);
      return;
    }
    setLeads((current) => current.filter((lead) => lead.id !== id));
    setOpenId(null);
    void load();
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="heading-lg">{dict.admin.dashboard}</h1>
        <div className="flex items-center gap-2">
          <a
            className="btn-ghost"
            href={`/api/leads/export${queryString ? `?${queryString}` : ''}`}
            download
          >
            {dict.admin.filters.export}
          </a>
          <button type="button" onClick={signOut} className="btn-ghost">
            {dict.admin.signOut}
          </button>
        </div>
      </div>

      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
              {dict.admin.stats.total}
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold text-brand-ink">{stats.total}</p>
          </article>
          <article className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
              {dict.admin.stats.last7days}
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold text-brand-green-dark">
              {stats.last7days}
            </p>
          </article>
          <article className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
              {dict.admin.stats.byStatus}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-ink-soft">
              {LEAD_STATUSES.map((status) => (
                <li key={status} className="flex items-center justify-between gap-2">
                  <span>{dict.admin.statuses[status]}</span>
                  <span className="font-semibold text-brand-ink">{stats.byStatus[status] ?? 0}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
              {dict.admin.stats.byLanguage}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-ink-soft">
              <li className="flex items-center justify-between gap-2">
                <span>RU</span>
                <span className="font-semibold text-brand-ink">{stats.byLocale.ru ?? 0}</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span>EN</span>
                <span className="font-semibold text-brand-ink">{stats.byLocale.en ?? 0}</span>
              </li>
            </ul>
          </article>
        </div>
      )}

      <form
        className="card mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault();
          setApplied(filters);
        }}
      >
        <div className="lg:col-span-2">
          <label className="label" htmlFor="f-search">
            {dict.admin.filters.search}
          </label>
          <input
            id="f-search"
            className="field"
            value={filters.search}
            placeholder={dict.admin.filters.searchPlaceholder}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="f-status">
            {dict.admin.filters.status}
          </label>
          <select
            id="f-status"
            className="field"
            value={filters.status}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value as Filters['status'] })
            }
          >
            <option value="all">{dict.admin.filters.all}</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {dict.admin.statuses[status]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-locale">
            {dict.admin.filters.locale}
          </label>
          <select
            id="f-locale"
            className="field"
            value={filters.locale}
            onChange={(event) =>
              setFilters({ ...filters, locale: event.target.value as Filters['locale'] })
            }
          >
            <option value="all">{dict.admin.filters.all}</option>
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-from">
            {dict.admin.filters.from}
          </label>
          <input
            id="f-from"
            type="date"
            className="field"
            value={filters.from}
            onChange={(event) => setFilters({ ...filters, from: event.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="f-to">
            {dict.admin.filters.to}
          </label>
          <input
            id="f-to"
            type="date"
            className="field"
            value={filters.to}
            onChange={(event) => setFilters({ ...filters, to: event.target.value })}
          />
        </div>

        <div className="flex items-end gap-2 lg:col-span-6">
          <button type="submit" className="btn-primary">
            {dict.admin.filters.apply}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setApplied(EMPTY_FILTERS);
            }}
          >
            {dict.admin.filters.reset}
          </button>
          <button type="button" className="btn-ghost" onClick={() => void load()}>
            ↻
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="card mt-6 overflow-x-auto p-0">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-brand-beige-dark bg-brand-beige/70 text-left text-xs uppercase tracking-wide text-brand-ink-soft">
              <th className="px-4 py-3">{dict.admin.table.name}</th>
              <th className="px-4 py-3">{dict.admin.table.email}</th>
              <th className="px-4 py-3">{dict.admin.table.locale}</th>
              <th className="px-4 py-3">{dict.admin.table.createdAt}</th>
              <th className="px-4 py-3">{dict.admin.table.status}</th>
              <th className="px-4 py-3">{dict.admin.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-ink-soft">
                  …
                </td>
              </tr>
            )}

            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-ink-soft">
                  {dict.admin.table.empty}
                </td>
              </tr>
            )}

            {leads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                dict={dict}
                locale={locale}
                open={openId === lead.id}
                onToggle={() => setOpenId(openId === lead.id ? null : lead.id)}
                onPatch={patchLead}
                onDelete={removeLead}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type RowProps = {
  lead: Lead;
  dict: Dict;
  locale: Locale;
  open: boolean;
  onToggle: () => void;
  onPatch: (id: string, patch: Partial<Pick<Lead, 'status' | 'notes'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function LeadRow({ lead, dict, locale, open, onToggle, onPatch, onDelete }: RowProps) {
  const [notes, setNotes] = useState(lead.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveNotes() {
    setSaving(true);
    await onPatch(lead.id, { notes });
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <>
      <tr className="border-b border-brand-beige-dark/60 align-top">
        <td className="px-4 py-3 font-semibold text-brand-ink">
          {lead.name}
          {lead.comment && (
            <span className="mt-0.5 block max-w-xs truncate text-xs font-normal text-brand-ink-soft">
              {lead.comment}
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <a href={`mailto:${lead.email}`} className="link-underline">
            {lead.email}
          </a>
        </td>
        <td className="px-4 py-3 uppercase text-brand-ink-soft">{lead.locale}</td>
        <td className="px-4 py-3 whitespace-nowrap text-brand-ink-soft">
          {new Date(lead.createdAt).toLocaleString(locale === 'en' ? 'en-GB' : 'ru-RU')}
        </td>
        <td className="px-4 py-3">
          <select
            value={lead.status}
            aria-label={dict.admin.table.status}
            onChange={(event) => void onPatch(lead.id, { status: event.target.value as LeadStatus })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle(lead.status)}`}
          >
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {dict.admin.statuses[status]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onToggle} className="text-xs font-semibold text-brand-orange-dark underline underline-offset-2">
              {open ? dict.admin.actions.close : dict.admin.actions.edit}
            </button>
            <button
              type="button"
              onClick={() => void onDelete(lead.id)}
              className="text-xs font-semibold text-red-600 underline underline-offset-2"
            >
              {dict.admin.actions.delete}
            </button>
          </div>
        </td>
      </tr>

      {open && (
        <tr className="border-b border-brand-beige-dark/60 bg-brand-beige/40">
          <td colSpan={6} className="px-4 py-4">
            <label className="label" htmlFor={`notes-${lead.id}`}>
              {dict.admin.table.notes}
            </label>
            <textarea
              id={`notes-${lead.id}`}
              rows={3}
              className="field resize-y"
              placeholder={dict.admin.notesPlaceholder}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            {lead.comment && (
              <p className="mt-3 whitespace-pre-line rounded-xl bg-white/80 px-4 py-3 text-sm text-brand-ink-soft">
                {lead.comment}
              </p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <button type="button" onClick={() => void saveNotes()} disabled={saving} className="btn-primary disabled:opacity-70">
                {saving ? dict.admin.actions.saving : dict.admin.actions.save}
              </button>
              {saved && <span className="text-xs font-semibold text-brand-green-dark">{dict.admin.actions.saved}</span>}
              <span className="text-xs text-brand-ink-soft">ID: {lead.id}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function statusStyle(status: LeadStatus): string {
  switch (status) {
    case 'new':
      return 'border-brand-orange bg-brand-orange/15 text-brand-orange-dark';
    case 'in_progress':
      return 'border-amber-400 bg-amber-50 text-amber-700';
    case 'contacted':
      return 'border-sky-400 bg-sky-50 text-sky-700';
    case 'confirmed':
      return 'border-brand-green bg-brand-green/15 text-brand-green-dark';
    case 'cancelled':
      return 'border-gray-300 bg-gray-100 text-gray-500';
    default:
      return 'border-brand-sand bg-white text-brand-ink-soft';
  }
}
