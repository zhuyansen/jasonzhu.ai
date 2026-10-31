#!/usr/bin/env node
// PNG 转调色板压缩（sharp palette, quality 100），原地覆盖，路径和尺寸不变。
// 给不经过生图脚本的封面用：render-blog-cover.py 出图后会自动调；手动做的封面也跑一下。
// quality 必须是 100：90 及以下会在米色、深蓝平涂区压出噪点（2026-10-31 抽查快讯封面）。
// 已是调色板的跳过（再量化一次只会更差），省不到 20% 的保留原图。
//
// 用法：node scripts/compress-png.mjs <png...>

import fs from "fs";
import sharp from "sharp";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("用法：node scripts/compress-png.mjs <png...>");
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  try {
    const buf = fs.readFileSync(file);
    const meta = await sharp(buf).metadata();
    if (meta.format !== "png") {
      console.log(`⏭  ${file}：不是 PNG，跳过`);
      continue;
    }
    if (meta.isPalette) {
      console.log(`⏭  ${file}：已是调色板 PNG，跳过`);
      continue;
    }
    const out = await sharp(buf).png({ palette: true, quality: 100, compressionLevel: 9, effort: 10 }).toBuffer();
    if (out.length > buf.length * 0.8) {
      console.log(`⏭  ${file}：只能省 ${Math.round(100 - (100 * out.length) / buf.length)}%，保留原图`);
      continue;
    }
    fs.writeFileSync(file, out);
    console.log(`🗜  ${file}：${(buf.length / 1024).toFixed(0)}KB → ${(out.length / 1024).toFixed(0)}KB`);
  } catch (e) {
    failed++;
    console.error(`❌ ${file}：${e.message}`);
  }
}
if (failed) process.exit(1);
