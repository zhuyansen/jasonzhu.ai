import snapshot from "@/data/backlink-spam-list.json";

/** 垃圾外链来源库的一条：域名、类别、所属站群、公开证据（任何人可核实）和核实日期。 */
export interface SpamEntry {
  domain: string;
  category: string;
  family: string;
  evidence: string;
  evidenceUrl: string;
  firstListed: string;
  lastChecked: string;
}

export interface SpamFamily {
  name: string;
  doorways: number;
  storefront: string;
  title: string;
}

export const SPAM_LIST_REPO = "https://github.com/zhuyansen/backlink-spam-list";
export const SPAM_LIST_REPORT = `${SPAM_LIST_REPO}/issues/new?template=report.yml`;
export const SPAM_LIST_DISPUTE = `${SPAM_LIST_REPO}/issues/new?template=dispute.yml`;
const RAW = "https://raw.githubusercontent.com/zhuyansen/backlink-spam-list/main/list.csv";
export const SPAM_LIST_REVALIDATE = 86400; // 每天最多从 GitHub 重读一次

/** 一行 CSV：引号外的逗号分列，"" 读作一个引号。 */
function cells(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/** list.csv 里仍有效（status = listed）的条目。 */
export function parseList(csv: string): SpamEntry[] {
  const [head, ...lines] = csv.split("\n").filter((l) => l.trim());
  if (!head) return [];
  const cols = cells(head);
  return lines
    .map((l) => Object.fromEntries(cells(l).map((v, i) => [cols[i], v])) as Record<string, string>)
    .filter((r) => r.status === "listed" && r.domain)
    .map((r) => ({
      domain: r.domain,
      category: r.category,
      family: r.family ?? "",
      evidence: r.evidence ?? "",
      evidenceUrl: r.evidence_url ?? "",
      firstListed: r.first_listed ?? "",
      lastChecked: r.last_checked ?? "",
    }));
}

/** GitHub 上的最新名单（每天最多重读一次）；读不到时用仓库里的快照（scripts/sync-spam-list.mjs 生成）。 */
export async function getSpamList(): Promise<{ entries: SpamEntry[]; fromGitHub: boolean }> {
  try {
    const res = await fetch(RAW, { next: { revalidate: SPAM_LIST_REVALIDATE } });
    if (res.ok) {
      const entries = parseList(await res.text());
      if (entries.length) return { entries, fromGitHub: true };
    }
  } catch {
    // 网络或 GitHub 出错：落到快照
  }
  return { entries: snapshot as SpamEntry[], fromGitHub: false };
}

/** 按站群汇总：门户域名数、它们跳转过去的店面、共用的标题。 */
export function families(entries: SpamEntry[]): SpamFamily[] {
  const by = new Map<string, SpamFamily>();
  for (const e of entries) {
    if (!e.family) continue;
    const f = by.get(e.family) ?? { name: e.family, doorways: 0, storefront: "", title: "" };
    if (e.category === "link-seller") f.storefront = e.domain;
    else {
      f.doorways += 1;
      if (!f.title) f.title = e.evidence.match(/"([^"]+)"/)?.[1] ?? "";
    }
    by.set(e.family, f);
  }
  return [...by.values()].sort((a, b) => b.doorways - a.doorways);
}
