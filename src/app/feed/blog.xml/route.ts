import { getAllPosts } from "@/lib/mdx";

const SITE_URL = "https://jasonzhu.ai";

export async function GET() {
  const posts = getAllPosts().slice(0, 50);

  const items = posts
    .map(
      (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/zh/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/zh/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date + "T08:00:00+08:00").toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
      <category><![CDATA[${post.category}]]></category>
    </item>`
    )
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>JasonZhu.AI - 博客</title>
    <link>${SITE_URL}/zh/blog</link>
    <description>AI 工具评测、实战教程、行业洞察与出海增长策略</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed/blog.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
