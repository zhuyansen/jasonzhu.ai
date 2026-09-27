// 搜索发现：twitterapi.io advanced_search，curl 传输（本机 undici 过不了代理）
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const KEY = process.env.TWITTERAPI_IO_KEY;
const MAX_PAGES = Number(process.env.MAX_PAGES || 40);
const BUDGET_TWEETS = Number(process.env.BUDGET_TWEETS || 3000); // 15 credits/条 → 4.5 万
const OUT = "raw-search.json";
const store = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { tweets: {}, runs: [] };
const base = "filter:native_video min_faves:20 -filter:replies since:2026-09-22";
const QUERIES = [
  [`"Opus 5.5" ${base}`, "Top"], [`"Opus 5.5" ${base}`, "Latest"],
  [`"Opus5.5" ${base}`, "Top"], [`"Opus5.5" ${base}`, "Latest"],
  [`"Claude 5.5" -"Opus 5.5" ${base}`, "Top"],
];
let fetched = 0;
function get(query, queryType, cursor) {
  const args = ["-sS", "-m", "45", "--retry", "2", "-G", "https://api.twitterapi.io/twitter/tweet/advanced_search",
    "-H", `X-API-Key: ${KEY}`, "--data-urlencode", `query=${query}`, "--data-urlencode", `queryType=${queryType}`];
  if (cursor) args.push("--data-urlencode", `cursor=${cursor}`);
  return JSON.parse(execFileSync("curl", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
}
for (const [q, type] of QUERIES) {
  let cursor = "", pages = 0, added = 0, seen = 0, dryPages = 0;
  while (pages < MAX_PAGES && fetched < BUDGET_TWEETS) {
    let j; try { j = get(q, type, cursor); } catch (e) { console.error("  fetch fail:", String(e).slice(0, 120)); break; }
    const ts = j.tweets || []; pages++; fetched += ts.length; seen += ts.length;
    let newHere = 0;
    for (const t of ts) if (!store.tweets[t.id]) { store.tweets[t.id] = t; added++; newHere++; }
    dryPages = newHere === 0 ? dryPages + 1 : 0;
    if (!j.has_next_page || !j.next_cursor || ts.length === 0 || dryPages >= 3) break; // 连续 3 页无新增就停，省 credits
    cursor = j.next_cursor;
  }
  store.runs.push({ q, type, pages, seen, added, at: new Date().toISOString() });
  console.log(`${type.padEnd(6)} pages=${String(pages).padStart(2)} seen=${String(seen).padStart(4)} new=${String(added).padStart(4)}  ${q.slice(0, 60)}`);
  fs.writeFileSync(OUT, JSON.stringify(store));
}
console.log("fetched this run:", fetched, "≈ credits", fetched * 15, "| unique total:", Object.keys(store.tweets).length);
