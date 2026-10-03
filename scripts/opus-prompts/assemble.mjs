// 组装最终数据：候选 + 分类 + 提示词提取（文字/截图转写/外链）+ 人工把关 → src/content/opus-prompts/cases.json
// 用法：node scripts/opus-prompts/assemble.mjs [--write]   然后 node scripts/generate-opus-prompts.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { detectModels } from "./lib/models.mjs";
const D = path.join(import.meta.dirname, "data");
const rd = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
const SITE = path.join(import.meta.dirname, "../..");
const C = rd("candidates.json");
const K = rd("classified.json");
const EXT = Object.fromEntries(rd("extracted.json").map((x) => [x.id, x]));
const IMG = Object.fromEntries(rd("transcribed-images.json").map((x) => [x.id, x])); // 截图里的提示词，人工转写
const LNK = Object.fromEntries(rd("from-links.json").map((x) => [x.id, x]));          // 作者外链里的提示词
const CUR = rd("curation.json");
const UNAV = fs.existsSync(path.join(D, "unavailable.json")) ? rd("unavailable.json") : {}; // refresh.mjs 标记的已删帖/转私密/视频被移除
const VIRAL = "makeadynamic15secondmotiongraphicsvideothatshowswhatanincrediblemotiondesigneryouarelikeitsyourshowreelforarésumégoallout";
const nk = (t) => t.toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "");
const tcoCache = fs.existsSync(path.join(D, "tco-cache.json")) ? rd("tco-cache.json") : {};
const expand = (text) => text.replace(/https:\/\/t\.co\/\w+/g, (u) => {
  if (!(u in tcoCache)) {
    try { tcoCache[u] = execFileSync("curl", ["-sS", "-m", "15", "-o", "/dev/null", "-w", "%{redirect_url}", u], { encoding: "utf8" }).trim() || null; } catch { tcoCache[u] = null; }
  }
  const t = tcoCache[u];
  // 指向推文自带媒体的短链不是提示词内容，保留原样以免改动原文
  return t && !/\/\/(x|twitter)\.com\/[^/]+\/status\/\d+\/(photo|video)\//.test(t) ? t : u;
});
// 中文里夹着的半角标点统一成全角（模型写中文摘要时经常混用）
const CJK = "[\\u3400-\\u9fff\\u3000-\\u303f\\uff00-\\uffef]";
const zhPunct = (t) => !t ? t : [[",", "，"], [";", "；"], [":", "："], ["(", "（"], [")", "）"], ["?", "？"], ["!", "！"]].reduce((acc, [a, b]) =>
  acc.replace(new RegExp(`(${CJK})\\${a}\\s?`, "g"), `$1${b}`).replace(new RegExp(`\\${a}(?=${CJK})`, "g"), b), t);
