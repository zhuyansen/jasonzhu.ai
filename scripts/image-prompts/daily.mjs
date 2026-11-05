#!/usr/bin/env node
/**
 * ChatGPT Images 2.6 合集：每日增量收录（流程和 ../opus-prompts/daily.mjs 相同，换成图片 / GIF / 视频）。
 *
 *   搜索  按发布时间窗口搜（since_time/until_time），带媒体的原创帖，点赞 ≥100，延迟 24 小时；每条帖子只付一次钱。
 *   限量  浏览 ≥5000 的按浏览量取前 CAP 个（默认 80）。
 *   判断  分类 → 抓作者回复 → 定位提示词 → 代码逐字对账
 *   审核  Jev；拿不准的交 Opus 终审，终审不可用才留在 data/pending.json（下次运行先补终审）
 *
 * 用法：node scripts/image-prompts/daily.mjs [--dry]
 * 补跑：WINDOW_FROM=2026-11-04T23:00Z WINDOW_TO=2026-11-05T16:00Z node …
 * 环境变量：TWITTERAPI_IO_KEY（必需）· FLATROUTER_API_KEY / APIMART_CLAUDE_KEY / ANTHROPIC_API_KEY（至少一个）· JEV_API_KEY
 *          CAP=80 · MIN_FAVES=100 · DELAY_HOURS=24 · MAX_SEARCH_TWEETS=400 · OPUS_TRANSPORT=curl（本机）
 */
import fs from "node:fs";
import path from "node:path";
import { workerJSON, reviewerJSON, usage } from "../opus-prompts/lib/llm.mjs";
import { authorThread, cost } from "../opus-prompts/lib/x.mjs";
import { resolvePrompt, bundle } from "../opus-prompts/lib/resolve.mjs";
import { arbitrate, applyDecision } from "../opus-prompts/lib/arbitrate.mjs";
import { jevAudit, jevAvailable, jevUsage } from "../opus-prompts/lib/jev.mjs";
import { searchWindow, normalize, fillMediaFromFx } from "./lib/media.mjs";
import { LIBRARY, CATEGORIES, JEV_PROFILE, mentionsModel, isPlatformAccount } from "./lib/profile.mjs";

const D = path.join(import.meta.dirname, "data");
const P = path.join(import.meta.dirname, "prompts");
const DRY = process.argv.includes("--dry");
const CAP = Number(process.env.CAP || 80);
const MIN_FAVES = Number(process.env.MIN_FAVES || 100);
const DELAY = Number(process.env.DELAY_HOURS || 24) * 3600e3;
const MAX_SEARCH = Number(process.env.MAX_SEARCH_TWEETS || 400);
const THRESHOLD = 5000;
const HOLD_DAYS = 14;
const CATS = new Set(CATEGORIES);
const ARB_PROMPT = fs.readFileSync(path.join(P, "arbitrate.md"), "utf8");
const rd = (f, fallback) => (fs.existsSync(path.join(D, f)) ? JSON.parse(fs.readFileSync(path.join(D, f), "utf8")) : fallback);
const wr = (f, v) => fs.writeFileSync(path.join(D, f), typeof v === "string" ? v : JSON.stringify(v, null, 1) + "\n");
const chunk = (arr, fits) => { const out = [[]]; for (const x of arr) { if (out.at(-1).length && !fits([...out.at(-1), x])) out.push([]); out.at(-1).push(x); } return out.filter((c) => c.length); };
const log = (...a) => console.log(...a);

const candidates = rd("candidates.json", []);
const classified = rd("classified.json", {});
const extracted = rd("extracted.json", []);
const curation = rd("curation.json", { dropCase: {} });
const state = rd("state.json", {});
const seen = new Set(rd("seen.json", []));
let pending = rd("pending.json", []);
const known = new Set(candidates.map((c) => c.id));
const now = Date.now(), nowISO = new Date(now).toISOString();
const stat = { published: [], publishedNoPrompt: [], held: [], rejected: [], arbPublished: [], arbRejected: [], rescued: [], visionRejected: [], notWork: 0, reposts: 0, otherModel: 0, platform: 0, pendingResolved: 0, retitled: 0, recategorized: 0 };
const notes = [];
const lineOf = (c, k) => `${c.id} @${c.handle} ${c.views.toLocaleString("en-US")} 浏览 · ${k.title_zh}`;
// 终审模型看不到图：看图写的标题不让它改（分类按它的）
const decide = (x, d) => { const k = x.classified, keep = k.titleFrom === "image" && [k.title_en, k.title_zh]; const rec = applyDecision(x, d, { categories: CATEGORIES }); if (keep) [k.title_en, k.title_zh] = keep; return rec; };

