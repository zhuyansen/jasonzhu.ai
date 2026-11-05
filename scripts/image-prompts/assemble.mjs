// 组装最终数据：候选 + 分类 + 提示词提取（文字 / 截图转写 / 外链）+ 人工把关 → src/content/image-prompts/chatgpt-images-2-6.json
// 流程和 ../opus-prompts/assemble.mjs 相同，媒体换成图片 / GIF / 视频（每个作品最多 4 个）。
// 用法：node scripts/image-prompts/assemble.mjs [--write]   然后 node scripts/generate-image-prompts.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { LIBRARY, CATEGORIES } from "./lib/profile.mjs";
const D = path.join(import.meta.dirname, "data");
const rd = (f, fallback) => (fs.existsSync(path.join(D, f)) ? JSON.parse(fs.readFileSync(path.join(D, f), "utf8")) : fallback);
const SITE = path.join(import.meta.dirname, "../..");
const C = rd("candidates.json", []);
const K = rd("classified.json", {});
const EXT = Object.fromEntries(rd("extracted.json", []).map((x) => [x.id, x]));
const IMG = Object.fromEntries(rd("transcribed-images.json", []).map((x) => [x.id, x])); // 截图里的提示词，人工转写
const LNK = Object.fromEntries(rd("from-links.json", []).map((x) => [x.id, x]));          // 作者外链里的提示词
const CUR = rd("curation.json", { dropCase: {}, dropPrompt: {}, promptText: {}, promptPrefixFix: {}, title: {}, category: {}, referenceAssets: [] });
const UNAV = rd("unavailable.json", {});
// 收录日期（作品第一次进库的日期，不是 X 发帖日期）：页面「最近收录」排序和 NEW 角标用
const ADDED = rd("added.json", {});
const RUN_DAY = (process.env.OPUS_UPDATED_AT || new Date().toISOString()).slice(0, 10);
const tcoCache = rd("tco-cache.json", {});
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
// 中文和英文字母、数字之间加空格（站内中文的排版习惯：「Q 版」「GPT-Image-2.6 的」）
const zhSpace = (t) => !t ? t : t.replace(/([\u3400-\u9fff])([A-Za-z0-9])/g, "$1 $2").replace(/([A-Za-z0-9%])([\u3400-\u9fff])/g, "$1 $2");
const SELF = /^(chatgpt|openai|gpt[\s-]?image|chatgpt images|images? 2\.6)/i; // 工具列表里不列模型自己
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
    if (!c.text.replace(/\s+/g, " ").includes(nt.replace(/\s+/g, " "))) throw new Error(`curation promptText for ${c.id} is not verbatim in the source post`);
    prompt = { ...prompt, text: nt, kind: nt.length < 200 ? "brief" : prompt.kind };
  }
  if (prompt && CUR.promptPrefixFix[c.id]) { const [a, b] = CUR.promptPrefixFix[c.id]; if (!prompt.text.startsWith(a)) throw new Error(`prefix fix mismatch ${c.id}`); prompt.text = b + prompt.text.slice(a.length); }
  let title = { zh: k.title_zh, en: k.title_en };
  if (CUR.title[c.id]) title = { zh: CUR.title[c.id][0], en: CUR.title[c.id][1] };
  if (!prompt) stat.none++;
  const tools = [...new Set([...(e?.tools || k.tools || [])].map((t) => String(t).trim()).filter((t) => t && !SELF.test(t)))].slice(0, 8);
  const category = CUR.category[c.id] || k.category;
  if (!CATEGORIES.includes(category)) { stat.badCategory = (stat.badCategory || 0) + 1; continue; }
  if (!ADDED[c.id]) ADDED[c.id] = RUN_DAY;
  cases.push({ id: c.id, url: c.url, author: { handle: c.handle, name: c.name }, postedAt: c.createdAt, addedAt: ADDED[c.id], lang: c.lang, kind: k.kind, category,
    title: { zh: zhSpace(zhPunct(title.zh)), en: title.en }, summary: e?.summary_zh ? { zh: zhSpace(zhPunct(e.summary_zh)), en: e.summary_en } : null, prompt,
    referenceAssets: CUR.referenceAssets.includes(c.id) || !!(e ? e.reference_assets : k.reference_assets), tools, resources,
    stats: { views: c.views, likes: c.likes, replies: c.replies, reposts: c.reposts, bookmarks: c.bookmarks, checkedAt: c.checkedAt },
    media: c.media,
    evidence: { via: c.via, seed: c.seed, modelAttribution: "creator-stated, not independently reproduced" } });
}
fs.writeFileSync(path.join(D, "tco-cache.json"), JSON.stringify(tcoCache));
// 同一个 X 媒体 ID = 同一次上传：后发的帖子是嵌入别人媒体的转发，只留最早那条
const mediaId = (m) => m.url.match(/\/(?:media|amplify_video|ext_tw_video|tweet_video)\/([\w-]+)/)?.[1];
const firstUpload = new Map();
for (const c of [...cases].sort((a, b) => a.postedAt.localeCompare(b.postedAt))) for (const m of c.media) { const id = mediaId(m); if (id && !firstUpload.has(id)) firstUpload.set(id, c.id); }
const before = cases.length;
cases.splice(0, cases.length, ...cases.filter((c) => c.media.every((m) => { const id = mediaId(m); return !id || firstUpload.get(id) === c.id; })));
stat.sameMedia = before - cases.length;
cases.sort((a, b) => b.stats.views - a.stats.views);
const now = process.env.OPUS_UPDATED_AT || C.map((c) => c.checkedAt).sort().at(-1) || new Date().toISOString();
const out = { library: LIBRARY.id, model: LIBRARY.name, released: LIBRARY.released, threshold: 5000, updatedAt: now, statsCheckedAt: C.map((c) => c.checkedAt).sort().at(-1) || now,
  inclusionRule: "Original post by the creator, images / GIF / video attached, >= 5000 views on that post, creator states it was made with ChatGPT Images 2.6 (GPT-Image-2.6). Later posts that embed another account's upload are excluded.", cases };
if (process.argv.includes("--write")) {
  fs.writeFileSync(path.join(D, "added.json"), "{\n" + Object.keys(ADDED).sort().map((k) => `${JSON.stringify(k)}: ${JSON.stringify(ADDED[k])}`).join(",\n") + "\n}\n");
  fs.mkdirSync(`${SITE}/src/content/image-prompts`, { recursive: true });
  fs.writeFileSync(`${SITE}/src/content/image-prompts/${LIBRARY.id}.json`, JSON.stringify(out, null, 1));
}
console.log(JSON.stringify(stat), "| cases:", cases.length, "| with prompt:", cases.filter((c) => c.prompt).length);
