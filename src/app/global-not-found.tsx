import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

/**
 * 全站 404（路由层）。根布局是动态段 [lang]，用 not-found.tsx 走 notFound() 时
 * Next 只能把 404 交给客户端渲染，HTML body 是空的（vercel/next.js#62228）。
 * global-not-found 绕过渲染树、直接返回这份完整文档：无 JS / 爬虫也能看到内容。
 * 这里拿不到 pathname，所以中英双语一起给，不做语言探测。
 */
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "404 · 页面不存在 | JasonZhu.AI",
  description: "这个页面不存在。The page you are looking for does not exist.",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="zh" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <header className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
            <Link href="/zh" className="text-lg font-bold text-gray-900">
              Jason<span className="text-[var(--primary)]">Zhu</span>.AI
            </Link>
          </div>
        </header>
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 sm:px-6 py-24 text-center">
            <p className="text-6xl font-bold text-gray-200 tabular-nums">404</p>
            <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">这个页面不存在</h1>
            <p className="text-sm text-gray-400">链接可能已失效，或者地址输错了。</p>
            <p className="text-sm text-gray-400 mb-8" lang="en">
              Page not found — the link may be broken, or the address was mistyped.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/zh" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                回首页
              </Link>
              <Link href="/zh/blog" className="px-5 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                看博客
              </Link>
              <Link href="/zh/news" className="px-5 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                AI 快讯
              </Link>
              <Link href="/en" className="px-5 py-2.5 text-gray-400 text-sm font-medium rounded-lg hover:text-gray-700 hover:bg-gray-50 transition-colors" lang="en">
                English home →
              </Link>
            </div>
          </div>
        </main>
        <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
          © JasonZhu.AI
        </footer>
      </body>
    </html>
  );
}
