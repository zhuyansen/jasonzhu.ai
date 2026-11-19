const BASE_DISALLOW = ["/api/", "/admin", "/dashboard"];

const AI_SEARCH_CRAWLERS = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "ChatGPT-User"];
const AI_TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "FacebookBot",
  "cohere-ai",
  "Diffbot",
  "YouBot",
  "Timpibot",
  "ImagesiftBot",
];

function renderGroup(agents: string[], allow: string, disallow: string[]): string {
  const lines = agents.map((ua) => `User-Agent: ${ua}`);
  lines.push(`Allow: ${allow}`);
  for (const d of disallow) {
    lines.push(`Disallow: ${d}`);
  }
  return lines.join("\n");
}

/**
 * robots.txt — 显式携带 Content-Signal 指令（https://contentsignals.org），
 * 让 AI 搜索引擎与 Agent 明确获知允许 search 与 ai-input 引用。
 */
export async function GET() {
  const body = [
    "User-Agent: *",
    "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
    "Allow: /",
    ...BASE_DISALLOW.map((d) => `Disallow: ${d}`),
    "",
    renderGroup(AI_SEARCH_CRAWLERS, "/", BASE_DISALLOW),
    "",
    renderGroup(AI_TRAINING_CRAWLERS, "/", BASE_DISALLOW),
    "",
    "Sitemap: https://jasonzhu.ai/sitemap.xml",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
