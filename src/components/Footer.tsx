import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/dictionaries";

interface FooterProps {
  lang: Locale;
  dict: Dictionary;
}

export default function Footer({ lang, dict }: FooterProps) {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={`/${lang}`} className="text-lg font-bold text-gray-900">
              Jason<span className="text-[var(--primary)]">Zhu</span>.AI
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              {dict.footer.desc}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{dict.footer.nav}</h3>
            <ul className="space-y-2">
              <li><Link href={`/${lang}/blog`} className="text-sm text-gray-500 hover:text-gray-900">{dict.nav.blog}</Link></li>
              <li><Link href={`/${lang}/news`} className="text-sm text-gray-500 hover:text-gray-900">{dict.nav.news}</Link></li>
              <li><Link href={`/${lang}/tools`} className="text-sm text-gray-500 hover:text-gray-900">{dict.nav.tools}</Link></li>
              <li><a href="https://agentskillshub.top" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">Agent Skills Hub</a></li>
              <li><a href="https://gosaillab.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">GoSail Lab</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{dict.footer.services}</h3>
            <ul className="space-y-2">
              <li><Link href={`/${lang}/services`} className="text-sm text-gray-500 hover:text-gray-900">{dict.footer.training}</Link></li>
              <li><Link href={`/${lang}/services`} className="text-sm text-gray-500 hover:text-gray-900">{dict.footer.mcn}</Link></li>
              <li><Link href={`/${lang}/services`} className="text-sm text-gray-500 hover:text-gray-900">{dict.footer.dev}</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{dict.footer.contact}</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://x.com/GoSailGlobal" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">
                  X / Twitter
                </a>
              </li>
              <li>
                <a href="https://github.com/zhuyansen" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">
                  GitHub
                </a>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="text-sm text-gray-500 hover:text-gray-900">{dict.footer.aboutMe}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} JasonZhu.AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
