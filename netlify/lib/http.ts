import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { resolveAdminSession, type AdminSessionInfo } from './adminAuth';
import { AppError } from './errors';
import { ADMIN_SESSION_COOKIE } from './session';

export const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const MAX_BODY_BYTES = 64 * 1024;

export function jsonResponse(
  statusCode: number,
  payload: unknown,
  extraHeaders?: Record<string, string>
): HandlerResponse {
  return {
    statusCode,
    headers: {
      ...JSON_HEADERS,
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  };
}

export function parseJsonBody(event: HandlerEvent): unknown {
  if (event.body == null || event.body === '') {
    throw new AppError('INVALID_INPUT', 'Request body is required.', 400);
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    throw new AppError('INVALID_INPUT', 'Request body is too large.', 413);
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new AppError('INVALID_INPUT', 'Request body must be valid JSON.', 400);
  }
}

/** Extract Bearer token from Authorization header. */
export function extractBearerToken(event: HandlerEvent): string | null {
  const header = event.headers.authorization || event.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

/** Prefer HttpOnly cookie; fall back to Bearer for tooling. */
export function extractSessionToken(event: HandlerEvent): string | null {
  const cookieHeader = event.headers.cookie || event.headers.Cookie;
  const cookies = parseCookieHeader(
    typeof cookieHeader === 'string' ? cookieHeader : undefined
  );
  const fromCookie = cookies[ADMIN_SESSION_COOKIE]?.trim();
  if (fromCookie) return fromCookie;

  return extractBearerToken(event);
}

/** Require a valid admin session — never trust frontend flags. */
export async function requireAdminSession(
  event: HandlerEvent
): Promise<AdminSessionInfo> {
  return resolveAdminSession(extractSessionToken(event));
}