// ── 0. 待审队列：已上线的、被人工否决的、放太久的清掉；剩下的先补终审（本机跑时没有终审通道，留到工作流里补） ──
const before = pending.length;
pending = pending.filter((p) => !known.has(p.candidate.id) && !curation.dropCase[p.candidate.id] && now - Date.parse(p.heldAt) < HOLD_DAYS * 864e5);
if (before !== pending.length) log(`待审队列清理：${before} → ${pending.length}`);
if (pending.length) {
  const { decisions } = await arbitrate(pending, log, { prompt: ARB_PROMPT });
  pending = pending.filter((x) => {
    const d = decisions[x.candidate.id];
    if (!d) return true;
    const line = lineOf(x.candidate, x.classified);
    const rec = decide(x, d);
    stat.pendingResolved++;
    if (!rec) { stat.arbRejected.push(`${line}（待审队列）— ${d.reason}`); return false; }
    candidates.push(x.candidate); classified[x.candidate.id] = x.classified; extracted.push(rec); known.add(x.candidate.id);
    stat.arbPublished.push(`${line}（待审队列）${rec.prompt ? "（带提示词）" : ""} — ${d.reason}`);
    return false;
  });
}

// ── 1. 搜索窗口 ──
const MANUAL = Boolean(process.env.WINDOW_FROM && process.env.WINDOW_TO);
const released = Date.parse(LIBRARY.released) - 3600e3; // 发布前没有作品
let from = MANUAL ? Date.parse(process.env.WINDOW_FROM) : state.windowEnd ? Date.parse(state.windowEnd) : Math.max(released, now - DELAY - 864e5);
if (!MANUAL && now - DELAY - from > 3 * 864e5) { log(`⚠️ 落后超过 3 天，只补最近 3 天`); from = now - DELAY - 3 * 864e5; }
const to = MANUAL ? Date.parse(process.env.WINDOW_TO) : Math.min(now - DELAY, from + 864e5);
if (to - from < 3600e3) {
  log("CAUGHT_UP 窗口不足 1 小时，已追上进度");
  if (stat.pendingResolved && !DRY) { wr("candidates.json", "[\n" + candidates.map((c) => JSON.stringify(c)).join(",\n") + "\n]\n"); wr("classified.json", "{\n" + Object.entries(classified).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(",\n") + "\n}\n"); wr("extracted.json", "[\n" + extracted.map((e) => JSON.stringify(e)).join(",\n") + "\n]\n"); wr("pending.json", pending); log(`待审队列终审 ${stat.pendingResolved} 条，已写入`); }
  process.exit(0);
}
log(`窗口（按发布时间）：${new Date(from).toISOString()} → ${new Date(to).toISOString()} · 点赞 ≥${MIN_FAVES} · 上限 ${CAP} 个`);

// 断点文件：搜索结果和作者回复是花钱买的，拿到就落盘，同一窗口重跑直接复用
const WORK = path.join(D, ".work"); fs.mkdirSync(WORK, { recursive: true });
const ckFile = path.join(WORK, `${new Date(to).toISOString().slice(0, 13)}.json`);
const ck = fs.existsSync(ckFile) ? JSON.parse(fs.readFileSync(ckFile, "utf8")) : { from, to, threads: {} };
const saveCk = () => fs.writeFileSync(ckFile, JSON.stringify(ck));
if (ck.raw) { from = ck.from; log(`♻️ 复用断点 ${path.basename(ckFile)}：搜索结果 ${ck.raw.length} 条、作者回复 ${Object.keys(ck.threads).length} 个，不重复扣费`); }
else { ck.raw = await searchWindow({ from, to, minFaves: MIN_FAVES, maxTweets: MAX_SEARCH }); saveCk(); }
const raw = ck.raw;
const truncated = raw.length >= MAX_SEARCH;
// 搜索结果缺媒体字段时用 FXTwitter 补；补不回来判接口异常，报错停住，不推进窗口
const isFresh = (t) => process.env.IGNORE_SEEN === "1" || !seen.has(t.id);
const needMedia = raw.filter((t) => (t.viewCount || 0) >= THRESHOLD && isFresh(t) && !normalize(t, nowISO));
if (needMedia.length) {
  const r = await fillMediaFromFx(needMedia);
  log(`搜索结果解析不出媒体 ${needMedia.length} 条 → FXTwitter 补回 ${r.filled} · 确认没媒体 ${r.noMedia} · 查询失败 ${r.failed}`);
  if (r.failed >= 5 && r.failed > needMedia.length / 2) {
    console.error(`❌ ${r.failed}/${needMedia.length} 条缺媒体字段且 FXTwitter 也查不到，疑似接口异常：不写入、不推进窗口，下次重试`);
    process.exit(1);
  }
  saveCk();
}
const fresh = raw.filter(isFresh);
for (const t of raw) if ((t.viewCount || 0) >= THRESHOLD) seen.add(t.id);
const normalized = fresh.filter((t) => (t.viewCount || 0) >= THRESHOLD).map((t) => normalize(t, nowISO)).filter(Boolean)
  .filter((c) => !known.has(c.id) && !pending.some((p) => p.candidate.id === c.id));
