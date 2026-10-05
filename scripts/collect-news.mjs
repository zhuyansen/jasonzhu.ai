/**
 * AI 快讯自动采集管线
 *
 * 流程：RSS/网页采集 → Claude 摘要分类 → 写入 Supabase → 生成 MDX → commit 触发部署
 *
 * 环境变量：
 *   ANTHROPIC_AUTH_TOKEN     - Claude API 密钥（支持中转站）
 *   ANTHROPIC_BASE_URL       - API 地址（默认 https://api.aigocode.app）
 *   ANTHROPIC_API_KEY        - 备选：原生 Anthropic API 密钥
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase URL
 *   SUPABASE_SERVICE_KEY     - Supabase Service Role Key（写入权限）
 */

import Anthropic from "@anthropic-ai/sdk";
import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 本地手动跑时自动加载 .env.local（GitHub Actions 直接走系统 env，无影响）
// 注意：手动解析以强制覆盖已存在的 env（process.loadEnvFile 不覆盖，
// 在 Claude Code 等已导出 ANTHROPIC_BASE_URL 的环境下会导致 key 发到错地方）
for (const envFile of [".env.local", ".env"]) {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf-8");
    let count = 0;
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
      count++;
    }
    console.log(`📂 Loaded ${envFile} (${count} vars, override mode)`);
    break;
  }
}

// ─── 配置 ───────────────────────────────────────────

const RSS_FEEDS = [
  // AI 行业官方博客
  { url: "https://openai.com/blog/rss.xml", name: "OpenAI Blog" },
  { url: "https://blog.google/technology/ai/rss/", name: "Google AI Blog" },
  // 社区 & 聚合
  { url: "https://hnrss.org/newest?q=AI+agent+OR+claude+OR+cursor+OR+MCP&count=15", name: "Hacker News" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", name: "TechCrunch AI" },
  // 中文 AI 媒体
  { url: "https://36kr.com/feed", name: "36Kr" },
  // 产品发现
  { url: "https://www.producthunt.com/feed?category=ai", name: "Product Hunt AI" },
  // AI 专题 Hacker News（补充更多关键词）
  { url: "https://hnrss.org/newest?q=LLM+OR+GPT+OR+anthropic+OR+openai+OR+vercel+AI&count=10", name: "HN AI Extended" },
  // X/Twitter AI KOLs via Nitter RSS
  { url: "https://nitter.net/AndrewYNg/rss", name: "X/@AndrewYNg" },
  { url: "https://nitter.net/kaboroevich/rss", name: "X/@kaboroevich" },
  { url: "https://nitter.net/bindureddy/rss", name: "X/@bindureddy" },
  // 老牌 AI Newsletter
  { url: "https://www.bensbites.com/feed", name: "Ben's Bites" },
  // 借鉴自 cclank/news-aggregator-skill 的高价值 newsletter / 趋势源
  { url: "https://www.latent.space/feed", name: "Latent Space" },
  { url: "https://www.interconnects.ai/feed", name: "Interconnects" },
  { url: "https://www.oneusefulthing.org/feed", name: "One Useful Thing" },
  { url: "https://chinai.substack.com/feed", name: "ChinAI" },
  { url: "https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml", name: "GitHub Trending" },
  // 融资专源（用于"AI 融资速递"模块）—— 融资多为周更，放宽时间窗到 7 天
  { url: "https://techcrunch.com/category/venture/feed/", name: "TC Venture", days: 7 },
  { url: "https://news.crunchbase.com/feed/", name: "Crunchbase News", days: 7 },
];

const CATEGORIES = ["Skills 生态", "出海实战", "AI 工具动态", "变现案例", "AI 论文"];

// 支持 DATE 环境变量回填历史日期（例如 DATE=2026-05-01 node scripts/collect-news.mjs）
// 默认日期用北京时间（UTC+8）—— cron 在 UTC 22:00 跑时，UTC 日期还是前一天，必须按北京日期取
const beijingToday = () => new Date(Date.now() + 8 * 3600 * 1000).toISOString().split("T")[0];
const TODAY = process.env.DATE || beijingToday();
const MONTH_DAY = (() => {
  const d = new Date(TODAY + "T00:00:00");
  return `${d.getMonth() + 1}月${d.getDate()}日`;
})();

// ─── 初始化 ─────────────────────────────────────────

// 主客户端：aigocode 中转站
const proxyKey = process.env.ANTHROPIC_AUTH_TOKEN;
const proxyURL = process.env.ANTHROPIC_BASE_URL || "https://api.aigocode.app";

// 备用客户端：官方 Anthropic API（当中转站不可用时 fallback）
const officialKey = process.env.ANTHROPIC_API_KEY;

if (!proxyKey && !officialKey) {
  console.error("❌ Missing ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY");
  process.exit(1);
}

// ⚠️ 已弃用 SDK 直接走 HTTP — SDK 在 aigocode 代理下经常无声 hang 致 cron 超时被 cancel
// 自己用 fetch + AbortController 90s 超时，能 hard-fail，能 retry
const officialURL = "https://api.anthropic.com";
const PROXY = proxyKey ? { key: proxyKey, baseURL: proxyURL, label: "proxy" } : null;
const OFFICIAL = officialKey ? { key: officialKey, baseURL: officialURL, label: "official" } : null;

// 备用中转站 apimart：aigocode 账号池干涸 / 宕机时自动切到这里。
// 用自己的模型名：2026-10-05 新 key 只开通 claude-opus-5-5；旧 key 是 sonnet-5-5 / opus-4-6，三个都列上。
// apimart 的 key 按模型分组开通：调 Claude 用 APIMART_CLAUDE_KEY（2026-10-05 起是只开通 opus-5-5 的 key），
// APIMART_API_KEY 留给生图（gpt-image-2，快讯/博客封面）。没配 CLAUDE 专用 key 时退回通用 key。
const apimartKey = process.env.APIMART_CLAUDE_KEY || process.env.APIMART_API_KEY;
const APIMART = apimartKey
  ? {
      key: apimartKey,
      baseURL: process.env.APIMART_BASE_URL || "https://api.apimart.ai",
      label: "apimart",
      // 模型列表按顺序降级（401/404 "无权限/不可用"时换下一个）。APIMART_MODEL 可用逗号分隔覆盖。
      models: (process.env.APIMART_MODEL || "claude-opus-5-5,claude-sonnet-5-5,claude-opus-4-6").split(",").map((m) => m.trim()).filter(Boolean),
    }
  : null;

// 第一备用 flatrouter：OpenAI 兼容接口，只有 GPT（这个 key 开通了 gpt-6-astra / gpt-5.6-sol）。
// 2026-10-05 用户决定：Claude（aigocode）继续当主力，aigocode 不通时先切这里，再到 apimart。
const flatrouterKey = process.env.FLATROUTER_API_KEY;
const FLATROUTER = flatrouterKey
  ? {
      key: flatrouterKey,
      baseURL: (process.env.FLATROUTER_BASE_URL || "https://api.flatrouter.com/v1").replace(/\/v1\/?$/, ""),
      label: "flatrouter",
      type: "openai",
      models: (process.env.FLATROUTER_NEWS_MODELS || "gpt-6-astra,gpt-5.6-sol").split(",").map((m) => m.trim()).filter(Boolean),
    }
  : null;

// fallback 链：aigocode → flatrouter（GPT）→ apimart → 官方
const FALLBACKS = [FLATROUTER, APIMART, OFFICIAL].filter(Boolean);
let fallbackIdx = -1;
let activeClient = PROXY || FALLBACKS[0] || null;
if (!activeClient) {
  console.error("❌ 无可用 API 客户端（缺 ANTHROPIC_AUTH_TOKEN / FLATROUTER_API_KEY / APIMART_API_KEY / ANTHROPIC_API_KEY）");
  process.exit(1);
}

console.log(`🔌 API 端点：${activeClient.label} (${activeClient.baseURL})`);

/**
 * 直接调 Anthropic Messages HTTP API，硬超时 90s。
 * 兼容 aigocode 代理（同样的 HTTP 协议）。
 * 返回 { content, stop_reason, ... } 跟 SDK 一致的形状。
 */
// OpenAI 兼容通道（flatrouter）：把 Messages 请求转成 chat/completions，再把结果转回 Messages 的形状，下游解析不用改
async function callOpenAICompat({ key, baseURL }, body, timeoutMs) {
  const req = { model: body.model, max_tokens: body.max_tokens, messages: body.messages };   // thinking 参数 GPT 不认，丢掉
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify(req),
      signal: ctl.signal,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }
    const j = await res.json();
    const choice = j.choices?.[0] || {};
    return {
      content: [{ type: "text", text: choice.message?.content || "" }],
      stop_reason: choice.finish_reason === "length" ? "max_tokens" : "end_turn",
      model: j.model,
    };
  } finally {
    clearTimeout(t);
  }
}

