import { AppError } from './errors';
import {
  APPLICATION_STATUSES,
  BRANCH_LIST,
  DOMAIN_TYPES,
  GENDER_TYPES,
  YEAR_TYPES,
  type ApplicationStatus,
  type CreateRegistrationInput,
  type DomainType,
  type GenderType,
  type InterviewDetailsInput,
  type YearType,
} from './types';

export function normalizeRollNo(roll: string): string {
  return roll.trim().toUpperCase();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function assertAllowed<T extends string>(
  value: string,
  allowed: readonly T[],
  field: string
): T {
  if ((allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  throw new AppError('INVALID_INPUT', `Invalid value for ${field}.`, 400, {
    [field]: `Must be one of the allowed values.`,
  });
}

/**
 * Validate and sanitize a public registration payload.
 * Privileged fields (status, applicationId, adminRemarks, interview) are ignored/rejected.
 */
export function validateCreateRegistrationInput(raw: unknown): CreateRegistrationInput {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new AppError('INVALID_INPUT', 'Invalid registration payload.', 400);
  }

  const body = raw as Record<string, unknown>;
  const details: Record<string, string> = {};

  // Reject privileged client-controlled fields if explicitly supplied.
  const privileged = [
    'id',
    'applicationId',
    'application_id',
    'status',
    'adminRemarks',
    'admin_remarks',
    'interviewDetails',
    'interview_details',
    'submittedAt',
    'submitted_at',
    'recruitmentYear',
    'recruitment_year',
  ];
  for (const key of privileged) {
    if (key in body) {
      details[key] = 'This field cannot be set by the client.';
    }
  }
  if (Object.keys(details).length > 0) {
    throw new AppError('INVALID_INPUT', 'Registration payload contains disallowed fields.', 400, details);
  }

  const fullName = asTrimmedString(body.fullName ?? body.full_name);
  if (!fullName) details.fullName = 'Full Name is required.';

  const universityRollNoRaw = asTrimmedString(body.universityRollNo ?? body.university_roll_no);
  if (!universityRollNoRaw) {
    details.universityRollNo = 'University Roll Number is required.';
  } else if (universityRollNoRaw.length < 6) {
    details.universityRollNo = 'Please enter a valid University Roll Number.';
  }

  const genderRaw = asTrimmedString(body.gender);
  const yearRaw = asTrimmedString(body.year);
  const branch = asTrimmedString(body.branch);

  const whatsappDigits = asTrimmedString(body.whatsappNumber ?? body.whatsapp_number).replace(/\D/g, '');
  if (!whatsappDigits) {
    details.whatsappNumber = 'WhatsApp Number is required.';
  } else if (!/^\d{10}$/.test(whatsappDigits)) {
    details.whatsappNumber = 'Please enter a valid 10-digit WhatsApp phone number.';
  }

  const email = asTrimmedString(body.email).toLowerCase();
  if (!email) {
    details.email = 'Email Address is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    details.email = 'Please provide a valid email address.';
  }

  const primaryDomainRaw = asTrimmedString(body.primaryDomain ?? body.primary_domain);
  const secondaryRaw = asTrimmedString(body.secondaryDomain ?? body.secondary_domain);
  const roleApplied = asTrimmedString(body.roleApplied ?? body.role_applied);
  const pastExperience = asTrimmedString(body.pastExperience ?? body.past_experience);
  const motivation = asTrimmedString(body.motivation);
  const portfolioUrl = asTrimmedString(body.portfolioUrl ?? body.portfolio_url);

  if (!roleApplied) details.roleApplied = 'Role is required.';
  if (!pastExperience) details.pastExperience = 'Please describe your skills or past experience.';
  if (!motivation) details.motivation = 'Please share your reason to join Cultural Cell UCER.';
  if (!branch) details.branch = 'Branch is required.';

  let wasInPreviousEnigma = false;
  if (typeof body.wasInPreviousEnigma === 'boolean') {
    wasInPreviousEnigma = body.wasInPreviousEnigma;
  } else if (typeof body.was_in_previous_enigma === 'boolean') {
    wasInPreviousEnigma = body.was_in_previous_enigma;
  }

  const previousRoleDetails = asTrimmedString(
    body.previousRoleDetails ?? body.previous_role_details
  );

  if (Object.keys(details).length > 0) {
    throw new AppError('INVALID_INPUT', 'Registration validation failed.', 400, details);
  }

  const gender = assertAllowed(genderRaw, GENDER_TYPES, 'gender');
  const year = assertAllowed(yearRaw, YEAR_TYPES, 'year');
  assertAllowed(branch, BRANCH_LIST, 'branch');
  const primaryDomain = assertAllowed(primaryDomainRaw, DOMAIN_TYPES, 'primaryDomain');

  let secondaryDomain: DomainType | undefined;
  if (secondaryRaw) {
    secondaryDomain = assertAllowed(secondaryRaw, DOMAIN_TYPES, 'secondaryDomain');
    if (secondaryDomain === primaryDomain) {
      throw new AppError('INVALID_INPUT', 'Secondary domain must differ from primary domain.', 400, {
        secondaryDomain: 'Must differ from primary domain.',
      });
    }
  }

  if (year === '3rd Year' && wasInPreviousEnigma && !previousRoleDetails) {
    throw new AppError('INVALID_INPUT', 'Previous Enigma role details are required.', 400, {
      previousRoleDetails:
        'Since you were part of previous Enigma, please detail your role and contributions.',
    });
  }

  return {
    fullName,
    universityRollNo: universityRollNoRaw.toUpperCase(),
    gender: gender as GenderType,
    year: year as YearType,
    branch,
    whatsappNumber: whatsappDigits,
    email,
    primaryDomain: primaryDomain as DomainType,
    ...(secondaryDomain ? { secondaryDomain } : {}),
    roleApplied,
    pastExperience,
    ...(portfolioUrl ? { portfolioUrl } : {}),
    motivation,
    wasInPreviousEnigma: year === '3rd Year' ? wasInPreviousEnigma : false,
    ...(year === '3rd Year' && wasInPreviousEnigma ? { previousRoleDetails } : {}),
  };
}

export function validateApplicationStatus(value: unknown): ApplicationStatus {
  const status = asTrimmedString(value);
  if (!status) {
    throw new AppError('INVALID_INPUT', 'Status is required.', 400, { status: 'Required.' });
  }
  return assertAllowed(status, APPLICATION_STATUSES, 'status');
}

export function validateInterviewDetails(raw: unknown): InterviewDetailsInput {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new AppError('INVALID_INPUT', 'Invalid interview details payload.', 400);
  }

  const body = raw as Record<string, unknown>;
  const details: InterviewDetailsInput = {};

  const date = asTrimmedString(body.date);
  const time = asTrimmedString(body.time);
  const venue = asTrimmedString(body.venue);
  const notes = asTrimmedString(body.notes);
  const scheduledAt = asTrimmedString(body.scheduledAt ?? body.scheduled_at);

  if (date) details.date = date;
  if (time) details.time = time;
  if (venue) details.venue = venue;
  if (notes) details.notes = notes;
  if (scheduledAt) details.scheduledAt = scheduledAt;

  if (body.score !== undefined && body.score !== null && body.score !== '') {
    const score = typeof body.score === 'number' ? body.score : Number(body.score);
    if (!Number.isInteger(score) || score < 1 || score > 10) {
      throw new AppError('INVALID_INPUT', 'Interview score must be an integer from 1 to 10.', 400, {
        score: 'Must be an integer from 1 to 10.',
      });
    }
    details.score = score;
  }

  return details;
}

export function requireNonEmptyString(value: unknown, field: string): string {
  if (!isNonEmptyString(value)) {
    throw new AppError('INVALID_INPUT', `${field} is required.`, 400, { [field]: 'Required.' });
  }
  return value.trim();
}

/**
 * Validate a public status-check payload.
 * Accepts application ID or university roll number as `identifier`.
 */
export function validateStatusIdentifierInput(raw: unknown): string {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new AppError('INVALID_INPUT', 'Invalid status lookup payload.', 400);
  }

  const body = raw as Record<string, unknown>;
  const identifier = asTrimmedString(body.identifier);

  if (!identifier) {
    throw new AppError('INVALID_INPUT', 'Application ID or university roll number is required.', 400, {
      identifier: 'Required.',
    });
  }

  return identifier;
}
