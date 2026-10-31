#!/usr/bin/env node
// 快讯英文封面：按 src/content/news/<date>.md 里的英文标题（TitleEN）排版，存到 public/news/en/<date>.png，英文页 /en/news 用它。
// 版式照着中文封面（generate-news-image.mjs 的 AI 生图）：深蓝侧栏 + 米色底 + 红色编号 + JZ 角标，同样 1024x1536。
// 英文版不走 AI 生图：字 100% 准确、不花钱，同样的输入出同一张图（重跑不会被当成「有变化」再提交一次）。
// 字体是 scripts/fonts/ 里的开源字体（OFL），本地和 GitHub Actions 出图一致。
//
// 用法：node scripts/render-news-cover-en.mjs [YYYY-MM-DD ...]   默认今天（北京时间）
//       node scripts/render-news-cover-en.mjs --all [--force]     补齐全部（已有的跳过，--force 全部重画）

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ImageResponse } from "next/og.js";

const NEWS_DIR = "src/content/news";
const OUT_DIR = "public/news/en";
const FONT_DIR = "scripts/fonts";

// 颜色取自中文封面
const NAVY = "#183374", PAPER = "#F5EEDF", RED = "#DB4321", INK = "#202434", GREY = "#5B5F6B", RULE = "#DCCFB6";
const W = 1024, H = 1536, SIDE = 115, FOOT = 76, LEFT = SIDE + 56, RIGHT = 56, ROW = 123;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const font = (file) => fs.readFileSync(path.join(FONT_DIR, file));
const FONTS = [
  { name: "Serif", data: font("source-serif-4-latin-900-normal.woff"), weight: 900, style: "normal" },
  { name: "Inter", data: font("inter-latin-400-normal.woff"), weight: 400, style: "normal" },
  { name: "Inter", data: font("inter-latin-600-normal.woff"), weight: 600, style: "normal" },
  { name: "Inter", data: font("inter-latin-700-normal.woff"), weight: 700, style: "normal" },
  // 标题里偶尔有 ő、Ψ 这类字母，拉丁扩展 / 希腊字母子集兜底
  { name: "Inter", data: font("inter-latin-ext-600-normal.woff"), weight: 600, style: "normal" },
  { name: "Inter", data: font("inter-greek-600-normal.woff"), weight: 600, style: "normal" },
  { name: "Hand", data: font("caveat-latin-700-normal.woff"), weight: 700, style: "normal" },
];

const h = (style, ...children) => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children: children.length === 1 ? children[0] : children },
});

