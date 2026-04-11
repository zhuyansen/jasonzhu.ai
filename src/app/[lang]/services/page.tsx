import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "服务",
  description: "AI企业培训、AI MCN运营、技术需求承接",
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);

  const services = [
    {
      title: dict.home.serviceTraining,
      icon: "🎓",
      description:
        lang === "en"
          ? "Customized AI training solutions for enterprise teams — from basic awareness to practical applications, helping teams quickly master AI tools and boost productivity."
          : "为企业团队提供定制化AI培训方案，从基础认知到实战应用，帮助团队快速掌握AI工具，提升工作效率。",
      features:
        lang === "en"
          ? [
              "Prompt Engineering: from beginner to expert",
              "AI Coding Tools: Claude Code / Cursor / Copilot",
              "AI Content Creation: copywriting, images, video pipeline",
              "AI Office Productivity: data analysis, docs, automation",
              "Custom Courses: designed for your actual business scenarios",
            ]
          : [
              "Prompt工程实战：从入门到精通",
              "AI编程工具链：Claude Code / Cursor / Copilot",
              "AI内容创作：文案、图片、视频全流程",
              "AI办公提效：数据分析、文档处理、自动化",
              "定制化课程：根据企业实际业务场景设计",
            ],
      highlight:
        lang === "en"
          ? "Training delivered to multiple enterprises with 95%+ satisfaction rate"
          : "已为多家企业提供培训服务，学员满意度95%+",
    },
    {
      title: dict.home.serviceMCN,
      icon: "📡",
      description:
        lang === "en"
          ? "AI content matrix operations — aggregating quality AI creators, building a high-quality AI content ecosystem to boost brand communication and monetization."
          : "AI领域内容矩阵运营，聚合优质AI创作者，打造高质量AI内容生态，助力品牌传播与商业化。",
      features:
        lang === "en"
          ? [
              "AI content IP incubation & operations",
              "Multi-platform content distribution strategy",
              "AI domain KOL collaboration network",
              "Brand AI content customization",
              "Data-driven content optimization",
            ]
          : [
              "AI内容IP孵化与运营",
              "多平台内容分发策略",
              "AI领域KOL合作网络",
              "品牌AI内容定制服务",
              "数据驱动的内容优化",
            ],
      highlight:
        lang === "en"
          ? "Covering major social platforms, reaching AI target audience → gosaillab.com"
          : "覆盖主流社媒平台，触达AI领域目标用户 → gosaillab.com",
    },
    {
      title: dict.home.serviceDev,
      icon: "🛠️",
      description:
        lang === "en"
          ? "Leveraging deep AI algorithm and engineering expertise to provide end-to-end AI application development, consulting, and solution design services."
          : "基于丰富的AI算法和工程经验，为企业提供AI应用开发、技术咨询、解决方案设计等一站式服务。",
      features:
        lang === "en"
          ? [
              "AI application prototyping & MVP",
              "AI Workflow / Agent building",
              "Business AI transformation plans",
              "Tech stack selection & architecture consulting",
              "AI website & tool development",
            ]
          : [
              "AI应用原型开发与MVP",
              "AI Workflow / Agent 搭建",
              "现有业务AI化改造方案",
              "技术选型与架构咨询",
              "AI网站与工具开发",
            ],
      highlight:
        lang === "en"
          ? "Full-cycle support from requirements analysis to delivery"
          : "从需求分析到落地交付，全流程陪伴式服务",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.services.title}</h1>
      <p className="text-gray-500 mb-12">
        {dict.services.desc}
      </p>

      <div className="space-y-8">
        {services.map((service) => (
          <div
            key={service.title}
            className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">{service.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {service.title}
                </h2>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="ml-0 md:ml-16">
              <ul className="space-y-2 mb-6">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[var(--primary)] font-medium">
                {service.highlight}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {dict.services.ctaTitle}
        </h3>
        <p className="text-gray-500 mb-6">
          {dict.services.ctaDesc}
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="https://x.com/GoSailGlobal"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            {dict.services.ctaDM}
          </a>
          <Link
            href={`/${lang}/about`}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {dict.services.ctaMore}
          </Link>
        </div>
      </div>
    </div>
  );
}
