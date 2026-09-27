// 把两路原始数据归一成统一候选记录 candidates.json，并切块给分类用
import fs from "node:fs";
const S = JSON.parse(fs.readFileSync("raw-search.json", "utf8")).tweets;
const F = JSON.parse(fs.readFileSync("raw-seeds.json", "utf8"));
const seeds = new Set(fs.readFileSync("seeds.txt", "utf8").split("\n").filter(Boolean));
const pickMp4 = (vars) => { // 选 ≤720p 里码率最高的，兼顾清晰度和流量
  const v = vars.filter(x => (x.content_type || x.format || "").includes("mp4") || /\.mp4/.test(x.url)).map(x => ({ url: x.url, bitrate: x.bitrate || 0, h: Number((x.url.match(/\/(\d+)x(\d+)\//) || [])[2] || 0), w: Number((x.url.match(/\/(\d+)x(\d+)\//) || [])[1] || 0) }));
  if (!v.length) return null;
  const le = v.filter(x => Math.min(x.w, x.h) <= 720 && Math.min(x.w, x.h) > 0).sort((a, b) => b.bitrate - a.bitrate);
  return le[0] || v.sort((a, b) => a.bitrate - b.bitrate)[0];
};
const out = [];
for (const t of Object.values(S)) {
  if ((t.viewCount || 0) < 5000) continue;
  const m = (t.extendedEntities?.media || []).find(x => x.type === "video"); if (!m) continue;
  const mp4 = pickMp4(m.video_info?.variants || []); if (!mp4) continue;
  const urls = (t.entities?.urls || []).map(u => u.expanded_url).filter(u => u && !/\/\/(x|twitter)\.com\/[^/]+\/status\/\d+\/(video|photo)/.test(u));
  out.push({ id: t.id, url: `https://x.com/${t.author.userName}/status/${t.id}`, handle: t.author.userName, name: t.author.name, followers: t.author.followers, verified: !!t.author.isBlueVerified,
    createdAt: new Date(t.createdAt).toISOString(), lang: t.lang, text: t.text, links: urls,
    views: t.viewCount, likes: t.likeCount, replies: t.replyCount, reposts: t.retweetCount, quotes: t.quoteCount, bookmarks: t.bookmarkCount,
    conversationId: t.conversationId, quoted: t.quoted_tweet ? { id: t.quoted_tweet.id, handle: t.quoted_tweet.author?.userName, text: t.quoted_tweet.text } : null,
    video: { poster: m.media_url_https, mp4: mp4.url, width: mp4.w, height: mp4.h, durationSec: Math.round((m.video_info.duration_millis || 0) / 1000), aspect: m.video_info.aspect_ratio },
    seed: seeds.has(t.id), via: "search", checkedAt: new Date().toISOString() });
}
for (const [id, t] of Object.entries(F)) {
  if (t.error || (t.views || 0) < 5000 || !t.media?.videos?.length) continue;
  const v = t.media.videos[0]; const vars = v.formats || v.variants || [{ url: v.url, bitrate: 0 }]; const mp4 = pickMp4(vars) || { url: v.url, w: v.width, h: v.height };
  out.push({ id, url: `https://x.com/${t.author.screen_name}/status/${id}`, handle: t.author.screen_name, name: t.author.name, followers: t.author.followers, verified: !!t.author.verification?.verified,
    createdAt: new Date(t.created_at).toISOString(), lang: t.lang, text: t.text, links: (t.raw_text?.facets || []).filter(f => f.type === "url").map(f => f.replacement).filter(Boolean),
    views: t.views, likes: t.likes, replies: t.replies, reposts: t.retweets, quotes: t.quotes ?? null, bookmarks: t.bookmarks,
    conversationId: id, quoted: t.quote ? { id: t.quote.id, handle: t.quote.author?.screen_name, text: t.quote.text } : null,
    video: { poster: v.thumbnail_url, mp4: mp4.url, width: mp4.w || v.width, height: mp4.h || v.height, durationSec: Math.round(v.duration || 0), aspect: [v.width, v.height] },
    seed: true, via: "fxtwitter", checkedAt: new Date().toISOString() });
}
out.sort((a, b) => b.views - a.views);
fs.writeFileSync("candidates.json", JSON.stringify(out, null, 1));
const N = 8, per = Math.ceil(out.length / N);
// 交错分配，让每块的播放量分布相近
const chunks = Array.from({ length: N }, () => []); out.forEach((c, i) => chunks[i % N].push(c));
chunks.forEach((ch, i) => fs.writeFileSync(`chunk-${i + 1}.json`, JSON.stringify(ch.map(c => ({ id: c.id, handle: c.handle, name: c.name, followers: c.followers, views: c.views, lang: c.lang, durationSec: c.video.durationSec,
  text: c.text.length > 1800 ? c.text.slice(0, 1800) + ` …[truncated, full length ${c.text.length} chars]` : c.text, links: c.links.slice(0, 5), quoted: c.quoted && { handle: c.quoted.handle, text: (c.quoted.text || "").slice(0, 400) } })), null, 1)));
console.log("candidates:", out.length, "| seeds in pool:", out.filter(c => c.seed).length, "| chunks:", chunks.map(c => c.length).join(","), "| mp4 missing dims:", out.filter(c => !c.video.width).length);
console.log("chunk sizes (KB):", chunks.map((_, i) => Math.round(fs.statSync(`chunk-${i + 1}.json`).size / 1024)).join(","));
