import type { Handler, HandlerResponse } from '@netlify/functions';
import { authenticateAdmin } from '../lib/adminAuth';
import { toPublicErrorResponse } from '../lib/errors';
import { jsonResponse, parseJsonBody } from '../lib/http';

/**
 * POST /.netlify/functions/admin-login
 *
 * Authenticates with username/password, bootstraps initial admin from env if needed,
 * and returns an opaque session token (DB stores only the token hash).
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

    return jsonResponse(200, {
      ok: true,
      token: result.token,
      expiresAt: result.expiresAt,
      username: result.username,
    });
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
