import type { Handler, HandlerResponse } from '@netlify/functions';
import { AppError, toPublicErrorResponse } from '../lib/errors';
import { jsonResponse, parseJsonBody } from '../lib/http';
import { getRegistrationByRollOrId } from '../lib/registrationsRepo';
import type { RegistrationRecord } from '../lib/types';
import { validateStatusIdentifierInput } from '../lib/validation';

/**
 * Explicit allowlist of fields StatusCheckModal displays.
 * Do not add essays, admin remarks, scores, notes, or internal IDs.
 */
function toPublicStatusRegistration(record: RegistrationRecord) {
  return {
    applicationId: record.applicationId,
    fullName: record.fullName,
    universityRollNo: record.universityRollNo,
    roleApplied: record.roleApplied,
    primaryDomain: record.primaryDomain,
    status: record.status,
    whatsappNumber: record.whatsappNumber,
    interviewDetails: record.interviewDetails
      ? {
          date: record.interviewDetails.date ?? undefined,
          time: record.interviewDetails.time ?? undefined,
          venue: record.interviewDetails.venue ?? undefined,
        }
      : null,
  };
}

/**
 * POST /.netlify/functions/status
 *
 * Public applicant status lookup by application ID or university roll number.
 * No admin authentication required.
 *
 * Body: { "identifier": "ENIGMA-2025-V204" | "2300100100084" }
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: {
        code: 'INVALID_INPUT',
        message: 'Method Not Allowed',
      },
    });
  }

  try {
    const rawBody = parseJsonBody(event);
    const identifier = validateStatusIdentifierInput(rawBody);
    const record = await getRegistrationByRollOrId(identifier);

    if (!record) {
      throw new AppError('NOT_FOUND', 'No application found for the given identifier.', 404);
    }

    return jsonResponse(200, {
      ok: true,
      registration: toPublicStatusRegistration(record),
    });
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
