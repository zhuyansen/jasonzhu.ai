import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import SubscribeForm from "@/components/SubscribeForm";
import ViewCounter from "@/components/ViewCounter";
import LikeButton from "@/components/LikeButton";
import GiscusComments from "@/components/GiscusComments";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.flatMap((post) => [
    { lang: "zh", slug: post.slug },
    { lang: "en", slug: post.slug },
  ]);
}

const SITE_URL = "https://jasonzhu.ai";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const description = post.excerpt && post.excerpt.length >= 50
    ? post.excerpt
    : `${post.title} - Jason Zhu 的博客文章，涵盖${post.category}领域的深度分析与实战经验分享。`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/blog/${slug}`,
      languages: {
        zh: `${SITE_URL}/zh/blog/${slug}`,
        en: `${SITE_URL}/en/blog/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `${SITE_URL}/${lang}/blog/${slug}`,
      publishedTime: post.date,
      authors: ["Jason Zhu"],
      tags: post.tags,
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      creator: "@GoSailGlobal",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: lang === "zh" ? "首页" : "Home",
        item: `${SITE_URL}/${lang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "zh" ? "博客" : "Blog",
        item: `${SITE_URL}/${lang}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/${lang}/blog/${slug}`,
      },
    ],
  };

  // Article JSON-LD structured data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "Jason Zhu",
      url: "https://jasonzhu.ai",
    },
    publisher: {
      "@type": "Person",
      name: "Jason Zhu",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${lang}/blog/${slug}`,
    },
    image: `${SITE_URL}/og-image.png`,
    keywords: post.tags.join(", "),
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-400">
        <ol className="flex items-center gap-1">
          <li>
            <Link href={`/${lang}`} className="hover:text-gray-600">
              {lang === "zh" ? "首页" : "Home"}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${lang}/blog`} className="hover:text-gray-600">
              {lang === "zh" ? "博客" : "Blog"}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-600 truncate max-w-[200px]">{post.title}</li>
        </ol>
      </nav>
      {/* Back link */}
      <Link
        href={`/${lang}/blog`}
        className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-8"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {dict.blog.backToBlog}
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {post.category}
          </span>
          <span className="text-sm text-gray-400">{post.date}</span>
          <ViewCounter slug={slug} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeHighlight, rehypeSlug],
            },
          }}
          components={{
            img: (props) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                {...props}
                alt={props.alt || ""}
                src={props.src?.replace(/^public\//, "/") || ""}
              />
            ),
          }}
        />
      </div>

      {/* Like Button */}
      <div className="mt-10 flex justify-center">
        <LikeButton slug={slug} />
      </div>

      {/* Subscribe CTA */}
      <div className="mt-12">
        <SubscribeForm source={`blog-${slug}`} lang={lang} dict={dict} />
      </div>

      {/* Comments */}
      <div className="mt-12">
        <GiscusComments lang={lang} />
      </div>

      {/* Footer */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Jason Zhu</p>
            <p className="text-sm text-gray-500">{dict.blog.authorTitle}</p>
          </div>
          <a
            href="https://x.com/GoSailGlobal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {dict.blog.followOnX}
          </a>
        </div>
      </div>
    </article>
  );
}
