import { NextResponse } from 'next/server';

import { createToken, sessionCookieOptions, verifyCredentials } from '@/lib/auth';
import { clientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/auth/login — вход администратора CRM */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`login:${ip}`, 8, 5 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'rateLimited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalidJson' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'invalidCredentials' }, { status: 401 });
  }

  const user = verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'invalidCredentials' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, email: user.email });
  response.cookies.set({ ...sessionCookieOptions, value: createToken(user.email) });
  return response;
}
