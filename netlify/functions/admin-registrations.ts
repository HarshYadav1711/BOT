import type { Handler, HandlerResponse } from '@netlify/functions';
import { toAdminRegistration } from '../lib/adminRegistrations';
import { toPublicErrorResponse } from '../lib/errors';
import { jsonResponse, requireAdminSession } from '../lib/http';
import { listRegistrations } from '../lib/registrationsRepo';

/**
 * GET /.netlify/functions/admin-registrations
 * Authenticated list of registrations for the admin dashboard.
 * Search/filter remain client-side for the current dataset size.
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return jsonResponse(405, {
      error: { code: 'INVALID_INPUT', message: 'Method Not Allowed' },
    });
  }

  try {
    await requireAdminSession(event);
    const rows = await listRegistrations();
    return jsonResponse(200, {
      ok: true,
      registrations: rows.map(toAdminRegistration),
    });
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
