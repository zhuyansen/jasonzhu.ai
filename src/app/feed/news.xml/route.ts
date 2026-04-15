import { getAllDigests } from "@/lib/news";

const SITE_URL = "https://jasonzhu.ai";

export async function GET() {
  const digests = getAllDigests();

  const items = digests
    .map((digest) => {
      const itemsList = digest.items
        .map(
          (item) =>
            `<li><strong>[${item.category}]</strong> ${item.title} — ${item.summary}</li>`
        )
        .join("\n            ");

      return `    <item>
      <title><![CDATA[${digest.title}]]></title>
      <link>${SITE_URL}/zh/news/${digest.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/zh/news/${digest.slug}</guid>
      <pubDate>${new Date(digest.date + "T08:00:00+08:00").toUTCString()}</pubDate>
      <description><![CDATA[
        <p><strong>💡 Jason Says:</strong> ${digest.jasonSays}</p>
        <ul>
            ${itemsList}
        </ul>
      ]]></description>
      <category>AI News</category>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>JasonZhu.AI - AI 快讯</title>
    <link>${SITE_URL}/zh/news</link>
    <description>每日精选 AI 行业动态：Skills 生态、出海实战、工具更新</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed/news.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>JasonZhu.AI</title>
      <link>${SITE_URL}</link>
    </image>
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
