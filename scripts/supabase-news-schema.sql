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

-- GoSail Club 兑换码/会员表（2026-07-11 新增；KV 为运行时主存储，此表做同步归档）
create table if not exists member_codes (
  code text primary key,
  github_username text,
  email text,
  hub_key text,
  status text default 'unused',   -- unused / activated / expired / revoked
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- RLS：API 用 anon key 写入，走宽松策略（与 news_items 同款）
alter table club_applications enable row level security;
create policy "Allow write club_applications" on club_applications
  for all using (true) with check (true);
alter table member_codes enable row level security;
create policy "Allow write member_codes" on member_codes
  for all using (true) with check (true);

-- GoSail Club 会员 profiles 表（2026-07-12 新增；Google/GitHub 登录 + Dashboard）
-- id 直接引用 auth.users，注册时自动建行；role/hub_key 在兑换码绑定时写入
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'free',   -- free / member / pro / partner
  github_username text,
  hub_key text,
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
-- 用户只能看/改自己那一行（依赖 auth.uid()，Dashboard 用登录 session 调用）
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- 新用户注册（Google/GitHub OAuth）自动建 profiles 行
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
