/**
 * 实体关系边检查（2026-11-21 起）。抓页面里的 JSON-LD，查四条：
 *  1. Person（@id https://jasonzhu.ai/#person）的 sameAs 和 src/lib/profiles.ts 的 PERSON_PROFILES 一模一样：多一个、少一个
 *     都不行（2026-11-27 起；之前按网址格式放行，产品的 x.com/agentskillshub 写进 Person 也能过）。PERSON_PROFILES 自己的
 *     每一条还要像个人档案（下面的 PROFILE_PATTERNS）：ORCID、Google Scholar、SSRN 作者页、LinkedIn 个人页、Product Hunt、
 *     X、GitHub 用户页、Hugging Face 用户页、Kaggle 用户页、YouTube、抖音、小红书。DOI、Zenodo、pypi.org、SSRN 论文页
 *     （abstract_id）、agentskillshub、GitHub 仓库页都不行；B 站 11-24 拿掉了，改名后要加回来，先把规则加回 PROFILE_PATTERNS。
 *     以后有了 Wikidata 个人条目，也先加进 PROFILE_PATTERNS。
 *  2. 同一个网址不能既在 Person 的 sameAs 里，又在别的节点的 sameAs 里（所有被查的页面合起来算）。
 *  3. 不再引用 jasonzhu.ai 的 #organization / #org，也没有 @id 在 jasonzhu.ai 上的 Organization 节点。
 *     AgentSkillsHub 自己的 @id（https://agentskillshub.top/#organization）不算，它是另一个网站。
 *  4. 作品节点（ScholarlyArticle、Dataset、SoftwareSourceCode）的 author 或 creator 指向 #person；
 *     AgentSkillsHub 节点的 founder 指向 #person。
 *  5. Person 的 alternateName 里没有公司名（GoSailGlobal、BRICKAI）：同一个名字既是人的别名又是公司名，
 *     人和公司就会被并成一个实体（2026-11-24）。
 *  6. 关于页（/en/about、/zh/about）是本人的定义页，必须读到 Person 和它的 sameAs；查全站时至少读到一处。读不到算
 *     「测不出来」，退出码 1：之前一个 Person 都没读到也打印「通过」（2026-11-27）。别的页面只引用 @id 就行。
 * 联网之前先查一遍源文件：博客 frontmatter 的 doi、src/lib/research.ts 里的 DOI 都要在 src/lib/profiles.ts 的 WORKS 里
 * （Zenodo 发新版本换 DOI 时三处一起换），PERSON_PROFILES 每条都符合第 1 条。
 *
 * 用法：
 *   node scripts/check-entities.mjs                          # 查线上 https://jasonzhu.ai
 *   node scripts/check-entities.mjs http://localhost:3000    # 查本地 next dev / next start
 *   node scripts/check-entities.mjs <基础网址> /en/blog/xxx   # 只查给的路径
 *   node scripts/check-entities.mjs --static                  # 只查源文件，不联网
 * 有问题时退出码 1。
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PERSON_ID = "https://jasonzhu.ai/#person";
const HUB_ID = "https://agentskillshub.top/#organization";
const COMPANY_NAMES = /gosail\s*global|brickai/i;   // 运营公司 GoSailGlobal LLC 的名字，不能当人的别名
const WORK_TYPES = new Set(["ScholarlyArticle", "Dataset", "SoftwareSourceCode"]);

const PROFILE_PATTERNS = [
  /^https:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/,
  /^https:\/\/scholar\.google\.com\/citations\?user=[\w-]+$/,
  /^https:\/\/papers\.ssrn\.com\/sol3\/cf_dev\/AbsByAuth\.cfm\?per_id=\d+$/,
  /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
  /^https:\/\/(www\.)?producthunt\.com\/@[\w-]+$/,
  /^https:\/\/(x|twitter)\.com\/\w+$/,
  /^https:\/\/github\.com\/[\w-]+$/, // 用户页；仓库页有两段路径，过不了
  /^https:\/\/huggingface\.co\/[\w-]+$/, // 用户页；/datasets/... 过不了
  /^https:\/\/(www\.)?kaggle\.com\/[\w-]+$/,
  /^https:\/\/(www\.)?youtube\.com\/@[\w.-]+$/,
  /^https:\/\/(www\.)?douyin\.com\/user\/[\w-]+$/,
  /^https:\/\/(www\.)?xiaohongshu\.com\/user\/profile\/\w+$/,
];
const NOT_PROFILE = [
  [/doi\.org\//i, "DOI"],
  [/zenodo\.org/i, "Zenodo 记录"],
  [/pypi\.org/i, "PyPI 软件包"],
  [/abstract_id=/i, "SSRN 论文页"],
  [/agentskillshub/i, "AgentSkillsHub（另一个网站）"],
  [/huggingface\.co\/datasets\//i, "Hugging Face 数据集"],
  [/kaggle\.com\/datasets\//i, "Kaggle 数据集"],
  [/github\.com\/[^/]+\/[^/]+/i, "GitHub 仓库页"],
];

function profileProblem(url) {
  if (PROFILE_PATTERNS.some((re) => re.test(url))) return null;
  const hit = NOT_PROFILE.find(([re]) => re.test(url));
  return hit ? `${hit[1]}，不是个人档案` : "不在个人档案名单里";
}

const norm = (u) =>
  String(u).trim().toLowerCase().replace(/^http:/, "https:").replace("://www.", "://").replace(/\/+$/, "");
const types = (n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]).filter(Boolean).map(String);
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const refsPerson = (v) => asList(v).some((x) => x && typeof x === "object" && x["@id"] === PERSON_ID);

const PROFILES = new Map(); // PERSON_PROFILES：规范化网址 -> 原网址，第 1 条的基准，不取自被查的页面
const personPages = new Set(); // 读到本人 Person 和 sameAs 的页面
const problems = new Set();
const fail = (where, msg) => problems.add(`${where}: ${msg}`);

// ---------- 源文件（不联网） ----------
function staticChecks() {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
  const profiles = read("src/lib/profiles.ts");
  const worksBlock = profiles.slice(profiles.indexOf("export const WORKS"));
  const workDois = new Set([...worksBlock.matchAll(/doi:\s*"([^"]+)"/g)].map((m) => m[1].toLowerCase()));

  const personBlock = profiles.slice(
    profiles.indexOf("export const PERSON_PROFILES"),
    profiles.indexOf("];", profiles.indexOf("export const PERSON_PROFILES")),
  );
  const orcid = (profiles.match(/ORCID_ID = "([^"]+)"/) || [])[1];
  const personUrls = [...personBlock.matchAll(/url:\s*(?:"([^"]+)"|ORCID_URL)/g)].map((m) =>
    m[1] ?? `https://orcid.org/${orcid}`,
  );
  if (personUrls.length === 0) fail("src/lib/profiles.ts", "没读到 PERSON_PROFILES");
  for (const u of personUrls) {
    const p = profileProblem(u);
    if (p) fail("src/lib/profiles.ts PERSON_PROFILES", `${u}（${p}）`);
    PROFILES.set(norm(u), u);
  }

  const cited = [];
  const blogDir = path.join(ROOT, "src/content/blog");
  for (const f of fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"))) {
    const fm = fs.readFileSync(path.join(blogDir, f), "utf8").split(/^---\s*$/m)[1] || "";
    const m = fm.match(/^doi:\s*["']?([^"'\s]+)["']?\s*$/m);
    if (m) cited.push([`src/content/blog/${f}`, m[1]]);
  }
  for (const m of read("src/lib/research.ts").matchAll(/10\.5281\/zenodo\.\d+/g)) cited.push(["src/lib/research.ts", m[0]]);
  for (const [file, doi] of cited) {
    if (!workDois.has(doi.toLowerCase())) fail(file, `DOI ${doi} 不在 src/lib/profiles.ts 的 WORKS 里`);
  }
  console.log(`源文件：PERSON_PROFILES ${personUrls.length} 条，WORKS 里 ${workDois.size} 个 DOI，博客和 research.ts 引用 ${new Set(cited.map((c) => c[1])).size} 个 DOI`);
}

// ---------- 线上 / 本地页面 ----------
function defaultPaths() {
  const paths = ["/en", "/zh", "/en/about", "/zh/about", "/en/research", "/zh/research", "/en/backlink-spam-list", "/zh/backlink-spam-list", "/en/go-global"];
  for (const m of fs.readFileSync(path.join(ROOT, "src/lib/research.ts"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)) {
    paths.push(`/en/research/${m[1]}`, `/zh/research/${m[1]}`);
  }
  const blogDir = path.join(ROOT, "src/content/blog");
  for (const f of fs.readdirSync(blogDir).filter((f) => f.endsWith(".md")).sort()) {
    const fm = fs.readFileSync(path.join(blogDir, f), "utf8").split(/^---\s*$/m)[1] || "";
    if (!/^doi:/m.test(fm)) continue;
    const slug = f.replace(/(\.en)?\.md$/, "");
    paths.push(f.endsWith(".en.md") ? `/en/blog/${slug}` : `/zh/blog/${slug}`);
  }
  return [...new Set(paths)];
}

async function fetchHtml(url, timeoutMs) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (check-entities)" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (attempt >= 2) throw e;
    }
  }
}

function collectNodes(obj, out) {
  if (Array.isArray(obj)) obj.forEach((x) => collectNodes(x, out));
  else if (obj && typeof obj === "object") {
    if (obj["@type"] || obj["@id"]) out.push(obj);
    for (const [k, v] of Object.entries(obj)) if (k !== "@context") collectNodes(v, out);
  }
}

const personSameAs = new Map(); // 规范化网址 -> 原网址
const otherSameAs = new Map(); // 规范化网址 -> [{ where, node }]

function checkPage(where, html) {
  const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (blocks.length === 0) return fail(where, "页面里没有 JSON-LD");
  const nodes = [];
  for (const raw of blocks) {
    if (/jasonzhu\.ai\/#org(anization)?(?![\w-])/i.test(raw)) fail(where, "JSON-LD 里还引用 jasonzhu.ai 的 #organization / #org");
    try {
      collectNodes(JSON.parse(raw), nodes);
    } catch (e) {
      fail(where, `有一块 JSON-LD 解析失败：${e.message}`);
    }
  }

  const workAuthored = new Map(); // 作品 @id -> 这一页上有没有一处写了作者 / creator 指向 #person
  for (const n of nodes) {
    const id = n["@id"];
    const t = types(n);
    if (t.some((x) => x.endsWith("Organization")) && typeof id === "string" && id.startsWith("https://jasonzhu.ai")) {
      fail(where, `还有 jasonzhu.ai 上的 Organization 节点 ${id}`);
    }
    const sameAs = asList(n.sameAs).map(String);
    if (id === PERSON_ID) {
      for (const a of asList(n.alternateName).map(String)) {
        if (COMPANY_NAMES.test(a)) fail(where, `Person 的 alternateName 有公司名「${a}」`);
      }
      for (const u of sameAs) {
        if (!PROFILES.has(norm(u))) {
          const p = profileProblem(u);
          fail(where, `Person 的 sameAs 有 ${u}（不在 src/lib/profiles.ts 的 PERSON_PROFILES 里${p ? "，" + p : ""}）`);
        }
        personSameAs.set(norm(u), u);
      }
      if (sameAs.length) {
        const seen = new Set(sameAs.map(norm));
        const missing = [...PROFILES.keys()].filter((k) => !seen.has(k)).map((k) => PROFILES.get(k));
        if (missing.length) fail(where, `Person 的 sameAs 少了 ${missing.join("、")}`);
        personPages.add(where);
      }
    } else {
      for (const u of sameAs) {
        const k = norm(u);
        if (!otherSameAs.has(k)) otherSameAs.set(k, []);
        otherSameAs.get(k).push(`${where} ${t.join("/") || "节点"} ${id ?? n.name ?? ""}`.trim());
      }
    }
    if (t.some((x) => WORK_TYPES.has(x)) && typeof id === "string" && /^https:\/\/(doi\.org\/10\.5281\/zenodo\.|github\.com\/zhuyansen\/)/i.test(id)) {
      const ok = refsPerson(n.author) || refsPerson(n.creator);
      workAuthored.set(id, Boolean(workAuthored.get(id)) || ok);
    }
    if (id === HUB_ID && Object.keys(n).length > 3) {
      if (!refsPerson(n.founder)) fail(where, "AgentSkillsHub 节点的 founder 没有指向 #person");
      if (n.parentOrganization) fail(where, "AgentSkillsHub 节点还挂在别的组织下面（parentOrganization）");
    }
    if (n.subOrganization) fail(where, `${id ?? t.join("/")} 还有 subOrganization`);
  }
  for (const [id, ok] of workAuthored) if (!ok) fail(where, `作品 ${id} 的 author / creator 没有指向 #person`);
  const works = [...workAuthored.keys()].length;
  console.log(`${where}  ${blocks.length} 块 JSON-LD，${nodes.length} 个节点${works ? `，作品 ${works} 个` : ""}`);
}

const args = process.argv.slice(2);
staticChecks();
if (!args.includes("--static")) {
  const base = (args.find((a) => /^https?:\/\//.test(a)) || "https://jasonzhu.ai").replace(/\/+$/, "");
  const given = args.filter((a) => a.startsWith("/"));
  const paths = given.length ? given : defaultPaths();
  const timeoutMs = /localhost|127\.0\.0\.1/.test(base) ? 180_000 : 30_000;
  console.log(`查 ${base} 的 ${paths.length} 个页面`);
  for (const p of paths) {
    try {
      checkPage(p, await fetchHtml(base + p, timeoutMs));
    } catch (e) {
      fail(p, `抓不到页面（${e.message}）`);
    }
  }
  for (const [k, u] of personSameAs) {
    if (otherSameAs.has(k)) fail("跨页面", `${u} 同时在 Person 和别的节点的 sameAs 里：${otherSameAs.get(k).slice(0, 3).join("；")}`);
  }
  for (const p of ["/en/about", "/zh/about"].filter((p) => paths.includes(p))) {
    if (!personPages.has(p)) fail(p, "没读到本人的 Person（#person）和它的 sameAs：测不出来（关于页是本人的定义页）");
  }
  if (!given.length && personPages.size === 0) fail("全站", "一个带 sameAs 的本人 Person 都没读到：测不出来");
  console.log(`Person 的 sameAs 共 ${personSameAs.size} 个网址；其他节点的 sameAs 共 ${otherSameAs.size} 个网址`);
}

if (problems.size) {
  console.error(`\n❌ ${problems.size} 个问题：`);
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}
console.log("\n✅ 实体关系边检查通过");
