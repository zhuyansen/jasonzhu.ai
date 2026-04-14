/**
 * AI 快讯自动采集管线
 *
 * 流程：RSS/网页采集 → Claude 摘要分类 → 写入 Supabase → 生成 MDX → commit 触发部署
 *
 * 环境变量：
 *   ANTHROPIC_API_KEY       - Claude API 密钥
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
  { url: "https://www.anthropic.com/rss.xml", name: "Anthropic Blog" },
  { url: "https://openai.com/blog/rss.xml", name: "OpenAI Blog" },
  { url: "https://blog.google/technology/ai/rss/", name: "Google AI Blog" },
  { url: "https://vercel.com/atom", name: "Vercel Blog" },
  // Hacker News AI 相关
  { url: "https://hnrss.org/newest?q=AI+agent+OR+claude+OR+cursor+OR+MCP&count=15", name: "Hacker News" },
  // TechCrunch AI
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", name: "TechCrunch AI" },
];

const CATEGORIES = ["Skills 生态", "出海实战", "AI 工具动态"];

const TODAY = new Date().toISOString().split("T")[0];
const MONTH_DAY = (() => {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日`;
})();

// ─── 初始化 ─────────────────────────────────────────

const anthropic = new Anthropic();
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
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          return pubDate >= twoDaysAgo;
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
3. 主流 AI 工具重大更新 — ChatGPT/Claude/Cursor/Gemini 等（归类：AI 工具动态）
4. AI 行业重大事件或研究突破（归类：AI 工具动态）

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
      "category": "Skills 生态 | 出海实战 | AI 工具动态",
      "url": "原始链接",
      "summary": "一段话中文摘要（50-100字），说清楚是什么+为什么重要"
    }
  ],
  "jasonSays": "一句话个人点评，关于今天最值得关注的事（30-60字，有态度、不官腔）"
}

只输出 JSON，不要其他内容。`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  // 提取 JSON（可能被 ```json 包裹）
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude response is not valid JSON");

  return JSON.parse(jsonMatch[0]);
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
