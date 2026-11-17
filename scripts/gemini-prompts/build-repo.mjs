// 生成公开 GitHub 合集 awesome-gemini-4-prompts 的内容（README 中英 + 分类清单 + cases.json）。只写本地目录，不建仓库、不推送。
// 那个仓库的 .github/workflows/sync.yml 每天拉本仓库的数据和这个脚本重新生成（同图片库）。
// 用法：node scripts/gemini-prompts/build-repo.mjs <输出目录> [仓库名]
import fs from "node:fs";
import path from "node:path";
const ROOT = path.join(import.meta.dirname, "../..");
const OUT = process.argv[2]; if (!OUT) { console.error("usage: build-repo.mjs <outDir> [repoName]"); process.exit(1); }
const REPO = process.argv[3] || "awesome-gemini-4-prompts";
const SITE = "https://jasonzhu.ai";
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/gemini-prompts/gemini-4.json"), "utf8"));
// 分类、版本、对比对象的名字同 src/lib/gemini-prompts-shared.ts；新版本名没加到这里也不会出错，按原样首字母大写显示
const CATS = [["scene3d", "3D scenes", "3D 场景"], ["physics", "Physics & materials", "物理与材质"], ["mechanics", "Machines & cutaways", "机械原理"], ["game", "Games", "游戏"],
  ["sim", "Simulations", "模拟系统"], ["ui", "Websites & UI", "网页与界面"], ["svg", "SVG drawings", "SVG 绘图"], ["motion", "Animation", "动画短片"]];
const ML = { argon: "Argon", carbon: "Carbon", hydrogen: "Hydrogen", krypton: "Krypton", pro: "Pro", flash: "Flash", ultra: "Ultra", "gemini-4": "Gemini 4" };
const RL = { claude: "Claude", gpt: "GPT", deepseek: "DeepSeek", grok: "Grok", kimi: "Kimi", muse: "Meta Muse", minimax: "MiniMax", qwen: "Qwen" };
const cap = (k) => k.charAt(0).toUpperCase() + k.slice(1);
const cases = src.cases; const withP = cases.filter((c) => c.prompt); const versus = cases.filter((c) => c.rivals.length);
const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const detail = (c, l) => `${SITE}/${l}/prompts/gemini-4/${c.id}`;
const thumb = (m) => (m.type === "photo" ? m.url.replace(/\.(jpg|jpeg|png|webp)$/, (_, e) => `?format=${e === "jpeg" ? "jpg" : e}&name=small`) : m.poster);
const ver = (c) => c.models.map((m) => ML[m] || cap(m)).join(" / ");
const vs = (c) => c.rivals.map((r) => RL[r] || cap(r)).join(", ") || "—";
const title = (c, l) => (l === "zh" ? c.title.zh : c.title.en);
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "cases"), { recursive: true });

// cases.json：公开数据，不含完整提示词正文（正文在站内详情页，保留出处链接）
fs.writeFileSync(path.join(OUT, "cases.json"), JSON.stringify({
  schema_version: 1, model: src.model, released: src.released, inclusion_rule: src.inclusionRule, views_threshold: src.threshold, stats_checked_at: src.statsCheckedAt, updated_at: src.updatedAt,
  model_attribution: "As stated by each creator; not independently reproduced.",
  cases: cases.map((c) => ({ id: c.id, category: c.category, versions: c.models, compared_with: c.rivals, title: c.title, creator: c.author, original_post_url: c.url, posted_at: c.postedAt, language: c.lang,
    media: c.media.map((m) => ({ type: m.type, width: m.width, height: m.height, duration_seconds: m.durationSec ?? null, thumbnail_url: thumb(m) })),
    views: c.stats.views, likes: c.stats.likes, bookmarks: c.stats.bookmarks, views_checked_at: c.stats.checkedAt, tools_reported: c.tools, reference_assets: c.referenceAssets,
    prompt: c.prompt ? { kind: c.prompt.kind, source: c.prompt.source, source_url: c.prompt.sourceUrl, length: c.prompt.text.length, page_url: detail(c, "en") } : null, resources: c.resources || [] })),
}, null, 1));

