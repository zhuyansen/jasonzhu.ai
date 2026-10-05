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

-- 不给 anon 任何策略：订阅、管理后台都走服务端 SUPABASE_SERVICE_KEY（绕过 RLS）。
-- 2026-10-05 以前这里有 "Allow anonymous select by email" USING (true)，任何人拿页面里的 anon key 就能读出全部邮箱。
-- 见 supabase/lock-down-rls.sql。
