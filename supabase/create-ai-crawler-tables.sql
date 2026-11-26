-- 2026-11-26 AI 爬虫来访：长期表（方案 A1，替掉本机 GEOInflow）
--
-- 谁写：
--   ai_crawler_hits   Supabase 函数 vercel-drain（supabase/functions/vercel-drain）收到 Vercel Log Drain 时逐条写
--   bot_ip_ranges     .github/workflows/bot-ip-ranges.yml 每天抓各家官方 IP 段（ops/geo/bot_ip_ranges.py）
--   ai_crawler_daily  ops/geo/geoinflow_export.py 一次性导入 GEOInflow 的历史（2026-10-26 起），以后也可放每日汇总
-- 谁读：ops/geo/crawler_stats.py、read_vs_cited.py、crawler_report.py（经 ops/geo/crawler_db.py，service key）
--
-- 隐私：不存完整 IP，也不存能还原 IP 的东西（不存哈希）。只存网段：IPv4 /24、IPv6 /48。
--       路径不带问号、井号后面的部分。不存 User-Agent 原文；认不出的爬虫只存 UA 里像爬虫名的那个词（agent）。
-- 权限：照 lock-down-rls.sql 的做法，开 RLS、不建策略，anon / authenticated 什么都做不了，只有 service role 能读写。
--
-- 可以重复跑（全是 if not exists / or replace）。

begin;

-- ───────────── 每条爬虫请求 ─────────────
create table if not exists public.ai_crawler_hits (
  id            text primary key,                 -- Vercel 的 requestId（没有就用 proxy.vercelId、日志 id）；Vercel 重发同一批不会重复记
  ts            timestamptz not null,             -- 请求时间（proxy.timestamp）
  received_at   timestamptz not null default now(),
  host          text not null,                    -- jasonzhu.ai / www.jasonzhu.ai
  path          text not null,                    -- 只有路径，不带查询参数；最长 500
  status        smallint not null,                -- 防火墙拦下又没有状态码的记 403（和 GEOInflow 一样）
  http_method   text not null default 'GET',
  source        text,                             -- Vercel 日志来源：static / lambda / firewall / redirect / external
  bot           text not null,                    -- GEOInflow 同一套 UA 目录；认不出是「其他」
  vendor        text not null,                    -- 认不出是空串（和 GEOInflow 一样）
  bot_type      text not null,                    -- 训练 / 搜索 / 用户触发 / 传统搜索 / 其他
  agent         text,                             -- 只给「其他」：UA 里像爬虫名的那个词，方便以后补目录
  verification  text not null check (verification in ('verified', 'range_mismatch', 'no_published_ranges', 'unknown')),
  method        text not null check (method in ('ip_range', 'rdns', 'none')),
  reason        text not null default '',         -- 细一点的原因，和 GEOInflow 的 verification_reason 同一套词，见下
  ip_prefix     text not null default '',         -- IPv4 a.b.c.0/24；IPv6 x:y:z::/48
  ja4           text                              -- Vercel 的 ja4Digest（TLS 指纹，不含 IP）
);
-- reason：verified_range / range_mismatch（按 IP 段）；verified_rdns / rdns_mismatch（按官方反向 DNS 规则）；
--         no_official_source（这家没公布 IP 段或反向 DNS 规则）；unmapped_identity（UA 认不出是谁）；
--         stale_snapshot（这家的 IP 段超过 7 天没刷新，不核）；missing_snapshot（表里没有这家的 IP 段）；
--         dns_unavailable / dns_timeout（反向 DNS 查不了）；untrusted_ip（日志里没有能用的 IP）
create index if not exists ai_crawler_hits_ts on public.ai_crawler_hits (ts desc);
create index if not exists ai_crawler_hits_bot_ts on public.ai_crawler_hits (bot, ts desc);

-- ───────────── 各家官方 IP 段 ─────────────
create table if not exists public.bot_ip_ranges (
  vendor        text not null,
  bot           text not null,                    -- 和 ai_crawler_hits.bot 同名
  cidr          cidr not null,
  source_url    text not null,                    -- 从哪抓的（官方地址）
  published_at  timestamptz,                      -- 官方文件里写的生成时间（creationTime），没有就空
  fetched_at    timestamptz not null default now(),
  primary key (bot, cidr)
);
create index if not exists bot_ip_ranges_fetched on public.bot_ip_ranges (bot, fetched_at desc);

-- 一个机器人的 IP 段整份换掉（同一个事务：要么全换、要么不动，不会出现只删了没写的空档）
create or replace function public.replace_bot_ip_ranges(
  p_vendor text, p_bot text, p_source_url text, p_cidrs text[], p_published_at timestamptz
) returns integer
language plpgsql
set search_path = public
as $$
declare n integer;
begin
  if p_cidrs is null or cardinality(p_cidrs) = 0 then
    raise exception 'empty range list for % (%), refusing to wipe it', p_bot, p_source_url;
  end if;
  delete from public.bot_ip_ranges where bot = p_bot;
  insert into public.bot_ip_ranges (vendor, bot, cidr, source_url, published_at, fetched_at)
  select p_vendor, p_bot, c::cidr, p_source_url, p_published_at, now()
  from (select distinct unnest(p_cidrs) as c) s;
  get diagnostics n = row_count;
  return n;
