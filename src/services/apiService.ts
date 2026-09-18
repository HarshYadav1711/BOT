import type {
  Applicant,
  ApplicationStatus,
  DomainType,
  GenderType,
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

type PublicRegistrationResponse = {
  applicationId: string;
  fullName: string;
  universityRollNo: string;
  gender: GenderType;
  year: YearType;
  branch: string;
  whatsappNumber: string;
  email: string;
  primaryDomain: DomainType;
  secondaryDomain: DomainType | null;
  roleApplied: string;
  pastExperience: string;
  portfolioUrl: string | null;
  motivation: string;
  wasInPreviousEnigma: boolean;
  previousRoleDetails: string | null;
  status: ApplicationStatus;
  submittedAt: string;
};

function mapRegistrationToApplicant(reg: PublicRegistrationResponse): Applicant {
  return {
    id: reg.applicationId,
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
    submittedAt: reg.submittedAt,
  };
}

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

/**
 * Create a registration via the Netlify Functions API.
 * Application ID is generated server-side — never locally.
 */
export async function createRegistration(
  input: CreateRegistrationPayload
): Promise<Applicant> {
  let response: Response;
  try {
    response = await fetch('/.netlify/functions/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ApiError(
      'NETWORK_ERROR',
      'Unable to submit your registration right now. Please try again.',
      0
    );
  }

  const payload = await readJsonSafe(response);

  if (!response.ok) {
    const errorObj = isRecord(payload) && isRecord(payload.error) ? payload.error : null;
    const code =
      typeof errorObj?.code === 'string'
        ? (errorObj.code as ApiErrorCode)
        : 'INTERNAL_ERROR';
    const message =
      typeof errorObj?.message === 'string'
        ? errorObj.message
        : 'Unable to submit your registration right now. Please try again.';
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

  if (!isRecord(payload) || payload.ok !== true || !isRecord(payload.registration)) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Unable to submit your registration right now. Please try again.',
      response.status
    );
  }

  const reg = payload.registration as PublicRegistrationResponse;
  if (typeof reg.applicationId !== 'string' || !reg.applicationId) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Unable to submit your registration right now. Please try again.',
      response.status
    );
  }

  return mapRegistrationToApplicant(reg);
}
