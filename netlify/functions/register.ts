import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { AppError, toPublicErrorResponse } from '../lib/errors';
import { createRegistration } from '../lib/registrationsRepo';
import type { RegistrationRecord } from '../lib/types';
import { validateCreateRegistrationInput } from '../lib/validation';

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

/** Reasonable upper bound for a registration JSON payload (~64 KiB). */
const MAX_BODY_BYTES = 64 * 1024;

function jsonResponse(statusCode: number, payload: unknown): HandlerResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  };
}

/**
 * Parse and size-check the request body. Does not validate registration fields.
 */
function parseJsonBody(event: HandlerEvent): unknown {
  if (event.body == null || event.body === '') {
    throw new AppError('INVALID_INPUT', 'Request body is required.', 400);
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    throw new AppError('INVALID_INPUT', 'Request body is too large.', 413);
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new AppError('INVALID_INPUT', 'Request body must be valid JSON.', 400);
  }
}

/** Public success shape for a future frontend migration (application ID is canonical). */
function toPublicRegistration(record: RegistrationRecord) {
  return {
    applicationId: record.applicationId,
    recruitmentYear: record.recruitmentYear,
    fullName: record.fullName,
    universityRollNo: record.universityRollNo,
    gender: record.gender,
    year: record.year,
    branch: record.branch,
    whatsappNumber: record.whatsappNumber,
    email: record.email,
    primaryDomain: record.primaryDomain,
    secondaryDomain: record.secondaryDomain,
    roleApplied: record.roleApplied,
    pastExperience: record.pastExperience,
    portfolioUrl: record.portfolioUrl,
    motivation: record.motivation,
    wasInPreviousEnigma: record.wasInPreviousEnigma,
    previousRoleDetails: record.previousRoleDetails,
    status: record.status,
    submittedAt: record.submittedAt,
  };
}

/**
 * POST /.netlify/functions/register
 *
 * Public registration endpoint. Validates input, persists to PostgreSQL,
 * and returns the canonical application ID.
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
    const input = validateCreateRegistrationInput(rawBody);
    const record = await createRegistration(input);

    return jsonResponse(201, {
      ok: true,
      registration: toPublicRegistration(record),
    });
  } catch (err) {
    const { statusCode, body } = toPublicErrorResponse(err);
    return jsonResponse(statusCode, body);
  }
};
