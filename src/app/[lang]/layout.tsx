import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary, type Locale } from "@/lib/dictionaries";

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
    title: {
      default: isZh ? "JasonZhu.AI - AI应用与实践" : "JasonZhu.AI - AI Applications & Practice",
      template: "%s | JasonZhu.AI",
    },
    description: isZh
      ? "前AI算法工程师 Jason Zhu 的个人网站。分享AI工具评测、实战教程、行业洞察，提供企业AI培训与咨询服务。"
      : "Jason Zhu's personal site — AI tool reviews, hands-on tutorials, industry insights, and enterprise AI training & consulting.",
    keywords: isZh
      ? ["AI", "人工智能", "AI工具", "AI培训", "AI教程", "Jason Zhu"]
      : ["AI", "artificial intelligence", "AI tools", "AI training", "Jason Zhu"],
    authors: [{ name: "Jason Zhu" }],
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      siteName: "JasonZhu.AI",
    },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
