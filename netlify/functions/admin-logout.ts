import type { Handler, HandlerResponse } from '@netlify/functions';
import { revokeAdminSession } from '../lib/adminAuth';
import { AppError, toPublicErrorResponse } from '../lib/errors';
import { extractBearerToken, jsonResponse, parseJsonBody } from '../lib/http';

/**
 * POST /.netlify/functions/admin-logout
 * Revokes the current session (Authorization: Bearer <token> or JSON { token }).
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: { code: 'INVALID_INPUT', message: 'Method Not Allowed' },
    });
  }

  try {
    let token = extractBearerToken(event);

    if (!token && event.body) {
      const body = parseJsonBody(event);
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        const maybe = (body as Record<string, unknown>).token;
        if (typeof maybe === 'string' && maybe.trim()) {
          token = maybe.trim();
        }
      }
    }

    if (!token) {
      throw new AppError('UNAUTHORIZED', 'Authentication required.', 401);
    }

    await revokeAdminSession(token);
    return jsonResponse(200, { ok: true });
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