const head = (l) => (l === "zh" ? "| 作品 | 版本 | 同题对比 | 创作者 | 提示词 |" : "| Work | Version | Compared with | Creator | Prompt |") + "\n|---|---|---|---|---|";
const row = (c, l) => `| [${esc(title(c, l))}](${c.url}) | ${ver(c)} | ${vs(c)} | [@${c.author.handle}](https://x.com/${c.author.handle}) | ${c.prompt ? `[${c.prompt.kind === "full" ? (l === "zh" ? "完整提示词" : "Full prompt") : (l === "zh" ? "一句话指令" : "Brief")}](${detail(c, l)})` : "—"} |`;
const inCat = (k) => cases.filter((c) => c.category === k);
for (const [k, en, zh] of CATS) {
  const list = inCat(k);
  if (!list.length) continue; // 没有作品的分类不出空表（README 也只列有作品的）
  for (const l of ["en", "zh"]) {
    const top = l === "zh" ? `# ${zh}\n\n共 ${list.length} 个作品${list.some((c) => c.prompt) ? `，其中 ${list.filter((c) => c.prompt).length} 个附提示词` : ""}，按原帖播放量排。标题链接到 X 原帖，提示词链接到带原文和出处的页面。`
      : `# ${en}\n\n${list.length} works${list.some((c) => c.prompt) ? `, ${list.filter((c) => c.prompt).length} with a prompt` : ""}, by views on the original post. Titles link to the original post on X; prompt links open the page with the original text and its source.`;
    fs.writeFileSync(path.join(OUT, "cases", `${k}${l === "zh" ? ".zh-CN" : ""}.md`), `${top}\n\n${head(l)}\n${list.map((c) => row(c, l)).join("\n")}\n`);
  }
}
// 首屏 8 个：完整提示词优先，再一句话指令，不够用浏览量最高的作品补（没有提示词的链到 X 原帖）；数据本身按播放量排
const featured = [...withP.filter((c) => c.prompt.kind === "full"), ...withP.filter((c) => c.prompt.kind !== "full"), ...cases.filter((c) => !c.prompt)].slice(0, 8);
const grid = (l) => !featured.length ? "" : "<table>\n" + [0, 4].filter((o) => featured.length > o).map((o) => "  <tr>\n" + featured.slice(o, o + 4).map((c) => `    <td width="25%" align="center"><a href="${c.prompt ? detail(c, l) : c.url}"><img src="${thumb(c.media[0])}" width="200" alt="${title(c, l).replace(/"/g, "&quot;")}"></a><br><sub>${title(c, l)}</sub></td>`).join("\n") + "\n  </tr>").join("\n") + "\n</table>";
const tally = (field, labels) => Object.entries(cases.reduce((a, c) => (c[field].forEach((k) => (a[k] = (a[k] || 0) + 1)), a), {})).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${labels[k] || cap(k)} ${n}`).join(" · ");
const date = (src.updatedAt || "").slice(0, 10);
const n = (x) => x.toLocaleString("en-US");
const anchor = (s) => s.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, "").replace(/ /g, "-");
// README 每个分类列前 8 个：带提示词的优先，其余按播放量
const sec = (l) => CATS.filter(([k]) => inCat(k).length).map(([k, en, zh]) => { const list = inCat(k); const top = [...list.filter((c) => c.prompt), ...list.filter((c) => !c.prompt)].slice(0, 8);
  return `## ${l === "zh" ? zh : en}\n\n${l === "zh" ? `${list.length} 个作品 · [完整清单](cases/${k}.zh-CN.md)` : `${list.length} works · [full list](cases/${k}.md)`}\n\n${head(l)}\n${top.map((c) => row(c, l)).join("\n")}\n`; }).join("\n");
