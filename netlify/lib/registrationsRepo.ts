import { buildApplicationIdCandidate, getMaxApplicationIdAttempts } from './applicationId';
import { query } from './db';
import {
  AppError,
  isUniqueViolation,
  uniqueViolationConstraint,
} from './errors';
import {
  CURRENT_RECRUITMENT_YEAR,
  type ApplicationStatus,
  type CreateRegistrationInput,
  type DomainType,
  type GenderType,
  type InterviewDetailsInput,
  type RegistrationRecord,
  type RegistrationRow,
  type YearType,
} from './types';
import { normalizeRollNo } from './validation';

function toIso(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function mapRow(row: RegistrationRow): RegistrationRecord {
  const hasInterview =
    row.interview_date != null ||
    row.interview_time != null ||
    row.interview_venue != null ||
    row.interview_notes != null ||
    row.interview_score != null ||
    row.interview_scheduled_at != null;

  return {
    id: row.id,
    applicationId: row.application_id,
    recruitmentYear: row.recruitment_year,
    universityRollNo: row.university_roll_no,
    universityRollNoNormalized: row.university_roll_no_normalized,
    fullName: row.full_name,
    gender: row.gender as GenderType,
    year: row.year as YearType,
    branch: row.branch,
    whatsappNumber: row.whatsapp_number,
    email: row.email,
    primaryDomain: row.primary_domain as DomainType,
    secondaryDomain: (row.secondary_domain as DomainType | null) ?? null,
    roleApplied: row.role_applied,
    pastExperience: row.past_experience,
    portfolioUrl: row.portfolio_url,
    motivation: row.motivation,
    wasInPreviousEnigma: row.was_in_previous_enigma,
    previousRoleDetails: row.previous_role_details,
    status: row.status as ApplicationStatus,
    interviewDetails: hasInterview
      ? {
          date: row.interview_date,
          time: row.interview_time,
          venue: row.interview_venue,
          notes: row.interview_notes,
          score: row.interview_score,
          scheduledAt: toIso(row.interview_scheduled_at),
        }
      : null,
    adminRemarks: row.admin_remarks,
    submittedAt: toIso(row.submitted_at) ?? new Date().toISOString(),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
  };
}

const SELECT_COLUMNS = `
  id,
  application_id,
  recruitment_year,
  university_roll_no,
  university_roll_no_normalized,
  full_name,
  gender,
  year,
  branch,
  whatsapp_number,
  email,
  primary_domain,
  secondary_domain,
  role_applied,
  past_experience,
  portfolio_url,
  motivation,
  was_in_previous_enigma,
  previous_role_details,
  status,
  interview_date,
  interview_time,
  interview_venue,
  interview_notes,
  interview_score,
  interview_scheduled_at,
  admin_remarks,
  submitted_at,
  created_at,
  updated_at
`;

async function insertRegistrationAttempt(
  input: CreateRegistrationInput,
  applicationId: string,
  recruitmentYear: number
): Promise<RegistrationRecord> {
  const rollNormalized = normalizeRollNo(input.universityRollNo);

  const result = await query<RegistrationRow>(
    `
    INSERT INTO registrations (
      application_id,
      recruitment_year,
      university_roll_no,
      university_roll_no_normalized,
      full_name,
      gender,
      year,
      branch,
      whatsapp_number,
      email,
      primary_domain,
      secondary_domain,
      role_applied,
      past_experience,
      portfolio_url,
      motivation,
      was_in_previous_enigma,
      previous_role_details,
      status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, 'pending'
    )
    RETURNING ${SELECT_COLUMNS}
    `,
    [
      applicationId,
      recruitmentYear,
      input.universityRollNo.trim(),
      rollNormalized,
      input.fullName,
      input.gender,
      input.year,
      input.branch,
      input.whatsappNumber,
      input.email,
      input.primaryDomain,
      input.secondaryDomain ?? null,
      input.roleApplied,
      input.pastExperience,
      input.portfolioUrl ?? null,
      input.motivation,
      input.wasInPreviousEnigma,
      input.previousRoleDetails ?? null,
    ]
  );

  const row = result.rows[0];
  if (!row) {
    throw new AppError('INTERNAL_ERROR', 'Failed to create registration.', 500);
  }
  return mapRow(row);
}

/**
 * Create a registration. Application ID uniqueness is enforced by the DB;
 * collisions retry with a bounded limit. Duplicate roll+year is a business error.
 */
export async function createRegistration(
  input: CreateRegistrationInput,
  recruitmentYear: number = CURRENT_RECRUITMENT_YEAR
): Promise<RegistrationRecord> {
  const maxAttempts = getMaxApplicationIdAttempts();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const applicationId = buildApplicationIdCandidate(input.year);

    try {
      return await insertRegistrationAttempt(input, applicationId, recruitmentYear);
    } catch (err) {
      if (!isUniqueViolation(err)) {
        throw err;
      }

      const constraint = uniqueViolationConstraint(err);
      if (
        constraint === 'registrations_roll_year_unique' ||
        constraint?.includes('roll_year')
      ) {
        throw new AppError(
          'DUPLICATE_REGISTRATION',
          'A registration already exists for this university roll number.',
          409
        );
      }

      if (
        constraint === 'registrations_application_id_unique' ||
        constraint?.includes('application_id')
      ) {
        continue;
      }

      // Ambiguous unique violation: treat roll collision as duplicate when possible.
      const existing = await getRegistrationByRollNumber(
        input.universityRollNo,
        recruitmentYear
      );
      if (existing) {
        throw new AppError(
          'DUPLICATE_REGISTRATION',
          'A registration already exists for this university roll number.',
          409
        );
      }
      continue;
    }
  }

  throw new AppError(
    'APPLICATION_ID_COLLISION',
    'Unable to allocate a unique application ID. Please try again.',
    503
  );
}

