"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary, Locale } from "@/lib/dictionaries";

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
}

export default function Header({ lang, dict }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: `/${lang}/blog`, label: dict.nav.blog },
    { href: `/${lang}/news`, label: dict.nav.news },
    { href: `/${lang}/tools`, label: dict.nav.tools },
    { href: `/${lang}/services`, label: dict.nav.services },
    { href: `/${lang}/about`, label: dict.nav.about },
  ];

  // Build the alternate language URL
  const otherLang = lang === "zh" ? "en" : "zh";
  const switchPath = pathname.replace(`/${lang}`, `/${otherLang}`);

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${lang}`} className="flex items-center gap-2.5">
            <Image
              src="/avatar.jpg"
              alt="Jason Zhu"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-lg font-bold text-gray-900">
              Jason<span className="text-[var(--primary)]">Zhu</span>.AI
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? "text-[var(--primary)] bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {/* Language switcher */}
            <Link
              href={switchPath}
              className="ml-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {lang === "zh" ? "EN" : "中"}
            </Link>
          </nav>

          {/* Mobile: lang switch + menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href={switchPath}
              className="px-2 py-1 rounded text-xs font-semibold border border-gray-200 text-gray-500"
            >
              {lang === "zh" ? "EN" : "中"}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-50"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname.startsWith(item.href)
                    ? "text-[var(--primary)] bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
