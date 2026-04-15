/**
 * Cross-linking: maps keywords found in news summaries to internal pages.
 * Used to auto-link tool/blog mentions in news items.
 */

export interface CrossLink {
  keyword: string;
  href: string;
  label: string;
}

// Tool keywords → tools page
const toolKeywords: string[] = [
  "Claude Code",
  "Claude",
  "ChatGPT",
  "Cursor",
  "Gemini",
  "DeepSeek",
  "Perplexity",
  "Midjourney",
  "Runway",
  "v0.dev",
  "Bolt.new",
  "Lovable",
  "Devin",
  "Manus",
  "Codex",
  "OpenClaw",
  "Windsurf",
  "Suno",
  "HeyGen",
  "n8n",
  "Vercel",
  "Replit",
  "FLUX",
  "Notion",
];

// Blog post keywords → specific blog posts (high-value matches only)
const blogKeywords: { keyword: string; slug: string }[] = [
  { keyword: "AI中转站", slug: "ai-proxy-services-recommendation" },
  { keyword: "API代理", slug: "ai-proxy-services-recommendation" },
  { keyword: "SEO Audit", slug: "two-seo-audit-skills-comparison" },
  { keyword: "Skills", slug: "two-seo-audit-skills-comparison" },
];

/**
 * Find cross-links in a text string.
 * Returns at most 2 links to avoid clutter.
 */
export function findCrossLinks(text: string, lang: string): CrossLink[] {
  const links: CrossLink[] = [];
  const seen = new Set<string>();

  // Check blog keywords first (higher value)
  for (const { keyword, slug } of blogKeywords) {
    if (text.includes(keyword) && !seen.has(slug)) {
      seen.add(slug);
      links.push({
        keyword,
        href: `/${lang}/blog/${slug}`,
        label: lang === "zh" ? "相关文章" : "Related",
      });
    }
    if (links.length >= 2) return links;
  }

  // Then check tool keywords
  for (const keyword of toolKeywords) {
    if (text.includes(keyword) && !seen.has("tools")) {
      seen.add("tools");
      links.push({
        keyword,
        href: `/${lang}/tools`,
        label: lang === "zh" ? "查看工具" : "View Tools",
      });
      break; // Only one tools link
    }
  }

  return links.slice(0, 2);
}
