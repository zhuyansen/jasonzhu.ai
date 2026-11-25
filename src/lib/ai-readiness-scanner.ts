/**
 * AI 网站急诊室 & 第 1 课 7 关闯关引擎（100 分制 / 7 大关卡 / 26 项真实 HTTP 检测）
 *
 * 7 类 26 项和各项分值对齐 Hostinger 的免费 AI Visibility Checker（分数可以和它对着看）；
 * 检测代码和文字是自己写的，和 Hostinger 无关。命令行版：https://github.com/zhuyansen/ai-visibility-checker
 * - 第 1 关：门卫放行 Crawl Permission（20 分）
 * - 第 2 关：素颜可读 Readability（18 分）
 * - 第 3 关：路牌指路 Findability（16 分）
 * - 第 4 关：亮明身份 Structured Meaning（14 分）
 * - 第 5 关：商业信任 Commercial Legibility（12 分）
 * - 第 6 关：AI 专属菜单 Agent-Native Content（10 分）
 * - 第 7 关：工具接口 Agent Interaction（10 分）
 */

export type CheckStatus = "passed" | "partial" | "failed";

export interface CheckResult {
  key: string;
  categoryKey: string;
  title: { zh: string; en: string };
  whyItMatters: { zh: string; en: string };
  status: CheckStatus;
  score: number;
  maxScore: number;
  detail: string;
  prompt: { zh: string; en: string } | null;
}

export interface CategoryMeta {
  key: string;
  level: number;
  maxPoints: number;
  name: { zh: string; en: string };
  badge: { zh: string; en: string };
  symptom: { zh: string; en: string };
  courseTieIn: { zh: string; en: string };
}

export interface CategoryScore {
  key: string;
  level: number;
  name: { zh: string; en: string };
  badge: { zh: string; en: string };
  symptom: { zh: string; en: string };
  courseTieIn: { zh: string; en: string };
  earned: number;
  max: number;
  checks: CheckResult[];
}

export interface GeoStageScore {
  id: "reach" | "search" | "cite" | "describe";
  step: number;
  name: { zh: string; en: string };
  question: { zh: string; en: string };
  earned: number;
  max: number;
  pct: number;
}

export interface L1ToL4Signal {
  layer: "L1" | "L2" | "L3" | "L4";
  title: { zh: string; en: string };
  stageTag: string;
  status: "passed" | "warning";
  publicFinding: { zh: string; en: string };
  lockedHint: { zh: string; en: string };
}

export interface LeadChunkPreview {
  excerpt: string;
  brandNamedInLead: boolean;
  hasStructuredTable: boolean;
}

export interface ScanReport {
  domain: string;
  finalUrl: string;
  scannedAt: string;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  label: { zh: string; en: string };
  categories: CategoryScore[];
  stages?: GeoStageScore[];
  l1ToL4Signals?: L1ToL4Signal[];
  leadChunkPreview?: LeadChunkPreview;
  passedKeys: string[];
  failedKeys: string[];
  combinedPrompt: { zh: string; en: string };
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "crawl_permission",
    level: 1,
    maxPoints: 20,
    name: { zh: "第 1 关：门卫放行（Crawl Permission）", en: "Level 1: Crawl Permission" },
    badge: { zh: "门卫关卡 · 20 分", en: "Gatekeeper · 20 pts" },
    symptom: {
      zh: "如果保安把 GPTBot、ClaudeBot 或 PerplexityBot 拦在门外，或者 Cloudflare 弹了 403 验证码，后面内容写得再好也是 0 分。",
      en: "If robots.txt or Cloudflare WAF blocks GPTBot, ClaudeBot, or PerplexityBot, AI engines never even enter your site.",
    },
    courseTieIn: {
      zh: "对应《第 1 课：技术底座与抓取渲染》第一步 Crawling（抓取准入）",
      en: "Course 1, Step 1: Crawling & Bot Access Control",
    },
  },
  {
    key: "readability",
    level: 2,
    maxPoints: 18,
    name: { zh: "第 2 关：素颜可读（Readability）", en: "Level 2: Readability" },
    badge: { zh: "渲染关卡 · 18 分", en: "Zero-JS Reading · 18 pts" },
    symptom: {
      zh: "绝大多数 AI 爬虫不执行 JavaScript！如果你的 React/Vue 页面关掉 JS 只剩一个空 <div id=\"root\"></div>，AI 看到的就是白纸。",
      en: "Most AI crawlers do not execute JavaScript. If your page renders an empty <div id=\"root\"> without JS, AI sees a blank page.",
    },
    courseTieIn: {
      zh: "对应《第 1 课：技术底座与抓取渲染》第二步 Rendering（服务端直出 HTML 与 Token 预算）",
      en: "Course 1, Step 2: Server-Side Rendering & Token Budget",
    },
  },
  {
    key: "findability",
    level: 3,
    maxPoints: 16,
    name: { zh: "第 3 关：路牌指路（Findability）", en: "Level 3: Findability" },
    badge: { zh: "索引关卡 · 16 分", en: "Indexing Map · 16 pts" },
    symptom: {
      zh: "没有 Sitemap 地图、缺少最近更新时间（lastmod）、或者不存在的页面返回 200（软 404），会让爬虫迷路并浪费抓取预算。",
      en: "Missing sitemaps, stale lastmod timestamps, or soft-404 pages waste crawl budget and confuse search indexers.",
    },
    courseTieIn: {
      zh: "对应《第 1 课：技术底座与抓取渲染》第三步 Indexing（地图指路与状态码卫生）",
      en: "Course 1, Step 3: Sitemap Discovery & HTTP Status Hygiene",
    },
  },
  {
    key: "structured_meaning",
    level: 4,
    maxPoints: 14,
    name: { zh: "第 4 关：亮明身份（Structured Meaning）", en: "Level 4: Structured Meaning" },
    badge: { zh: "实体关卡 · 14 分", en: "Entity Schema · 14 pts" },
    symptom: {
      zh: "AI 不是靠猜来认识你的品牌，而是读 JSON-LD 结构化数据（Organization + sameAs 跨平台身份闭环）。没写 Schema 就像没带身份证。",
      en: "AI engines resolve brand entities via JSON-LD (Organization + sameAs links). Without Schema.org markup, your entity remains ambiguous.",
    },
    courseTieIn: {
      zh: "对应《第 1 课 & 第 2 课衔接》结构化标记（Schema.org）与 E-A-V 实体对齐",
      en: "Course 1 → Course 2 Bridge: Schema.org & Entity Disambiguation",
    },
  },
  {
    key: "commercial_legibility",
    level: 5,
    maxPoints: 12,
    name: { zh: "第 5 关：商业信任（Commercial Legibility）", en: "Level 5: Commercial Legibility" },
    badge: { zh: "转化关卡 · 12 分", en: "Trust & Pricing · 12 pts" },
    symptom: {
      zh: "当用户问 AI「某工具多少钱、靠谱吗、怎么联系」，如果价格藏在登录墙后或没有机器可读的联系方式，AI 会直接跳过你推荐竞品。",
      en: "When users ask AI 'How much does X cost?' or 'Is X legit?', hidden pricing or missing contact metadata makes AI recommend a competitor.",
    },
    courseTieIn: {
      zh: "对应《第 1 课 & 收款合规》公开价格可见性与机器可读信任信号",
      en: "Course 1 & Payment Compliance: Public Pricing & Trust Signals",
    },
  },
  {
    key: "agent_native",
    level: 6,
    maxPoints: 10,
    name: { zh: "第 6 关：AI 专属菜单（Agent-Native Content）", en: "Level 6: Agent-Native Content" },
    badge: { zh: "GEO 关卡 · 10 分", en: "llms.txt & Markdown · 10 pts" },
    symptom: {
      zh: "90% 独立站还没配的加分项：提供标准 /llms.txt、支持 Accept: text/markdown 内容协商和 HTTP Link 响应头，直接喂给大模型最干净的上下文。",
      en: "Serve /llms.txt, respond with clean Markdown on Accept: text/markdown, and expose HTTP Link headers for zero-noise LLM ingestion.",
    },
    courseTieIn: {
      zh: "对应《第 1 课高阶》AI 原生协议（llms.txt 标准与 Markdown 协商）",
      en: "Course 1 Advanced: llms.txt Standard & Markdown Content Negotiation",
    },
  },
  {
    key: "agent_interaction",
    level: 7,
    maxPoints: 10,
    name: { zh: "第 7 关：工具接口（Agent Interaction）", en: "Level 7: Agent Interaction" },
    badge: { zh: "终极关卡 · 10 分", en: "WebMCP & Server Card · 10 pts" },
    symptom: {
      zh: "99% 网站拿不到满分的终极大关：暴露 WebMCP 工具，让你的网站从「只能被 AI 读」进化成「能被 AI Agent 直接调用」；有远程 MCP 服务的，再发布服务卡片告诉 Agent 去哪连。",
      en: "The final boss level: expose WebMCP tools so AI agents can call your site as a tool; if you run a remote MCP server, also publish its server card so agents know where to connect.",
    },
    courseTieIn: {
      zh: "对应《第 1 课大结局》从静态网页进化为 Agent 可调用节点（WebMCP + MCP Server Card）",
      en: "Course 1 Finale: Evolving from Passive Web Pages to Callable Agent Nodes",
    },
  },
];

export function scoreToGrade(score: number): {
  grade: "A" | "B" | "C" | "D" | "F";
  label: { zh: string; en: string };
} {
  if (score >= 85) {
    return {
      grade: "A",
      label: { zh: "Agent 就绪（第 1 课满分毕业，AI 可无障碍抓取与调用）", en: "Agent-ready (Course 1 Graduated)" },
    };
  }
  if (score >= 70) {
    return {
      grade: "B",
      label: { zh: "基本健康（传统 SEO 扎实，但缺 AI 原生协议与 MCP 接口）", en: "Mostly ready (Solid SEO, missing Agent-native protocols)" },
    };
  }
  if (score >= 55) {
    return {
      grade: "C",
      label: { zh: "亚健康（存在明显短板，AI 容易漏抓或读不懂实体）", en: "Needs work (Notable gaps in AI readability or schema)" },
    };
  }
  if (score >= 40) {
    return {
      grade: "D",
      label: { zh: "重度遮挡（AI 很难读懂或推荐你的网站，急需手术）", en: "Poor AI visibility (Major rendering or discovery blockers)" },
    };
  }
  return {
    grade: "F",
    label: { zh: "对 AI 隐形（被门卫拦截或纯空白 JS，AI 完全看不见）", en: "Invisible to AI (Blocked or blank without JS)" },
  };
}

