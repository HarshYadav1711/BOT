import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { AppError } from './errors';

export const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const MAX_BODY_BYTES = 64 * 1024;

export function jsonResponse(statusCode: number, payload: unknown): HandlerResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
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
