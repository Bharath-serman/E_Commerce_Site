-- Drop existing tables to recreate with correct schema
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Create user table for Better Auth
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" BOOLEAN DEFAULT FALSE,
  name TEXT,
  image TEXT,
  password TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session table for Better Auth
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin table for admin users (separate from regular users)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (you should change this password)
INSERT INTO admin_users (id, email, name, password_hash)
VALUES (
  'admin-001',
  'admin@aesthetic.com',
  'Admin',
  '$2b$10$YourHashedPasswordHere'
)
ON CONFLICT (email) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_session_user_id ON session(user_id);
