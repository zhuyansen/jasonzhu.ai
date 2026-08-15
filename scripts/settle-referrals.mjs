#!/usr/bin/env node
/**
 * GoSail Club 分销结算工具（现金返佣 30%，人工月结微信转账）。
 *
 *   node scripts/settle-referrals.mjs                 # 列出所有待结算，按推荐人分组，附微信号
 *   node scripts/settle-referrals.mjs --all           # 列出全部（含已结算）
 *   node scripts/settle-referrals.mjs --settle <orderId> [orderId...]   # 转账后标记已结
 *   node scripts/settle-referrals.mjs --settle-ref <REFCODE>            # 一次结清某推荐人名下全部待结
 *
 * 数据在 KV：referrals_all（流水）、referral_settled:<orderId>（已结标记）。
 * 推荐人微信号从 Supabase member_codes 按邮箱查（付款时填的 wechat）。
 * 走 curl（本机 Node fetch 连不上 Upstash/Supabase）。
 */
import fs from "fs";
import { execFileSync } from "child_process";

for (const l of fs.readFileSync(".env.local", "utf-8").split("\n")) {
  const t = l.trim(); if (!t || t.startsWith("#")) continue;
  const e = t.indexOf("="); if (e < 0) continue;
  let v = t.slice(e + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  process.env[t.slice(0, e).trim()] = v;
}

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!KV_URL || !KV_TOKEN) { console.error("❌ 缺 KV 配置"); process.exit(1); }

const curl = (args) => execFileSync("curl", ["-s", "--http1.1", ...args], { encoding: "utf-8" });
const kv = (path) => JSON.parse(curl(["-X", "POST", `${KV_URL}/${path}`, "-H", `Authorization: Bearer ${KV_TOKEN}`])).result;

function wechatOf(email) {
  if (!SB_URL || !SB_KEY) return "";
  try {
    const rows = JSON.parse(curl([
      `${SB_URL}/rest/v1/member_codes?email=eq.${encodeURIComponent(email)}&status=eq.activated&select=wechat,github_username&limit=1`,
      "-H", `apikey: ${SB_KEY}`, "-H", `Authorization: Bearer ${SB_KEY}`,
    ]));
    const r = rows[0] || {};
    return r.wechat || (r.github_username ? `gh:@${r.github_username}` : "");
  } catch { return ""; }
}

const args = process.argv.slice(2);
const all = (kv("lrange/referrals_all/0/-1") || []).map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
const isSettled = (id) => Boolean(kv(`get/${encodeURIComponent("referral_settled:" + id)}`));

if (args[0] === "--settle") {
  const ids = args.slice(1);
  if (!ids.length) { console.error("用法：--settle <orderId> [orderId...]"); process.exit(1); }
  for (const id of ids) {
    const rec = all.find((r) => r.orderId === id);
    if (!rec) { console.log(`  ⚠️ ${id}: 不在流水里，跳过`); continue; }
    kv(`set/${encodeURIComponent("referral_settled:" + id)}/${encodeURIComponent(new Date().toISOString())}`);
    console.log(`  ✅ ${id} → ${rec.referrerEmail} ¥${rec.commission} 已标记结算`);
  }
  process.exit(0);
}

if (args[0] === "--settle-ref") {
  const code = String(args[1] || "").toUpperCase();
  const targets = all.filter((r) => r.refCode === code && !isSettled(r.orderId));
  if (!targets.length) { console.log(`推荐码 ${code} 没有待结算记录`); process.exit(0); }
  let sum = 0;
  for (const r of targets) {
    kv(`set/${encodeURIComponent("referral_settled:" + r.orderId)}/${encodeURIComponent(new Date().toISOString())}`);
    sum += r.commission;
    console.log(`  ✅ ${r.orderId} ¥${r.commission}`);
  }
  console.log(`\n${code}（${targets[0].referrerEmail}）本次结清 ${targets.length} 单，共 ¥${sum}`);
  process.exit(0);
}

const showAll = args.includes("--all");
const groups = new Map();
for (const r of all) {
  const settled = isSettled(r.orderId);
  if (!showAll && settled) continue;
  const g = groups.get(r.refCode) || { email: r.referrerEmail, items: [], pending: 0, settled: 0 };
  g.items.push({ ...r, settled });
  if (settled) g.settled += r.commission; else g.pending += r.commission;
  groups.set(r.refCode, g);
}

if (!groups.size) { console.log(showAll ? "还没有任何分销记录" : "🎉 没有待结算的返佣"); process.exit(0); }

let total = 0;
for (const [code, g] of groups) {
  const wx = wechatOf(g.email);
  console.log(`\n👤 ${g.email}  推荐码 ${code}  微信：${wx || "（未知，去 member_codes 查）"}`);
  for (const it of g.items) {
    console.log(`   ${it.settled ? "✅" : "⏳"} ${it.createdAt.slice(0, 10)}  ${it.orderId}  ${it.buyerEmail}  ¥${it.amount} → 返 ¥${it.commission}`);
  }
  console.log(`   待结算 ¥${g.pending}${showAll ? `  已结算 ¥${g.settled}` : ""}`);
  total += g.pending;
}
console.log(`\n💰 本期应付合计：¥${total}`);
console.log(`转账后：node scripts/settle-referrals.mjs --settle-ref <推荐码>  或  --settle <orderId>...`);
