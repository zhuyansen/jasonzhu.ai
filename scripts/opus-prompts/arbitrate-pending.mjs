#!/usr/bin/env node
/** 对现有待审队列（data/pending.json）跑一次 Opus 终审：通过的并入正式数据，否决的丢弃，终审失败的留在队列。 */
import fs from "node:fs";
import path from "node:path";
import { arbitrate, applyDecision } from "./lib/arbitrate.mjs";
import { usage } from "./lib/llm.mjs";
const D = path.join(import.meta.dirname, "data");
const rd = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
const pending = rd("pending.json"), candidates = rd("candidates.json"), classified = rd("classified.json"), extracted = rd("extracted.json");
const known = new Set(candidates.map((c) => c.id));
const todo = pending.filter((p) => !known.has(p.candidate.id));
console.log(`待审 ${todo.length} 个，交给 Opus 终审`);
const { decisions, failed } = await arbitrate(todo);
const keep = [];
for (const x of todo) {
  const d = decisions[x.candidate.id], line = `@${x.candidate.handle} ${x.candidate.views.toLocaleString("en-US")} · ${x.classified.title_zh}`;
  if (!d) { keep.push(x); console.log(`  ⏸ 留队列 ${line}（${failed[x.candidate.id]}）`); continue; }
  const rec = applyDecision(x, d);
  if (!rec) { console.log(`  ✗ 否决 ${line} — ${d.reason}`); continue; }
  candidates.push(x.candidate); classified[x.candidate.id] = x.classified; extracted.push(rec);
  console.log(`  ✓ 通过 ${line}${rec.prompt ? "（带提示词）" : ""} — ${d.reason}`);
}
if (process.argv.includes("--dry")) process.exit(0);
const wr = (f, s) => fs.writeFileSync(path.join(D, f), s);
wr("candidates.json", "[\n" + candidates.map((c) => JSON.stringify(c)).join(",\n") + "\n]\n");
wr("classified.json", "{\n" + Object.entries(classified).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(",\n") + "\n}\n");
wr("extracted.json", "[\n" + extracted.map((e) => JSON.stringify(e)).join(",\n") + "\n]\n");
wr("pending.json", JSON.stringify(keep, null, 1) + "\n");
console.log(`\n终审模型 ${usage.arbiter.model}，${usage.arbiter.calls} 次调用，输入 ${usage.arbiter.in} / 输出 ${usage.arbiter.out} tokens`);
