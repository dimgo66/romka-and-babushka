'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { Dict } from '@/lib/dictionaries';

export function LoginForm({ dict }: { dict: Dict }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.refresh();
        return;
      }

      setError(response.status === 429 ? dict.form.errors.rateLimited : dict.admin.invalidCredentials);
    } catch {
      setError(dict.form.errors.network);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-5 p-6 sm:p-8">
      <div>
        <h1 className="heading-lg">{dict.admin.loginTitle}</h1>
        <p className="mt-2 text-sm text-brand-ink-soft">{dict.admin.loginSubtitle}</p>
      </div>

      <div>
        <label className="label" htmlFor="admin-email">
          {dict.admin.email}
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="admin-password">
          {dict.admin.password}
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="field"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary disabled:opacity-70">
        {busy ? dict.admin.signingIn : dict.admin.signIn}
      </button>

      <p className="text-xs leading-relaxed text-brand-ink-soft">
        {dict.admin.email}: <code>ADMIN_CREDENTIALS</code> · {dict.admin.password}: <code>AUTH_SECRET</code>
      </p>
    </form>
  );
}
