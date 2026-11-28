"use client";

import { useMemo, useState } from "react";
import Link from "@/components/Link";

export type Lang = "zh" | "en";

export interface BrandRow {
  rank: number;
  brand_id: string;
  name: string;
  origin: "cn_global" | "global_incumbent" | "challenger" | string;
  category: string;
  domains: string[];
  is_affiliated: boolean;
  mentions: number;
  mention_rate_pct: number;
  ci95_low: number;
  ci95_high: number;
  round_min_pct: number;
  round_max_pct: number;
  cited_rate_pct: number;
  first_mention_rate_pct: number;
  by_engine: Record<string, number>;
}

export interface LeaderboardData {
  id: string;
  status: "published" | "awaiting_first_run" | string;
  period: string;
  title_en: string;
  title_zh: string;
  subtitle_en: string;
  subtitle_zh: string;
  cadence: string;
  methodology: {
    frozen_questions: number;
    questions_sampled: number;
    total_answers: number;
    rounds: number;
    engines: string[];
    self_rank_policy: string;
    noise_disclosure: string;
  };
  questions_preview: Array<{ id: string; category: string; question: string }>;
  rankings: BrandRow[];
  csv_path: string;
}

const ORIGIN_META: Record<string, { zh: string; en: string; cls: string }> = {
  cn_global: {
    zh: "中国出海",
    en: "China-Originated",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  challenger: {
    zh: "新锐挑战者",
    en: "Challenger",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  global_incumbent: {
    zh: "欧美老牌",
    en: "Global Incumbent",
    cls: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

export default function LeaderboardClient({
  board,
  lang,
}: {
  board: LeaderboardData;
  lang: Lang;
}) {
  const isEn = lang === "en";
  const [activeCategory, setActiveCategory] = useState<string>("__all__");
  const [originFilter, setOriginFilter] = useState<string>("__all__");
  const [showQuestions, setShowQuestions] = useState<boolean>(false);

  const categories = useMemo(() => {
    const s = new Set<string>();
    (board.rankings || []).forEach((r) => {
      if (r.category) s.add(r.category);
    });
    return Array.from(s);
  }, [board]);

  // 仅展示当前榜单实际存在的阵营筛选按钮，避免空筛选项
  const availableOrigins = useMemo(() => {
    const order = ["cn_global", "challenger", "global_incumbent"];
    const present = new Set((board.rankings || []).map((r) => r.origin));
    return order.filter((o) => present.has(o));
  }, [board]);

  const filteredRows = useMemo(() => {
    return (board.rankings || []).filter((r) => {
      if (activeCategory !== "__all__" && r.category !== activeCategory) return false;
      if (originFilter !== "__all__" && r.origin !== originFilter) return false;
      return true;
    });
  }, [board, activeCategory, originFilter]);

  const isPublished = board.status === "published" && board.methodology.total_answers > 0;
  const enginesLabel =
    board.methodology.engines.length > 0
      ? board.methodology.engines.join(", ")
      : isEn
        ? "Pending"
        : "待采样";

  return (
    <div className="space-y-6">
      {/* KPI Strip + CSV Download */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-full font-medium ${
                isPublished
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isPublished
                ? isEn
                  ? `${board.period} Published`
                  : `${board.period} 已发布`
                : isEn
                  ? "Awaiting First Run"
                  : "待首轮采样"}
            </span>
            <span className="text-gray-500 font-mono">
              {isEn ? `Engines: ${enginesLabel}` : `采样引擎：${enginesLabel}`}
            </span>
          </div>
          <a
            href={board.csv_path}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-800 shrink-0"
          >
            {isEn ? "Download CSV (CC BY 4.0)" : "下载原始聚合 CSV（CC BY 4.0）"}
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <div className="text-[11px] text-gray-500">{isEn ? "Index Period" : "榜单期数"}</div>
            <div className="text-base font-bold font-mono text-gray-900 mt-0.5">{board.period}</div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <div className="text-[11px] text-gray-500">{isEn ? "Frozen Prompts" : "冻结英文买方题"}</div>
            <div className="text-base font-bold font-mono text-gray-900 mt-0.5">
              {board.methodology.frozen_questions}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <div className="text-[11px] text-gray-500">{isEn ? "Tracked Brands" : "追踪品牌数"}</div>
            <div className="text-base font-bold font-mono text-gray-900 mt-0.5">
              {board.rankings.length}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <div className="text-[11px] text-gray-500">{isEn ? "Sampled Answers" : "累计采样回答"}</div>
            <div className="text-base font-bold font-mono text-gray-900 mt-0.5">
              {isPublished
                ? isEn
                  ? `${board.methodology.total_answers} (${board.methodology.rounds} rounds)`
                  : `${board.methodology.total_answers} 条 / ${board.methodology.rounds} 轮`
                : isEn
                  ? "0 (Pending)"
                  : "0（待首跑）"}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      {(categories.length > 1 || availableOrigins.length > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {categories.length > 1 ? (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory("__all__")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === "__all__"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isEn ? "All Categories" : "全部分类"}
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === c
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          {availableOrigins.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setOriginFilter("__all__")}
                className={`px-2.5 py-1 rounded-md border transition-colors ${
                  originFilter === "__all__"
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {isEn ? "All Origins" : "全部阵营"}
              </button>
              {availableOrigins.map((orig) => (
                <button
                  key={orig}
                  type="button"
                  onClick={() => setOriginFilter(orig)}
                  className={`px-2.5 py-1 rounded-md border transition-colors ${
                    originFilter === orig
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {isEn ? ORIGIN_META[orig].en : ORIGIN_META[orig].zh}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ranking Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="py-3 px-4 font-semibold w-12">#</th>
                <th className="py-3 px-4 font-semibold">{isEn ? "Brand" : "品牌"}</th>
                <th className="py-3 px-4 font-semibold">{isEn ? "Origin & Vertical" : "阵营 / 赛道"}</th>
                <th className="py-3 px-4 font-semibold text-right">
                  {isEn ? "AI Mention Rate" : "AI 推荐提及率"}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {isEn ? "95% CI (Round Spread)" : "95% CI（跨轮区间）"}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {isEn ? "1st Pick" : "首位推荐"}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {isEn ? "Official Cited" : "官网直引"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row) => {
                const om = ORIGIN_META[row.origin] || ORIGIN_META.global_incumbent;
                return (
                  <tr key={row.brand_id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-mono text-gray-500">
                      {isPublished ? row.rank : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <span>{row.name}</span>
                        {row.is_affiliated && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            {isEn ? "Affiliated" : "关联披露"}
                          </span>
                        )}
                      </div>
                      {row.domains[0] && (
                        <div className="text-[11px] font-mono text-gray-400">{row.domains[0]}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${om.cls}`}>
                          {isEn ? om.en : om.zh}
                        </span>
                        <span className="text-xs text-gray-500">{row.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {isPublished ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="font-bold text-gray-900">
                            {row.mention_rate_pct.toFixed(1)}%
                          </span>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${Math.min(100, row.mention_rate_pct)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">{isEn ? "Pending" : "待采样"}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-gray-600">
                      {isPublished
                        ? `${row.ci95_low}–${row.ci95_high}% (${row.round_min_pct}–${row.round_max_pct}%)`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">
                      {isPublished ? `${row.first_mention_rate_pct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">
                      {isPublished ? `${row.cited_rate_pct.toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collapsible Frozen Prompt Set */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <button
          type="button"
          onClick={() => setShowQuestions((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">
              {isEn
                ? `Frozen English Buyer Prompt Set (${board.questions_preview.length} queries)`
                : `公开冻结的海外英文采购题库（共 ${board.questions_preview.length} 题）`}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEn
                ? "Same unbranded buyer prompts repeated across multiple rounds each month so rank changes reflect real shifts, not prompt cherry-picking."
                : "每月固定跑同一批非品牌英文采购词，不临时换题挑好结果，保证跨月走势可复核。"}
            </p>
          </div>
          <span className="text-xs font-medium text-blue-600 shrink-0 ml-4">
            {showQuestions ? (isEn ? "Hide ▲" : "收起 ▲") : isEn ? "Inspect All ▼" : "展开全部题目 ▼"}
          </span>
        </button>
        {showQuestions && (
          <ol className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs sm:text-sm text-gray-700">
            {board.questions_preview.map((q, idx) => (
              <li key={q.id} className="flex items-start gap-2.5">
                <span className="font-mono text-gray-400 shrink-0 w-6 text-right">{idx + 1}.</span>
                <div>
                  <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 mr-2">
                    {q.category}
                  </span>
                  <span>{q.question}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Conversion Hook CTA */}
      <section className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-white p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          {board.id === "payments-mor"
            ? isEn
              ? "Compare Net Take-Home & Eligibility Across Every MoR"
              : "想看各家收款平台 $20 订阅真实净到手与开户门槛？"
            : isEn
              ? "Missing from AI Answers, or Trailing Competitors?"
              : "没在榜单里看到你的产品，或发现竞品推荐率远高于你？"}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {board.id === "payments-mor"
            ? isEn
              ? "AI mention share only tells you who gets talked about. Use our interactive fee calculator and 200k-checkout Zenodo benchmark to check exact net payouts and non-US founder approval rules—or audit your own product's AI readiness."
              : "AI 推荐率只反映谁被谈论得多；具体到真金白银的费率与主体门槛，可直接用交互式收款选型器核对 $20 订阅净到手，或用 26 项体检工具自测自己产品站的 AI 可见度。"
            : isEn
              ? "First run a deterministic 26-point technical audit on your site, or email your domain to request a 20-prompt AI Visibility Gap Diagnostic showing which third-party lists and on-page facts ChatGPT and Perplexity use to pick competitors over you."
              : "先用免费的 26 项 AI 就绪度体检工具排查站点抓取与结构硬伤；如果你希望针对自己所在赛道跑一套「20 题多引擎 AI 推荐差距诊断」（拆解 AI 为什么优先推竞品、缺在站内事实还是站外清单），可以直接发域名预约沟通。"}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {board.id === "payments-mor" ? (
            <Link
              href={`/${lang}/go-global/payments`}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {isEn ? "Open $20 MoR Fee Calculator →" : "打开出海收款选型与净到手计算器 →"}
            </Link>
          ) : (
            <Link
              href={`/${lang}/go-global/ai-readiness`}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {isEn ? "Run Free 26-Check AI Readiness Audit →" : "免费跑 26 项 AI 就绪度体检 →"}
            </Link>
          )}
          <Link
            href={`/${lang}/contact`}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 text-sm font-medium hover:border-blue-400 transition-colors"
          >
            {isEn ? "Request 20-Prompt Category Gap Report →" : "提交域名 · 预约 20 题赛道差距诊断 →"}
          </Link>
        </div>
      </section>
    </div>
  );
}
