"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** 纯展示，无 hook：既能当 Suspense 的服务端兜底，也能被客户端语言探测包裹后复用 */
export default function NotFoundContent({ lang }: { lang: "zh" | "en" }) {
  const isZh = lang === "zh";
  const links = isZh
    ? [
        { href: `/${lang}`, label: "回首页" },
        { href: `/${lang}/blog`, label: "看博客" },
        { href: `/${lang}/news`, label: "AI 快讯" },
      ]
    : [
        { href: `/${lang}`, label: "Home" },
        { href: `/${lang}/blog`, label: "Blog" },
        { href: `/${lang}/news`, label: "AI News" },
      ];

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-6xl font-bold text-gray-200 tabular-nums">404</p>
      <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">
        {isZh ? "这个页面不存在" : "Page not found"}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {isZh
          ? "链接可能已失效，或者地址输错了。"
          : "The link may be broken, or the address was mistyped."}
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {links.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              i === 0
                ? "px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                : "px-5 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            }
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * 按 pathname 选语言。usePathname 在 not-found 的静态渲染里会触发 bailout，
 * 必须包在 Suspense 里，否则整页（含 Header/Footer）退化成纯客户端渲染、HTML 里空空如也。
 */
export function NotFoundByPath() {
  const pathname = usePathname();
  const lang = pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "zh";
  return <NotFoundContent lang={lang} />;
}
