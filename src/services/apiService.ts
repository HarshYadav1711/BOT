import type {
  Applicant,
  ApplicationStatus,
  DomainType,
  GenderType,
  InterviewDetails,
  YearType,
} from '../types/registration';

/** Applicant-controlled fields accepted by POST /.netlify/functions/register */
export type CreateRegistrationPayload = {
  fullName: string;
  universityRollNo: string;
  gender: GenderType;
  year: YearType;
  branch: string;
  whatsappNumber: string;
  email: string;
  primaryDomain: DomainType;
  secondaryDomain?: DomainType;
  roleApplied: string;
  pastExperience: string;
  portfolioUrl?: string;
  motivation: string;
  wasInPreviousEnigma: boolean;
  previousRoleDetails?: string;
};

export type ApiErrorCode =
  | 'DUPLICATE_REGISTRATION'
  | 'INVALID_INPUT'
  | 'APPLICATION_ID_COLLISION'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'UNEXPECTED_RESPONSE';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fields?: Record<string, string>;

  constructor(
    code: ApiErrorCode,
    message: string,
    status = 400,
    fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

type ServerRegistration = {
  id?: string;
  applicationId: string;
  fullName: string;
  universityRollNo: string;
  gender: GenderType;
  year: YearType;
  branch: string;
  whatsappNumber: string;
  email: string;
  primaryDomain: DomainType;
  secondaryDomain?: DomainType | null;
  roleApplied: string;
  pastExperience: string;
  portfolioUrl?: string | null;
  motivation: string;
  wasInPreviousEnigma: boolean;
  previousRoleDetails?: string | null;
  status: ApplicationStatus;
  interviewDetails?: InterviewDetails | null;
  adminRemarks?: string | null;
  submittedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function readJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function mapRegistrationToApplicant(reg: ServerRegistration): Applicant {
  const interview = reg.interviewDetails;
  const hasInterview =
    interview &&
    (interview.date ||
      interview.time ||
      interview.venue ||
      interview.notes ||
      interview.score != null ||
      interview.scheduledAt);

  return {
    id: reg.applicationId || reg.id || '',
    fullName: reg.fullName,
    universityRollNo: reg.universityRollNo,
    gender: reg.gender,
    year: reg.year,
    branch: reg.branch,
    whatsappNumber: reg.whatsappNumber,
    email: reg.email,
    primaryDomain: reg.primaryDomain,
    ...(reg.secondaryDomain ? { secondaryDomain: reg.secondaryDomain } : {}),
    roleApplied: reg.roleApplied,
    pastExperience: reg.pastExperience,
    ...(reg.portfolioUrl ? { portfolioUrl: reg.portfolioUrl } : {}),
    motivation: reg.motivation,
    wasInPreviousEnigma: reg.wasInPreviousEnigma,
    ...(reg.previousRoleDetails ? { previousRoleDetails: reg.previousRoleDetails } : {}),
    status: reg.status,
    ...(hasInterview && interview ? { interviewDetails: interview } : {}),
    ...(reg.adminRemarks ? { adminRemarks: reg.adminRemarks } : {}),
    submittedAt: reg.submittedAt,
  };
}

async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<{ response: Response; payload: unknown }> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(
      'NETWORK_ERROR',
      'Unable to reach the server. Please try again.',
      0
    );
  }

  const payload = await readJsonSafe(response);
  return { response, payload };
}

function throwFromErrorPayload(response: Response, payload: unknown, fallback: string): never {
  const errorObj = isRecord(payload) && isRecord(payload.error) ? payload.error : null;
  const code =
    typeof errorObj?.code === 'string'
      ? (errorObj.code as ApiErrorCode)
      : response.status === 401
        ? 'UNAUTHORIZED'
        : 'INTERNAL_ERROR';
  const message =
    typeof errorObj?.message === 'string' ? errorObj.message : fallback;
  const fields =
    isRecord(errorObj?.details) &&
    Object.values(errorObj.details).every((v) => typeof v === 'string')
      ? (errorObj.details as Record<string, string>)
      : undefined;

  if (code === 'DUPLICATE_REGISTRATION') {
    throw new ApiError(
      'DUPLICATE_REGISTRATION',
      'A registration already exists for this university roll number.',
      response.status,
      fields
    );
  }

  throw new ApiError(code, message, response.status, fields);
}

function parseRegistrationPayload(payload: unknown, response: Response): Applicant {
  if (!isRecord(payload) || payload.ok !== true || !isRecord(payload.registration)) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Unexpected server response. Please try again.',
      response.status
    );
  }
  const reg = payload.registration as ServerRegistration;
  if (!reg.applicationId && !reg.id) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Unexpected server response. Please try again.',
      response.status
    );
  }
  return mapRegistrationToApplicant(reg);
}

/**
 * Create a registration via the Netlify Functions API.
 * Application ID is generated server-side — never locally.
 */
