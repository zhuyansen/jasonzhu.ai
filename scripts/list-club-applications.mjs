/**
 * 查看 GoSail Club 入会申请（KV 兜底队列）。
 *   node scripts/list-club-applications.mjs
 */
import fs from "fs";

for (const l of fs.readFileSync(".env.local", "utf-8").split("\n")) {
  const t = l.trim(); if (!t || t.startsWith("#")) continue;
  const e = t.indexOf("="); if (e < 0) continue;
  let v = t.slice(e + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  process.env[t.slice(0, e).trim()] = v;
}

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (!KV_URL || !KV_TOKEN) { console.error("❌ 缺 KV 配置"); process.exit(1); }

const res = await fetch(`${KV_URL}/lrange/pending_club_applications/0/-1`, {
  headers: { Authorization: `Bearer ${KV_TOKEN}` },
});
const { result } = await res.json();
const apps = (result || []).map((x) => JSON.parse(x))
  .filter((a) => !String(a.email || "").endsWith("@example.com")); // 过滤测试数据

if (!apps.length) { console.log("（还没有真实申请）"); process.exit(0); }

const TIER = { l1: "启航版", l2: "进阶版", l3: "合伙人版" };
console.log(`共 ${apps.length} 条申请：\n`);
for (const a of apps) {
  console.log(`■ ${a.name}  [${TIER[a.tier] || a.tier}]  ${a.created_at?.slice(0, 16) || ""}`);
  console.log(`  微信: ${a.wechat}  邮箱: ${a.email}  角色: ${a.role || "-"}`);
  if (a.project) console.log(`  在做: ${a.project}`);
  if (a.needs) console.log(`  想要: ${a.needs}`);
  if (a.referral) console.log(`  推荐人: ${a.referral}`);
  console.log();
}
