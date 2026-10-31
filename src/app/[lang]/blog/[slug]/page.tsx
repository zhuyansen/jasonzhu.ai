import { notFound } from "next/navigation";
import Link from "@/components/Link";
import Image from "next/image";
import { getAllPosts, getPostBySlug, getWeeklyIssues, WEEKLY_SERIES, type BlogPostMeta } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import SubscribeForm from "@/components/SubscribeForm";
import ViewCounter from "@/components/ViewCounter";
import LikeButton from "@/components/LikeButton";
import GiscusComments from "@/components/GiscusComments";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { extractFaq, faqJsonLd } from "@/lib/faq";
import { tagLabel } from "@/lib/tag-labels";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

// 所有 slug 都在 generateStaticParams 里；未知 slug 直接按未匹配路由 404（走 global-not-found，完整 SSR）
export const dynamicParams = false;

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
  const post = getPostBySlug(slug, lang === "en" ? "en" : "zh");
  if (!post) return {};

  const description = post.excerpt && post.excerpt.length >= 50
    ? post.excerpt
    : `${post.title} - Jason Zhu 的博客文章，涵盖${post.category}领域的深度分析与实战经验分享。`;

  return {
    title: post.title,
    description,
    alternates: {
      // 未翻译的 en 页是中文内容的复制，canonical 指回 zh 版，
      // 避免 GSC「重复网页，Google 选择的规范网页与用户指定的不同」
      canonical:
        lang === "en" && !post.hasEnglish
          ? `${SITE_URL}/zh/blog/${slug}`
          : `${SITE_URL}/${lang}/blog/${slug}`,
      languages: post.hasEnglish
        ? {
            zh: `${SITE_URL}/zh/blog/${slug}`,
            en: `${SITE_URL}/en/blog/${slug}`,
            "x-default": `${SITE_URL}/zh/blog/${slug}`,
          }
        : {
            zh: `${SITE_URL}/zh/blog/${slug}`,
            "x-default": `${SITE_URL}/zh/blog/${slug}`,
          },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `${SITE_URL}/${lang}/blog/${slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: ["Jason Zhu"],
      tags: post.tags.map((t) => tagLabel(t, lang)),
      ...(post.coverImage
        ? { images: [{ url: `${SITE_URL}${post.coverImage}`, width: 1536, height: 1024, alt: post.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      creator: "@GoSailGlobal",
      ...(post.coverImage ? { images: [`${SITE_URL}${post.coverImage}`] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  const post = getPostBySlug(slug, lang);
  if (!post) notFound();

  // 出海选品周报的文章属于出海专题下的周报板块：面包屑是 首页 / 出海专题 / 选品周报，返回链接和期数导航指向周报目录
  const isWeekly = post.series === WEEKLY_SERIES;
  const issues = isWeekly ? getWeeklyIssues() : [];
  const trail = isWeekly
    ? [
        { name: lang === "zh" ? "出海专题" : "Going global", href: `/${lang}/go-global` },
        { name: lang === "zh" ? "选品周报" : "Weekly", href: `/${lang}/go-global/weekly` },
      ]
    : [{ name: lang === "zh" ? "博客" : "Blog", href: `/${lang}/blog` }];
  const section = trail[trail.length - 1];
  // 英文页：分类显示英文名；相关文章有英文版的显示英文标题
  const categoryMap = (dict.blog.categoryMap ?? {}) as Record<string, string>;
  const catLabel = (c: string) => categoryMap[c] || c;

  // Related posts: shared tags weighted highest, then same category, newest first
  const relatedPosts = getAllPosts()
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const sharedTags = p.tags.filter((t) => post.tags.includes(t)).length;
      const sameCategory = p.category === post.category ? 1 : 0;
      return { ...p, score: sharedTags * 2 + sameCategory };
    })
    .filter((p) => p.score > 0)
    .sort(
      (a, b) => b.score - a.score || (a.date < b.date ? 1 : -1)
    )
    .slice(0, 3);

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
      ...trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: t.name,
        item: `${SITE_URL}${t.href}`,
      })),
      {
        "@type": "ListItem",
        position: trail.length + 2,
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
    dateModified: post.updated || post.date,
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
    image: post.coverImage
      ? `${SITE_URL}${post.coverImage}`
      : `${SITE_URL}/${lang}/blog/${slug}/opengraph-image`,
    keywords: post.tags.map((t) => tagLabel(t, lang)).join(", "),
  };

  // FAQPage JSON-LD：文章含「## 常见问题」段落时自动生成
  const faqItems = extractFaq(post.content);

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
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd(faqItems)),
          }}
        />
      )}
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-400">
        <ol className="flex items-center gap-1">
          <li>
            <Link href={`/${lang}`} className="hover:text-gray-600">
              {lang === "zh" ? "首页" : "Home"}
            </Link>
          </li>
          {trail.map((t) => (
            <li key={t.href} className="flex items-center gap-1">
              <span>/</span>
              <Link href={t.href} className="hover:text-gray-600">
                {t.name}
              </Link>
            </li>
          ))}
          <li>/</li>
          <li className="text-gray-600 truncate max-w-[200px]">{post.title}</li>
        </ol>
      </nav>
      {/* Back link */}
      <Link
        href={section.href}
        className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-8"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {isWeekly ? (lang === "zh" ? "返回全部周报" : "All issues") : dict.blog.backToBlog}
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {catLabel(post.category)}
          </span>
          <span className="text-sm text-gray-400">{post.date}</span>
          {post.updated && post.updated !== post.date && (
            <span className="text-sm text-gray-400">
              · {lang === "zh" ? "更新于" : "Updated"} {post.updated}
            </span>
          )}
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
                #{tagLabel(tag, lang)}
              </span>
            ))}
          </div>
        )}

        {/* Tweet link */}
        {post.tweetUrl && (
          <div className="mt-5">
            <a
              href={post.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {lang === "zh" ? "在 X 上讨论本文" : "Discuss on X"}
              <span className="text-gray-300 text-xs">↗</span>
            </a>
          </div>
        )}
      </header>

      {isWeekly && <WeeklyNav issue={post.issue ?? 0} issues={issues} lang={lang} />}

      {/* Cover image (hero) — next/image: 自动 AVIF/WebP + srcset，priority 保 LCP */}
      {post.coverImage && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="w-full h-auto block"
          />
        </div>
      )}

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
              // 正文图原图直出（不走 next/image），懒加载：滚到附近才下载，长文不再一打开就下全部图片
              // eslint-disable-next-line @next/next/no-img-element
              <img
                {...props}
                alt={props.alt || ""}
                src={props.src?.replace(/^public\//, "/") || ""}
                loading="lazy"
                decoding="async"
              />
            ),
          }}
        />
      </div>

      {isWeekly && (
        <div className="mt-10">
          <WeeklyNav issue={post.issue ?? 0} issues={issues} lang={lang} />
        </div>
      )}

      {/* Like Button */}
      <div className="mt-10 flex justify-center">
        <LikeButton slug={slug} />
      </div>

      {/* Subscribe CTA */}
      <div className="mt-12">
        <SubscribeForm source={`blog-${slug}`} lang={lang} dict={dict} />
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {lang === "zh" ? "相关文章" : "Related Posts"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/${lang}/blog/${rp.slug}`}
                className="block p-4 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:shadow-sm transition-all"
              >
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full mb-2">
                  {catLabel(rp.category)}
                </span>
                <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                  {lang === "en" && rp.titleEn ? rp.titleEn : rp.title}
                </p>
                <p className="text-xs text-gray-400 mt-2">{rp.date}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

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

/** 出海选品周报的期数导航：第几期、上一期、全部周报、下一期 */
function WeeklyNav({ issue, issues, lang }: { issue: number; issues: BlogPostMeta[]; lang: Locale }) {
  const isZh = lang === "zh";
  const older = issues.find((p) => p.issue === issue - 1);
  const newer = issues.find((p) => p.issue === issue + 1);
  return (
    <nav
      aria-label={isZh ? "周报期数" : "Issues"}
      className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm"
    >
      <span className="font-medium text-blue-700">{isZh ? `出海选品周报 · 第 ${issue} 期` : `Weekly · Issue ${issue}`}</span>
      <span className="flex items-center gap-4 text-gray-500">
        {older && (
          <Link href={`/${lang}/blog/${older.slug}`} className="hover:text-gray-900">
            {isZh ? "← 上一期" : "← Previous"}
          </Link>
        )}
        <Link href={`/${lang}/go-global/weekly`} className="hover:text-gray-900">
          {isZh ? "全部周报" : "All issues"}
        </Link>
        {newer && (
          <Link href={`/${lang}/blog/${newer.slug}`} className="hover:text-gray-900">
            {isZh ? "下一期 →" : "Next →"}
          </Link>
        )}
      </span>
    </nav>
  );
}
