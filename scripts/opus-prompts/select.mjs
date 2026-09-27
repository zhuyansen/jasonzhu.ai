// 合并已完成的分类块，校验，产出进入阶段 2 的 ID 清单
import fs from "node:fs";
const C = Object.fromEntries(JSON.parse(fs.readFileSync("candidates.json", "utf8")).map(c => [c.id, c]));
const KIND = new Set(["work", "comparison", "tutorial", "news", "opinion", "other"]);
const CAT = new Set(["product", "motion", "education", "stories", "art3d", "game", "production", "comparison"]);
const SIG = new Set(["full_in_text", "brief_in_text", "in_replies", "link", "none"]);
const all = {}; const done = []; const problems = [];
for (let i = 1; i <= 8; i++) {
  if (!fs.existsSync(`cls-${i}.json`)) continue;
  let arr; try { arr = JSON.parse(fs.readFileSync(`cls-${i}.json`, "utf8")); } catch { problems.push(`cls-${i}: invalid JSON`); continue; }
  const chunk = JSON.parse(fs.readFileSync(`chunk-${i}.json`, "utf8"));
  const ids = new Set(arr.map(x => x.id));
  if (arr.length !== chunk.length || !chunk.every(c => ids.has(c.id))) problems.push(`cls-${i}: id mismatch ${arr.length}/${chunk.length}`);
  for (const x of arr) {
    if (!C[x.id]) { problems.push(`cls-${i}: unknown id ${x.id}`); continue; }
    if (!KIND.has(x.kind) || !SIG.has(x.prompt_signal) || (x.keep && !CAT.has(x.category)) || typeof x.keep !== "boolean" || !x.title_zh || !x.title_en) problems.push(`cls-${i}: bad fields ${x.id}`);
    all[x.id] = x;
  }
  done.push(i);
}
fs.writeFileSync("classified.json", JSON.stringify(all));
const v = Object.values(all), keep = v.filter(x => x.keep && x.original !== "repost");
const pick = keep.filter(x => x.prompt_signal !== "none" || C[x.id].views >= 10000);
fs.writeFileSync("keep-ids.txt", pick.sort((a, b) => (a.prompt_signal === "none") - (b.prompt_signal === "none") || C[b.id].views - C[a.id].views).map(x => x.id).join("\n") + "\n");
const cnt = (arr, k) => arr.reduce((m, x) => { m[x[k]] = (m[x[k]] || 0) + 1; return m; }, {});
console.log("chunks done:", done.join(","), "| classified:", v.length, "| problems:", problems.length, problems.slice(0, 5));
console.log("keep(含 repost):", v.filter(x => x.keep).length, "| keep 且非转帖:", keep.length, "| 进入阶段2:", pick.length);
console.log("signal(keep):", JSON.stringify(cnt(keep, "prompt_signal")));
console.log("category(keep):", JSON.stringify(cnt(keep, "category")));
