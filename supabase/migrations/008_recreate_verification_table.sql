-- Recreate verification table for Better Auth
-- This table is required for email verification and OAuth state management
-- Drop existing table first to ensure correct schema with quoted column names

DROP TABLE IF EXISTS verification CASCADE;

CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  identifier TEXT,
  value TEXT,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX verification_user_id_idx ON verification(user_id);
