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
  const sections = content.split(/^### /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const title = lines[0]?.trim();
    if (!title) continue;

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
      } else if (trimmed && !trimmed.startsWith("- **")) {
        summaryLines.push(trimmed);
      }
    }

    item.summary = summaryLines.join(" ").trim();
    if (item.title) items.push(item);
  }

  // Auto-detect cover image at public/news/<slug>.png
  const coverImagePath = path.join(process.cwd(), "public/news", `${slug}.png`);
  const hasCover = fs.existsSync(coverImagePath);

  return {
    slug,
    date: data.date || slug, // slug is typically the date: 2026-04-14
    title: data.title || `AI 快讯 ${data.date || slug}`,
    items,
    jasonSays: data.jasonSays || "",
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
