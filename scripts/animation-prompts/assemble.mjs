// 组装 Claude 动画提示词库 → src/content/animation-prompts/animation.json，这个库唯一写数据的地方。
//   v1 只有种子：每次都从 Claude 5.5 库（src/content/opus-prompts/cases.json）重新挑，所以播放量跟着 Claude 库的每周核验更新，
//   Claude 库下架的作品这里也跟着消失。人工把关在 data/curation.json（drop / include / category）。
// 用法：node scripts/animation-prompts/assemble.mjs [--write] [--report]   然后 node scripts/generate-animation-prompts.mjs
//   --report 按分类列出选中作品的标题，方便抽查误收。
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "../..");
const OPUS = path.join(ROOT, "src/content/opus-prompts/cases.json");
const OUT = path.join(ROOT, "src/content/animation-prompts/animation.json");
const CURATION = path.join(import.meta.dirname, "data/curation.json");

export const CATEGORIES = ["motion", "explainer", "story", "anim3d", "webui", "codeart"];

/*
 * ── 选取规则 ──
 * Claude 库里每个作品都是视频（录屏或渲染出来的片子），所以「是不是动画」要看作品本身是什么，不能看有没有视频。
 * 只看作品自己的文字：标题、摘要（中英）、作者公开的提示词、作者列出的工具。不看引用别人的帖子。
 *
 *   1. motion（Claude 库「动效设计」）：默认收。剔掉三种：
 *      - 主要靠视频生成模型（Seedance、Higgsfield、Kling…）出片、文字里又没说是动画的（多是写实短片，不是动画）；
 *      - 产出是静态图；
 *      - 产出是没有动效的 App / 字体 / 工具网站（「有动效的网页」留下，归 webui）。
 *   2. education / stories / product（科普、角色故事、产品广告）：这三类在 Claude 库里本来就是「Claude 做的片子」，
 *      收「明说是动画」或「产出是视频且不是视频生成模型出的片」的；只是互动网页、App、图片的不收。
 *   3. art3d / comparison（3D 场景、模型对比）：只收标题 / 摘要 / 工具里明说是动画的（STRONG）；
 *      production（制作流程）只认标题 / 摘要里的字（STRONG_WORDS）：After Effects、HyperFrames 也常用来剪实拍素材。
 *      互动 3D 场景、剪辑流程、一般的同题对比不收。
 *   4. game：不收（可玩的游戏不是这个库要的东西），个别动画作品走 curation.include。
 *   所有类别：标题说产出是工具、App、网站、可玩的东西（TOOL_TITLE），标题里又没说是动画 / 宣传片的，不收。
 * 最后 curation.drop 剔掉人工抽查出来的误收，curation.include 补规则漏掉的。
 */
// 明说产出是动画：动画、动效、短片、卡通、火柴人、动画工具（Remotion、Manim、GSAP、Lottie、HyperFrames、After Effects）
const STRONG = /animat|motion graphic|motion design|motion video|kinetic typograph|explainer video|animated explainer|short film|cartoon|stick[\s-]?(figure|man)|remotion|manim|\bgsap\b|lottie|hyperframes|after effects|showreel|title sequence|logo reveal|\banime\b|pixar|claymation|stop[\s-]motion|动画|动效|短片|卡通|火柴人|片头/i;
// 同上，去掉工具名（制作流程类用）
const STRONG_WORDS = /animat|motion graphic|motion design|motion video|kinetic typograph|explainer|short film|cartoon|stick[\s-]?(figure|man)|showreel|title sequence|logo reveal|\banime\b|claymation|动画|动效|卡通|火柴人/i;
// 产出是一段片子
const VIDEO = /\bvideos?\b|\bfilm\b|documentary|\bedit\b|trailer|music video|promo|commercial|\bads?\b|\breel\b|视频|纪录片|宣传片|广告|预告|\bMV\b|影片/i;
// 视频生成模型（片子是它们出的，Claude 只是调度）
const VIDEO_GEN = /seedance|higgsfield|kling|\bveo\b|\bsora\b|grok imagine|hailuo|runway|pollo|\bwan\s?2|luma|\bpika\b|minimax h\d|\bh3\b|fish creative|filmera|capcut ai/i;
// 产出是静态图
const STATIC = /^an? (image|poster|illustration|still|photo|wallpaper|picture)\b|\b(a|an) (static|still) image\b|一张(图|海报|插画)/i;
// 产出是 App、工具或可玩的东西（不是动画）
const APP = /\b(ios|android|mobile) app\b|\bweb app\b|\bplayable\b|\bfont\b|\bportfolio\b|\bcalendar app\b|\bdashboard\b|\bgame\b|游戏|应用/i;
// 有动效的网页 / 界面（这类留下，归 webui）
const WEB_MOTION = /scroll|hover|transition|micro[\s-]?interaction|loader|loading animation|landing page|website|web page|webpage|\bui\b|\bcss\b|\bsvg\b|component|界面|网页|网站|交互/i;

