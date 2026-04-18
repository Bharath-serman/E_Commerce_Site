-- Add password field to user table for email/password authentication
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password TEXT;

-- Add password field to account table for email/password authentication
ALTER TABLE account ADD COLUMN IF NOT EXISTS password TEXT;

-- Add updatedAt field to verification table
ALTER TABLE verification ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Make user_id nullable in verification table for OAuth flows
ALTER TABLE verification ALTER COLUMN user_id DROP NOT NULL;

-- Add accessTokenExpiresAt field to account table for OAuth
ALTER TABLE account ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE;

-- Add scope field to account table for OAuth
ALTER TABLE account ADD COLUMN IF NOT EXISTS scope TEXT;
