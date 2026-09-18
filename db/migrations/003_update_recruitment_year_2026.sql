-- Set the default recruitment_year for NEW registrations to 2026.
-- Does NOT rewrite existing rows or application IDs.

ALTER TABLE registrations
  ALTER COLUMN recruitment_year SET DEFAULT 2026;
