-- profiles：登录用户不能再直接改自己那一行（2026-11-10）
--
-- 以前的策略是 for update using (auth.uid() = id)，不限列、没有 WITH CHECK：
-- 任何注册用户拿页面里的公开 key + 自己的登录 token，就能把自己的 role 改成 member、
-- expires_at 改到任意时间，直接看会员内容、进付费 GitHub team。
--
-- 现在 profiles 的写入全部走服务端 service key（redeem / link-github / 会员中心按邮箱认领），
-- 用户只保留「看自己那一行」。
--
-- 顺序：先部署改用 service key 的代码，再跑这个文件（反过来会让兑换码绑定写不进 profiles）。
-- 可以重复跑。

drop policy if exists "Users can update own profile" on public.profiles;
revoke insert, update, delete on public.profiles from anon, authenticated;

-- 核对（应该只剩 SELECT 一条策略；authenticated 没有 UPDATE）：
--   select policyname, cmd from pg_policies where tablename = 'profiles';
--   select privilege_type from information_schema.table_privileges
--    where table_name = 'profiles' and grantee = 'authenticated';
