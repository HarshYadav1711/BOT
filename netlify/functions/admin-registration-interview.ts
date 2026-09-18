import type { Handler, HandlerResponse } from '@netlify/functions';
import { toAdminRegistration } from '../lib/adminRegistrations';
import { AppError, toPublicErrorResponse } from '../lib/errors';
import { jsonResponse, parseJsonBody, requireAdminSession } from '../lib/http';
import { updateInterviewDetails } from '../lib/registrationsRepo';
import { requireNonEmptyString, validateInterviewDetails } from '../lib/validation';

/**
 * PATCH|POST /.netlify/functions/admin-registration-interview
 *
 * Body: { applicationId, interview: { date, time, venue, notes, score }, adminRemarks? }
 * Sets status to interview_scheduled and updates interview fields only.
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
      throw new AppError('INVALID_INPUT', 'Invalid interview update payload.', 400);
    }

    const body = raw as Record<string, unknown>;
    const applicationId = requireNonEmptyString(
      body.applicationId ?? body.id,
      'applicationId'
    );

    const interviewRaw = body.interview ?? {
      date: body.date,
      time: body.time,
      venue: body.venue,
      notes: body.notes,
      score: body.score,
    };
    const interview = validateInterviewDetails(interviewRaw);

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

    const updated = await updateInterviewDetails(
      applicationId,
      interview,
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
