/**
 * 作品用的是哪个 Claude 5.5 模型：按作者本人的文字判断（主帖 + 回复 + 定位到的提示词）。
 * 两个都提到（常见于 Sonnet 5.5 vs Opus 5.5 对比）就两个都标。都没提到按 Opus 5.5 处理（库的起点）。
 */
export const MODELS = { "opus-5.5": /opus\s?-?5[.\-]?5/i, "sonnet-5.5": /sonnet\s?-?5[.\-]?5/i };
export function detectModels(...texts) {
  const t = texts.filter(Boolean).join("\n");
  const hit = Object.entries(MODELS).filter(([, re]) => re.test(t)).map(([k]) => k);
  return hit.length ? hit : ["opus-5.5"];
}