async function callClaudeRaw(client, body, timeoutMs = 90000) {
  if (client.type === "openai") return callOpenAICompat(client, body, Math.max(timeoutMs, 180000));
  const { key, baseURL } = client;
  // 本地兜底：某些网络下 Node/undici 连不上代理（UND_ERR_CONNECT_TIMEOUT），
  // 但 curl 正常。设 CLAUDE_TRANSPORT=curl 走 curl（仅本地手动跑用，生产不设此变量）。
  if (process.env.CLAUDE_TRANSPORT === "curl") {
    const { execFileSync } = await import("node:child_process");
    const out = execFileSync(
      "curl",
      [
        "-sS", "--max-time", String(Math.ceil(timeoutMs / 1000)),
        `${baseURL}/v1/messages`,
        "-H", `x-api-key: ${key}`,
        "-H", "anthropic-version: 2023-06-01",
        "-H", "content-type: application/json",
        "-d", "@-",
      ],
      { input: JSON.stringify(body), maxBuffer: 50 * 1024 * 1024, encoding: "utf-8" }
    );
    const parsed = JSON.parse(out);
    if (parsed.type === "error") {
      throw new Error(`API error: ${JSON.stringify(parsed.error).slice(0, 300)}`);
    }
    return parsed;
  }
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseURL}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}
const parser = new Parser({ timeout: 20000 });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("✅ Supabase connected");
} else {
  console.log("⚠️  Supabase not configured, skipping DB write");
}

// ─── Step 1: 采集 RSS ────────────────────────────────

