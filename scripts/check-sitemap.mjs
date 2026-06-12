/**
 * Sitemap 防回归校验：
 * 拉取本地/线上 sitemap，断言 URL 数 ≥ 内容文件数 × 2（双语言）+ 静态页下限。
 * 数量对不上说明 sitemap 生成又静默坏了（2026-04~06 冻结两个月的教训）。
 *
 * 用法：node scripts/check-sitemap.mjs [sitemap-url]
 * 默认检查 https://jasonzhu.ai/sitemap.xml
 */
import fs from "fs";
import path from "path";

const SITEMAP_URL = process.argv[2] || "https://jasonzhu.ai/sitemap.xml";

const count = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".md")).length
    : 0;

// en URL 只收录有英文翻译的内容（.en.md / summaryEn），
// 下限按「zh 全量 + 静态页双语」算（.en.md 文件不计入 zh 文章数）
const blogDir = path.join(process.cwd(), "src/content/blog");
const blogCount = fs.existsSync(blogDir)
  ? fs.readdirSync(blogDir).filter((f) => f.endsWith(".md") && !f.endsWith(".en.md")).length
  : 0;
const newsCount = count(path.join(process.cwd(), "src/content/news"));
const MIN_STATIC = 16; // 8 个静态页 × 2 语言的保守下限
const expected = blogCount + newsCount + MIN_STATIC;

const res = await fetch(SITEMAP_URL);
if (!res.ok) {
  console.error(`❌ sitemap fetch failed: HTTP ${res.status} ${SITEMAP_URL}`);
  process.exit(1);
}
const xml = await res.text();
const actual = (xml.match(/<loc>/g) || []).length;

console.log(`📋 sitemap URL 数：${actual}`);
console.log(`📋 期望下限：${expected}（zh blog ${blogCount} + zh news ${newsCount} + 静态页 ${MIN_STATIC}；en 仅计入已翻译内容）`);

if (actual < expected) {
  console.error(`❌ sitemap URL 数不足！生成逻辑可能又坏了（上次静默坏了两个月）`);
  process.exit(1);
}
console.log("✅ sitemap 数量校验通过");
