// 未被搜索召回的种子：FXTwitter 免登录核验，归一成与搜索结果同构的精简记录
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const s = JSON.parse(fs.readFileSync("raw-search.json", "utf8")).tweets;
const seeds = fs.readFileSync("seeds.txt", "utf8").split("\n").filter(Boolean);
const out = fs.existsSync("raw-seeds.json") ? JSON.parse(fs.readFileSync("raw-seeds.json", "utf8")) : {};
for (const id of seeds) {
  if (s[id] || out[id]) continue;
  try {
    const j = JSON.parse(execFileSync("curl", ["-sS", "-m", "30", "--retry", "2", "-A", "jasonzhu.ai-collector/1.0", `https://api.fxtwitter.com/status/${id}`], { encoding: "utf8", maxBuffer: 32e6 }));
    out[id] = j.code === 200 ? j.tweet : { error: j.code, message: j.message };
  } catch (e) { out[id] = { error: "fetch", message: String(e).slice(0, 100) }; }
  fs.writeFileSync("raw-seeds.json", JSON.stringify(out));
}
const v = Object.entries(out);
console.log("fetched:", v.length, "| ok:", v.filter(([, t]) => !t.error).length, "| >=5000:", v.filter(([, t]) => (t.views || 0) >= 5000).length,
  "| 有视频:", v.filter(([, t]) => t.media?.videos?.length).length, "| >=5000 且有视频:", v.filter(([, t]) => (t.views || 0) >= 5000 && t.media?.videos?.length).length);
for (const [id, t] of v) if (t.error || !(t.media?.videos?.length) || (t.views || 0) < 5000) console.log("  skip", id, t.error ? "err:" + t.error : `views=${t.views} videos=${t.media?.videos?.length || 0} photos=${t.media?.photos?.length || 0}`, "|", (t.text || "").replace(/\s+/g, " ").slice(0, 70));