async function fetchAllFeeds() {
  const allItems = [];

  for (const feed of RSS_FEEDS) {
    const windowDays = feed.days || 2; // 融资源等周更内容可指定更长窗口
    // 失败重试一次（rss-parser 偶发超时，融资源尤其不能漏）
    let result = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        result = await parser.parseURL(feed.url);
        break;
      } catch (err) {
        if (attempt === 2) {
          console.log(`  ⚠️  ${feed.name}: failed (${err.message})`);
        } else {
          await sleep(1500);
        }
      }
    }
    if (!result) continue;

    const recent = (result.items || [])
      .filter((item) => {
        try {
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          if (isNaN(pubDate.getTime())) return true; // 日期无效则保留
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - windowDays);
          return pubDate >= cutoff;
        } catch {
          return true; // 解析失败则保留
        }
      })
      .slice(0, 5)
      .map((item) => ({
        title: item.title || "",
        link: item.link || "",
        snippet: (item.contentSnippet || item.content || "").slice(0, 500),
        source: feed.name,
        pubDate: item.pubDate || "",
      }));

    allItems.push(...recent);
    console.log(`  📡 ${feed.name}: ${recent.length} items`);
  }

  // 额外采集：HuggingFace Daily Papers（无 RSS，走 JSON API）
  try {
    const res = await fetch("https://huggingface.co/api/daily_papers?limit=8", {
      headers: { "User-Agent": "Mozilla/5.0 jasonzhu-ai-news-bot" },
    });
    if (res.ok) {
      const papers = await res.json();
      const hfItems = (papers || []).slice(0, 8).map((p) => ({
        title: p.title || p.paper?.title || "",
        link: p.paper?.id ? `https://huggingface.co/papers/${p.paper.id}` : "",
        snippet: (p.summary || p.paper?.ai_summary || "").slice(0, 500),
        source: "HuggingFace Papers",
        pubDate: p.publishedAt || p.paper?.publishedAt || "",
      })).filter((it) => it.title && it.link);
      allItems.push(...hfItems);
      console.log(`  📡 HuggingFace Papers: ${hfItems.length} items`);
    } else {
      console.log(`  ⚠️  HuggingFace Papers: HTTP ${res.status}`);
    }
  } catch (err) {
    console.log(`  ⚠️  HuggingFace Papers: failed (${err.message})`);
  }

  console.log(`\n📥 Total raw items: ${allItems.length}`);
  return allItems;
}

// ─── 跨天去重：读最近 N 天已发标题 ──────────────────

function getRecentTitles(days = 3) {
  const newsDir = path.join(process.cwd(), "src/content/news");
  if (!fs.existsSync(newsDir)) return [];
  const titles = [];
  const today = new Date(TODAY);
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    const file = path.join(newsDir, `${iso}.md`);
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf-8");
    const matches = [...content.matchAll(/^###\s+(.+)$/gm)];
    for (const m of matches) {
      titles.push({ date: iso, title: m[1].trim() });
    }
  }
  return titles;
}

// 读最近 N 天融资速递里的公司名，用于融资段跨天去重
function getRecentFundingCompanies(days = 4) {
  const newsDir = path.join(process.cwd(), "src/content/news");
  if (!fs.existsSync(newsDir)) return [];
  const names = new Set();
  const today = new Date(TODAY);
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    const file = path.join(newsDir, `${iso}.md`);
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf-8");
    const seg = content.split(/###\s*💰[^\n]*融资速递/)[1];
    if (!seg) continue;
    for (const m of seg.matchAll(/^-\s+\*\*(?:\[([^\]]+)\]|([^*·]+))/gm)) {
      const name = (m[1] || m[2] || "").trim();
      if (name) names.add(name);
    }
  }
  return [...names];
}

// ─── Step 2: Claude 筛选 + 摘要 ─────────────────────