/** 校验并清洗用户输入的域名，防止 SSRF 扫描内网 */
export function normalizeAndValidateDomain(raw: string): string {
  let s = (raw || "").trim().toLowerCase();
  if (!s) throw new Error("请输入域名（例如 jasonzhu.ai）");
  s = s.replace(/^https?:\/\//, "").split("/")[0].split("?")[0].split("#")[0];
  s = s.replace(/:\d+$/, "");

  if (
    !s ||
    s === "localhost" ||
    s.endsWith(".local") ||
    s.endsWith(".internal") ||
    s.endsWith(".localhost") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(s) ||
    s.includes(":") ||
    !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(s)
  ) {
    throw new Error("请输入合法的公网域名（例如 jasonzhu.ai 或 agentskillshub.top）");
  }
  return s;
}

interface HttpResp {
  url: string;
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  text: string;
  error?: string;
}

const DEFAULT_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function safeFetch(
  url: string,
  extraHeaders: Record<string, string> = {},
  timeoutMs = 7000,
  maxBytes = 1_500_000
): Promise<HttpResp> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": DEFAULT_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
        ...extraHeaders,
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });
    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > maxBytes ? buf.slice(0, maxBytes) : buf;
    const text = new TextDecoder("utf-8", { fatal: false }).decode(slice);
    return {
      url,
      finalUrl: res.url || url,
      status: res.status,
      headers,
      text,
    };
  } catch (e) {
    return {
      url,
      finalUrl: url,
      status: 0,
      headers: {},
      text: "",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJsonLdObjects(html: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  const walk = (node: unknown) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (typeof node === "object") {
      const obj = node as Record<string, unknown>;
      if (Array.isArray(obj["@graph"])) {
        obj["@graph"].forEach(walk);
      } else {
        out.push(obj);
      }
    }
  };
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw) continue;
    try {
      walk(JSON.parse(raw));
    } catch {
      // ignore malformed JSON-LD block
    }
  }
  return out;
}

const AI_BOTS = [
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "claudebot",
  "anthropic-ai",
  "perplexitybot",
  "google-extended",
  "applebot-extended",
  "ccbot",
];

function parseRobotsBlockedAi(robotsTxt: string): string[] {
  const blocked = new Set<string>();
  let currentAgents: string[] = [];
  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    if (!line || !line.includes(":")) continue;
    const [kRaw, vRaw] = line.split(":", 2);
    const k = kRaw.trim().toLowerCase();
    const v = vRaw.trim();
    if (k === "user-agent") {
      currentAgents.push(v.toLowerCase());
    } else if (k === "disallow") {
      if (v === "/" || v === "/*") {
        for (const ag of currentAgents) {
          if (AI_BOTS.includes(ag) || ag === "*") {
            blocked.add(ag);
          }
        }
      }
    } else if (k !== "allow") {
      currentAgents = [];
    }
  }
  return Array.from(blocked);
}

