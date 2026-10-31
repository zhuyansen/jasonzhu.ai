#!/usr/bin/env node
// PNG 原地压缩，路径和尺寸不变。给不经过生图脚本的图用：render-blog-cover.py 出图后自动调；正文配图、手动做的封面也跑一下。
// 优先转调色板 PNG（sharp palette, quality 100，一般省一半以上）。quality 必须是 100：90 及以下会在米色、深蓝平涂区压出噪点。
// 调色板最多 256 色，颜色多的截图（带照片、图表）会把整块纯色换成相近的另一个色（2026-10-31 正文配图里有按钮整块偏了 18 级），
// 所以先比 16x16 小块平均色：偏差超过 6 级就改用无损重压（抖动噪点不改平均色，偏差大只可能是换了颜色）。
// 已是调色板的跳过（再量化一次只会更差）；调色板省不到 20%、无损省不到 10% 的保留原图。
//
// 用法：node scripts/compress-png.mjs [--dry-run] <png...>

import fs from "fs";
import sharp from "sharp";

const MAX_SHIFT = 6;

async function rgb(input, flatten) {
  const img = flatten ? sharp(input).flatten({ background: "#ffffff" }) : sharp(input).removeAlpha();
  return img.raw().toBuffer({ resolveWithObject: true });
}

// 16x16 小块每个通道平均值的最大差
function blockShift(a, b, w, h, g = 16) {
  let max = 0;
  for (let by = 0; by + g <= h; by += g) {
    for (let bx = 0; bx + g <= w; bx += g) {
      for (let c = 0; c < 3; c++) {
        let d = 0;
        for (let y = by; y < by + g; y++) for (let x = bx; x < bx + g; x++) d += a[(y * w + x) * 3 + c] - b[(y * w + x) * 3 + c];
        max = Math.max(max, Math.abs(d) / (g * g));
      }
    }
  }
  return max;
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const files = args.filter((a) => a !== "--dry-run");
if (!files.length) {
  console.error("用法：node scripts/compress-png.mjs [--dry-run] <png...>");
  process.exit(1);
}

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
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
    // 透明通道全不透明时直接去掉（无损）。保留原图的色彩配置文件：macOS 截图常带 Display P3，
    // sharp 默认会换算成 sRGB 并丢掉配置文件，P3 屏上饱和色会变淡
    const opaque = !meta.hasAlpha || (await sharp(buf).stats()).isOpaque;
    const base = () => {
      const img = sharp(buf).keepIccProfile();
      return meta.hasAlpha && opaque ? img.removeAlpha() : img;
    };

    const palette = await base().png({ palette: true, quality: 100, compressionLevel: 9, effort: 10 }).toBuffer();
    const a = await rgb(buf, !opaque);
    const shift = blockShift(a.data, (await rgb(palette, !opaque)).data, a.info.width, a.info.height);
    let out = null, note;
    if (shift <= MAX_SHIFT && palette.length <= buf.length * 0.8) {
      out = palette;
      note = `调色板（小块偏色 ${shift.toFixed(1)} 级）`;
    } else {
      const lossless = await base().png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
      const why = shift > MAX_SHIFT ? `调色板会整块偏色 ${shift.toFixed(1)} 级` : `调色板只省 ${Math.round(100 - (100 * palette.length) / buf.length)}%`;
      if (lossless.length <= buf.length * 0.9) {
        out = lossless;
        note = `无损（${why}）`;
      } else {
        console.log(`⏭  ${file}：${why}，无损也只省 ${Math.round(100 - (100 * lossless.length) / buf.length)}%，保留原图`);
        continue;
      }
    }
    if (!dryRun) fs.writeFileSync(file, out);
    console.log(`🗜  ${file}：${kb(buf.length)} → ${kb(out.length)}  ${note}${dryRun ? "  [dry-run]" : ""}`);
  } catch (e) {
    failed++;
    console.error(`❌ ${file}：${e.message}`);
  }
}
if (failed) process.exit(1);
