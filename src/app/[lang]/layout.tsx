import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleOneTap from "@/components/GoogleOneTap";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://jasonzhu.ai";

// 全站 JSON-LD：Person + WebSite
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jason Zhu",
  url: "https://jasonzhu.ai",
  image: "https://jasonzhu.ai/avatar.jpg",
  sameAs: ["https://x.com/GoSailGlobal", "https://github.com/zhuyansen"],
  jobTitle: "AI Blogger & Trainer",
  description: "前AI算法工程师，现AI博主/MCN/培训师",
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

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

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
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Header lang={lang} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} dict={dict} />
        <GoogleOneTap />
        <Analytics />
      </body>
    </html>
  );
}
