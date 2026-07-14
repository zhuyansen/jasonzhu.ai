/**
 * 批量翻译内容到英文（幂等，可断点续跑）。
 *
 *   node scripts/translate-content.mjs blog          # 翻所有缺 .en.md 的博客
 *   node scripts/translate-content.mjs news          # 翻最近 30 天缺英文字段的快讯
 *   node scripts/translate-content.mjs news --all     # 所有快讯
 *
 * 本机 Node fetch 不稳，请加 CLAUDE_TRANSPORT=curl。
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// 加载 .env.local（override）
for (const envFile of [".env.local", ".env"]) {
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 0) continue;
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[t.slice(0, eq).trim()] = v;
    }
    break;
  }
}

const KEY = process.env.ANTHROPIC_AUTH_TOKEN;
const BASE = process.env.ANTHROPIC_BASE_URL || "https://api.aigocode.app";
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
if (!KEY) { console.error("❌ 缺 ANTHROPIC_AUTH_TOKEN"); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// aigocode 偶发把请求路由到 Bedrock 后端（要求 anthropic_version 在 body）并返回 SSE 流，
// 导致 JSON 损坏/报错。稳健提取首个 JSON 对象，错误即重试，多试几次总能命中正常后端。
function parseFirstJson(out) {
  // 截掉 SSE 的 "data:" 之后内容
  let s = out.split(/\bdata:\s*/)[0].trim();
  if (!s) s = out.trim();
  // 取首个平衡大括号对象
  const start = s.indexOf("{");
  if (start < 0) throw new Error("no json: " + out.slice(0, 80));
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; }
    else if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return JSON.parse(s.slice(start, i + 1)); }
  }
  return JSON.parse(s.slice(start)); // 兜底
}

async function callClaude(prompt, maxTokens = 16000) {
  const body = { model: MODEL, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] };
  const MAX = 8;
  for (let attempt = 1; attempt <= MAX; attempt++) {
    try {
      let json;
      if (process.env.CLAUDE_TRANSPORT === "curl") {
        const { execFileSync } = await import("node:child_process");
        const out = execFileSync("curl", [
          "-sS", "--http1.1", "--max-time", "180", `${BASE}/v1/messages`,
          "-H", `x-api-key: ${KEY}`, "-H", "anthropic-version: 2023-06-01",
          "-H", "content-type: application/json", "-H", "Connection: close", "-d", "@-",
        ], { input: JSON.stringify(body), maxBuffer: 50 * 1024 * 1024, encoding: "utf-8" });
        json = parseFirstJson(out);
      } else {
        const res = await fetch(`${BASE}/v1/messages`, {
          method: "POST",
          headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        json = parseFirstJson(await res.text());
      }
      if (json.type === "error") throw new Error(JSON.stringify(json.error).slice(0, 120));
      const text = (json.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      if (!text) throw new Error("empty text");
      return text;
    } catch (e) {
      console.log(`    ⚠️ attempt ${attempt}/${MAX}: ${e.message.slice(0, 70)}`);
      if (attempt === MAX) throw e;
      await sleep(2000 + attempt * 1500);
    }
  }
}

const stripFence = (s) => s.replace(/^```[a-z]*\n/i, "").replace(/\n```$/i, "").trim();

// ─── 博客翻译 ───
async function translateBlog() {
  const dir = path.join(process.cwd(), "src/content/blog");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !f.endsWith(".en.md"));
  const todo = files.filter((f) => !fs.existsSync(path.join(dir, f.replace(/\.md$/, ".en.md"))));
  console.log(`📝 博客：共 ${files.length}，待翻 ${todo.length}`);

  let done = 0;
  for (const f of todo) {
    const slug = f.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(dir, f), "utf-8");
    const { data, content } = matter(raw);
    const prompt = `Translate this Chinese tech blog post to fluent, native English. Return ONLY valid JSON (no commentary, no code fences):
{"title":"...","excerpt":"...","body":"...full translated markdown body..."}

Rules:
- title and excerpt: translated to English.
- body: the full translated Markdown body (everything after the frontmatter). It is a JSON string, so escape newlines as \\n and double-quotes as \\".
- Preserve all Markdown structure: headings, tables, lists, blockquotes, code blocks, bold/italic.
- Translate the heading "## 常见问题" to "## FAQ" (exactly), keep its Q&A structure.
- Rewrite internal blog links: /zh/blog/... → /en/blog/... . Keep /zh/news/... , external URLs, image paths, and @handles unchanged.
- Keep product names, company names, code, URLs, and numbers as-is.
- Natural English a native would write, not literal word-for-word.

Original title: ${data.title}
Original excerpt: ${data.excerpt || ""}

Original body:
${content}`;

    try {
      const out = stripFence(await callClaude(prompt));
      const m = out.match(/\{[\s\S]*\}/);
      if (!m) { console.log(`  ❌ ${slug}: 无 JSON`); continue; }
      const j = JSON.parse(m[0]);
      if (!j.title || !j.body) { console.log(`  ❌ ${slug}: 缺 title/body`); continue; }
      // 用 matter.stringify 安全拼 frontmatter（自动处理 YAML 转义）
      const enMd = matter.stringify("\n" + j.body.trim() + "\n", {
        title: j.title,
        excerpt: j.excerpt || "",
      });
      fs.writeFileSync(path.join(dir, `${slug}.en.md`), enMd, "utf-8");
      done++;
      console.log(`  ✅ [${done}/${todo.length}] ${slug}`);
    } catch (e) {
      console.log(`  ❌ ${slug}: ${e.message.slice(0, 80)}`);
    }
  }
  console.log(`✅ 博客翻译完成 ${done}/${todo.length}`);
}

