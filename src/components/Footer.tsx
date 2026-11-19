import Link from "@/components/Link";
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
              <li><Link href={`/${lang}/go-global`} className="text-sm text-gray-500 hover:text-gray-900">{dict.nav.goGlobal}</Link></li>
              <li><Link href={`/${lang}/go-global/weekly`} className="text-sm text-gray-500 hover:text-gray-900">{dict.nav.weekly}</Link></li>
              <li><Link href={`/${lang}/tools`} className="text-sm text-gray-500 hover:text-gray-900">{dict.nav.tools}</Link></li>
              <li><Link href={`/${lang}/prompts/claude-opus-5-5`} className="text-sm text-gray-500 hover:text-gray-900">{lang === "zh" ? "Claude 5.5 提示词库" : "Claude 5.5 Prompts"}</Link></li>
              <li><Link href={`/${lang}/prompts/chatgpt-images-2-6`} className="text-sm text-gray-500 hover:text-gray-900">{lang === "zh" ? "ChatGPT Images 2.6 提示词" : "ChatGPT Images 2.6 Prompts"}</Link></li>
              <li><Link href={`/${lang}/prompts/gemini-4`} className="text-sm text-gray-500 hover:text-gray-900">{lang === "zh" ? "Gemini 4 提示词" : "Gemini 4 Prompts"}</Link></li>
              <li><Link href={`/${lang}/backlink-spam-list`} className="text-sm text-gray-500 hover:text-gray-900">{lang === "zh" ? "垃圾外链来源库" : "Backlink spam list"}</Link></li>
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
                <a href="mailto:jason@jasonzhu.ai" className="text-sm text-gray-500 hover:text-gray-900">
                  jason@jasonzhu.ai
                </a>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="text-sm text-gray-500 hover:text-gray-900">
                  {lang === "zh" ? "联系我们 (Contact)" : "Contact"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="text-sm text-gray-500 hover:text-gray-900">{dict.footer.aboutMe}</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Declarative WebMCP tool form for in-browser AI agents */}
        <form
          action={`/${lang}/blog`}
          method="get"
          role="search"
          className="sr-only"
          {...({
            toolname: "search_jasonzhu_articles",
            tooldescription:
              "Search JasonZhu.AI tutorials, Claude Code / Cursor guides, and going-global playbooks.",
          } as Record<string, string>)}
        >
          <input
            type="search"
            name="q"
            aria-label="Search articles"
            {...({
              toolparamdescription: "Keyword or topic to search on JasonZhu.AI",
            } as Record<string, string>)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} JasonZhu.AI. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/${lang}/sitemap-html`} className="text-sm text-gray-400 hover:text-gray-600">
              {lang === "zh" ? "全站目录 (HTML Sitemap)" : "HTML Sitemap"}
            </Link>
            <Link href={`/${lang}/club`} className="text-sm text-gray-400 hover:text-gray-600">
              {lang === "zh" ? "会员定价 (Pricing)" : "Pricing"}
            </Link>
            <Link href={`/${lang}/contact`} className="text-sm text-gray-400 hover:text-gray-600">
              {lang === "zh" ? "联系" : "Contact"}
            </Link>
            <Link href={`/${lang}/privacy`} className="text-sm text-gray-400 hover:text-gray-600">
              {lang === "zh" ? "隐私政策" : "Privacy"}
            </Link>
            <Link href={`/${lang}/terms`} className="text-sm text-gray-400 hover:text-gray-600">
              {lang === "zh" ? "使用条款" : "Terms"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
