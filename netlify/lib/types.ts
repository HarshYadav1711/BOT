/**
 * Server-only domain types mirroring the existing frontend registration model.
 * Kept local to netlify/ so browser code never imports server modules.
 */

export const CURRENT_RECRUITMENT_YEAR = 2025;

export const YEAR_TYPES = ['2nd Year', '3rd Year'] as const;
export type YearType = (typeof YEAR_TYPES)[number];

export const GENDER_TYPES = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
export type GenderType = (typeof GENDER_TYPES)[number];

export const DOMAIN_TYPES = [
  'Tech & Web Operations',
  'Media & Photography',
  'Graphic Design & Visual Arts',
  'Event Management & Coordination',
  'Sponsorship & Public Relations',
  'Operations & Logistics',
  'Decor & Campus Aesthetics',
  'Promotions & Social Media',
] as const;
export type DomainType = (typeof DOMAIN_TYPES)[number];

export const APPLICATION_STATUSES = [
  'pending',
  'shortlisted',
  'interview_scheduled',
  'selected',
  'rejected',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const BRANCH_LIST = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'CSE - Artificial Intelligence & ML',
  'CSE - Data Science',
  'Electronics & Communication (ECE)',
  'Electrical Engineering (EE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Master of Business Administration (MBA)',
  'Master of Computer Applications (MCA)',
  'Bachelor of Pharmacy (B.Pharm)',
] as const;

/** Public registration payload accepted from clients (no privileged fields). */
export interface CreateRegistrationInput {
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
}

export interface InterviewDetailsInput {
  date?: string;
  time?: string;
  venue?: string;
  notes?: string;
  score?: number;
  scheduledAt?: string;
}

export interface RegistrationRecord {
  id: string;
  applicationId: string;
  recruitmentYear: number;
  universityRollNo: string;
  universityRollNoNormalized: string;
  fullName: string;
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
  interviewDetails: {
    date: string | null;
    time: string | null;
    venue: string | null;
    notes: string | null;
    score: number | null;
    scheduledAt: string | null;
  } | null;
  adminRemarks: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationRow {
  id: string;
  application_id: string;
  recruitment_year: number;
  university_roll_no: string;
  university_roll_no_normalized: string;
  full_name: string;
  gender: string;
  year: string;
  branch: string;
  whatsapp_number: string;
  email: string;
  primary_domain: string;
  secondary_domain: string | null;
  role_applied: string;
  past_experience: string;
  portfolio_url: string | null;
  motivation: string;
  was_in_previous_enigma: boolean;
  previous_role_details: string | null;
  status: string;
  interview_date: string | null;
  interview_time: string | null;
  interview_venue: string | null;
  interview_notes: string | null;
  interview_score: number | null;
  interview_scheduled_at: Date | string | null;
  admin_remarks: string | null;
  submitted_at: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}
