/**
 * Claude 动画提示词库：类型、分类。不导入数据，客户端组件可以放心引用。
 * 数据访问在 animation-prompts.ts（导入整份 JSON，只能在服务端组件里用）。
 * 作品全部从 Claude 5.5 库挑出来（scripts/animation-prompts/assemble.mjs），媒体结构和 Gemini 4 库相同（media[]）。
 */
import type { ClaudeModel, OpusPromptMeta } from "./opus-prompts-shared";
import type { ImageMedia } from "./image-prompts-shared";

export { formatCount, MODEL_LABEL, MODEL_PREVIEW, type ClaudeModel } from "./opus-prompts-shared";
export { coverOf } from "./image-prompts-shared";

export const ANIMATION_LIBRARY_PATH = "/prompts/claude-animation";

/** 和 scripts/animation-prompts/assemble.mjs、scripts/generate-animation-prompts.mjs 三处一致 */
export type AnimationCategory = "motion" | "explainer" | "story" | "anim3d" | "webui" | "codeart";

export interface AnimationCaseSlim {
  id: string;
  url: string;
  author: { handle: string; name: string };
  postedAt: string;
  /** 进 Claude 库的日期 YYYY-MM-DD */
  addedAt?: string;
  lang: string;
  models: ClaudeModel[];
  category: AnimationCategory;
  title: { zh: string; en: string };
  prompt: OpusPromptMeta | null;
  group: { key: string; size: number } | null;
  referenceAssets: boolean;
  tools: string[];
  stats: { views: number; likes: number; replies: number; bookmarks: number };
  media: ImageMedia[];
}

export interface AnimationLibrary {
  library: string;
  model: string;
  threshold: number;
  updatedAt: string | null;
  statsCheckedAt: string | null;
  distinctPrompts: number;
  withPrompt: number;
  categoryCounts: Record<AnimationCategory, number>;
  modelCounts: Record<ClaudeModel, number>;
  cases: AnimationCaseSlim[];
}

export const ANIMATION_CATEGORIES: { key: AnimationCategory; zh: string; en: string; icon: string }[] = [
  { key: "motion", zh: "动效与宣传片", en: "Motion graphics & promos", icon: "✨" },
  { key: "explainer", zh: "科普讲解", en: "Explainers & education", icon: "🎓" },
  { key: "story", zh: "故事与卡通", en: "Stories & cartoons", icon: "🎬" },
  { key: "anim3d", zh: "3D 动画", en: "3D animation", icon: "🧊" },
  { key: "webui", zh: "网页与界面动效", en: "Web & UI motion", icon: "🖥️" },
  { key: "codeart", zh: "数学与代码艺术", en: "Math & code art", icon: "📐" },
];

export const ANIMATION_MODELS: ClaudeModel[] = ["opus-5.5", "sonnet-5.5", "haiku-5.5", "fable-5.5"];

export const animationCategoryLabel = (key: string, lang: string) => {
  const c = ANIMATION_CATEGORIES.find((x) => x.key === key);
  return c ? (lang === "en" ? c.en : c.zh) : key;
};

/** 有提示词的作品才有站内详情页；没有的卡片直接链到原帖（不产生 noindex 页面） */
export const animationCaseHref = (c: Pick<AnimationCaseSlim, "id" | "url" | "prompt">, lang: string) =>
  c.prompt ? `/${lang}${ANIMATION_LIBRARY_PATH}/${c.id}` : c.url;
