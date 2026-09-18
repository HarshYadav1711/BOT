import type { Handler, HandlerResponse } from '@netlify/functions';
import { AppError, toPublicErrorResponse } from '../lib/errors';
import {
  jsonResponse,
  parseJsonBody,
  requireAdminSession,
} from '../lib/http';
import { deleteRegistration } from '../lib/registrationsRepo';
import { requireNonEmptyString } from '../lib/validation';

/**
 * DELETE|POST /.netlify/functions/admin-registration-delete
 *
 * Body or query: applicationId
 * Permanently deletes one registration. Admin session required.
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'DELETE' && event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: { code: 'INVALID_INPUT', message: 'Method Not Allowed' },
    });
  }

  try {
    await requireAdminSession(event);

    let applicationId: string | undefined =
      event.queryStringParameters?.applicationId ||
      event.queryStringParameters?.id ||
      undefined;

    if (!applicationId && event.body) {
      const raw = parseJsonBody(event);
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const body = raw as Record<string, unknown>;
        const value = body.applicationId ?? body.id;
        if (typeof value === 'string') applicationId = value;
      }
    }

    const id = requireNonEmptyString(applicationId, 'applicationId');
    const deleted = await deleteRegistration(id);
    if (!deleted) {
      throw new AppError('NOT_FOUND', 'Registration not found.', 404);
    }

    return jsonResponse(200, { ok: true, deleted: true, applicationId: id });
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
