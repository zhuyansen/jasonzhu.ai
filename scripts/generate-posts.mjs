import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
const OUTPUT = path.join(process.cwd(), "src/generated/posts.json");
const CONTENT_DIR = path.join(process.cwd(), "src/generated/post-content");

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => (f.endsWith(".mdx") || f.endsWith(".md")) && !f.startsWith("_"));

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
    excerpt: data.excerpt || "",
    coverImage: data.coverImage || undefined,
    tweetUrl: data.tweetUrl || undefined,
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
