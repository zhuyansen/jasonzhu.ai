/** 终审：把「审核拿不准」的作品交给 Opus 拍板。daily.mjs 和 arbitrate-pending.mjs 共用。 */
import fs from "node:fs";
import path from "node:path";
import { arbiterJSON } from "./llm.mjs";

const PROMPT = fs.readFileSync(path.join(import.meta.dirname, "..", "prompts", "arbitrate.md"), "utf8");
const headTail = (t) => (t.length <= 1600 ? t : `${t.slice(0, 1100)}\n…[${t.length - 1500} characters omitted]…\n${t.slice(-400)}`);

/**
 * @param items [{ candidate, classified, extracted, audit, reasons, thread? }]
 * @returns {{ decisions: Record<string, object>, failed: Record<string, string> }}
 */
export async function arbitrate(items, log = console.log) {
  const input = (x) => ({
    id: x.candidate.id, handle: x.candidate.handle, views: x.candidate.views, root_text: x.candidate.text.slice(0, 2500),
    thread: (x.thread || []).slice(0, 8).map((t) => String(t.text || t).slice(0, 500)),
    category: x.classified.category, title_en: x.classified.title_en, title_zh: x.classified.title_zh, summary_en: x.extracted.summary_en || "",
    prompt: x.extracted.prompt ? { kind: x.extracted.prompt.kind, source: x.extracted.prompt.source, text: x.extracted.prompt.text ? headTail(x.extracted.prompt.text) : null } : null,
    concerns: x.reasons,
  });
  const decisions = {}, failed = {};
  const go = async (part, tag) => {
    const ids = new Set(part.map((x) => x.candidate.id));
    try {
      const { json, via } = await arbiterJSON(`${PROMPT}\n\n## Input\n\n${JSON.stringify(part.map(input), null, 1)}`, { label: `终审 ${tag}`,
        validate: (j) => (!Array.isArray(j) ? "not an array" : j.length !== part.length || !j.every((d) => ids.has(d.id)) ? "id set mismatch"
          : j.some((d) => !["publish", "reject"].includes(d.decision) || typeof d.keep_prompt !== "boolean") ? "bad fields" : null) });
      for (const d of json) decisions[d.id] = { ...d, via };
      log(`  终审 ${tag}: ${part.length} 条 via ${via}`);
    } catch (e) {
      if (part.length === 1) { failed[part[0].candidate.id] = String(e.message).slice(0, 120); return; }
      const mid = Math.ceil(part.length / 2);
      await go(part.slice(0, mid), `${tag}a`); await go(part.slice(mid), `${tag}b`);
    }
  };
  for (let i = 0; i < items.length; i += 10) await go(items.slice(i, i + 10), String(i / 10 + 1));
  return { decisions, failed };
}

/** 把终审结果应用到一条待审记录上，返回要写入 extracted.json 的记录，或 null（否决） */
export function applyDecision(x, d) {
  if (d.decision === "reject") return null;
  const k = x.classified;
  if (d.title_en && d.title_zh) { k.title_en = d.title_en.slice(0, 80); k.title_zh = d.title_zh.slice(0, 60); }
  if (["product", "motion", "education", "stories", "art3d", "game", "production", "comparison"].includes(d.category)) k.category = d.category;
  const pr = x.extracted.prompt;
  const keep = d.keep_prompt && pr && (pr.text || pr.source === "link");
  return { ...x.extracted, prompt: keep ? pr : null, note: [x.extracted.note, `终审 ${d.via}: ${d.reason}`].filter(Boolean).join(" | ") };
}
