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
  const posts = getAllPosts().slice(0, 6);

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

            {/* Right: handbook highlight card */}
            <Link
              href={`/${lang}/handbook`}
              className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all shrink-0"
            >
              <span className="text-3xl">📘</span>
              <div>
                <span className="text-xs font-medium text-[var(--primary)] uppercase tracking-wide">
                  {dict.home.featuredHandbook}
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {dict.home.handbookTitle}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 hidden sm:block max-w-xs">
                  {dict.home.handbookDesc}
                </p>
              </div>
              <span className="text-xs text-[var(--primary)] font-medium whitespace-nowrap">
                {dict.home.getHandbook} →
              </span>
            </Link>
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
              <BlogCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {/* Subscribe */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <SubscribeForm source="homepage" lang={lang} dict={dict} />
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