// ─── 快讯翻译 ───
function parseItems(content) {
  const items = [];
  for (const sec of content.split(/^### /m).filter(Boolean)) {
    const lines = sec.trim().split("\n");
    const title = lines[0]?.trim();
    if (!title || title.includes("融资速递")) continue;
    const summary = lines.slice(1).filter((l) => l.trim() && !l.trim().startsWith("- **")).join(" ").trim();
    if (title) items.push({ title, summary });
  }
  return items;
}

async function translateNews(all) {
  const dir = path.join(process.cwd(), "src/content/news");
  const cutoff = "2026-05-16";
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .filter((f) => all || f.replace(".md", "") >= cutoff)
    .sort();

  const todo = files.filter((f) => {
    const c = fs.readFileSync(path.join(dir, f), "utf-8");
    // 已全部翻译：有 jasonSaysEn 且每个 item 都有 EN 行
    const items = parseItems(matter(c).content);
    const enCount = (c.match(/- \*\*EN\*\*[：:]/g) || []).length;
    return !(c.includes("jasonSaysEn:") && enCount >= items.length && items.length > 0);
  });
  console.log(`📰 快讯：范围 ${files.length}，待补英文 ${todo.length}`);

  let done = 0;
  for (const f of todo) {
    const fp = path.join(dir, f);
    let raw = fs.readFileSync(fp, "utf-8");
    const { data, content } = matter(raw);
    const items = parseItems(content);
    if (!items.length) { console.log(`  ⏭ ${f}: 无 item`); continue; }

    const prompt = `Translate the following Chinese AI-news digest fields to concise, native English. Return ONLY valid JSON, no fences.

Format:
{"jasonSaysEn":"...","items":[{"titleEn":"5-12 word English title","summaryEn":"40-70 word English summary"}]}

The items array must have EXACTLY ${items.length} entries in the SAME order.

jasonSays: ${data.jasonSays || ""}

items:
${items.map((it, i) => `[${i}] ${it.title}\n${it.summary}`).join("\n\n")}`;

    try {
      const out = stripFence(await callClaude(prompt, 8000));
      const m = out.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m[0]);
      const en = parsed.items || [];
      if (en.length !== items.length) { console.log(`  ❌ ${f}: item 数不匹配 ${en.length}/${items.length}`); continue; }

      // 注入：frontmatter 加 jasonSaysEn；每个 item 加 TitleEN/EN 行
      let body = content;
      // jasonSaysEn 写进 frontmatter（如已存在则跳过）
      if (!raw.includes("jasonSaysEn:") && parsed.jasonSaysEn) {
        data.jasonSaysEn = parsed.jasonSaysEn;
      }
      // 逐 item 注入（按顺序匹配 ### 标题）
      let idx = 0;
      body = body.replace(/^(### (?!💰)(.+)\n(?:[\s\S]*?))(?=^### |\Z)/gm, (block, _b, title) => {
        if (idx >= en.length) return block;
        const e = en[idx]; idx++;
        if (block.includes("- **EN**")) return block; // 已有
        let b = block.trimEnd();
        // 在 - **链接** 行后插 TitleEN
        if (e.titleEn && !b.includes("- **TitleEN**")) {
          b = b.replace(/(- \*\*链接\*\*[：:][^\n]*\n)/, `$1- **TitleEN**：${e.titleEn}\n`);
        }
        // 末尾加 EN 摘要
        if (e.summaryEn) b += `\n\n- **EN**：${e.summaryEn}`;
        return b + "\n\n";
      });

      const rebuilt = matter.stringify(body, data);
      fs.writeFileSync(fp, rebuilt, "utf-8");
      done++;
      console.log(`  ✅ [${done}/${todo.length}] ${f}`);
    } catch (e) {
      console.log(`  ❌ ${f}: ${e.message.slice(0, 80)}`);
    }
  }
  console.log(`✅ 快讯翻译完成 ${done}/${todo.length}`);
}

const mode = process.argv[2];
if (mode === "blog") await translateBlog();
else if (mode === "news") await translateNews(process.argv.includes("--all"));
else { console.error("用法: node scripts/translate-content.mjs blog|news [--all]"); process.exit(1); }
