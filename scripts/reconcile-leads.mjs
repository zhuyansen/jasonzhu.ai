/**
 * 把 Supabase 宕机期间兜底进 KV 的订阅线索回灌进 subscribers 主表，
 * 再把同期没写进去的退订（KV hash pending_unsubscribes，2026-11-06 起）写回 unsubscribed_at。
 * Supabase 恢复后跑一次：
 *   node scripts/reconcile-leads.mjs
 *
 * 需要 .env.local 里有：KV_REST_API_URL, KV_REST_API_TOKEN,
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY(或 ANON_KEY；写回退订必须是 service key)
 */
import fs from "fs";

for (const l of fs.readFileSync(".env.local", "utf-8").split("\n")) {
  const t = l.trim(); if (!t || t.startsWith("#")) continue;
  const e = t.indexOf("="); if (e < 0) continue;
  let v = t.slice(e + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  process.env[t.slice(0, e).trim()] = v;
}

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL, KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!KV_URL || !KV_TOKEN) { console.error("❌ 缺 KV 配置"); process.exit(1); }
if (!SB_URL || !SB_KEY) { console.error("❌ 缺 Supabase 配置"); process.exit(1); }

const KV_AUTH = { Authorization: `Bearer ${KV_TOKEN}` };

async function reconcileLeads() {
  // 取出全部待回灌线索
  const lr = await fetch(`${KV_URL}/lrange/pending_subscribers/0/-1`, { headers: KV_AUTH });
  const { result } = await lr.json();
  const leads = (result || []).map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
  console.log(`📥 KV 待回灌线索：${leads.length} 条`);
  if (!leads.length) return;

  let ok = 0, dup = 0, fail = 0;
  for (const lead of leads) {
    const res = await fetch(`${SB_URL}/rest/v1/subscribers`, {
      method: "POST",
      headers: {
        apikey: SB_KEY, authorization: `Bearer ${SB_KEY}`,
        "content-type": "application/json", Prefer: "return=minimal",
      },
      body: JSON.stringify({ email: lead.email, source: lead.source || "website", subscribed_at: lead.ts || new Date().toISOString() }),
    });
    if (res.ok) ok++;
    else if (res.status === 409) dup++; // 已存在
    else { fail++; console.log(`  ⚠️ ${lead.email}: HTTP ${res.status}`); }
  }
  console.log(`✅ 回灌完成：新增 ${ok}，已存在 ${dup}，失败 ${fail}`);

  // 全部成功(无 fail)才清空 KV，避免丢线索
  if (fail === 0) {
    await fetch(`${KV_URL}/del/pending_subscribers`, { headers: KV_AUTH });
    console.log("🧹 已清空 KV 备份队列");
  } else {
    console.log("⚠️ 有失败，保留 KV 队列，修好后重跑");
  }
}

// /api/unsubscribe 写 Supabase 失败时，退订记在 KV hash pending_unsubscribes（订阅者 id → 退订时间）
async function reconcileUnsubscribes() {
  const r = await fetch(`${KV_URL}/hgetall/pending_unsubscribes`, { headers: KV_AUTH });
  const flat = (await r.json()).result || [];
  const pending = [];
  for (let i = 0; i + 1 < flat.length; i += 2) pending.push({ id: flat[i], ts: flat[i + 1] });
  console.log(`📥 KV 待写回退订：${pending.length} 条`);
  if (!pending.length) return;
  // anon key 受 RLS 限制，PATCH 匹配 0 行也返回成功——那样会把退订从 KV 删掉却没写进库
  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.log("⚠️ 写回退订需要 SUPABASE_SERVICE_KEY，这次跳过，KV 里的退订保留");
    return;
  }

  let ok = 0, fail = 0;
  for (const { id, ts } of pending) {
    // 只改还在订阅的行：已经是退订状态的不改时间（之后重新订阅过的人，接口已经把这条从 KV 撤掉了）
    const res = await fetch(`${SB_URL}/rest/v1/subscribers?id=eq.${encodeURIComponent(id)}&unsubscribed_at=is.null`, {
      method: "PATCH",
      headers: {
        apikey: SB_KEY, authorization: `Bearer ${SB_KEY}`,
        "content-type": "application/json", Prefer: "return=minimal",
      },
      body: JSON.stringify({ unsubscribed_at: ts }),
    });
    if (res.ok) {
      ok++;
      await fetch(`${KV_URL}/hdel/pending_unsubscribes/${encodeURIComponent(id)}`, { headers: KV_AUTH });
    } else {
      fail++;
      console.log(`  ⚠️ ${id}: HTTP ${res.status}`);
    }
  }
  console.log(`✅ 退订写回：成功 ${ok}，失败 ${fail}${fail ? "（失败的留在 KV，修好后重跑）" : ""}`);
}

await reconcileLeads();
await reconcileUnsubscribes();