function buildCurationPrompt(rawItems) {
  const itemsText = rawItems
    .map(
      (item, i) =>
        `[${i}] ${item.title}\n    来源: ${item.source}\n    链接: ${item.link}\n    摘要: ${item.snippet}`
    )
    .join("\n\n");

  const recentTitles = getRecentTitles(3);
  const dedupBlock = recentTitles.length > 0
    ? `\n## 过去 3 天已经发过的标题（务必避开同一主题/同一新闻，不要重复！）
${recentTitles.map((t) => `- [${t.date}] ${t.title}`).join("\n")}

如果同一新闻今天又被 RSS 推上来，你必须跳过，或换一个全新的角度（例如 follow-up 数据、社区反应、对比观点），否则订阅者会看到重复内容感到失望。\n`
    : "";

  const recentFunding = getRecentFundingCompanies(4);
  const fundingDedupBlock = recentFunding.length > 0
    ? `\n## 最近几天已报过的融资公司（融资速递不要再放这些，除非有全新一轮/估值变化）\n${recentFunding.map((n) => `- ${n}`).join("\n")}\n`
    : "";

  const prompt = `你是 JasonZhu.AI 的 AI 快讯编辑。从以下原始新闻中筛选出 6-8 条最值得关注的，生成结构化快讯。

## 筛选标准（优先级从高到低）
1. Claude Code / Skills / MCP 相关更新（归类：Skills 生态）
2. 出海 SaaS / 独立开发者增长案例（归类：出海实战）
3. AI 赚钱案例 / MRR 突破 / 变现策略（归类：变现案例）
4. 主流 AI 工具重大更新 — ChatGPT/Claude/Cursor/Gemini 等（归类：AI 工具动态）
5. AI 行业重大事件（归类：AI 工具动态）
6. 来自 HuggingFace Papers 的重要研究突破或新模型论文（归类：AI 论文）—— 注意：摘要要把学术黑话翻译成"为什么对开发者重要"

## 排除标准
- 纯营销推广内容
- 无实质更新的水文
- 与 AI 无关的内容
${dedupBlock}${fundingDedupBlock}
## 原始内容
${itemsText}

## 额外任务：AI 融资速递
从原始内容里**单独**挑出 0-5 条 **AI 相关的真实资金事件**（关键词：raised / Series / funding / valuation / seed / IPO priced / acquires / acquisition / M&A）。
- **只收「钱真的发生了」的事件**：①完成融资 ②IPO 定价/上市 ③基金 close ④**已完成的收购/并购（acquisition / acquires / M&A）**——这些都算。**只有撤回/搁置/传闻/被叫停的交易不算**（那些该进 items，不进 funding）。
- **从「本周最大融资榜」「Biggest Funding Rounds」这类聚合贴里，要主动抽出领头的具体 AI 公司**（如标题里写「Odyssey Leads With \$310M」就抽 Odyssey \$310M），不要因为它是榜单就跳过。
- 必须是 AI 公司或 AI 业务相关（纯传统 SaaS 融资不要）
- **绝对不要和今天上面的 items 重复**：同一家公司/同一事件只要已经作为今天的某条 item 出现，就**绝不**再放进 funding（哪怕它是融资/IPO 也不行——已经被报道过就够了，不要同一天讲两遍）。
- **不要重复最近几天已报过的融资**（见下方「最近融资过的公司」清单），除非有全新的实质进展（如估值再变、新一轮）。
- 宁缺毋滥：当天没有符合标准的新融资，就给空数组 []，**绝不靠重复旧闻或塞撤回交易来凑数**。
- 信息缺失就尽量从标题和摘要里推断，推断不出来字段就留空字符串

## 输出格式（严格 JSON）
{
  "items": [
    {
      "title": "简洁有力的中文标题（15-25字）",
      "titleEn": "Concise English title (5-12 words)",
      "source": "来源名称",
      "category": "Skills 生态 | 出海实战 | AI 工具动态 | 变现案例 | AI 论文",
      "url": "原始链接",
      "summary": "一段话中文摘要（50-100字），说清楚是什么+为什么重要",
      "summaryEn": "English summary (40-70 words): what happened + why it matters"
    }
  ],
  "funding": [
    {
      "company": "公司名（保留英文原名）",
      "round": "轮次，如 Seed / Series A / Series B / Series C / Acquisition / IPO",
      "amount": "金额，如 $100M / $1.2B（没披露写 'undisclosed'）",
      "valuation": "估值，如 $5B（没披露留空字符串）",
      "investors": "领投/主要投资方（多个用顿号分隔，没披露留空字符串）",
      "url": "原始链接",
      "pitch": "一句话产品定位 + 为什么值得关注（30-50字中文）"
    }
  ],
  "jasonSays": "一句话个人点评，关于今天最值得关注的事（30-60字，有态度、不官腔）",
  "jasonSaysEn": "English version of jasonSays (one sentence, same attitude)"
}

只输出 JSON，不要其他内容。funding 数组如果当天没有合适的融资新闻就给空数组 []。`;
  return prompt;
}

