/**
 * 批量生成 GoSail Club 兑换码，写入 KV（club_code:<CODE> = "unused"）。
 *   node scripts/generate-club-codes.mjs 20                              # 生成 20 个
 *   node scripts/generate-club-codes.mjs 1 --note "微信：张三，10/11 转账"   # 生成并直接记下发给谁
 *   node scripts/generate-club-codes.mjs --note GSC-XXXXXXXX "微信：张三"    # 给已有的码补 / 改备注（发码时记一笔）
 *   node scripts/generate-club-codes.mjs --note GSC-XXXXXXXX ""             # 清掉备注
 *   node scripts/generate-club-codes.mjs --list                          # 列出所有码、状态和备注
 *
 * 备注单独存在 club_code_note:<CODE>，不动 club_code:<CODE> 的值（激活接口靠它是不是 "unused" 判断能不能用）。
 * 记备注是因为码常在微信里发、会员激活时只填邮箱：2026-10 结返佣时对不上推荐人是谁。settle-referrals.mjs 会读这里的备注。
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

// 带中文的值走 JSON 命令体，不拼进 URL
const cmd = async (...args) => (await (await fetch(KV_URL, { method: "POST", headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(args) })).json()).result;
const noteKey = (code) => "club_code_note:" + code;
const argv = process.argv.slice(2);
const ni = argv.indexOf("--note");

// --note <CODE> <备注>：给已有的码记备注
if (ni >= 0 && /^GSC-[A-Z0-9]{8}$/i.test(argv[ni + 1] || "")) {
  const code = argv[ni + 1].toUpperCase(), note = argv[ni + 2];
  if (note === undefined) { console.error('❌ 用法：--note GSC-XXXXXXXX "备注"（传 "" 清掉备注）'); process.exit(1); }
  const cur = await cmd("GET", "club_code:" + code);
  if (cur === null) { console.error(`❌ 兑换码 ${code} 不存在`); process.exit(1); }
  if (note.trim()) { await cmd("SET", noteKey(code), note.trim()); console.log(`✅ ${code} 备注：${note.trim()}`); }
  else { await cmd("DEL", noteKey(code)); console.log(`✅ ${code} 备注已清掉`); }
  process.exit(0);
}

if (process.argv[2] === "--list") {
  const res = await kv(`keys/${encodeURIComponent("club_code:*")}`);
  const { result: keys } = await res.json();
  if (!keys?.length) { console.log("（还没有兑换码）"); process.exit(0); }
  for (const k of keys.sort()) {
    const vr = await kv(`get/${encodeURIComponent(k)}`);
    const { result } = await vr.json();
    const code = k.replace("club_code:", "");
    const note = await cmd("GET", noteKey(code));
    const tail = note ? `  📝 ${note}` : "";
    if (result === "unused") console.log(`${code}  ⬜ 未使用${tail}`);
    else if (result === "revoked") console.log(`${code}  🚫 已作废（2026-10-05 因 member_codes 表曾公开可读而作废）${tail}`);
    else {
      try { const a = JSON.parse(result); console.log(`${code}  ✅ ${a.github ? `@${a.github} ` : ""}(${a.email}) ${a.activated_at?.slice(0,10)} → ${a.expires_at?.slice(0,10)}${tail}`); }
      catch { console.log(`${code}  ❓ ${String(result).slice(0, 40)}${tail}`); }
    }
  }
  process.exit(0);
}

// 生成时带 --note：这批码都记同一条备注（一般配合数量 1，现生成现发）
const genNote = ni >= 0 ? (argv[ni + 1] || "").trim() : "";
if (ni >= 0 && !genNote) { console.error('❌ --note 后面要跟备注，如：1 --note "微信：张三"'); process.exit(1); }
const count = parseInt(/^\d+$/.test(argv[0] || "") ? argv[0] : ni >= 0 ? "1" : "10", 10);
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉易混淆的 I/O/0/1
const genCode = () => "GSC-" + Array.from(crypto.randomBytes(8)).map((b) => ALPHABET[b % ALPHABET.length]).join("");

const codes = [];
for (let i = 0; i < count; i++) {
  const code = genCode();
  // NX：已存在则不覆盖（防撞码）
  const res = await kv(`set/${encodeURIComponent("club_code:" + code)}/unused/nx`);
  const { result } = await res.json();
  if (result === "OK") { codes.push(code); if (genNote) await cmd("SET", noteKey(code), genNote); }
  else i--; // 撞了重生成
}

console.log(`✅ 生成 ${codes.length} 个兑换码：\n`);
codes.forEach((c) => console.log(`  ${c}${genNote ? `  📝 ${genNote}` : ""}`));
console.log(`\n付款确认后发一个给会员，激活地址：https://jasonzhu.ai/zh/club/activate`);
if (!genNote) console.log(`发码时记一笔给了谁：node scripts/generate-club-codes.mjs --note <码> "微信：xxx"`);
