// 生成公开 GitHub 合集 awesome-chatgpt-images-2.6 的内容（README 中英 + 分类清单 + cases.json）。只写本地目录，不建仓库、不推送。
// 那个仓库的 .github/workflows/sync.yml 每天拉本仓库的数据和这个脚本重新生成。
// 用法：node scripts/image-prompts/build-repo.mjs <输出目录> [仓库名]
import fs from "node:fs";
import path from "node:path";
const ROOT = path.join(import.meta.dirname, "../..");
const OUT = process.argv[2]; if (!OUT) { console.error("usage: build-repo.mjs <outDir> [repoName]"); process.exit(1); }
const REPO = process.argv[3] || "awesome-chatgpt-images-2.6";
const SITE = "https://jasonzhu.ai";
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/image-prompts/chatgpt-images-2-6.json"), "utf8"));
const CATS = [["gif", "GIFs & animation", "GIF 动图"], ["portrait", "Portraits & photo", "人像摄影"], ["illustration", "Illustration & anime", "插画动漫"], ["product", "Product shots & ads", "产品广告"],
  ["design", "Posters, typography & design", "海报排版"], ["edit", "Photo edits & reference images", "改图与参考图"], ["sticker", "Stickers & memes", "表情包贴纸"], ["comparison", "Model comparisons", "模型对比"]];
const cases = src.cases; const withP = cases.filter((c) => c.prompt);
const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const detail = (c, l) => `${SITE}/${l}/prompts/chatgpt-images-2-6/${c.id}`;
const thumb = (m) => (m.type === "photo" ? m.url.replace(/\.(jpg|jpeg|png|webp)$/, (_, e) => `?format=${e === "jpeg" ? "jpg" : e}&name=small`) : m.poster);
const kinds = (c) => [...new Set(c.media.map((m) => (m.type === "photo" ? "image" : m.type)))].join(" + ");
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "cases"), { recursive: true });

// cases.json：公开数据，不含完整提示词正文（正文在站内详情页，保留出处链接）
fs.writeFileSync(path.join(OUT, "cases.json"), JSON.stringify({
  schema_version: 1, model: src.model, released: src.released, inclusion_rule: src.inclusionRule, views_threshold: src.threshold, stats_checked_at: src.statsCheckedAt, updated_at: src.updatedAt,
  model_attribution: "As stated by each creator; not independently reproduced.",
  cases: cases.map((c) => ({ id: c.id, category: c.category, title: c.title, creator: c.author, original_post_url: c.url, posted_at: c.postedAt, language: c.lang,
    media: c.media.map((m) => ({ type: m.type, width: m.width, height: m.height, thumbnail_url: thumb(m) })),
    views: c.stats.views, likes: c.stats.likes, bookmarks: c.stats.bookmarks, views_checked_at: c.stats.checkedAt, tools_reported: c.tools, reference_assets: c.referenceAssets,
    prompt: c.prompt ? { kind: c.prompt.kind, source: c.prompt.source, source_url: c.prompt.sourceUrl, length: c.prompt.text.length, page_url: detail(c, "en") } : null, resources: c.resources || [] })),
}, null, 1));

