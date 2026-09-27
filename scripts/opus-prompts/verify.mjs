// 对账：提取结果里的每段提示词必须能在源推文里逐字找到。用法：node verify.mjs <n> [--write]
import fs from "node:fs";
const n = process.argv[2], write = process.argv.includes("--write");
const inp = JSON.parse(fs.readFileSync(`ext-in-${n}.json`, "utf8"));
let out; try { out = JSON.parse(fs.readFileSync(`ext-out-${n}.json`, "utf8")); } catch (e) { console.log("FAIL invalid JSON:", e.message); process.exit(1); }
const norm = s => s.replace(/\r/g, "").replace(/[ \t 　]+/g, " ").replace(/ ?\n ?/g, "\n").trim();
const byId = Object.fromEntries(inp.map(c => [c.id, c]));
const errs = []; const resolved = [];
const ids = new Set(out.map(o => o.id));
if (out.length !== inp.length || !inp.every(c => ids.has(c.id)) || ids.size !== inp.length) errs.push(`id set mismatch: in=${inp.length} out=${out.length} unique=${ids.size}`);
for (const o of out) {
  const c = byId[o.id]; if (!c) { errs.push(`${o.id}: unknown id`); continue; }
  const E = m => errs.push(`${o.id}: ${m}`);
  if (typeof o.reference_assets !== "boolean" || !Array.isArray(o.tools) || !o.summary_en || !o.summary_zh) E("missing reference_assets/tools/summary");
  if ((o.summary_en || "").length > 220 || (o.summary_zh || "").length > 220) E("summary too long");
  const p = o.prompt; if (!p) { resolved.push({ ...o, prompt: null }); continue; }
  if (!["full", "brief"].includes(p.kind) || !["post", "author_reply", "image", "link"].includes(p.source)) { E("bad kind/source"); continue; }
  const posts = [c.root, ...c.thread]; const src = posts.find(t => t.tweet_id === p.source_tweet_id);
  if (!src) { E(`source_tweet_id ${p.source_tweet_id} not in this case`); continue; }
  if ((p.source === "post") !== (src.tweet_id === c.root.tweet_id) && (p.source === "post" || p.source === "author_reply")) { E(`source "${p.source}" does not match tweet position`); continue; }
  const url = `https://x.com/${c.handle}/status/${src.tweet_id}`;
  if (p.source === "image") {
    if (!p.image_urls?.length || !p.image_urls.every(u => src.photos?.includes(u))) { E("image_urls must come from that post's photos"); continue; }
    resolved.push({ ...o, prompt: { kind: p.kind, source: "image", sourceUrl: url, imageUrls: p.image_urls, text: null } }); continue;
  }
  if (p.source === "link") {
    if (!p.link_url || !posts.some(t => (t.links || []).includes(p.link_url))) { E("link_url must come from links[]"); continue; }
    resolved.push({ ...o, prompt: { kind: p.kind, source: "link", sourceUrl: url, linkUrl: p.link_url, text: null } }); continue;
  }
  let text = null;
  if (p.text) {
    if (p.text.length > 400) { E("text longer than 400 chars: use start/end"); continue; }
    const hay = norm(src.text), nd = norm(p.text); const i = hay.indexOf(nd);
    if (i < 0) { E(`text is not a verbatim substring of post ${src.tweet_id}: "${p.text.slice(0, 50)}…"`); continue; }
    text = hay.slice(i, i + nd.length);
  } else if (p.start && p.end) {
    const parts = /parts:\s*([\d,\s]+)/.exec(o.note || "")?.[1]?.split(",").map(s => s.trim()).filter(Boolean);
    const seq = parts?.length ? parts.map(id => posts.find(t => t.tweet_id === id)) : [src];
    if (seq.some(x => !x)) { E("parts: contains a tweet_id not in this case"); continue; }
    const hay = seq.map(x => norm(x.text.replace(/\s*https:\/\/t\.co\/\w+\s*$/, ""))).join("\n\n");
    const s = hay.indexOf(norm(p.start)), eN = norm(p.end), e = hay.lastIndexOf(eN);
    if (s < 0) { E(`start marker not found verbatim: "${p.start.slice(0, 50)}…"`); continue; }
    if (e < 0 || e + eN.length <= s) { E(`end marker not found verbatim after start: "${p.end.slice(0, 50)}…"`); continue; }
    text = hay.slice(s, e + eN.length);
  } else { E("text source needs `text` or `start`+`end`"); continue; }
  if (p.kind === "full" && text.length < 120) E(`kind=full but only ${text.length} chars: should this be brief?`);
  resolved.push({ ...o, prompt: { kind: p.kind, source: p.source, sourceUrl: url, text } });
}
const withP = resolved.filter(r => r.prompt);
console.log(errs.length ? `FAIL ${errs.length} problem(s):\n  ` + errs.join("\n  ") : `OK ${out.length} cases | prompts: ${withP.length} (text ${withP.filter(r => r.prompt.text).length}, image ${withP.filter(r => r.prompt.source === "image").length}, link ${withP.filter(r => r.prompt.source === "link").length})`);
if (write && !errs.length) fs.writeFileSync(`ext-res-${n}.json`, JSON.stringify(resolved));
process.exit(errs.length ? 1 : 0);
