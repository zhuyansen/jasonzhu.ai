#!/usr/bin/env node
/**
 * Gemini 4 合集编译（和 generate-image-prompts.mjs 同一套拆法）：
 *   src/content/gemini-prompts/gemini-4.json（源：scripts/gemini-prompts/seed-from-opus.mjs，以后加每日收录）
 *   → src/generated/gemini-prompts.json          列表用精简版（提示词只留摘要，控制 RSC 体积）
 *   → src/generated/gemini-prompts-full.json     详情页服务端用（含完整提示词）
 *   → public/data/gemini-prompts/<id>.json       卡片「复制」按需拉取
 *   → public/data/gemini-prompts/index.json      全量精简索引（列表页挂载后拉，首屏 HTML 只带 24 条）
 * 没有提示词的作品只上列表、卡片直链原帖，不建详情页（同图片库，robots.txt 不用逐条列）。
 * 还没有数据时输出空库，不让构建失败。
 *
 * 用法：node scripts/generate-gemini-prompts.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src/content/gemini-prompts/gemini-4.json");
const OUT_LIST = path.join(ROOT, "src/generated/gemini-prompts.json");
const OUT_FULL = path.join(ROOT, "src/generated/gemini-prompts-full.json");
const OUT_PUBLIC = path.join(ROOT, "public/data/gemini-prompts");
const EXCERPT = 260;
const CATS = ["scene3d", "physics", "mechanics", "game", "sim", "ui", "svg", "motion"];
const MODELS = ["argon", "carbon", "hydrogen", "krypton", "pro", "flash", "ultra", "gemini-4"];
const RIVALS = ["claude", "gpt", "kimi", "deepseek", "grok", "qwen", "minimax", "muse"];

const src = fs.existsSync(SRC) ? JSON.parse(fs.readFileSync(SRC, "utf-8"))
  : { library: "gemini-4", model: "Gemini 4", released: null, threshold: 5000, updatedAt: null, statsCheckedAt: null, cases: [] };

const problems = [];
const seen = new Set();
const cases = [];
for (const c of src.cases) {
  const bad = (m) => problems.push(`${c.id}: ${m}`);
  if (!/^\d{15,}$/.test(c.id || "")) { bad("id 不是推文 ID"); continue; }
  if (seen.has(c.id)) { bad("重复"); continue; }
  seen.add(c.id);
  if (!CATS.includes(c.category)) bad(`未知分类 ${c.category}`);
  if (!c.models?.length || c.models.some((m) => !MODELS.includes(m))) bad(`子模型不对 ${JSON.stringify(c.models)}`);
  if ((c.rivals || []).some((r) => !RIVALS.includes(r))) bad(`对比对象不对 ${JSON.stringify(c.rivals)}`);
  if (!c.title?.zh || !c.title?.en) bad("缺标题");
  if (!(c.stats?.views >= src.threshold)) { bad(`浏览量 ${c.stats?.views} 低于门槛`); continue; }
  if (!c.media?.length) { bad("没有媒体"); continue; }
  for (const m of c.media) {
    if (m.type === "photo" ? !/^https:\/\/pbs\.twimg\.com\//.test(m.url) : !/^https:\/\/video\.twimg\.com\//.test(m.url)) bad(`媒体地址不对 ${m.url}`);
    if (m.type !== "photo" && !/^https:\/\/pbs\.twimg\.com\//.test(m.poster || "")) bad("封面地址不是 pbs.twimg.com");
  }
  if (c.prompt && !(c.prompt.text || "").trim()) c.prompt = null;
  if (c.prompt && !["full", "brief"].includes(c.prompt.kind)) bad(`未知 prompt.kind ${c.prompt.kind}`);
  if (c.prompt && !/^https:\/\//.test(c.prompt.sourceUrl || "")) bad("缺 prompt.sourceUrl");
  cases.push(c);
}
if (problems.length) {
  console.error(`❌ ${problems.length} 个问题：\n  ` + problems.slice(0, 30).join("\n  "));
  if (problems.some((p) => !/低于门槛/.test(p))) process.exit(1);
}

cases.sort((a, b) => b.stats.views - a.stats.views);

const excerpt = (t) => {
  const s = t.replace(/\r/g, "").trim();
  return s.length <= EXCERPT ? s : s.slice(0, EXCERPT).replace(/\s+\S*$/, "") + "…";
};
// 同款提示词分组：对比帖常有几个人跑同一条提示词（果冻魔方、埃菲尔铁塔…）
const groupKey = (t) => t.toLowerCase().normalize("NFKC").replace(/https?:\/\/\S+/g, "").replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 48);
const groups = new Map();
for (const c of cases) {
  if (!c.prompt) continue;
  const k = groupKey(c.prompt.text);
  if (k.length < 12) continue;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(c.id);
}
const groupOf = new Map();
for (const ids of groups.values()) if (ids.length > 1) for (const id of ids) groupOf.set(id, { key: ids[0], size: ids.length });

const withPrompt = cases.filter((c) => c.prompt).length;
const slim = cases.map((c) => ({
  id: c.id, url: c.url, author: c.author, postedAt: c.postedAt, addedAt: c.addedAt, lang: c.lang,
  models: c.models, rivals: c.rivals || [], category: c.category, title: c.title,
  prompt: c.prompt ? { kind: c.prompt.kind, source: c.prompt.source, sourceUrl: c.prompt.sourceUrl, length: c.prompt.text.length, excerpt: excerpt(c.prompt.text) } : null,
  group: groupOf.get(c.id) || null,
  referenceAssets: !!c.referenceAssets, tools: c.tools || [],
  stats: { views: c.stats.views, likes: c.stats.likes, replies: c.stats.replies, bookmarks: c.stats.bookmarks },
  media: c.media,
}));
const distinct = withPrompt - [...groupOf.values()].length + new Set([...groupOf.values()].map((g) => g.key)).size;
const countBy = (keys, pick) => Object.fromEntries(keys.map((k) => [k, cases.filter((c) => pick(c).includes(k)).length]));
const head = {
  library: src.library, model: src.model, released: src.released || null, threshold: src.threshold, updatedAt: src.updatedAt, statsCheckedAt: src.statsCheckedAt,
  distinctPrompts: distinct, withPrompt,
  categoryCounts: countBy(CATS, (c) => [c.category]),
  modelCounts: countBy(MODELS, (c) => c.models),
  rivalCounts: countBy(RIVALS, (c) => c.rivals || []),
};

fs.mkdirSync(path.dirname(OUT_LIST), { recursive: true });
fs.writeFileSync(OUT_LIST, JSON.stringify({ ...head, cases: slim }));
fs.writeFileSync(OUT_FULL, JSON.stringify(Object.fromEntries(cases.filter((c) => c.prompt).map((c) => [c.id, { prompt: c.prompt.text, summary: c.summary || null }]))));

fs.rmSync(OUT_PUBLIC, { recursive: true, force: true });
fs.mkdirSync(OUT_PUBLIC, { recursive: true });
for (const c of cases) if (c.prompt) fs.writeFileSync(path.join(OUT_PUBLIC, `${c.id}.json`), JSON.stringify({ id: c.id, prompt: c.prompt.text }));
fs.writeFileSync(path.join(OUT_PUBLIC, "index.json"), JSON.stringify(slim));

console.log(`✅ Gemini 4 合集：${cases.length} 个作品（带提示词 ${withPrompt}）· ${distinct} 条不同提示词 · 列表 JSON ${(fs.statSync(OUT_LIST).size / 1024).toFixed(0)}KB`);
