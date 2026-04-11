import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我",
  description: "了解 Jason Zhu - 前AI算法工程师，AI博主，企业培训师",
};

const timeline = [
  {
    period: "现在",
    title: "AI博主 & 企业培训师",
    desc: "运营AI内容矩阵，为企业提供AI培训与咨询服务，帮助更多人和企业拥抱AI。",
  },
  {
    period: "之前",
    title: "AI算法工程师",
    desc: "深耕AI算法研发，积累了扎实的机器学习、深度学习技术功底和工程落地经验。",
  },
];

const skills = [
  "Prompt Engineering",
  "AI Agent",
  "Claude Code",
  "Vibe Coding",
  "LLM应用开发",
  "AI内容创作",
  "企业培训",
  "产品设计",
  "Python",
  "TypeScript",
  "机器学习",
  "深度学习",
];

const projects = [
  {
    name: "Agent Skills Hub",
    desc: "AI Agent Skills 聚合站，收录优质 Claude Code Skills 和 Agent 插件",
    url: "https://agentskillshub.top",
    emoji: "🧩",
  },
  {
    name: "GoSail Lab",
    desc: "AI MCN & 产品推广实验室，承接AI产品推广与品牌出海",
    url: "https://gosaillab.com",
    emoji: "🚀",
  },
];

const socials = [
  {
    name: "X / Twitter",
    handle: "@GoSailGlobal",
    url: "https://x.com/GoSailGlobal",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "WeChat / 微信",
    handle: "GoSail_AI",
    url: null,
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.127 6.127 0 01-.253-1.736c0-3.74 3.568-6.768 7.964-6.768.308 0 .608.019.908.044C17.701 4.648 13.558 2.188 8.691 2.188zm-2.15 4.03a1.12 1.12 0 110 2.24 1.12 1.12 0 010-2.24zm4.918 0a1.12 1.12 0 110 2.24 1.12 1.12 0 010-2.24zM16.213 8.78c-3.857 0-6.987 2.68-6.987 5.986 0 3.306 3.13 5.986 6.987 5.986.778 0 1.527-.118 2.228-.33a.716.716 0 01.592.08l1.486.872a.27.27 0 00.138.045c.133 0 .24-.108.24-.243 0-.06-.024-.118-.04-.176l-.305-1.158a.488.488 0 01.177-.55C22.337 18.147 23.2 16.48 23.2 14.766c0-3.306-3.13-5.986-6.987-5.986zm-2.07 3.39a.927.927 0 110 1.854.927.927 0 010-1.855zm4.14 0a.927.927 0 110 1.854.927.927 0 010-1.855z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    handle: "zhuyansen",
    url: "https://github.com/zhuyansen",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Intro */}
      <div className="mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6">
          JZ
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Jason Zhu</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          前AI算法工程师，现专注于AI应用实践与传播。通过内容创作、企业培训和技术咨询，
          帮助更多人和企业理解并应用AI技术，在AI时代找到自己的位置。
        </p>
      </div>

      {/* What I Do */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">我在做什么</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="text-xl">✍️</span>
            <div>
              <h3 className="font-semibold text-gray-900">AI 内容创作</h3>
              <p className="text-sm text-gray-500">
                在X/Twitter等平台分享AI工具评测、使用技巧、行业洞察，帮助大家跟上AI发展节奏。
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-xl">🎓</span>
            <div>
              <h3 className="font-semibold text-gray-900">企业 AI 培训</h3>
              <p className="text-sm text-gray-500">
                为企业团队提供系统化的AI工具培训，涵盖Prompt工程、AI编程、内容创作等实战课程。
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-xl">📡</span>
            <div>
              <h3 className="font-semibold text-gray-900">AI MCN 运营</h3>
              <p className="text-sm text-gray-500">
                运营AI领域内容矩阵，聚合优质创作者，打造高质量AI内容生态。
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-xl">🛠️</span>
            <div>
              <h3 className="font-semibold text-gray-900">需求承接</h3>
              <p className="text-sm text-gray-500">
                AI应用开发、技术咨询、解决方案设计，从需求分析到落地交付。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">我的项目</h2>
        <div className="space-y-3">
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{project.emoji}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {project.name}
                </p>
                <p className="text-xs text-gray-400">{project.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">职业经历</h2>
        <div className="space-y-6">
          {timeline.map((item) => (
            <div key={item.period} className="flex gap-4">
              <div className="w-16 shrink-0">
                <span className="text-sm font-medium text-[var(--primary)]">
                  {item.period}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">技能标签</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">找到我</h2>
        <div className="space-y-3">
          {socials.map((social) => {
            const content = (
              <>
                <span className="text-gray-600">{social.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {social.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {social.handle}
                    {!social.url && <span className="ml-1 text-gray-300">（添加好友请备注来源）</span>}
                  </p>
                </div>
              </>
            );

            if (social.url) {
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={social.name}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50"
              >
                {content}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
