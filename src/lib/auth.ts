import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * Простая JWT-авторизация CRM на HMAC-SHA256 — без внешних зависимостей.
 * Учётные данные администраторов берутся из переменной ADMIN_CREDENTIALS
 * в формате «email:пароль» (несколько записей — через «;»).
 * Пароль может быть указан как открытым текстом, так и в виде хеша
 * sha256:<hex> — второй вариант предпочтителен в продакшене.
 */

export const SESSION_COOKIE = 'romka_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 часов

export type SessionPayload = {
  email: string;
  iat: number;
  exp: number;
};

export type AdminUser = { email: string; password: string };

function secret(): string {
  const value = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!value || value.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET не задан или слишком короткий (минимум 16 символов)');
    }
    return 'insecure-development-secret-do-not-use-in-production';
  }
  return value;
}

export function adminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_CREDENTIALS ?? '';
  return raw
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const index = entry.indexOf(':');
      if (index === -1) return { email: entry.toLowerCase(), password: '' };
      return {
        email: entry.slice(0, index).trim().toLowerCase(),
        password: entry.slice(index + 1).trim(),
      };
    })
    .filter((user) => user.email.length > 0 && user.password.length > 0);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Выравниваем длину, чтобы сравнение не выдавало длину секрета
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

export function verifyCredentials(email: string, password: string): AdminUser | null {
  const normalized = email.trim().toLowerCase();
  const user = adminUsers().find((candidate) => candidate.email === normalized);
  if (!user) return null;

  const expected = user.password;
  const ok = expected.startsWith('sha256:')
    ? timingSafeEqual(sha256(password), expected.slice('sha256:'.length).toLowerCase())
    : timingSafeEqual(password, expected);

  return ok ? user : null;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(data: string): string {
  return crypto.createHmac('sha256', secret()).update(data).digest('base64url');
}

export function createToken(email: string): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({ email, iat: issuedAt, exp: issuedAt + SESSION_TTL_SECONDS } satisfies SessionPayload),
  );
  const body = `${header}.${payload}`;
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;

  let expected: string;
  try {
    expected = sign(`${header}.${payload}`);
  } catch {
    return null;
  }
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionPayload;
    if (!decoded.email || typeof decoded.exp !== 'number') return null;
    if (decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

/** Текущая сессия администратора (только на сервере) */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

export const sessionCookieOptions = {
  name: SESSION_COOKIE,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
