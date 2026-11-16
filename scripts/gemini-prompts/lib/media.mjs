/**
 * Gemini 4 合集的 X 数据：搜索词换成 Gemini 4，媒体解析、FXTwitter 补媒体、候选归一化直接用图片库的（图片 / GIF / 视频都能解析）。
 * 搜索、作者回复、mp4 选择都在 ../../opus-prompts/lib/x.mjs（本机设 OPUS_TRANSPORT=curl）。
 */
import { paged } from "../../opus-prompts/lib/x.mjs";
export { normalize, fillMediaFromFx } from "../../image-prompts/lib/media.mjs";

/**
 * 搜索词：X 的短语搜索 "Gemini 4" 也能命中「Gemini 4 Argon」「Gemini 4 Carbon」。SEARCH_TERMS 可覆盖。
 * 「Argon」「Carbon」单独搜噪音太大（化学、碳中和），只在已提到 Gemini 4 的帖子里由 profile.mjs 补认。
 */
export const TERMS = process.env.SEARCH_TERMS || '"Gemini 4" OR "Gemini4" OR "gemini-4"';
export const searchWindow = ({ from, to, minFaves, maxTweets }) =>
  paged(`(${TERMS}) filter:media -filter:replies -filter:retweets min_faves:${minFaves} since_time:${Math.floor(from / 1000)} until_time:${Math.floor(to / 1000)}`, maxTweets);
