// 垃圾外链来源库的快照：从 backlink-spam-list 仓库的 list.csv（本地路径或 GitHub raw）生成 src/data/backlink-spam-list.json。
// 页面平时每天直接从 GitHub 读最新名单（ISR），这份快照只在 GitHub 读不到时兜底。
// 用法：node scripts/sync-spam-list.mjs [list.csv 路径或 URL]
import fs from "fs";
import path from "path";

const SRC = process.argv[2] || "https://raw.githubusercontent.com/zhuyansen/backlink-spam-list/main/list.csv";
const OUT = path.join(process.cwd(), "src/data/backlink-spam-list.json");

// 一行 CSV：引号外的逗号分列，"" 读作一个引号
function cells(line) {
  const out = [];
  let cur = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

const text = SRC.startsWith("http") ? await (await fetch(SRC)).text() : fs.readFileSync(SRC, "utf-8");
const [head, ...lines] = text.split("\n").filter((l) => l.trim());
const cols = cells(head);
const entries = lines
  .map((l) => Object.fromEntries(cells(l).map((v, i) => [cols[i], v])))
  .filter((r) => r.status === "listed")
  .map((r) => ({ domain: r.domain, category: r.category, family: r.family, evidence: r.evidence,
                 evidenceUrl: r.evidence_url, firstListed: r.first_listed, lastChecked: r.last_checked }));
if (!entries.length) throw new Error(`no listed entries in ${SRC}`);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(entries, null, 1));
console.log(`spam list snapshot: ${entries.length} entries -> ${OUT}`);
