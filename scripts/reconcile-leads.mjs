/**
 * 把 Supabase 宕机期间兜底进 KV 的订阅线索回灌进 subscribers 主表。
 * Supabase 恢复后跑一次：
 *   node scripts/reconcile-leads.mjs
 *
 * 需要 .env.local 里有：KV_REST_API_URL, KV_REST_API_TOKEN,
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY(或 ANON_KEY)
 */
import fs from "fs";

for (const l of fs.readFileSync(".env.local", "utf-8").split("\n")) {
  const t = l.trim(); if (!t || t.startsWith("#")) continue;
  const e = t.indexOf("="); if (e < 0) continue;
  let v = t.slice(e + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  process.env[t.slice(0, e).trim()] = v;
}

const KV_URL = process.env.KV_REST_API_URL, KV_TOKEN = process.env.KV_REST_API_TOKEN;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!KV_URL || !KV_TOKEN) { console.error("❌ 缺 KV 配置"); process.exit(1); }
if (!SB_URL || !SB_KEY) { console.error("❌ 缺 Supabase 配置"); process.exit(1); }

// 取出全部待回灌线索
const lr = await fetch(`${KV_URL}/lrange/pending_subscribers/0/-1`, {
  headers: { Authorization: `Bearer ${KV_TOKEN}` },
});
const { result } = await lr.json();
const leads = (result || []).map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
console.log(`📥 KV 待回灌线索：${leads.length} 条`);
if (!leads.length) process.exit(0);

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
  await fetch(`${KV_URL}/del/pending_subscribers`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
  console.log("🧹 已清空 KV 备份队列");
} else {
  console.log("⚠️ 有失败，保留 KV 队列，修好后重跑");
}
