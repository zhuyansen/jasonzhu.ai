/**
 * X 数据（搜索、作者回复）+ 归一化。本机设 OPUS_TRANSPORT=curl。
 *
 * 两个通道（2026-11-07 起）：先走 AIsa（AISA_API_KEY），出错就改走 twitterapi.io 直连（TWITTERAPI_IO_KEY），
 * 余额不足、限流、超时都算出错。AIsa 的 X 工具底层就是 twitterapi.io：参数、返回格式都一样，价格也一样
 * （每条 $0.00015 = 15 credits），只是从 AIsa 的余额里扣。两边各有各的钱包，一边用完另一边顶上
 * （11-06 twitterapi.io 余额用完，两个库停了一天）。
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
const CURL = process.env.OPUS_TRANSPORT === "curl" || process.env.CLAUDE_TRANSPORT === "curl";
const KEY = process.env.TWITTERAPI_IO_KEY;
const AISA_KEY = process.env.AISA_API_KEY;
const AISA_URL = `${(process.env.AISA_ROUTER_BASE_URL || "https://tools.aisa.one").replace(/\/+$/, "")}/v1/tool-router/aisa-batch-use`;
// twitterapi.io 的接口路径 → AIsa 上对应的工具
const AISA_TOOLS = { "/twitter/tweet/advanced_search": "get_twitter_tweet_advanced_search" };

/** 用量，两个通道分开记。aisaDown：这次运行里 AIsa 为什么没用上（没配 key，或者出错后改走直连） */
export const cost = { aisa: { tweets: 0, usd: 0 }, direct: { tweets: 0 }, aisaDown: "" };
/** 运行摘要里的两行用量（两个库共用） */
export const costRows = () => [
  `| X 数据：AIsa（主） | ${cost.aisa.tweets} 条 · $${cost.aisa.usd.toFixed(4)} |`,
  `| X 数据：twitterapi.io 直连（备） | ${cost.direct.tweets} 条 ≈ ${(cost.direct.tweets * 15).toLocaleString("en-US")} credits${cost.aisaDown ? `（AIsa 没用上：${cost.aisaDown.slice(0, 100)}）` : ""} |`,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 401 / 402 / 403：key 不对、余额不足、没权限，重试没用（twitterapi.io 文档也让遇到 402 就停）
const fatal = (status) => status === 401 || status === 402 || status === 403;
const fail = (msg, status) => Object.assign(new Error(msg), { fatal: fatal(status) });
// 报错原文取出人话：twitterapi.io 是 {"error":"Unauthorized","message":"Credits is not enough…"}，
// AIsa 常在 message 里再套一段 JSON（{"message":"{\"code\":…,\"error\":\"…\"}"}）
const reason = (v) => {
  let s = typeof v === "string" ? v : JSON.stringify(v ?? "");
  for (let i = 0; i < 2; i++) {
    let j; try { j = JSON.parse(s); } catch { break; }
    const err = typeof j?.error === "string" ? j.error : j?.error?.message;
    const msg = typeof j?.message === "string" ? j.message : j?.msg;
    if (typeof msg === "string" && /^\s*\{/.test(msg)) { s = msg; continue; }
    const parts = [err, msg].filter((x) => typeof x === "string" && x);
    if (parts.length) s = parts.join("：");
    break;
  }
  return s.slice(0, 160);
};

/** 发一个请求，返回 { status, text }。key 只放在请求头里：curl 模式从 stdin 传配置，不进命令行（execFile 失败时命令行会被写进报错） */
async function http(url, { header, body }) {
  if (CURL) {
    const args = ["-sS", "-m", "60", "-K", "-", "-w", "\n%{http_code}"];
    if (body) args.push("-X", "POST", "-H", "Content-Type: application/json", "--data-binary", body);
    const p = run("curl", [...args, url], { maxBuffer: 64e6 });
    p.child.stdin.end(`header = "${header}"\n`);
    let out;
    try { ({ stdout: out } = await p); } catch (e) { throw new Error(`curl failed (exit ${e.code ?? "?"}): ${String(e.stderr || "").trim().slice(0, 160)}`); }
    const i = out.lastIndexOf("\n");
    return { status: Number(out.slice(i + 1)), text: out.slice(0, i) };
  }
  const i = header.indexOf(": ");
  const headers = { [header.slice(0, i)]: header.slice(i + 2), ...(body ? { "Content-Type": "application/json" } : {}) };
  const r = await fetch(url, { method: body ? "POST" : "GET", headers, body, signal: AbortSignal.timeout(60000) });
  return { status: r.status, text: await r.text() };
}

/** AIsa tool router：一次调一个工具，data 就是 twitterapi.io 原样的返回 */
async function viaAisa(tool, params) {
  const body = JSON.stringify({ calls: [{ call_id: "x", tool, arguments: params }] });
  for (let attempt = 1; ; attempt++) {
    try {
      const { status, text } = await http(AISA_URL, { header: `Authorization: Bearer ${AISA_KEY}`, body });
      if (status !== 200) throw fail(`HTTP ${status}：${reason(text)}`, status);
      const r = JSON.parse(text).results?.[0];
      if (!r?.successful || !Array.isArray(r.data?.tweets)) {
        throw fail(`HTTP ${r?.upstream_status ?? "?"}：${reason(r?.error ?? r?.data ?? r ?? text)}`, r?.upstream_status);
      }
      cost.aisa.tweets += r.data.tweets.length;
      cost.aisa.usd += (r.customer_cost_micros_usd || 0) / 1e6;
      return r.data;
    } catch (e) { if (e.fatal || attempt >= 3) throw e; await sleep(2000 * attempt); }
  }
}

async function viaDirect(pathname, params) {
  const url = `https://api.twitterapi.io${pathname}?${new URLSearchParams(params)}`;
  for (let attempt = 1; ; attempt++) {
    try {
      const { status, text } = await http(url, { header: `X-API-Key: ${KEY}` });
      if (status !== 200) throw fail(`HTTP ${status}：${reason(text)}`, status);
      const j = JSON.parse(text);
      if (Array.isArray(j.tweets)) cost.direct.tweets += j.tweets.length;
      return j;
    } catch (e) { if (e.fatal || attempt >= 3) throw e; await sleep(2000 * attempt); }
  }
}

async function api(pathname, params) {
  const tool = AISA_TOOLS[pathname];
  if (!AISA_KEY) cost.aisaDown ||= "没配 AISA_API_KEY";
  else if (tool && !cost.aisaDown) {
    try { return await viaAisa(tool, params); }
    catch (e) {
      // 一次出错就整次运行改走直连：两边同价，不必每页都先撞一次 AIsa；下次运行再先试 AIsa
      cost.aisaDown = String(e.message).slice(0, 200);
      if (!KEY) throw new Error(`AIsa 出错，也没配 TWITTERAPI_IO_KEY：${cost.aisaDown}`);
      console.log(`::warning::X 数据：AIsa 出错（${cost.aisaDown.slice(0, 120)}），这次运行改走 twitterapi.io 直连`);
    }
  }
  if (!KEY) throw new Error("AISA_API_KEY 和 TWITTERAPI_IO_KEY 都没配，取不了 X 数据");
  return viaDirect(pathname, params);
}

export async function paged(query, maxTweets, maxPages = 25) {
  const out = []; let cursor = "";
  for (let p = 0; p < maxPages && out.length < maxTweets; p++) {
    const j = await api("/twitter/tweet/advanced_search", { query, queryType: "Latest", ...(cursor ? { cursor } : {}) });
    // 接口出错（限流、余额、参数）时返回的 JSON 没有 tweets 数组。以前把它当成「0 条」静默继续，
    // 调用方会照常推进时间窗口，那段时间就被永久跳过了（2026-09-30 差点发生）。
    if (!Array.isArray(j.tweets)) throw new Error(`search API error: ${JSON.stringify(j).slice(0, 200)}`);
    const ts = j.tweets; out.push(...ts);
    if (!j.has_next_page || !j.next_cursor || !ts.length) break;
    cursor = j.next_cursor;
  }
  return out;
}

/** 按发布时间窗口搜：每条帖子只会落在一个窗口里，只付一次钱 */
/** 搜索词：Opus 5.5 + Sonnet 5.5（9/28 发布）+ Haiku 5.5（10/7 发布）+ Fable 5.5（10/1 起内测，未官宣）。SEARCH_TERMS 可覆盖（补跑单个模型时用） */
export const TERMS = process.env.SEARCH_TERMS || '"Opus 5.5" OR "Opus5.5" OR "Sonnet 5.5" OR "Sonnet5.5" OR "Haiku 5.5" OR "Haiku5.5" OR "Fable 5.5" OR "Fable5.5"';
export const searchWindow = ({ from, to, minFaves, maxTweets }) =>
  paged(`(${TERMS}) filter:native_video min_faves:${minFaves} -filter:replies since_time:${Math.floor(from / 1000)} until_time:${Math.floor(to / 1000)}`, maxTweets);

export async function authorThread(c) {
  const ts = await paged(`conversation_id:${c.conversationId} from:${c.handle}`, 60, 3);
  const seen = new Set([c.id]);
  return ts.filter((t) => !seen.has(t.id) && seen.add(t.id)).map((t) => ({
    id: t.id, inReplyToId: t.inReplyToId, createdAt: t.createdAt, text: t.text,
    urls: (t.entities?.urls || []).map((u) => u.expanded_url).filter(Boolean),
    photos: (t.extendedEntities?.media || []).filter((m) => m.type === "photo").map((m) => m.media_url_https),
  })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

// 选 ≤720p 里码率最高的 mp4（图片库 scripts/image-prompts 也用）
export function pickMp4(variants) {
  const v = (variants || []).filter((x) => /mp4/.test(x.content_type || "") || /\.mp4/.test(x.url || ""))
    .map((x) => { const m = x.url.match(/\/(\d+)x(\d+)\//); return { url: x.url, bitrate: x.bitrate || 0, w: Number(m?.[1] || 0), h: Number(m?.[2] || 0) }; })
    .filter((x) => /^https:\/\/video\.twimg\.com\//.test(x.url));
  if (!v.length) return null;
  return v.filter((x) => x.w && Math.min(x.w, x.h) <= 720).sort((a, b) => b.bitrate - a.bitrate)[0] || v.sort((a, b) => a.bitrate - b.bitrate)[0];
}

export const hasVideo = (t) => (t.extendedEntities?.media || []).some((x) => x.type === "video");

/**
 * 搜索结果缺视频字段时，用 FXTwitter（免费、免登录）补回 extendedEntities。
 * 2026-10-13～14 twitterapi.io 有 3 次整批返回不带 extendedEntities，normalize 全判成「没视频」，
 * 那几段时间的作品全漏了（包括 @Saccc_c 290 万播放的《小王子》3D 游戏）。
 * 返回 { filled, noVideo, failed }：failed = FXTwitter 也没拿到结果的条数（据此判断是不是接口异常）。
 */
export async function fillMediaFromFx(tweets) {
  const out = { filled: 0, noVideo: 0, failed: 0 };
  for (const t of tweets) {
    try {
      const url = `https://api.fxtwitter.com/status/${t.id}`;
      let text;
      if (CURL) ({ stdout: text } = await run("curl", ["-sS", "-m", "30", "--retry", "2", "-A", "jasonzhu.ai-collector/1.0", url], { maxBuffer: 32e6 }));
      else { const r = await fetch(url, { headers: { "User-Agent": "jasonzhu.ai-collector/1.0" }, signal: AbortSignal.timeout(30000) }); if (!r.ok) throw new Error(`HTTP ${r.status}`); text = await r.text(); }
      const media = JSON.parse(text).tweet?.media?.all || [];
      const v = media.find((m) => m.type === "video");
      if (!v) { out.noVideo++; continue; }
      t.extendedEntities = { media: [{
        type: "video", media_url_https: v.thumbnail_url,
        video_info: { duration_millis: Math.round((v.duration || 0) * 1000), aspect_ratio: [v.width, v.height],
          variants: (v.variants || []).filter((x) => /\.mp4/.test(x.url || "")).map((x) => ({ url: x.url, bitrate: x.bitrate || 0, content_type: "video/mp4" })) },
      }] };
      out.filled++;
    } catch { out.failed++; }
    await new Promise((r) => setTimeout(r, 300));
  }
  return out;
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
