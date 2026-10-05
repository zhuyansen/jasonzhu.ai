-- 2026-10-05 收紧 RLS（修复：公开的 anon key 能读出全部订阅邮箱、会员激活码、Club 申请人联系方式，且能改删）
--
-- 前提（顺序不能反）：
--   1. Vercel 已配置 SUPABASE_SERVICE_KEY，且之后重新部署过——网站服务端改用 service key（绕过 RLS）
--   2. 再在 Supabase → SQL Editor 运行本文件
-- 运行后：隐私表对 anon / authenticated 完全不开放；公开内容表只读；所有写入只能走服务端 service key。
-- profiles 不在这里：它按 auth.uid() 限定本人，已经是对的。

begin;

-- 1) 删掉这些表上现有的全部策略（名字不一，统一清掉再重建）
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('subscribers', 'member_codes', 'club_applications',
                        'news_items', 'news_digests', 'page_views', 'page_likes')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 2) 全部开启 RLS（没有策略 = anon / authenticated 什么都做不了；service role 不受 RLS 限制）
alter table if exists public.subscribers       enable row level security;
alter table if exists public.member_codes      enable row level security;
alter table if exists public.club_applications enable row level security;
alter table if exists public.news_items        enable row level security;
alter table if exists public.news_digests      enable row level security;
alter table if exists public.page_views        enable row level security;
alter table if exists public.page_likes        enable row level security;

-- 3) 公开内容只给读（网站上本来就公开展示；写入只能走服务端）
create policy "public read news_items"   on public.news_items   for select using (true);
create policy "public read news_digests" on public.news_digests for select using (true);
create policy "public read page_views"   on public.page_views   for select using (true);
create policy "public read page_likes"   on public.page_likes   for select using (true);

-- 4) 阅读数 / 点赞的自增函数只给服务端调（以前 anon 能直接调 RPC，绕过接口的 slug 白名单刷数）
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('increment_page_views', 'increment_page_likes')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
  end loop;
end $$;

commit;

-- 5) 检查结果：应该只剩上面 4 条 "public read ..." 策略
select tablename, policyname, cmd from pg_policies
where schemaname = 'public'
  and tablename in ('subscribers', 'member_codes', 'club_applications',
                    'news_items', 'news_digests', 'page_views', 'page_likes')
order by tablename;
