import { getAllPosts, type BlogPostMeta } from "./mdx";
import type { OpusCaseSlim } from "./opus-prompts-shared";

/**
 * 提示词库单条页底部的相关英文文章（只在服务端用：读 posts.json）。
 * 提示词页是 AI 爬虫抓得最多的页面；2026-10-28 看日志，英文博客有一批两天里没被任何爬虫访问过，
 * 所以每个英文作品页链 4 篇和 AI 创作相关的英文文章：最多 3 篇按作品分类和工具匹配标签，
 * 其余按作品 id 轮换，保证每篇相关文章都有页面链到，而不是总链同几篇。
 */

/** 算作「和 AI 创作相关」的标签与分类（文章标签是中文的，英文版沿用）。 */
const AI_TAGS = new Set([
  "Claude", "Claude Code", "Anthropic", "Skills", "提示词工程", "AI编程", "Vibe Coding", "Agent", "AI Agent",
  "AI代理", "Manus", "OpenClaw", "AI工具", "AI开发", "AI应用", "OpenAI", "Gemini", "视频制作", "AI",
  "学习路径", "免费课程", "企业培训", "AI 认证", "吴恩达", "DeepLearning.AI", "n8n", "IDE",
]);
const AI_CATEGORIES = new Set(["AI工具", "Vibe Coding", "AI Agent", "AI 安全"]);

/** 作品分类、作者用的工具各自对应哪些文章标签。 */
const CATEGORY_TAGS: Record<string, string[]> = {
  education: ["学习路径", "免费课程", "企业培训", "提示词工程", "吴恩达", "DeepLearning.AI", "AI 认证"],
  product: ["Vibe Coding", "AI编程", "AI开发", "Claude Code", "SaaS"],
  production: ["视频制作", "Claude Code", "Skills"],
  motion: ["视频制作", "Claude Code"],
  stories: ["视频制作", "AI应用"],
  comparison: ["Anthropic", "Claude", "OpenAI", "Gemini"],
  game: ["AI编程", "Vibe Coding", "Claude Code"],
  art3d: ["AI编程", "Claude Code"],
};
const TOOL_TAGS: Record<string, string[]> = {
  "Claude Code": ["Claude Code", "Skills"],
  "Gemini 4 Argon": ["Gemini"],
  "GPT-6 Astra": ["OpenAI"],
  Remotion: ["视频制作"],
  "After Effects": ["视频制作"],
  Python: ["AI编程"],
};

/** FNV-1a：同一个作品每次构建都选出同样的文章。 */
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

let pool: BlogPostMeta[] | undefined;

/** 有英文版、且和 AI 创作相关的文章（新文章打上相关标签就会自动进来）。 */
export function englishAiArticles(): BlogPostMeta[] {
  pool ??= getAllPosts().filter(
    (p) => p.hasEnglish && p.titleEn && (AI_CATEGORIES.has(p.category) || (p.tags || []).some((t) => AI_TAGS.has(t)))
  );
  return pool;
}

export function relatedEnglishArticles(c: OpusCaseSlim, count = 4): BlogPostMeta[] {
  const posts = englishAiArticles();
  if (!posts.length) return [];
  const wanted = new Set([...(CATEGORY_TAGS[c.category] || []), ...c.tools.flatMap((t) => TOOL_TAGS[t] || [])]);
  const offset = hash(c.id) % posts.length;
  const rotated = posts.map((_, i) => posts[(i + offset) % posts.length]);
  const matched = rotated
    .map((p, order) => ({ p, order, score: (p.tags || []).filter((t) => wanted.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, count - 1)
    .map((x) => x.p);
  const rest = rotated.filter((p) => !matched.includes(p)).slice(0, count - matched.length);
  return [...matched, ...rest];
}
