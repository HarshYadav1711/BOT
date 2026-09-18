import type { Handler, HandlerResponse } from '@netlify/functions';
import { authenticateAdmin } from '../lib/adminAuth';
import { toPublicErrorResponse } from '../lib/errors';
import { jsonResponse, parseJsonBody } from '../lib/http';
import { buildAdminSessionCookie } from '../lib/session';

/**
 * POST /.netlify/functions/admin-login
 * Sets an HttpOnly session cookie and returns non-sensitive session metadata.
 * Frontend is not wired to this endpoint yet.
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: { code: 'INVALID_INPUT', message: 'Method Not Allowed' },
    });
  }

  try {
    const body = parseJsonBody(event);
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return jsonResponse(400, {
        error: { code: 'INVALID_INPUT', message: 'Invalid login payload.' },
      });
    }

    const { username, password } = body as Record<string, unknown>;
    const result = await authenticateAdmin(username, password);
    const expiresAt = new Date(result.expiresAt);

    return jsonResponse(
      200,
      {
        ok: true,
        expiresAt: result.expiresAt,
        username: result.username,
      },
      {
        'Set-Cookie': buildAdminSessionCookie(result.token, expiresAt),
      }
    );
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
