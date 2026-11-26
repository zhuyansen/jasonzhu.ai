-- 2026-11-26「从哪知道这里」：subscribers 加两列。订阅框选填的那一项，用来数有多少订阅是 AI 助手带来的（GA4 认不出来）。
--   heard_from       固定值：chatgpt / perplexity / gemini / claude / other_ai / google / bing / x / youtube / xiaohongshu / wechat / friend / other
--                    （白名单在 src/lib/heard-from.ts）；空 = 没填，或者是加这一列之前订阅的
--   heard_from_note  选「其他」时填的说明，最多 200 字
-- 先跑后跑都行，可以重复跑：没有这两列时 /api/subscribe 照常订阅，只是这一项写不进去（Vercel 日志里有 "[subscribe] heard_from not saved"），
-- 日报那一行显示「未接入」。权限不变：subscribers 只有服务端 service key 能读写（supabase/lock-down-rls.sql），这里不加策略。

alter table public.subscribers
  add column if not exists heard_from text,
  add column if not exists heard_from_note text;

-- 检查：应返回两行 heard_from / heard_from_note，都是 text、可空
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'subscribers' and column_name in ('heard_from', 'heard_from_note');