const readme = (l) => l === "zh" ? `# Gemini 4 提示词合集

[English](README.md) | 简体中文

X 上的创作者让 **Gemini 4**（Argon、Carbon、Hydrogen 等版本）**写代码**做出来的作品：3D 场景、物理与材质模拟、机械剖面、游戏、网页和 SVG。共 **${cases.length}** 个，原帖播放都过 ${n(src.threshold)}，合计 ${n(cases.reduce((s, c) => s + c.stats.views, 0))} 次播放；其中 **${versus.length}** 个是和 Claude、GPT 等模型的同题对比，**${withP.length}** 个附作者公开的提示词（${withP.filter((c) => c.prompt.kind === "full").length} 条完整提示词）。每天自动更新（最近一次：${date}）。

在线浏览（视频直接播放、提示词一键复制、按版本和对比对象筛选）：**[jasonzhu.ai/zh/prompts/gemini-4](${SITE}/zh/prompts/gemini-4)**

${grid("zh")}

${CATS.filter(([k]) => inCat(k).length).map(([k, , zh]) => `[${zh}](#${anchor(zh)})（${inCat(k).length}）`).join(" · ")}

- **版本**（一个帖子写了几个版本就各算一次）：${tally("models", ML)}
- **同题对比的对象**：${tally("rivals", RL)}

${sec("zh")}
## 收录标准

- 创作者本人的原帖，视频或图片是原帖自带的，原帖播放不低于 ${n(src.threshold)}（快照 ${(src.statsCheckedAt || "").slice(0, 10)}）。
- 作者自己写的正文说用了 Gemini 4，只在引用别人帖子里提到的不算。只收 Gemini 4 写代码做出来的东西；Nano Banana、Imagen、Veo 直接出的图和视频不收。同题对比照收。
- 版本按作者的写法标注。**模型归属以作者自述为准，没有逐条复现。**
- 提示词只收作者本人公开的：原帖正文、作者自己的回复、回复里的截图、作者给的链接，原文照录。没公开提示词的作品照常收录，提示词一栏留空。
- 转发、官方演示、平台推广不收。

## 数据

[\`cases.json\`](cases.json) 是全部作品的结构化数据：原帖链接、创作者、分类、版本、对比对象、媒体、播放量快照、提示词出处。

## 更正与下架

所有作品版权归原作者，收录不代表获得任何授权。创作者想更正署名或下架，开一个 Issue，或在 X 私信 [@GoSailGlobal](https://x.com/GoSailGlobal)。

同系列：[Claude 5.5 视频提示词](https://github.com/zhuyansen/awesome-opus-5.5-video) · [ChatGPT Images 2.6 提示词](https://github.com/zhuyansen/awesome-chatgpt-images-2.6)。由 [JasonZhu.AI](${SITE}) 整理。
` : `# Awesome Gemini 4 Prompts

English | [简体中文](README.zh-CN.md)

What creators on X had **Gemini 4** (Argon, Carbon, Hydrogen and other versions) **build in code**: 3D scenes, physics and material sims, machine cutaways, games, web pages and SVG. **${cases.length}** works, each with ${n(src.threshold)}+ views on the original post (${n(cases.reduce((s, c) => s + c.stats.views, 0))} in total); **${versus.length}** are same-prompt comparisons against Claude, GPT and others, and **${withP.length}** include the prompt the creator shared (${withP.filter((c) => c.prompt.kind === "full").length} full prompts). Updated daily (last update: ${date}).

Browse with playable videos, one-click copy and filters by version and rival model: **[jasonzhu.ai/en/prompts/gemini-4](${SITE}/en/prompts/gemini-4)**

${grid("en")}

${CATS.filter(([k]) => inCat(k).length).map(([k, en]) => `[${en}](#${anchor(en)}) (${inCat(k).length})`).join(" · ")}

- **Versions** (a post naming several counts for each): ${tally("models", ML)}
- **Compared with**: ${tally("rivals", RL)}

${sec("en")}
## What gets included

- The creator's own post, with the video or images attached, and at least ${n(src.threshold)} views on that post (snapshot: ${(src.statsCheckedAt || "").slice(0, 10)}).
- The creator's own text says Gemini 4 made it; a mention only inside a quoted post doesn't count. Only things Gemini 4 built in code are listed; images and clips straight out of Nano Banana, Imagen or Veo are left out. Same-prompt comparisons are included.
- Versions follow the creator's own words. **Model attribution is as stated by each creator and was not independently reproduced.**
- Prompts come only from the creator: the post itself, their own reply, a screenshot in a reply, or a link they shared, kept verbatim. Works without a published prompt are still listed, with the prompt column left empty.
- Reposts, official demos and platform promotions are left out.

## Data

[\`cases.json\`](cases.json) holds every work as structured data: original post, creator, category, version, rival models, media, view snapshot and prompt source.

## Corrections and removal

All works belong to their creators; inclusion grants no license. Creators can open an issue or DM [@GoSailGlobal](https://x.com/GoSailGlobal) on X to correct attribution or remove a work.

Same series: [Claude 5.5 video prompts](https://github.com/zhuyansen/awesome-opus-5.5-video) · [ChatGPT Images 2.6 prompts](https://github.com/zhuyansen/awesome-chatgpt-images-2.6). Curated by [JasonZhu.AI](${SITE}).
`;
fs.writeFileSync(path.join(OUT, "README.md"), readme("en"));
fs.writeFileSync(path.join(OUT, "README.zh-CN.md"), readme("zh"));
console.log(`✅ ${REPO}：${cases.length} 个作品（带提示词 ${withP.length}，同题对比 ${versus.length}）→ ${OUT}`);
