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

// 博客搜索用：每篇的小标题（## / ###，最多 20 个、每个 40 字）——让正文关键词也能搜到，又不用把全文发给浏览器
const headingsOf = (content) =>
  [...content.matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map((m) => m[1].replace(/[*`_[\]]/g, "").replace(/\(http[^)]*\)/g, "").trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 20);
// 正文里的英文词 / 产品名 / 带数字的术语（EIN、Mercury、147C、W-8BEN…），按出现次数取前 40 个，进搜索索引
const STOP = new Set("the and for with you your this that are from have not but can will was all our out use how what when http https www com html png jpg md".split(" "));
const keywordsOf = (content) => {
  const body = content.replace(/!?\[[^\]]*\]\([^)]*\)/g, " ").replace(/https?:\/\/\S+/g, " ").replace(/```[\s\S]*?```/g, " ");
  const counts = new Map();
  for (const m of body.matchAll(/[A-Za-z][A-Za-z0-9.+-]*[A-Za-z0-9]|\d+[A-Za-z][A-Za-z0-9-]*/g)) {
    const w = m[0];
    if (w.length < 3 && !/\d/.test(w)) continue;
    const k = w.toLowerCase();
    if (STOP.has(k)) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k]) => k);
};
// 英文版的标题 / 摘要也进搜索索引，英文页能用英文搜
const enMeta = new Map(
  enFiles.map((f) => {
    const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, f), "utf-8"));
    return [f.replace(/\.en\.mdx?$/, ""), { titleEn: data.title || undefined, excerptEn: data.excerpt || undefined }];
  })
);

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
    ...(enMeta.get(slug) || {}),
    headings: headingsOf(content),
    keywords: keywordsOf(content),
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

// 英文版内容：<slug>.en.json，frontmatter 可覆盖 title/excerpt/coverImage（英文封面，用于英文页 hero 和 OG 图）
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
      coverImage: data.coverImage || undefined,
    })
  );
}
if (enFiles.length) console.log(`Generated ${enFiles.length} English versions`);
