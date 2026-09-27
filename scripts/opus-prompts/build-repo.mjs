// 生成公开 GitHub 合集的内容（README 中英 + 分类清单 + cases.json）。只写本地目录，不建仓库、不推送。
// 用法：node scripts/opus-prompts/build-repo.mjs <输出目录> [仓库名]
import fs from "node:fs";
import path from "node:path";
const ROOT = path.join(import.meta.dirname, "../..");
const OUT = process.argv[2]; if (!OUT) { console.error("usage: build-repo.mjs <outDir> [repoName]"); process.exit(1); }
const REPO = process.argv[3] || "awesome-opus-5.5-video";
const SITE = "https://jasonzhu.ai";
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/opus-prompts/cases.json"), "utf8"));
const CATS = [["motion", "Motion graphics & UI", "动效设计"], ["product", "Product demos & ads", "产品广告"], ["education", "Explainers & education", "科普讲解"], ["stories", "Characters & stories", "角色故事"],
  ["art3d", "3D worlds & simulations", "3D 场景"], ["game", "Games", "游戏"], ["production", "Music, editing & production", "制作流程"], ["comparison", "Model comparisons", "模型对比"]];
const cases = src.cases; const withP = cases.filter((c) => c.prompt);
const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const dur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const detail = (c, l) => `${SITE}/${l}/prompts/claude-opus-5-5/${c.id}`;
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "cases"), { recursive: true });

// cases.json：公开数据，不含完整提示词正文（正文在站内详情页，保留出处链接）
fs.writeFileSync(path.join(OUT, "cases.json"), JSON.stringify({
  schema_version: 1, model: src.model, inclusion_rule: src.inclusionRule, views_threshold: src.threshold, stats_checked_at: src.statsCheckedAt, updated_at: src.updatedAt,
  model_attribution: "As stated by each creator; not independently reproduced.",
  cases: cases.map((c) => ({ id: c.id, category: c.category, title: c.title, creator: c.author, original_post_url: c.url, posted_at: c.postedAt, language: c.lang, duration_seconds: c.video.durationSec,
    views: c.stats.views, likes: c.stats.likes, bookmarks: c.stats.bookmarks, views_checked_at: c.stats.checkedAt, thumbnail_url: c.video.poster, tools_reported: c.tools, reference_assets: c.referenceAssets,
    prompt: c.prompt ? { kind: c.prompt.kind, source: c.prompt.source, source_url: c.prompt.sourceUrl, length: c.prompt.text.length, page_url: detail(c, "en") } : null, resources: c.resources || [] })),
}, null, 1));

