/**
 * Opus 5.5 提示词库：类型、分类、格式化。不导入数据，客户端组件可以放心引用。
 * 数据访问在 opus-prompts.ts（导入整份 JSON，只能在服务端组件里用）。
 */
export type OpusCategory =
  | "product" | "motion" | "education" | "stories" | "art3d" | "game" | "production" | "comparison";

export interface OpusPromptMeta {
  /** full=原文照录的完整提示词；brief=作者公开的一句话指令 */
  kind: "full" | "brief";
  /** 提示词出处：主帖正文 / 作者回复 / 作者回复里的截图（人工转写）/ 作者给的外链 */
  source: "post" | "author_reply" | "image" | "link";
  sourceUrl: string;
  length: number;
  excerpt: string;
}

export interface OpusCaseSlim {
  id: string;
  url: string;
  author: { handle: string; name: string };
  postedAt: string;
  lang: string;
  category: OpusCategory;
  title: { zh: string; en: string };
  prompt: OpusPromptMeta | null;
  /** 同款提示词分组：key 是组内播放最高那条的 id */
  group: { key: string; size: number } | null;
  referenceAssets: boolean;
  tools: string[];
  stats: { views: number; likes: number; replies: number; bookmarks: number };
  video: { poster: string; mp4: string; width: number; height: number; durationSec: number };
}

export interface OpusLibrary {
  model: string;
  threshold: number;
  updatedAt: string;
  statsCheckedAt: string;
  /** 去掉同款后的提示词条数 */
  distinctPrompts: number;
  cases: OpusCaseSlim[];
}


export const OPUS_CATEGORIES: { key: OpusCategory; zh: string; en: string; icon: string }[] = [
  { key: "motion", zh: "动效设计", en: "Motion graphics", icon: "✨" },
  { key: "product", zh: "产品广告", en: "Product & ads", icon: "📣" },
  { key: "education", zh: "科普讲解", en: "Explainers", icon: "🎓" },
  { key: "stories", zh: "角色故事", en: "Stories", icon: "🎬" },
  { key: "art3d", zh: "3D 场景", en: "3D worlds", icon: "🌍" },
  { key: "game", zh: "游戏", en: "Games", icon: "🎮" },
  { key: "production", zh: "制作流程", en: "Production", icon: "🎛️" },
  { key: "comparison", zh: "模型对比", en: "Comparisons", icon: "⚖️" },
];

export const categoryLabel = (key: string, lang: string) => {
  const c = OPUS_CATEGORIES.find((x) => x.key === key);
  return c ? (lang === "en" ? c.en : c.zh) : key;
};


/** 1234567 → 123.5万 / 1.2M */
export function formatCount(n: number, lang: string): string {
  if (lang === "en") {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }
  if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, "") + "万";
  return n.toLocaleString("en-US");
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
