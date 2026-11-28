import type { Metadata } from "next";
import Link from "@/components/Link";
import { withSocialCards } from "@/lib/social";
import { PERSON_ID } from "@/lib/profiles";
import rawLeaderboard from "@/generated/ai-visibility-leaderboard.json";
import type { Lang, LeaderboardData } from "./LeaderboardClient";

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
        ? "Monthly AI Visibility Index Directory — Jason Zhu"
        : "海外英文 AI 推荐月榜总览 — Jason Zhu",
      description: isEn
        ? "Directory of independent monthly AI recommendation benchmarks across SaaS payments/MoR and China-originated global AI tools, with multi-round Wilson 95% confidence intervals and CC BY 4.0 CSV downloads."
        : "独立月度英文 AI 搜索推荐榜总览：按赛道分设独立专页，覆盖出海收款 MoR 平台与中国出海 AI 工具，公开多轮采样置信区间与 CC BY 4.0 CSV 数据。",
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

export default async function AiVisibilityHubPage({
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
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/${lang}${PAGE_PATH}#collection`,
    name: isEn ? "Monthly AI Visibility Index Directory" : "海外英文 AI 推荐月榜总览",
    url: `${SITE_URL}/${lang}${PAGE_PATH}`,
    author: { "@id": PERSON_ID },
    hasPart: boards.map((b) => ({
      "@type": "Dataset",
      name: isEn ? b.title_en : b.title_zh,
      url: `${SITE_URL}/${lang}${PAGE_PATH}/${b.id}`,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
        <Link href={`/${lang}/research`} className="hover:text-blue-600">
          {isEn ? "← Back to Open Research" : "← 返回开源研究与数据集"}
        </Link>
        <span>·</span>
        <span className="font-mono">CC BY 4.0</span>
      </div>

      <header className="mb-10 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          {isEn ? "MONTHLY AI VISIBILITY INDICES" : "按赛道分设的月度英文 AI 推荐榜"}
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEn ? "AI Visibility Index Directory" : "海外英文 AI 推荐月榜总览"}
        </h1>
        <p className="text-gray-600 leading-relaxed">
          {isEn
            ? "Each vertical has its own standalone page, frozen English buyer prompt set, multi-round confidence intervals, and downloadable CSV—zero pay-to-play and zero self-ranking."
            : "每个垂直赛道拥有独立的 URL、冻结英文买方题库、多轮采样 Wilson 95% 置信区间与开源 CSV，不卖上榜位、绝不自吹第一。"}
        </p>
      </header>

      {/* Standalone Vertical Leaderboard Cards */}
      <div className="space-y-5">
        {boards.map((b) => {
          const top3 = b.rankings.slice(0, 3);
          const isLive = b.status === "published" && b.methodology.total_answers > 0;
          return (
            <Link
              key={b.id}
              href={`/${lang}${PAGE_PATH}/${b.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-blue-400 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-gray-500">
                  {b.period} ·{" "}
                  {isEn
                    ? `${b.methodology.frozen_questions} prompts · ${b.rankings.length} brands · ${b.methodology.total_answers} answers`
                    : `${b.methodology.frozen_questions} 道题 · ${b.rankings.length} 个品牌 · ${b.methodology.total_answers} 条实测回答`}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                  {isLive
                    ? isEn
                      ? `${b.period} Live`
                      : `${b.period} 已发布`
                    : isEn
                      ? "Pending"
                      : "待首跑"}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {isEn ? b.title_en : b.title_zh}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {isEn ? b.subtitle_en : b.subtitle_zh}
              </p>

              {isLive && top3.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {top3.map((r) => (
                    <span
                      key={r.brand_id}
                      className="text-xs font-mono px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-800"
                    >
                      #{r.rank} {r.name} · {r.mention_rate_pct.toFixed(1)}%
                    </span>
                  ))}
                </div>
              )}

              <span className="inline-block text-sm font-medium text-blue-700">
                {isEn ? "Open full standalone report & CSV →" : "进入独立榜单专页与完整 CSV →"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