// 标题说明产出是工具、App、可玩的东西（「XX 生成器」「XX 工具演示」「可玩的 3D 场景」），除非标题本身也说是动画 / 宣传片
const TOOL_TITLE = /\b(generator|tool|plugin|\bmod\b|extension|app\b|interface|dashboard|town|landing page|website|playable|game|font|portfolio|calendar)\b/i;
const TITLE_ANIM = /animat|motion|promo|trailer|\bad\b|launch (video|film)|intro video|film|short|cartoon|music video/i;
const ownText = (c) => [c.title?.en, c.title?.zh, c.summary?.en, c.summary?.zh, c.prompt?.text].filter(Boolean).join("\n");
const descText = (c) => [c.title?.en, c.title?.zh, c.summary?.en, c.summary?.zh].filter(Boolean).join("\n");
const toolText = (c) => (c.tools || []).join(" ");

export function selectReason(c) {
  const own = ownText(c), desc = descText(c), tools = toolText(c);
  const strong = STRONG.test(own) || STRONG.test(tools);
  const video = VIDEO.test(desc);
  const genOnly = VIDEO_GEN.test(`${own}\n${tools}`) && !strong;
  const still = STATIC.test(c.summary?.en || "") && !strong;
  const toolTitle = TOOL_TITLE.test(c.title?.en || "") && !TITLE_ANIM.test(c.title?.en || "");
  if (toolTitle) return null;
  // 「互动网页 / 互动作品」：标题、摘要里没说有动画的，是网页不是动画
  if (/^interactive\b|interactive (site|website|web ?page|artifact|experience|tool|app)/i.test(c.title?.en || "") && !STRONG.test(desc)) return null;
  switch (c.category) {
    case "motion":
      if (genOnly) return null;
      if (still) return null;
      if (APP.test(desc) && !strong && !video && !WEB_MOTION.test(desc)) return null;
      return "motion-category";
    case "education": case "stories": case "product":
      if (strong) return "strong";
      if (video && !genOnly && !still && !APP.test(desc)) return "code-video";
      return null;
    case "production":
      // 制作流程：After Effects、HyperFrames 这类工具也用来剪实拍素材，所以只认文字里明说的动画，不认工具名
      return STRONG_WORDS.test(desc) ? "strong" : null;
    case "art3d": case "comparison":
      // 这两类只看标题、摘要、工具：长提示词里顺手写的「加点动画」不算（互动 3D 场景的提示词常这么写）。
      // 「卡通风格的可浏览 3D 场景」这种：STRONG 只来自画风，作品是能拖动旋转的场景，没说有动画或视频，不收。
      if (/orbit|browsable|explorable|interactive|playable|controls/i.test(desc) && !/animat|动画|video|film|视频|loop/i.test(desc)) return null;
      return STRONG.test(desc) || STRONG.test(tools) ? "strong" : null;
    default:
      return null; // game
  }
}

/*
 * ── 分类：按动画本身是什么分，不按模型 ──
 * 顺序很重要：先看技法明确的（数学 / 代码艺术、网页动效、3D），再看题材（故事、讲解），剩下的都是动效与宣传片。
 */
// 只拿英文标题、英文摘要和工具来分（中文标题是翻译，词更散；没有摘要的作品靠标题）
const RX = {
  // 数学 / 代码艺术：Manim、p5.js、着色器、分形、数学证明，以及 3Blue1Brown 风格的讲解
  codeart: /manim|\bp5(\.js)?\b|3blue1brown|generative|creative coding|demoscene|particles?\b|fractal|mathemat|\bmath\b|equation|\bproof\b|geometry|calculus|derivative/i,
  anim3d: /blender|three\.?js|unreal|webgpu|\bwebgl\b|\b3d\b|cinema 4d|\bc4d\b|tripo|voxel|claymation|pixar/i,
  story: /\bstory\b|stories|character|short film|animated short|cartoon|stick[\s-]?(figure|man)|\banime\b|music video|narrat|fairy ?tale|folktale|comic|manga|skit|parody/i,
  explainer: /explain|lesson|educat|science|scientific|history|historical|documentary|how .{1,40} works|visuali[sz]ation of|anatomy|teach/i,
};
// 网页与界面动效：只认标题里写明是网页 / 界面 / 组件、标题又不是「宣传片 / 视频」的，或工具里有 GSAP、Lottie（摘要里「为某网站做的宣传片」不算）
const WEBUI_TITLE = /\bui\b|website|web ?page|web hero|hero section|bento|paywall|interface|\bsvg\b|onboarding|preloader|loader|component|screen|scroll|hover|micro[\s-]?animation|\bcss\b|\bsite\b/i;
const VIDEO_TITLE = /video|film|showreel|reel\b|promo|trailer|commercial|\bad\b|\bads\b|launch/i;
const isWebUi = (c) => (WEBUI_TITLE.test(c.title?.en || "") && !VIDEO_TITLE.test(c.title?.en || "")) || /\bgsap\b|lottie/i.test(toolText(c));
export function categorize(c) {
  const title = c.title?.en || "";
  const en = `${title}\n${c.summary?.en || ""}\n${toolText(c)}`;
  const codeart = RX.codeart.test(en) || /manim/i.test(c.prompt?.text || "");
  // 题材明确的三类先按题材：讲解（数学 / Manim 的归代码与数学）、故事（3D 渲染的归 3D 动画）、产品宣传片
  if (c.category === "education") return codeart ? "codeart" : "explainer";
  if (c.category === "stories") return /blender|unreal|\b3d\b|pixar|claymation/i.test(en) ? "anim3d" : "story";
  if (c.category === "product") return isWebUi(c) ? "webui" : "motion";
  if (codeart) return "codeart";
  if (isWebUi(c)) return "webui";
  if (RX.anim3d.test(en)) return "anim3d";
  if (RX.story.test(en)) return "story";
  if (RX.explainer.test(en)) return "explainer";
  return "motion";
}

