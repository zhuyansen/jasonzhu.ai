/** X 数据：twitterapi.io（搜索、作者回复，约 15 credits/条）+ 归一化。本机设 OPUS_TRANSPORT=curl。 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
const CURL = process.env.OPUS_TRANSPORT === "curl" || process.env.CLAUDE_TRANSPORT === "curl";
const KEY = process.env.TWITTERAPI_IO_KEY;
export const cost = { tweets: 0, get credits() { return this.tweets * 15; } };

async function api(pathname, params) {
  if (!KEY) throw new Error("缺 TWITTERAPI_IO_KEY");
  const url = `https://api.twitterapi.io${pathname}?${new URLSearchParams(params)}`;
  for (let attempt = 1; ; attempt++) {
    try {
      let text;
      if (CURL) {
        // 密钥走 stdin 的 curl 配置，不进命令行（execFile 失败时命令行会被写进报错）
        const p = run("curl", ["-sS", "-m", "45", "-K", "-", url], { maxBuffer: 64e6 });
        p.child.stdin.end(`header = "X-API-Key: ${KEY}"\n`);
        try { ({ stdout: text } = await p); } catch (e) { throw new Error(`curl failed (exit ${e.code ?? "?"}): ${String(e.stderr || "").trim().slice(0, 160)}`); }
      }
      else { const r = await fetch(url, { headers: { "X-API-Key": KEY }, signal: AbortSignal.timeout(45000) }); text = await r.text(); if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 120)}`); }
      return JSON.parse(text);
    } catch (e) { if (attempt >= 3) throw e; await new Promise((r) => setTimeout(r, 2000 * attempt)); }
  }
}

async function paged(query, maxTweets, maxPages = 25) {
  const out = []; let cursor = "";
  for (let p = 0; p < maxPages && out.length < maxTweets; p++) {
    const j = await api("/twitter/tweet/advanced_search", { query, queryType: "Latest", ...(cursor ? { cursor } : {}) });
    // 接口出错（限流、余额、参数）时返回的 JSON 没有 tweets 数组。以前把它当成「0 条」静默继续，
    // 调用方会照常推进时间窗口，那段时间就被永久跳过了（2026-09-30 差点发生）。
    if (!Array.isArray(j.tweets)) throw new Error(`search API error: ${JSON.stringify(j).slice(0, 200)}`);
    const ts = j.tweets; cost.tweets += ts.length; out.push(...ts);
    if (!j.has_next_page || !j.next_cursor || !ts.length) break;
    cursor = j.next_cursor;
  }
  return out;
}

/** 按发布时间窗口搜：每条帖子只会落在一个窗口里，只付一次钱 */
export const searchWindow = ({ from, to, minFaves, maxTweets }) =>
  paged(`("Opus 5.5" OR "Opus5.5") filter:native_video min_faves:${minFaves} -filter:replies since_time:${Math.floor(from / 1000)} until_time:${Math.floor(to / 1000)}`, maxTweets);

export async function authorThread(c) {
  const ts = await paged(`conversation_id:${c.conversationId} from:${c.handle}`, 60, 3);
  const seen = new Set([c.id]);
  return ts.filter((t) => !seen.has(t.id) && seen.add(t.id)).map((t) => ({
    id: t.id, inReplyToId: t.inReplyToId, createdAt: t.createdAt, text: t.text,
    urls: (t.entities?.urls || []).map((u) => u.expanded_url).filter(Boolean),
    photos: (t.extendedEntities?.media || []).filter((m) => m.type === "photo").map((m) => m.media_url_https),
  })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

// 选 ≤720p 里码率最高的 mp4
function pickMp4(variants) {
  const v = (variants || []).filter((x) => /mp4/.test(x.content_type || "") || /\.mp4/.test(x.url || ""))
    .map((x) => { const m = x.url.match(/\/(\d+)x(\d+)\//); return { url: x.url, bitrate: x.bitrate || 0, w: Number(m?.[1] || 0), h: Number(m?.[2] || 0) }; })
    .filter((x) => /^https:\/\/video\.twimg\.com\//.test(x.url));
  if (!v.length) return null;
  return v.filter((x) => x.w && Math.min(x.w, x.h) <= 720).sort((a, b) => b.bitrate - a.bitrate)[0] || v.sort((a, b) => a.bitrate - b.bitrate)[0];
}

/** twitterapi.io 的推文 → 候选记录（与 data/candidates.json 同构）；没有原生视频返回 null */
export function normalize(t, now = new Date().toISOString()) {
  const m = (t.extendedEntities?.media || []).find((x) => x.type === "video");
  const mp4 = m && pickMp4(m.video_info?.variants);
  if (!mp4 || !/^https:\/\/pbs\.twimg\.com\//.test(m.media_url_https || "")) return null;
  return {
    id: t.id, url: `https://x.com/${t.author.userName}/status/${t.id}`, handle: t.author.userName, name: t.author.name, followers: t.author.followers, verified: !!t.author.isBlueVerified,
    createdAt: new Date(t.createdAt).toISOString(), lang: t.lang, text: t.text,
    links: (t.entities?.urls || []).map((u) => u.expanded_url).filter((u) => u && !/\/\/(x|twitter)\.com\/[^/]+\/status\/\d+\/(video|photo)/.test(u)),
    views: t.viewCount || 0, likes: t.likeCount || 0, replies: t.replyCount || 0, reposts: t.retweetCount || 0, quotes: t.quoteCount || 0, bookmarks: t.bookmarkCount || 0,
    conversationId: t.conversationId || t.id, quoted: t.quoted_tweet ? { id: t.quoted_tweet.id, handle: t.quoted_tweet.author?.userName, text: t.quoted_tweet.text } : null,
    video: { poster: m.media_url_https, mp4: mp4.url, width: mp4.w, height: mp4.h, durationSec: Math.round((m.video_info.duration_millis || 0) / 1000), aspect: m.video_info.aspect_ratio },
    seed: false, via: "daily", checkedAt: now,
  };
}
