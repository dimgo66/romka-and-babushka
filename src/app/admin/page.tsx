import Link from 'next/link';
import { cookies } from 'next/headers';

import { isAuthenticated } from '@/lib/auth';
import { LOCALE_COOKIE, normalizeLocale } from '@/lib/i18n';
import { getDict } from '@/lib/dictionaries';
import { storageKind } from '@/lib/store';
import { LoginForm } from '@/components/admin/LoginForm';
import { Dashboard } from '@/components/admin/Dashboard';
import { CatMark } from '@/components/Header';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  const dict = getDict(locale);
  const authenticated = await isAuthenticated();

  return (
    <div className="container-page py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <CatMark className="h-8 w-8 shrink-0" />
          <span className="font-display text-sm font-extrabold text-brand-ink">
            {locale === 'en'
              ? 'Stories About Romka and His Grandmother'
              : 'Рассказы о Ромке и его бабушке'}{' '}
            · CRM
          </span>
        </Link>
        <span className="chip">
          {storageKind() === 'postgres' ? 'PostgreSQL' : 'local JSON (dev)'}
        </span>
      </header>

      {authenticated ? (
        <Dashboard dict={dict} locale={locale} />
      ) : (
        <div className="mx-auto mt-12 max-w-md">
          <LoginForm dict={dict} />
        </div>
      )}
    </div>
  );
}
