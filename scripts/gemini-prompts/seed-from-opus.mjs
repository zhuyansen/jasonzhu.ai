#!/usr/bin/env node
/**
 * 检查种子：Claude 5.5 库里有没有新出现、提到 Gemini 4 但还没定题材的作品（逻辑在 lib/seeds.mjs）。
 * 有就报错并列出 ID，在 data/seed-curation.json 的 category 里补上（或在 dropSeed 里写明不收的原因），再跑 assemble。
 * 不花钱、不调模型。写库由 assemble.mjs 负责（种子 + 每日收录一起组装）。
 *
 * 用法：node scripts/gemini-prompts/seed-from-opus.mjs
 *       node scripts/gemini-prompts/assemble.mjs --write && node scripts/generate-gemini-prompts.mjs
 */
import { buildSeeds } from "./lib/seeds.mjs";

const count = (list, k) => Object.fromEntries([...new Set(list.flatMap((c) => [].concat(c[k])))].map((x) => [x, list.filter((c) => [].concat(c[k]).includes(x)).length]));
try {
  const { seeds, gone } = buildSeeds({ strict: true });
  console.log(`种子 ${seeds.length} 个（带提示词 ${seeds.filter((s) => s.prompt).length}）`);
  console.log("题材", count(seeds, "category"));
  console.log("子模型", count(seeds, "models"));
  console.log("对比对象", count(seeds, "rivals"));
  if (gone.length) console.log(`⚠️ 分类表里有 ${gone.length} 个已不在 Claude 库（被下架了）：${gone.join(", ")}`);
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
