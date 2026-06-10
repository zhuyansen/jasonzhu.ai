import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
const OUTPUT = path.join(process.cwd(), "src/generated/posts.json");
const CONTENT_DIR = path.join(process.cwd(), "src/generated/post-content");

const allFiles = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => (f.endsWith(".mdx") || f.endsWith(".md")) && !f.startsWith("_"));

// 双语机制：<slug>.en.md 是 <slug>.md 的英文版，不算独立文章
const enFiles = allFiles.filter((f) => /\.en\.mdx?$/.test(f));
const files = allFiles.filter((f) => !/\.en\.mdx?$/.test(f));
const enSlugs = new Set(enFiles.map((f) => f.replace(/\.en\.mdx?$/, "")));

const posts = files.map((filename) => {
  const slug = filename.replace(/\.mdx?$/, "");
  const filePath = path.join(BLOG_DIR, filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: data.title || slug,
    date: data.date || "2024-01-01",
    category: data.category || "未分类",
    tags: data.tags || [],
    updated: data.updated || undefined,
    excerpt: data.excerpt || "",
    coverImage: data.coverImage || undefined,
    tweetUrl: data.tweetUrl || undefined,
    hasEnglish: enSlugs.has(slug) || undefined,
    content,
    filename,
  };
});

posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Write metadata-only posts.json (no content/body)
const postsMeta = posts.map(({ content, ...meta }) => meta);
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(postsMeta, null, 2));
console.log(`Generated ${postsMeta.length} posts metadata to ${OUTPUT}`);

// Write individual post content files
fs.mkdirSync(CONTENT_DIR, { recursive: true });
for (const post of posts) {
  const contentFile = path.join(CONTENT_DIR, `${post.slug}.json`);
  fs.writeFileSync(contentFile, JSON.stringify({ content: post.content }));
}
console.log(`Generated ${posts.length} post content files to ${CONTENT_DIR}`);

// 英文版内容：<slug>.en.json，frontmatter 可覆盖 title/excerpt
for (const filename of enFiles) {
  const slug = filename.replace(/\.en\.mdx?$/, "");
  const { data, content } = matter(
    fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8")
  );
  fs.writeFileSync(
    path.join(CONTENT_DIR, `${slug}.en.json`),
    JSON.stringify({
      content,
      title: data.title || undefined,
      excerpt: data.excerpt || undefined,
    })
  );
}
if (enFiles.length) console.log(`Generated ${enFiles.length} English versions`);