const opus = JSON.parse(fs.readFileSync(OPUS, "utf8"));
const CUR = JSON.parse(fs.readFileSync(CURATION, "utf8"));
const stat = { source: opus.cases.length, byRule: 0, curatedIn: 0, curatedOut: 0, categoryOverride: 0 };
const cases = [];
for (const c of opus.cases) {
  let reason = selectReason(c);
  if (reason) stat.byRule++;
  if (CUR.drop[c.id]) { if (reason) stat.curatedOut++; continue; }
  if (!reason && CUR.include[c.id]) { reason = "curation"; stat.curatedIn++; }
  if (!reason) continue;
  let category = categorize(c);
  if (CUR.category[c.id]) { category = CUR.category[c.id]; stat.categoryOverride++; }
  if (!CATEGORIES.includes(category)) throw new Error(`${c.id} 分类不对：${category}`);
  const v = c.video;
  cases.push({
    id: c.id, url: c.url, author: c.author, postedAt: c.postedAt, addedAt: c.addedAt, lang: c.lang,
    models: c.models?.length ? c.models : ["opus-5.5"], category, sourceCategory: c.category,
    title: c.title, summary: c.summary || null, prompt: c.prompt || null,
    referenceAssets: !!c.referenceAssets, tools: c.tools || [], resources: c.resources || [],
    stats: c.stats,
    media: [{ type: "video", url: v.mp4, poster: v.poster, width: v.width, height: v.height, durationSec: v.durationSec }],
    evidence: { via: "seed-from-claude-library", selectedBy: reason, modelAttribution: "creator-stated, not independently reproduced" },
  });
}
// curation 里写了、但 Claude 库已经没有的作品（下架了）：提示一下，组装不受影响
const known = new Set(opus.cases.map((c) => c.id));
const stale = [...Object.keys(CUR.drop), ...Object.keys(CUR.include), ...Object.keys(CUR.category)].filter((id) => !id.startsWith("_") && !known.has(id));
if (stale.length) stat.curationStale = stale.length;

cases.sort((a, b) => b.stats.views - a.stats.views);
const out = {
  library: "claude-animation", model: "Claude 5.5 (Opus 5.5 · Sonnet 5.5 · Haiku 5.5 · Fable 5.5)", threshold: opus.threshold,
  updatedAt: opus.updatedAt, statsCheckedAt: opus.statsCheckedAt,
  inclusionRule: "Selected from the Claude 5.5 library (original post by the creator, video attached, >= 5000 views, creator says a Claude 5.5 model made it): works whose output is an animation — motion graphics, animated explainers, cartoon and character stories, 3D animation, web/UI motion, code and math animation. Interactive apps, playable games, static images and live-action clips from video-generation models are left out. Rule in scripts/animation-prompts/assemble.mjs, manual overrides in data/curation.json.",
  cases,
};
if (process.argv.includes("--write")) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
}
const per = Object.fromEntries(CATEGORIES.map((k) => [k, `${cases.filter((c) => c.category === k).length}/${cases.filter((c) => c.category === k && c.prompt).length}`]));
const src = {}; for (const c of cases) src[c.sourceCategory] = (src[c.sourceCategory] || 0) + 1;
console.log(JSON.stringify(stat), "| cases:", cases.length, "| with prompt:", cases.filter((c) => c.prompt).length);
console.log("per category (works/with prompt):", JSON.stringify(per), "| from Claude categories:", JSON.stringify(src));
if (process.argv.includes("--report")) {
  for (const k of CATEGORIES) {
    console.log(`\n## ${k}`);
    for (const c of cases.filter((x) => x.category === k)) console.log(`${c.id} ${c.prompt ? "P" : " "} [${c.sourceCategory}] ${c.title.en} || ${(c.summary?.en || "").slice(0, 110)}`);
  }
}
