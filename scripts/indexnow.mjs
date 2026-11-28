/**
 * IndexNow 推送：把新增/修改的页面 URL 主动推给 Bing（及 Yandex 等 IndexNow 成员）。
 * ChatGPT 搜索部分依赖 Bing 索引，推送后新文章几分钟内可被抓取，不用等爬虫来。
 *
 * URL 来源二选一：
 *   node scripts/indexnow.mjs <git-range>      # 按改动的内容文件推算，默认 HEAD~1..HEAD
 *   node scripts/indexnow.mjs --url <u> [...]  # 直接指定 URL
 *
 * 候选 URL 会和线上 sitemap 取交集：草稿、未翻译的 en 页等不在 sitemap 的不推；
 * 新 URL 等 Vercel 部署上线（出现在 sitemap 里）再推，最多等 WAIT_MINUTES。
 * key 不是秘密（协议要求公开），校验文件在 public/<KEY>.txt。
 */
import { execSync } from "child_process";
import fs from "fs";

const SITE_URL = "https://jasonzhu.ai";
const KEY = "1ebb2aa454ac822bb9fd07a0bc35cfaa";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const WAIT_MINUTES = Number(process.env.INDEXNOW_WAIT_MINUTES ?? 15);
const DRY_RUN = process.argv.includes("--dry-run");

const args = process.argv.slice(2).filter((a) => a !== "--dry-run");

/** 提示词库：public/data 下的目录名 → 站内路径（作品详情页 = 路径/<推文 ID>） */
const PROMPT_LIBS = {
  "opus-prompts": "/prompts/claude-opus-5-5",
  "image-prompts": "/prompts/chatgpt-images-2-6",
  "gemini-prompts": "/prompts/gemini-4",
};

/** 检查快讯是否有人工点评（与 src/lib/news.ts 的 isDigestIndexable 保持一致，无点评的快讯 noindex 不进 sitemap） */
function isNewsDigestIndexable(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const fm = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!fm) return false;
    const m = fm[1].match(/^humanComment:\s*(.+)$/m);
    if (!m) return false;
    const val = m[1].trim().replace(/^["']|["']$/g, "").trim();
    return val.length > 0 && val !== "null" && val !== "~";
  } catch {
    return false;
  }
}

/** 读取本地已标为 noindex 或同款分组副案例的提示词详情页，避免为它们空等 15 分钟 */
function loadSkippedPromptUrls() {
  const skipped = new Set();
  try {
    const raw = JSON.parse(fs.readFileSync("src/content/opus-prompts/noindex.json", "utf8"));
    const libs = raw?.libraries && typeof raw.libraries === "object" ? raw.libraries : raw;
    for (const [libSlug, entry] of Object.entries(libs || {})) {
      const ids = Array.isArray(entry) ? entry : entry?.noindex;
      if (!Array.isArray(ids)) continue;
      for (const id of ids) {
        skipped.add(`${SITE_URL}/zh/prompts/${libSlug}/${id}`);
        skipped.add(`${SITE_URL}/en/prompts/${libSlug}/${id}`);
      }
    }
  } catch {}
  try {
    const opus = JSON.parse(fs.readFileSync("src/generated/opus-prompts.json", "utf8"));
    const withPrompt = new Set((opus.cases || []).filter((x) => x.prompt).map((x) => x.id));
    for (const c of opus.cases || []) {
      if (c.group && c.group.key !== c.id && withPrompt.has(c.group.key)) {
        skipped.add(`${SITE_URL}/zh/prompts/claude-opus-5-5/${c.id}`);
        skipped.add(`${SITE_URL}/en/prompts/claude-opus-5-5/${c.id}`);
      }
    }
  } catch {}
  return skipped;
}

const SKIPPED_PROMPT_URLS = loadSkippedPromptUrls();

