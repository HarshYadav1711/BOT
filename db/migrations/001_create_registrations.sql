-- UCER Cultural Cell / ENIGMA registrations schema
-- Safe to run on an empty database. Does not DROP existing objects.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  application_id TEXT NOT NULL,
  recruitment_year INTEGER NOT NULL DEFAULT 2025,

  university_roll_no TEXT NOT NULL,
  university_roll_no_normalized TEXT NOT NULL,

  full_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  year TEXT NOT NULL,
  branch TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT NOT NULL,

  primary_domain TEXT NOT NULL,
  secondary_domain TEXT,
  role_applied TEXT NOT NULL,
  past_experience TEXT NOT NULL,
  portfolio_url TEXT,
  motivation TEXT NOT NULL,

  was_in_previous_enigma BOOLEAN NOT NULL DEFAULT FALSE,
  previous_role_details TEXT,

  status TEXT NOT NULL DEFAULT 'pending',

  interview_date TEXT,
  interview_time TEXT,
  interview_venue TEXT,
  interview_notes TEXT,
  interview_score INTEGER,
  interview_scheduled_at TIMESTAMPTZ,

  admin_remarks TEXT,

  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT registrations_application_id_unique UNIQUE (application_id),
  CONSTRAINT registrations_roll_year_unique UNIQUE (university_roll_no_normalized, recruitment_year),
  CONSTRAINT registrations_status_check CHECK (
    status IN ('pending', 'shortlisted', 'interview_scheduled', 'selected', 'rejected')
  ),
  CONSTRAINT registrations_year_check CHECK (
    year IN ('2nd Year', '3rd Year')
  ),
  CONSTRAINT registrations_gender_check CHECK (
    gender IN ('Male', 'Female', 'Other', 'Prefer not to say')
  ),
  CONSTRAINT registrations_interview_score_check CHECK (
    interview_score IS NULL OR (interview_score >= 1 AND interview_score <= 10)
  )
);

CREATE INDEX IF NOT EXISTS idx_registrations_status
  ON registrations (status);

CREATE INDEX IF NOT EXISTS idx_registrations_recruitment_year
  ON registrations (recruitment_year);

CREATE INDEX IF NOT EXISTS idx_registrations_submitted_at
  ON registrations (submitted_at DESC);
