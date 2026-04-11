import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "服务",
  description: "AI企业培训、AI MCN运营、技术需求承接",
};

const services = [
  {
    title: "AI 企业培训",
    icon: "🎓",
    description:
      "为企业团队提供定制化AI培训方案，从基础认知到实战应用，帮助团队快速掌握AI工具，提升工作效率。",
    features: [
      "Prompt工程实战：从入门到精通",
      "AI编程工具链：Claude Code / Cursor / Copilot",
      "AI内容创作：文案、图片、视频全流程",
      "AI办公提效：数据分析、文档处理、自动化",
      "定制化课程：根据企业实际业务场景设计",
    ],
    highlight: "已为多家企业提供培训服务，学员满意度95%+",
  },
  {
    title: "AI MCN",
    icon: "📡",
    description:
      "AI领域内容矩阵运营，聚合优质AI创作者，打造高质量AI内容生态，助力品牌传播与商业化。",
    features: [
      "AI内容IP孵化与运营",
      "多平台内容分发策略",
      "AI领域KOL合作网络",
      "品牌AI内容定制服务",
      "数据驱动的内容优化",
    ],
    highlight: "覆盖主流社媒平台，触达AI领域目标用户 → gosaillab.com",
  },
  {
    title: "需求承接",
    icon: "🛠️",
    description:
      "基于丰富的AI算法和工程经验，为企业提供AI应用开发、技术咨询、解决方案设计等一站式服务。",
    features: [
      "AI应用原型开发与MVP",
      "AI Workflow / Agent 搭建",
      "现有业务AI化改造方案",
      "技术选型与架构咨询",
      "AI网站与工具开发",
    ],
    highlight: "从需求分析到落地交付，全流程陪伴式服务",
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">我的服务</h1>
      <p className="text-gray-500 mb-12">
        结合AI算法背景与实战经验，提供专业的AI培训与咨询服务
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
          感兴趣？聊聊你的需求
        </h3>
        <p className="text-gray-500 mb-6">
          欢迎通过以下方式联系我，了解具体方案和报价
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="https://x.com/GoSailGlobal"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            X / Twitter 私信
          </a>
          <Link
            href="/about"
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            更多联系方式
          </Link>
        </div>
      </div>
    </div>
  );
}