/** 对目标域名执行全部 26 项实时体检并生成通关报告 */
export async function runAiReadinessScan(rawDomain: string): Promise<ScanReport> {
  const domain = normalizeAndValidateDomain(rawDomain);
  const baseUrl = `https://${domain}`;

  // 第一波并发请求：首页、robots.txt、404 探测、llms.txt、MCP Server Card、Markdown 协商
  const randSlug = `/__ai_clinic_404_${Date.now().toString(36)}__`;
  const [homeRes, robotsRes, notFoundRes, llmsRes, mcpRes, mdRes] = await Promise.all([
    safeFetch(`${baseUrl}/`),
    safeFetch(`${baseUrl}/robots.txt`),
    safeFetch(`${baseUrl}${randSlug}`),
    safeFetch(`${baseUrl}/llms.txt`),
    safeFetch(`${baseUrl}/.well-known/mcp/server-card.json`),
    safeFetch(`${baseUrl}/`, { Accept: "text/markdown, text/plain;q=0.9" }),
  ]);

  if (homeRes.status === 0) {
    throw new Error(`无法连接 https://${domain}（${homeRes.error || "连接超时"}），请检查域名是否可访问。`);
  }

  // 解析 robots.txt 里的 Sitemap 地址，并发拉取 sitemap.xml
  const robotsText = robotsRes.text || "";
  const robotsContentType = (robotsRes.headers["content-type"] || "").toLowerCase();
  const robotsValid =
    robotsRes.status === 200 &&
    !robotsContentType.includes("text/html") &&
    /(user-agent|disallow|allow|sitemap)\s*:/i.test(robotsText);

  const sitemapMatches = Array.from(robotsText.matchAll(/^\s*Sitemap\s*:\s*(\S+)/gim)).map((m) => m[1].trim());
  const sitemapTarget = sitemapMatches[0] || `${baseUrl}/sitemap.xml`;
  let sitemapRes = await safeFetch(sitemapTarget);
  if (sitemapRes.status !== 200 && sitemapTarget !== `${baseUrl}/sitemap.xml`) {
    sitemapRes = await safeFetch(`${baseUrl}/sitemap.xml`);
  }
  // 如果是 sitemapindex，再拉第一个子 sitemap
  let sitemapXml = sitemapRes.text || "";
  if (sitemapRes.status === 200 && /<sitemapindex/i.test(sitemapXml)) {
    const subLoc = sitemapXml.match(/<loc>\s*([^<\s]+)\s*<\/loc>/i)?.[1];
    if (subLoc) {
      const subRes = await safeFetch(subLoc);
      if (subRes.status === 200 && subRes.text) {
        sitemapXml = `${sitemapXml}\n${subRes.text}`;
      }
    }
  }

  const html = homeRes.text || "";
  const visibleText = stripTags(html);
  const checks: CheckResult[] = [];

  // ═══════════════════════════════════════════════════════════════════════
  // 第 1 关：门卫放行 Crawl Permission（20 分）
  // ═══════════════════════════════════════════════════════════════════════
  // 1.1 robots.txt present and parseable (4 pts)
  checks.push({
    key: "crawl_permission.robots_txt",
    categoryKey: "crawl_permission",
    title: { zh: "robots.txt 存在且可解析", en: "robots.txt present and parseable" },
    whyItMatters: {
      zh: "AI 爬虫进站前第一件事就是读 /robots.txt。如果返回 404 或错返 HTML 页面，爬虫无法确认抓取边界。",
      en: "Crawlers check /robots.txt first before indexing your site.",
    },
    status: robotsValid ? "passed" : "failed",
    score: robotsValid ? 4 : 0,
    maxScore: 4,
    detail: robotsValid ? "HTTP 200，语法解析正常" : `HTTP ${robotsRes.status}，未检测到有效的 robots.txt 指令`,
    prompt: robotsValid
      ? null
      : {
          zh: `在网站根目录创建或修复 /robots.txt（返回 Content-Type: text/plain），放行主流搜索与 AI 爬虫，并声明 Sitemap：\n\nUser-agent: *\nAllow: /\nContent-Signal: search=yes, ai-input=yes, ai-train=yes\n\nSitemap: https://${domain}/sitemap.xml`,
          en: `Create a valid /robots.txt returning text/plain with User-agent: *, Allow: /, Content-Signal: search=yes, ai-input=yes, ai-train=yes, and Sitemap: https://${domain}/sitemap.xml.`,
        },
  });

  // 1.2 AI crawlers not blocked (7 pts)
  const blockedBots = robotsValid ? parseRobotsBlockedAi(robotsText) : [];
  const aiAllowed = blockedBots.length === 0;
  checks.push({
    key: "crawl_permission.ai_crawlers",
    categoryKey: "crawl_permission",
    title: { zh: "未封禁主流 AI 搜索爬虫", en: "AI crawlers not blocked" },
    whyItMatters: {
      zh: "如果封禁了 GPTBot、OAI-SearchBot、ClaudeBot 或 PerplexityBot，ChatGPT 和 Claude 联网搜索时将直接跳过你的网站。",
      en: "Blocking GPTBot, OAI-SearchBot, ClaudeBot, or PerplexityBot prevents AI search engines from citing your pages.",
    },
    status: aiAllowed ? "passed" : "failed",
    score: aiAllowed ? 7 : 0,
    maxScore: 7,
    detail: aiAllowed ? "GPTBot / ClaudeBot / PerplexityBot 均已放行" : `被封禁的爬虫：${blockedBots.join(", ")}`,
    prompt: aiAllowed
      ? null
      : {
          zh: `修改 /robots.txt，移除对 ${blockedBots.join(", ")} 的 Disallow: / 限制，确保 GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot 均可抓取公开页面。`,
          en: `Update /robots.txt to remove Disallow: / for ${blockedBots.join(", ")} so AI search bots can crawl public pages.`,
        },
  });

  // 1.3 Not blocked by bot detection (6 pts)
  const wafBlocked =
    homeRes.status === 403 ||
    homeRes.status === 429 ||
    homeRes.status === 503 ||
    /cf-mitigated/i.test(Object.keys(homeRes.headers).join(",")) ||
    /just a moment\.\.\.|attention required! \| cloudflare|enable javascript and cookies to continue/i.test(
      html.slice(0, 4000)
    );
  checks.push({
    key: "crawl_permission.bot_detection",
    categoryKey: "crawl_permission",
    title: { zh: "未被 WAF / 机器人防火墙误杀", en: "Not blocked by bot detection" },
    whyItMatters: {
      zh: "Cloudflare「Bot Fight Mode」常把没有浏览器指纹的 AI 抓取请求拦在 403 验证码页门外。",
      en: "Aggressive WAF challenge pages block headless HTTP fetches from AI search engines.",
    },
    status: !wafBlocked && homeRes.status === 200 ? "passed" : "failed",
    score: !wafBlocked && homeRes.status === 200 ? 6 : 0,
    maxScore: 6,
    detail: !wafBlocked && homeRes.status === 200 ? "服务端直连 HTTP 200，无验证码拦截" : `触发拦截或非 200 状态（HTTP ${homeRes.status}）`,
    prompt:
      !wafBlocked && homeRes.status === 200
        ? null
        : {
            zh: `在 Cloudflare / CDN 安全设置中关闭对公开页面及已知 AI 爬虫（Verified Bots: GPTBot, ClaudeBot, PerplexityBot）的 JS Managed Challenge 拦截。`,
            en: `Configure your CDN/WAF to allow verified AI crawlers and standard HTTP GET requests on public marketing pages without JS challenges.`,
          },
  });

  // 1.4 Content Signals declared (3 pts)
  const hasContentSignal =
    /content-signal\s*:\s*[^\r\n]*(ai-train|ai-input|search)\s*=/i.test(robotsText) ||
    Boolean(homeRes.headers["content-signal"] || homeRes.headers["x-Robots-tag"]?.includes("ai-"));
  checks.push({
    key: "crawl_permission.content_signals",
    categoryKey: "crawl_permission",
    title: { zh: "声明 Content-Signal 机器授权信号", en: "Content Signals declared" },
    whyItMatters: {
      zh: "IETF / Cloudflare 新标准：在 robots.txt 里明确声明 `Content-Signal: search=yes, ai-input=yes, ai-train=yes`，向 AI 引擎发放正式引用许可。",
      en: "Explicitly declares search, ai-input, and ai-train permissions in robots.txt.",
    },
    status: hasContentSignal ? "passed" : "failed",
    score: hasContentSignal ? 3 : 0,
    maxScore: 3,
    detail: hasContentSignal ? "已声明 Content-Signal 指令" : "robots.txt 中未检测到 Content-Signal: search=yes, ai-input=yes",
    prompt: hasContentSignal
      ? null
      : {
          zh: `在 /robots.txt 的 User-agent: * 规则块下添加一行：\nContent-Signal: search=yes, ai-input=yes, ai-train=yes`,
          en: `Add 'Content-Signal: search=yes, ai-input=yes, ai-train=yes' under 'User-agent: *' in /robots.txt.`,
        },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 第 2 关：素颜可读 Readability（18 分）
  // ═══════════════════════════════════════════════════════════════════════
  // 2.1 Content readable without JavaScript (8 pts)
  const textLen = visibleText.length;
  const noJsPts = textLen >= 400 ? 8 : textLen >= 150 ? 4 : 0;
  checks.push({
    key: "readability.no_js",
    categoryKey: "readability",
    title: { zh: "无需执行 JavaScript 即可读出正文", en: "Content readable without JavaScript" },
    whyItMatters: {
      zh: "PerplexityBot、ClaudeBot、GPTBot 只拉取原始 HTML，不会跑浏览器渲染你的客户端 JS。",
      en: "AI search bots fetch raw HTML without executing client-side JavaScript bundles.",
    },
    status: noJsPts === 8 ? "passed" : noJsPts > 0 ? "partial" : "failed",
    score: noJsPts,
    maxScore: 8,
    detail: `原始 HTML 提取可见文本 ${textLen.toLocaleString()} 字符`,
    prompt:
      noJsPts === 8
        ? null
        : {
            zh: `将首页和核心内容页改为服务端渲染（SSR）或静态生成（SSG / Next.js Server Components），确保禁用 JavaScript 时原始 HTML 中直接包含完整的标题、核心介绍和正文（至少 500 字以上）。`,
            en: `Use SSR or SSG so the initial HTML response contains full body copy (>500 characters) without requiring client-side JavaScript execution.`,
          },
  });

  // 2.2 Reasonable token budget (3 pts)
  const htmlSize = html.length;
  const estTokens = Math.round(htmlSize / 4);
  const ratio = htmlSize > 0 ? textLen / htmlSize : 0;
  const tokenPts =
    htmlSize < 350_000 && ratio >= 0.02 ? 3 : htmlSize < 900_000 ? 2 : 0;
  checks.push({
    key: "readability.token_budget",
    categoryKey: "readability",
    title: { zh: "合理的 HTML 体积与 Token 预算", en: "Reasonable token budget" },
    whyItMatters: {
      zh: "如果页面塞了几兆的内联 Base64 或冗长脚本，AI 抓取器会在截断窗口处丢弃你页面底部的关键信息与 JSON-LD。",
      en: "Bloated HTML wastes LLM context window tokens and risks truncating bottom-of-page content.",
    },
    status: tokenPts === 3 ? "passed" : tokenPts > 0 ? "partial" : "failed",
    score: tokenPts,
    maxScore: 3,
    detail: `HTML ${(htmlSize / 1024).toFixed(1)} KB（约 ${estTokens.toLocaleString()} tokens，正文信噪比 ${(ratio * 100).toFixed(1)}%）`,
    prompt:
      tokenPts === 3
        ? null
        : {
            zh: `精简首页 HTML 体积（目前 ${(htmlSize / 1024).toFixed(1)} KB）：移除庞大的内联 Base64 图片、首屏未使用的内联 JSON 状态或冗余样式，把原始 HTML 控制在 300 KB 以内。`,
            en: `Reduce initial HTML payload size (currently ${(htmlSize / 1024).toFixed(1)} KB) by externalizing large inline scripts, SVGs, or hydration state.`,
          },
  });

  // 2.3 Title, meta description and canonical (4 pts)
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim() ||
    "";
  const canonicalMatch =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]?.trim() ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1]?.trim() ||
    "";
  const metaCount = [Boolean(titleMatch), Boolean(descMatch), Boolean(canonicalMatch)].filter(Boolean).length;
  const metaPts = metaCount === 3 ? 4 : metaCount === 2 ? 2 : metaCount === 1 ? 1 : 0;
  checks.push({
    key: "readability.meta_tags",
    categoryKey: "readability",
    title: { zh: "Title、Description 与 Canonical 齐全", en: "Title, meta description and canonical" },
    whyItMatters: {
      zh: "搜索引擎与 AI 检索器首先用 <title>、<meta name=\"description\"> 和 <link rel=\"canonical\"> 建立页面摘要与权威 URL。",
      en: "Search and AI retrieval pipelines rely on title, meta description, and canonical link tags to index the canonical URL.",
    },
    status: metaPts === 4 ? "passed" : metaPts > 0 ? "partial" : "failed",
    score: metaPts,
    maxScore: 4,
    detail: `title=${Boolean(titleMatch)}, description=${Boolean(descMatch)}, canonical=${Boolean(canonicalMatch)}`,
    prompt:
      metaPts === 4
        ? null
        : {
            zh: `在首页 <head> 中补齐三项基础元数据标签：\n1. <title>品牌名 + 一句话核心定位</title>\n2. <meta name="description" content="120-160 字符的清晰业务与价值描述" />\n3. <link rel="canonical" href="https://${domain}/" />`,
            en: `Ensure <head> includes a descriptive <title>, <meta name="description">, and <link rel="canonical" href="https://${domain}/" />.`,
          },
  });

  // 2.4 Clear heading hierarchy (3 pts)
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const headingPts = h1Count === 1 && h2Count >= 1 ? 3 : h1Count >= 1 && h2Count >= 1 ? 2 : h1Count >= 1 ? 1 : 0;
  checks.push({
    key: "readability.headings",
    categoryKey: "readability",
    title: { zh: "清晰的 H1 → H2 → H3 标题层级", en: "Clear heading hierarchy" },
    whyItMatters: {
      zh: "RAG 切块器（Chunker）按 H1/H2/H3 标题切分网页段落。唯一 H1 + 结构化 H2 能让你的内容被完整切入向量库。",
      en: "RAG chunkers split web documents by H1/H2/H3 headings. A single H1 and structured H2s produce clean retrieval chunks.",
    },
    status: headingPts === 3 ? "passed" : headingPts > 0 ? "partial" : "failed",
    score: headingPts,
    maxScore: 3,
    detail: `检测到 H1 数量：${h1Count}，H2 数量：${h2Count}`,
    prompt:
      headingPts === 3
        ? null
        : {
            zh: `调整首页标题语义结构：确保全页有且仅有 1 个 <h1>（当前 ${h1Count} 个），并使用多个 <h2>（当前 ${h2Count} 个）划分核心功能、对比表格与常见问题模块。`,
            en: `Use exactly one <h1> tag on the page (found ${h1Count}) followed by semantic <h2> section headings (found ${h2Count}).`,
          },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 第 3 关：路牌指路 Findability（16 分）
  // ═══════════════════════════════════════════════════════════════════════
  // 3.1 Sitemap lists URLs (5 pts)
  const locUrls = Array.from(sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)).map((m) => m[1]);
  const hasSitemapUrls = sitemapRes.status === 200 && locUrls.length > 0;
  checks.push({
    key: "findability.sitemap_urls",
    categoryKey: "findability",
    title: { zh: "Sitemap.xml 正常列出全站 URL", en: "Sitemap lists URLs" },
    whyItMatters: {
      zh: "没有 XML Sitemap，爬虫只能靠首页超链接盲目摸索，深层长尾页面极难被收录。",
      en: "An XML sitemap gives search and AI crawlers a complete inventory of canonical URLs.",
    },
    status: hasSitemapUrls ? "passed" : "failed",
    score: hasSitemapUrls ? 5 : 0,
    maxScore: 5,
    detail: hasSitemapUrls ? `Sitemap 包含 ${locUrls.length} 个 URL 节点` : `未在 ${sitemapTarget} 检测到有效的 <loc> 节点`,
    prompt: hasSitemapUrls
      ? null
      : {
          zh: `生成标准的 /sitemap.xml（返回 application/xml），列出网站所有公开规范页面 URL（<url><loc>...</loc><lastmod>...</lastmod></url>）。`,
          en: `Publish a valid XML sitemap at /sitemap.xml listing all canonical public URLs with <loc> and <lastmod>.`,
        },
  });

  // 3.2 Sitemap declared in robots.txt (3 pts)
  const hasSitemapInRobots = sitemapMatches.length > 0;
  checks.push({
    key: "findability.sitemap_in_robots",
    categoryKey: "findability",
    title: { zh: "在 robots.txt 中声明 Sitemap 地址", en: "Sitemap declared in robots.txt" },
    whyItMatters: {
      zh: "爬虫进站读完 robots.txt 就能顺着 Sitemap: 指令直接拿到全站清单。",
      en: "Declaring Sitemap: in robots.txt lets crawlers discover your sitemap immediately.",
    },
    status: hasSitemapInRobots ? "passed" : "failed",
    score: hasSitemapInRobots ? 3 : 0,
    maxScore: 3,
    detail: hasSitemapInRobots ? `已声明：${sitemapMatches[0]}` : "robots.txt 中缺少 Sitemap: https://... 声明",
    prompt: hasSitemapInRobots
      ? null
      : {
          zh: `在 /robots.txt 底部添加：\nSitemap: https://${domain}/sitemap.xml`,
          en: `Add 'Sitemap: https://${domain}/sitemap.xml' to /robots.txt.`,
        },
  });

  // 3.3 Recent lastmod dates (3 pts)
  const lastmods = Array.from(sitemapXml.matchAll(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/gi)).map((m) => m[1]);
  const recentLastmod = lastmods.some((d) => /^202[5-9]/.test(d));
  const lastmodPts = recentLastmod ? 3 : lastmods.length > 0 ? 1 : 0;
  checks.push({
    key: "findability.lastmod",
    categoryKey: "findability",
    title: { zh: "Sitemap 包含近期更新时间戳（lastmod）", en: "Recent lastmod dates" },
    whyItMatters: {
      zh: "AI 引擎极度偏好新鲜内容（Freshness Bias）。带有近期 <lastmod> 的页面会被优先重抓和引用。",
      en: "Fresh <lastmod> timestamps signal active maintenance and trigger faster re-crawling.",
    },
    status: lastmodPts === 3 ? "passed" : lastmodPts > 0 ? "partial" : "failed",
    score: lastmodPts,
    maxScore: 3,
    detail:
      lastmodPts === 3
        ? `检测到 ${lastmods.length} 个近期 lastmod 时间戳`
        : lastmods.length > 0
        ? "存在 lastmod 但日期陈旧"
        : "Sitemap 中未包含 <lastmod> 标签",
    prompt:
      lastmodPts === 3
        ? null
        : {
            zh: `在生成 /sitemap.xml 时为每个 <url> 节点加上真实的近期更新时间 <lastmod>（ISO 8601 格式，如 ${new Date().toISOString().slice(0, 10)}）。`,
            en: `Include accurate ISO-8601 <lastmod> dates for each <url> entry in /sitemap.xml.`,
          },
  });

  // 3.4 Real 404 for missing pages (3 pts)
  const real404 = notFoundRes.status === 404 || notFoundRes.status === 410;
  checks.push({
    key: "findability.real_404",
    categoryKey: "findability",
    title: { zh: "不存在的 URL 返回真实 404 状态码", en: "Real 404 for missing pages" },
    whyItMatters: {
      zh: "很多 SPA 把所有未知路径都 fallback 返回 HTTP 200（软 404），导致爬虫误以为有无数重复垃圾页而惩罚整站。",
      en: "Returning HTTP 200 for non-existent URLs (Soft 404) pollutes search indexes and wastes crawl budget.",
    },
    status: real404 ? "passed" : "failed",
    score: real404 ? 3 : 0,
    maxScore: 3,
    detail: real404 ? `探测随机不存在路径返回 HTTP ${notFoundRes.status}` : `软 404 警告：不存在的路径返回了 HTTP ${notFoundRes.status}`,
    prompt: real404
      ? null
      : {
          zh: `修复路由配置避免「软 404」：当访问不存在的 URL 时，服务端必须返回真实的 HTTP 404 状态码（而不是用 200 状态码渲染首页或 fallback）。`,
          en: `Return an actual HTTP 404 status code for non-existent routes instead of a 200 SPA fallback.`,
        },
  });

  // 3.5 Clean HTTPS homepage (2 pts)
  const cleanHttps = homeRes.status === 200 && homeRes.finalUrl.startsWith("https://");
  checks.push({
    key: "findability.https",
    categoryKey: "findability",
    title: { zh: "干净的 HTTPS 规范首页", en: "Clean HTTPS homepage" },
    whyItMatters: {
      zh: "HTTPS 与 200 响应是所有搜索引擎与 AI 抓取器信任的底线。",
      en: "A clean HTTPS 200 response on the root domain is baseline hygiene.",
    },
    status: cleanHttps ? "passed" : "failed",
    score: cleanHttps ? 2 : 0,
    maxScore: 2,
    detail: cleanHttps ? `HTTPS 200 (${homeRes.finalUrl})` : `Status=${homeRes.status}, URL=${homeRes.finalUrl}`,
    prompt: cleanHttps
      ? null
      : {
          zh: `确保 https://${domain}/ 正常返回 HTTP 200 且 SSL 证书有效。`,
          en: `Ensure https://${domain}/ resolves cleanly with HTTP 200 over HTTPS.`,
        },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 第 4 关：亮明身份 Structured Meaning（14 分）
  // ═══════════════════════════════════════════════════════════════════════
  const ldObjects = extractJsonLdObjects(html);
  const schemaTypes = new Set<string>();
  const orgObjs: Record<string, unknown>[] = [];
  const sameAsLinks: string[] = [];

  for (const obj of ldObjects) {
    const t = obj["@type"];
    const tList = Array.isArray(t) ? t.map(String) : t ? [String(t)] : [];
    for (const st of tList) {
      schemaTypes.add(st);
      if (/organization|corporation|localbusiness|brand/i.test(st)) {
        orgObjs.push(obj);
      }
    }
    const sa = obj["sameAs"];
    if (Array.isArray(sa)) {
      sa.forEach((x) => typeof x === "string" && sameAsLinks.push(x));
    } else if (typeof sa === "string") {
      sameAsLinks.push(sa);
    }
  }

  // 4.1 JSON-LD present (6 pts)
  const hasJsonLd = ldObjects.length > 0;
  checks.push({
    key: "structured_meaning.json_ld",
    categoryKey: "structured_meaning",
    title: { zh: "内嵌 JSON-LD 结构化数据", en: "JSON-LD present" },
    whyItMatters: {
      zh: "JSON-LD 是喂给搜索引擎与大模型的「免解析知识图谱」，直接用键值对告诉机器你是谁、提供什么产品。",
      en: "JSON-LD provides explicit machine-readable entity definitions on the page.",
    },
    status: hasJsonLd ? "passed" : "failed",
    score: hasJsonLd ? 6 : 0,
    maxScore: 6,
    detail: hasJsonLd ? `检测到 ${ldObjects.length} 个 JSON-LD 实体节点` : "首页未检测到 <script type=\"application/ld+json\">",
    prompt: hasJsonLd
      ? null
      : {
          zh: `在首页添加 <script type="application/ld+json">，使用 @graph 同时声明 Organization、WebSite 和 WebApplication / FAQPage 结构化数据。`,
          en: `Add a <script type="application/ld+json"> block with @graph declaring Organization, WebSite, and WebApplication/FAQPage schemas.`,
        },
  });

  // 4.2 Complete Organization or LocalBusiness schema (4 pts)
  let orgPts = 0;
  let orgDetail = "未声明 Organization 或 LocalBusiness 实体";
  if (orgObjs.length > 0) {
    const o = orgObjs[0];
    const hasCore = Boolean(o["name"]) && Boolean(o["url"]);
    const extras = ["logo", "description", "contactPoint", "email", "founder", "sameAs"].filter((k) => Boolean(o[k])).length;
    if (hasCore && extras >= 2) {
      orgPts = 4;
      orgDetail = `完整的 Organization 实体（name="${String(o["name"])}", 包含 ${extras} 项扩展属性）`;
    } else if (hasCore) {
      orgPts = 2;
      orgDetail = `包含基础 Organization（name="${String(o["name"])}"），但缺少 logo / description / contactPoint`;
    } else {
      orgPts = 1;
      orgDetail = "Organization 字段不完整（缺 name 或 url）";
    }
  }
  checks.push({
    key: "structured_meaning.org_schema",
    categoryKey: "structured_meaning",
    title: { zh: "完整的 Organization 品牌实体声明", en: "Complete Organization or LocalBusiness schema" },
    whyItMatters: {
      zh: "对应《第 2 课：实体-属性-值 E-A-V》：把品牌的名称、网址、简介、Logo、创始人与联系点一次性喂给知识图谱。",
      en: "Defines your brand entity attributes (name, url, logo, description, contactPoint) for Knowledge Graph resolution.",
    },
    status: orgPts === 4 ? "passed" : orgPts > 0 ? "partial" : "failed",
    score: orgPts,
    maxScore: 4,
    detail: orgDetail,
    prompt:
      orgPts === 4
        ? null
        : {
            zh: `完善 JSON-LD 中的 Organization 节点，确保至少包含 name、url、logo、description、contactPoint（含 email 和 contactType）以及 sameAs 数组。`,
            en: `Complete the Organization JSON-LD node with name, url, logo, description, contactPoint, and sameAs.`,
          },
  });

  // 4.3 sameAs links (2 pts)
  const sameAsPts = sameAsLinks.length >= 2 ? 2 : sameAsLinks.length === 1 ? 1 : 0;
  checks.push({
    key: "structured_meaning.same_as",
    categoryKey: "structured_meaning",
    title: { zh: "sameAs 跨平台权威主页对齐", en: "sameAs links" },
    whyItMatters: {
      zh: "用 sameAs 把你的官网与 GitHub、X (Twitter)、LinkedIn、YouTube、Product Hunt 绑成同一个实体，防止 AI 把你和同名项目搞混。",
      en: "Links your domain to your official GitHub, X, LinkedIn, or YouTube profiles for cross-platform entity disambiguation.",
    },
    status: sameAsPts === 2 ? "passed" : sameAsPts > 0 ? "partial" : "failed",
    score: sameAsPts,
    maxScore: 2,
    detail: sameAsPts > 0 ? `已关联 ${sameAsLinks.length} 个官方外部主页` : "JSON-LD 中缺少 sameAs 跨平台链接",
    prompt:
      sameAsPts === 2
        ? null
        : {
            zh: `在 Organization JSON-LD 中添加 sameAs 数组，填入至少 2 个官方社交或开源主页链接（如 GitHub、X/Twitter、LinkedIn、YouTube）。`,
            en: `Add a 'sameAs' array with at least 2 official profile URLs (GitHub, X, LinkedIn, YouTube) in your Organization JSON-LD.`,
          },
  });

  // 4.4 Several schema types (2 pts)
  const typesList = Array.from(schemaTypes);
  const typePts = typesList.length >= 2 ? 2 : typesList.length === 1 ? 1 : 0;
  checks.push({
    key: "structured_meaning.multiple_schemas",
    categoryKey: "structured_meaning",
    title: { zh: "组合多种 Schema 类型（@graph）", en: "Several schema types" },
    whyItMatters: {
      zh: "同时声明 Organization + WebSite + SoftwareApplication / FAQPage，让 AI 既认识你的公司，又知道你的产品功能与常见问答。",
      en: "Combining Organization, WebSite, SoftwareApplication, and FAQPage schemas maximizes rich entity extraction.",
    },
    status: typePts === 2 ? "passed" : typePts > 0 ? "partial" : "failed",
    score: typePts,
    maxScore: 2,
    detail: typesList.length > 0 ? `已声明类型：${typesList.join(", ")}` : "未检测到任何 Schema @type",
    prompt:
      typePts === 2
        ? null
        : {
            zh: `在 JSON-LD 的 @graph 中同时声明至少 2~3 种 @type（例如 Organization、WebSite、WebApplication 或 FAQPage）。`,
            en: `Declare multiple schema types (e.g., Organization, WebSite, WebApplication, FAQPage) in your JSON-LD @graph.`,
          },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 第 5 关：商业信任 Commercial Legibility（12 分）
  // ═══════════════════════════════════════════════════════════════════════
  // 5.1 About, contact and legal pages linked (4 pts)
  const hasAbout = /href=["'][^"']*\/(about|company|team|who-we-are)/i.test(html);
  const hasContact = /href=["'][^"']*\/(contact|support|help)/i.test(html) || /href=["']mailto:/i.test(html);
  const hasLegal = /href=["'][^"']*\/(privacy|terms|legal|tos|refund)/i.test(html);
  const trustCount = [hasAbout, hasContact, hasLegal].filter(Boolean).length;
  const trustPts = trustCount === 3 ? 4 : trustCount === 2 ? 3 : trustCount === 1 ? 1 : 0;
  checks.push({
    key: "commercial_legibility.trust_pages",
    categoryKey: "commercial_legibility",
    title: { zh: "关于我们、联系方式与隐私/条款链接齐全", en: "About, contact and legal pages linked" },
    whyItMatters: {
      zh: "不仅是 AI 评估站点可信度（E-E-A-T）的硬指标，也是 Stripe / Paddle / Creem 收款平台开户审核必查的三件套！",
      en: "Essential for both Google/AI E-E-A-T trust scoring and payment processor (Stripe/Paddle/Creem) underwriting.",
    },
    status: trustPts === 4 ? "passed" : trustPts > 0 ? "partial" : "failed",
    score: trustPts,
    maxScore: 4,
    detail: `About=${hasAbout}, Contact=${hasContact}, Privacy/Terms=${hasLegal}`,
    prompt:
      trustPts === 4
        ? null
        : {
            zh: `在全站 Footer 页脚显式加上 /about（关于我们）、/contact（联系我们）以及 /privacy、/terms（隐私政策与服务条款）的可点击 <a href="..."> 链接。`,
            en: `Add explicit links to /about, /contact, /privacy, and /terms in your global footer.`,
          },
  });

  // 5.2 Machine-readable contact details (4 pts)
  const hasMailtoOrTel = /href=["'](mailto:|tel:)[^"']+["']/i.test(html);
  const hasSchemaContact = ldObjects.some(
    (o) => Boolean(o["email"]) || Boolean(o["telephone"]) || Boolean(o["contactPoint"])
  );
  const contactPts = hasMailtoOrTel && hasSchemaContact ? 4 : hasMailtoOrTel || hasSchemaContact ? 2 : 0;
  checks.push({
    key: "commercial_legibility.machine_contact",
    categoryKey: "commercial_legibility",
    title: { zh: "机器可读的真实联系信息（mailto + contactPoint）", en: "Machine-readable contact details" },
    whyItMatters: {
      zh: "同时在 HTML 提供 `mailto:` 链接并在 JSON-LD 的 `contactPoint` 提供真实客服邮箱（切勿填虚假电话！），让 AI 能准确回答「怎么联系官方」。",
      en: "Exposes real support email via both mailto: links and JSON-LD contactPoint (never use fake phone numbers).",
    },
    status: contactPts === 4 ? "passed" : contactPts > 0 ? "partial" : "failed",
    score: contactPts,
    maxScore: 4,
    detail: `HTML mailto/tel=${hasMailtoOrTel}, JSON-LD contactPoint/email=${hasSchemaContact}`,
    prompt:
      contactPts === 4
        ? null
        : {
            zh: `1. 在页脚或联系区放置真实的 <a href="mailto:你的真实邮箱"> 链接；\n2. 在 Organization JSON-LD 中加入真实的 email 与 contactPoint（注意：只填你自己的真实邮箱，不要填任何虚拟或占位电话号码）。`,
            en: `Add a real <a href="mailto:..."> link in HTML and a truthful contactPoint with your real email in Organization JSON-LD.`,
          },
  });

  // 5.3 Prices reachable without JavaScript or login (4 pts)
  const hasSchemaOffer = ldObjects.some(
    (o) =>
      Boolean(o["offers"]) ||
      /offer|pricespecification/i.test(String(o["@type"] || ""))
  );
  const hasVisiblePrice =
    /(\$|€|£|¥|USD|EUR|CNY)\s*\d+(\.\d{1,2})?(\s*\/\s*(mo|month|yr|year|月|年))?/i.test(visibleText) ||
    /\b(free forever|free plan|open[- ]source|100%\s*free|免费使用|开源免费)\b/i.test(visibleText);
  const hasPricingLink = /href=["'][^"']*\/(pricing|plans|price)/i.test(html);
  const pricePts =
    (hasSchemaOffer && hasVisiblePrice) || (hasVisiblePrice && hasPricingLink)
      ? 4
      : hasVisiblePrice || hasSchemaOffer || hasPricingLink
      ? 2
      : 0;
  checks.push({
    key: "commercial_legibility.pricing",
    categoryKey: "commercial_legibility",
    title: { zh: "免登录、免 JS 即可读取价格或免费档位说明", en: "Prices reachable without JavaScript or login" },
    whyItMatters: {
      zh: "用户在 ChatGPT 里最常问「X 工具多少钱？有免费版吗？」。如果价格要登录后或跑完 JS 才看得到，AI 无法为你带货。",
      en: "Users frequently ask AI 'How much does X cost?'. Exposing pricing in static HTML and JSON-LD Offers enables AI shopping comparisons.",
    },
    status: pricePts === 4 ? "passed" : pricePts > 0 ? "partial" : "failed",
    score: pricePts,
    maxScore: 4,
    detail: `Schema Offers=${hasSchemaOffer}, 静态价格文本=${hasVisiblePrice}, /pricing 链接=${hasPricingLink}`,
    prompt:
      pricePts === 4
        ? null
        : {
            zh: `在静态 HTML 中直接展示清晰的价格档位（或明确写出 "$0 / month · Free Tier"），并在 WebApplication / Product JSON-LD 中添加 offers: { "@type": "Offer", "price": "0", "priceCurrency": "USD" }。`,
            en: `Expose pricing tiers directly in server-rendered HTML and include an 'offers' block in your Product/WebApplication JSON-LD.`,
          },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 第 6 关：AI 专属菜单 Agent-Native Content（10 分）
  // ═══════════════════════════════════════════════════════════════════════
  const llmsText = llmsRes.text || "";
  const llmsCT = (llmsRes.headers["content-type"] || "").toLowerCase();
  const llmsServed =
    llmsRes.status === 200 &&
    !llmsCT.includes("text/html") &&
    !/<!doctype html|<html[\s>]/i.test(llmsText.slice(0, 400)) &&
    llmsText.trim().length >= 40;

  // 6.1 llms.txt served (4 pts)
  checks.push({
    key: "agent_native.llms_txt",
    categoryKey: "agent_native",
    title: { zh: "提供 /llms.txt AI 专属索引文件", en: "llms.txt served" },
    whyItMatters: {
      zh: "llmstxt.org 规范：给大模型准备的「一页纸精华说明书」，省去爬虫解析导航栏和噪声 HTML 的麻烦。",
      en: "The /llms.txt file gives LLMs a concise Markdown index of your site's core identity and key pages.",
    },
    status: llmsServed ? "passed" : "failed",
    score: llmsServed ? 4 : 0,
    maxScore: 4,
    detail: llmsServed ? `HTTP 200 (${llmsText.length} 字节)` : `访问 /llms.txt 返回 HTTP ${llmsRes.status} 或非纯文本`,
    prompt: llmsServed
      ? null
      : {
          zh: `在网站根目录公开提供 /llms.txt（Content-Type: text/plain; charset=utf-8），用 Markdown 格式整理网站定位、核心功能与重要页面链接。`,
          en: `Serve a plain-text Markdown file at /llms.txt summarizing your site and linking to key pages.`,
        },
  });

  // 6.2 llms.txt well-formed (3 pts)
  let llmsFormPts = 0;
  let llmsFormDetail = "需先提供 /llms.txt";
  if (llmsServed) {
    const hasH1 = /^#\s+\S+/m.test(llmsText);
    const hasQuote = /^>\s+\S+/m.test(llmsText);
    const hasH2 = /^##\s+\S+/m.test(llmsText);
    const mdLinks = (llmsText.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) || []).length;
    if (hasH1 && (hasQuote || hasH2) && mdLinks >= 2) {
      llmsFormPts = 3;
      llmsFormDetail = `符合 llmstxt.org 标准结构（含 # 标题、> 摘要、## 分区及 ${mdLinks} 个绝对链接）`;
    } else if (hasH1 || mdLinks >= 1) {
      llmsFormPts = 1;
      llmsFormDetail = `结构不完整（H1=${hasH1}, 引用摘要=${hasQuote}, H2=${hasH2}, 链接数=${mdLinks}）`;
    } else {
      llmsFormDetail = "缺少 Markdown # 标题与 [名称](URL) 列表";
    }
  }
  checks.push({
    key: "agent_native.llms_well_formed",
    categoryKey: "agent_native",
    title: { zh: "llms.txt 符合标准 Markdown 语法结构", en: "llms.txt well-formed" },
    whyItMatters: {
      zh: "标准格式要求首行 `# 站点名`、次段 `> 一句话定位`、随后用 `## 分类` + `- [页面标题](https://...): 简介` 组织。",
      en: "Follows the llmstxt.org specification: H1 title, blockquote summary, H2 sections, and annotated Markdown URLs.",
    },
    status: llmsFormPts === 3 ? "passed" : llmsFormPts > 0 ? "partial" : "failed",
    score: llmsFormPts,
    maxScore: 3,
    detail: llmsFormDetail,
    prompt:
      llmsFormPts === 3
        ? null
        : {
            zh: `按 llmstxt.org 标准格式化 /llms.txt：\n# 网站名称\n> 一句话核心价值定位\n\n## Core Pages\n- [首页](https://${domain}/): 核心功能说明\n- [关于我们](https://${domain}/about): 团队与背景`,
            en: `Format /llms.txt with an H1 title, a '>' blockquote summary, '##' section headers, and bulleted '[Title](https://...): description' links.`,
          },
  });

  // 6.3 Markdown served on request (2 pts)
  const mdCT = (mdRes.headers["content-type"] || "").toLowerCase();
  const mdBody = mdRes.text || "";
  const isCleanMd =
    mdRes.status === 200 &&
    (mdCT.includes("text/markdown") ||
      (mdCT.includes("text/plain") && !/<!doctype html|<html[\s>]/i.test(mdBody.slice(0, 400)))) &&
    mdBody.trim().length > 40;
  const hasMdAlternate = /<link[^>]+type=["']text\/markdown["']/i.test(html);
  const mdPts = isCleanMd ? 2 : hasMdAlternate ? 1 : 0;
  checks.push({
    key: "agent_native.markdown_negotiation",
    categoryKey: "agent_native",
    title: { zh: "支持 Accept: text/markdown 内容协商直出", en: "Markdown served on request" },
    whyItMatters: {
      zh: "当 AI Agent 发送 `Accept: text/markdown` 请求头时，直接返回纯净 Markdown，为 Agent 节省 90% 的 HTML 噪声 Token。",
      en: "Serving clean Markdown when a client sends 'Accept: text/markdown' cuts token usage by ~90%.",
    },
    status: mdPts === 2 ? "passed" : mdPts > 0 ? "partial" : "failed",
    score: mdPts,
    maxScore: 2,
    detail:
      mdPts === 2
        ? `成功通过 Content-Type: ${mdCT} 返回纯净 Markdown`
        : mdPts === 1
        ? "声明了 <link rel=\"alternate\" type=\"text/markdown\">，但首页未根据 Accept 头直出 Markdown"
        : "发送 Accept: text/markdown 时仍返回 text/html",
    prompt:
      mdPts === 2
        ? null
        : {
            zh: `在 Middleware 或 Cloudflare Worker 中检测请求头 Accept 是否包含 "text/markdown"；如果包含，直接将 /llms.txt 或当前页面的 Markdown 版本以 Content-Type: text/markdown; charset=utf-8 返回。`,
            en: `In your middleware or edge worker, inspect the 'Accept' request header for 'text/markdown' and respond with clean Markdown (Content-Type: text/markdown).`,
          },
  });

  // 6.4 Link headers (1 pt)
  const linkHeader = homeRes.headers["link"] || "";
  const hasAgentLinkHeader = /llms\.txt|text\/markdown|service-desc|mcp|describedby/i.test(linkHeader);
  checks.push({
    key: "agent_native.link_headers",
    categoryKey: "agent_native",
    title: { zh: "HTTP Link 响应头暴露 llms.txt 与 MCP 发现入口", en: "Link headers" },
    whyItMatters: {
      zh: "即使 Agent 只做一次 HEAD 请求，也能从 HTTP `Link:` 响应头直接发现 `/llms.txt`（有远程 MCP 服务的，还有它的服务卡片）。",
      en: "Exposes /llms.txt (and, if you run a remote MCP server, its server card) in the HTTP Link response header for zero-parse discovery.",
    },
    status: hasAgentLinkHeader ? "passed" : "failed",
    score: hasAgentLinkHeader ? 1 : 0,
    maxScore: 1,
    detail: hasAgentLinkHeader ? `Link: ${linkHeader.slice(0, 120)}` : "响应头中未包含指向 llms.txt 或 server-card.json 的 Link 头",
    prompt: hasAgentLinkHeader
      ? null
      : {
          zh: `在服务端响应头中添加 HTTP Link 头：\nLink: <https://${domain}/llms.txt>; rel="llms-txt"; type="text/markdown"\n有远程 MCP 服务、发了服务卡片的，在同一个 Link 头里再加一项指向卡片：<https://${domain}/.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"。没有就别加。`,
          en: `Add an HTTP 'Link' response header pointing to /llms.txt. If you run a remote MCP server and publish its server card, add the card's URL to the same header (rel="service-desc"); otherwise leave it out.`,
        },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 第 7 关：工具接口 Agent Interaction（10 分）
  // ═══════════════════════════════════════════════════════════════════════
  // 7.1 WebMCP tools exposed (6 pts)
  const hasDeclarativeWebMcp = /<form[^>]+toolname=["'][^"']+["'][^>]+tooldescription=["'][^"']+["']/i.test(html) ||
    /<form[^>]+tooldescription=["'][^"']+["'][^>]+toolname=["'][^"']+["']/i.test(html);
  let hasImperativeWebMcp = /navigator\.modelContext|\.registerTool\s*\(|\.provideContext\s*\(/i.test(html);

  // 如果首页 HTML 里没直接内联，抽前 3 个同源 script bundle 检查是否注册了 navigator.modelContext
  if (!hasDeclarativeWebMcp && !hasImperativeWebMcp) {
    const scriptSrcs = Array.from(html.matchAll(/<script[^>]+src=["']([^"']+\.js[^"']*)["']/gi))
      .map((m) => m[1])
      .slice(0, 4);
    const resolvedScripts = scriptSrcs.map((src) =>
      src.startsWith("http") ? src : `${baseUrl}${src.startsWith("/") ? "" : "/"}${src}`
    );
    const scriptResponses = await Promise.all(
      resolvedScripts.map((u) => safeFetch(u, {}, 3500, 600_000))
    );
    hasImperativeWebMcp = scriptResponses.some((r) =>
      /modelContext|registerTool|provideContext/i.test(r.text)
    );
  }

  const webMcpOk = hasDeclarativeWebMcp || hasImperativeWebMcp;
  checks.push({
    key: "agent_interaction.webmcp_tools",
    categoryKey: "agent_interaction",
    title: { zh: "暴露 WebMCP 浏览器端 Agent 可调用工具", en: "WebMCP tools exposed" },
    whyItMatters: {
      zh: "W3C WebMCP 规范：通过 `<form toolname=\"...\" tooldescription=\"...\">` 或 `navigator.modelContext.registerTool()` 把网页变成浏览器 AI Agent 可直接调用的工具。",
      en: "Exposes callable tools to browser AI agents via declarative <form toolname=...> attributes or navigator.modelContext.registerTool().",
    },
    status: webMcpOk ? "passed" : "failed",
    score: webMcpOk ? 6 : 0,
    maxScore: 6,
    detail: webMcpOk
      ? `检测到 WebMCP 工具暴露（声明式表单=${hasDeclarativeWebMcp}，modelContext 脚本=${hasImperativeWebMcp}）`
      : "未检测到 <form toolname=\"...\"> 或 navigator.modelContext.registerTool()",
    prompt: webMcpOk
      ? null
      : {
          zh: `在页面中接入 W3C WebMCP 工具支持（任选或同时使用两种方式）：\n1. 声明式：给搜索或查询表单加上 <form toolname="search_site" tooldescription="Search site content" toolautosubmit="true">；\n2. 命令式：在客户端初始化时调用 navigator.modelContext?.registerTool({ name: "get_site_info", description: "...", inputSchema: { type: "object", properties: {} }, execute: async () => ({ ... }) })。`,
          en: `Expose WebMCP tools via <form toolname="..." tooldescription="..."> and/or navigator.modelContext.registerTool({...}).`,
        },
  });

  // 7.2 MCP Server Card published (4 pts)
  // 修复建议（2026-11-25 起）：有远程 MCP 服务才发卡片。MCP 的 SEP-2127（Final）规定卡片只描述远程服务：
  // 名字 + 连接地址（remotes），不列工具；推荐放在「服务地址/server-card」，网站级入口是 /.well-known/ai-catalog.json。
  // 这一项沿用旧草案的 /.well-known/mcp/server-card.json（Hostinger、Cloudflare isitagentready 也查这里），分值不变，
  // 只是多认 remotes，按新模板写的卡片照样拿 4 分。以前的模板给每个网站一张带 search_site 工具的卡片，
  // 没有 MCP 服务的网站照抄就成了假卡片（本站 11-19 那张就是这样）。
  let mcpPts = 0;
  let mcpDetail = `访问 /.well-known/mcp/server-card.json 返回 HTTP ${mcpRes.status}`;
  if (mcpRes.status === 200 && !(mcpRes.headers["content-type"] || "").toLowerCase().includes("text/html")) {
    try {
      const card = JSON.parse(mcpRes.text) as Record<string, unknown> | null;
      const isObj = card !== null && typeof card === "object";
      const hasName = isObj && Boolean(card["serverInfo"] || card["name"]);
      const hasConn = isObj && Boolean(card["remotes"] || card["tools"] || card["capabilities"] || card["transport"] || card["endpoints"]);
      if (isObj && hasName && hasConn) {
        mcpPts = 4;
        const info = (card["serverInfo"] as Record<string, unknown>) || card;
        mcpDetail = `已发布合法的 MCP Server Card（name="${String(info["name"] || domain)}"）`;
      } else {
        mcpPts = 2;
        const missing = [!hasName && "服务名（name）", !hasConn && "连接地址（remotes）"].filter(Boolean).join("和");
        mcpDetail = `JSON 可解析，但没写${missing}`;
      }
    } catch {
      mcpDetail = "/.well-known/mcp/server-card.json 不是合法的 JSON";
    }
  }
  const cardName = `${domain.replace(/^www\./, "").split(".").reverse().join(".")}/mcp`;
  const cardTemplate = (description: string) =>
    [
      "{",
      '  "$schema": "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",',
      `  "name": "${cardName}",`,
      '  "version": "1.0.0",',
      `  "description": "${description}",`,
      `  "websiteUrl": "https://${domain}",`,
      `  "remotes": [{ "type": "streamable-http", "url": "https://${domain}/mcp" }]`,
      "}",
    ].join("\n");
  checks.push({
    key: "agent_interaction.mcp_server_card",
    categoryKey: "agent_interaction",
    title: { zh: "发布 /.well-known/mcp/server-card.json", en: "MCP Server Card published" },
    whyItMatters: {
      zh: "给有远程 MCP 服务的网站用：MCP 客户端和目录先读这张卡片，就知道服务叫什么、去哪个地址连，不用先连上。卡片不列工具，工具连上以后再取。没有远程 MCP 服务的网站用不上。",
      en: "For sites that run a remote MCP server: clients and registries read the card to learn the server's name and endpoint before connecting. It doesn't list tools; those are fetched after connecting. Sites without a remote MCP server don't need one.",
    },
    status: mcpPts === 4 ? "passed" : mcpPts > 0 ? "partial" : "failed",
    score: mcpPts,
    maxScore: 4,
    detail: mcpDetail,
    prompt:
      mcpPts === 4
        ? null
        : {
            zh: [
              `先确认有没有远程 MCP 服务：MCP 客户端能直接连上的网址，比如 https://${domain}/mcp。npm 包、本机命令（这类去 MCP 官方 Registry 登记）、网页里的 WebMCP 工具都不算。`,
              "",
              "没有：不要发这张卡片，也别照抄网上带 tools 列表的模板。卡片里写了连不上的地址、调不了的工具，Agent 会照着去连，白跑一趟。这一项空着只少 4 分；页面里的搜索做成 7.1 的 WebMCP 工具，内容入口写进 /llms.txt。",
              "",
              "有：按 MCP 的服务卡片规范（SEP-2127）写一张，只写名字和连接地址，不列工具（客户端连上以后自己取）。地址换成真实的：",
              cardTemplate("<这个服务能做什么，100 个字符以内>"),
              `规范推荐放在「服务地址 + /server-card」（上例是 https://${domain}/mcp/server-card），并在 /.well-known/ai-catalog.json 里登记；这一项查的是旧草案的位置 /.well-known/mcp/server-card.json，同样的内容这里也放一份。规范：https://github.com/modelcontextprotocol/experimental-ext-server-card`,
            ].join("\n"),
            en: [
              `First check whether you run a remote MCP server: a URL an MCP client can connect to directly, such as https://${domain}/mcp. An npm package or a local command (list those in the official MCP Registry) and WebMCP tools in your pages don't count.`,
              "",
              "No remote server: don't publish this card, and don't copy templates that list tools. A card pointing to an endpoint or tools nobody can call sends agents to a dead end. Leaving this check empty costs 4 points; put your search into WebMCP tools (7.1) and your content into /llms.txt.",
              "",
              "Remote server: write a card following the MCP Server Card spec (SEP-2127) with its name and endpoint only, no tool list (clients fetch tools after connecting). Use your real URL:",
              cardTemplate("<what the server does, under 100 characters>"),
              `The spec recommends hosting it at <server URL>/server-card (here https://${domain}/mcp/server-card) and listing it in /.well-known/ai-catalog.json; this check reads the older draft location /.well-known/mcp/server-card.json, so serve the same JSON there too. Spec: https://github.com/modelcontextprotocol/experimental-ext-server-card`,
            ].join("\n"),
          },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 汇总 7 大关卡与总分
  // ═══════════════════════════════════════════════════════════════════════
  const categories: CategoryScore[] = CATEGORIES.map((cat) => {
    const catChecks = checks.filter((c) => c.categoryKey === cat.key);
    const earned = catChecks.reduce((sum, c) => sum + c.score, 0);
    return {
      key: cat.key,
      level: cat.level,
      name: cat.name,
      badge: cat.badge,
      symptom: cat.symptom,
      courseTieIn: cat.courseTieIn,
      earned,
      max: cat.maxPoints,
      checks: catChecks,
    };
  });

  const totalScore = categories.reduce((sum, c) => sum + c.earned, 0);
  const { grade, label } = scoreToGrade(totalScore);
  const passedKeys = checks.filter((c) => c.status === "passed").map((c) => c.key);
  const failedChecks = checks.filter((c) => c.status !== "passed");
  const failedKeys = failedChecks.map((c) => c.key);

  // ═══════════════════════════════════════════════════════════════════════
  // GEO 五阶段漏斗映射（Reach → Search → Cite → Describe → Measure）
  // ═══════════════════════════════════════════════════════════════════════
  const checkScoreMap = Object.fromEntries(checks.map((c) => [c.key, c.score]));
  const sumKeys = (keys: string[]) => keys.reduce((s, k) => s + (checkScoreMap[k] || 0), 0);

  const reachEarned = sumKeys([
    "crawl_permission.robots_txt",
    "crawl_permission.ai_crawlers",
    "crawl_permission.bot_detection",
    "crawl_permission.content_signals",
    "readability.no_js",
    "findability.https",
    "agent_native.link_headers",
  ]);
  const searchEarned = sumKeys([
    "findability.sitemap_urls",
    "findability.sitemap_in_robots",
    "findability.lastmod",
    "findability.real_404",
    "readability.meta_tags",
  ]);
  const citeEarned = sumKeys([
    "readability.token_budget",
    "readability.headings",
    "agent_native.llms_txt",
    "agent_native.llms_well_formed",
    "agent_native.markdown_negotiation",
  ]);
  const describeEarned = sumKeys([
    "structured_meaning.json_ld",
    "structured_meaning.org_schema",
    "structured_meaning.same_as",
    "structured_meaning.multiple_schemas",
    "commercial_legibility.trust_pages",
    "commercial_legibility.machine_contact",
    "commercial_legibility.pricing",
    "agent_interaction.webmcp_tools",
    "agent_interaction.mcp_server_card",
  ]);

  const stages: GeoStageScore[] = [
    {
      id: "reach",
      step: 1,
      name: { zh: "1. Reach", en: "1. Reach" },
      question: { zh: "AI 能访问吗？", en: "Can AI access it?" },
      earned: reachEarned,
      max: 31,
      pct: Math.round((reachEarned / 31) * 100),
    },
    {
      id: "search",
      step: 2,
      name: { zh: "2. Search", en: "2. Search" },
      question: { zh: "AI 能搜到吗？", en: "Can AI find it?" },
      earned: searchEarned,
      max: 18,
      pct: Math.round((searchEarned / 18) * 100),
    },
    {
      id: "cite",
      step: 3,
      name: { zh: "3. Cite", en: "3. Cite" },
      question: { zh: "AI 会引用吗？", en: "Will AI cite it?" },
      earned: citeEarned,
      max: 15,
      pct: Math.round((citeEarned / 15) * 100),
    },
    {
      id: "describe",
      step: 4,
      name: { zh: "4. Describe", en: "4. Describe" },
      question: { zh: "AI 会把我们说对吗？", en: "Will AI describe us right?" },
      earned: describeEarned,
      max: 36,
      pct: Math.round((describeEarned / 36) * 100),
    },
  ];

  // ═══════════════════════════════════════════════════════════════════════
  // L1 ~ L4 内部高阶诊断（只向外部展示表征结论，核心阈值与配方保密锁定）
  // ═══════════════════════════════════════════════════════════════════════
  // L1: 抓取与入库（候选集准入与模板去重风险）
  const l1Healthy = hasSitemapUrls && locUrls.length <= 2500 && robotsValid && aiAllowed;
  // L2: 实体与本体（跨源实体对齐一致性）
  const domainStem = domain.split(".")[0].toLowerCase();
  const orgUrlStr = String(orgObjs[0]?.["url"] || "").toLowerCase();
  const orgNameStr = String(orgObjs[0]?.["name"] || "").toLowerCase();
  const canonicalHostOk = !canonicalMatch || canonicalMatch.toLowerCase().includes(domain);
  const orgHostOk = !orgUrlStr || orgUrlStr.includes(domain);
  const l2Healthy = hasJsonLd && orgPts >= 3 && canonicalHostOk && orgHostOk;

  // L3: 召回与扇出（多路检索与跨语种扇出锚点）
  const hasHreflangEn = /hreflang=["']en(-[a-z]+)?["']/i.test(html) || /<html[^>]+lang=["']en/i.test(html);
  const hasEnglishAnchor = /[a-zA-Z]{4,}\s+[a-zA-Z]{4,}/.test(`${titleMatch} ${descMatch}`);
  const l3Healthy = hasSitemapUrls && (hasHreflangEn || hasEnglishAnchor) && metaPts >= 3;

  // L4: 切片重排与生成（首段切片窗口提取 + 品牌归因检测 + 结构化表格检测）
  const mainBlockMatch =
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ||
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ||
    html;
  const mainVisibleText = stripTags(mainBlockMatch);
  const leadExcerpt = (mainVisibleText || visibleText).slice(0, 260);
  const brandCandidate = orgNameStr || domainStem;
  const brandNamedInLead =
    leadExcerpt.toLowerCase().includes(domainStem) ||
    (brandCandidate.length >= 2 && leadExcerpt.toLowerCase().includes(brandCandidate));
  const hasStructuredTable = /<table[\s>]/i.test(html) || Array.from(schemaTypes).some((t) => /faqpage|itemlist|dataset/i.test(t));
  const l4Healthy = noJsPts === 8 && brandNamedInLead && hasStructuredTable;

  const l1ToL4Signals: L1ToL4Signal[] = [
    {
      layer: "L1",
      title: { zh: "L1：抓取与入库（候选集准入 & 模板去重健康度）", en: "L1: Crawl & Admission Hygiene" },
      stageTag: "1. Reach → 2. Search",
      status: l1Healthy ? "passed" : "warning",
      publicFinding: l1Healthy
        ? {
            zh: `候选集准入正常（Sitemap 已收录 ${locUrls.length} 条规范 URL，未触发配额超载或折叠预警）`,
            en: `Candidate admission healthy (${locUrls.length} sitemap URLs within safe crawl quota)`,
          }
        : {
            zh:
              locUrls.length > 2500
                ? `检测到 Sitemap URL 数量偏高（${locUrls.length} 条），存在新站配额稀释与同模板折叠风险`
                : "检测到候选集准入或 Sitemap 覆盖缺口，部分页面无法进入预训练与检索索引池",
            en: "Detected crawl quota dilution or candidate admission gap",
          },
      lockedHint: {
        zh: "🔒 内部核心参数：新域名配额安全线与防折叠去重策略（GoSail Club 内部实验课解锁）",
        en: "🔒 Internal Playbook: Domain quota thresholds & anti-folding rules (Members Only)",
      },
    },
    {
      layer: "L2",
      title: { zh: "L2：实体与本体（知识图谱跨源对齐校验）", en: "L2: Entity & Ontology Resolution" },
      stageTag: "4. Describe",
      status: l2Healthy ? "passed" : "warning",
      publicFinding: l2Healthy
        ? {
            zh: "Canonical、Organization JSON-LD 与页面主实体标识已对齐，未检测到实体分裂",
            en: "Canonical, Organization JSON-LD, and primary brand entity are aligned",
          }
        : {
            zh: "存在实体分裂或属性缺失风险：机器在跨源比对时可能将你的品牌识别为多个孤立节点",
            en: "Entity split risk: missing or inconsistent cross-source entity identifiers",
          },
      lockedHint: {
        zh: "🔒 内部核心参数：三元组唯一性对齐清单与防分裂修复矩阵（GoSail Club 内部实验课解锁）",
        en: "🔒 Internal Playbook: E-A-V entity resolution matrix (Members Only)",
      },
    },
    {
      layer: "L3",
      title: { zh: "L3：召回与扇出（多路改写与跨语种召回锚点）", en: "L3: Retrieval & Query Fan-out" },
      stageTag: "2. Search",
      status: l3Healthy ? "passed" : "warning",
      publicFinding: l3Healthy
        ? {
            zh: "已具备多路检索与跨语种召回锚点，可承接 AI 后台改写后的扇出检索请求",
            en: "Equipped with multi-path and cross-lingual retrieval anchors",
          }
        : {
            zh: "跨语种扇出召回锚点不足：当 AI 在后台将用户提问改写为多路检索词时容易漏召回",
            en: "Weak fan-out retrieval anchors for rewritten background AI search queries",
          },
      lockedHint: {
        zh: "🔒 内部核心参数：AI 后台改写扇出规律与高召回词槽布局（GoSail Club 内部实验课解锁）",
        en: "🔒 Internal Playbook: Query fan-out rewrite patterns & slot layout (Members Only)",
      },
    },
    {
      layer: "L4",
      title: { zh: "L4：切片重排与生成（首段切片窗口 & 品牌归因绑定）", en: "L4: Chunking, Reranking & Brand Attribution" },
      stageTag: "3. Cite → 4. Describe",
      status: l4Healthy ? "passed" : "warning",
      publicFinding: l4Healthy
        ? {
            zh: "首段切片已包含品牌自归因锚点，且页面包含高重排权重结构化区块",
            en: "Lead passage chunk includes brand self-attribution and structured comparison blocks",
          }
        : {
            zh: !brandNamedInLead
              ? "⚠️ 检测到「被引用但未点名」风险：首段核心切片内未绑定品牌名，极易沦为大模型免费语料却拿不到品牌曝光"
              : "缺少高重排权重的结构化对比切片（如参数对比表或结构化 FAQ），在重排阶段容易被竞品挤掉",
            en: !brandNamedInLead
              ? "⚠️ Citation without Brand Naming risk: lead passage chunk lacks brand self-attribution"
              : "Missing high-rerank structured comparison tables or FAQ blocks",
          },
      lockedHint: {
        zh: "🔒 内部核心参数：黄金切片词窗公式与高权重对比矩阵模板（GoSail Club 内部实验课解锁）",
        en: "🔒 Internal Playbook: Golden chunk window formula & rerank table template (Members Only)",
      },
    },
  ];

  const leadChunkPreview: LeadChunkPreview = {
    excerpt: leadExcerpt || "（未提取到有效无 JS 首段文本）",
    brandNamedInLead,
    hasStructuredTable,
  };

  const combinedPromptZh =
    failedChecks.length === 0
      ? `恭喜！https://${domain} 已通过全部 26 项 AI 可见度与 Agent 就绪度体检（100/100 Grade A）！`
      : `请帮我修复 https://${domain} 的 AI 搜索可见度与 Agent 就绪度问题（当前得分 ${totalScore}/100，等级 ${grade}）。请按以下 ${failedChecks.length} 项具体处方逐条修改代码：\n\n` +
        failedChecks
          .map(
            (c, idx) =>
              `### ${idx + 1}. [${c.title.zh}]（当前 ${c.score}/${c.maxScore} 分 · 诊断：${c.detail}）\n${c.prompt?.zh || ""}`
          )
          .join("\n\n");

  const combinedPromptEn =
    failedChecks.length === 0
      ? `Congratulations! https://${domain} passed all 26 AI Readiness checks (100/100 Grade A).`
      : `Please fix the following ${failedChecks.length} AI Readiness & GEO issues on https://${domain} (Current Score: ${totalScore}/100, Grade ${grade}):\n\n` +
        failedChecks
          .map(
            (c, idx) =>
              `### ${idx + 1}. [${c.title.en}] (${c.score}/${c.maxScore} pts — ${c.detail})\n${c.prompt?.en || ""}`
          )
          .join("\n\n");

  return {
    domain,
    finalUrl: homeRes.finalUrl || baseUrl,
    scannedAt: new Date().toISOString(),
    score: totalScore,
    grade,
    label,
    categories,
    stages,
    l1ToL4Signals,
    leadChunkPreview,
    passedKeys,
    failedKeys,
    combinedPrompt: {
      zh: combinedPromptZh,
      en: combinedPromptEn,
    },
  };
}

/** 内置真实标杆榜单（用于名人堂对比 + 一键点选体验） */
export interface BenchmarkEntry {
  domain: string;
  tag: { zh: string; en: string };
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  highlight: { zh: string; en: string };
  categoryBreakdown: Record<string, number>;
}

export const BENCHMARK_HALL_OF_FAME: BenchmarkEntry[] = [
  {
    domain: "jasonzhu.ai",
    tag: { zh: "本站 · AI 原生满分标杆", en: "This Site · Agent-Ready Benchmark" },
    score: 100,
    grade: "A",
    highlight: {
      zh: "7 关 26 项全满分：Content-Signal + @graph 多 Schema + /llms.txt + Markdown 协商 + WebMCP + MCP Server Card",
      en: "100/100 across all 7 levels: Content-Signal, JSON-LD @graph, /llms.txt, Markdown negotiation, WebMCP & MCP Server Card",
    },
    categoryBreakdown: {
      crawl_permission: 20,
      readability: 18,
      findability: 16,
      structured_meaning: 14,
      commercial_legibility: 12,
      agent_native: 10,
      agent_interaction: 10,
    },
  },
  {
    domain: "agentskillshub.top",
    tag: { zh: "27.6万+ AI Skill 安全分级目录", en: "276,000+ Security-Graded Skills Hub" },
    score: 98,
    grade: "A",
    highlight: {
      zh: "从 77 分（Grade B）手术升级到 98 分（Grade A）：6 大关卡满分，补齐 WebMCP、MCP Server Card 与 Edge Markdown 协商",
      en: "Upgraded from 77 (Grade B) to 98 (Grade A) with full marks on 6/7 levels including WebMCP, MCP Server Card, and Edge Markdown",
    },
    categoryBreakdown: {
      crawl_permission: 20,
      readability: 18,
      findability: 16,
      structured_meaning: 14,
      commercial_legibility: 10,
      agent_native: 10,
      agent_interaction: 10,
    },
  },
  {
    domain: "hostinger.com",
    tag: { zh: "检查项和分值的出处", en: "Where the checks and points come from" },
    score: 97,
    grade: "A",
    highlight: {
      zh: "官方标杆站：5 大关卡满分，完整支持 /llms.txt、Markdown 协商、WebMCP 与 MCP Server Card",
      en: "Hostinger's flagship domain: full marks on 5/7 categories including /llms.txt, WebMCP, and MCP Server Card",
    },
    categoryBreakdown: {
      crawl_permission: 20,
      readability: 17,
      findability: 16,
      structured_meaning: 14,
      commercial_legibility: 10,
      agent_native: 10,
      agent_interaction: 10,
    },
  },
  {
    domain: "glama.ai",
    tag: { zh: "海外头部 MCP 目录站", en: "Popular MCP Directory" },
    score: 82,
    grade: "B",
    highlight: {
      zh: "前 4 关全部满分，但未暴露 WebMCP 与 MCP Server Card（第 7 关 0/10 分）",
      en: "Full marks on Levels 1–4, but 0/10 on Level 7 Agent Interaction (no WebMCP or MCP Server Card)",
    },
    categoryBreakdown: {
      crawl_permission: 20,
      readability: 18,
      findability: 16,
      structured_meaning: 14,
      commercial_legibility: 7,
      agent_native: 7,
      agent_interaction: 0,
    },
  },
  {
    domain: "skills.sh",
    tag: { zh: "Vercel 旗下 Skills 站", en: "Vercel Skills Directory" },
    score: 58,
    grade: "C",
    highlight: {
      zh: "补上了基础 Sitemap 与部分 Schema，但仍缺 /llms.txt（0/10 分）与 WebMCP（0/10 分）",
      en: "Basic crawlability improved, yet still 0/10 on Agent-Native (/llms.txt) and 0/10 on Agent Interaction (WebMCP)",
    },
    categoryBreakdown: {
      crawl_permission: 17,
      readability: 15,
      findability: 13,
      structured_meaning: 7,
      commercial_legibility: 6,
      agent_native: 0,
      agent_interaction: 0,
    },
  },
  {
    domain: "smithery.ai",
    tag: { zh: "知名 MCP Registry", en: "MCP Server Registry" },
    score: 47,
    grade: "D",
    highlight: {
      zh: "典型反面教材：虽然自己是做 MCP 的，但没写 JSON-LD（0/14 分）、没配 /llms.txt（0/10 分）、没暴露 WebMCP（0/10 分）",
      en: "Irony alert: an MCP registry with 0/14 on JSON-LD, 0/10 on llms.txt, and 0/10 on WebMCP",
    },
    categoryBreakdown: {
      crawl_permission: 17,
      readability: 16,
      findability: 13,
      structured_meaning: 0,
      commercial_legibility: 1,
      agent_native: 0,
      agent_interaction: 0,
    },
  },
];

export interface CheckCatalogItem {
  key: string;
  level: number;
  maxScore: number;
  title: { zh: string; en: string };
}

export const CHECK_CATALOG: Record<string, CheckCatalogItem> = {
  "crawl_permission.robots_txt": { key: "crawl_permission.robots_txt", level: 1, maxScore: 4, title: { zh: "robots.txt 存在且可解析", en: "robots.txt present and parseable" } },
  "crawl_permission.ai_crawlers": { key: "crawl_permission.ai_crawlers", level: 1, maxScore: 7, title: { zh: "未封禁主流 AI 搜索爬虫", en: "AI crawlers not blocked" } },
  "crawl_permission.bot_detection": { key: "crawl_permission.bot_detection", level: 1, maxScore: 6, title: { zh: "未被 WAF / 机器人防火墙误杀", en: "Not blocked by bot detection" } },
  "crawl_permission.content_signals": { key: "crawl_permission.content_signals", level: 1, maxScore: 3, title: { zh: "声明 Content-Signal 机器授权信号", en: "Content Signals declared" } },
  "readability.no_js": { key: "readability.no_js", level: 2, maxScore: 8, title: { zh: "无需执行 JavaScript 即可读出正文", en: "Content readable without JavaScript" } },
  "readability.token_budget": { key: "readability.token_budget", level: 2, maxScore: 3, title: { zh: "合理的 HTML 体积与 Token 预算", en: "Reasonable token budget" } },
  "readability.meta_tags": { key: "readability.meta_tags", level: 2, maxScore: 4, title: { zh: "Title、Description 与 Canonical 齐全", en: "Title, meta description and canonical" } },
  "readability.headings": { key: "readability.headings", level: 2, maxScore: 3, title: { zh: "清晰的 H1 → H2 → H3 标题层级", en: "Clear heading hierarchy" } },
  "findability.sitemap_urls": { key: "findability.sitemap_urls", level: 3, maxScore: 5, title: { zh: "Sitemap.xml 正常列出全站 URL", en: "Sitemap lists URLs" } },
  "findability.sitemap_in_robots": { key: "findability.sitemap_in_robots", level: 3, maxScore: 3, title: { zh: "在 robots.txt 中声明 Sitemap 地址", en: "Sitemap declared in robots.txt" } },
  "findability.lastmod": { key: "findability.lastmod", level: 3, maxScore: 3, title: { zh: "Sitemap 包含近期更新时间戳（lastmod）", en: "Recent lastmod dates" } },
  "findability.real_404": { key: "findability.real_404", level: 3, maxScore: 3, title: { zh: "不存在的 URL 返回真实 404 状态码", en: "Real 404 for missing pages" } },
  "findability.https": { key: "findability.https", level: 3, maxScore: 2, title: { zh: "干净的 HTTPS 规范首页", en: "Clean HTTPS homepage" } },
  "structured_meaning.json_ld": { key: "structured_meaning.json_ld", level: 4, maxScore: 6, title: { zh: "内嵌 JSON-LD 结构化数据", en: "JSON-LD present" } },
  "structured_meaning.org_schema": { key: "structured_meaning.org_schema", level: 4, maxScore: 4, title: { zh: "完整的 Organization 品牌实体声明", en: "Complete Organization schema" } },
  "structured_meaning.same_as": { key: "structured_meaning.same_as", level: 4, maxScore: 2, title: { zh: "sameAs 跨平台权威主页对齐", en: "sameAs links" } },
  "structured_meaning.multiple_schemas": { key: "structured_meaning.multiple_schemas", level: 4, maxScore: 2, title: { zh: "组合多种 Schema 类型（@graph）", en: "Several schema types" } },
  "commercial_legibility.trust_pages": { key: "commercial_legibility.trust_pages", level: 5, maxScore: 4, title: { zh: "关于我们、联系方式与隐私/条款链接齐全", en: "About, contact and legal pages linked" } },
  "commercial_legibility.machine_contact": { key: "commercial_legibility.machine_contact", level: 5, maxScore: 4, title: { zh: "机器可读的真实联系信息（mailto + contactPoint）", en: "Machine-readable contact details" } },
  "commercial_legibility.pricing": { key: "commercial_legibility.pricing", level: 5, maxScore: 4, title: { zh: "免登录、免 JS 即可读取价格或免费档位说明", en: "Prices reachable without JS or login" } },
  "agent_native.llms_txt": { key: "agent_native.llms_txt", level: 6, maxScore: 4, title: { zh: "提供 /llms.txt AI 专属索引文件", en: "llms.txt served" } },
  "agent_native.llms_well_formed": { key: "agent_native.llms_well_formed", level: 6, maxScore: 3, title: { zh: "llms.txt 符合标准 Markdown 语法结构", en: "llms.txt well-formed" } },
  "agent_native.markdown_negotiation": { key: "agent_native.markdown_negotiation", level: 6, maxScore: 2, title: { zh: "支持 Accept: text/markdown 内容协商直出", en: "Markdown served on request" } },
  "agent_native.link_headers": { key: "agent_native.link_headers", level: 6, maxScore: 1, title: { zh: "HTTP Link 响应头暴露 llms.txt 与 MCP 发现入口", en: "Link headers" } },
  "agent_interaction.webmcp_tools": { key: "agent_interaction.webmcp_tools", level: 7, maxScore: 6, title: { zh: "暴露 WebMCP 浏览器端 Agent 可调用工具", en: "WebMCP tools exposed" } },
  "agent_interaction.mcp_server_card": { key: "agent_interaction.mcp_server_card", level: 7, maxScore: 4, title: { zh: "发布 /.well-known/mcp/server-card.json", en: "MCP Server Card published" } },
};

