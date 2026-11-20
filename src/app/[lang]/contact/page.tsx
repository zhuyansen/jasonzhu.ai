import type { Metadata } from "next";
import Link from "@/components/Link";
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
        <a
          href="mailto:jason@jasonzhu.ai"
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
        </a>

        <a
          href="https://x.com/GoSailGlobal"
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
        </a>

        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {isZh ? "微信 / WeChat" : "WeChat"}
          </p>
          <p className="text-base font-bold text-gray-900 mt-1">GoSail_AI</p>
          <p className="text-xs text-gray-500 mt-1">
            {isZh ? "添加请备注来意（如：企业内训 / GoSail Club）" : "Please include your inquiry topic when adding"}
          </p>
        </div>

        <a
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
        </a>
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
        </div>
      </div>
    </div>
  );
}
