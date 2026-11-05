/**
 * ChatGPT Images 2.6 合集的 X 数据：搜索任意媒体（图片 / GIF / 视频）的原创帖 + 归一化。
 * 搜索、作者回复、mp4 选择复用 ../../opus-prompts/lib/x.mjs（约 15 credits/条，本机设 OPUS_TRANSPORT=curl）。
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { paged, pickMp4 } from "../../opus-prompts/lib/x.mjs";
const run = promisify(execFile);
const CURL = process.env.OPUS_TRANSPORT === "curl" || process.env.CLAUDE_TRANSPORT === "curl";

/** 搜索词：ChatGPT Images 2.6（2026-11-04 发布，API 名 GPT-Image-2.6 Flare / Sunburst）。SEARCH_TERMS 可覆盖 */
export const TERMS = process.env.SEARCH_TERMS || '"Images 2.6" OR "Image 2.6" OR "Images2.6" OR "Image2.6" OR "gpt-image-2.6" OR "gpt image 2.6"';
export const searchWindow = ({ from, to, minFaves, maxTweets }) =>
  paged(`(${TERMS}) filter:media -filter:replies -filter:retweets min_faves:${minFaves} since_time:${Math.floor(from / 1000)} until_time:${Math.floor(to / 1000)}`, maxTweets);

const dims = (m) => ({ width: m.original_info?.width || m.sizes?.large?.w || 0, height: m.original_info?.height || m.sizes?.large?.h || 0 });

/** 一条推文的媒体 → [{ type: "photo"|"gif"|"video", url, poster?, width, height, durationSec? }]，最多 4 个 */
export function mediaOf(t) {
  return (t.extendedEntities?.media || []).map((m) => {
    if (!/^https:\/\/pbs\.twimg\.com\//.test(m.media_url_https || "")) return null;
    if (m.type === "photo") return { type: "photo", url: m.media_url_https, ...dims(m) };
    if (m.type !== "animated_gif" && m.type !== "video") return null;
    const mp4 = pickMp4(m.video_info?.variants);
    if (!mp4) return null;
    return { type: m.type === "animated_gif" ? "gif" : "video", url: mp4.url, poster: m.media_url_https, ...dims(m),
      durationSec: Math.round((m.video_info?.duration_millis || 0) / 1000) };
  }).filter(Boolean).slice(0, 4);
}
export const hasMedia = (t) => (t.extendedEntities?.media || []).length > 0;

/**
 * 搜索结果缺媒体字段时，用 FXTwitter（免费、免登录）补回 extendedEntities（Opus 库 2026-10-13～14 吃过整批不带媒体的亏）。
 * 返回 { filled, noMedia, failed }
 */
export async function fillMediaFromFx(tweets) {
  const out = { filled: 0, noMedia: 0, failed: 0 };
  for (const t of tweets) {
    try {
      const url = `https://api.fxtwitter.com/status/${t.id}`;
      let text;
      if (CURL) ({ stdout: text } = await run("curl", ["-sS", "-m", "30", "--retry", "2", "-A", "jasonzhu.ai-collector/1.0", url], { maxBuffer: 32e6 }));
      else { const r = await fetch(url, { headers: { "User-Agent": "jasonzhu.ai-collector/1.0" }, signal: AbortSignal.timeout(30000) }); if (!r.ok) throw new Error(`HTTP ${r.status}`); text = await r.text(); }
      const all = JSON.parse(text).tweet?.media?.all || [];
      const media = all.map((m) => {
        const original_info = { width: m.width || 0, height: m.height || 0 };
        if (m.type === "photo") return { type: "photo", media_url_https: m.url, original_info };
        const variants = (m.variants || (m.url ? [{ url: m.url }] : [])).filter((x) => /\.mp4/.test(x.url || "")).map((x) => ({ url: x.url, bitrate: x.bitrate || 0, content_type: "video/mp4" }));
        return { type: m.type === "gif" ? "animated_gif" : "video", media_url_https: m.thumbnail_url, original_info,
          video_info: { duration_millis: Math.round((m.duration || 0) * 1000), variants } };
      });
      if (!media.length) { out.noMedia++; continue; }
      t.extendedEntities = { media };
      out.filled++;
    } catch { out.failed++; }
    await new Promise((r) => setTimeout(r, 300));
  }
  return out;
}

/** twitterapi.io 的推文 → 候选记录（data/candidates.json）；没有可用媒体返回 null */
export function normalize(t, now = new Date().toISOString()) {
  const media = mediaOf(t);
  if (!media.length) return null;
  return {
    id: t.id, url: `https://x.com/${t.author.userName}/status/${t.id}`, handle: t.author.userName, name: t.author.name, followers: t.author.followers, verified: !!t.author.isBlueVerified,
    createdAt: new Date(t.createdAt).toISOString(), lang: t.lang, text: t.text,
    links: (t.entities?.urls || []).map((u) => u.expanded_url).filter((u) => u && !/\/\/(x|twitter)\.com\/[^/]+\/status\/\d+\/(video|photo)/.test(u)),
    views: t.viewCount || 0, likes: t.likeCount || 0, replies: t.replyCount || 0, reposts: t.retweetCount || 0, quotes: t.quoteCount || 0, bookmarks: t.bookmarkCount || 0,
    conversationId: t.conversationId || t.id, quoted: t.quoted_tweet ? { id: t.quoted_tweet.id, handle: t.quoted_tweet.author?.userName, text: t.quoted_tweet.text } : null,
    media, seed: false, via: "daily", checkedAt: now,
  };
}
