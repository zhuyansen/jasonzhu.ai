import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";
import BlogCard from "@/components/BlogCard";
import SubscribeForm from "@/components/SubscribeForm";
import { getDictionary, type Locale } from "@/lib/dictionaries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  // Pinned posts shown first, then fill remaining slots with latest posts
  const pinnedSlugs = [
    "x-growth-handbook",
    "jasonzhu-ai-site-building-journey",
  ];
  const allPosts = getAllPosts();
  const pinned = pinnedSlugs
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const rest = allPosts
    .filter((p) => !pinnedSlugs.includes(p.slug))
    .slice(0, 6 - pinned.length);
  const posts = [...pinned, ...rest];

  return (
    <>
      {/* Compact Hero — site identity + handbook highlight */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left: site identity */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Jason<span className="text-[var(--primary)]">Zhu</span>.AI
              </h1>
              <p className="mt-2 text-gray-500 text-sm md:text-base">
                {dict.home.siteDesc}
              </p>
            </div>

            {/* Right: two free-resource cards */}
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              {/* AI learning guide — broad appeal, primary */}
              <Link
                href={`/${lang}/ai-learning-guide`}
                className="group flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-500 border border-blue-500 rounded-xl hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all"
              >
                <span className="text-2xl">🗺️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">
                    {lang === "zh" ? "10 大平台 AI 免费学习全景图" : "Free AI Learning Map · 10 Platforms"}
                  </p>
                  <p className="text-xs text-blue-100 mt-0.5 hidden sm:block max-w-xs truncate">
                    {lang === "zh" ? "学 AI 这两年想花的钱，一分都不用花" : "Learn AI for free — here's the full map"}
                  </p>
                </div>
                <span className="text-xs text-white font-semibold whitespace-nowrap bg-white/20 px-3 py-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
                  {lang === "zh" ? "免费领取" : "Get it"}
                </span>
              </Link>
              {/* GoSail Club — paid community */}
              <Link
                href={`/${lang}/club`}
                className="group flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <span className="text-2xl">⛵</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {lang === "zh" ? "GoSail Club 启航会" : "GoSail Club"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block max-w-xs truncate">
                    {lang === "zh" ? "AI 出海实战社群 · 首期早鸟 ¥299 限 7 天" : "AI going-global community · early bird open"}
                  </p>
                </div>
                <span className="text-xs text-amber-700 font-semibold whitespace-nowrap bg-amber-100 px-3 py-1.5 rounded-lg group-hover:bg-amber-200 transition-colors">
                  {lang === "zh" ? "申请加入" : "Apply"}
                </span>
              </Link>
              {/* Handbook — narrower, secondary */}
              <Link
                href={`/${lang}/handbook`}
                className="group flex items-center gap-3 px-5 py-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-2xl">📘</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {dict.home.handbookTitle}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 hidden sm:block max-w-xs truncate">
                    {lang === "zh" ? "14 天打造 X 平台写作与变现闭环" : dict.home.handbookDesc}
                  </p>
                </div>
                <span className="text-xs text-[var(--primary)] font-semibold whitespace-nowrap bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                  {dict.home.getHandbook}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts — main content area */}
      {posts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{dict.home.latestPosts}</h2>
            <Link
              href={`/${lang}/blog`}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              {dict.home.viewAll} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} lang={lang} categoryMap={dict.blog.categoryMap} />
            ))}
          </div>
        </section>
      )}

      {/* Subscribe */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <SubscribeForm source="homepage" lang={lang} dict={dict} />
      </section>

      {/* About — 站点导览 + E-E-A-T 作者信号 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {lang === "zh" ? "关于这个站" : "About This Site"}
        </h2>
        {lang === "zh" ? (
          <div className="text-sm text-gray-600 leading-7 space-y-3">
            <p>
              我是 <strong className="text-gray-900">Jason Zhu（祝彦森）</strong>
              ，前 AI 算法工程师，现在全职做 AI
              内容、企业培训和出海咨询。这个站上的每一篇教程都来自我的第一手实操——花了多少钱、踩了什么坑、真实数据是多少，全部写明，
              不写没验证过的二手内容。
            </p>
            <p>
              三条主线：<strong className="text-gray-900">AI 实战</strong>
              （Claude Code、Cursor、Agent 开发的深度教程与{" "}
              <Link href={`/${lang}/blog/ai-free-learning-hub`} className="text-[var(--primary)] hover:underline">
                10 大平台免费学习路径
              </Link>
              ）、<strong className="text-gray-900">独立开发者出海</strong>
              （英国公司注册、年审、跨境合规的完整实录）、
              <strong className="text-gray-900">自媒体变现</strong>
              （X 平台增长与 MCN 运营方法论）。每天还有一份{" "}
              <Link href={`/${lang}/news`} className="text-[var(--primary)] hover:underline">
                AI 快讯
              </Link>
              ，筛选当天最值得关注的行业动态和融资速递。
            </p>
            <p>
              不知道从哪开始？非技术岗从{" "}
              <Link href={`/${lang}/blog/ai-free-learning-hub`} className="text-[var(--primary)] hover:underline">
                免费学习全景图
              </Link>{" "}
              进；想出海的从{" "}
              <Link href={`/${lang}/blog/uk-company-registration-2hours`} className="text-[var(--primary)] hover:underline">
                2 小时注册英国公司
              </Link>{" "}
              进；做内容的直接领{" "}
              <Link href={`/${lang}/handbook`} className="text-[var(--primary)] hover:underline">
                X 平台实战手册
              </Link>
              。
            </p>
          </div>
        ) : (
          <div className="text-sm text-gray-600 leading-7 space-y-3">
            <p>
              I&apos;m <strong className="text-gray-900">Jason Zhu</strong>, a
              former AI algorithm engineer, now writing about AI full-time and
              running enterprise AI training. Every tutorial here comes from
              first-hand practice — real costs, real pitfalls, real numbers.
            </p>
            <p>
              Three tracks: <strong className="text-gray-900">hands-on AI</strong>{" "}
              (deep tutorials on Claude Code, Cursor, agents, plus a{" "}
              <Link href={`/${lang}/blog/ai-free-learning-hub`} className="text-[var(--primary)] hover:underline">
                map of free AI courses across 10 platforms
              </Link>
              ), <strong className="text-gray-900">indie founders going global</strong>{" "}
              (UK company registration and compliance, fully documented), and{" "}
              <strong className="text-gray-900">creator monetization</strong>. Plus a
              daily <Link href={`/${lang}/news`} className="text-[var(--primary)] hover:underline">AI news digest</Link>.
            </p>
          </div>
        )}
      </section>

      {/* Projects */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{dict.home.myProjects}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <a
            href="https://agentskillshub.top"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <span className="text-2xl">🧩</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                Agent Skills Hub
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {dict.home.agentSkillsDesc}
              </p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">→</span>
          </a>
          <a
            href="https://gosaillab.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <span className="text-2xl">🚀</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                GoSail Lab
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {dict.home.goSailDesc}
              </p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">→</span>
          </a>
        </div>
      </section>

      {/* Services — compact */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{dict.home.myServices}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: dict.home.serviceTraining, desc: dict.home.serviceTrainingDesc, icon: "🎓" },
              { title: dict.home.serviceMCN, desc: dict.home.serviceMCNDesc, icon: "📡" },
              { title: dict.home.serviceDev, desc: dict.home.serviceDevDesc, icon: "🛠️" },
            ].map((s) => (
              <Link
                key={s.title}
                href={`/${lang}/services`}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