const cases = []; const stat = { keep: 0, text: 0, image: 0, imagePending: 0, link: 0, linkPending: 0, none: 0 };
for (const c of C) {
  const k = K[c.id]; if (!k || !k.keep || k.original === "repost") continue;
  if (CUR.dropCase[c.id]) { stat.curatedOut = (stat.curatedOut || 0) + 1; continue; }
  if (UNAV[c.id]) { stat.unavailable = (stat.unavailable || 0) + 1; continue; }
  stat.keep++;
  const e = EXT[c.id]; let prompt = null;
  if (e?.prompt) {
    const p = e.prompt;
    if (p.text) { prompt = { kind: p.kind, source: p.source, sourceUrl: p.sourceUrl, text: expand(p.text) }; stat.text++; }
    else if (p.source === "image") { const t = IMG[c.id]?.text?.trim(); if (t) { prompt = { kind: t.length < 200 ? "brief" : "full", source: "image", sourceUrl: p.sourceUrl, text: t }; stat.image++; } else stat.imagePending++; }
    else if (p.source === "link") { const l = LNK[c.id]; if (l?.text?.trim()) { prompt = { kind: l.kind || "full", source: "link", sourceUrl: p.linkUrl, text: l.text.trim() }; stat.link++; } else stat.linkPending++; }
  }
  let resources = [];
  if (e?.prompt?.source === "link" && !prompt) resources = [e.prompt.linkUrl];
  // ── 人工把关 ──
  if (prompt && CUR.dropPrompt[c.id]) { prompt = null; stat.curatedPrompt = (stat.curatedPrompt || 0) + 1; }
  if (prompt && CUR.promptText[c.id]) {
    const nt = CUR.promptText[c.id];
    // 覆盖文本也必须能在原帖里逐字找到
    if (!c.text.replace(/\s+/g, " ").includes(nt.replace(/\s+/g, " "))) throw new Error(`curation promptText for ${c.id} is not verbatim in the source post`);
    prompt = { ...prompt, text: nt, kind: nt.length < 200 ? "brief" : prompt.kind };
  }
  if (prompt && CUR.promptPrefixFix[c.id]) { const [a, b] = CUR.promptPrefixFix[c.id]; if (!prompt.text.startsWith(a)) throw new Error(`prefix fix mismatch ${c.id}`); prompt.text = b + prompt.text.slice(a.length); }
  let title = { zh: k.title_zh, en: k.title_en };
  if (CUR.title[c.id]) title = { zh: CUR.title[c.id][0], en: CUR.title[c.id][1] };
  else if (prompt && nk(prompt.text) === VIRAL) title = { zh: `15 秒动效设计师自荐片 · @${c.handle} 版`, en: `15-second motion designer showreel by @${c.handle}` };
  // one-shot 是「一次生成」，不是「一镜到底」；showreel 统一叫展示片
  title.zh = title.zh.replace(/一镜到底的?/g, "一次生成的").replace(/陈列片/g, "展示片").replace(/运动设计/g, "动效设计").replace(/动态图形/g, "动效");
  if (!prompt) stat.none++;
  const tools = [...new Set([...(e?.tools || k.tools || [])].map(t => String(t).trim()).filter(t => t && !/^(claude )?opus ?5\.5/i.test(t)))].slice(0, 8);
  const models = detectModels(c.text, c.quoted?.handle === c.handle ? c.quoted.text : "", prompt?.text);
  if (!models.length) { stat.hedged = (stat.hedged || 0) + 1; continue; } // 作者自己都不确定是不是 Fable 5.5
  cases.push({ id: c.id, url: c.url, author: { handle: c.handle, name: c.name }, postedAt: c.createdAt, lang: c.lang, models, kind: k.kind, category: CUR.category[c.id] || k.category,
    title: { zh: zhPunct(title.zh), en: title.en }, summary: e?.summary_zh ? { zh: zhPunct(e.summary_zh), en: e.summary_en } : null, prompt,
    referenceAssets: CUR.referenceAssets.includes(c.id) || !!(e ? e.reference_assets : k.reference_assets), tools, resources,
    stats: { views: c.views, likes: c.likes, replies: c.replies, reposts: c.reposts, bookmarks: c.bookmarks, checkedAt: c.checkedAt },
    video: { poster: c.video.poster, mp4: c.video.mp4, width: c.video.width, height: c.video.height, durationSec: c.video.durationSec },
    evidence: { via: c.via, seed: c.seed, modelAttribution: "creator-stated, not independently reproduced" } });
}
fs.writeFileSync(path.join(D, "tco-cache.json"), JSON.stringify(tcoCache));
cases.sort((a, b) => b.stats.views - a.stats.views);
const now = process.env.OPUS_UPDATED_AT || C.map((c) => c.checkedAt).sort().at(-1);
const checked = C.map(c => c.checkedAt).sort().at(-1);
const out = { model: "Claude 5.5 (Opus 5.5 · Sonnet 5.5)", threshold: 5000, updatedAt: now, statsCheckedAt: checked, inclusionRule: "Original post by the creator, native video attached, >= 5000 views on that post, creator states it was made with Claude Opus 5.5 or Claude Sonnet 5.5.", cases };
if (process.argv.includes("--write")) { fs.mkdirSync(`${SITE}/src/content/opus-prompts`, { recursive: true }); fs.writeFileSync(`${SITE}/src/content/opus-prompts/cases.json`, JSON.stringify(out, null, 1)); }
console.log(JSON.stringify(stat), "| with prompt:", cases.filter(c => c.prompt).length, "| full:", cases.filter(c => c.prompt?.kind === "full").length, "| t.co expanded:", Object.values(tcoCache).filter(Boolean).length);
