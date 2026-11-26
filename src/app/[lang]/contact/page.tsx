import type { Metadata } from "next";
import Link from "@/components/Link";
import TrackedLink from "@/components/TrackedLink";
import { type Locale } from "@/lib/dictionaries";
import { withSocialCards } from "@/lib/social";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  return withSocialCards(
    {
      title: isZh ? "联系 Jason Zhu" : "Contact Jason Zhu", // 站名由 layout 的标题模板加，这里再写一遍会重复
      description: isZh
        ? "联系 Jason Zhu（祝彦森）：企业 AI 实战培训、出海技术咨询、GoSail Club 社群合作及媒体约稿。"
        : "Contact Jason Zhu for enterprise AI training, going-global technical consulting, GoSail Club partnerships, and media inquiries.",
      alternates: {
        canonical: `https://jasonzhu.ai/${lang}/contact`,
        languages: {
          zh: "https://jasonzhu.ai/zh/contact",
          en: "https://jasonzhu.ai/en/contact",
          "x-default": "https://jasonzhu.ai/zh/contact",
        },
      },
    },
    rawLang
  );
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        {isZh ? "联系我们 (Contact)" : "Contact Jason Zhu"}
      </h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        {isZh
          ? "无论是企业 AI 实战内训、独立开发者出海架构咨询、MCN 商业推广还是 GoSail Club 启航会会员答疑，都可以通过以下方式直接联系我（工作日通常 24 小时内回复）。"
          : "Reach out directly for enterprise AI training, indie founder going-global consulting, MCN partnerships, or GoSail Club membership inquiries."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <TrackedLink
          href="mailto:jason@jasonzhu.ai"
          event="contact_click"
          params={{ method: "email" }}
          className="p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-white"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Email
          </p>
          <p className="text-base font-bold text-gray-900 mt-1">
            jason@jasonzhu.ai
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isZh ? "商务合作、企业内训与技术咨询首选" : "Primary channel for business & consulting"}
          </p>
        </TrackedLink>

        <TrackedLink
          href="https://x.com/GoSailGlobal"
          event="contact_click"
          params={{ method: "x" }}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-white"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            X / Twitter
          </p>
          <p className="text-base font-bold text-gray-900 mt-1">
            @GoSailGlobal
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isZh ? "私信直达（DM 开放）" : "Direct message open on X"}
          </p>
        </TrackedLink>

        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {isZh ? "微信 / WeChat" : "WeChat"}
          </p>
          <p className="text-base font-bold text-gray-900 mt-1">GoSail_AI</p>
          <p className="text-xs text-gray-500 mt-1">
            {isZh ? "添加请备注来意（如：企业内训 / GoSail Club）" : "Please include your inquiry topic when adding"}
          </p>
        </div>

        <TrackedLink
          href="https://github.com/zhuyansen"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-white"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            GitHub
          </p>
          <p className="text-base font-bold text-gray-900 mt-1">
            github.com/zhuyansen
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isZh ? "开源项目与 AgentSkillsHub 仓库" : "Open-source repositories & AgentSkillsHub"}
          </p>
        </TrackedLink>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 space-y-5">
        <h2 className="text-lg font-bold text-gray-900">
          {isZh ? "合作范围与沟通建议" : "How We Can Work Together"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-600 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {isZh ? "企业 AI 实战培训" : "Enterprise AI Training & Workshops"}
            </h3>
            <p>
              {isZh
                ? "面向研发、产品与运营团队的 Claude Code、Cursor 与 AI Agent 落地工作坊。来信请注明团队人数、业务场景与期望时间。"
                : "Hands-on workshops for engineering, product, and ops teams adopting Claude Code, Cursor, and autonomous agent workflows. Share your team size, stack, and target timeline."}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {isZh ? "独立开发与出海咨询" : "Indie SaaS & Going-Global Advisory"}
            </h3>
            <p>
              {isZh
                ? "覆盖海外公司主体、Merchant of Record 收款选型（Stripe / Dodo / Polar / Creem / Waffo）、技术 SEO 与 GEO 增长架构。"
                : "Practical consulting on cross-border entity setup, Merchant of Record payment stacks (Stripe, Dodo Payments, Polar, Creem, Waffo), technical SEO, and GEO citation strategy."}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {isZh ? "开源数据集与媒体引用" : "Open Datasets, Press & Editorial"}
            </h3>
            <p>
              {isZh
                ? "欢迎媒体、研究者与产品团队免费引用我存档在 Zenodo 的开放数据集：20 万卖家收款基准，以及 AI Agent Skills 安全分级数据集（2026 年 7 月快照，130,173 条）。Agent Skills Hub 现在收录 28.5 万个以上，其中 14.4 万个以上有安全分级。需要定制切片可直接发邮件。"
                : "Journalists, researchers, and tool teams are welcome to cite my open datasets on Zenodo: a benchmark of 200,000+ indie SaaS checkouts and security grades for 130,173 AI agent skills (July 2026 snapshot). Agent Skills Hub now lists 285,000+ skills, 144,000+ of them security-graded. Email for custom slices or commentary."}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {isZh ? "回复时效与沟通偏好" : "Response Time & Preferences"}
            </h3>
            <p>
              {isZh
                ? "工作日通常 24 小时内回复（UTC+8）。为节省双方时间，邮件请直接说明背景、目标与预算范围；群发推广邮件不予回复。"
                : "I typically reply within 24 hours on business days (UTC+8). To help us move fast, please include your goal, context, and timeline in the first message. Unsolicited mass pitches are not answered."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          {isZh ? "发邮件前可以顺带说明" : "Before You Write: Quick Checklist"}
        </h2>
        <ul className="space-y-2.5 text-sm text-gray-600 leading-relaxed list-disc pl-5">
          <li>
            <strong className="text-gray-900">
              {isZh ? "企业 AI 内训：" : "Corporate AI workshops:"}
            </strong>{" "}
            {isZh
              ? "说明团队职能（研发 / 产品 / 市场）、人数、当前使用的模型或 IDE，以及希望解决的 1–2 个具体工作流瓶颈，我会在回信中直接给出定制大纲与报价区间。"
              : "Share your team roles (engineering, product, or growth), headcount, current AI tooling, and one or two workflow bottlenecks you want solved. I will reply with a tailored syllabus and transparent fee range."}
          </li>
          <li>
            <strong className="text-gray-900">
              {isZh ? "出海收款与增长咨询：" : "Going-global & payment advisory:"}
            </strong>{" "}
            {isZh
              ? "附上你的产品网址、目标客群市场、当前收款方式及遇到的卡点（如主体选择、Stripe / MoR 费率测算、技术 SEO 或 AI 搜索引用诊断），便于我们把 1v1 沟通聚焦在可执行方案上。"
              : "Include your product URL, target markets, current billing setup, and the exact blocker (entity structure, Stripe vs. Merchant of Record fee math, technical SEO audit, or AI citation visibility) so our call stays focused on concrete next steps."}
          </li>
          <li>
            <strong className="text-gray-900">
              {isZh ? "GoSail Club 会员与开源数据：" : "GoSail Club & open benchmarks:"}
            </strong>{" "}
            {isZh
              ? "会员激活、发票或权益问题请备注下单邮箱；学术引用或媒体核对 Zenodo 数据集请直接写明所需字段与截稿日期。"
              : "For GoSail Club membership activation or billing support, include the email used at checkout. For press quotes or academic citations of the Zenodo datasets, mention your deadline and the specific slice you need."}
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-2">
          {isZh ? "相关服务与社群入口" : "Services & Community"}
        </h2>
        <div className="flex flex-wrap gap-3 mt-3">
          <Link
            href={`/${lang}/services`}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-300"
          >
            {isZh ? "查看企业服务详情 →" : "Enterprise Services →"}
          </Link>
          <Link
            href={`/${lang}/club`}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-300"
          >
            {isZh ? "了解 GoSail Club 启航会 (¥365/年) →" : "GoSail Club Pricing & Benefits →"}
          </Link>
          <Link
            href={`/${lang}/research`}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-300"
          >
            {isZh ? "查看开源研究论文与数据集 →" : "Open Research & Benchmarks →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