/** 和 generate-news.mjs 同样的切段规则：每个 ### 是一条，融资速递段不算 */
function englishTitles(raw) {
  const { content } = matter(raw);
  const titles = [];
  for (const section of content.split(/^### /m).filter(Boolean)) {
    const lines = section.trim().split("\n");
    const title = lines[0]?.trim();
    if (!title || title.includes("融资速递")) continue;
    const en = lines.map((l) => l.trim()).find((l) => /^- \*\*TitleEN\*\*[：:]/.test(l));
    if (en) titles.push(en.replace(/^- \*\*TitleEN\*\*[：:]/, "").trim());
  }
  return titles.filter(Boolean);
}

// 标题栏宽 685px，Inter 600 每行约 43 个字符（28px）；超长的标题缩字号，最多三行
const titleSize = (t) => (t.length > 90 ? 26 : 28);

function card(date, titles) {
  const [y, m, d] = date.split("-").map(Number);
  const day = `${MONTHS[m - 1]} ${d}`;
  const vol = `VOL.${date.slice(5, 7)}${date.slice(8, 10)}`;
  const divider = h({ width: 1, height: 26, backgroundColor: "rgba(255,255,255,0.45)", marginLeft: 22, marginRight: 22 });
  return h(
    { width: W, height: H, position: "relative", backgroundColor: PAPER, fontFamily: "Inter" },
    // 侧栏和竖排的 AI NEWS BRIEF（顺时针转 90°，和中文封面同向）
    h({ position: "absolute", left: 0, top: 0, width: SIDE, height: H, backgroundColor: NAVY }),
    h(
      {
        position: "absolute", left: SIDE / 2 - 320, top: 370 - SIDE / 2, width: 640, height: SIDE,
        alignItems: "center", justifyContent: "center", transform: "rotate(90deg)",
        fontFamily: "Serif", fontWeight: 900, fontSize: 62, letterSpacing: 6, color: "#FFFFFF",
      },
      "AI NEWS BRIEF",
    ),
    // 红色小日期 + 虚线
    h(
      { position: "absolute", left: LEFT, top: 60, flexDirection: "column" },
      h({ fontFamily: "Serif", fontWeight: 900, fontSize: 38, color: RED }, `${day}, ${y}`),
      h({ marginTop: 14, width: 500, borderBottom: `3px dashed ${RED}` }),
    ),
    // 右上角头像标签
    h(
      { position: "absolute", right: RIGHT, top: 50, alignItems: "center" },
      h(
        { width: 72, height: 72, borderRadius: 36, backgroundColor: NAVY, alignItems: "center", justifyContent: "center",
          fontFamily: "Serif", fontWeight: 900, fontSize: 30, color: "#FFFFFF" },
        "JZ",
      ),
      h(
        { marginLeft: 14, flexDirection: "column" },
        h({ fontWeight: 700, fontSize: 28, color: NAVY }, "JasonZhu.AI"),
        h({ fontWeight: 400, fontSize: 21, color: GREY, marginTop: 2 }, "AI signal briefing"),
      ),
    ),
    // 手写体圆章
    h(
      { position: "absolute", right: RIGHT + 4, top: 144, width: 168, height: 168, borderRadius: 84, backgroundColor: "#EADCC2",
        flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-8deg)" },
      h({ fontFamily: "Hand", fontWeight: 700, fontSize: 52, lineHeight: 0.9, color: NAVY }, "Who"),
      h({ fontFamily: "Hand", fontWeight: 700, fontSize: 52, lineHeight: 0.9, color: NAVY }, "next?"),
      h({ width: 72, marginTop: 8, borderBottom: `3px solid ${NAVY}` }),
    ),
    // 大标题
    h(
      { position: "absolute", left: LEFT, top: 150, flexDirection: "column" },
      h({ fontFamily: "Serif", fontWeight: 900, fontSize: 156, lineHeight: 1, color: "#111111" }, day),
      h({ fontFamily: "Serif", fontWeight: 900, fontSize: 118, lineHeight: 1.08, color: "#111111", marginTop: 4 }, "AI Roundup"),
      h({ fontWeight: 400, fontSize: 38, color: GREY, marginTop: 22 }, `Today's ${titles.length} signals worth your time`),
    ),
    // 编号列表
    h(
      { position: "absolute", left: LEFT, top: 548, width: W - LEFT - RIGHT, flexDirection: "column" },
      ...titles.map((t, i) =>
        h(
          { height: ROW, alignItems: "center", borderTop: i ? `2px solid ${RULE}` : "0px solid transparent" },
          h({ width: 112, fontFamily: "Serif", fontWeight: 900, fontSize: 60, color: RED }, `${String(i + 1).padStart(2, "0")}.`),
          h({ flex: 1, fontWeight: 600, fontSize: titleSize(t), lineHeight: 1.22, color: INK }, t),
        ),
      ),
    ),
    // 左下角 JZ 角标
    h(
      { position: "absolute", left: LEFT, top: H - FOOT - 36 - 104, width: 104, height: 104, backgroundColor: RED,
        flexDirection: "column", alignItems: "center", justifyContent: "center" },
      h({ fontFamily: "Serif", fontWeight: 900, fontSize: 52, lineHeight: 1, color: "#FFFFFF" }, "JZ"),
      h({ fontWeight: 700, fontSize: 15, letterSpacing: 1, marginTop: 6, color: "#FFFFFF" }, vol),
    ),
    // 底栏
    h(
      { position: "absolute", left: SIDE, top: H - FOOT, width: W - SIDE, height: FOOT, backgroundColor: NAVY,
        alignItems: "center", paddingLeft: 56, color: "#FFFFFF" },
      h({ fontWeight: 700, fontSize: 20, letterSpacing: 3 }, "DETAILS"),
      divider,
      h({ fontWeight: 400, fontSize: 21 }, "jasonzhu.ai/en/news"),
      divider,
      h({ fontWeight: 400, fontSize: 19, color: "rgba(255,255,255,0.85)" }, "Which AI tool breaks out next?"),
    ),
  );
}

async function render(date) {
  const mdPath = path.join(NEWS_DIR, `${date}.md`);
  if (!fs.existsSync(mdPath)) throw new Error(`找不到 ${mdPath}`);
  const titles = englishTitles(fs.readFileSync(mdPath, "utf-8")).slice(0, 6);
  if (titles.length < 3) throw new Error(`${date} 只有 ${titles.length} 条英文标题（TitleEN），不够出封面`);

  const res = new ImageResponse(card(date, titles), { width: W, height: H, fonts: FONTS });
  let buf = Buffer.from(await res.arrayBuffer());
  try {
    // 版面是平涂色块，转调色板 PNG 后约原来的三分之一
    const { default: sharp } = await import("sharp");
    buf = await sharp(buf).png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 }).toBuffer();
  } catch (e) {
    console.warn(`⚠️  sharp 压缩跳过（${e.message}），保存原图`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `${date}.png`);
  fs.writeFileSync(out, buf);
  console.log(`✅ ${out} (${(buf.length / 1024).toFixed(0)} KB, ${titles.length} 条)`);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
let dates = args.filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
if (args.includes("--all")) {
  dates = fs
    .readdirSync(NEWS_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .map((f) => f.slice(0, 10))
    .filter((d) => force || !fs.existsSync(path.join(OUT_DIR, `${d}.png`)))
    .sort();
} else if (!dates.length) {
  dates = [new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10)];
}

let failed = 0;
for (const date of dates) {
  try {
    await render(date);
  } catch (e) {
    failed++;
    console.error(`❌ ${date}: ${e.message}`);
  }
}
console.log(`英文封面：成功 ${dates.length - failed}，失败 ${failed}`);
if (failed) process.exit(1);
