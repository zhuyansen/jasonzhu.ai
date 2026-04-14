import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
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
  metadataBase: new URL("https://jasonzhu.ai"),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Organization structured data
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jason Zhu",
    url: "https://jasonzhu.ai",
    image: "https://jasonzhu.ai/avatar.jpg",
    sameAs: [
      "https://x.com/GoSailGlobal",
      "https://github.com/zhuyansen",
    ],
    jobTitle: "AI Blogger & Trainer",
    description: "前AI算法工程师，现AI博主/MCN/培训师",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JasonZhu.AI",
    url: "https://jasonzhu.ai",
    description: "AI工具评测、实战教程、行业洞察与出海增长策略",
    author: {
      "@type": "Person",
      name: "Jason Zhu",
    },
    inLanguage: ["zh-CN", "en"],
  };

  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
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
        {children}
      </body>
    </html>
  );
}