async function curateWithClaude(rawItems) {
  const prompt = buildCurationPrompt(rawItems);


  // 重试机制：最多 6 次（aigocode 中转站不稳定，524 时拉长等待 + 第 2 次起关掉 thinking 降低上游耗时）
  const MAX_RETRIES = 6;
  // 默认关 thinking：news digest 不需要复杂推理；
  // 而且 aigocode 代理在 thinking+text 混合输出时常截断 text（4/23 cron 6 次全挂在 ~300 字符 JSON 截断）
  let disableThinking = true;
  // Model fallback chain: 代理对模型名敏感，400 model not supported 时自动降级
  const modelChain = process.env.CLAUDE_MODEL
    ? [process.env.CLAUDE_MODEL]
    : ["claude-opus-5-5", "claude-sonnet-5", "claude-opus-5", "claude-sonnet-4-6", "claude-sonnet-4-5"];
  let modelIdx = 0;
  let usingFallback = false;
  // 坏输出（空文本/非 JSON/JSON 解析失败）连续 2 次 → 切下一个 provider。
  // 7/14 教训：aigocode 正常返回 end_turn 但 JSON 全是坏的（值缺引号之类），
  // 光靠重试同一家 6 次全废，得换后端。
  let badOutputCount = 0;
  const failoverOnBadOutput = () => {
    badOutputCount++;
    if (badOutputCount >= 2 && fallbackIdx < FALLBACKS.length - 1) {
      fallbackIdx++;
      activeClient = FALLBACKS[fallbackIdx];
      usingFallback = true;
      modelIdx = 0;
      badOutputCount = 0;
      console.log(`  🔀 连续坏输出 → 切换到 ${activeClient.label} (${(activeClient.models || modelChain)[0]})`);
    }
  };
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (!activeClient) {
      throw new Error("No available API client");
    }
    try {
      // 客户端自带模型列表优先（apimart），否则走 modelChain
      const chain = activeClient.models || modelChain;
      const currentModel = chain[Math.min(modelIdx, chain.length - 1)];
      console.log(`  🔄 Claude API 调用 (attempt ${attempt}/${MAX_RETRIES} [${activeClient.label}${disableThinking ? ", no-thinking" : ""}, ${currentModel}])...`);
      const requestParams = {
        model: currentModel,
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      };
      if (!disableThinking) {
        requestParams.thinking = { type: "enabled", budget_tokens: 5000 };
      }
      const response = await callClaudeRaw(activeClient, requestParams, 90000);

      console.log(`  📋 Response stop_reason: ${response.stop_reason}, content blocks: ${response.content?.length || 0}`);

      if (!response.content || !response.content[0]) {
        console.error(`  ⚠️  Attempt ${attempt}: empty response`, JSON.stringify(response).slice(0, 500));
        if (attempt < MAX_RETRIES) {
          await sleep(5000 * attempt);
          continue;
        }
        throw new Error("Empty response from Claude API after all retries");
      }

      // 尝试从所有 content blocks 中提取 text
      let text = "";
      for (const block of response.content) {
        if (block.type === "text" && block.text) {
          text += block.text;
        } else if (typeof block === "string") {
          text += block;
        }
      }
      text = text.trim();

      console.log(`  📝 Text length: ${text.length}, block types: ${response.content.map(b => b.type || 'unknown').join(',')}`);
      if (text.length > 0) console.log(`  📝 First 100 chars: ${text.slice(0, 100)}`);

      if (!text) {
        // 如果 stop_reason 是 max_tokens，说明输出被截断，增加 token 不够
        if (response.stop_reason === "max_tokens") {
          console.error(`  ⚠️  Attempt ${attempt}: stop_reason=max_tokens but text empty — proxy may be returning encrypted content`);
        }
        console.error(`  ⚠️  Attempt ${attempt}: empty text. Content keys: ${JSON.stringify(Object.keys(response.content[0] || {}))}`);
        if (attempt < MAX_RETRIES) {
          failoverOnBadOutput();
          await sleep(5000 * attempt);
          continue;
        }
        throw new Error("Claude returned empty text after all retries");
      }

      // 提取 JSON（可能被 ```json 包裹）
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(`  ⚠️  Attempt ${attempt}: no JSON object found — ${text.slice(0, 100)}`);
        if (attempt < MAX_RETRIES) {
          failoverOnBadOutput();
          await sleep(5000 * attempt);
          continue;
        }
        throw new Error("Claude response is not valid JSON: " + text.slice(0, 200));
      }

      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseErr) {
        // 如果 JSON 被截断（max_tokens），尝试修复
        console.error(`  ⚠️  Attempt ${attempt}: JSON parse error — ${parseErr.message}`);
        if (response.stop_reason === "max_tokens") {
          console.log(`  🔧 Trying to fix truncated JSON...`);
          // 尝试截取到最后一个完整 item 的 }
          const lastCompleteItem = jsonMatch[0].lastIndexOf('}');
          if (lastCompleteItem > 0) {
            const fixed = jsonMatch[0].slice(0, lastCompleteItem + 1) + ']}';
            try {
              const result = JSON.parse(fixed);
              if (result.items && result.items.length >= 3) {
                console.log(`  ✅ Fixed! Got ${result.items.length} items`);
                return result;
              }
            } catch { /* continue to retry */ }
          }
        }
        if (attempt < MAX_RETRIES) {
          failoverOnBadOutput();
          await sleep(5000 * attempt);
          continue;
        }
        throw parseErr;
      }
    } catch (err) {
      const errMsg = err.message || String(err);
      console.error(`  ⚠️  Attempt ${attempt} failed: ${errMsg}`);

      // 上游超时/网关错误（任何 5xx / 524 / 连接错误 / 网关返回 HTML）：
      const isUpstreamTimeout =
        /HTTP 5\d\d/.test(errMsg) ||       // HTTP 500~599（含 aigocode 的 "HTTP 502: <!DOCTYPE html>"）
        /\berror code: 5\d\d/.test(errMsg) ||
        errMsg.includes("524") ||
        errMsg.includes("ETIMEDOUT") ||
        errMsg.includes("ECONNRESET") ||
        errMsg.includes("fetch failed") ||
        errMsg.includes("Unexpected token") ||  // curl 拿到 HTML 错误页，JSON.parse 失败
        errMsg.includes("origin web server timed out");

      // 代理账号池干涸：no available accounts / 503 → 立即切到官方 Anthropic
      const isProxyDry =
        errMsg.includes("no available accounts") ||
        errMsg.includes("No available accounts") ||
        (errMsg.includes("503") && !usingFallback);

      // Model 不被代理支持：自动降级到下一个候选 model
      // 9/29–9/30 教训：aigocode 下线旧模型后返回 404 "Model ... is not available for this group"，
      // 原条件只认 400，命中不了，在同一个模型上空转 6 次，两天三档 cron 全军覆没。
      const isModelUnsupported =
        /HTTP (400|401|403|404)/.test(errMsg) &&
        /model is not supported|model_not_found|not_found_error|is not available for this group|does not exist|does not have access to model|is not allowed for this API key/i.test(errMsg);

      // key 失效/无权限（403/401）：换 key 重试没用，直接切下一个 provider
      // 「没有某个模型的权限」是模型问题不是 key 问题：先在本通道内换模型，不要直接跳 provider
      const isAuthError = /HTTP (401|403)/.test(errMsg) && !/does not have access to model|is not allowed for this API key/i.test(errMsg);
      // 上游限流：2026-10-04 aigocode 一直 429，同一家重试没用，直接切下一个通道
      const isRateLimited = /HTTP 429/.test(errMsg);

      // aigocode 账号干涸 / 502 网关 / 硬超时 / key 无权限 / 429 限流 → 立即切下一个 provider（flatrouter → apimart → 官方）
      const shouldFailover =
        isProxyDry || errMsg.includes("aborted") || isUpstreamTimeout || isAuthError || isRateLimited;
      if (shouldFailover && fallbackIdx < FALLBACKS.length - 1) {
        fallbackIdx++;
        activeClient = FALLBACKS[fallbackIdx];
        usingFallback = true;
        modelIdx = 0;
        badOutputCount = 0;
        console.log(`  🔀 ${errMsg.slice(0, 45)} → 切换到 ${activeClient.label} (${(activeClient.models || modelChain)[0]})`);
        await sleep(2000);
        continue;
      }

      const activeChain = activeClient.models || modelChain;
      if (isModelUnsupported && modelIdx < activeChain.length - 1) {
        modelIdx++;
        attempt--; // 换模型不算一次失败
        console.log(`  🔀 Model 不被支持，降级到 ${activeChain[modelIdx]}`);
        continue;
      }

      if (attempt >= MAX_RETRIES) throw err;

      if (isUpstreamTimeout) {
        if (!disableThinking) {
          console.log(`  🔀 上游超时 (${errMsg.slice(0, 80)}...)，关闭 thinking 减轻负担`);
          disableThinking = true;
        }
        const waitMs = 30000 * attempt; // 30s, 60s, 90s, 120s, 150s
        console.log(`  ⏳ 等待 ${waitMs / 1000}s 让代理上游恢复...`);
        await sleep(waitMs);
      } else {
        await sleep(3000 * attempt);
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Step 3: 写入 Supabase ──────────────────────────

async function writeToSupabase(digest) {
  if (!supabase) return;

  try {
    // Upsert digest
    const { error: digestErr } = await supabase
      .from("news_digests")
      .upsert(
        { date: TODAY, title: `AI 快讯 · ${MONTH_DAY}`, jason_says: digest.jasonSays },
        { onConflict: "date" }
      );
    if (digestErr) throw digestErr;

    // Delete existing items for today (in case of re-run)
    await supabase.from("news_items").delete().eq("digest_date", TODAY);

    // Insert items
    const items = digest.items.map((item, idx) => ({
      digest_date: TODAY,
      title: item.title,
      source: item.source,
      category: item.category,
      url: item.url,
      summary: item.summary,
      sort_order: idx,
    }));

    const { error: itemsErr } = await supabase.from("news_items").insert(items);
    if (itemsErr) throw itemsErr;

    console.log(`✅ Supabase: wrote ${items.length} items for ${TODAY}`);
  } catch (err) {
    console.error(`❌ Supabase write failed: ${err.message}`);
  }
}

// ─── Step 4: 生成 MDX 文件 ──────────────────────────

function generateMDX(digest) {
  const esc = (s) => (s || "").replace(/"/g, '\\"');
  const lines = [
    "---",
    `date: "${TODAY}"`,
    `title: "AI 快讯 · ${MONTH_DAY}"`,
    `jasonSays: "${esc(digest.jasonSays)}"`,
    ...(digest.jasonSaysEn ? [`jasonSaysEn: "${esc(digest.jasonSaysEn)}"`] : []),
    "---",
    "",
  ];

  for (const item of digest.items) {
    lines.push(`### ${item.title}`);
    lines.push("");
    lines.push(`- **板块**：${item.category}`);
    lines.push(`- **来源**：${item.source}`);
    lines.push(`- **链接**：${item.url}`);
    if (item.titleEn) lines.push(`- **TitleEN**：${item.titleEn}`);
    lines.push("");
    lines.push(item.summary);
    if (item.summaryEn) {
      lines.push("");
      lines.push(`- **EN**：${item.summaryEn}`);
    }
    lines.push("");
  }

  // 融资速递模块
  if (Array.isArray(digest.funding) && digest.funding.length > 0) {
    lines.push("### 💰 AI 融资速递");
    lines.push("");
    for (const f of digest.funding) {
      const meta = [f.round, f.amount, f.valuation && `估值 ${f.valuation}`]
        .filter(Boolean)
        .join(" · ");
      const company = f.url ? `[${f.company}](${f.url})` : f.company;
      lines.push(`- **${company}** · ${meta}`);
      if (f.investors) lines.push(`  - 投资方：${f.investors}`);
      if (f.pitch) lines.push(`  - ${f.pitch}`);
    }
    lines.push("");
  }

  const content = lines.join("\n");
  const outputDir = path.join(process.cwd(), "src/content/news");
  const outputPath = path.join(outputDir, `${TODAY}.md`);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, content, "utf-8");
  console.log(`✅ MDX: ${outputPath}`);

  return outputPath;
}


// ─── Step 2b: 融资速递复核（代码层，Claude 生成之后、写入之前）─────────
// 1) 跨天去重：近 7 天报过的同一公司、同一金额 → 删（以前只在 prompt 里提醒，实际常隔天重复）
// 2) 与当天正文重复：公司名出现在某条 item 标题里 → 删
// 3) Jev 判断是否真的已发生：传闻/洽谈/计划/未完成 IPO 合计 ≥0.7 → 删。
//    VC 基金募资、只有估值变化/老股转让按编辑规则保留。2026-10-03 用 139 张历史卡评测 AUC 0.996、阈值 0.7 零误伤。
//    Jev 不可用时这一步跳过，不影响出稿。
const normCo = (s) => String(s || "").toLowerCase().replace(/[（(].*?[)）]/g, "").replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
const normAmt = (s) => String(s || "").toLowerCase().replace(/[^0-9.bmk亿万]/g, "");

function getRecentFundingCards(days = 4) {
  const newsDir = path.join(process.cwd(), "src/content/news");
  const out = [];
  for (let i = 1; i <= days; i++) {
    const d = new Date(TODAY); d.setDate(d.getDate() - i);
    const file = path.join(newsDir, `${d.toISOString().split("T")[0]}.md`);
    if (!fs.existsSync(file)) continue;
    const seg = fs.readFileSync(file, "utf-8").split(/###\s*💰[^\n]*融资速递/)[1];
    if (!seg) continue;
    for (const m of seg.matchAll(/^-\s+\*\*(?:\[([^\]]+)\]\([^)]*\)|([^*]+))\*\*\s*·?\s*(.*)$/gm)) {
      out.push({ company: normCo(m[1] || m[2]), meta: m[3] || "" });
    }
  }
  return out;
}

async function jevFundingKinds(cards) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || !cards.length) return null;
  const KIND = {
    completed_funding: "The company has raised (closed or officially announced) a funding round, including debt or convertible financing",
    completed_acquisition: "An acquisition that has been agreed or completed",
    ipo_completed: "The company has listed / priced its IPO and raised the money",
    ipo_pending: "An IPO that is planned, filed or launched but not yet priced",
    rumor_or_talks: "Only reported, rumored, in talks, seeking, planning or expected to raise; not confirmed as done",
    vc_fund: "A venture capital firm closed or raised its own fund, not a startup raising money",
    secondary_or_valuation: "A tender offer, share sale by existing holders, or a valuation change without new money raised",
  };
  const lines = ["Funding cards from a daily AI news digest. The source URL slug often states what happened. Judge each card on its own.", ""];
  const questions = {};
  cards.forEach((c, i) => {
    const k = `c${i + 1}`;
    lines.push(`${k}: company=${c.company} | round=${c.round || ""} | amount=${c.amount || ""} | valuation=${c.valuation || ""} | investors=${c.investors || ""} | note=${String(c.pitch || "").replace(/\s+/g, " ")} | source=${c.url || ""}`);
    questions[`${k}_kind`] = { type: "choice", instructions: `What does card ${k} describe?`, criteria: KIND };
  });
  const body = JSON.stringify({ model: process.env.JEV_MODEL || "~typesafe/jev-latest", state: lines.join("\n"), questions });
  let text;
  if (process.env.CLAUDE_TRANSPORT === "curl") {
    const { execFileSync } = await import("node:child_process");
    const os = await import("node:os");
    const tmp = path.join(os.tmpdir(), `jev-fund-${process.pid}.json`);
    fs.writeFileSync(tmp, body, { mode: 0o600 });
    try {
      // 密钥走 stdin 的 curl 配置，不进命令行
      text = execFileSync("curl", ["-sS", "-m", "90", "-K", "-", "--data-binary", `@${tmp}`, "https://openrouter.ai/api/alpha/decisions"],
        { input: `header = "Authorization: Bearer ${key}"\nheader = "Content-Type: application/json"\n`, encoding: "utf-8", maxBuffer: 16e6 });
    } finally { fs.rmSync(tmp, { force: true }); }
  } else {
    const res = await fetch("https://openrouter.ai/api/alpha/decisions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body, signal: AbortSignal.timeout(90000) });
    if (!res.ok) throw new Error(`Jev HTTP ${res.status}`);
    text = await res.text();
  }
  const o = JSON.parse(text);
  if (!o.answers) throw new Error(`Jev bad response: ${text.slice(0, 120)}`);
  return cards.map((_, i) => o.answers[`c${i + 1}_kind`]);
}

