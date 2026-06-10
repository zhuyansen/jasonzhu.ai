import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin | JasonZhu.AI",
  robots: { index: false, follow: false },
};

// admin 子树的独立 root layout（[lang] 子树是另一个 root layout，互不嵌套）
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-gray-900">{children}</body>
    </html>
  );
}
