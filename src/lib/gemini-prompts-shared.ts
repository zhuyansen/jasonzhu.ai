/**
 * Gemini 4 合集：类型、分类、子模型。不导入数据，客户端组件可以放心引用。
 * 数据访问在 gemini-prompts.ts（导入整份 JSON，只能在服务端组件里用）。
 * 媒体结构和 ChatGPT Images 2.6 库相同（media[]），页面复用它的 CaseMedia。
 */
import type { OpusPromptMeta } from "./opus-prompts-shared";
import type { ImageMedia } from "./image-prompts-shared";

export { formatCount } from "./opus-prompts-shared";
export { coverOf, pbsSized } from "./image-prompts-shared";

export const GEMINI_LIBRARY_PATH = "/prompts/gemini-4";

export type GeminiCategory = "scene3d" | "physics" | "mechanics" | "game" | "sim" | "ui" | "svg" | "motion";
export type GeminiModel = "argon" | "carbon" | "hydrogen" | "krypton" | "pro" | "flash" | "ultra" | "gemini-4";
export type GeminiRival = "claude" | "gpt" | "kimi" | "deepseek" | "grok" | "qwen" | "minimax" | "muse";

export interface GeminiCaseSlim {
  id: string;
  url: string;
  author: { handle: string; name: string };
  postedAt: string;
  /** 收录日期 YYYY-MM-DD（第一次进库；种子沿用它进 Claude 库的日期） */
  addedAt?: string;
  lang: string;
  /** 作者说用了 Gemini 4 的哪个版本；只写「Gemini 4」的是 gemini-4 */
  models: GeminiModel[];
  /** 同一帖子里一起比的模型（按厂商归组），不是对比帖就是空的 */
  rivals: GeminiRival[];
  category: GeminiCategory;
  title: { zh: string; en: string };
  prompt: OpusPromptMeta | null;
  group: { key: string; size: number } | null;
  referenceAssets: boolean;
  tools: string[];
  stats: { views: number; likes: number; replies: number; bookmarks: number };
  media: ImageMedia[];
}

export interface GeminiLibrary {
  library: string;
  model: string;
  released: string | null;
  threshold: number;
  updatedAt: string | null;
  statsCheckedAt: string | null;
  distinctPrompts: number;
  withPrompt: number;
  categoryCounts: Record<GeminiCategory, number>;
  modelCounts: Record<GeminiModel, number>;
  rivalCounts: Record<GeminiRival, number>;
  cases: GeminiCaseSlim[];
}

export const GEMINI_CATEGORIES: { key: GeminiCategory; zh: string; en: string; icon: string }[] = [
  { key: "scene3d", zh: "3D 场景", en: "3D scenes", icon: "🌍" },
  { key: "physics", zh: "物理与材质", en: "Physics & materials", icon: "🧪" },
  { key: "mechanics", zh: "机械原理", en: "Machines & cutaways", icon: "⚙️" },
  { key: "game", zh: "游戏", en: "Games", icon: "🎮" },
  { key: "sim", zh: "模拟系统", en: "Simulations", icon: "🛰️" },
  { key: "ui", zh: "网页与界面", en: "Websites & UI", icon: "🖥️" },
  { key: "svg", zh: "SVG 绘图", en: "SVG drawings", icon: "✏️" },
  { key: "motion", zh: "动画短片", en: "Animation", icon: "🎬" },
];

export const GEMINI_MODELS: { key: GeminiModel; label: string }[] = [
  { key: "argon", label: "Argon" },
  { key: "carbon", label: "Carbon" },
  { key: "hydrogen", label: "Hydrogen" },
  { key: "krypton", label: "Krypton" },
  { key: "pro", label: "Pro" },
  { key: "flash", label: "Flash" },
  { key: "ultra", label: "Ultra" },
  { key: "gemini-4", label: "Gemini 4" },
];

export const GEMINI_RIVALS: { key: GeminiRival; label: string }[] = [
  { key: "claude", label: "Claude" },
  { key: "gpt", label: "GPT" },
  { key: "deepseek", label: "DeepSeek" },
  { key: "grok", label: "Grok" },
  { key: "kimi", label: "Kimi" },
  { key: "muse", label: "Meta Muse" },
  { key: "minimax", label: "MiniMax" },
  { key: "qwen", label: "Qwen" },
];

export const geminiCategoryLabel = (key: string, lang: string) => {
  const c = GEMINI_CATEGORIES.find((x) => x.key === key);
  return c ? (lang === "en" ? c.en : c.zh) : key;
};

/** 卡片和详情页上的模型名：「Gemini 4 Argon」；只写了 Gemini 4 的就是「Gemini 4」 */
export const geminiModelLabel = (key: GeminiModel) => (key === "gemini-4" ? "Gemini 4" : `Gemini 4 ${GEMINI_MODELS.find((m) => m.key === key)?.label || key}`);

/** 有提示词的作品才有站内详情页；没有的卡片直接链到原帖（不产生 noindex 页面） */
export const geminiCaseHref = (c: Pick<GeminiCaseSlim, "id" | "url" | "prompt">, lang: string) =>
  c.prompt ? `/${lang}${GEMINI_LIBRARY_PATH}/${c.id}` : c.url;
