-- Create support_requests table
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('email', 'phone', 'both')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create support requests" ON support_requests;
DROP POLICY IF EXISTS "Authenticated users can read support requests" ON support_requests;
DROP POLICY IF EXISTS "Authenticated users can update support requests" ON support_requests;
DROP POLICY IF EXISTS "Authenticated users can delete support requests" ON support_requests;

-- Create policy to allow anyone to insert support requests
CREATE POLICY "Anyone can create support requests"
  ON support_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users (admin) to read all support requests
CREATE POLICY "Authenticated users can read support requests"
  ON support_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users (admin) to update support requests
CREATE POLICY "Authenticated users can update support requests"
  ON support_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users (admin) to delete support requests
CREATE POLICY "Authenticated users can delete support requests"
  ON support_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Disable RLS temporarily to allow inserts, then re-enable with correct policies
ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_support_requests_updated_at ON support_requests;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