async function reviewFunding(digest) {
  if (!Array.isArray(digest.funding) || !digest.funding.length) return;
  const before = digest.funding.length;
  const recent = getRecentFundingCards(7);
  const itemTitles = (digest.items || []).map((i) => normCo(`${i.title} ${i.titleEn || ""}`));
  const kept = [];
  for (const f of digest.funding) {
    const co = normCo(f.company);
    const amt = normAmt(f.amount);
    const dupDay = co.length >= 3 && recent.find((r) => r.company === co && (!amt || normAmt(r.meta).includes(amt)));
    if (dupDay) { console.log(`  🧹 融资去重（近 7 天已报）：${f.company} ${f.amount || ""}`); continue; }
    if (co.length >= 3 && itemTitles.some((t) => t.includes(co))) { console.log(`  🧹 融资去重（与当天正文重复）：${f.company}`); continue; }
    kept.push(f);
  }
  digest.funding = kept;
  try {
    const kinds = await jevFundingKinds(kept);
    if (kinds) {
      digest.funding = kept.filter((f, i) => {
        const p = kinds[i]?.probabilities || {};
        const notYet = (p.rumor_or_talks || 0) + (p.ipo_pending || 0);
        if (notYet >= 0.7) { console.log(`  🧹 融资复核（Jev：${kinds[i].choice} ${notYet.toFixed(2)}，尚未发生）：${f.company}`); return false; }
        return true;
      });
    }
  } catch (e) {
    console.log(`  ⚠️ Jev 融资复核跳过：${String(e.message).slice(0, 100)}`);
  }
  console.log(`  💰 融资速递：${before} → ${digest.funding.length} 条`);
}

