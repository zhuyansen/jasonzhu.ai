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
// 用自己的模型名（apimart 上是 claude-opus-4-6）。
const apimartKey = process.env.APIMART_API_KEY;
const APIMART = apimartKey
  ? {
      key: apimartKey,
      baseURL: process.env.APIMART_BASE_URL || "https://api.apimart.ai",
      label: "apimart",
      model: process.env.APIMART_MODEL || "claude-opus-4-6",
    }
  : null;

// fallback 链：aigocode → apimart → 官方
const FALLBACKS = [APIMART, OFFICIAL].filter(Boolean);
let fallbackIdx = -1;
let activeClient = PROXY || FALLBACKS[0] || null;
if (!activeClient) {
  console.error("❌ 无可用 API 客户端（缺 ANTHROPIC_AUTH_TOKEN / APIMART_API_KEY / ANTHROPIC_API_KEY）");
  process.exit(1);
}

console.log(`🔌 API 端点：${activeClient.label} (${activeClient.baseURL})`);

/**
 * 直接调 Anthropic Messages HTTP API，硬超时 90s。
 * 兼容 aigocode 代理（同样的 HTTP 协议）。
 * 返回 { content, stop_reason, ... } 跟 SDK 一致的形状。
 */
async function callClaudeRaw({ key, baseURL }, body, timeoutMs = 90000) {
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

async function curateWithClaude(rawItems) {
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

  // 重试机制：最多 6 次（aigocode 中转站不稳定，524 时拉长等待 + 第 2 次起关掉 thinking 降低上游耗时）
  const MAX_RETRIES = 6;
  // 默认关 thinking：news digest 不需要复杂推理；
  // 而且 aigocode 代理在 thinking+text 混合输出时常截断 text（4/23 cron 6 次全挂在 ~300 字符 JSON 截断）
  let disableThinking = true;
  // Model fallback chain: 代理对模型名敏感，400 model not supported 时自动降级
  const modelChain = process.env.CLAUDE_MODEL
    ? [process.env.CLAUDE_MODEL]
    : ["claude-sonnet-4-6", "claude-sonnet-4-5", "claude-opus-4-5", "claude-3-5-sonnet-latest"];
  let modelIdx = 0;
  let usingFallback = false;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (!activeClient) {
      throw new Error("No available API client");
    }
    try {
      // 客户端自带模型名优先（apimart 用 opus-4-6），否则走 modelChain
      const currentModel = activeClient.model || modelChain[modelIdx];
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
      const isModelUnsupported =
        errMsg.includes("400") &&
        (errMsg.includes("model is not supported") || errMsg.includes("model_not_found"));

      // aigocode 账号干涸 / 502 网关 / 硬超时 → 立即切下一个 provider（apimart → 官方）
      const shouldFailover =
        isProxyDry || errMsg.includes("aborted") || isUpstreamTimeout;
      if (shouldFailover && fallbackIdx < FALLBACKS.length - 1) {
        fallbackIdx++;
        activeClient = FALLBACKS[fallbackIdx];
        usingFallback = true;
        modelIdx = 0;
        console.log(`  🔀 ${errMsg.slice(0, 45)} → 切换到 ${activeClient.label} (${activeClient.model || modelChain[0]})`);
        await sleep(2000);
        continue;
      }

      if (isModelUnsupported && modelIdx < modelChain.length - 1) {
        modelIdx++;
        console.log(`  🔀 Model 不被代理支持，降级到 ${modelChain[modelIdx]}`);
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

  // Step 2: Claude 筛选
  console.log("\n🤖 Step 2: Claude 筛选 + 摘要...");
  const digest = await curateWithClaude(rawItems);
  console.log(`  筛选出 ${digest.items.length} 条快讯`);
  console.log(`  Jason 说: ${digest.jasonSays}`);

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