/** 改动的文件路径 → 候选 URL（zh/en 都列上，交给 sitemap 过滤） */
function urlsForFile(file) {
  const both = (p) => [`${SITE_URL}/zh${p}`, `${SITE_URL}/en${p}`];
  const blog = file.match(/^src\/content\/blog\/([^/_][^/]*?)(\.en)?\.mdx?$/);
  if (blog) {
    const extra = blog[1].startsWith("chuhai-weekly-") ? both("/go-global/weekly") : [];
    return [...both(`/blog/${blog[1]}`), ...both("/blog"), ...both(""), ...extra];
  }
  const news = file.match(/^src\/content\/news\/(\d{4}-\d{2}-\d{2})\.md$/);
  if (news) {
    // 只有带人工点评的快讯才进 sitemap；无点评的快讯 noindex，只推首页即可，避免白等 15 分钟
    return isNewsDigestIndexable(file)
      ? [...both(`/news/${news[1]}`), ...both("")]
      : [...both("")];
  }
  // 提示词库源文件变了：推列表页和 /prompts 总览（总览上有三个库的作品数）
  if (file === "src/content/opus-prompts/cases.json")
    return [...both(PROMPT_LIBS["opus-prompts"]), ...both("/prompts")];
  if (file === "src/content/image-prompts/chatgpt-images-2-6.json")
    return [...both(PROMPT_LIBS["image-prompts"]), ...both("/prompts")];
  if (file === "src/content/gemini-prompts/gemini-4.json")
    return [...both(PROMPT_LIBS["gemini-prompts"]), ...both("/prompts")];
  if (file.startsWith("src/app/[lang]/prompts/claude-animation/"))
    return [...both("/prompts/claude-animation"), ...both("/prompts")];
  // 作品详情页按 public/data/<库>/<id>.json 推：生成脚本只给有提示词的作品写这个文件，正好是有详情页、进 sitemap 的那些
  // （Claude 库没提示词的详情页 noindex，图片库没提示词的没有详情页、卡片直链 X）。文件只含提示词全文，数据核验改播放量不会动它。
  const work = file.match(/^public\/data\/(opus-prompts|image-prompts|gemini-prompts)\/(\d{15,})\.json$/);
  if (work) return both(`${PROMPT_LIBS[work[1]]}/${work[2]}`).filter((u) => !SKIPPED_PROMPT_URLS.has(u));

  // AI Visibility 月榜数据更新
  if (file === "src/generated/ai-visibility-leaderboard.json")
    return [...both("/research/ai-visibility"), ...both("/research")];

  // 出海专题指南数据文件（src/lib/guides/<slug>.ts 或 src/lib/guides/en/<slug>.ts）
  const guide = file.match(/^src\/lib\/guides\/(?:en\/)?([a-z0-9-]+)\.ts$/);
  if (guide && guide[1] !== "types" && guide[1] !== "index")
    return [...both(`/go-global/${guide[1]}`), ...both("/go-global")];
  if (file === "src/lib/go-global.ts" || file === "src/lib/go-global-guides.ts")
    return both("/go-global");

  // 核心静态/专题路由页面（research / go-global / tools / contact / services / about / handbook / ai-learning-guide / backlink-spam-list / club）
  const appPage = file.match(
    /^src\/app\/\[lang\]\/(research|go-global|tools|contact|services|about|handbook|ai-learning-guide|backlink-spam-list|club)(?:\/(.*))?\/[^/]+\.tsx?$/
  );
  if (appPage) {
    const [, section, subpath] = appPage;
    if (subpath && subpath.includes("[")) return both(`/${section}`);
    const route = subpath ? `/${section}/${subpath}` : `/${section}`;
    const parent = subpath && (section === "research" || section === "go-global") ? both(`/${section}`) : [];
    return [...both(route), ...parent];
  }
  return [];
}

function candidatesFromGit(range) {
  let files;
  try {
    files = execSync(`git diff --name-only --diff-filter=AM ${range}`, { encoding: "utf8" });
  } catch {
    console.error(`git diff 失败（range: ${range}），可能是浅克隆深度不够`);
    process.exit(1);
  }
  return files.split("\n").filter(Boolean).flatMap(urlsForFile);
}

async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  const xml = await res.text();
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}

const urlMode = args[0] === "--url";
const candidates = [
  ...new Set(urlMode ? args.slice(1) : candidatesFromGit(args[0] || "HEAD~1..HEAD")),
];
if (candidates.length === 0) {
  console.log("没有需要推送的内容改动");
  process.exit(0);
}

// 等部署：直到所有「内容页」（博客 / 可收录快讯文章页、未跳过提示词库作品详情页）的候选都出现在 sitemap，或超时
let live = await fetchSitemapUrls();
const deadline = Date.now() + WAIT_MINUTES * 60_000;
const isContentPage = (u) => /\/(blog|news)\/[^/]+$/.test(u) || /\/prompts\/[^/]+\/\d{15,}$/.test(u);
const pending = () =>
  candidates.filter((u) => isContentPage(u) && u.includes("/zh/") && !SKIPPED_PROMPT_URLS.has(u) && !live.has(u));
while (!urlMode && pending().length > 0 && Date.now() < deadline) {
  const p = pending();
  console.log(`等待部署上线（${p.length} 个）：${p.slice(0, 5).join(", ")}${p.length > 5 ? " …" : ""}`);
  await new Promise((r) => setTimeout(r, 30_000));
  live = await fetchSitemapUrls();
}

const urlList = urlMode ? candidates : candidates.filter((u) => live.has(u));
const skipped = candidates.filter((u) => !urlList.includes(u));
if (skipped.length) console.log(`不在 sitemap，跳过 ${skipped.length} 个：${skipped.join(", ")}`);
if (urlList.length === 0) {
  console.log("过滤后没有可推送的 URL");
  process.exit(0);
}

console.log(`推送 ${urlList.length} 个 URL：\n  ${urlList.join("\n  ")}`);
if (DRY_RUN) process.exit(0);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE_URL).host,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList,
  }),
});
// 200 = 已接收，202 = 已接收、key 校验待完成；其余视为失败
console.log(`IndexNow 响应：${res.status} ${await res.text()}`);
if (res.status !== 200 && res.status !== 202) process.exit(1);
