import { NextResponse } from 'next/server';

import { isAuthenticated } from '@/lib/auth';
import { leadsToCsv } from '@/lib/store';
import { isLeadStatus, type LeadStatus } from '@/lib/config';
import { isLocale, type Locale } from '@/lib/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/leads/export — выгрузка заявок в CSV (только CRM) */
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const localeParam = url.searchParams.get('locale');

  const status: LeadStatus | 'all' =
    statusParam && isLeadStatus(statusParam) ? statusParam : 'all';
  const locale: Locale | 'all' = localeParam && isLocale(localeParam) ? localeParam : 'all';

  const csv = await leadsToCsv({
    search: url.searchParams.get('search') ?? undefined,
    status,
    locale,
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
    limit: Number.MAX_SAFE_INTEGER,
  });

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="romka-leads-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
