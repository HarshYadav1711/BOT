import type { Handler, HandlerResponse } from '@netlify/functions';
import { toAdminRegistration } from '../lib/adminRegistrations';
import { AppError, toPublicErrorResponse } from '../lib/errors';
import { jsonResponse, parseJsonBody, requireAdminSession } from '../lib/http';
import { updateRegistrationStatus } from '../lib/registrationsRepo';
import { requireNonEmptyString, validateApplicationStatus } from '../lib/validation';

/**
 * PATCH|POST /.netlify/functions/admin-registration-status
 *
 * Body: { applicationId, status, adminRemarks? }
 * Updates status (and optional remarks) only — no other applicant fields.
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: { code: 'INVALID_INPUT', message: 'Method Not Allowed' },
    });
  }

  try {
    await requireAdminSession(event);
    const raw = parseJsonBody(event);
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new AppError('INVALID_INPUT', 'Invalid status update payload.', 400);
    }

    const body = raw as Record<string, unknown>;
    const applicationId = requireNonEmptyString(
      body.applicationId ?? body.id,
      'applicationId'
    );
    const status = validateApplicationStatus(body.status);

    let adminRemarks: string | undefined;
    if (body.adminRemarks !== undefined || body.admin_remarks !== undefined) {
      const remarks = body.adminRemarks ?? body.admin_remarks;
      if (remarks !== null && typeof remarks !== 'string') {
        throw new AppError('INVALID_INPUT', 'adminRemarks must be a string.', 400, {
          adminRemarks: 'Must be a string.',
        });
      }
      adminRemarks = typeof remarks === 'string' ? remarks.trim() : '';
    }

    const updated = await updateRegistrationStatus(
      applicationId,
      status,
      adminRemarks
    );
    if (!updated) {
      throw new AppError('NOT_FOUND', 'Registration not found.', 404);
    }

    return jsonResponse(200, {
      ok: true,
      registration: toAdminRegistration(updated),
    });
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
