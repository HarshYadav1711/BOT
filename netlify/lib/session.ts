import { createHash, randomBytes } from 'node:crypto';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
