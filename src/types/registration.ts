export type YearType = '2nd Year' | '3rd Year';

export type GenderType = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type DomainType =
  | 'Tech & Web Operations'
  | 'Media & Photography'
  | 'Graphic Design & Visual Arts'
  | 'Event Management & Coordination'
  | 'Sponsorship & Public Relations'
  | 'Operations & Logistics'
  | 'Decor & Campus Aesthetics'
  | 'Promotions & Social Media';

export type ApplicationStatus =
  | 'pending'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'selected'
  | 'rejected';

export interface InterviewDetails {
  date?: string;
  time?: string;
  venue?: string;
  notes?: string;
  score?: number; // 1 to 10
  scheduledAt?: string;
}

export interface Applicant {
  id: string; // e.g., ENIGMA-2026-V104
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
  
  // Specific to 3rd year applicants
  wasInPreviousEnigma: boolean;
  previousRoleDetails?: string;

  // Administrative / Interview fields
  status: ApplicationStatus;
  interviewDetails?: InterviewDetails;
  adminRemarks?: string;
  submittedAt: string;
}

export interface CoreTeamMember {
  id: string;
  name: string;
  designation: string;
  domain?: string;
  instagram?: string;
  phone?: string;
  isPresident?: boolean;
  avatarPlaceholder?: string;
  badgeColor: string;
}

export interface DomainInfo {
  id: DomainType;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  color: string;
  volunteerRoles: string[];
  headRoles: string[];
  skillsRequired: string[];
}
