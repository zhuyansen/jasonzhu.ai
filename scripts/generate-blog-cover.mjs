#!/usr/bin/env node
// 给博客文章生成编辑式杂志风封面图（沿用日报封面视觉系统）
// 输出 1536x1024 横版（同时适合 OG card / 博客 hero）
//
// 用法：node scripts/generate-blog-cover.mjs <slug> [--landscape|--portrait]
// 示例：node scripts/generate-blog-cover.mjs wu-enda-prompting-module-2

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const APIMART_API_KEY = process.env.APIMART_API_KEY;
const APIMART_BASE = "https://api.apimart.ai";

if (!APIMART_API_KEY) {
  console.error("❌ APIMART_API_KEY not set");
  process.exit(1);
}

const slug = process.argv[2];
if (!slug) {
  console.error("用法: node scripts/generate-blog-cover.mjs <slug> [--portrait]");
  process.exit(1);
}
const portrait = process.argv.includes("--portrait");
const size = portrait ? "1024x1536" : "1536x1024";

const mdPath = path.join("src/content/blog", `${slug}.md`);
const outDir = path.join("public/blog", slug);
const outPath = path.join(outDir, "cover.png");

async function fetchWithTimeout(url, opts = {}, timeoutMs = 60000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

const GLOBAL_TIMEOUT = setTimeout(() => {
  console.error("❌ 全局超时 8min，放弃");
  process.exit(1);
}, 8 * 60 * 1000);
GLOBAL_TIMEOUT.unref();

let raw;
try {
  raw = await fs.readFile(mdPath, "utf-8");
} catch {
  console.error(`❌ 找不到 ${mdPath}`);
  process.exit(1);
}

const { data } = matter(raw);
const title = data.title || slug;
const excerpt = data.excerpt || "";
const category = data.category || "";

// 提取关键标题词（去掉冒号前缀，截短）
const shortTitle = title.replace(/^.*?[:：]\s*/, "").slice(0, 40);
const tagline = excerpt.slice(0, 50).replace(/[。.]/g, "");

console.log(`🎨 生成博客封面：${slug}`);
console.log(`📝 短标题: ${shortTitle}`);
console.log(`📐 尺寸: ${size}`);

const prompt = `Editorial-style blog cover, ${portrait ? "portrait" : "landscape"} orientation, magazine layout.

LAYOUT:
- Left dark navy blue vertical sidebar (about 10% width) with vertical white text "JASONZHU.AI / NOTES"
- Top-right floating circular badge with "JasonZhu.AI" and small subtitle "${category}"
- Hero title (very large, bold, black serif): "${shortTitle}"
- Subtitle below title (medium gray): "${tagline}"
- Center-bottom area: 3 horizontal red dashed dividers with small red labels "01 / 02 / 03" suggesting structured chapters
- Bottom-left red square badge with white text "JZ"
- Bottom dark navy footer bar: left "READ jasonzhu.ai/zh/blog", right small text "AI 提示词工程笔记"

STYLE:
- Background: warm off-white / cream paper texture
- Accent colors: navy blue (#1B3A8A), warm red-orange (#D94B2B), soft cream (#F2EBDD)
- Typography: clean modern sans-serif for Chinese, serif for English/numbers, generous whitespace
- Editorial / financial-newsletter aesthetic, similar to Bloomberg or Monocle magazine
- Pure design layout — NO photos, NO illustrations, NO icons except the small avatar circle

The text content listed above MUST appear EXACTLY as written. Render Chinese characters cleanly without distortion.`;

console.log(`📝 Prompt 字符数: ${prompt.length}`);

const submitRes = await fetchWithTimeout(`${APIMART_BASE}/v1/images/generations`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${APIMART_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ model: "gpt-image-2", prompt, size, n: 1 }),
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

await new Promise((r) => setTimeout(r, 30000));
let imageUrl = null;
const maxPolls = 60;
for (let i = 1; i <= maxPolls; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const pollRes = await fetchWithTimeout(`${APIMART_BASE}/v1/tasks/${taskId}`, {
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

const imgRes = await fetchWithTimeout(imageUrl);
if (!imgRes.ok) {
  console.error(`❌ 下载失败 HTTP ${imgRes.status}`);
  process.exit(1);
}
const buf = Buffer.from(await imgRes.arrayBuffer());
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(outPath, buf);
console.log(`✅ 已保存：${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
