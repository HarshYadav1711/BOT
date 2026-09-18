import type { RegistrationRecord } from './types';

/**
 * Canonical admin-facing registration shape.
 * `id` matches the frontend Applicant.id convention (public application ID).
 * Omits internal normalized-roll implementation details.
 */
export function toAdminRegistration(record: RegistrationRecord) {
  return {
    id: record.applicationId,
    applicationId: record.applicationId,
    fullName: record.fullName,
    universityRollNo: record.universityRollNo,
    gender: record.gender,
    year: record.year,
    branch: record.branch,
    whatsappNumber: record.whatsappNumber,
    email: record.email,
    primaryDomain: record.primaryDomain,
    secondaryDomain: record.secondaryDomain ?? undefined,
    roleApplied: record.roleApplied,
    pastExperience: record.pastExperience,
    portfolioUrl: record.portfolioUrl ?? undefined,
    motivation: record.motivation,
    wasInPreviousEnigma: record.wasInPreviousEnigma,
    previousRoleDetails: record.previousRoleDetails ?? undefined,
    status: record.status,
    interviewDetails: record.interviewDetails
      ? {
          date: record.interviewDetails.date ?? undefined,
          time: record.interviewDetails.time ?? undefined,
          venue: record.interviewDetails.venue ?? undefined,
          notes: record.interviewDetails.notes ?? undefined,
          score: record.interviewDetails.score ?? undefined,
          scheduledAt: record.interviewDetails.scheduledAt ?? undefined,
        }
      : undefined,
    adminRemarks: record.adminRemarks ?? undefined,
    submittedAt: record.submittedAt,
  };
}
