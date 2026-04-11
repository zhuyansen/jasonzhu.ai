import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JasonZhu.AI - AI应用与实践",
    template: "%s | JasonZhu.AI",
  },
  description:
    "前AI算法工程师 Jason Zhu 的个人网站。分享AI工具评测、实战教程、行业洞察，提供企业AI培训与咨询服务。",
  keywords: ["AI", "人工智能", "AI工具", "AI培训", "AI教程", "Jason Zhu"],
  authors: [{ name: "Jason Zhu" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "JasonZhu.AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
