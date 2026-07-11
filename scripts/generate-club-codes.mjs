/**
 * 批量生成 GoSail Club 兑换码，写入 KV（club_code:<CODE> = "unused"）。
 *   node scripts/generate-club-codes.mjs 20        # 生成 20 个
 *   node scripts/generate-club-codes.mjs --list    # 列出所有码及状态
 *
 * 需要 .env.local: KV_REST_API_URL + KV_REST_API_TOKEN（从 Vercel 复制）
 * Supabase 可用时也会同步插入 member_codes 表（失败忽略）。
 */
import fs from "fs";
import crypto from "crypto";

for (const l of fs.readFileSync(".env.local", "utf-8").split("\n")) {
  const t = l.trim(); if (!t || t.startsWith("#")) continue;
  const e = t.indexOf("="); if (e < 0) continue;
  let v = t.slice(e + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  process.env[t.slice(0, e).trim()] = v;
}

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (!KV_URL || !KV_TOKEN) { console.error("❌ 缺 KV 配置（KV_REST_API_URL / KV_REST_API_TOKEN，从 Vercel 项目环境变量复制到 .env.local）"); process.exit(1); }

const kv = (path) => fetch(`${KV_URL}/${path}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` }, method: "POST" });

if (process.argv[2] === "--list") {
  const res = await kv(`keys/${encodeURIComponent("club_code:*")}`);
  const { result: keys } = await res.json();
  if (!keys?.length) { console.log("（还没有兑换码）"); process.exit(0); }
  for (const k of keys.sort()) {
    const vr = await kv(`get/${encodeURIComponent(k)}`);
    const { result } = await vr.json();
    const code = k.replace("club_code:", "");
    if (result === "unused") console.log(`${code}  ⬜ 未使用`);
    else {
      try { const a = JSON.parse(result); console.log(`${code}  ✅ @${a.github} (${a.email}) ${a.activated_at?.slice(0,10)} → ${a.expires_at?.slice(0,10)}`); }
      catch { console.log(`${code}  ❓ ${String(result).slice(0, 40)}`); }
    }
  }
  process.exit(0);
}

const count = parseInt(process.argv[2] || "10", 10);
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉易混淆的 I/O/0/1
const genCode = () => "GSC-" + Array.from(crypto.randomBytes(8)).map((b) => ALPHABET[b % ALPHABET.length]).join("");

const codes = [];
for (let i = 0; i < count; i++) {
  const code = genCode();
  // NX：已存在则不覆盖（防撞码）
  const res = await kv(`set/${encodeURIComponent("club_code:" + code)}/unused/nx`);
  const { result } = await res.json();
  if (result === "OK") codes.push(code);
  else i--; // 撞了重生成
}

console.log(`✅ 生成 ${codes.length} 个兑换码：\n`);
codes.forEach((c) => console.log(`  ${c}`));
console.log(`\n付款确认后发一个给会员，激活地址：https://jasonzhu.ai/zh/club/activate`);
