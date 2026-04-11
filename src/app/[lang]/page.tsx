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
  const posts = getAllPosts().slice(0, 4);

  const services = [
    {
      title: dict.home.serviceTraining,
      desc: dict.home.serviceTrainingDesc,
      icon: "🎓",
      href: `/${lang}/services`,
    },
    {
      title: dict.home.serviceMCN,
      desc: dict.home.serviceMCNDesc,
      icon: "📡",
      href: `/${lang}/services`,
    },
    {
      title: dict.home.serviceDev,
      desc: dict.home.serviceDevDesc,
      icon: "🛠️",
      href: `/${lang}/services`,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {dict.home.greeting}{" "}
              <span className="text-[var(--primary)]">Jason Zhu</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 leading-relaxed">
              {dict.home.intro}
              <br className="hidden sm:block" />
              {dict.home.intro2}
              <Link href={`/${lang}/handbook`} className="text-[var(--primary)] hover:underline">{dict.home.handbookLink}</Link>
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {dict.home.tags.map(
                (tag: string) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
            <div className="mt-8 flex gap-3">
              <Link
                href={`/${lang}/blog`}
                className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
              >
                {dict.home.readBlog}
              </Link>
              <Link
                href={`/${lang}/services`}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {dict.home.learnServices}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {posts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{dict.home.latestPosts}</h2>
            <Link
              href={`/${lang}/blog`}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              {dict.home.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {/* Subscribe */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <SubscribeForm source="homepage" lang={lang} dict={dict} />
      </section>

      {/* Projects */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{dict.home.myProjects}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="https://agentskillshub.top"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-6 hover:border-purple-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🧩</span>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                Agent Skills Hub
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              {dict.home.agentSkillsDesc}
            </p>
            <span className="text-xs text-purple-500 font-medium">
              agentskillshub.top →
            </span>
          </a>
          <a
            href="https://gosaillab.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100 p-6 hover:border-orange-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🚀</span>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                GoSail Lab
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              {dict.home.goSailDesc}
            </p>
            <span className="text-xs text-orange-500 font-medium">
              gosaillab.com →
            </span>
          </a>
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{dict.home.myServices}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {service.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {dict.home.ctaTitle}
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            {dict.home.ctaDesc}
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="https://x.com/GoSailGlobal"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              X / Twitter
            </a>
            <Link
              href={`/${lang}/about`}
              className="px-5 py-2.5 border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {dict.home.ctaMore}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
