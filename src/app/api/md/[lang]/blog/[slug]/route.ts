import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import { AUTHOR_NAME } from "@/lib/profiles";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.flatMap((post) => [
    { lang: "zh", slug: post.slug },
    { lang: "en", slug: post.slug },
  ]);
}

const SITE_URL = "https://jasonzhu.ai";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string; slug: string }> }
) {
  const { lang: rawLang, slug } = await params;
  const lang = rawLang === "en" ? "en" : "zh";
  const post = getPostBySlug(slug, lang);
  if (!post) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const canonicalUrl = `${SITE_URL}/${lang}/blog/${slug}`;
  const authorName = post.author?.name ?? `${AUTHOR_NAME} (jasonzhu.ai)`;
  const doiLine = post.doi
    ? `doi: "${post.doi}"\nzenodo_url: "https://doi.org/${post.doi}"\n`
    : "";

  const md = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `canonical_url: "${canonicalUrl}"`,
    `author: ${JSON.stringify(authorName)}`,
    `author_entity_id: "https://jasonzhu.ai/#person"`,
    `date_published: "${post.date}"`,
    `date_modified: "${post.updated || post.date}"`,
    `category: ${JSON.stringify(post.category)}`,
    `tags: ${JSON.stringify(post.tags)}`,
    ...(doiLine ? [doiLine.trimEnd()] : []),
    "---",
    "",
    `# ${post.title}`,
    "",
    post.content.trim(),
    "",
  ].join("\n");

  return new NextResponse(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Canonical-URL": canonicalUrl,
    },
  });
}
