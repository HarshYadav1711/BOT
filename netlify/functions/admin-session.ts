import type { Handler, HandlerResponse } from '@netlify/functions';
import { resolveAdminSession } from '../lib/adminAuth';
import { toPublicErrorResponse } from '../lib/errors';
import { extractBearerToken, jsonResponse } from '../lib/http';

/**
 * GET /.netlify/functions/admin-session
 * Validates Bearer session token and returns non-sensitive admin identity.
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return jsonResponse(405, {
      error: { code: 'INVALID_INPUT', message: 'Method Not Allowed' },
    });
  }

  try {
    const session = await resolveAdminSession(extractBearerToken(event));
    return jsonResponse(200, {
      ok: true,
      username: session.username,
      expiresAt: session.expiresAt,
    });
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
