import { createHash, randomBytes } from 'node:crypto';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const ADMIN_SESSION_COOKIE = 'ucer_admin_session';

export function getSessionTtlMs(): number {
  return SESSION_TTL_MS;
}

/** Generate a high-entropy opaque session token (returned to client once). */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Hash a session token for DB storage (never store the raw token). */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function sessionExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + SESSION_TTL_MS);
}

function shouldUseSecureCookie(): boolean {
  // Prefer Secure on Netlify/production; allow override for local HTTP tooling.
  if (process.env.ADMIN_COOKIE_SECURE === 'false') return false;
  if (process.env.ADMIN_COOKIE_SECURE === 'true') return true;
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.CONTEXT === 'production' ||
    process.env.NETLIFY === 'true'
  );
}

/** HttpOnly session cookie (raw token; DB stores only the hash). */
export function buildAdminSessionCookie(token: string, expiresAt: Date): string {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  const parts = [
    `${ADMIN_SESSION_COOKIE}=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (shouldUseSecureCookie()) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function buildClearAdminSessionCookie(): string {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (shouldUseSecureCookie()) {
    parts.push('Secure');
  }
  return parts.join('; ');
}
