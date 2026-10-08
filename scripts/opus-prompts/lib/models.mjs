/**
 * 作品用的是哪个 Claude 5.5 模型：按作者本人的文字判断（主帖 + 回复 + 定位到的提示词）。
 * 两个都提到（常见于 Sonnet 5.5 vs Opus 5.5 对比）就两个都标。都没提到按 Opus 5.5 处理（库的起点）。
 */
export const MODELS = { "opus-5.5": /opus\s?-?5[.\-]?5/i, "sonnet-5.5": /sonnet\s?-?5[.\-]?5/i, "haiku-5.5": /haiku\s?-?5[.\-]?5/i, "fable-5.5": /fable\s?-?5[.\-]?5/i };
/** Fable 5.5 截至 2026-10-03 只在内测、未官宣：作者对「是不是 Fable 5.5」自己都不确定的（(maybe) / maybe Fable / 疑似 Fable）不算；「据说要发布」说的是发布时间，不算 */
export const HEDGED = /\(maybe\)|maybe\s+(?:claude\s+)?fable|probably\s+(?:claude\s+)?fable|might\s+be\s+(?:claude\s+)?fable|(?:疑似|可能是|好像是)\s*fable/i;
export function detectModels(...texts) {
  const t = texts.filter(Boolean).join("\n");
  let hit = Object.entries(MODELS).filter(([, re]) => re.test(t)).map(([k]) => k);
  if (!hit.length) return ["opus-5.5"];
  // 只提到「可能是 Fable 5.5」→ 返回空数组，assemble 会把这条排除（不能落回默认的 Opus）
  if (hit.includes("fable-5.5") && HEDGED.test(t)) hit = hit.filter((k) => k !== "fable-5.5");
  return hit;
}
