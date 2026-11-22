import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleOneTap from "@/components/GoogleOneTap";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import "../globals.css";
import ThirdPartyAnalytics from "@/components/ThirdPartyAnalytics";
import { AUTHOR_ALT_NAMES, AUTHOR_NAME, ORCID_ID, ORCID_URL, PERSON_ID, PERSON_PROFILES, RELATED_SITES } from "@/lib/profiles";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import WebMcpRegister from "@/components/WebMcpRegister";

const SITE_URL = "https://jasonzhu.ai";

// 全站 JSON-LD：Person（本人）+ WebSite + Service（GoSail Club）+ AgentSkillsHub。
// 个人站，不写公司（2026-11-21 Jason 定）：没有 Organization 节点，网站的作者和发布者、GoSail Club 的提供者都是 #person。
// AgentSkillsHub 是作者办的另一个网站，单独一个节点，founder 指向 #person。
// 论文、数据集、开源工具不放进全站图，只在 /research、引用它的博客文章页和 /backlink-spam-list 输出（src/lib/profiles.ts 的 WORKS）。
// 按路由语言输出中/英文描述与对应语言 URL，避免 /en 页向英文知识图谱与 Gemini 喂中文实体文本。
function buildSiteJsonLd(lang: Locale) {
  const isZh = lang === "zh";
  const person = { "@id": PERSON_ID };

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: AUTHOR_NAME,
    alternateName: AUTHOR_ALT_NAMES,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "ORCID",
      value: ORCID_ID,
      url: ORCID_URL,
    },
    url: `${SITE_URL}/${lang}`,
    image: "https://jasonzhu.ai/avatar.jpg",
    email: "mailto:jason@jasonzhu.ai",
    // 只放代表本人的档案；论文、数据集、软件包、AgentSkillsHub 都是别的实体
    sameAs: PERSON_PROFILES.map((p) => p.url),
    jobTitle: isZh
      ? "前搜广推与知识图谱算法工程师、AI 应用与出海独立开发研究者"
      : "AI Engineer & Go-Global Indie SaaS Researcher",
    description: isZh
      ? "前搜广推与知识图谱算法工程师，现 AI 应用与出海独立开发研究者（jasonzhu.ai / GitHub: zhuyansen），创办了 Agent Skills Hub。工作论文和数据集见 jasonzhu.ai/zh/research。"
      : "Former search, recommendation, and knowledge-graph algorithm engineer, now an AI applications and go-global indie SaaS researcher (jasonzhu.ai / GitHub: zhuyansen). Founder of Agent Skills Hub. Working papers and datasets: jasonzhu.ai/en/research.",
    knowsAbout: [
      "Generative Engine Optimization (GEO)",
      "Cross-Border Indie SaaS Payment Gateways (Stripe, Dodo Payments, Waffo, Polar, Creem)",
      "Merchant of Record (MoR) Tax & Fee Benchmarks",
      "AI Agent Skills & MCP Server Security Auditing",
      "Information Retrieval, Knowledge Graphs & Entity Resolution",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "JasonZhu.AI",
    url: `${SITE_URL}/${lang}`,
    description: isZh
      ? "AI 工具评测、实战教程、行业洞察与出海增长策略，附独立开发者收款数据和 AI Agent Skills 安全审计。"
      : "Hands-on AI tool reviews, tutorials, indie SaaS payment data, and open-source AI agent skills security audits.",
    author: person,
    publisher: person,
    inLanguage: isZh ? "zh-CN" : "en",
  };

  // AgentSkillsHub 的 sameAs 只放描述它自己的页面（Wikidata、Crunchbase）
  const relatedSitesJsonLd = RELATED_SITES.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": s.id,
    name: s.name,
    alternateName: s.alternateName,
    url: s.url,
    founder: person,
    sameAs: s.sameAs,
  }));

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: isZh
      ? "GoSail Club 启航会 & 企业 AI 实战培训"
      : "GoSail Club Community & Enterprise AI Training",
    provider: person,
    description: isZh
      ? "AI 出海实战社群（GoSail Club）、企业 AI 培训、MCN 合作与跨境出海技术咨询服务。"
      : "Going-global indie SaaS community (GoSail Club), enterprise AI workflow training (Claude Code & Cursor), MCN partnerships, and cross-border technical consulting.",
    offers: {
      "@type": "Offer",
      name: isZh ? "GoSail Club 年度会员" : "GoSail Club Annual Membership",
      price: "365",
      priceCurrency: "CNY",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/${lang}/club`,
    },
  };

  return { personJsonLd, websiteJsonLd, serviceJsonLd, relatedSitesJsonLd };
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

// lang 只有 zh/en；其他值（/index.php、/.env 等带点路径会绕过 middleware）按未匹配路由 404
export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ lang: "zh" }, { lang: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang === "zh";
  return {
    metadataBase: new URL(SITE_URL),
    icons: { icon: "/favicon.ico" },
    title: {
      default: isZh
        ? "JasonZhu.AI - AI应用与实践 | AI工具评测、教程、出海增长"
        : "JasonZhu.AI — AI Tools, Tutorials & Indie SaaS Growth",
      template: "%s | JasonZhu.AI",
    },
    description: isZh
      ? "前AI算法工程师 Jason Zhu 的个人网站。分享AI工具评测、实战教程、行业洞察与出海增长策略，提供企业AI培训、MCN合作与技术咨询服务。涵盖Claude Code、Cursor等主流AI工具深度解析。"
      : "Jason Zhu's site for hands-on AI tool reviews (Claude Code, Cursor), indie SaaS payment benchmarks, agent security audits, and going-global playbooks.",
    keywords: isZh
      ? ["AI", "人工智能", "AI工具", "AI培训", "AI教程", "Claude Code", "Cursor", "AI出海", "Jason Zhu"]
      : ["AI", "artificial intelligence", "AI tools", "AI training", "Claude Code", "Cursor", "Jason Zhu"],
    authors: [{ name: "Jason Zhu" }],
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        zh: `${SITE_URL}/zh`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      siteName: "JasonZhu.AI",
      url: `${SITE_URL}/${lang}`,
      title: isZh ? "JasonZhu.AI - AI应用与实践" : "JasonZhu.AI - AI Applications & Practice",
      description: isZh
        ? "前AI算法工程师 Jason Zhu 的个人网站。分享AI工具评测、实战教程、行业洞察与出海增长策略。"
        : "Jason Zhu's personal site — AI tool reviews, tutorials, insights, and enterprise AI consulting.",
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "JasonZhu.AI - AI Applications & Practice",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@GoSailGlobal",
      creator: "@GoSailGlobal",
      title: isZh ? "JasonZhu.AI - AI应用与实践" : "JasonZhu.AI - AI Applications & Practice",
      description: isZh
        ? "前AI算法工程师 Jason Zhu 的个人网站。AI工具评测、教程与出海增长。"
        : "Jason Zhu's personal site — AI tool reviews, tutorials & growth strategies.",
      images: [`${SITE_URL}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const dict = await getDictionary(lang);
  const { personJsonLd, websiteJsonLd, serviceJsonLd, relatedSitesJsonLd } = buildSiteJsonLd(lang);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={isZh ? "JasonZhu.AI - AI 快讯 RSS" : "JasonZhu.AI - Daily AI News RSS"}
          href="/feed/news.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={isZh ? "JasonZhu.AI - 博客 RSS" : "JasonZhu.AI - Blog & Research RSS"}
          href="/feed/blog.xml"
        />
        <link
          rel="describedby"
          type="text/plain"
          title="LLMs.txt"
          href="/llms.txt"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceJsonLd),
          }}
        />
        {relatedSitesJsonLd.map((site) => (
          <script
            key={site["@id"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(site) }}
          />
        ))}
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <WebMcpRegister />
        <Header lang={lang} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} dict={dict} />
        <GoogleOneTap />
        <Analytics />
        <ThirdPartyAnalytics />
      </body>
    </html>
  );
}
