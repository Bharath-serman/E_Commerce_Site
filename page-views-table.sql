-- Create page_views table for analytics tracking
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session_id for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);

-- Create index on path for page analytics
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);

-- Enable Row Level Security
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert page views (for tracking)
CREATE POLICY "Allow insert for all users" ON page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read analytics
CREATE POLICY "Allow read for authenticated users" ON page_views
  FOR SELECT
  TO authenticated
  USING (true);
