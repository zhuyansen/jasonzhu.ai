/**
 * ChatGPT Images 2.6 合集：类型、分类、图片地址。不导入数据，客户端组件可以放心引用。
 * 数据访问在 image-prompts.ts（导入整份 JSON，只能在服务端组件里用）。
 */
import type { OpusPromptMeta } from "./opus-prompts-shared";

export { formatCount } from "./opus-prompts-shared";

export const IMAGE_LIBRARY_PATH = "/prompts/chatgpt-images-2-6";

export type ImageCategory = "portrait" | "illustration" | "product" | "design" | "gif" | "edit" | "sticker" | "comparison";

export interface ImageMedia {
  type: "photo" | "gif" | "video";
  /** photo：pbs.twimg.com 原图；gif / video：video.twimg.com 的 mp4 */
  url: string;
  /** gif / video 的封面（pbs.twimg.com） */
  poster?: string;
  width: number;
  height: number;
  durationSec?: number;
}

export interface ImageCaseSlim {
  id: string;
  url: string;
  author: { handle: string; name: string };
  postedAt: string;
  /** 收录日期 YYYY-MM-DD（第一次进库） */
  addedAt?: string;
  lang: string;
  category: ImageCategory;
  title: { zh: string; en: string };
  prompt: OpusPromptMeta | null;
  group: { key: string; size: number } | null;
  referenceAssets: boolean;
  tools: string[];
  stats: { views: number; likes: number; replies: number; bookmarks: number };
  media: ImageMedia[];
}

export interface ImageLibrary {
  library: string;
  model: string;
  released: string | null;
  threshold: number;
  updatedAt: string | null;
  statsCheckedAt: string | null;
  distinctPrompts: number;
  withPrompt: number;
  categoryCounts: Record<ImageCategory, number>;
  cases: ImageCaseSlim[];
}

export const IMAGE_CATEGORIES: { key: ImageCategory; zh: string; en: string; icon: string }[] = [
  { key: "portrait", zh: "人像摄影", en: "Portraits & photo", icon: "📷" },
  { key: "illustration", zh: "插画动漫", en: "Illustration & anime", icon: "🎨" },
  { key: "product", zh: "产品广告", en: "Product & ads", icon: "🛍️" },
  { key: "design", zh: "海报排版", en: "Posters & design", icon: "🖼️" },
  { key: "gif", zh: "GIF 动图", en: "GIFs", icon: "🎞️" },
  { key: "edit", zh: "改图与参考图", en: "Photo edits", icon: "🪄" },
  { key: "sticker", zh: "表情包贴纸", en: "Stickers & memes", icon: "😺" },
  { key: "comparison", zh: "模型对比", en: "Comparisons", icon: "⚖️" },
];

export const imageCategoryLabel = (key: string, lang: string) => {
  const c = IMAGE_CATEGORIES.find((x) => x.key === key);
  return c ? (lang === "en" ? c.en : c.zh) : key;
};

/** 有提示词的作品才有站内详情页；没有的卡片直接链到原帖（不产生 noindex 页面） */
export const imageCaseHref = (c: Pick<ImageCaseSlim, "id" | "url" | "prompt">, lang: string) =>
  c.prompt ? `/${lang}${IMAGE_LIBRARY_PATH}/${c.id}` : c.url;

/**
 * X 图片按尺寸取：pbs.twimg.com/media/<id>.jpg → ?format=jpg&name=small（680px）/ medium（1200）/ large（2048）。
 * 卡片用 small，详情页用 large；封面（*_thumb）原样返回。
 */
export function pbsSized(url: string, name: "small" | "medium" | "large"): string {
  const m = url.match(/^https:\/\/pbs\.twimg\.com\/media\/([\w-]+)\.(jpg|jpeg|png|webp)$/);
  return m ? `https://pbs.twimg.com/media/${m[1]}?format=${m[2] === "jpeg" ? "jpg" : m[2]}&name=${name}` : url;
}

/** 卡片封面：第一张图，或 GIF / 视频的封面 */
export const coverOf = (m: ImageMedia) => (m.type === "photo" ? pbsSized(m.url, "small") : m.poster || "");
