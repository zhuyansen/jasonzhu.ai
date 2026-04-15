/**
 * AI 快讯自动采集管线
 *
 * 流程：RSS/网页采集 → Claude 摘要分类 → 写入 Supabase → 生成 MDX → commit 触发部署
 *
 * 环境变量：
 *   ANTHROPIC_AUTH_TOKEN     - Claude API 密钥（支持中转站）
 *   ANTHROPIC_BASE_URL       - API 地址（默认 https://api.aigocode.com）
 *   ANTHROPIC_API_KEY        - 备选：原生 Anthropic API 密钥
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase URL
 *   SUPABASE_SERVICE_KEY     - Supabase Service Role Key（写入权限）
 */

import Anthropic from "@anthropic-ai/sdk";
import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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
];

const CATEGORIES = ["Skills 生态", "出海实战", "AI 工具动态", "变现案例"];

const TODAY = new Date().toISOString().split("T")[0];
const MONTH_DAY = (() => {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日`;
})();

// ─── 初始化 ─────────────────────────────────────────

// 支持中转站（aigocode）和原生 Anthropic API
const apiKey = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.ANTHROPIC_BASE_URL || "https://api.aigocode.com";

if (!apiKey) {
  console.error("❌ Missing ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY");
  process.exit(1);
}

const anthropic = new Anthropic({
  apiKey,
  baseURL,
});
const parser = new Parser({ timeout: 10000 });

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
    try {
      const result = await parser.parseURL(feed.url);
      const recent = (result.items || [])
        .filter((item) => {
          // 只取最近 2 天的内容
          try {
            const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
            if (isNaN(pubDate.getTime())) return true; // 日期无效则保留
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            return pubDate >= twoDaysAgo;
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
    } catch (err) {
      console.log(`  ⚠️  ${feed.name}: failed (${err.message})`);
    }
  }

  console.log(`\n📥 Total raw items: ${allItems.length}`);
  return allItems;
}

// ─── Step 2: Claude 筛选 + 摘要 ─────────────────────

async function curateWithClaude(rawItems) {
  const itemsText = rawItems
    .map(
      (item, i) =>
        `[${i}] ${item.title}\n    来源: ${item.source}\n    链接: ${item.link}\n    摘要: ${item.snippet}`
    )
    .join("\n\n");

  const prompt = `你是 JasonZhu.AI 的 AI 快讯编辑。从以下原始新闻中筛选出 6-8 条最值得关注的，生成结构化快讯。

## 筛选标准（优先级从高到低）
1. Claude Code / Skills / MCP 相关更新（归类：Skills 生态）
2. 出海 SaaS / 独立开发者增长案例（归类：出海实战）
3. AI 赚钱案例 / MRR 突破 / 变现策略（归类：变现案例）
4. 主流 AI 工具重大更新 — ChatGPT/Claude/Cursor/Gemini 等（归类：AI 工具动态）
5. AI 行业重大事件或研究突破（归类：AI 工具动态）

## 排除标准
- 纯营销推广内容
- 无实质更新的水文
- 与 AI 无关的内容

## 原始内容
${itemsText}

## 输出格式（严格 JSON）
{
  "items": [
    {
      "title": "简洁有力的中文标题（15-25字）",
      "source": "来源名称",
      "category": "Skills 生态 | 出海实战 | AI 工具动态 | 变现案例",
      "url": "原始链接",
      "summary": "一段话中文摘要（50-100字），说清楚是什么+为什么重要"
    }
  ],
  "jasonSays": "一句话个人点评，关于今天最值得关注的事（30-60字，有态度、不官腔）"
}

只输出 JSON，不要其他内容。`;

  // 重试机制：最多 5 次（aigocode 中转站可能不稳定）
  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  🔄 Claude API 调用 (attempt ${attempt}/${MAX_RETRIES})...`);
      const response = await anthropic.messages.create({
        model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
        max_tokens: 16000,
        thinking: {
          type: "enabled",
          budget_tokens: 5000,
        },
        messages: [{ role: "user", content: prompt }],
      });

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
      if (attempt >= MAX_RETRIES) throw err;
      console.error(`  ⚠️  Attempt ${attempt} failed: ${err.message}`);
      await sleep(3000 * attempt);
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
  const lines = [
    "---",
    `date: "${TODAY}"`,
    `title: "AI 快讯 · ${MONTH_DAY}"`,
    `jasonSays: "${digest.jasonSays.replace(/"/g, '\\"')}"`,
    "---",
    "",
  ];

  for (const item of digest.items) {
    lines.push(`### ${item.title}`);
    lines.push("");
    lines.push(`- **板块**：${item.category}`);
    lines.push(`- **来源**：${item.source}`);
    lines.push(`- **链接**：${item.url}`);
    lines.push("");
    lines.push(item.summary);
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

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
