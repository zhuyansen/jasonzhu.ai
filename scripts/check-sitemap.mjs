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

const blogCount = count(path.join(process.cwd(), "src/content/blog"));
const newsCount = count(path.join(process.cwd(), "src/content/news"));
const MIN_STATIC = 16; // 8 个静态页 × 2 语言的保守下限
const expected = (blogCount + newsCount) * 2 + MIN_STATIC;

const res = await fetch(SITEMAP_URL);
if (!res.ok) {
  console.error(`❌ sitemap fetch failed: HTTP ${res.status} ${SITEMAP_URL}`);
  process.exit(1);
}
const xml = await res.text();
const actual = (xml.match(/<loc>/g) || []).length;

console.log(`📋 sitemap URL 数：${actual}`);
console.log(`📋 期望下限：${expected}（blog ${blogCount} + news ${newsCount}，×2 语言，+静态页 ${MIN_STATIC}）`);

if (actual < expected) {
  console.error(`❌ sitemap URL 数不足！生成逻辑可能又坏了（上次静默坏了两个月）`);
  process.exit(1);
}
console.log("✅ sitemap 数量校验通过");
