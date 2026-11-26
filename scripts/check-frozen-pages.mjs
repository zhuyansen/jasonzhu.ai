/**
 * 核对 src/lib/frozen-pages.ts 的冻结页名单和 GEO 实验的题库是不是一致（2026-11-26）：
 *   应冻结 = ops/geo/questions.json 的全部 target_url
 *          + ops/geo/experiments.json 的 experiments[].treated / control 题号在 ops/geo/questions*.json 里对应的 target_url
 * 不一致（或者实验里有题号查不到）就列出来、以 1 退出。只读，不改文件。
 *   node scripts/check-frozen-pages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const geo = path.join(root, "ops/geo");
const read = (f) => JSON.parse(fs.readFileSync(path.join(geo, f), "utf8"));
const toPath = (u) => new URL(u).pathname.replace(/\/+$/, "") || "/";

const byId = new Map();
for (const f of fs.readdirSync(geo).filter((f) => /^questions.*\.json$/.test(f)).sort()) {
  for (const q of read(f).questions) byId.set(q.id, [...(byId.get(q.id) ?? []), q.target_url]);
}

const want = new Set(read("questions.json").questions.map((q) => toPath(q.target_url)));
const unknown = [];
for (const e of read("experiments.json").experiments) {
  for (const id of [...(e.treated ?? []), ...(e.control ?? [])]) {
    const urls = byId.get(id);
    if (!urls) unknown.push(`${e.id}: ${id}`);
    else urls.forEach((u) => want.add(toPath(u)));
  }
}

const src = fs.readFileSync(path.join(root, "src/lib/frozen-pages.ts"), "utf8");
const list = src.match(/FROZEN_PATHS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)/);
if (!list) {
  console.error("❌ src/lib/frozen-pages.ts 里没找到 FROZEN_PATHS 名单");
  process.exit(1);
}
const have = new Set([...list[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]));

const missing = [...want].filter((p) => !have.has(p)).sort();
const extra = [...have].filter((p) => !want.has(p)).sort();
for (const u of unknown) console.error(`❌ experiments.json 的题号在 questions*.json 里查不到：${u}`);
for (const p of missing) console.error(`❌ 应冻结、名单里没有：${p}`);
for (const p of extra) console.error(`⚠️ 名单里有、实验里已经没有：${p}（实验结束了就删掉）`);
if (unknown.length || missing.length || extra.length) process.exit(1);
console.log(`✅ 冻结页名单和 GEO 实验一致：${have.size} 个页面`);
