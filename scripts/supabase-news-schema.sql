-- AI 快讯数据表
-- 在 Supabase SQL Editor 中执行

-- 每日快讯主表
CREATE TABLE IF NOT EXISTS news_digests (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  jason_says TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 快讯条目表
CREATE TABLE IF NOT EXISTS news_items (
  id SERIAL PRIMARY KEY,
  digest_date DATE NOT NULL REFERENCES news_digests(date) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'AI 工具动态',
  url TEXT DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_news_items_date ON news_items(digest_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_digests_date ON news_digests(date DESC);

-- RLS 策略：允许匿名读取
ALTER TABLE news_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read news_digests" ON news_digests
  FOR SELECT USING (true);

CREATE POLICY "Allow public read news_items" ON news_items
  FOR SELECT USING (true);

-- 允许 service_role 写入（GitHub Actions 使用 service_role key）
CREATE POLICY "Allow service write news_digests" ON news_digests
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service write news_items" ON news_items
  FOR ALL USING (true) WITH CHECK (true);

-- GoSail Club 入会申请表（2026-07-09 新增；Supabase 解封后在 SQL Editor 跑一次）
create table if not exists club_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  wechat text not null,
  email text not null,
  role text,
  project text,
  tier text not null,
  needs text,
  referral text,
  status text default 'pending',  -- pending / approved / rejected / paid
  created_at timestamptz default now()
);
create index if not exists club_applications_email_idx on club_applications (email);
