import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-lg font-bold text-gray-900">
              Jason<span className="text-[var(--primary)]">Zhu</span>.AI
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              前AI算法工程师，专注AI应用与实践。分享AI工具、教程、行业洞察。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">导航</h3>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">博客</Link></li>
              <li><Link href="/news" className="text-sm text-gray-500 hover:text-gray-900">快讯</Link></li>
              <li><Link href="/tools" className="text-sm text-gray-500 hover:text-gray-900">AI工具</Link></li>
              <li><a href="https://agentskillshub.top" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">Agent Skills Hub</a></li>
              <li><a href="https://gosaillab.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">GoSail Lab</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">服务</h3>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-sm text-gray-500 hover:text-gray-900">企业培训</Link></li>
              <li><Link href="/services" className="text-sm text-gray-500 hover:text-gray-900">AI MCN</Link></li>
              <li><Link href="/services" className="text-sm text-gray-500 hover:text-gray-900">需求承接</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">联系</h3>
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
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">关于我</Link>
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
