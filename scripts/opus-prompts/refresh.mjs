#!/usr/bin/env node
/**
 * 提示词库数据核验（免登录、免费，走 FXTwitter）：
 *   - 刷新每个作品的播放/点赞/评论/收藏
 *   - 刷新视频和封面地址（X 会换地址）
 *   - 标记已删帖、转私密、视频被移除的作品 → data/unavailable.json，assemble 时自动排除
 *
 * 保险丝：瞬时错误超过 5%，或一次新增不可用超过 10%，判定为接口异常，不写任何文件并以非零退出。
 * 「不可用」要同一轮里隔一会儿再确认一次才算数，避免把接口抖动当成删帖。
 *
 * 用法：node scripts/opus-prompts/refresh.mjs [--dry]
 * 环境变量：OPUS_TRANSPORT=curl（本机 Node 过不了代理时用）· LIMIT=20（调试只跑前 N 条）· OPUS_DATA_DIR（测试用数据目录）
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";

const run = promisify(execFile);
const D = process.env.OPUS_DATA_DIR || path.join(import.meta.dirname, "data"); // OPUS_DATA_DIR 仅供测试
const F_CAND = path.join(D, "candidates.json");
const F_UNAV = path.join(D, "unavailable.json");
const DRY = process.argv.includes("--dry");
const LIMIT = Number(process.env.LIMIT || 0);
const CURL = process.env.OPUS_TRANSPORT === "curl";
const UA = "jasonzhu.ai-prompt-library/1.0 (+https://jasonzhu.ai/en/prompts/claude-opus-5-5)";
const CONCURRENCY = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  if (CURL) {
    const { stdout } = await run("curl", ["-sS", "-m", "30", "-A", UA, url], { maxBuffer: 32e6 });
    return JSON.parse(stdout);
  }
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
  return JSON.parse(await res.text()); // 404/401 也返回 JSON，状态在 code 字段里
}

/** @returns {{state:"ok",tweet:object}|{state:"gone",reason:string}|{state:"error",reason:string}} */
async function check(id) {
  let last = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const j = await getJson(`https://api.fxtwitter.com/status/${id}`);
      if (j.code === 200 && j.tweet) return j.tweet.media?.videos?.length ? { state: "ok", tweet: j.tweet } : { state: "gone", reason: "video_removed" };
      if (j.code === 404) return { state: "gone", reason: "deleted" };
      if (j.code === 401) return { state: "gone", reason: "private" };
      last = `code ${j.code} ${j.message || ""}`;
    } catch (e) {
      last = String(e.message || e).slice(0, 120);
    }
    await sleep(1500 * (attempt + 1));
  }
  return { state: "error", reason: last };
}

async function pool(items, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); await sleep(120); }
  }));
  return out;
}