export async function getRegistrationByApplicationId(
  applicationId: string
): Promise<RegistrationRecord | null> {
  const result = await query<RegistrationRow>(
    `
    SELECT ${SELECT_COLUMNS}
    FROM registrations
    WHERE UPPER(application_id) = UPPER($1)
    LIMIT 1
    `,
    [applicationId.trim()]
  );
  const row = result.rows[0];
  return row ? mapRow(row) : null;
}

export async function getRegistrationByRollNumber(
  universityRollNo: string,
  recruitmentYear: number = CURRENT_RECRUITMENT_YEAR
): Promise<RegistrationRecord | null> {
  const normalized = normalizeRollNo(universityRollNo);
  const result = await query<RegistrationRow>(
    `
    SELECT ${SELECT_COLUMNS}
    FROM registrations
    WHERE university_roll_no_normalized = $1
      AND recruitment_year = $2
    LIMIT 1
    `,
    [normalized, recruitmentYear]
  );
  const row = result.rows[0];
  return row ? mapRow(row) : null;
}

export async function listRegistrations(options?: {
  recruitmentYear?: number;
  status?: ApplicationStatus;
}): Promise<RegistrationRecord[]> {
  const year = options?.recruitmentYear ?? CURRENT_RECRUITMENT_YEAR;
  const params: unknown[] = [year];
  let sql = `
    SELECT ${SELECT_COLUMNS}
    FROM registrations
    WHERE recruitment_year = $1
  `;

  if (options?.status) {
    params.push(options.status);
    sql += ` AND status = $2`;
  }

  sql += ` ORDER BY submitted_at DESC`;

  const result = await query<RegistrationRow>(sql, params);
  return result.rows.map(mapRow);
}

export async function updateRegistrationStatus(
  applicationId: string,
  status: ApplicationStatus,
  adminRemarks?: string
): Promise<RegistrationRecord | null> {
  const result = await query<RegistrationRow>(
    `
    UPDATE registrations
    SET
      status = $2,
      admin_remarks = COALESCE($3, admin_remarks),
      updated_at = NOW()
    WHERE UPPER(application_id) = UPPER($1)
    RETURNING ${SELECT_COLUMNS}
    `,
    [applicationId.trim(), status, adminRemarks ?? null]
  );
  const row = result.rows[0];
  return row ? mapRow(row) : null;
}

export async function updateInterviewDetails(
  applicationId: string,
  interview: InterviewDetailsInput,
  adminRemarks?: string
): Promise<RegistrationRecord | null> {
  const scheduledAt = interview.scheduledAt ?? new Date().toISOString();

  const result = await query<RegistrationRow>(
    `
    UPDATE registrations
    SET
      status = 'interview_scheduled',
      interview_date = COALESCE($2, interview_date),
      interview_time = COALESCE($3, interview_time),
      interview_venue = COALESCE($4, interview_venue),
      interview_notes = COALESCE($5, interview_notes),
      interview_score = COALESCE($6, interview_score),
      interview_scheduled_at = COALESCE($7::timestamptz, interview_scheduled_at, NOW()),
      admin_remarks = COALESCE($8, admin_remarks),
      updated_at = NOW()
    WHERE UPPER(application_id) = UPPER($1)
    RETURNING ${SELECT_COLUMNS}
    `,
    [
      applicationId.trim(),
      interview.date ?? null,
      interview.time ?? null,
      interview.venue ?? null,
      interview.notes ?? null,
      interview.score ?? null,
      scheduledAt,
      adminRemarks ?? null,
    ]
  );

  const row = result.rows[0];
  return row ? mapRow(row) : null;
}
