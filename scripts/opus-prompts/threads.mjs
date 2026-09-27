// 阶段 2：对保留的案例抓「作者本人在该会话里的推文」，找提示词（文字 / 外链 / 截图）
// 用法：node threads.mjs keep-ids.txt   预算靠 MAX_CASES 控制；结果增量写 raw-threads.json，可断点续跑
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const KEY = process.env.TWITTERAPI_IO_KEY;
const ids = fs.readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean);
const C = Object.fromEntries(JSON.parse(fs.readFileSync("candidates.json", "utf8")).map(c => [c.id, c]));
const OUT = "raw-threads.json";
const store = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const MAX = Number(process.env.MAX_CASES || 9999);
let done = 0, tweets = 0;
const slim = (t) => ({ id: t.id, inReplyToId: t.inReplyToId, createdAt: t.createdAt, text: t.text, likes: t.likeCount,
  urls: (t.entities?.urls || []).map(u => u.expanded_url).filter(Boolean),
  photos: (t.extendedEntities?.media || []).filter(m => m.type === "photo").map(m => m.media_url_https),
  quoted: t.quoted_tweet ? { id: t.quoted_tweet.id, handle: t.quoted_tweet.author?.userName, text: t.quoted_tweet.text } : null,
  hasArticle: !!t.article });
for (const id of ids) {
  if (store[id] || done >= MAX) continue;
  const c = C[id]; if (!c) continue;
  const all = []; let cursor = "", pages = 0;
  try {
    while (pages < 3) { // 作者自己的串很少超过 60 条
      const args = ["-sS", "-m", "45", "--retry", "2", "-G", "https://api.twitterapi.io/twitter/tweet/advanced_search", "-H", `X-API-Key: ${KEY}`,
        "--data-urlencode", `query=conversation_id:${c.conversationId} from:${c.handle}`, "--data-urlencode", "queryType=Latest"];
      if (cursor) args.push("--data-urlencode", `cursor=${cursor}`);
      const j = JSON.parse(execFileSync("curl", args, { encoding: "utf8", maxBuffer: 64e6 }));
      const ts = j.tweets || []; pages++; tweets += ts.length;
      const before = all.length; for (const t of ts) if (t.id !== id && !all.some(a => a.id === t.id)) all.push(slim(t));
      if (!j.has_next_page || !j.next_cursor || ts.length === 0 || all.length === before) break;
      cursor = j.next_cursor;
    }
    store[id] = { fetchedAt: new Date().toISOString(), authorTweets: all.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) };
  } catch (e) { store[id] = { error: String(e).slice(0, 160) }; }
  done++;
  if (done % 20 === 0) { fs.writeFileSync(OUT, JSON.stringify(store)); console.log(`  ${done} cases, ${tweets} tweets ≈ ${tweets * 15} credits`); }
}
fs.writeFileSync(OUT, JSON.stringify(store));
const v = Object.values(store);
console.log(`done ${done} | tweets fetched ${tweets} ≈ credits ${tweets * 15} | stored ${v.length} | with author replies ${v.filter(x => x.authorTweets?.length).length} | errors ${v.filter(x => x.error).length}`);
