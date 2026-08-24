-- ==============================================================================
-- Migration: Add inclusive Gender field to users table
-- Run in: Supabase Dashboard > SQL Editor
-- Date: 2026-08
--
-- Safe for existing data:
--   * Adds a nullable TEXT column — all existing rows keep working (NULL gender).
--   * No backfill required; users may set gender later from their profile page.
--   * The CHECK constraint applies only to NEW writes; NULL passes any CHECK.
-- ==============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;

-- Restrict new values to the supported inclusive option set.
-- Existing NULLs remain valid (CHECK constraints pass on NULL).
DO $$
BEGIN
  -- Drop the constraint first so this script stays idempotent
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_gender_check;
  ALTER TABLE users ADD CONSTRAINT users_gender_check
    CHECK (gender IN ('Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'));
END $$;