// ─── Main ───────────────────────────────────────────

async function main() {
  console.log(`\n🗞️  AI 快讯采集 — ${TODAY}\n`);

  // 幂等：今天已生成且 ≥3 条新闻就跳过（用于 cron 重试不覆盖正确产出）
  const todayFile = path.join(process.cwd(), "src/content/news", `${TODAY}.md`);
  const force = process.argv.includes("--force");
  if (!force && fs.existsSync(todayFile)) {
    const existing = fs.readFileSync(todayFile, "utf-8");
    const itemCount = (existing.match(/^###\s+/gm) || []).length;
    if (itemCount >= 3) {
      console.log(`✅ 今天 (${TODAY}) 已有 ${itemCount} 条快讯，跳过。如需重新生成请加 --force`);
      return;
    }
  }

  // Step 1: 采集
  console.log("📡 Step 1: 采集 RSS feeds...");
  const rawItems = await fetchAllFeeds();

  if (rawItems.length === 0) {
    console.log("⚠️  No items collected, generating fallback...");
    // 即使没采集到也生成一个空框架
    const fallback = {
      items: [],
      jasonSays: "今日无重大 AI 新闻，保持关注。",
    };
    generateMDX(fallback);
    return;
  }

  // 手动模式 A：只采集，把原始 items + 给 Claude 的 prompt 落盘后退出。
  // 断供应急：由人（或会话里的 Claude）离线完成筛选摘要，再用 INJECT_JSON 续跑。
  if (process.env.DUMP_ITEMS) {
    const dump = { date: TODAY, rawItems, prompt: buildCurationPrompt(rawItems) };
    fs.writeFileSync(process.env.DUMP_ITEMS, JSON.stringify(dump, null, 1), "utf-8");
    console.log(`📤 已导出 ${rawItems.length} 条原始 items + prompt 到 ${process.env.DUMP_ITEMS}`);
    return;
  }

  // Step 2: Claude 筛选
  console.log("\n🤖 Step 2: Claude 筛选 + 摘要...");
  // 手动模式 B：INJECT_JSON 指向人工完成的 digest JSON，跳过 API 调用，后续管线原样走
  const digest = process.env.INJECT_JSON
    ? JSON.parse(fs.readFileSync(process.env.INJECT_JSON, "utf-8"))
    : await curateWithClaude(rawItems);
  console.log(`  筛选出 ${digest.items.length} 条快讯`);
  console.log(`  Jason 说: ${digest.jasonSays}`);
  await reviewFunding(digest);

  // 链接清洗：nitter.net 已死链
  // ⚠️ nitter 部分 fork 给出的 status ID 是合成 ID（非真实 X tweet ID），
  // 直接重写到 x.com/<user>/status/<id> 会得到 404 死链。
  // 兜底策略：rewrite 后用 fxtwitter API 验证真实性，404 的退化为 profile URL。
  for (const item of digest.items) {
    if (!item.url) continue;
    const m = item.url.match(/https?:\/\/nitter\.net\/([^/]+)\/status\/(\d+)#?m?/);
    if (m) {
      const [, user, id] = m;
      try {
        const r = await fetch(`https://api.fxtwitter.com/${user}/${id}`);
        const data = await r.json();
        item.url = data?.code === 200
          ? `https://x.com/${user}/status/${id}`
          : `https://x.com/${user}`;
      } catch {
        item.url = `https://x.com/${user}`; // 网络失败保守退化
      }
    } else {
      item.url = item.url.replace(/#m$/, "");
    }
  }

  // Step 3: 写入 Supabase
  console.log("\n💾 Step 3: 写入 Supabase...");
  await writeToSupabase(digest);

  // Step 4: 生成 MDX
  console.log("\n📝 Step 4: 生成 MDX...");
  generateMDX(digest);

  // Step 5: 重新生成 manifest
  console.log("\n🔄 Step 5: 更新 news.json...");
  const { execSync } = await import("child_process");
  execSync("node scripts/generate-news.mjs", { stdio: "inherit" });

  console.log("\n✅ 采集完成！");
}

main()
  .then(() => {
    // 强制退出：Anthropic SDK / Supabase 客户端的 keep-alive HTTP socket 会让 Node 事件循环挂起，
    // 之前每天浪费 ~20 min runner 时间在 25 min 超时上。main() 跑完所有正事后直接 exit 0。
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Fatal error:", err.message);
    process.exit(1);
  });
