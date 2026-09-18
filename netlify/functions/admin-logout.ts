import type { Handler, HandlerResponse } from '@netlify/functions';
import { revokeAdminSession } from '../lib/adminAuth';
import { toPublicErrorResponse } from '../lib/errors';
import { extractSessionToken, jsonResponse } from '../lib/http';
import { buildClearAdminSessionCookie } from '../lib/session';

/**
 * POST /.netlify/functions/admin-logout
 * Revokes the session and clears the HttpOnly cookie.
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: { code: 'INVALID_INPUT', message: 'Method Not Allowed' },
    });
  }

  try {
    const token = extractSessionToken(event);
    if (token) {
      await revokeAdminSession(token);
    }

    return jsonResponse(
      200,
      { ok: true },
      { 'Set-Cookie': buildClearAdminSessionCookie() }
    );
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body, {
      'Set-Cookie': buildClearAdminSessionCookie(),
    });
  }
};
