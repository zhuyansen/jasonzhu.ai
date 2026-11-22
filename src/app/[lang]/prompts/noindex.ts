import data from "@/content/opus-prompts/noindex.json";

/**
 * 提示词库短页 noindex 名单（2026-11-21，规则写在 src/content/opus-prompts/noindex.json 的 rule 里）：
 * 提示词不到 100 个字符、GSC 3 个月中英两个网址都是 0 点击、上线满 28 天的详情页。
 * 名单里的详情页 metadata 加 robots noindex, follow，sitemap 不收；有点击的一个不动。
 * Claude 动画库详情页的 canonical 指向 Claude 5.5 库的同一个 id，所以跟着 Claude 5.5 库的名单走，
 * 免得 canonical 指向一个 noindex 页、Google 反过来把动画库那一页收进去。
 */
type PromptLibrary = "claude-opus-5-5" | "chatgpt-images-2-6" | "gemini-4" | "claude-animation";

const lists = (data as { libraries: Record<string, { noindex: string[] }> }).libraries;
const sets = new Map(Object.entries(lists).map(([lib, v]) => [lib, new Set(v.noindex)]));

export function isPromptNoindexed(library: PromptLibrary, id: string): boolean {
  return sets.get(library === "claude-animation" ? "claude-opus-5-5" : library)?.has(id) ?? false;
}

export const NOINDEX_ROBOTS = { index: false, follow: true } as const;
