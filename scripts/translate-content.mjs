/**
 * 批量翻译内容到英文（幂等，可断点续跑）。
 *
 *   node scripts/translate-content.mjs blog          # 翻所有缺 .en.md 的博客
 *   node scripts/translate-content.mjs news          # 翻最近 30 天缺英文字段的快讯
 *   node scripts/translate-content.mjs news --all     # 所有快讯
 *
 * 本机 Node fetch 不稳，请加 CLAUDE_TRANSPORT=curl。本机没有 apimart 的 Claude key 时用 GitHub Actions：
 *   gh workflow run translate-content.yml -f mode=news -f all=true
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

// 2026-10-24 起不用 aigocode：默认走 apimart 的 Claude（APIMART_CLAUDE_KEY 只开通 opus-5-5）。
// 本机没有这个 key，就在 GitHub Actions 里跑（.github/workflows/translate-content.yml）。手动设了 ANTHROPIC_AUTH_TOKEN 时仍走那个代理。
const KEY = process.env.APIMART_CLAUDE_KEY || process.env.ANTHROPIC_AUTH_TOKEN;
const BASE = process.env.APIMART_CLAUDE_KEY
  ? process.env.APIMART_BASE_URL || "https://api.apimart.ai"
  : process.env.ANTHROPIC_BASE_URL || "https://api.aigocode.app";
const MODEL = process.env.CLAUDE_MODEL || (process.env.APIMART_CLAUDE_KEY ? "claude-opus-5-5" : "claude-sonnet-4-6");
if (!KEY) { console.error("❌ 缺 APIMART_CLAUDE_KEY（或 ANTHROPIC_AUTH_TOKEN）"); process.exit(1); }

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
// 快讯正文按行切成块：每个 "### " 开一个块（💰 融资速递段不算条目）。按行处理、不用正则替换，
// 2026-10-31 修过两个坑：旧版用 \Z 判断结尾（JS 里是字面量 Z，块在第一个大写 Z 处被截断，英文插到半句中间），
// 用 String.replace 注入 TitleEN（标题里的 "$1"，比如 $15K，被替换成了链接行）。
function splitBlocks(content) {
  const blocks = [];
  let cur = { head: true, lines: [] };
  for (const line of content.split("\n")) {
    if (line.startsWith("### ")) {
      blocks.push(cur);
      cur = { head: false, item: !line.startsWith("### 💰") && !line.includes("融资速递"), lines: [line] };
    } else cur.lines.push(line);
  }
  blocks.push(cur);
  return blocks;
}

const META_RE = /^- \*\*(板块|来源|链接|TitleEN|EN)\*\*[：:]/;
function itemInfo(b) {
  const lines = b.lines;
  return {
    title: lines[0].slice(4).trim(),
    summary: lines.slice(1).filter((l) => l.trim() && !l.trim().startsWith("- **")).join(" ").trim(),
    hasTitleEn: lines.some((l) => /^- \*\*TitleEN\*\*[：:]/.test(l.trim())),
    hasEn: lines.some((l) => /^- \*\*EN\*\*[：:]/.test(l.trim())),
  };
}

function needsNews(raw) {
  const { data, content } = matter(raw);
  const items = splitBlocks(content).filter((b) => b.item).map(itemInfo);
  return items.length > 0 && (!data.jasonSaysEn || items.some((it) => !it.hasTitleEn || !it.hasEn));
}

async function translateNews(all) {
  const dir = path.join(process.cwd(), "src/content/news");
  const cutoff = "2026-05-16";
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .filter((f) => all || f.replace(".md", "") >= cutoff)
    .sort();
  const todo = files.filter((f) => needsNews(fs.readFileSync(path.join(dir, f), "utf-8")));
  console.log(`📰 快讯：范围 ${files.length}，待补英文 ${todo.length}`);

  let done = 0;
  for (const f of todo) {
    const fp = path.join(dir, f);
    const { data, content } = matter(fs.readFileSync(fp, "utf-8"));
    const blocks = splitBlocks(content);
    const itemBlocks = blocks.filter((b) => b.item);
    // 只送缺英文的条目
    const missing = itemBlocks.map((b) => ({ b, ...itemInfo(b) })).filter((x) => !x.hasTitleEn || !x.hasEn);
    const needJs = !data.jasonSaysEn && data.jasonSays;

    const prompt = `Translate the following Chinese AI-news digest fields to concise, native English. Return ONLY valid JSON, no fences.

Format:
{"jasonSaysEn":"...","items":[{"titleEn":"5-12 word English title","summaryEn":"40-70 word English summary"}]}

The items array must have EXACTLY ${missing.length} entries in the SAME order.${needJs ? "" : ' Return "jasonSaysEn":"" (not needed).'}

jasonSays: ${needJs ? data.jasonSays : ""}

items:
${missing.map((it, i) => `[${i}] ${it.title}\n${it.summary}`).join("\n\n")}`;

    try {
      const out = stripFence(await callClaude(prompt, 8000));
      const m = out.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m[0]);
      const en = parsed.items || [];
      if (en.length !== missing.length) { console.log(`  ❌ ${f}: item 数不匹配 ${en.length}/${missing.length}`); continue; }

      missing.forEach((x, i) => {
        const lines = x.b.lines;
        const e = en[i] || {};
        const titleEn = (e.titleEn || "").replace(/\s+/g, " ").trim();
        const summaryEn = (e.summaryEn || "").replace(/\s+/g, " ").trim();
        if (!x.hasTitleEn && titleEn) {
          // TitleEN 放在链接行后面；没有链接行就放在 meta 行最后
          let at = lines.findIndex((l) => /^- \*\*链接\*\*[：:]/.test(l.trim()));
          if (at < 0) at = lines.reduce((acc, l, j) => (j > 0 && META_RE.test(l.trim()) ? j : acc), 0);
          lines.splice(at + 1, 0, `- **TitleEN**：${titleEn}`);
        }
        if (!x.hasEn && summaryEn) {
          while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
          lines.push("", `- **EN**：${summaryEn}`, "");
        }
      });
      if (needJs && parsed.jasonSaysEn) data.jasonSaysEn = parsed.jasonSaysEn;

      const body = blocks.map((b) => b.lines.join("\n")).join("\n");
      fs.writeFileSync(fp, matter.stringify(body, data), "utf-8");
      done++;
      console.log(`  ✅ [${done}/${todo.length}] ${f}（${missing.length} 条）`);
    } catch (e) {
      console.log(`  ❌ ${f}: ${e.message.slice(0, 80)}`);
    }
  }
  console.log(`✅ 快讯翻译完成 ${done}/${todo.length}`);
  // 一条都没翻成（key 坏了、通道全挂）时报错停住，别让工作流当成功
  if (todo.length && !done) process.exit(1);
}

const mode = process.argv[2];
if (mode === "blog") await translateBlog();
else if (mode === "news") await translateNews(process.argv.includes("--all"));
else { console.error("用法: node scripts/translate-content.mjs blog|news [--all]"); process.exit(1); }
