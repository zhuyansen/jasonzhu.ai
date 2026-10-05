import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let warned = false;

/**
 * 服务端专用 Supabase 客户端（API route / Server Component），绝不能在 "use client" 文件里引用。
 *
 * 优先用 SUPABASE_SERVICE_KEY（不带 NEXT_PUBLIC_，不会打进浏览器包，绕过 RLS）。
 * 2026-10-05 修复：以前这里用公开的 anon key，为了让服务端能读写，subscribers / member_codes /
 * club_applications 的 RLS 只能放成 USING (true)——结果任何人拿页面里的 anon key 就能读出全部订阅邮箱、
 * 改写会员激活码。现在服务端走 service key，那几张表对 anon 一律不开放（supabase/lock-down-rls.sql）。
 * 没配 service key 时退回 anon key 并告警，保证部署顺序（先上代码、再加环境变量、最后收紧 RLS）不出事故。
 */
export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey || supabaseAnonKey;

  if (!supabaseUrl || !key || supabaseUrl === "your_supabase_url_here") {
    throw new Error("Supabase environment variables not configured");
  }
  if (!serviceKey && !warned) {
    warned = true;
    console.warn("[supabase] SUPABASE_SERVICE_KEY 未配置，退回 anon key；收紧 RLS 后订阅/会员接口会失败");
  }

  _supabase = createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _supabase;
}

/** 当前是否在用 service key（给管理后台显示状态用） */
export function usingServiceKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_KEY);
}
