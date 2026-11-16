/**
 * Gemini 4 合集的配置：分类表、子模型和对比对象识别。seed-from-opus.mjs 和以后的每日收录共用。
 *
 * 和 Claude 库一样收「模型写代码做出来的视觉作品」（Three.js / WebGL / Blender 脚本 / SVG / 网页），
 * 但 Gemini 4 的作品绝大多数是和 Claude、GPT 的同题对比，所以分类按作品题材分，另外记子模型和对比对象。
 */

export const LIBRARY = { id: "gemini-4", name: "Gemini 4", released: "2026-10-14T00:00:00Z" };

/** 题材分类（和 src/lib/gemini-prompts-shared.ts 的 GEMINI_CATEGORIES 保持一致） */
export const CATEGORIES = ["scene3d", "physics", "mechanics", "game", "sim", "ui", "svg", "motion"];

/** Gemini 4 家族的子模型（帖子里的写法 → 键名） */
export const SUB_MODELS = ["argon", "carbon", "hydrogen", "krypton", "pro", "flash", "ultra"];

// 「Gemini 4」后面跟数字或 o 的不算（Gemini 4o、Gemini 40…）；1965 年的 Gemini 4 航天任务另由分类剔除
const GEMINI4 = /gemini[\s-]?4(?:\.\d)?(?:[\s-]+(argon|carbon|hydrogen|krypton|pro|flash|ultra))?(?![\do])/gi;
// 推文里常把子模型单独写（「Argon vs Opus 5.5」），只在已经确认提到 Gemini 4 的帖子里补认
const BARE = /\b(argon|carbon|hydrogen|krypton)\b/gi;

/** 作者本人文字里有没有说是 Gemini 4（只看作者自己写的，不看引用的别人帖子） */
export const mentionsModel = (text) => new RegExp(GEMINI4.source, "i").test(text || "");

/** 帖子提到的子模型；只说「Gemini 4」没说哪个的记 "gemini-4" */
export function subModelsOf(text) {
  const t = text || "";
  const out = new Set();
  for (const m of t.matchAll(GEMINI4)) out.add(m[1] ? m[1].toLowerCase() : "gemini-4");
  if (out.size) for (const m of t.matchAll(BARE)) out.add(m[1].toLowerCase());
  if (out.size > 1) out.delete("gemini-4");
  return SUB_MODELS.filter((k) => out.has(k)).concat(out.has("gemini-4") ? ["gemini-4"] : []);
}

/** 同一帖子里和 Gemini 4 一起比的模型，按厂商归组 */
const RIVALS = [
  ["claude", /\b(?:claude|opus|sonnet|haiku|fable)\b/i],
  ["gpt", /\b(?:gpt[\s-]?\d|chatgpt[\s-]?\d|astra|terra|sol\s?6|6\.1\s?sol)\b/i],
  ["kimi", /\bkimi\b/i],
  ["deepseek", /\bdeepseek\b/i],
  ["grok", /\bgrok\b/i],
  ["qwen", /\bqwen\b/i],
  ["minimax", /\bminimax\b/i],
  ["muse", /\bmuse\s?(?:wonder|spark)/i],
];
export const rivalsOf = (text) => RIVALS.filter(([, re]) => re.test(text || "")).map(([k]) => k);

/**
 * Jev 审核用语（../../opus-prompts/lib/jev.mjs）。键名和 Claude 库一致（阈值逻辑按键名算），只换说明文字：
 * 同题对比是这个库的主体；图片 / 视频模型直接出的片不是「代码做的」，归进 non_visual。
 */
export const JEV_PROFILE = {
  intro: "Posts on X that mention Gemini 4 (Google's model; versions Argon, Carbon, Hydrogen, Krypton, Pro) and have media attached. The library collects things the model built in code: 3D scenes, physics sims, games, websites, SVG. Judge each post on its own.",
  kind: {
    own_work: "The poster shows something they had the AI build in code (3D scene, simulation, game, website, SVG, code-driven animation), as a screen recording or screenshot",
    own_comparison: "The poster gave the same prompt to Gemini 4 and other AI models themselves and shows the outputs side by side",
    repost: "The poster showcases somebody else's result (aggregator, fan or news account, 'someone made this', 'credit: @…')",
    tutorial_or_talk: "A tutorial, walkthrough, course promo, talking head, podcast or interview clip",
    news: "A launch announcement, official demo, feature news, pricing, benchmark chart or leaderboard",
    commentary: "Commentary, opinion, a joke or meme, a reaction, or 'Gemini 4' meaning something else (the 1965 NASA mission)",
    non_visual: "Media made directly by an image or video model (Nano Banana, Veo, Imagen…), or a non-visual tool where the video is just a screen demo of software",
  },
  prompt: {
    usable: "A self-contained instruction someone could paste to a coding model to get a comparable result",
    followup: "A follow-up message from the middle of a longer session (refers to earlier work: 'now add', 'continue', 'fix that')",
    fragment: "Only part of an instruction, cut off or clearly incomplete",
    commentary: "The creator's commentary, scores, timings or prices, not the instruction itself",
    for_other_model: "An instruction written for a different tool (an image or video generator), not the creator's instruction to the coding model",
    empty: "Has no real content about what to make ('have fun', 'make no mistakes', 'show off')",
    needs_attachment: "Meaningless without an attachment or reference the reader cannot see ('make a similar one', 'recreate it')",
  },
};

/** 官方和平台账号：发的是官方演示或平台推广，按收录标准不收 */
const PLATFORM_HANDLES = new Set(["googledeepmind", "google", "googleai", "geminiapp", "googlegemini", "googleaistudio", "officiallogank", "lmarena_ai", "higgsfield_ai", "fal", "replicate", "openrouterai"]);
export const isPlatformAccount = (handle) => PLATFORM_HANDLES.has(String(handle || "").toLowerCase());
