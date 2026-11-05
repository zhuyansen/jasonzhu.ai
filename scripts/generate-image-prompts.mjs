#!/usr/bin/env node
/**
 * ChatGPT Images 2.6 合集编译（和 generate-opus-prompts.mjs 同一套拆法）：
 *   src/content/image-prompts/chatgpt-images-2-6.json（源：scripts/image-prompts/assemble.mjs）
 *   → src/generated/image-prompts.json          列表用精简版（提示词只留摘要，控制 RSC 体积）
 *   → src/generated/image-prompts-full.json     详情页服务端用（含完整提示词）
 *   → public/data/image-prompts/<id>.json       卡片「展开全文」按需拉取
 *   → public/data/image-prompts/index.json      全量精简索引（列表页挂载后拉，首屏 HTML 只带 24 条）
 * 还没有数据时输出空库，不让构建失败。
 *
 * 用法：node scripts/generate-image-prompts.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src/content/image-prompts/chatgpt-images-2-6.json");
const OUT_LIST = path.join(ROOT, "src/generated/image-prompts.json");
const OUT_FULL = path.join(ROOT, "src/generated/image-prompts-full.json");
const OUT_PUBLIC = path.join(ROOT, "public/data/image-prompts");
const EXCERPT = 260;
const CATS = new Set(["portrait", "illustration", "product", "design", "gif", "edit", "sticker", "comparison"]);

const src = fs.existsSync(SRC) ? JSON.parse(fs.readFileSync(SRC, "utf-8"))
  : { library: "chatgpt-images-2-6", model: "ChatGPT Images 2.6", threshold: 5000, updatedAt: null, statsCheckedAt: null, cases: [] };

const problems = [];
const seen = new Set();
const cases = [];
for (const c of src.cases) {
  const bad = (m) => problems.push(`${c.id}: ${m}`);
  if (!/^\d{15,}$/.test(c.id || "")) { bad("id 不是推文 ID"); continue; }
  if (seen.has(c.id)) { bad("重复"); continue; }
  seen.add(c.id);
  if (!CATS.has(c.category)) bad(`未知分类 ${c.category}`);
  if (!c.title?.zh || !c.title?.en) bad("缺标题");
  if (!(c.stats?.views >= src.threshold)) { bad(`浏览量 ${c.stats?.views} 低于门槛`); continue; }
  if (!c.media?.length) { bad("没有媒体"); continue; }
  for (const m of c.media) {
    if (m.type === "photo" ? !/^https:\/\/pbs\.twimg\.com\//.test(m.url) : !/^https:\/\/video\.twimg\.com\//.test(m.url)) bad(`媒体地址不对 ${m.url}`);
    if (m.type !== "photo" && !/^https:\/\/pbs\.twimg\.com\//.test(m.poster || "")) bad("封面地址不是 pbs.twimg.com");
  }
  // 收全部作品（和 GitHub 合集一致）；没有提示词的 prompt 为 null，卡片直接链到原帖，没有站内详情页
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
// 同款提示词分组（一条爆款提示词会被很多人拿去用）：按归一化后的开头判同款
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
  id: c.id, url: c.url, author: c.author, postedAt: c.postedAt, addedAt: c.addedAt, lang: c.lang, category: c.category, title: c.title,
  prompt: c.prompt ? { kind: c.prompt.kind, source: c.prompt.source, sourceUrl: c.prompt.sourceUrl, length: c.prompt.text.length, excerpt: excerpt(c.prompt.text) } : null,
  group: groupOf.get(c.id) || null,
  referenceAssets: !!c.referenceAssets, tools: c.tools || [],
  stats: { views: c.stats.views, likes: c.stats.likes, replies: c.stats.replies, bookmarks: c.stats.bookmarks },
  media: c.media,
}));
const distinct = withPrompt - [...groupOf.values()].length + new Set([...groupOf.values()].map((g) => g.key)).size;
const head = { library: src.library, model: src.model, released: src.released || null, threshold: src.threshold, updatedAt: src.updatedAt, statsCheckedAt: src.statsCheckedAt,
  distinctPrompts: distinct, withPrompt, categoryCounts: Object.fromEntries([...CATS].map((k) => [k, cases.filter((c) => c.category === k).length])) };

fs.mkdirSync(path.dirname(OUT_LIST), { recursive: true });
fs.writeFileSync(OUT_LIST, JSON.stringify({ ...head, cases: slim }));
fs.writeFileSync(OUT_FULL, JSON.stringify(Object.fromEntries(cases.filter((c) => c.prompt).map((c) => [c.id, { prompt: c.prompt.text, summary: c.summary || null }]))));

fs.rmSync(OUT_PUBLIC, { recursive: true, force: true });
fs.mkdirSync(OUT_PUBLIC, { recursive: true });
for (const c of cases) if (c.prompt) fs.writeFileSync(path.join(OUT_PUBLIC, `${c.id}.json`), JSON.stringify({ id: c.id, prompt: c.prompt.text }));
fs.writeFileSync(path.join(OUT_PUBLIC, "index.json"), JSON.stringify(slim));

console.log(`✅ ChatGPT Images 2.6 合集：${cases.length} 个作品（带提示词 ${withPrompt}）· ${distinct} 条不同提示词 · 列表 JSON ${(fs.statSync(OUT_LIST).size / 1024).toFixed(0)}KB`);
