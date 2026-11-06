-- 2026-11-06 退订：subscribers 加 unsubscribed_at（空 = 在订阅；有值 = 退订时间）。
-- /api/unsubscribe 写它；快讯 / 周报的发信脚本跳过有值的行；退订的人自己在网站上再订阅会清空它。
--
-- 上线顺序（不能反）：
--   1. 在 Supabase → SQL Editor 运行本文件。只加一列，现在线上的代码不受影响
--   2. 设 UNSUBSCRIBE_SECRET：GitHub Actions secret + Vercel 环境变量，两边同一个值
--   3. 再推代码。先推代码的话，发信脚本读不到这一列会报错退出，当天快讯不发
--
-- 权限不变：subscribers 只有服务端 service key 能读写（见 supabase/lock-down-rls.sql），这里不加任何策略。
-- subscribers 没开 RLS 或者上面有策略时，整个事务回滚、什么都不改——先查清楚再跑。

begin;

do $$
begin
  if not (select relrowsecurity from pg_class where oid = 'public.subscribers'::regclass) then
    raise exception 'subscribers 没开 RLS：先跑 supabase/lock-down-rls.sql';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'subscribers') then
    raise exception 'subscribers 上有 RLS 策略（应该一条都没有）：先跑 supabase/lock-down-rls.sql';
  end if;
end $$;

alter table public.subscribers add column if not exists unsubscribed_at timestamptz;

comment on column public.subscribers.unsubscribed_at is
  '退订时间；空 = 在订阅。快讯 / 周报的发信脚本跳过有值的行（2026-11-06）';

commit;

-- 检查 1：应返回一行 unsubscribed_at | timestamp with time zone | YES
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'subscribers' and column_name = 'unsubscribed_at';

-- 检查 2：应返回 0 行（subscribers 上没有任何策略，anon / authenticated 读写不了）
select policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'subscribers';
