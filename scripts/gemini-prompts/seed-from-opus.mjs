#!/usr/bin/env node
/**
 * Gemini 4 合集的种子：从 Claude 5.5 库里挑出作者本人说用了 Gemini 4 的作品（2026-11-16 建库时跑）。
 *
 *   源    src/content/opus-prompts/cases.json（已经过 Jev 审核和 Opus 终审的作品）
 *         + scripts/opus-prompts/data/candidates.json（原帖文字，用来判断是不是作者本人提到 Gemini 4）
 *   规则  作者自己写的正文提到 Gemini 4（引用的别人帖子里提到的不算）；
 *         data/seed-curation.json 的 category 给题材（人工逐条定的），dropSeed 是人工剔掉的
 *   输出  src/content/gemini-prompts/gemini-4.json；已有的非种子作品（以后每日收录的）原样保留
 *
 * 不花钱、不调模型。用法：node scripts/gemini-prompts/seed-from-opus.mjs [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { LIBRARY, CATEGORIES, mentionsModel, subModelsOf, rivalsOf } from "./lib/profile.mjs";

const ROOT = path.join(import.meta.dirname, "../..");
const OPUS = path.join(ROOT, "src/content/opus-prompts/cases.json");
const CAND = path.join(ROOT, "scripts/opus-prompts/data/candidates.json");
const CURATION = path.join(import.meta.dirname, "data/seed-curation.json");
const OUT = path.join(ROOT, "src/content/gemini-prompts/gemini-4.json");
const DRY = process.argv.includes("--dry");
// 作者把 Gemini 4 只写在工具列表里、正文写成「4 Argon」的：人工确认过的放这里
const TOOL_ONLY_OK = new Set(["2110078803297055212"]);

const opus = JSON.parse(fs.readFileSync(OPUS, "utf8"));
const cand = new Map(JSON.parse(fs.readFileSync(CAND, "utf8")).map((c) => [c.id, c]));
const curation = JSON.parse(fs.readFileSync(CURATION, "utf8"));
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : null;

const problems = [];
const seeds = [];
for (const c of opus.cases) {
  const text = cand.get(c.id)?.text || "";
  const own = mentionsModel(text) || (TOOL_ONLY_OK.has(c.id) && (c.tools || []).some((t) => mentionsModel(t)));
  if (!own || curation.dropSeed[c.id]) continue;
  const category = curation.category[c.id];
  if (!CATEGORIES.includes(category)) { problems.push(`${c.id} 没有题材分类（在 data/seed-curation.json 里补）`); continue; }
  const said = TOOL_ONLY_OK.has(c.id) ? `${text}\n${(c.tools || []).join(" ")}` : text;
  const v = c.video;
  seeds.push({
    id: c.id, url: c.url, author: c.author, postedAt: c.postedAt, addedAt: c.addedAt, lang: c.lang,
    models: subModelsOf(said), rivals: rivalsOf(text), category,
    title: c.title, summary: c.summary || null, prompt: c.prompt || null,
    referenceAssets: !!c.referenceAssets, tools: c.tools || [], resources: c.resources || [],
    stats: c.stats,
    media: [{ type: "video", url: v.mp4, poster: v.poster, width: v.width, height: v.height, durationSec: v.durationSec }],
    evidence: { via: "seed-from-claude-library", seed: true, modelAttribution: "creator-stated, not independently reproduced" },
  });
}
for (const id of Object.keys(curation.category)) if (!seeds.some((s) => s.id === id)) problems.push(`${id} 在分类表里，但这次没选中（Claude 库下架了？）`);
if (problems.length) { console.error(`❌ ${problems.length} 个问题：\n  ${problems.join("\n  ")}`); process.exit(1); }

const seedIds = new Set(seeds.map((s) => s.id));
const kept = (prev?.cases || []).filter((c) => !c.evidence?.seed && !seedIds.has(c.id));
const cases = [...seeds, ...kept].sort((a, b) => b.stats.views - a.stats.views);
const statsCheckedAt = cases.map((c) => c.stats.checkedAt).filter(Boolean).sort().at(-1) || null;
const out = {
  library: LIBRARY.id, model: LIBRARY.name, released: LIBRARY.released, threshold: opus.threshold,
  updatedAt: new Date().toISOString(), statsCheckedAt,
  inclusionRule: "Original post by the creator, video attached, 5,000+ views, and the creator's own text says it was made with Gemini 4 (Argon, Carbon, Pro…). Seeded on 2026-11-16 from the Claude 5.5 library, where most Gemini 4 works are same-prompt comparisons.",
  cases,
};

const count = (k) => Object.fromEntries([...new Set(cases.flatMap((c) => [].concat(c[k])))].map((x) => [x, cases.filter((c) => [].concat(c[k]).includes(x)).length]));
console.log(`种子 ${seeds.length} 个（带提示词 ${seeds.filter((s) => s.prompt).length}）· 保留每日收录的 ${kept.length} 个`);
console.log("题材", count("category"));
console.log("子模型", count("models"));
console.log("对比对象", count("rivals"));
if (DRY) process.exit(0);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`✅ 写入 ${path.relative(ROOT, OUT)}`);
