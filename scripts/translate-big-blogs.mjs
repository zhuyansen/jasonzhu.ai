/**
 * 翻译超大博客（整篇会被代理掐断的）——按 ## 二级标题分块翻，每块单独调用再拼接。
 *   CLAUDE_TRANSPORT=curl node scripts/translate-big-blogs.mjs [slug1 slug2 ...]
 * 不传 slug 则自动翻所有缺 .en.md 且 > 6000 字的博客。
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { execFileSync } from "node:child_process";

for (const l of fs.readFileSync(".env.local", "utf-8").split("\n")) {
  const t = l.trim(); if (!t || t.startsWith("#")) continue;
  const e = t.indexOf("="); if (e < 0) continue;
  let v = t.slice(e + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  process.env[t.slice(0, e).trim()] = v;
}
const KEY = process.env.ANTHROPIC_AUTH_TOKEN, BASE = process.env.ANTHROPIC_BASE_URL || "https://api.aigocode.app";
const dir = "src/content/blog";

function call(prompt, maxTok = 8000, timeout = 150) {
  for (let i = 1; i <= 8; i++) {
    try {
      const out = execFileSync("curl", [
        "-sS", "--http1.1", "--max-time", String(timeout), `${BASE}/v1/messages`,
        "-H", `x-api-key: ${KEY}`, "-H", "anthropic-version: 2023-06-01",
        "-H", "content-type: application/json", "-H", "Connection: close", "-d", "@-",
      ], { input: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTok, messages: [{ role: "user", content: prompt }] }), maxBuffer: 80 * 1024 * 1024, encoding: "utf-8" });
      const s = out.split(/\bdata:\s*/)[0].trim();
      const j = JSON.parse(s.slice(s.indexOf("{")));
      if (j.type === "error") throw new Error(JSON.stringify(j.error).slice(0, 60));
      const txt = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      if (!txt) throw new Error("empty");
      return txt;
    } catch (e) {
      console.log(`      try${i}: ${String(e.message).slice(0, 45)}`);
      if (i === 8) throw e;
    }
  }
}
const unfence = (s) => s.replace(/^```(markdown|md)?\n/, "").replace(/\n```$/, "").trim();

function chunk(content, maxChars = 2800) {
  const parts = content.split(/(?=^## )/m);
  const chunks = []; let cur = "";
  for (const p of parts) { if ((cur + p).length > maxChars && cur) { chunks.push(cur); cur = p; } else cur += p; }
  if (cur) chunks.push(cur);
  return chunks;
}

let slugs = process.argv.slice(2);
if (!slugs.length) {
  slugs = fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !f.endsWith(".en.md"))
    .filter((f) => !fs.existsSync(path.join(dir, f.replace(/\.md$/, ".en.md"))))
    .map((f) => f.replace(/\.md$/, ""));
}
console.log("待翻:", slugs.join(", ") || "(无)");
let done = 0;
for (const slug of slugs) {
  const fp = path.join(dir, slug + ".md");
  if (!fs.existsSync(fp)) { console.log("跳过(无源)", slug); continue; }
  if (fs.existsSync(path.join(dir, slug + ".en.md"))) { console.log("已存在", slug); done++; continue; }
  const { data, content } = matter(fs.readFileSync(fp, "utf-8"));
  const chunks = chunk(content);
  console.log(`📄 ${slug}: ${chunks.length} 块`);
  try {
    const en = [];
    for (let i = 0; i < chunks.length; i++) {
      const t = call(`Translate this Chinese Markdown fragment to native English. Return ONLY the translated Markdown (no commentary, no outer code fences). Translate "## 常见问题"→"## FAQ". Rewrite /zh/blog/→/en/blog/, keep /zh/news/, URLs, images, code, @handles, numbers as-is. Keep heading levels exactly.\n\n${chunks[i]}`);
      en.push(unfence(t));
      console.log(`    ✅ 块 ${i + 1}/${chunks.length}`);
    }
    const te = call(`Translate to English, return ONLY JSON {"title":"..","excerpt":".."}:\ntitle: ${data.title}\nexcerpt: ${data.excerpt || ""}`, 1000, 90);
    const j = JSON.parse(te.match(/\{[\s\S]*\}/)[0]);
    fs.writeFileSync(path.join(dir, slug + ".en.md"), matter.stringify("\n" + en.join("\n\n") + "\n", { title: j.title, excerpt: j.excerpt || "" }), "utf-8");
    done++; console.log(`  ✅✅ ${slug}`);
  } catch (e) { console.log(`  ❌ ${slug}: ${String(e.message).slice(0, 60)}`); }
}
console.log(`完成 ${done}/${slugs.length} | 总 ${fs.readdirSync(dir).filter((f) => f.endsWith(".en.md")).length}/94`);
