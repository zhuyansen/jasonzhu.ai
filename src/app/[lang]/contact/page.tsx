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
          "x-default": "https://jasonzhu.ai/en/contact",
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

      {/* Journalist & Editorial Verification Kit (for Featured / Qwoted / Outreach Pitch) */}
      <section
        aria-label={isZh ? "媒体与编辑核验资料卡" : "Press and editorial verification kit"}
        className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 mb-8 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              {isZh ? "媒体 / 编辑 / 研究引用核验" : "For Journalists, Editors & Researchers"}
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5">
              {isZh ? "一手数据资产与快速背书" : "Primary Research, DOIs & Live Benchmarks"}
            </h2>
          </div>
          <a
            href="mailto:jason@jasonzhu.ai?subject=Press%20%2F%20Dataset%20Inquiry"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            {isZh ? "媒体/约稿直邮：jason@jasonzhu.ai" : "Press Desk: jason@jasonzhu.ai"}
          </a>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          {isZh
            ? "所有研究数据均以 CC-BY-4.0 归档在 Zenodo，可免费引用并可按截稿时间提供定制切片。媒体引用请优先标注主站或具体研究页链接（jasonzhu.ai/en/research），无需只链社交账号。"
            : "All benchmarks below are archived on Zenodo under CC-BY-4.0 and free to cite. Custom data cuts and founder commentary are typically turned around within 24 hours (UTC+8). Please link to jasonzhu.ai/en/research or the specific DOI rather than social profiles."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <a
            href="https://doi.org/10.5281/zenodo.24420870"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-lg bg-white border border-blue-100 hover:border-blue-300 transition-colors"
          >
            <p className="font-semibold text-gray-900">
              {isZh ? "20 万独立开发者收款与 $20 MoR 费率论文" : "Indie SaaS Payments & $20 MoR Benchmark (200k Links)"}
            </p>
            <p className="font-mono text-blue-700 mt-1">DOI: 10.5281/zenodo.24420870</p>
            <p className="text-gray-500 mt-0.5">
              {isZh ? "原始数据集：zenodo.24386242 · zenodo.24387071" : "Datasets: zenodo.24386242 · zenodo.24387071"}
            </p>
          </a>
          <a
            href="https://doi.org/10.5281/zenodo.24420919"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-lg bg-white border border-blue-100 hover:border-blue-300 transition-colors"
          >
            <p className="font-semibold text-gray-900">
              {isZh ? "开源 AI Agent Skills 供应链安全论文（130K 快照）" : "AI Agent Skills & MCP Supply-Chain Security (130K)"}
            </p>
            <p className="font-mono text-blue-700 mt-1">DOI: 10.5281/zenodo.24420919</p>
            <p className="text-gray-500 mt-0.5">
              {isZh ? "130,173 条评级数据集：zenodo.21292798" : "130,173-entry dataset: zenodo.21292798"}
            </p>
          </a>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          <Link
            href={`/${lang}/go-global/payments`}
            className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-800 hover:border-blue-300 font-medium"
          >
            {isZh ? "交互工具：收款选型与净到手计算 →" : "Live Tool: Payment Picker & $20 Fee Math →"}
          </Link>
          <Link
            href={`/${lang}/go-global/ai-readiness`}
            className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-800 hover:border-blue-300 font-medium"
          >
            {isZh ? "交互工具：AI 就绪度 26 项体检 →" : "Live Tool: AI Readiness 26-Check Clinic →"}
          </Link>
          <Link
            href={`/${lang}/research/ai-crawlers`}
            className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-800 hover:border-blue-300 font-medium"
          >
            {isZh ? "月度数据：AI 爬虫与引用实测 →" : "Live Data: Monthly AI Crawlers & Citations →"}
          </Link>
          <a
            href="https://orcid.org/0009-0000-2894-6285"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-700 hover:border-blue-300 font-mono"
          >
            ORCID: 0009-0000-2894-6285
          </a>
        </div>
      </section>

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

      <section
        aria-label={isZh ? "交付周期、透明边界与白帽原则" : "Scope, Timelines & White-Hat Guardrails"}
        className="rounded-xl border border-gray-200 bg-white p-6 mb-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-gray-900">
          {isZh ? "交付周期、公开标价与白帽边界" : "Deliverables, Timelines & White-Hat Guardrails"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-700">
                <th className="py-2 pr-3 font-semibold">{isZh ? "合作形式" : "Engagement"}</th>
                <th className="py-2 pr-3 font-semibold">{isZh ? "典型周期" : "Typical Timeline"}</th>
                <th className="py-2 pr-3 font-semibold">{isZh ? "核心交付物" : "Concrete Deliverables"}</th>
                <th className="py-2 font-semibold">{isZh ? "价格透明度" : "Pricing"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              <tr>
                <td className="py-2.5 pr-3 font-medium text-gray-900">
                  {isZh ? "GoSail Club 启航会" : "GoSail Club Membership"}
                </td>
                <td className="py-2.5 pr-3">{isZh ? "按年（即开即用）" : "Annual (instant access)"}</td>
                <td className="py-2.5 pr-3">
                  {isZh ? "出海实战手册、Skills 工具包、闭门复盘与社群问答" : "Going-global playbooks, skills kit, teardown sessions & community"}
                </td>
                <td className="py-2.5 font-mono text-gray-900">
                  {isZh ? "公开明码 ¥365/年" : "Published: ¥365/yr"}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-3 font-medium text-gray-900">
                  {isZh ? "企业 AI 实战工作坊" : "Enterprise AI Workshop"}
                </td>
                <td className="py-2.5 pr-3">{isZh ? "1–5 天（≥50% 现场实操）" : "1–5 days (≥50% hands-on)"}</td>
                <td className="py-2.5 pr-3">
                  {isZh ? "定制课程大纲、Claude Code / Cursor 工程红线（CLAUDE.md）、团队 Skills 与工作流闭环" : "Tailored syllabus, CLAUDE.md quality guardrails, team skills & live workflow setup"}
                </td>
                <td className="py-2.5">
                  {isZh ? "按人数与天数邮件 24h 内给区间" : "Range quoted within 24h by team size & days"}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-3 font-medium text-gray-900">
                  {isZh ? "出海收款 / SEO & GEO 诊断" : "Going-Global / SEO & GEO Advisory"}
                </td>
                <td className="py-2.5 pr-3">{isZh ? "单次 1v1 或 4–12 周项目" : "1v1 session or 4–12 week sprint"}</td>
                <td className="py-2.5 pr-3">
                  {isZh ? "主体与 MoR 净到手对比方案、AI 引擎多轮抽样基线、可核验改稿与外联清单" : "Entity/MoR payout roadmap, multi-engine AI citation baseline & verifiable editorial/PR backlog"}
                </td>
                <td className="py-2.5">
                  {isZh ? "按范围明码报价，监测算力透明拆项" : "Scoped flat fee; API/monitoring usage itemized"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed pt-1">
          <strong className="text-gray-800">{isZh ? "白帽底线（明确不做）：" : "White-Hat Guardrails (What We Never Do): "}</strong>
          {isZh
            ? "不卖/不买付费外链、不搭 PBN 站群、不刷 Reddit/论坛水军、不承诺不可控的单日排名或虚假保底曝光；所有内容上线前均需人工核验数字与事实来源。"
            : "No paid backlink schemes, no PBNs, no undisclosed Reddit/forum astroturfing, and no fake single-day ranking guarantees. Every empirical claim is source-checked before publication."}
        </p>
      </section>

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
          <li>
            <strong className="text-gray-900">
              {isZh ? "顺手告知你的发现渠道：" : "How you found JasonZhu.AI:"}
            </strong>{" "}
            {isZh
              ? "一句话注明你是从 Google 搜索、ChatGPT / Perplexity / Claude 推荐、X（Twitter）还是朋友介绍找到这里的，帮助我持续改进公开内容与工具。"
              : "A one-line note on whether you found this site via Google Search, ChatGPT / Perplexity / Claude, X (Twitter), or a referral helps me prioritize which public tools and benchmarks to keep updating."}
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