const row = (c, l) => `| [${esc(l === "zh" ? c.title.zh : c.title.en)}](${c.url}) | ${kinds(c)} | [@${c.author.handle}](https://x.com/${c.author.handle}) | ${c.prompt ? `[${c.prompt.kind === "full" ? (l === "zh" ? "完整提示词" : "Full prompt") : (l === "zh" ? "一句话指令" : "Brief")}](${detail(c, l)})` : "—"} |`;
for (const [k, en, zh] of CATS) {
  const list = cases.filter((c) => c.category === k);
  for (const l of ["en", "zh"]) {
    const head = l === "zh" ? `# ${zh}\n\n共 ${list.length} 个作品，其中 ${list.filter((c) => c.prompt).length} 个附提示词。标题链接到 X 原帖，提示词链接到带原文和出处的页面。\n\n| 作品 | 类型 | 创作者 | 提示词 |\n|---|---|---|---|`
      : `# ${en}\n\n${list.length} works, ${list.filter((c) => c.prompt).length} with a prompt. Titles link to the original post on X; prompt links open the page with the original text and its source.\n\n| Work | Type | Creator | Prompt |\n|---|---|---|---|`;
    fs.writeFileSync(path.join(OUT, "cases", `${k}${l === "zh" ? ".zh-CN" : ""}.md`), head + "\n" + list.map((c) => row(c, l)).join("\n") + "\n");
  }
}
const featured = withP.slice(0, 8);
const grid = (l) => !featured.length ? "" : "<table>\n" + [0, 4].filter((o) => featured.length > o).map((o) => "  <tr>\n" + featured.slice(o, o + 4).map((c) => `    <td width="25%" align="center"><a href="${detail(c, l)}"><img src="${thumb(c.media[0])}" width="200" alt="${(l === "zh" ? c.title.zh : c.title.en).replace(/"/g, "&quot;")}"></a><br><sub>${l === "zh" ? c.title.zh : c.title.en}</sub></td>`).join("\n") + "\n  </tr>").join("\n") + "\n</table>";
const count = (k) => cases.filter((c) => c.category === k).length;
const date = (src.updatedAt || "").slice(0, 10);
const readme = (l) => l === "zh" ? `# ChatGPT Images 2.6 提示词合集

[English](README.md) | 简体中文

X 上用 **ChatGPT Images 2.6**（OpenAI 2026-11-04 发布，API 名 GPT-Image-2.6 Flare / Sunburst）做的图片和 GIF 作品，**${cases.length}** 个，其中 **${withP.length}** 个附作者公开的提示词。每天自动更新（最近一次：${date}）。

在线浏览（GIF 可直接播放、提示词一键复制）：**[jasonzhu.ai/zh/prompts/chatgpt-images-2-6](${SITE}/zh/prompts/chatgpt-images-2-6)**

${grid("zh")}

## 分类

${CATS.filter(([k]) => count(k)).map(([k, , zh]) => `- [${zh}](cases/${k}.zh-CN.md)（${count(k)}）`).join("\n")}

## 收录标准

原帖浏览不低于 ${src.threshold.toLocaleString("en-US")}；图片、GIF 或视频是原帖自带的；作者明确说是用 ChatGPT Images 2.6 做的。别人转发、官方演示、平台推广不收。模型归属以作者自述为准，没有逐条复现。提示词只收作者本人公开的（原帖、作者回复、回复里的截图、作者给的链接），原文照录。

## 数据

[\`cases.json\`](cases.json) 是全部作品的结构化数据：原帖链接、创作者、分类、媒体类型、浏览量快照、提示词出处。

所有作品版权归原作者。作者要更正署名或下架，请在 X 上私信 [@GoSailGlobal](https://x.com/GoSailGlobal)，或在本仓库提 issue。
` : `# Awesome ChatGPT Images 2.6 Prompts

English | [简体中文](README.zh-CN.md)

Images and GIFs made with **ChatGPT Images 2.6** (OpenAI, released 2026-11-04; GPT-Image-2.6 Flare / Sunburst in the API) by creators on X: **${cases.length}** works, **${withP.length}** with the prompt the creator shared. Updated daily (last update: ${date}).

Browse with playable GIFs and one-click copy: **[jasonzhu.ai/en/prompts/chatgpt-images-2-6](${SITE}/en/prompts/chatgpt-images-2-6)**

${grid("en")}

## Categories

${CATS.filter(([k]) => count(k)).map(([k, en]) => `- [${en}](cases/${k}.md) (${count(k)})`).join("\n")}

## What gets included

The original post has ${src.threshold.toLocaleString("en-US")}+ views, the images, GIF or video are attached to it, and the creator says it was made with ChatGPT Images 2.6. Reposts, official demos and platform promotions are left out. Model attribution is as stated by the creator, not independently reproduced. Prompts come only from the creator (the post, their own reply, a screenshot in a reply, or a link they shared) and are kept verbatim.

## Data

[\`cases.json\`](cases.json) holds every work as structured data: original post, creator, category, media type, view snapshot and prompt source.

All works belong to their creators. To fix a credit or remove a work, DM [@GoSailGlobal](https://x.com/GoSailGlobal) on X or open an issue in this repository.
`;
fs.writeFileSync(path.join(OUT, "README.md"), readme("en"));
fs.writeFileSync(path.join(OUT, "README.zh-CN.md"), readme("zh"));
console.log(`✅ ${REPO}：${cases.length} 个作品（带提示词 ${withP.length}）→ ${OUT}`);
