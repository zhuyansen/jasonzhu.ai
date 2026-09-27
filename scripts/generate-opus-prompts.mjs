#!/usr/bin/env node
/**
 * Opus 5.5 提示词库编译：
 *   src/content/opus-prompts/cases.json（源：人工/脚本整理，含完整提示词）
 *   → src/generated/opus-prompts.json          列表用精简版（提示词只留摘要，控制 RSC 体积）
 *   → src/generated/opus-prompts-full.json     详情页服务端用（含完整提示词）
 *   → public/data/opus-prompts/<id>.json       卡片「展开全文」按需拉取
 *   → public/data/opus-prompts/index.json      全量精简索引（列表页挂载后拉，首屏 HTML 只带 24 条）
 *
 * 用法：node scripts/generate-opus-prompts.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src/content/opus-prompts/cases.json");
const OUT_LIST = path.join(ROOT, "src/generated/opus-prompts.json");
const OUT_FULL = path.join(ROOT, "src/generated/opus-prompts-full.json");
const OUT_PUBLIC = path.join(ROOT, "public/data/opus-prompts");
const EXCERPT = 260;

const src = JSON.parse(fs.readFileSync(SRC, "utf-8"));
const CATS = new Set(["product", "motion", "education", "stories", "art3d", "game", "production", "comparison"]);

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
  if (!(c.stats?.views >= src.threshold)) { bad(`播放量 ${c.stats?.views} 低于门槛`); continue; }
  if (!/^https:\/\/video\.twimg\.com\//.test(c.video?.mp4 || "")) bad("视频地址不是 video.twimg.com");
  if (!/^https:\/\/pbs\.twimg\.com\//.test(c.video?.poster || "")) bad("封面地址不是 pbs.twimg.com");
  // 站内提示词库只收有提示词出处的案例；没有提示词的作品只进 GitHub 合集
  if (!c.prompt || !(c.prompt.text || "").trim()) continue;
  if (!["full", "brief"].includes(c.prompt.kind)) bad(`未知 prompt.kind ${c.prompt.kind}`);
  if (!/^https:\/\//.test(c.prompt.sourceUrl || "")) bad("缺 prompt.sourceUrl");
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
// 同款提示词分组：同一条爆款提示词会被很多人拿去用，成片各不相同。
// 按归一化后的开头判同款，卡片上标「同款提示词 · N 个作品」，统计「不同提示词」时只算一次。
const groupKey = (t) => t.toLowerCase().normalize("NFKC").replace(/https?:\/\/\S+/g, "").replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 48);
const groups = new Map();
for (const c of cases) {
  const k = groupKey(c.prompt.text);
  if (k.length < 12) continue; // 太短的不判同款（「have fun」之类碰巧相同没有意义）
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(c.id);
}
const groupOf = new Map();
for (const ids of groups.values()) if (ids.length > 1) for (const id of ids) groupOf.set(id, { key: ids[0], size: ids.length });

const slim = cases.map((c) => ({
  id: c.id, url: c.url, author: c.author, postedAt: c.postedAt, lang: c.lang, category: c.category, title: c.title,
  prompt: c.prompt ? { kind: c.prompt.kind, source: c.prompt.source, sourceUrl: c.prompt.sourceUrl, length: c.prompt.text.length, excerpt: excerpt(c.prompt.text) } : null,
  group: groupOf.get(c.id) || null,
  referenceAssets: !!c.referenceAssets, tools: c.tools || [],
  stats: { views: c.stats.views, likes: c.stats.likes, replies: c.stats.replies, bookmarks: c.stats.bookmarks },
  video: c.video,
}));
const distinct = cases.length - [...groupOf.values()].length + new Set([...groupOf.values()].map((g) => g.key)).size;
const head = { model: src.model, threshold: src.threshold, updatedAt: src.updatedAt, statsCheckedAt: src.statsCheckedAt, distinctPrompts: distinct };

fs.mkdirSync(path.dirname(OUT_LIST), { recursive: true });
fs.writeFileSync(OUT_LIST, JSON.stringify({ ...head, cases: slim }));
fs.writeFileSync(OUT_FULL, JSON.stringify(Object.fromEntries(cases.map((c) => [c.id, { prompt: c.prompt?.text || null, summary: c.summary || null }]))));

fs.rmSync(OUT_PUBLIC, { recursive: true, force: true });
fs.mkdirSync(OUT_PUBLIC, { recursive: true });
for (const c of cases) fs.writeFileSync(path.join(OUT_PUBLIC, `${c.id}.json`), JSON.stringify({ id: c.id, prompt: c.prompt.text }));
// 列表页首屏只带 24 条，筛选/排序/加载更多时再拉这份全量精简索引
fs.writeFileSync(path.join(OUT_PUBLIC, "index.json"), JSON.stringify(slim));

const withPrompt = cases.filter((c) => c.prompt).length;
console.log(`✅ Opus 提示词库：${cases.length} 个作品 · ${distinct} 条不同提示词（完整 ${cases.filter((c) => c.prompt?.kind === "full").length}）· 同款分组 ${new Set([...groupOf.values()].map((g) => g.key)).size} 组`);
console.log(`   列表 JSON ${(fs.statSync(OUT_LIST).size / 1024).toFixed(0)}KB · 详情 JSON ${(fs.statSync(OUT_FULL).size / 1024).toFixed(0)}KB`);
