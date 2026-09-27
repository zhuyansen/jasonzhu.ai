// 阶段 3 输入：把每个案例的主帖 + 作者本人回复打包，先用宽松规则滤掉明显没有提示词的
import fs from "node:fs";
const C = Object.fromEntries(JSON.parse(fs.readFileSync("candidates.json", "utf8")).map(c => [c.id, c]));
const K = JSON.parse(fs.readFileSync("classified.json", "utf8"));
const T = JSON.parse(fs.readFileSync("raw-threads.json", "utf8"));
const done = fs.existsSync("ext-done.json") ? new Set(JSON.parse(fs.readFileSync("ext-done.json", "utf8"))) : new Set();
const re = /prompt|プロンプト|提示词|提示詞|프롬프트|指示|instruction|咒语|指令/i;
const notX = u => !/^https?:\/\/(www\.)?(x|twitter)\.com\//.test(u);
const out = []; let skipped = 0;
for (const [id, t] of Object.entries(T)) {
  if (done.has(id) || !K[id] || !C[id]) continue;
  const c = C[id], k = K[id], a = t.authorTweets || [];
  // 只保留可能相关的作者回复：提到提示词 / 长文 / 带图 / 带外链 / 紧跟主帖的前 3 条
  const direct = a.filter(x => x.inReplyToId === id).slice(0, 3).map(x => x.id);
  const rel = a.filter(x => re.test(x.text) || x.text.length > 200 || x.photos.length || x.urls.some(notX) || direct.includes(x.id));
  const plausible = k.prompt_signal !== "none" || rel.some(x => re.test(x.text) || x.text.length > 400) || re.test(c.text);
  if (!plausible) { skipped++; continue; }
  out.push({ id, handle: c.handle, views: c.views,
    root: { tweet_id: id, text: c.text, links: c.links },
    quoted: c.quoted ? { handle: c.quoted.handle, text: (c.quoted.text || "").slice(0, 1500) } : null,
    thread: rel.slice(0, 25).map(x => ({ tweet_id: x.id, text: x.text, links: x.urls.filter(notX), photos: x.photos })) });
}
out.sort((a, b) => b.views - a.views);
const TARGET = 75 * 1024; const chunks = [[]]; let size = 0;
for (const b of out) { const s = JSON.stringify(b).length; if (size + s > TARGET && chunks.at(-1).length) { chunks.push([]); size = 0; } chunks.at(-1).push(b); size += s; }
const base = Number(process.env.BASE || 0);
chunks.forEach((ch, i) => fs.writeFileSync(`ext-in-${base + i + 1}.json`, JSON.stringify(ch, null, 1)));
console.log(`cases with threads: ${Object.keys(T).length} | plausible: ${out.length} | skipped(no signal): ${skipped} | chunks: ${chunks.map(c => c.length).join(",")} | KB: ${chunks.map((_, i) => Math.round(fs.statSync(`ext-in-${base + i + 1}.json`).size / 1024)).join(",")}`);
fs.writeFileSync(`ext-batch-${base}.json`, JSON.stringify(out.map(b => b.id)));