const row = (c, l) => `| [${esc(l === "zh" ? c.title.zh : c.title.en)}](${c.url}) | [@${c.author.handle}](https://x.com/${c.author.handle}) | ${dur(c.video.durationSec)} | ${c.prompt ? `[${c.prompt.kind === "full" ? (l === "zh" ? "完整提示词" : "Full prompt") : (l === "zh" ? "一句话指令" : "Brief")}](${detail(c, l)})` : "—"} |`;
for (const [k, en, zh] of CATS) {
  const list = cases.filter((c) => c.category === k);
  for (const l of ["en", "zh"]) {
    const head = l === "zh" ? `# ${zh}\n\n共 ${list.length} 个作品，其中 ${list.filter((c) => c.prompt).length} 个附提示词。标题链接到 X 原帖，提示词链接到带原文和出处的页面。\n\n| 作品 | 创作者 | 时长 | 提示词 |\n|---|---|---|---|`
      : `# ${en}\n\n${list.length} works, ${list.filter((c) => c.prompt).length} with a prompt. Titles link to the original post on X; prompt links open the page with the original text and its source.\n\n| Work | Creator | Length | Prompt |\n|---|---|---|---|`;
    fs.writeFileSync(path.join(OUT, "cases", `${k}${l === "zh" ? ".zh-CN" : ""}.md`), head + "\n" + list.map((c) => row(c, l)).join("\n") + "\n");
  }
}
const featured = withP.filter((c) => c.prompt.kind === "full").slice(0, 8);
const grid = (l) => "<table>\n" + [0, 4].map((o) => "  <tr>\n" + featured.slice(o, o + 4).map((c) => `    <td width="25%" align="center"><a href="${detail(c, l)}"><img src="${c.video.poster}" width="200" alt="${(l === "zh" ? c.title.zh : c.title.en).replace(/"/g, "&quot;")}"></a><br><sub>${l === "zh" ? c.title.zh : c.title.en}</sub></td>`).join("\n") + "\n  </tr>").join("\n") + "\n</table>";
const readme = (l) => {
  const zh = l === "zh";
  const sec = CATS.map(([k, en, z]) => { const list = cases.filter((c) => c.category === k); const top = list.filter((c) => c.prompt).slice(0, 8);
    return `## ${zh ? z : en}\n\n${zh ? `${list.length} 个作品 · [完整清单](cases/${k}.zh-CN.md)` : `${list.length} works · [full list](cases/${k}.md)`}\n\n| ${zh ? "作品 | 创作者 | 时长 | 提示词" : "Work | Creator | Length | Prompt"} |\n|---|---|---|---|\n${top.map((c) => row(c, l)).join("\n")}\n`; }).join("\n");
  return zh ? `# Awesome Opus 5.5 Video

[English](README.md) | 简体中文

X 上用 Claude Opus 5.5 做出来的视频、动效、3D 场景和游戏，原帖播放量都过 ${src.threshold.toLocaleString("en-US")}。共 **${cases.length} 个作品**，其中 **${withP.length} 个附提示词**（${withP.filter((c) => c.prompt.kind === "full").length} 条完整提示词）。

**[在线浏览，可直接播放和复制提示词 →](${SITE}/zh/prompts/claude-opus-5-5)**

${grid("zh")}

${CATS.map(([k, , z]) => `[${z}](#${encodeURIComponent(z.replace(/ /g, "-")).toLowerCase()})`).join(" · ")}

## 收录标准

- 创作者本人的原帖，帖子自带视频，原帖播放量不低于 ${src.threshold.toLocaleString("en-US")}（快照时间 ${src.statsCheckedAt.slice(0, 10)}）。
- 帖子明确说作品是用 Claude Opus 5.5 做的。**模型归属以作者自述为准，没有逐条复现。**
- 提示词只收有出处的：主帖正文、作者本人的回复、作者回复里的截图、作者给出的链接。提示词一律原文照录，不改写、不翻译。
- 有视频但找不到指令来源的作品照常收录，提示词一栏留空。

${sec}
## 数据

[\`cases.json\`](cases.json) 是全部作品的结构化数据：原帖链接、创作者、分类、时长、播放量快照、提示词出处。

## 更正与下架

所有作品版权归原作者，收录不代表获得任何授权。创作者想更正署名或下架，开一个 Issue，或在 X 私信 [@GoSailGlobal](https://x.com/GoSailGlobal)。

由 [JasonZhu.AI](${SITE}) 整理。
` : `# Awesome Opus 5.5 Video

English | [简体中文](README.zh-CN.md)

Videos, motion graphics, 3D scenes and games made with Claude Opus 5.5 and shared on X, each with ${src.threshold.toLocaleString("en-US")}+ views on the original post. **${cases.length} works**, **${withP.length} with a prompt** (${withP.filter((c) => c.prompt.kind === "full").length} full prompts).

**[Browse online — play the videos and copy the prompts →](${SITE}/en/prompts/claude-opus-5-5)**

${grid("en")}

${CATS.map(([k, en]) => `[${en}](#${en.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/ +/g, "-")})`).join(" · ")}

## Inclusion rule

- The creator's own post, with a native video, and at least ${src.threshold.toLocaleString("en-US")} views on that post (snapshot: ${src.statsCheckedAt.slice(0, 10)}).
- The post states the work was made with Claude Opus 5.5. **Model attribution is as stated by each creator and was not independently reproduced.**
- A prompt is listed only when it has a source: the post itself, the creator's own replies, a screenshot in those replies, or a link the creator shared. Prompts are kept verbatim, never rewritten or translated.
- Works with a video but no traceable instruction are still listed, with the prompt column left empty.

${sec}
## Data

[\`cases.json\`](cases.json) holds every work as structured data: original post, creator, category, length, view snapshot and prompt source.

## Corrections and removal

All works belong to their creators; inclusion grants no license. Creators can open an issue or DM [@GoSailGlobal](https://x.com/GoSailGlobal) on X to correct attribution or remove a work.

Curated by [JasonZhu.AI](${SITE}).
`; };
fs.writeFileSync(path.join(OUT, "README.md"), readme("en"));
fs.writeFileSync(path.join(OUT, "README.zh-CN.md"), readme("zh"));
console.log(`repo content → ${OUT}\n  works ${cases.length}, with prompt ${withP.length}\n  ` + fs.readdirSync(OUT, { recursive: true }).filter((f) => fs.statSync(path.join(OUT, f)).isFile()).map((f) => `${f} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)}KB`).join("\n  "));
