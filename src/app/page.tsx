import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";
import BlogCard from "@/components/BlogCard";
import SubscribeForm from "@/components/SubscribeForm";

const services = [
  {
    title: "AI 企业培训",
    desc: "为企业团队提供系统化的AI工具使用培训，涵盖Prompt工程、AI编程、内容创作等实战课程。",
    icon: "🎓",
    href: "/services",
  },
  {
    title: "AI MCN",
    desc: "AI领域内容矩阵运营，打造高质量AI内容IP，助力品牌在AI赛道的传播与影响力。",
    icon: "📡",
    href: "/services",
  },
  {
    title: "需求承接",
    desc: "AI应用开发、技术咨询、解决方案设计。从需求分析到落地交付的一站式服务。",
    icon: "🛠️",
    href: "/services",
  },
];

export default function HomePage() {
  const posts = getAllPosts().slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Hi, 我是{" "}
              <span className="text-[var(--primary)]">Jason Zhu</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 leading-relaxed">
              前AI算法工程师，现专注于AI应用实践与传播。
              <br className="hidden sm:block" />
              通过博客、培训和咨询，帮助更多人和企业拥抱AI。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["前AI算法工程师", "AI博主", "企业培训", "AI MCN", "需求承接"].map(
                (tag) => (
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
                href="/blog"
                className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
              >
                阅读博客
              </Link>
              <Link
                href="/services"
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                了解服务
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {posts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
            <Link
              href="/blog"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              查看全部 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Subscribe */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <SubscribeForm source="homepage" />
      </section>

      {/* Projects */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">我的项目</h2>
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
              AI Agent Skills 聚合站，收录和推荐优质的 Claude Code Skills、Agent 插件和工作流模板。
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
              AI MCN &amp; 产品推广实验室。作为 MCN Founder，承接AI产品推广、KOL合作与品牌出海业务。
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
          <h2 className="text-2xl font-bold text-gray-900 mb-8">我的服务</h2>
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
            想要合作或咨询？
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            无论是企业AI培训、内容合作还是技术咨询，欢迎随时联系我。
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
              href="/about"
              className="px-5 py-2.5 border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
