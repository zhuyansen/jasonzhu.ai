#!/usr/bin/env node
// 基于当天 src/content/news/<date>.md 生成日报图片，保存到 public/news/<date>.png
// API: apimart gpt-image-2 (异步任务，submit -> poll -> download)
//
// 用法：node scripts/generate-news-image.mjs [YYYY-MM-DD]
// 默认：今天 (UTC+8)

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const APIMART_API_KEY = process.env.APIMART_API_KEY;
const APIMART_BASE = "https://api.apimart.ai";

if (!APIMART_API_KEY) {
  console.error("❌ APIMART_API_KEY not set");
  process.exit(1);
}

function todayCN() {
  // 北京时间日期
  const d = new Date(Date.now() + 8 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

const date = process.argv[2] || todayCN();
const mdPath = path.join("src/content/news", `${date}.md`);
const outDir = path.join("public/news");
const outPath = path.join(outDir, `${date}.png`);

console.log(`🎨 生成日报图：${date}`);

let raw;
try {
  raw = await fs.readFile(mdPath, "utf-8");
} catch {
  console.error(`❌ 找不到 ${mdPath}，跳过`);
  process.exit(0); // 不算 fatal，让 workflow 继续
}

const { data, content } = matter(raw);
const title = data.title || `AI 快讯 · ${date}`;
const jasonSays = data.jasonSays || "";

// 提取所有 ### 标题（item title）
const itemTitles = [...content.matchAll(/^###\s+(.+)$/gm)].map((m) => m[1].trim());
const top6 = itemTitles.slice(0, 6);

// 短日期 + vol（基于月日）
const [, mm, dd] = date.split("-");
const shortDate = `${parseInt(mm)}/${parseInt(dd)}`;
const vol = `VOL.${mm}${dd}`;

// 构造图像 prompt（参考截图风格：编辑式卡片、深蓝侧栏 + 米色底 + 红色编号 + JZ logo）
const itemsText = top6.map((t, i) => `${String(i + 1).padStart(2, "0")}. ${t}`).join("\n");

const prompt = `Editorial-style AI news brief card, portrait orientation, magazine layout.

LAYOUT:
- Left dark navy blue vertical sidebar (about 12% width) with vertical white text "AI NEWS BRIEF"
- Top-right floating circular avatar tag with "JasonZhu.AI" and subtitle "AI signal briefing"
- Top center-left: small red text "${shortDate}" with horizontal dashed line below it
- Hero title: huge bold black serif text "${shortDate}\\nAI 圈速览" (Chinese: AI roundup)
- Subtitle gray text: "今天最值得看的 ${top6.length} 个信号" (today's top ${top6.length} signals)
- Right side: light beige rounded circle badge "Who\\nnext?" in handwritten style
- Center body: numbered list with red two-digit numbers and dark gray short item titles, items separated by horizontal rule:
${itemsText}
- Bottom-left red square badge with white text "JZ" and small "${vol}"
- Bottom dark navy footer bar: left "DETAILS jasonzhu.ai/zh/news", right tagline "${jasonSays.slice(0, 30) || "下一个被抢购的 AI 工具会是谁？"}"

STYLE:
- Background: warm off-white / cream paper texture
- Accent colors: navy blue (#1B3A8A), warm red-orange (#D94B2B), soft cream (#F2EBDD)
- Typography: clean modern sans-serif for Chinese, serif for numbers, generous whitespace
- Editorial / financial-newsletter aesthetic, similar to Bloomberg or Monocle magazine
- Pure design layout — NO photos, NO illustrations, NO icons except the small avatar circle

The text content listed above MUST appear EXACTLY as written. Render Chinese characters cleanly without distortion.`;

console.log(`📝 Prompt 字符数: ${prompt.length}`);

// 1) Submit
const submitRes = await fetch(`${APIMART_BASE}/v1/images/generations`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${APIMART_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-image-2",
    prompt,
    size: "1024x1536", // portrait
    n: 1,
  }),
});

if (!submitRes.ok) {
  console.error(`❌ 提交失败 HTTP ${submitRes.status}: ${await submitRes.text()}`);
  process.exit(1);
}

const submitJson = await submitRes.json();
const taskId = submitJson?.data?.[0]?.task_id || submitJson?.data?.task_id;
if (!taskId) {
  console.error(`❌ 无 task_id: ${JSON.stringify(submitJson).slice(0, 300)}`);
  process.exit(1);
}
console.log(`📨 task_id: ${taskId}`);

// 2) Poll
let imageUrl = null;
const maxPolls = 30; // 30 * 10s = 5 min
for (let i = 1; i <= maxPolls; i++) {
  await new Promise((r) => setTimeout(r, 10000));
  const pollRes = await fetch(`${APIMART_BASE}/v1/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${APIMART_API_KEY}` },
  });
  const pollJson = await pollRes.json();
  const status = pollJson?.data?.status;
  const progress = pollJson?.data?.progress;
  console.log(`  ⏳ poll ${i}/${maxPolls}: status=${status} progress=${progress}`);
  if (status === "completed") {
    const urls = pollJson?.data?.result?.images?.[0]?.url;
    imageUrl = Array.isArray(urls) ? urls[0] : urls;
    break;
  }
  if (status === "failed" || status === "error") {
    console.error(`❌ 任务失败: ${JSON.stringify(pollJson).slice(0, 300)}`);
    process.exit(1);
  }
}

if (!imageUrl) {
  console.error(`❌ 超时未完成`);
  process.exit(1);
}

console.log(`🖼  图片 URL: ${imageUrl}`);

// 3) Download
const imgRes = await fetch(imageUrl);
if (!imgRes.ok) {
  console.error(`❌ 下载失败 HTTP ${imgRes.status}`);
  process.exit(1);
}
const buf = Buffer.from(await imgRes.arrayBuffer());
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(outPath, buf);
console.log(`✅ 已保存：${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
