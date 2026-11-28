import type { Metadata } from "next";
import Link from "@/components/Link";
import { withSocialCards } from "@/lib/social";
import { PERSON_ID } from "@/lib/profiles";
import rawLeaderboard from "@/generated/ai-visibility-leaderboard.json";
import LeaderboardClient, { type Lang, type LeaderboardData } from "./LeaderboardClient";

const SITE_URL = "https://jasonzhu.ai";
const PAGE_PATH = "/research/ai-visibility";

export async function generateStaticParams() {
  return [{ lang: "zh" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const isEn = lang === "en";
  return withSocialCards(
    {
      title: isEn
        ? "Monthly AI Visibility Index: SaaS Payments & Global AI Tools — Jason Zhu"
        : "海外英文 AI 推荐月榜：出海收款 MoR 与中国出海 AI 工具 — Jason Zhu",
      description: isEn
        ? "Open, multi-round monthly AI recommendation leaderboard tracking Indie SaaS payment/MoR platforms and China-originated global AI tools across ChatGPT, Perplexity, Gemini, and Google AI Mode with Wilson 95% CI and CSV downloads."
        : "公开克制的月度英文 AI 搜索推荐榜：基于冻结海外买方题库与多轮采样，量化出海收款 MoR 平台与中国出海 AI 工具在 ChatGPT、Perplexity、Gemini、Google AI Mode 中的真实推荐率与波动区间（CC BY 4.0 CSV）。",
      alternates: {
        canonical: `${SITE_URL}/${lang}${PAGE_PATH}`,
        languages: {
          zh: `${SITE_URL}/zh${PAGE_PATH}`,
          en: `${SITE_URL}/en${PAGE_PATH}`,
          "x-default": `${SITE_URL}/en${PAGE_PATH}`,
        },
      },
    },
    lang
  );
}

export default async function AiVisibilityIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const isEn = lang === "en";
  const boards = (rawLeaderboard.boards || []) as LeaderboardData[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${SITE_URL}/${lang}${PAGE_PATH}#dataset`,
    name: isEn
      ? "Monthly AI Visibility Index (SaaS Payments & China-Originated Global AI Tools)"
      : "月度英文 AI 推荐可见度指数（出海收款与出海 AI 工具）",
    description: isEn
      ? "Open monthly benchmark measuring brand mention rates, first-pick rates, official domain citations, and multi-round sampling confidence intervals across AI answer engines."
      : "基于固定英文采购题库与多轮采样的月度开源基准数据集，记录各品牌在 AI 搜索回答中的推荐率、首位推荐率、官网直引率与 95% 置信区间。",
    url: `${SITE_URL}/${lang}${PAGE_PATH}`,
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@id": PERSON_ID },
    dateModified: rawLeaderboard.generated_at,
    distribution: boards.map((b) => ({
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: `${SITE_URL}${b.csv_path}`,
      name: isEn ? b.title_en : b.title_zh,
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
        <Link href={`/${lang}/research`} className="hover:text-blue-600">
          {isEn ? "← Back to Open Research" : "← 返回开源研究与数据集"}
        </Link>
        <span>·</span>
        <span className="font-mono">CC BY 4.0</span>
      </div>

      {/* Hero */}
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          {isEn ? "OPEN MONTHLY AI VISIBILITY INDEX" : "公开克制的月度英文 AI 推荐榜"}
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEn
            ? "Who Do AI Engines Actually Recommend?"
            : "海外买家问 AI 时，到底推荐了哪些品牌？"}
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-3xl">
          {isEn
            ? "Single-run AI rankings are noisy—up to 50–60% of cited brands change from one run to the next. This index aggregates frozen English buyer prompts across multiple rounds and engines, publishes full Wilson 95% confidence intervals and cross-round spreads, accepts zero paid placements, and never ranks affiliated sites #1."
            : "单次问 AI 的结果随机性极高（相邻两次抽样有 50%–60% 的推荐品牌会洗牌）。本指数采用固定英文买方题库 + 多轮跨引擎采样，公开 Wilson 95% 置信区间与跨轮波动区间，不接受付费上榜，且明确隔离任何关联品牌（绝不自吹第一）。"}
        </p>
      </header>

      {/* Interactive Dual-Track Leaderboard */}
      <LeaderboardClient boards={boards} lang={lang} />

      {/* Methodology & Restraint Guardrails */}
      <section className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
        <h2 className="text-base font-bold text-gray-900">
          {isEn ? "Methodology & Anti-Hype Guardrails" : "统计口径与反忽悠护栏"}
        </h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-gray-900">
              {isEn ? "Multi-Round Aggregation:" : "多轮合并抗噪："}
            </strong>{" "}
            {isEn
              ? "Each prompt is sampled multiple rounds per month across ChatGPT, Perplexity, Gemini, and Google AI Mode. Both Wilson 95% CI and min–max round spread are published beside every rate."
              : "每道冻结题目每月跨多轮次、多引擎重复采样，同时公开 Wilson 95% 置信区间与跨轮最低–最高区间，不拿单次偶然截图当结论。"}
          </li>
          <li>
            <strong className="text-gray-900">
              {isEn ? "Strict Word-Boundary Entity Matching:" : "严格词边界实体匹配："}
            </strong>{" "}
            {isEn
              ? "Brand mentions require strict token boundaries (e.g., 'Polar' never matches 'bipolar'), and official domain citations are tracked separately from third-party listicle mentions."
              : "品牌提及采用严格词边界匹配（避免短词误伤），并将「文本提及率」「首位推荐率」与「品牌官网直引率」分开统计。"}
          </li>
          <li>
            <strong className="text-gray-900">
              {isEn ? "Zero Pay-to-Play & Self-Rank Restraint:" : "零付费位与克制原则："}
            </strong>{" "}
            {isEn
              ? "No vendor can pay to be added, boosted, or removed. Any affiliated property is explicitly labeled and excluded from #1 self-ranking."
              : "不卖任何上榜位或加权位；任何与本站有关联的产品都会明示披露，绝不把自己排第一。"}
          </li>
        </ul>
      </section>
    </div>
  );
}
