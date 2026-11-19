import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleOneTap from "@/components/GoogleOneTap";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import "../globals.css";
import ThirdPartyAnalytics from "@/components/ThirdPartyAnalytics";
import { AUTHOR_ALT_NAME, AUTHOR_NAME, PROFILES } from "@/lib/profiles";

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

// 全站 JSON-LD：Organization + Person + WebSite + Service/Offer（覆盖 Structured meaning 与 Commercial legibility 全部检测项）
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: AUTHOR_NAME,
  alternateName: AUTHOR_ALT_NAME,
  url: "https://jasonzhu.ai",
  image: "https://jasonzhu.ai/avatar.jpg",
  email: "mailto:jason@jasonzhu.ai",
  sameAs: PROFILES.map((p) => p.url),
  jobTitle: "AI Blogger & Trainer",
  description: "前AI算法工程师，现AI博主/MCN/培训师",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "JasonZhu.AI (GoSail Global)",
  legalName: "BRICKAI (GoSailGlobal LLC)",
  url: "https://jasonzhu.ai",
  logo: "https://jasonzhu.ai/avatar.jpg",
  email: "jason@jasonzhu.ai",
  address: {
    "@type": "PostalAddress",
    streetAddress: "30 N Gould St, Ste N",
    addressLocality: "Sheridan",
    addressRegion: "WY",
    postalCode: "82801",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "jason@jasonzhu.ai",
    url: "https://jasonzhu.ai/zh/services",
    availableLanguage: ["zh-CN", "en"],
  },
  founder: { "@type": "Person", name: AUTHOR_NAME },
  sameAs: PROFILES.map((p) => p.url),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "JasonZhu.AI",
  url: "https://jasonzhu.ai",
  description: "AI工具评测、实战教程、行业洞察与出海增长策略",
  author: { "@type": "Person", name: "Jason Zhu" },
  inLanguage: ["zh-CN", "en"],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "GoSail Club 启航会 & 企业 AI 实战培训",
  provider: {
    "@type": "Organization",
    name: "JasonZhu.AI (GoSail Global)",
    url: "https://jasonzhu.ai",
  },
  description: "AI 出海实战社群（GoSail Club）、企业 AI 培训、MCN 合作与跨境出海技术咨询服务。",
  offers: {
    "@type": "Offer",
    name: "GoSail Club 年度会员",
    price: "365",
    priceCurrency: "CNY",
    availability: "https://schema.org/InStock",
    url: "https://jasonzhu.ai/zh/club",
  },
};

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
        : "JasonZhu.AI - AI Applications & Practice | Reviews, Tutorials, Growth",
      template: "%s | JasonZhu.AI",
    },
    description: isZh
      ? "前AI算法工程师 Jason Zhu 的个人网站。分享AI工具评测、实战教程、行业洞察与出海增长策略，提供企业AI培训、MCN合作与技术咨询服务。涵盖Claude Code、Cursor等主流AI工具深度解析。"
      : "Jason Zhu's personal website — in-depth AI tool reviews (Claude Code, Cursor, ChatGPT), hands-on tutorials, industry insights, and enterprise AI training & consulting services for global growth.",
    keywords: isZh
      ? ["AI", "人工智能", "AI工具", "AI培训", "AI教程", "Claude Code", "Cursor", "AI出海", "Jason Zhu"]
      : ["AI", "artificial intelligence", "AI tools", "AI training", "Claude Code", "Cursor", "Jason Zhu"],
    authors: [{ name: "Jason Zhu" }],
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        zh: `${SITE_URL}/zh`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/zh`,
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
  const dict = await getDictionary(lang);

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
          title="JasonZhu.AI - AI 快讯 RSS"
          href="/feed/news.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="JasonZhu.AI - 博客 RSS"
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
            __html: JSON.stringify(organizationJsonLd),
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
