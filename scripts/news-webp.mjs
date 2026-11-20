#!/usr/bin/env node
// 快讯封面的 WebP 版：页面上显示它，PNG 原图留着给读者点开下载、给社交卡片用（og:image）。
// 封面已是调色板 PNG，1024x1536 仍有 ~1.2MB，Ahrefs 2026-11-19 报 123 张"图片过大"；WebP 质量 82 约 150KB。
// generate-news-image.mjs 和 render-news-cover-en.mjs 出图后调 writeWebp；旧图用这个脚本补：
//   node scripts/news-webp.mjs            # public/news 和 public/news/en 里缺 WebP 或 WebP 比 PNG 旧的
//   node scripts/news-webp.mjs --force    # 全部重做

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const QUALITY = 82;
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "news");

/** <date>.png 旁边写 <date>.webp，返回两者字节数。 */
export async function writeWebp(pngPath) {
  const out = pngPath.replace(/\.png$/i, ".webp");
  const buf = await sharp(pngPath).webp({ quality: QUALITY, effort: 6 }).toBuffer();
  fs.writeFileSync(out, buf);
  return { png: fs.statSync(pngPath).size, webp: buf.length, out };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const force = process.argv.includes("--force");
  let done = 0, before = 0, after = 0;
  for (const dir of [ROOT, path.join(ROOT, "en")]) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".png")).sort()) {
      const png = path.join(dir, name);
      const webp = png.replace(/\.png$/, ".webp");
      if (!force && fs.existsSync(webp) && fs.statSync(webp).mtimeMs >= fs.statSync(png).mtimeMs) continue;
      const r = await writeWebp(png);
      before += r.png; after += r.webp; done++;
    }
  }
  const mb = (n) => (n / 1048576).toFixed(1);
  console.log(`✅ ${done} 张 WebP：PNG ${mb(before)}MB → WebP ${mb(after)}MB`);
}