// 选 ≤720p 里码率最高的 mp4：清晰度够用，流量可控
function pickMp4(video) {
  const list = (video.formats || video.variants || [])
    .filter((f) => /mp4/.test(f.container || f.content_type || "") || /\.mp4/.test(f.url || ""))
    .map((f) => { const m = (f.url || "").match(/\/(\d+)x(\d+)\//); return { url: f.url, bitrate: f.bitrate || 0, w: Number(m?.[1] || 0), h: Number(m?.[2] || 0) }; })
    .filter((f) => /^https:\/\/video\.twimg\.com\//.test(f.url));
  if (!list.length) return null;
  const ok = list.filter((f) => f.w && Math.min(f.w, f.h) <= 720).sort((a, b) => b.bitrate - a.bitrate);
  return ok[0] || list.sort((a, b) => a.bitrate - b.bitrate)[0];
}

const all = JSON.parse(fs.readFileSync(F_CAND, "utf8"));
const unav = fs.existsSync(F_UNAV) ? JSON.parse(fs.readFileSync(F_UNAV, "utf8")) : {};
const targets = LIMIT ? all.slice(0, LIMIT) : all;
const now = new Date().toISOString();
console.log(`核验 ${targets.length} 个作品（transport=${CURL ? "curl" : "fetch"}${DRY ? "，dry run" : ""}）`);

let results = await pool(targets, (c) => check(c.id));

// 「不可用」隔一会儿再确认一次
const suspects = results.map((r, i) => (r.state === "gone" ? i : -1)).filter((i) => i >= 0);
if (suspects.length) {
  await sleep(20000);
  const again = await pool(suspects, (i) => check(targets[i].id));
  suspects.forEach((i, k) => { if (again[k].state !== "gone") results[i] = again[k]; });
}

const stat = { ok: 0, error: 0, gone: 0, newlyGone: [], restored: [], videoChanged: 0, viewsDelta: 0 };
const errors = [];
results.forEach((r, i) => {
  const c = targets[i];
  if (r.state === "error") { stat.error++; errors.push(`${c.id} ${r.reason}`); return; }
  if (r.state === "gone") {
    stat.gone++;
    if (!unav[c.id]) { stat.newlyGone.push(`${c.id} @${c.handle} ${r.reason}`); unav[c.id] = { reason: r.reason, handle: c.handle, firstSeen: now }; }
    unav[c.id].lastSeen = now; unav[c.id].reason = r.reason;
    return;
  }
  stat.ok++;
  if (unav[c.id]) { stat.restored.push(`${c.id} @${c.handle}`); delete unav[c.id]; }
  const t = r.tweet, v = t.media.videos[0], mp4 = pickMp4(v);
  const num = (x, old) => (typeof x === "number" && x >= 0 ? x : old);
  stat.viewsDelta += num(t.views, c.views) - c.views;
  Object.assign(c, { views: num(t.views, c.views), likes: num(t.likes, c.likes), replies: num(t.replies, c.replies), reposts: num(t.retweets, c.reposts), bookmarks: num(t.bookmarks, c.bookmarks), checkedAt: now });
  if (mp4 && mp4.url !== c.video.mp4) { stat.videoChanged++; Object.assign(c.video, { mp4: mp4.url, width: mp4.w || c.video.width, height: mp4.h || c.video.height }); }
  if (v.thumbnail_url && /^https:\/\/pbs\.twimg\.com\//.test(v.thumbnail_url)) c.video.poster = v.thumbnail_url;
  if (v.duration) c.video.durationSec = Math.round(v.duration);
});

const summary = [
  `## 提示词库核验 ${now.slice(0, 10)}`, "",
  `| 项 | 数量 |`, `|---|---|`,
  `| 核验作品 | ${targets.length} |`, `| 正常 | ${stat.ok} |`, `| 不可用（累计） | ${Object.keys(unav).length} |`, `| 本次新增不可用 | ${stat.newlyGone.length} |`,
  `| 恢复可用 | ${stat.restored.length} |`, `| 视频地址变更 | ${stat.videoChanged} |`, `| 瞬时错误（本次未更新） | ${stat.error} |`, `| 播放量合计变化 | +${stat.viewsDelta.toLocaleString("en-US")} |`,
  ...(stat.newlyGone.length ? ["", "**新增不可用**", ...stat.newlyGone.map((s) => `- ${s}`)] : []),
  ...(stat.restored.length ? ["", "**恢复可用**", ...stat.restored.map((s) => `- ${s}`)] : []),
  ...(errors.length ? ["", "**瞬时错误**", ...errors.slice(0, 20).map((s) => `- ${s}`)] : []),
].join("\n");
console.log("\n" + summary);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");

const n = targets.length;
if (stat.error / n > 0.05) { console.error(`\n❌ 瞬时错误 ${stat.error}/${n} 超过 5%，判定接口异常，不写入`); process.exit(1); }
if (stat.newlyGone.length / n > 0.1) { console.error(`\n❌ 一次新增不可用 ${stat.newlyGone.length}/${n} 超过 10%，判定接口异常，不写入`); process.exit(1); }
if (DRY || LIMIT) { console.log("\n(dry run / LIMIT：未写入)"); process.exit(0); }

// 一行一个作品，diff 才看得懂
fs.writeFileSync(F_CAND, "[\n" + all.map((c) => JSON.stringify(c)).join(",\n") + "\n]\n");
fs.writeFileSync(F_UNAV, JSON.stringify(unav, null, 1) + "\n");
console.log("\n✅ 已写入 candidates.json / unavailable.json");
