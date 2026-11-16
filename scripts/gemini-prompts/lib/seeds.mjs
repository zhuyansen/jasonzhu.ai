/**
 * 种子：Claude 5.5 库里作者本人正文提到 Gemini 4 的作品（2026-11-16 建库时导入）。
 *
 *   源    src/content/opus-prompts/cases.json（已过 Jev 审核和 Opus 终审）+ scripts/opus-prompts/data/candidates.json（原帖文字）
 *   范围  data/seed-curation.json 的 category 里列出的那些（题材是人工逐条定的）；dropSeed 是人工剔掉的
 *   用途  assemble.mjs 每次组装时调用，所以种子的播放量跟着 Claude 库的每周核验更新；Claude 库下架的作品这里也跟着消失
 *
 * strict：Claude 库里出现了提到 Gemini 4、但分类表里没有的作品时报错（seed-from-opus.mjs 用它检查要不要补分类）；
 * 非 strict（assemble.mjs）只跳过——这些新作品每日收录通常也会自己收到。
 */
import fs from "node:fs";
import path from "node:path";
import { CATEGORIES, mentionsModel, subModelsOf, rivalsOf } from "./profile.mjs";

const ROOT = path.join(import.meta.dirname, "../../..");
const OPUS = path.join(ROOT, "src/content/opus-prompts/cases.json");
const CAND = path.join(ROOT, "scripts/opus-prompts/data/candidates.json");
const CURATION = path.join(import.meta.dirname, "../data/seed-curation.json");
// 作者把 Gemini 4 只写在工具列表里、正文写成「4 Argon」的：人工确认过的放这里
const TOOL_ONLY_OK = new Set(["2110078803297055212"]);

export function buildSeeds({ strict = false } = {}) {
  const opus = JSON.parse(fs.readFileSync(OPUS, "utf8"));
  const cand = new Map(JSON.parse(fs.readFileSync(CAND, "utf8")).map((c) => [c.id, c]));
  const curation = JSON.parse(fs.readFileSync(CURATION, "utf8"));
  const problems = [], unclassified = [];
  const seeds = [];
  for (const c of opus.cases) {
    const text = cand.get(c.id)?.text || "";
    const own = mentionsModel(text) || (TOOL_ONLY_OK.has(c.id) && (c.tools || []).some((t) => mentionsModel(t)));
    if (!own || curation.dropSeed[c.id]) continue;
    const category = curation.category[c.id];
    if (!CATEGORIES.includes(category)) { unclassified.push(c.id); continue; }
    const said = TOOL_ONLY_OK.has(c.id) ? `${text}\n${(c.tools || []).join(" ")}` : text;
    const v = c.video;
    seeds.push({
      id: c.id, url: c.url, author: c.author, postedAt: c.postedAt, addedAt: c.addedAt, lang: c.lang,
      models: subModelsOf(said), rivals: rivalsOf(text), category,
      title: c.title, summary: c.summary || null, prompt: c.prompt || null,
      referenceAssets: !!c.referenceAssets, tools: c.tools || [], resources: c.resources || [],
      stats: c.stats,
      media: [{ type: "video", url: v.mp4, poster: v.poster, width: v.width, height: v.height, durationSec: v.durationSec }],
      evidence: { via: "seed-from-claude-library", seed: true, modelAttribution: "creator-stated, not independently reproduced" },
    });
  }
  for (const id of unclassified) problems.push(`${id} 没有题材分类（在 data/seed-curation.json 里补）`);
  const gone = Object.keys(curation.category).filter((id) => !seeds.some((s) => s.id === id));
  if (strict && problems.length) throw new Error(`${problems.length} 个问题：\n  ${problems.join("\n  ")}`);
  return { seeds, unclassified, gone, threshold: opus.threshold };
}
