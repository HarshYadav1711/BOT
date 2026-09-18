import type { Handler, HandlerResponse } from '@netlify/functions';
import { updateAdminCredentials } from '../lib/adminAuth';
import { AppError, toPublicErrorResponse } from '../lib/errors';
import { jsonResponse, parseJsonBody, requireAdminSession } from '../lib/http';
import { buildClearAdminSessionCookie } from '../lib/session';

/**
 * POST /.netlify/functions/admin-credentials
 * Body: { username, password }
 * Updates the authenticated admin's credentials and revokes sessions.
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: { code: 'INVALID_INPUT', message: 'Method Not Allowed' },
    });
  }

  try {
    const session = await requireAdminSession(event);
    const raw = parseJsonBody(event);
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new AppError('INVALID_INPUT', 'Invalid credentials payload.', 400);
    }

    const body = raw as Record<string, unknown>;
    const username = typeof body.username === 'string' ? body.username : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const result = await updateAdminCredentials(session.adminUserId, username, password);

    return jsonResponse(
      200,
      { ok: true, username: result.username },
      { 'Set-Cookie': buildClearAdminSessionCookie() }
    );
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
