import type { Metadata } from "next";
import Link from "@/components/Link";
import { getAllPosts } from "@/lib/mdx";
import { getAllDigests, isDigestIndexable } from "@/lib/news";
import { GUIDES } from "@/lib/go-global-guides";
import { type Locale } from "@/lib/dictionaries";
import { withSocialCards } from "@/lib/social";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  return withSocialCards(
    {
      title: isZh
        ? "全站目录 (HTML Sitemap) — JasonZhu.AI"
        : "HTML Sitemap & Directory — JasonZhu.AI",
      description: isZh
        ? "JasonZhu.AI 全站内容分类目录：核心页面、AI 出海实战指南、全部深度教程博客与每日 AI 快讯索引（距首页 1 次点击直达）。"
        : "Complete HTML Sitemap of JasonZhu.AI: core pages, going-global guides, all in-depth AI tutorials, and daily AI news archives.",
      alternates: {
        canonical: `https://jasonzhu.ai/${lang}/sitemap-html`,
        languages: {
          zh: "https://jasonzhu.ai/zh/sitemap-html",
          en: "https://jasonzhu.ai/en/sitemap-html",
          "x-default": "https://jasonzhu.ai/zh/sitemap-html",
        },
      },
    },
    rawLang
  );
}

export default async function HtmlSitemapPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";

  const posts = getAllPosts();
  const newsList = getAllDigests().filter(isDigestIndexable);

  // Group posts by category for clean Product-Led SEO directory hierarchy
  const postsByCategory = new Map<string, typeof posts>();
  for (const post of posts) {
    const cat = post.category || (isZh ? "综合教程" : "General");
    const list = postsByCategory.get(cat) ?? [];
    list.push(post);
    postsByCategory.set(cat, list);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {isZh ? "全站目录 (HTML Sitemap)" : "Site Directory (HTML Sitemap)"}
        </h1>
        <p className="text-sm text-gray-500">
          {isZh
            ? `基于 Product-Led SEO 扁平内链架构生成：共收录 ${posts.length} 篇深度实战教程、${GUIDES.length + 3} 篇出海专题指南与 ${newsList.length} 期 AI 每日快讯，所有页面距首页不超过 2 次点击。`
            : `Product-Led SEO flat link directory indexing ${posts.length} tutorials, ${GUIDES.length + 3} going-global playbooks, and ${newsList.length} AI daily news issues within 2 clicks of the homepage.`}
        </p>
      </div>

      {/* Section 1: Core Hubs & Tools */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          {isZh ? "1. 核心频道与工具" : "1. Core Hubs & Interactive Tools"}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-sm">
          <li>
            <Link href={`/${lang}`} className="text-[var(--primary)] hover:underline font-medium">
              {isZh ? "首页 (JasonZhu.AI)" : "Home (JasonZhu.AI)"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/blog`} className="text-[var(--primary)] hover:underline font-medium">
              {isZh ? "全部教程与文章 (/blog)" : "All Blog Tutorials (/blog)"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/go-global`} className="text-[var(--primary)] hover:underline font-medium">
              {isZh ? "独立开发者出海专题 (/go-global)" : "Going-Global Hub (/go-global)"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/go-global/payments`} className="text-[var(--primary)] hover:underline">
              {isZh ? "海外收款平台选择器 (/go-global/payments)" : "Cross-Border Payment Selector"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/go-global/ai-readiness`} className="text-[var(--primary)] hover:underline font-medium">
              {isZh ? "AI 网站急诊室 & 第 1 课 7 关通关游戏 (/go-global/ai-readiness)" : "AI Website Clinic & Course 1 Game (/go-global/ai-readiness)"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/go-global/open-account`} className="text-[var(--primary)] hover:underline">
              {isZh ? "个人还是公司：海外收款开户指南" : "Individual vs Company Account Guide"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/go-global/weekly`} className="text-[var(--primary)] hover:underline">
              {isZh ? "出海选品周报 (/go-global/weekly)" : "Going-Global Weekly Reports"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/prompts/claude-opus-5-5`} className="text-[var(--primary)] hover:underline">
              {isZh ? "Claude 5.5 提示词库" : "Claude 5.5 Prompts Library"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/prompts/chatgpt-images-2-6`} className="text-[var(--primary)] hover:underline">
              {isZh ? "ChatGPT Images 2.6 提示词库" : "ChatGPT Images 2.6 Prompts"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/prompts/gemini-4`} className="text-[var(--primary)] hover:underline">
              {isZh ? "Gemini 4 提示词库" : "Gemini 4 Prompts Library"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/tools`} className="text-[var(--primary)] hover:underline">
              {isZh ? "AI 工具箱 (/tools)" : "AI Tools Directory (/tools)"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/backlink-spam-list`} className="text-[var(--primary)] hover:underline">
              {isZh ? "垃圾外链来源库 (/backlink-spam-list)" : "Backlink Spam List"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/club`} className="text-[var(--primary)] hover:underline font-medium">
              {isZh ? "GoSail Club 启航会会员与定价 (/club)" : "GoSail Club Membership & Pricing (/club)"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/services`} className="text-[var(--primary)] hover:underline">
              {isZh ? "企业 AI 培训与咨询服务 (/services)" : "Enterprise AI Training & Services"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/about`} className="text-[var(--primary)] hover:underline">
              {isZh ? "关于作者 Jason Zhu (/about)" : "About Jason Zhu (/about)"}
            </Link>
          </li>
          <li>
            <Link href={`/${lang}/contact`} className="text-[var(--primary)] hover:underline">
              {isZh ? "联系我们 (/contact)" : "Contact Us (/contact)"}
            </Link>
          </li>
        </ul>
      </section>

      {/* Section 2: Going Global Guides */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          {isZh ? "2. 出海合规与收款开户实战指南" : "2. Going-Global Playbooks & Guides"}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/${lang}/go-global/${g.slug}`}
                className="text-[var(--primary)] hover:underline font-medium"
              >
                {g.title}
              </Link>
              <span className="text-xs text-gray-400 ml-2">{g.description}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 3: Blog Posts grouped by category */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          {isZh ? `3. 全部深度实战文章 (${posts.length} 篇)` : `3. All In-Depth Articles (${posts.length})`}
        </h2>
        <div className="space-y-6">
          {Array.from(postsByCategory.entries()).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                {category} ({items.length})
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {items.map((post) => (
                  <li key={post.slug} className="truncate">
                    <Link
                      href={`/${lang}/blog/${post.slug}`}
                      className="text-gray-700 hover:text-[var(--primary)] hover:underline"
                    >
                      {lang === "en" && post.titleEn ? post.titleEn : post.title}
                    </Link>
                    <span className="text-xs text-gray-400 ml-2">{post.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Daily AI News Archive */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          {isZh ? `4. 每日 AI 快讯归档 (${newsList.length} 期)` : `4. Daily AI News Archive (${newsList.length} issues)`}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {newsList.map((n) => (
            <li key={n.date} className="truncate">
              <Link
                href={`/${lang}/news/${n.date}`}
                className="text-gray-600 hover:text-[var(--primary)] hover:underline"
              >
                {n.date} — {n.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
