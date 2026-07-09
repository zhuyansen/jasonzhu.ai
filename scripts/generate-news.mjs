import fs from "fs";
import path from "path";
import matter from "gray-matter";

const NEWS_DIR = path.join(process.cwd(), "src/content/news");
const OUTPUT = path.join(process.cwd(), "src/generated/news.json");

// Ensure directory exists
if (!fs.existsSync(NEWS_DIR)) {
  fs.mkdirSync(NEWS_DIR, { recursive: true });
}

const files = fs
  .readdirSync(NEWS_DIR)
  .filter((f) => (f.endsWith(".mdx") || f.endsWith(".md")) && !f.startsWith("_"));

const digests = files.map((filename) => {
  const slug = filename.replace(/\.mdx?$/, "");
  const filePath = path.join(NEWS_DIR, filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  // Parse items from markdown content
  // Each item is a ### heading with metadata in the body
  const items = [];
  const funding = [];
  const sections = content.split(/^### /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const title = lines[0]?.trim();
    if (!title) continue;

    // 💰 AI 融资速递段：解析成结构化卡片，不当作普通新闻 item
    if (title.includes("融资速递")) {
      let cur = null;
      for (const raw of lines.slice(1)) {
        const t = raw.trim();
        if (!t) continue;
        // 顶层条目：- **[公司](url)** · 轮次 · 金额 · 估值 xxx
        const top = t.match(/^-\s+\*\*(.+?)\*\*\s*(.*)$/);
        const isIndented = /^\s{2,}-/.test(raw);
        if (top && !isIndented) {
          if (cur) funding.push(cur);
          let company = top[1].trim();
          let url = "";
          const link = company.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (link) { company = link[1].trim(); url = link[2].trim(); }
          const segs = top[2].split("·").map((x) => x.trim()).filter(Boolean);
          cur = { company, url, round: "", amount: "", valuation: "", investors: "", pitch: "" };
          if (segs[0]) cur.round = segs[0];
          if (segs[1]) cur.amount = segs[1];
          for (const seg of segs.slice(2)) {
            if (seg.startsWith("估值")) cur.valuation = seg.replace(/^估值\s*/, "");
            else if (!cur.valuation) cur.valuation = seg;
          }
        } else if (cur) {
          // 缩进子行：投资方 或 一句话点评
          const sub = t.replace(/^-\s*/, "").trim();
          if (sub.startsWith("投资方")) cur.investors = sub.replace(/^投资方[：:]\s*/, "");
          else cur.pitch = cur.pitch ? cur.pitch + " " + sub : sub;
        }
      }
      if (cur) funding.push(cur);
      continue;
    }

    const item = {
      title,
      source: "",
      category: "",
      url: "",
      summary: "",
    };

    const bodyLines = lines.slice(1);
    const summaryLines = [];

    for (const line of bodyLines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("- **来源**:") || trimmed.startsWith("- **来源**：")) {
        item.source = trimmed.replace(/^- \*\*来源\*\*[：:]/, "").trim();
      } else if (trimmed.startsWith("- **板块**:") || trimmed.startsWith("- **板块**：")) {
        item.category = trimmed.replace(/^- \*\*板块\*\*[：:]/, "").trim();
      } else if (trimmed.startsWith("- **链接**:") || trimmed.startsWith("- **链接**：")) {
        item.url = trimmed.replace(/^- \*\*链接\*\*[：:]/, "").trim();
      } else if (trimmed.startsWith("- **TitleEN**:") || trimmed.startsWith("- **TitleEN**：")) {
        item.titleEn = trimmed.replace(/^- \*\*TitleEN\*\*[：:]/, "").trim();
      } else if (trimmed.startsWith("- **EN**:") || trimmed.startsWith("- **EN**：")) {
        item.summaryEn = trimmed.replace(/^- \*\*EN\*\*[：:]/, "").trim();
      } else if (trimmed && !trimmed.startsWith("- **")) {
        summaryLines.push(trimmed);
      }
    }

    item.summary = summaryLines.join(" ").trim();
    if (item.title) items.push(item);
  }

  // 融资卡自动去重：公司名已出现在当天某条 item 标题里 → 丢弃融资卡
  // （Claude 反复把同一公司同时放 items 和 funding，此处兜底，无需再手动删）
  const dedupedFunding = funding.filter((f) => {
    const name = (f.company || "").split("(")[0].split("（")[0].trim();
    if (!name) return true;
    const dup = items.some((i) => i.title.includes(name));
    if (dup) console.log(`  🧹 ${slug}: 融资卡「${name}」与当天 item 重复，自动移除`);
    return !dup;
  });
  funding.length = 0;
  funding.push(...dedupedFunding);

  // Auto-detect cover image at public/news/<slug>.png
  const coverImagePath = path.join(process.cwd(), "public/news", `${slug}.png`);
  const hasCover = fs.existsSync(coverImagePath);

  return {
    slug,
    date: data.date || slug, // slug is typically the date: 2026-04-14
    title: data.title || `AI 快讯 ${data.date || slug}`,
    items,
    ...(funding.length ? { funding } : {}),
    jasonSays: data.jasonSays || "",
    ...(data.jasonSaysEn ? { jasonSaysEn: data.jasonSaysEn } : {}),
    filename,
    ...(data.tweetUrl ? { tweetUrl: data.tweetUrl } : {}),
    ...(hasCover ? { coverImage: `/news/${slug}.png` } : {}),
  };
});

// Sort by date descending
digests.sort((a, b) => b.date.localeCompare(a.date));

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(digests, null, 2));
console.log(`Generated ${digests.length} news digests (${digests.reduce((s, d) => s + d.items.length, 0)} items) to ${OUTPUT}`);
