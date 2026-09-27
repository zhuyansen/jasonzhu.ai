#!/usr/bin/env node
/**
 * 把待审队列并入正式数据。只在「滚动 PR」的分支上跑：合并那个 PR = 批准队列里的全部作品。
 * 想否决其中某条：在 main 的 data/curation.json 的 dropCase 里加上推文 ID，第二天队列会自动剔除它。
 * 同时把队列渲染成 PR 正文（--body <文件>）。
 */
import fs from "node:fs";
import path from "node:path";
const D = path.join(import.meta.dirname, "data");
const rd = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
const pending = rd("pending.json");
const bodyFile = process.argv.includes("--body") ? process.argv[process.argv.indexOf("--body") + 1] : null;

if (bodyFile) {
  const esc = (s) => String(s || "").replace(/\|/g, "\\|").replace(/\s+/g, " ");
  const rows = pending.map((p) => {
    const c = p.candidate, e = p.extracted, pr = e.prompt;
    const prompt = !pr ? "—" : pr.source === "image" ? `截图：${pr.imageUrls.map((u, i) => `[图${i + 1}](${u})`).join(" ")}` : pr.text ? `\`${esc(pr.text).slice(0, 140)}${pr.text.length > 140 ? "…" : ""}\`（${pr.text.length} 字符）` : `[外链](${pr.linkUrl})`;
    return `| [${esc(p.classified.title_zh)}](${c.url}) | @${c.handle} | ${c.views.toLocaleString("en-US")} | ${prompt} | ${esc(p.reasons.join("；"))} | \`${c.id}\` |`;
  });
  fs.writeFileSync(bodyFile, [
    `每日收录时审核模型拿不准的作品，共 **${pending.length}** 个。这个 PR 每天自动重建。`, "",
    "- **合并** = 批准下面全部作品上线。",
    "- **否决某一条**：在 `main` 的 `scripts/opus-prompts/data/curation.json` 的 `dropCase` 里加上它的 ID，第二天它会从这里消失。",
    `- 放着不管：每条最多保留 14 天，到期自动丢弃。`,
    "- 截图里的提示词合并后不会自动上站，需要转写进 `data/transcribed-images.json`。", "",
    "| 作品（点开看原帖） | 作者 | 播放 | 定位到的提示词 | 为什么转人工 | ID |", "|---|---|---|---|---|---|", ...rows, "",
  ].join("\n"));
}
if (!process.argv.includes("--apply")) process.exit(0);

const candidates = rd("candidates.json"), classified = rd("classified.json"), extracted = rd("extracted.json");
const known = new Set(candidates.map((c) => c.id));
let n = 0;
for (const p of pending) {
  if (known.has(p.candidate.id)) continue;
  candidates.push(p.candidate); classified[p.candidate.id] = p.classified;
  const pr = p.extracted.prompt;
  extracted.push({ ...p.extracted, prompt: pr?.text || pr?.source === "link" || pr?.source === "image" ? pr : null }); n++;
}
const wr = (f, s) => fs.writeFileSync(path.join(D, f), s);
wr("candidates.json", "[\n" + candidates.map((c) => JSON.stringify(c)).join(",\n") + "\n]\n");
wr("classified.json", "{\n" + Object.entries(classified).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(",\n") + "\n}\n");
wr("extracted.json", "[\n" + extracted.map((e) => JSON.stringify(e)).join(",\n") + "\n]\n");
wr("pending.json", "[]\n");
console.log(`已并入 ${n} 个待审作品`);