export async function createRegistration(
  input: CreateRegistrationPayload
): Promise<Applicant> {
  const { response, payload } = await apiFetch('/.netlify/functions/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throwFromErrorPayload(
      response,
      payload,
      'Unable to submit your registration right now. Please try again.'
    );
  }

  return parseRegistrationPayload(payload, response);
}

/**
 * Public status lookup by application ID or university roll number.
 * Returns null when no matching registration exists (same as prior localStorage miss).
 */
export async function checkRegistrationStatus(
  identifier: string
): Promise<Applicant | null> {
  const { response, payload } = await apiFetch('/.netlify/functions/status', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throwFromErrorPayload(
      response,
      payload,
      'Unable to check application status right now. Please try again.'
    );
  }

  if (!isRecord(payload) || payload.ok !== true || !isRecord(payload.registration)) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Unexpected server response. Please try again.',
      response.status
    );
  }

  const reg = payload.registration as ServerRegistration;
  if (!reg.applicationId && !reg.id) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Unexpected server response. Please try again.',
      response.status
    );
  }

  return mapRegistrationToApplicant(reg);
}

export async function adminLogin(
  username: string,
  password: string
): Promise<{ username: string; expiresAt: string }> {
  const { response, payload } = await apiFetch('/.netlify/functions/admin-login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throwFromErrorPayload(
      response,
      payload,
      'Access Denied: Invalid Admin Username or Password.'
    );
  }

  if (!isRecord(payload) || payload.ok !== true) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Access Denied: Invalid Admin Username or Password.',
      response.status
    );
  }

  return {
    username: typeof payload.username === 'string' ? payload.username : username,
    expiresAt: typeof payload.expiresAt === 'string' ? payload.expiresAt : '',
  };
}

export async function getAdminSession(): Promise<{
  authenticated: boolean;
  username?: string;
  expiresAt?: string;
}> {
  const { response, payload } = await apiFetch('/.netlify/functions/admin-session', {
    method: 'GET',
  });

  if (response.status === 401) {
    return { authenticated: false };
  }

  if (!response.ok) {
    throwFromErrorPayload(response, payload, 'Unable to verify admin session.');
  }

  if (!isRecord(payload) || payload.ok !== true) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    username: typeof payload.username === 'string' ? payload.username : undefined,
    expiresAt: typeof payload.expiresAt === 'string' ? payload.expiresAt : undefined,
  };
}

export async function adminLogout(): Promise<void> {
  try {
    await apiFetch('/.netlify/functions/admin-logout', { method: 'POST' });
  } catch {
    // Still treat client as logged out if network fails after expiry.
  }
}

export async function getAdminRegistrations(): Promise<Applicant[]> {
  const { response, payload } = await apiFetch('/.netlify/functions/admin-registrations', {
    method: 'GET',
  });

  if (!response.ok) {
    throwFromErrorPayload(response, payload, 'Unable to load registrations.');
  }

  if (!isRecord(payload) || payload.ok !== true || !Array.isArray(payload.registrations)) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Unable to load registrations.',
      response.status
    );
  }

  return (payload.registrations as ServerRegistration[]).map(mapRegistrationToApplicant);
}

export async function updateAdminRegistrationStatus(
  applicationId: string,
  status: ApplicationStatus,
  adminRemarks?: string
): Promise<Applicant> {
  const body: Record<string, unknown> = { applicationId, status };
  if (adminRemarks !== undefined) body.adminRemarks = adminRemarks;

  const { response, payload } = await apiFetch(
    '/.netlify/functions/admin-registration-status',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throwFromErrorPayload(response, payload, 'Unable to update status.');
  }

  return parseRegistrationPayload(payload, response);
}

export async function updateAdminInterview(
  applicationId: string,
  interview: InterviewDetails,
  adminRemarks?: string
): Promise<Applicant> {
  const body: Record<string, unknown> = {
    applicationId,
    interview: {
      date: interview.date,
      time: interview.time,
      venue: interview.venue,
      notes: interview.notes,
      score: interview.score,
    },
  };
  if (adminRemarks !== undefined) body.adminRemarks = adminRemarks;

  const { response, payload } = await apiFetch(
    '/.netlify/functions/admin-registration-interview',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throwFromErrorPayload(response, payload, 'Unable to schedule interview.');
  }

  return parseRegistrationPayload(payload, response);
}

export async function deleteAdminRegistration(applicationId: string): Promise<void> {
  const { response, payload } = await apiFetch(
    '/.netlify/functions/admin-registration-delete',
    {
      method: 'POST',
      body: JSON.stringify({ applicationId }),
    }
  );

  if (!response.ok) {
    throwFromErrorPayload(response, payload, 'Unable to delete registration.');
  }
}

export async function updateAdminCredentials(
  username: string,
  password: string
): Promise<{ username: string }> {
  const { response, payload } = await apiFetch('/.netlify/functions/admin-credentials', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throwFromErrorPayload(response, payload, 'Failed to update credentials.');
  }

  if (!isRecord(payload) || payload.ok !== true) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Failed to update credentials.',
      response.status
    );
  }

  return {
    username: typeof payload.username === 'string' ? payload.username : username,
  };
}