end $$;

-- 函数 vercel-drain 读 IP 段用：一个机器人一行（REST 一页最多 1000 行，逐条读要翻页）
create or replace function public.bot_ip_ranges_compact()
returns table (bot text, fetched_at timestamptz, cidrs text[])
language sql stable
set search_path = public
as $$
  select bot, min(fetched_at), array_agg(cidr::text order by cidr)
  from public.bot_ip_ranges group by bot
$$;

-- ───────────── 每日汇总（历史） ─────────────
-- origin = 'geoinflow'：从 GEOInflow 导入的历史，verification / reason 是 GEOInflow 的旧标签
--   （verified_range / range_mismatch / unverified + verification_reason），label_set 标成 'geoinflow'，和新表的标签不混。
-- 用户触发的爬虫（bot_type = 用户触发）另带秒级时间 at：read_vs_cited.py 要按北京时间整天、去掉面板运行的时段来数，
--   按天汇总做不到；其余爬虫 at 为空，一天一行。
-- hours：这一天哪些 UTC 小时有数据（24 位掩码，第 h 位 = h 点），同一天每行一样；crawler_stats.py 用它判断是不是整天。
create table if not exists public.ai_crawler_daily (
  day           date not null,
  at            timestamptz,                      -- 只给用户触发的爬虫：精确到秒
  origin        text not null check (origin in ('geoinflow', 'hits')),
  label_set     text not null check (label_set in ('geoinflow', 'a1')),
  bot           text not null,
  vendor        text not null,
  bot_type      text not null,
  verification  text not null,
  reason        text not null default '',
  status        smallint not null,
  path          text not null,
  n             integer not null check (n > 0),
  hours         integer not null default 0
);
create index if not exists ai_crawler_daily_day on public.ai_crawler_daily (origin, day);
create index if not exists ai_crawler_daily_at on public.ai_crawler_daily (bot, at) where at is not null;
-- 这一组里最早一条的时间（crawler_stats.py 的 first_request_utc 要用）
alter table public.ai_crawler_daily add column if not exists first_at timestamptz;

-- ───────────── 历史 + 新表，一个视图 ─────────────
-- 2026-11-26 13:35 UTC（CUTOVER，vercel-drain v4 上线于 13:30:54 UTC，和 ops/geo/crawler_db.py 一致）之前用 GEOInflow 导出的历史，之后用 ai_crawler_hits。
-- 历史只导 CUTOVER 之前的请求，所以两边不重叠；同一天（11-26）两边的数加起来就是全天。
-- verified：两套标签统一成「IP（或反向 DNS）核实过」；verification / label_set 保留原标签。
create or replace view public.ai_crawler_all with (security_invoker = true) as
  select day, at as t, first_at, hours as hour_mask, origin, label_set, bot, vendor, bot_type,
         verification, reason, verification = 'verified_range' as verified, status, path, n
  from public.ai_crawler_daily
  where origin = 'geoinflow'
  union all
  select (ts at time zone 'UTC')::date, ts, ts, 1 << extract(hour from ts at time zone 'UTC')::int, 'hits', 'a1',
         bot, vendor, bot_type, verification, reason, verification = 'verified', status, path, 1
  from public.ai_crawler_hits
  where ts >= timestamptz '2026-11-26 13:35:00+00';

-- REST 路的只读查询（ops/geo/crawler_db.py）：只收 select / with，包成子查询（子查询里不能有写操作的 WITH），
-- 事务设成只读，60 秒超时。只给 service role。
create or replace function public.ai_crawler_sql(q text)
returns jsonb
language plpgsql
set search_path = public
as $$
declare result jsonb;
begin
  if q !~* '^\s*(select|with)\s' then
    raise exception 'ai_crawler_sql: only a single select';
  end if;
  set local transaction_read_only = on;
  set local statement_timeout = '60s';
  execute format('select coalesce(jsonb_agg(t), ''[]''::jsonb) from (%s) t', q) into result;
  return result;
end $$;

-- ───────────── 权限：只有 service role ─────────────
alter table public.ai_crawler_hits  enable row level security;
alter table public.bot_ip_ranges    enable row level security;
alter table public.ai_crawler_daily enable row level security;
revoke all on table public.ai_crawler_hits, public.bot_ip_ranges, public.ai_crawler_daily from anon, authenticated;
revoke execute on function public.replace_bot_ip_ranges(text, text, text, text[], timestamptz) from public, anon, authenticated;
grant execute on function public.replace_bot_ip_ranges(text, text, text, text[], timestamptz) to service_role;
revoke execute on function public.bot_ip_ranges_compact() from public, anon, authenticated;
grant execute on function public.bot_ip_ranges_compact() to service_role;
revoke all on table public.ai_crawler_all from anon, authenticated;
revoke execute on function public.ai_crawler_sql(text) from public, anon, authenticated;
grant execute on function public.ai_crawler_sql(text) to service_role;

commit;

-- 检查：三张表 RLS 都开着、没有策略
select c.relname, c.relrowsecurity as rls,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('ai_crawler_hits', 'bot_ip_ranges', 'ai_crawler_daily')
order by 1;