// 别家叫「2.6」的模型（Kling、Seedream…）先剔掉，省模型调用
const qualified = normalized.filter((c) => mentionsModel(c.text, c.quoted?.handle === c.handle ? c.quoted.text : "") || (stat.otherModel++, false))
  .filter((c) => !isPlatformAccount(c.handle) || (stat.platform++, false)).sort((a, b) => b.views - a.views); // 官方演示、平台推广不收
const SKIP_TOP = MANUAL ? Number(process.env.SKIP_TOP || 0) : 0;
const picked = qualified.slice(SKIP_TOP, SKIP_TOP + CAP);
log(`搜索返回 ${raw.length} 条${truncated ? "（触及单次上限）" : ""} · 没见过的 ${fresh.length} · 浏览≥${THRESHOLD} 且带媒体 ${normalized.length} · 不是 Images 2.6 ${stat.otherModel} · 官方 / 平台账号 ${stat.platform} · 本次处理 ${picked.length}`);
const held = [];

if (picked.length) {
  // 一批失败就对半拆开再试，拆到单条还不行才放弃那一条；任何一步放弃都不让整次运行崩掉
  const batched = async (items, { label, size, bytes, build, call, validate, maxTokens }) => {
    const done = {}, gaveUp = {};
    const go = async (part, tag) => {
      const ids = new Set(part.map((c) => c.id));
      try {
        const { json, via } = await call(build(part), { label: `${label} ${tag}`, maxTokens,
          validate: (j) => (!Array.isArray(j) ? "not an array" : j.length !== part.length || !j.every((x) => ids.has(x.id)) || new Set(j.map((x) => x.id)).size !== part.length ? `id set mismatch ${j.length}/${part.length}` : validate?.(j) || null) });
        for (const x of json) done[x.id] = x;
        log(`  ${label} ${tag}: ${part.length} 条 via ${via}`);
      } catch (e) {
        if (part.length === 1) { gaveUp[part[0].id] = String(e.message).slice(0, 120); return; }
        log(`  ✂️ ${label} ${tag} 失败（${String(e.message).slice(0, 80)}），拆成两批`);
        const mid = Math.ceil(part.length / 2);
        await go(part.slice(0, mid), `${tag}a`); await go(part.slice(mid), `${tag}b`);
      }
    };
    for (const [i, part] of chunk(items, (a) => a.length <= size && JSON.stringify(build(a)).length <= bytes).entries()) await go(part, String(i + 1));
    return { done, gaveUp };
  };

  // ── 2. 分类 ──
  const clsPrompt = fs.readFileSync(path.join(P, "classify.md"), "utf8");
  const slim = (c) => ({ id: c.id, handle: c.handle, name: c.name, followers: c.followers, views: c.views, lang: c.lang, media: c.media.map((m) => m.type),
    text: c.text.length > 1800 ? c.text.slice(0, 1800) + ` …[truncated, full length ${c.text.length} chars]` : c.text, links: c.links.slice(0, 5), quoted: c.quoted && { handle: c.quoted.handle, text: (c.quoted.text || "").slice(0, 400) } });
  const { done: cls, gaveUp: clsFail } = await batched(picked, { label: "分类", size: 15, bytes: 60000, maxTokens: 8000, call: workerJSON,
    build: (part) => `${clsPrompt}\n\n## Input\n\n${JSON.stringify(part.map(slim), null, 1)}`,
    validate: (j) => (j.some((x) => typeof x.keep !== "boolean" || !x.title_zh || !x.title_en) ? "missing fields" : null) });
  for (const [id, why] of Object.entries(clsFail)) notes.push(`${id} 分类失败，本次跳过：${why}`);
  const works = picked.filter((c) => { const k = cls[c.id]; if (!k) return false; if (!k.keep || !CATS.has(k.category)) { stat.notWork++; return false; } if (k.original === "repost") { stat.reposts++; return false; } return true; });
  log(`分类结果：作品 ${works.length} · 非作品 ${stat.notWork} · 转帖 ${stat.reposts}`);

  // ── 2b. 筛掉的再让 Jev 过一道：Jev 有把握（本人作品 ≥0.9）就捞回来 ──
  const dropped = picked.filter((c) => cls[c.id] && !works.includes(c));
  if (dropped.length && jevAvailable()) {
    try {
      const j = await jevAudit(dropped.map((c) => ({ id: c.id, handle: c.handle, text: c.text, thread: [], prompt: null })), JEV_PROFILE);
      for (const c of dropped) {
        if ((j[c.id]?.jev?.pIn ?? 0) < 0.9) continue;
        const k = cls[c.id];
        if (!CATS.has(k.category)) k.category = j[c.id].jev.kind === "own_comparison" ? "comparison" : "illustration"; // 临时值，Opus 终审会给正式分类
        k.keep = true; k.original = "creator"; k.confidence = "low";
        works.push(c); stat.rescued.push(`@${c.handle} ${c.views.toLocaleString("en-US")} · ${k.title_zh}（分类器判为 ${k.kind}，Jev 作品 ${j[c.id].jev.pIn}）`);
      }
      log(`  Jev 复核筛掉的 ${dropped.length} 条：捞回 ${stat.rescued.length} 条`);
    } catch (e) { notes.push(`Jev 复核筛掉的帖子失败：${String(e.message).slice(0, 100)}`); }
  }

  // ── 2c. 看图：分类模型看不到图，标题常是「生成图片示例」这类空话。把第一张图（GIF / 视频用封面帧）连同帖子文字交给能看图的模型，
  //        重写中英文标题、核对分类，顺带做唯一一道看像素的安全检查（Jev 和 Opus 都看不到图）。看图失败就保留原标题，不挡收录。
  const visPrompt = fs.readFileSync(path.join(P, "retitle.md"), "utf8");
  const small = (u) => u.replace(/^(https:\/\/pbs\.twimg\.com\/media\/[\w-]+)\.(jpg|jpeg|png|webp)$/, (_, b, e) => `${b}?format=${e === "jpeg" ? "jpg" : e}&name=small`);
  // 帖子的全部图（最多 4 张，GIF / 视频用封面帧）：只看第一张时，第一张是 ChatGPT 界面截图、对比图的一半，标题就写偏了
  const imagesOf = (c) => c.media.map((m) => (m.type === "photo" ? small(m.url) : m.poster || "")).filter(Boolean).slice(0, 4);
  const visCase = (c) => JSON.stringify({ id: c.id, handle: c.handle, media: c.media.map((m) => m.type), text: c.text.slice(0, 700),
    current: { category: cls[c.id].category, title_en: cls[c.id].title_en, title_zh: cls[c.id].title_zh } });
  const VISUAL = new Set(["portrait", "illustration", "product", "design", "sticker"]);
  const { done: vis, gaveUp: visFail } = await batched(works.filter((c) => imagesOf(c).length), { label: "看图", size: 3, bytes: 14000, maxTokens: 3000,
    call: (b, o) => workerJSON(b.prompt, { ...o, images: b.images }),
    build: (part) => ({ prompt: `${visPrompt}\n\n## Cases\n\nEach case's JSON line is followed by its images, in this order: ${part.map((c) => c.id).join(", ")}.`,
      images: part.flatMap((c) => imagesOf(c).map((url, i, all) => ({ label: i === 0 ? `${visCase(c)}\n(image 1 of ${all.length})` : `(case ${c.id}, image ${i + 1} of ${all.length})`, url }))) }),
    validate: (j) => (j.some((x) => typeof x.image_seen !== "boolean" || (x.image_seen && (!x.title_en || !x.title_zh))) ? "missing fields" : null) });
  for (const [id, why] of Object.entries(visFail)) notes.push(`${id} 看图失败，保留原标题：${why}`);
  for (const c of [...works]) {
    const v = vis[c.id], k = cls[c.id];
    if (!v) continue;
    // 色情、未成年人、血腥是像素上的事实，终审看不到图也判不了，直接否决；「可能是真人」常被假截图里编的用户名误触发，交终审按描述判
    if (v.concern && v.concern !== "real_person") { works.splice(works.indexOf(c), 1); stat.visionRejected.push(`${lineOf(c, k)} — 看图判为 ${v.concern}：${v.concern_reason || v.sees || ""}`); continue; }
    if (v.concern === "real_person") k.visionConcern = String(v.concern_reason || v.sees || "").slice(0, 300);
    if (!v.image_seen) { notes.push(`${c.id} 看图模型说没看到图，保留原标题`); continue; }
    k.title_en = String(v.title_en).trim().slice(0, 80); k.title_zh = String(v.title_zh).trim().slice(0, 60); k.titleFrom = "image"; stat.retitled++;
    if (VISUAL.has(k.category) && VISUAL.has(v.category) && v.category !== k.category) { k.category = v.category; stat.recategorized++; }
  }
  log(`  看图：重写标题 ${stat.retitled} · 改分类 ${stat.recategorized} · 安全否决 ${stat.visionRejected.length} · 疑似真人交终审 ${works.filter((c) => cls[c.id].visionConcern).length} · 失败 ${Object.keys(visFail).length}`);

  // ── 3. 作者回复 ──
  const bundles = {};
  for (const c of works) {
    try {
      if (!ck.threads[c.id]) { ck.threads[c.id] = c.replies > 0 ? await authorThread(c) : []; saveCk(); }
      bundles[c.id] = bundle(c, ck.threads[c.id]);
    }
    catch (e) { bundles[c.id] = bundle(c, []); notes.push(`${c.id} 作者回复抓取失败：${String(e.message).slice(0, 80)}`); }
  }

  // ── 4. 定位提示词 + 对账（对不上的带着报错重试一次） ──
  const extPrompt = fs.readFileSync(path.join(P, "extract.md"), "utf8");
  const ext = {};
  const runExtract = async (list, label, feedback = {}) => {
    const { done, gaveUp } = await batched(list, { label, size: 6, bytes: 24000, maxTokens: 12000, call: workerJSON,
      build: (part) => { const fb = part.filter((c) => feedback[c.id]).map((c) => `- ${c.id}: ${feedback[c.id]}`).join("\n");
        return `${extPrompt}\n\n${fb ? `## Your previous answer failed the verbatim check\n\n${fb}\n\nRe-read the exact text and copy characters exactly. If you cannot, answer null for that case.\n\n` : ""}## Input\n\n${JSON.stringify(part.map((c) => bundles[c.id]), null, 1)}`; } });
    for (const o of Object.values(done)) ext[o.id] = { raw: o, ...resolvePrompt(bundles[o.id], o) };
    for (const [id, why] of Object.entries(gaveUp)) ext[id] = { raw: {}, prompt: null, failed: why };
  };
  await runExtract(works, "提取");
  const failed = works.filter((c) => ext[c.id].error);
  if (failed.length) {
    log(`  对账未通过 ${failed.length} 条，带报错重试一次`);
    await runExtract(failed, "重提", Object.fromEntries(failed.map((c) => [c.id, ext[c.id].error])));
    for (const c of failed) if (ext[c.id].error) { notes.push(`${c.id} 提示词对账两次未通过，按无提示词处理：${ext[c.id].error.slice(0, 100)}`); ext[c.id].prompt = null; }
  }

  // ── 5. 审核：Jev（换成图片库的选项说明）；Jev 不可用时退回 GPT 审核 ──
  const audPrompt = fs.readFileSync(path.join(P, "audit.md"), "utf8");
  const headTail = (t) => (t.length <= 1600 ? t : `${t.slice(0, 1100)}\n…[${t.length - 1500} characters omitted]…\n${t.slice(-400)}`);
  const auditInput = (c) => { const e = ext[c.id], k = cls[c.id]; return { id: c.id, handle: c.handle, views: c.views, root_text: c.text.slice(0, 2500),
    thread: bundles[c.id].thread.slice(0, 8).map((t) => t.text.slice(0, 500)), category: k.category, title_en: k.title_en, title_zh: k.title_zh, summary_en: e.raw.summary_en || "",
    prompt: e.prompt?.text ? { kind: e.prompt.kind, source: e.prompt.source, text: headTail(e.prompt.text) } : null }; };
  let audit = null, audFail = {};
  if (jevAvailable() && process.env.OPUS_AUDITOR !== "gpt") {
    try {
      audit = await jevAudit(works.map((c) => ({ id: c.id, handle: c.handle, text: c.text, thread: bundles[c.id].thread.slice(0, 4).map((t) => t.text), prompt: ext[c.id].prompt?.text || null })), JEV_PROFILE);
      log(`  审核: ${works.length} 条 via Jev（${jevUsage.model}，$${jevUsage.cost.toFixed(4)}）`);
    } catch (e) { notes.push(`Jev 审核不可用，退回 GPT：${String(e.message).slice(0, 100)}`); audit = null; }
  }
  if (!audit) {
    ({ done: audit, gaveUp: audFail } = await batched(works, { label: "审核", size: 12, bytes: 40000, maxTokens: 6000, call: reviewerJSON,
      build: (part) => `${audPrompt}\n\n## Input\n\n${JSON.stringify(part.map(auditInput), null, 1)}`,
      validate: (j) => (j.some((x) => !["publish", "hold", "reject"].includes(x.verdict)) ? "bad verdict" : null) }));
  }
  for (const [id, why] of Object.entries(audFail)) audit[id] = { verdict: "hold", confidence: "low", issues: [], reason: `审核模型不可用（${why.slice(0, 60)}）` };

  // ── 6. 裁决 ──
  for (const c of works) {
    const k = cls[c.id], e = ext[c.id], a = audit[c.id];
    if (a.title_en && a.title_zh && k.titleFrom !== "image") { k.title_en = a.title_en.slice(0, 80); k.title_zh = a.title_zh.slice(0, 60); }
    k.tools = e.raw.tools || k.tools || []; k.reference_assets = !!(e.raw.reference_assets ?? k.reference_assets);
    const line = lineOf(c, k);
    const reasons = [];
    if (k.confidence === "low") reasons.push("分类把握低");
    if (k.visionConcern) reasons.push(`看图：可能是真实人物以假乱真（${k.visionConcern}）`);
    if (a.verdict === "hold") reasons.push(`审核拿不准：${a.reason}`);
    if (a.verdict !== "hold" && a.confidence !== "high") reasons.push(`审核把握不足（${a.confidence}）：${a.reason}`);
    if (e.prompt?.source === "image") reasons.push("提示词在截图里，需要人工转写");
    if (e.failed) reasons.push(`提示词定位失败（${e.failed.slice(0, 60)}）`);
    if (a.verdict === "reject" && a.confidence === "high") { stat.rejected.push(`${line} — ${a.reason}`); continue; }
    let prompt = e.prompt;
    if (prompt && a.prompt_ok === false && a.confidence === "high") { notes.push(`${c.id} 审核否决了提示词（${(a.issues || []).join(",") || "—"}）：${a.reason}`); prompt = null; }
    const record = { id: c.id, prompt: prompt?.text || prompt?.source === "link" ? prompt : null, reference_assets: k.reference_assets, tools: k.tools, summary_en: e.raw.summary_en || "", summary_zh: e.raw.summary_zh || "", note: e.raw.note || "" };
    if (reasons.length) { held.push({ candidate: c, classified: k, extracted: { ...record, prompt: e.prompt }, audit: a, reasons, thread: bundles[c.id].thread.map((t) => t.text) }); continue; }
    candidates.push(c); classified[c.id] = k; extracted.push(record); known.add(c.id);
    (record.prompt?.text ? stat.published : stat.publishedNoPrompt).push(line);
  }
}

// ── 6b. 终审：审核拿不准的交给 Opus 拍板；Opus 也不可用时进待审队列（带着作者回复，下次补终审用） ──
if (held.length) {
  const { decisions, failed } = await arbitrate(held, log, { prompt: ARB_PROMPT });
  for (const x of held) {
    const c = x.candidate, d = decisions[c.id], line = lineOf(c, x.classified);
    if (!d) { pending.push({ ...x, heldAt: nowISO }); stat.held.push(`${line} — ${x.reasons.join("；")}；终审不可用（${failed[c.id] || "?"}）`); continue; }
    const rec = decide(x, d);
    if (!rec) { stat.arbRejected.push(`${line} — ${d.reason}`); continue; }
    candidates.push(c); classified[c.id] = x.classified; extracted.push(rec); known.add(c.id);
    stat.arbPublished.push(`${line}${rec.prompt ? "（带提示词）" : ""} — ${d.reason}`);
  }
}

// ── 7. 写入 + 摘要 ──
const summary = [
  `## ChatGPT Images 2.6 合集每日收录 ${nowISO.slice(0, 10)}`, "",
  `窗口 ${new Date(from).toISOString().slice(0, 16)}Z → ${new Date(to).toISOString().slice(0, 16)}Z（发布时间）`, "",
  "| 项 | 数量 |", "|---|---|",
  `| 搜索返回 | ${raw.length}${truncated ? "（触及上限）" : ""} |`, `| 没见过的 | ${fresh.length} |`, `| 浏览 ≥${THRESHOLD} 且带媒体 | ${normalized.length} |`, `| 不是 Images 2.6 | ${stat.otherModel} |`, `| 官方 / 平台账号 | ${stat.platform} |`, `| 本次处理（上限 ${CAP}） | ${picked.length} |`,
  `| **上线：带提示词** | ${stat.published.length} |`, `| **上线：仅作品** | ${stat.publishedNoPrompt.length} |`, `| 终审（Opus）通过 / 否决 | ${stat.arbPublished.length} / ${stat.arbRejected.length} |`, `| 进待审队列（共 ${pending.length}） | ${stat.held.length} |`, `| 审核否决 | ${stat.rejected.length} |`, `| 看图：重写标题 / 改分类 / 安全否决 | ${stat.retitled} / ${stat.recategorized} / ${stat.visionRejected.length} |`, `| 非作品 / 转帖 | ${stat.notWork} / ${stat.reposts} |`, `| 其中被 Jev 捞回 | ${stat.rescued.length} |`,
  "", "| 消耗 | |", "|---|---|",
  `| twitterapi.io | ${cost.tweets} 条 ≈ ${cost.credits.toLocaleString("en-US")} credits |`,
  `| 干活模型 | ${usage.worker.calls} 次调用 · 输入 ${usage.worker.in.toLocaleString("en-US")} / 输出 ${usage.worker.out.toLocaleString("en-US")} tokens |`,
  `| 审核模型（${usage.reviewer.provider || "未调用"}） | ${usage.reviewer.calls} 次调用 · 输入 ${usage.reviewer.in.toLocaleString("en-US")} / 输出 ${usage.reviewer.out.toLocaleString("en-US")} tokens |`,
  `| 审核（Jev） | ${jevUsage.calls} 次调用 · $${jevUsage.cost.toFixed(4)} |`,
  `| 终审模型（${usage.arbiter.model || "未调用"}） | ${usage.arbiter.calls} 次调用 · 输入 ${usage.arbiter.in.toLocaleString("en-US")} / 输出 ${usage.arbiter.out.toLocaleString("en-US")} tokens |`,
  ...[["上线：带提示词", stat.published], ["上线：仅作品", stat.publishedNoPrompt], ["Jev 捞回的", stat.rescued], ["终审通过", stat.arbPublished], ["终审否决", stat.arbRejected], ["进待审队列", stat.held], ["审核否决", stat.rejected], ["看图安全否决", stat.visionRejected], ["备注", notes]].flatMap(([t, l]) => (l.length ? ["", `**${t}**`, ...l.map((s) => `- ${s}`)] : [])),
].join("\n");
log("\n" + summary);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
if (DRY) { log("\n(dry run：未写入)"); process.exit(0); }

wr("candidates.json", "[\n" + candidates.map((c) => JSON.stringify(c)).join(",\n") + "\n]\n");
wr("classified.json", "{\n" + Object.entries(classified).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(",\n") + "\n}\n");
wr("extracted.json", "[\n" + extracted.map((e) => JSON.stringify(e)).join(",\n") + "\n]\n");
wr("pending.json", pending);
wr("seen.json", "[" + [...seen].sort().map((s) => JSON.stringify(s)).join(",") + "]\n");
if (!MANUAL) wr("state.json", { windowEnd: new Date(to).toISOString(), lastRunAt: nowISO, lastRun: { searched: raw.length, processed: picked.length, published: stat.published.length + stat.publishedNoPrompt.length, held: stat.held.length, credits: cost.credits } });
fs.rmSync(WORK, { recursive: true, force: true });
log("\n✅ 已写入 data/");
