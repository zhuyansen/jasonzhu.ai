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

const SITE_URL = "https://jasonzhu.ai";
const KEY = "1ebb2aa454ac822bb9fd07a0bc35cfaa";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const WAIT_MINUTES = Number(process.env.INDEXNOW_WAIT_MINUTES ?? 15);
const DRY_RUN = process.argv.includes("--dry-run");

const args = process.argv.slice(2).filter((a) => a !== "--dry-run");

/** 改动的文件路径 → 候选 URL（zh/en 都列上，交给 sitemap 过滤） */
function urlsForFile(file) {
  const both = (p) => [`${SITE_URL}/zh${p}`, `${SITE_URL}/en${p}`];
  const blog = file.match(/^src\/content\/blog\/([^/_][^/]*?)(\.en)?\.mdx?$/);
  if (blog) return [...both(`/blog/${blog[1]}`), ...both("/blog"), ...both("")];
  const news = file.match(/^src\/content\/news\/(\d{4}-\d{2}-\d{2})\.md$/);
  if (news) return [...both(`/news/${news[1]}`), ...both("/news"), ...both("")];
  if (file === "src/content/opus-prompts/cases.json") return both("/prompts/claude-opus-5-5");
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

// 等部署：直到所有「属于内容页」的候选都出现在 sitemap，或超时
let live = await fetchSitemapUrls();
const deadline = Date.now() + WAIT_MINUTES * 60_000;
const isContentPage = (u) => /\/(blog|news)\/[^/]+$/.test(u);
const pending = () =>
  candidates.filter((u) => isContentPage(u) && u.includes("/zh/") && !live.has(u));
while (!urlMode && pending().length > 0 && Date.now() < deadline) {
  console.log(`等待部署上线：${pending().join(", ")}`);
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
