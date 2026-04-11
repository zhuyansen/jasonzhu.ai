-- Create subscribers table for JasonZhu.AI newsletter
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'website',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);

-- Enable Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the subscribe form)
CREATE POLICY "Allow anonymous inserts" ON subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous select to check existing subscriptions
CREATE POLICY "Allow anonymous select by email" ON subscribers
  FOR SELECT
  USING (true);
