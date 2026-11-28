import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/Link";
import { withSocialCards } from "@/lib/social";
import { PERSON_ID } from "@/lib/profiles";
import rawLeaderboard from "@/generated/ai-visibility-leaderboard.json";
import LeaderboardClient, { type Lang, type LeaderboardData } from "../LeaderboardClient";

const SITE_URL = "https://jasonzhu.ai";
const ALL_BOARDS = (rawLeaderboard.boards || []) as LeaderboardData[];

export async function generateStaticParams() {
  const params: Array<{ lang: string; board: string }> = [];
  for (const lang of ["zh", "en"]) {
    for (const b of ALL_BOARDS) {
      params.push({ lang, board: b.id });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; board: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, board: boardId } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const isEn = lang === "en";
  const board = ALL_BOARDS.find((b) => b.id === boardId);
  if (!board) return {};
  const path = `/research/ai-visibility/${board.id}`;
  const title = isEn
    ? `${board.title_en} (${board.period}) — Jason Zhu`
    : `${board.title_zh}（${board.period}）— Jason Zhu`;
  const desc = isEn ? board.subtitle_en : board.subtitle_zh;

  return withSocialCards(
    {
      title,
      description: desc,
      alternates: {
        canonical: `${SITE_URL}/${lang}${path}`,
        languages: {
          zh: `${SITE_URL}/zh${path}`,
          en: `${SITE_URL}/en${path}`,
          "x-default": `${SITE_URL}/en${path}`,
        },
      },
    },
    lang
  );
}

export default async function SingleLeaderboardPage({
  params,
}: {
  params: Promise<{ lang: string; board: string }>;
}) {
  const { lang: rawLang, board: boardId } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const isEn = lang === "en";
  const board = ALL_BOARDS.find((b) => b.id === boardId);
  if (!board) notFound();

  const otherBoards = ALL_BOARDS.filter((b) => b.id !== board.id);
  const path = `/research/ai-visibility/${board.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${SITE_URL}/${lang}${path}#dataset`,
    name: isEn ? board.title_en : board.title_zh,
    description: isEn ? board.subtitle_en : board.subtitle_zh,
    url: `${SITE_URL}/${lang}${path}`,
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@id": PERSON_ID },
    dateModified: rawLeaderboard.generated_at,
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: `${SITE_URL}${board.csv_path}`,
        name: isEn ? `${board.title_en} (${board.period} CSV)` : `${board.title_zh}（${board.period} CSV）`,
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-4 flex flex-wrap items-center gap-2">
        <Link href={`/${lang}/research`} className="hover:text-blue-600">
          {isEn ? "Open Research" : "开源研究"}
        </Link>
        <span>/</span>
        <Link href={`/${lang}/research/ai-visibility`} className="hover:text-blue-600">
          {isEn ? "AI Visibility Index" : "AI 推荐月榜"}
        </Link>
        <span>·</span>
        <span className="font-mono">CC BY 4.0</span>
      </nav>

      {/* Dedicated Single-Board Header */}
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          {isEn ? `MONTHLY AI VISIBILITY INDEX · ${board.period}` : `月度英文 AI 推荐实测榜 · ${board.period}`}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEn ? board.title_en : board.title_zh}
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-3xl">
          {isEn ? board.subtitle_en : board.subtitle_zh}
        </p>
      </header>

      {/* Single-Board Interactive Table */}
      <LeaderboardClient board={board} lang={lang} />

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
              ? "Single-run AI answers can shift 50–60% between runs. We repeat the same frozen buyer prompts across multiple rounds and publish Wilson 95% CI alongside min–max round spread."
              : "单次问 AI 波动高达 50%–60%。本榜对同一批冻结买方题做多轮重复采样，同时公开 Wilson 95% 置信区间与跨轮最小–最大区间。"}
          </li>
          <li>
            <strong className="text-gray-900">
              {isEn ? "Strict Entity & Domain Matching:" : "严格实体与官网直引统计："}
            </strong>{" "}
            {isEn
              ? "Brand mentions use strict token boundaries, and direct official-domain citations are tracked separately from third-party listicle mentions."
              : "品牌提及采用严格词边界匹配，并将「文本提及率」「首位推荐率」与「官网直引率」分开统计。"}
          </li>
          <li>
            <strong className="text-gray-900">
              {isEn ? "Zero Paid Placements:" : "零付费位与克制原则："}
            </strong>{" "}
            {isEn
              ? "No vendor can pay to be added, boosted, or removed; affiliated properties are explicitly disclosed and excluded from #1 self-ranking."
              : "不接受任何付费上榜或加权；任何关联站点均明示披露，绝不把自己排第一。"}
          </li>
        </ul>
      </section>

      {/* Sibling Indices */}
      {otherBoards.length > 0 && (
        <section className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            {isEn ? "Other Monthly AI Visibility Indices" : "其他赛道 AI 推荐月榜"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherBoards.map((ob) => (
              <Link
                key={ob.id}
                href={`/${lang}/research/ai-visibility/${ob.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 transition-colors"
              >
                <div className="font-bold text-sm text-gray-900">
                  {isEn ? ob.title_en : ob.title_zh}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {isEn
                    ? `${ob.methodology.frozen_questions} prompts · ${ob.rankings.length} brands · ${ob.period}`
                    : `${ob.methodology.frozen_questions} 题 · ${ob.rankings.length} 个品牌 · ${ob.period}`}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
