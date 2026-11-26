import type { Metadata } from "next";
import Link from "@/components/Link";
import { withSocialCards } from "@/lib/social";
import { PERSON_ID } from "@/lib/profiles";
import {
  AI_TYPES,
  PAGE_PATH,
  SITE_URL,
  TYPE_COLOR,
  TYPE_LABEL,
  botName,
  engineIn,
  fmt,
  fmtBytes,
  fmtDay,
  fmtMonth,
  isAi,
  latestRun,
  nextUpdateMonth,
  share,
  stats,
  type Bot,
  type BotType,
  type Cell,
  type Lang,
} from "@/lib/ai-crawler-stats";
import { CiBar, DailyChart, InlineBar, TypeLegend } from "./charts";

// AI 爬虫与 AI 引用公开数据（2026-11-26 起，每月更新）。数据全部来自 src/generated/ai-crawler-stats.json，
// 由 ops/geo/crawler_stats.py 生成（爬虫日志来自本机 GEOInflow，引用率来自 ops/geo/panel/ 的面板结果）。
// 页面上的数字都从数据里现算，每月重跑脚本、重新部署就更新，正文不用改。英文版不能有中文（含 JSON-LD、title 属性）。

export async function generateStaticParams() {
  return [{ lang: "zh" }, { lang: "en" }];
}

const t = (lang: Lang, en: string, zh: string) => (lang === "en" ? en : zh);

function headline() {
  const { totals, coverage } = stats;
  const run = latestRun();
  const unbranded = run.engines
    .filter((e) => e.unbranded)
    .sort((a, b) => (b.unbranded!.pct - a.unbranded!.pct) || a.label.localeCompare(b.label));
  return { totals, coverage, run, unbranded };
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const { totals, coverage } = stats;
  return withSocialCards(
    {
      title: t(lang, "AI Crawler Traffic & AI Citations: Open Data", "AI 爬虫流量与 AI 引用：公开数据（每月更新）"),
      description: t(
        lang,
        `${fmt(totals.ai_requests)} AI crawler requests in ${coverage.days} days on a real indie site: which bots came, what they read, how many verify, and how often AI answers cite it. CSV, CC BY 4.0.`,
        `一个真实独立站的 AI 爬虫公开数据：${coverage.days} 天 ${fmt(totals.ai_requests)} 次 AI 爬虫请求，哪些 AI 来过、读了什么、多少能核实身份，以及 ChatGPT、Gemini、Perplexity 的回答引用本站的比例。CSV 下载，CC BY 4.0，每月更新。`
      ),
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

const SECTION_NOTE: Record<string, { en: string; zh: string }> = {
  "/prompts": { en: "prompt libraries", zh: "提示词库" },
  "/_next": { en: "scripts, styles and resized images", zh: "脚本、样式和缩放后的图片" },
  "/blog": { en: "blog posts and their images", zh: "博客文章和配图" },
  "/news": { en: "daily AI news", zh: "每日 AI 快讯" },
  "/go-global": { en: "guides to selling abroad", zh: "出海专题" },
  "/robots.txt": { en: "crawl rules", zh: "爬虫规则" },
  "/": { en: "home page", zh: "首页" },
  "/favicon.ico": { en: "site icon", zh: "网站图标" },
  "/sitemap.xml": { en: "sitemap", zh: "站点地图" },
  "/club": { en: "membership", zh: "会员" },
  "/about": { en: "about the author", zh: "关于作者" },
  "/data": { en: "machine-readable data", zh: "给机器读的数据" },
  "/backlink-spam-list": { en: "backlink spam list", zh: "垃圾外链来源库" },
  "/tools": { en: "AI tools directory", zh: "AI 工具箱" },
  "/research": { en: "papers and datasets", zh: "论文和数据集" },
  "/llms.txt": { en: "guide for language models", zh: "给大模型的导览" },
  "/api": { en: "site API", zh: "站内接口" },
};
const SPECIAL_SECTION: Record<string, { en: string; zh: string }> = {
  "(other site sections)": { en: "Other site sections", zh: "其他栏目" },
  "(not a site path)": { en: "Paths that don't exist here (old links, probes)", zh: "本站没有的路径（旧链接、乱试的路径）" },
};

const SURFACE_ZH: Record<string, string> = {
  "web interface (logged out, US English)": "网页界面（未登录、美国英文）",
  "Google search results page (US English)": "Google 搜索结果页（美国英文）",
  "API with web search": "API（开联网搜索）",
};

/** 一个爬虫的核验情况：核验通过的比例，加一句说明没核验的是哪种 */
function verifyText(b: Bot, lang: Lang): { main: string; note: string } {
  const v = b.verification;
  const checked = v.verified_in_published_ranges + v.outside_published_ranges;
  const notes: string[] = [];
  if (v.outside_published_ranges)
    notes.push(t(lang, `${fmt(v.outside_published_ranges)} outside the ranges`, `${fmt(v.outside_published_ranges)} 次不在 IP 段内`));
  if (v.unverified_stale_range_list)
    notes.push(
      checked
        ? t(lang, "rest not checked: our copy of the list was out of date", "其余没核验：手里那份 IP 段过期了")
        : t(lang, "not checked: our copy of the list was out of date", "没核验：手里那份 IP 段过期了")
    );
  if (!checked && v.unverified_no_published_ranges)
    notes.push(t(lang, "no published IP list", "没有公布 IP 段"));
  return { main: checked ? share(v.verified_in_published_ranges, b.requests) : "–", note: notes.join(t(lang, "; ", "；")) };
}

function CellText({ cell, lang }: { cell?: Cell; lang: Lang }) {
  if (!cell) return <span className="text-gray-400">–</span>;
  return (
    <span className="tabular-nums whitespace-nowrap">
      <span className="font-semibold text-gray-900">{cell.pct}%</span>{" "}
      <span className="text-gray-500">
        ({cell.hits}/{cell.answers}
        {t(lang, ", 95% CI ", "，区间 ")}
        {cell.ci_pct[0]}–{cell.ci_pct[1]}%)
      </span>
    </span>
  );
}

function listJoin(items: string[], lang: Lang): string {
  if (lang === "zh") return items.join("、");
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export default async function AiCrawlersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const isEn = lang === "en";
  const { totals, coverage, run, unbranded } = headline();
  const ai = totals.ai_requests;
  const verified = totals.ai_verification.verified_in_published_ranges;
  const aiBots = stats.bots.filter((b) => isAi(b.bot_type));
  const maxBot = Math.max(...aiBots.map((b) => b.requests));
  const unmapped = stats.bots.find((b) => b.bot === "Unmapped");
  const typeTotals = Object.fromEntries(AI_TYPES.map((k) => [k, totals.by_type[k]]));
  const sections = stats.sections;
  const maxSection = Math.max(...sections.map((s) => s.ai_requests));
  const prompts = sections.find((s) => s.section === "/prompts");
  const firstRelease = stats.changelog[stats.changelog.length - 1]?.date ?? stats.version;
  const csvs = stats.downloads.filter((d) => d.format === "text/csv");
  const json = stats.downloads.find((d) => d.format === "application/json");
  const runs = stats.citations.runs;
  const fixedQuestions = runs[runs.length - 1].questions.frozen;
  const withReferrals = runs.filter((r) => r.ai_referrals);
  const pdays = stats.citations.panel_days;
  const perplexityUser = stats.bots.some((b) => b.bot === "Perplexity-User");
  const byTypeBots = (k: BotType) => stats.bots.filter((b) => b.bot_type === k).map((b) => b.bot);
  const staleBots = aiBots.filter((b) => b.verification.unverified_stale_range_list > 0);
  const noListVendors = [...new Set(aiBots.filter((b) => b.verification.unverified_no_published_ranges > 0).map((b) => b.vendor))];
  // IP 段过期没核验的：全部过期的列名字，部分过期的写占比（PerplexityBot 11-04 起过期）
  const staleAll = staleBots.filter((b) => !b.verification.verified_in_published_ranges).map((b) => b.bot);
  const stalePart = staleBots
    .filter((b) => b.verification.verified_in_published_ranges)
    .map((b) => (isEn ? `${share(b.verification.unverified_stale_range_list, b.requests)} of ${b.bot}'s` : `${b.bot} ${share(b.verification.unverified_stale_range_list, b.requests)} 的请求`));
  const staleText = isEn
    ? [staleAll.length ? `all of ${listJoin(staleAll, "en")}` : "", listJoin(stalePart, "en")].filter(Boolean).join(", and ")
    : [staleAll.length ? `${staleAll.join("、")} 的全部请求` : "", stalePart.join("、")].filter(Boolean).join("，以及 ");
  const range = isEn
    ? `${fmtDay(coverage.first_day, "en", false)} to ${fmtDay(coverage.last_day, "en")}`
    : `${fmtDay(coverage.first_day, "zh")}至${fmtDay(coverage.last_day, "zh", false)}`;
  const nextMonth = nextUpdateMonth(coverage.last_day);
  const pageUrl = `${SITE_URL}/en${PAGE_PATH}`;
  const citation = `Zhu, J. (${stats.version.slice(0, 4)}). ${stats.name} (version ${stats.version}) [Data set]. ${pageUrl}`;
  const bibtex = `@misc{zhu${stats.version.slice(0, 4)}aicrawlers,
  author       = {Zhu, Jason},
  title        = {${stats.name}},
  year         = {${stats.version.slice(0, 4)}},
  version      = {${stats.version}},
  howpublished = {\\url{${pageUrl}}},
  note         = {Data set. License: CC BY 4.0}
}`;

  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${pageUrl}#dataset`,
    name: stats.name,
    description: t(
      lang,
      `Daily and monthly counts of crawler requests to jasonzhu.ai, a bilingual indie blog, from its Vercel logs since ${fmtDay(coverage.first_day, "en")}: crawler, operator, type (AI search, training, user-triggered), IP range verification, HTTP status class and site section. Includes weekly measurements of how often ChatGPT, Gemini App, Google AI Mode, Perplexity and Claude cite the site, with 95% intervals. No IP addresses, user agents or answer text.`,
      `jasonzhu.ai（中英双语独立博客）${fmtDay(coverage.first_day, "zh")}起的 Vercel 日志里，爬虫请求的按天、按月计数：哪个爬虫、哪家公司、哪一类（AI 搜索、训练、用户触发）、IP 段核验结果、HTTP 状态和网站栏目；另有每周测量 ChatGPT、Gemini App、Google AI Mode、Perplexity 和 Claude 引用本站的比例（带 95% 区间）。不含 IP、User-Agent 原文和回答原文。`
    ),
    url: pageUrl,
    creator: { "@id": PERSON_ID },
    license: stats.license_url,
    isAccessibleForFree: true,
    version: stats.version,
    datePublished: firstRelease,
    dateModified: stats.version,
    temporalCoverage: `${coverage.first_day}/${coverage.last_day}`,
    keywords: [
      "AI crawlers",
      "AI bots",
      "GPTBot",
      "ClaudeBot",
      "PerplexityBot",
      "ChatGPT-User",
      "llms.txt",
      "robots.txt",
      "AI search citations",
      "generative engine optimization",
      "server logs",
    ],
    variableMeasured: [
      "requests",
      "crawler (user agent name)",
      "operator",
      "crawler type",
      "IP range verification",
      "HTTP status class",
      "site section",
      "AI answer citation rate",
    ],
    measurementTechnique:
      "Vercel log drain filtered to automated user agents; crawler identity from the user agent; IP checked against operators' published IP ranges; weekly fixed-question panel asked to AI assistants, 95% intervals by question-level bootstrap.",
    distribution: stats.downloads.map((d) => ({
      "@type": "DataDownload",
      name: d.file,
      encodingFormat: d.format,
      contentUrl: `${SITE_URL}${d.url}`,
    })),
  };

  const h2 = "text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200";
  const h3 = "text-base font-semibold text-gray-900 mt-6 mb-2";
  const p = "text-sm text-gray-600 leading-relaxed";
  const th = "px-3 py-2 font-medium";
  const td = "px-3 py-2";

  const stat = [
    { n: fmt(ai), label: t(lang, "AI crawler requests", "次 AI 爬虫请求") },
    { n: share(ai, totals.requests), label: t(lang, "of all crawler requests", "占全部爬虫请求") },
    { n: share(verified, ai), label: t(lang, "verified by published IP ranges", "能用公布的 IP 段核实") },
    { n: fmt(totals.by_type.user_triggered), label: t(lang, "fetches for a user's question", "次替用户提问现场读页") },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }} />

      <nav aria-label={t(lang, "Breadcrumb", "面包屑")} className="text-sm text-gray-500 mb-4">
        <Link href={`/${lang}/research`} className="hover:text-blue-700">
          {t(lang, "Research & data", "研究与数据")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-700">{t(lang, "AI crawler data", "AI 爬虫数据")}</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
          {t(lang, "Open data · updated monthly · CC BY 4.0", "公开数据 · 每月更新 · CC BY 4.0")}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {t(lang, "How AI crawlers read a real indie site, and how often AI answers cite it", "AI 爬虫怎么读一个真实的独立站，AI 回答又有多常引用它")}
        </h1>
        <p className="text-gray-700 leading-relaxed">
          {isEn ? (
            <>
              From {range} (UTC), AI crawlers made <strong>{fmt(ai)}</strong> requests to jasonzhu.ai, {share(ai, totals.requests)} of the{" "}
              {fmt(totals.requests)} requests from all crawlers: {fmt(totals.by_type.ai_search)} from AI search crawlers,{" "}
              {fmt(totals.by_type.training)} from training crawlers and {fmt(totals.by_type.user_triggered)} fetches made while an
              assistant answered someone. Only {share(verified, ai)}{" "}
              {"of the AI crawler requests could be verified against the operator’s published IP ranges."} In the latest weekly
              answer panel ({fmtDay(run.date, "en")}), on questions that don’t name the site,{" "}
              {unbranded
                .map((e, i) =>
                  i === 0 ? `${e.label} cited it in ${e.unbranded!.pct}% of answers` : `${e.label} in ${e.unbranded!.pct}%`
                )
                .join(", ")
                .replace(/, ([^,]*)$/, " and $1")}
              .
            </>
          ) : (
            <>
              {range}（UTC），AI 爬虫访问 jasonzhu.ai <strong>{fmt(ai)}</strong> 次，占全部爬虫请求（{fmt(totals.requests)} 次）的{" "}
              {share(ai, totals.requests)}：AI 搜索爬虫 {fmt(totals.by_type.ai_search)} 次，训练爬虫 {fmt(totals.by_type.training)}{" "}
              次，AI 助手替用户提问现场读页 {fmt(totals.by_type.user_triggered)} 次。其中只有 {share(verified, ai)}{" "}
              能用各家公布的 IP 段核实身份。最近一次每周引用面板（{fmtDay(run.date, "zh", false)}）里，问题不提本站时，
              {unbranded.map((e, i) => (i === 0 ? `${e.label} 的回答有 ${e.unbranded!.pct}% 引用了本站` : `${e.label} ${e.unbranded!.pct}%`)).join("，")}。
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-3">
          {isEn
            ? `Version ${stats.version} · logs ${fmtDay(coverage.first_day, "en")} to ${fmtDay(coverage.last_day, "en")} (UTC) · next update early ${fmtMonth(nextMonth, "en")} · by Jason Zhu`
            : `版本 ${stats.version} · 日志 ${coverage.first_day} 至 ${coverage.last_day}（UTC）· 下次更新 ${fmtMonth(nextMonth, "zh")}初 · 祝彦森（Jason Zhu）`}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {csvs.map((d) => (
            <a
              key={d.file}
              href={d.url}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              CSV · {fmtMonth(d.month, lang)}
              {d.partial ? t(lang, " (partial)", "（不完整）") : ""}
            </a>
          ))}
          {json && (
            <a
              href={json.url}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
            >
              {t(lang, "JSON · all aggregates", "JSON · 全部汇总")}
            </a>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {stat.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{s.n}</div>
            <div className="text-sm text-gray-500 mt-1 leading-snug">{s.label}</div>
          </div>
        ))}
      </section>

      {/* 每天 */}
      <section className="mb-12">
        <h2 className={h2}>{t(lang, "AI crawler requests per day", "每天的 AI 爬虫请求")}</h2>
        <TypeLegend lang={lang} totals={typeTotals} />
        <DailyChart days={stats.daily_by_type} lang={lang} />
        <p className="text-xs text-gray-500 mt-3">
          {isEn
            ? `UTC days. ${listJoin(coverage.partial_days.map((d) => fmtDay(d, "en", false)), "en")} (lighter) is partial: logging began at ${coverage.first_request_utc.slice(11)} UTC. Hover a column for its numbers.`
            : `按 UTC 日计。${listJoin(coverage.partial_days.map((d) => fmtDay(d, "zh", false)), "zh")}（颜色较浅）不完整：日志从 UTC ${coverage.first_request_utc.slice(11)} 开始记。鼠标停在柱子上可看当天数字。`}
        </p>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-gray-700 hover:text-blue-700">
            {t(lang, "Show the daily numbers", "看每天的数字")}
          </summary>
          <div className="relative overflow-x-auto mt-2 rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left whitespace-nowrap">
                <tr>
                  <th className={th}>{t(lang, "Day (UTC)", "日期（UTC）")}</th>
                  {AI_TYPES.map((k) => (
                    <th key={k} className={`${th} text-right`}>
                      {TYPE_LABEL[k][lang]}
                    </th>
                  ))}
                  <th className={`${th} text-right`}>{t(lang, "All AI crawlers", "AI 爬虫合计")}</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {stats.daily_by_type.map((d) => (
                  <tr key={d.date} className="border-t border-gray-100">
                    <td className={`${td} whitespace-nowrap`}>
                      {d.date}
                      {d.coverage !== "full" ? t(lang, " (partial)", "（不完整）") : ""}
                    </td>
                    {AI_TYPES.map((k) => (
                      <td key={k} className={`${td} text-right`}>
                        {fmt(d[k])}
                      </td>
                    ))}
                    <td className={`${td} text-right font-medium text-gray-900`}>{fmt(AI_TYPES.reduce((s, k) => s + d[k], 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      {/* 哪些爬虫 */}
      <section className="mb-12">
        <h2 className={h2}>{t(lang, "Which AI crawlers came", "哪些 AI 爬虫来过")}</h2>
        <p className={`${p} mb-4`}>
          {isEn
            ? `For comparison, search engine crawlers made ${fmt(totals.by_type.search_engine)} requests and other crawlers ${fmt(totals.by_type.other)}, ${fmt(unmapped?.requests ?? 0)} of them from automated user agents not mapped to any operator. Those are in the totals and the CSV, not in the AI numbers.`
            : `对照：传统搜索引擎爬虫 ${fmt(totals.by_type.search_engine)} 次，其他爬虫 ${fmt(totals.by_type.other)} 次，其中 ${fmt(unmapped?.requests ?? 0)} 次来自认不出是哪家的自动程序。它们算在总数和 CSV 里，不算进 AI 的数字。`}
        </p>
        <div className="relative overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left whitespace-nowrap">
              <tr>
                <th className={th}>{t(lang, "Crawler", "爬虫")}</th>
                <th className={th}>{t(lang, "Type", "类型")}</th>
                <th className={`${th} text-right`}>{t(lang, "Requests", "请求")}</th>
                <th className={`${th} w-1/4`}>
                  <span className="sr-only">{t(lang, "Relative volume", "相对量")}</span>
                </th>
                <th className={`${th} text-right`}>{t(lang, "Verified", "核验通过")}</th>
                <th className={`${th} text-right`}>4xx</th>
              </tr>
            </thead>
            <tbody>
              {aiBots.map((b) => {
                const v = verifyText(b, lang);
                const type = b.bot_type as (typeof AI_TYPES)[number];
                return (
                  <tr key={`${b.vendor}-${b.bot}`} className="border-t border-gray-100 align-top">
                    <td className={td}>
                      <div className="font-medium text-gray-900 whitespace-nowrap">{b.bot}</div>
                      <div className="text-xs text-gray-500">{b.vendor}</div>
                    </td>
                    <td className={`${td} whitespace-nowrap text-gray-700`}>
                      <span aria-hidden className="inline-block w-2 h-2 rounded-sm mr-1.5" style={{ background: TYPE_COLOR[type] }} />
                      {TYPE_LABEL[b.bot_type][lang]}
                    </td>
                    <td className={`${td} text-right tabular-nums text-gray-900`}>{fmt(b.requests)}</td>
                    <td className={`${td} pt-3.5`}>
                      <InlineBar value={b.requests} max={maxBot} color={TYPE_COLOR[type]} />
                    </td>
                    <td className={`${td} text-right`}>
                      <div className="tabular-nums text-gray-900">{v.main}</div>
                      {v.note && <div className="text-xs text-gray-500 max-w-[200px] ml-auto">{v.note}</div>}
                    </td>
                    <td className={`${td} text-right tabular-nums text-gray-700`}>{share(b.status.status_4xx, b.requests)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {t(
            lang,
            "Verified = request IP inside the operator's published IP ranges, as a share of that crawler's requests. 4xx = share answered with a client error, almost all 404.",
            "核验通过 = 请求 IP 落在这家公司公布的 IP 段里，占这个爬虫请求的比例。4xx = 返回客户端错误的比例，几乎都是 404。"
          )}
        </p>
      </section>

      {/* 读了什么 */}
      <section className="mb-12">
        <h2 className={h2}>{t(lang, "What they read", "它们读了什么")}</h2>
        <p className={`${p} mb-4`}>
          {isEn
            ? `Requests by the first part of the path, with /zh/ and /en/ folded together. ${prompts ? `The prompt libraries drew ${share(prompts.ai_requests, ai)} of AI crawler requests.` : ""}`
            : `按路径第一段分组，/zh/ 和 /en/ 合在一起算。${prompts ? `提示词库占 AI 爬虫请求的 ${share(prompts.ai_requests, ai)}。` : ""}`}
        </p>
        <div className="relative overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left whitespace-nowrap">
              <tr>
                <th className={th}>{t(lang, "Section", "栏目")}</th>
                <th className={`${th} text-right`}>{t(lang, "AI crawlers", "AI 爬虫")}</th>
                <th className={`${th} w-1/4`}>
                  <span className="sr-only">{t(lang, "Relative volume", "相对量")}</span>
                </th>
                <th className={`${th} text-right`}>{t(lang, "All crawlers", "全部爬虫")}</th>
                <th className={`${th} text-right`}>{t(lang, "AI 4xx", "AI 的 4xx")}</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => {
                const special = SPECIAL_SECTION[s.section];
                const note = SECTION_NOTE[s.section];
                return (
                  <tr key={s.section} className="border-t border-gray-100 align-top">
                    <td className={td}>
                      {special ? (
                        <span className="text-gray-700">{special[lang]}</span>
                      ) : (
                        <>
                          <code className="text-gray-900">{s.section}</code>
                          {note && <div className="text-xs text-gray-500">{note[lang]}</div>}
                        </>
                      )}
                    </td>
                    <td className={`${td} text-right tabular-nums text-gray-900`}>{fmt(s.ai_requests)}</td>
                    <td className={`${td} pt-3.5`}>
                      <InlineBar value={s.ai_requests} max={maxSection} color="#2a78d6" />
                    </td>
                    <td className={`${td} text-right tabular-nums text-gray-700`}>{fmt(s.requests)}</td>
                    <td className={`${td} text-right tabular-nums text-gray-700`}>{share(s.ai_status.status_4xx, s.ai_requests)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {t(
            lang,
            "Query strings are dropped before counting. The prompt-library 404s were old detail URLs; since Nov 25 they redirect (301) to the library page.",
            "计数前去掉了问号后面的参数。提示词库的 404 是旧的详情页地址，11 月 25 日起改成 301 跳到列表页。"
          )}
        </p>
      </section>

      {/* 给机器读的文件 */}
      <section className="mb-12">
        <h2 className={h2}>{t(lang, "robots.txt, sitemap.xml and llms.txt", "robots.txt、sitemap.xml 和 llms.txt")}</h2>
        <p className={`${p} mb-4`}>
          {(() => {
            const robots = stats.machine_files.find((f) => f.file === "/robots.txt");
            const llms = stats.machine_files.find((f) => f.file === "/llms.txt");
            if (!robots || !llms) return null;
            return isEn
              ? `Files written for machines, and who asked for them. robots.txt was requested ${fmt(robots.requests)} times; llms.txt ${fmt(llms.requests)} times, ${fmt(llms.ai_requests)} of them by AI crawlers.`
              : `专门写给机器的文件，以及谁来要过。robots.txt 被请求 ${fmt(robots.requests)} 次；llms.txt ${fmt(llms.requests)} 次，其中 AI 爬虫 ${fmt(llms.ai_requests)} 次。`;
          })()}
        </p>
        <div className="relative overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left whitespace-nowrap">
              <tr>
                <th className={th}>{t(lang, "File", "文件")}</th>
                <th className={th}>{t(lang, "On this site", "本站有吗")}</th>
                <th className={`${th} text-right`}>{t(lang, "All crawlers", "全部爬虫")}</th>
                <th className={`${th} text-right`}>{t(lang, "AI crawlers", "AI 爬虫")}</th>
                <th className={th}>{t(lang, "Most requests from", "请求最多的")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.machine_files.map((f) => (
                <tr key={f.file} className="border-t border-gray-100 align-top">
                  <td className={td}>
                    <code className="text-gray-900 break-all">{f.file}</code>
                  </td>
                  <td className={`${td} whitespace-nowrap text-gray-700`}>
                    {f.status_2xx > 0 ? t(lang, "Yes", "有") : t(lang, "No (404)", "没有（404）")}
                  </td>
                  <td className={`${td} text-right tabular-nums text-gray-900`}>{fmt(f.requests)}</td>
                  <td className={`${td} text-right tabular-nums text-gray-700`}>{fmt(f.ai_requests)}</td>
                  <td className={`${td} text-xs text-gray-600`}>
                    {f.by_bot
                      .slice(0, 4)
                      .map(([bot, n]) => `${botName(bot, lang)} ${fmt(n)}`)
                      .join(" · ") || "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 引用 */}
      <section className="mb-12">
        <h2 className={h2}>{t(lang, "Do AI answers cite the site?", "AI 回答引用本站吗")}</h2>
        <p className={`${p} mb-4`}>
          {isEn
            ? "Every week the same questions go to ChatGPT, Gemini App, Google AI Mode and Perplexity, three times each, and to Claude once a month. An answer counts if it cites any jasonzhu.ai page. The three answers to one question are nearly identical, so the 95% intervals are computed per question, and differences only count when intervals don't overlap."
            : "每周把同一批问题问 ChatGPT、Gemini App、Google AI Mode 和 Perplexity 各 3 次，Claude 每月 1 次；回答引用了 jasonzhu.ai 任何一页就算。同一题的 3 个回答几乎一样，所以 95% 区间按题算；区间重叠的差别不算数。"}
        </p>

        <h3 className={h3}>
          {isEn
            ? `Latest run, ${fmtDay(run.date, "en")}: questions that name the site vs. questions that don't`
            : `最近一次（${fmtDay(run.date, "zh")}）：问题提到本站 vs. 不提本站`}
        </h3>
        <div className="relative overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className={th}>AI</th>
                <th className={th}>{t(lang, "How it was asked", "怎么问的")}</th>
                <th className={th}>
                  {isEn ? `Names the site (${run.brand_questions} questions)` : `提到本站（${run.brand_questions} 题）`}
                </th>
                <th className={th}>
                  {isEn ? `Doesn't name it (${run.unbranded_questions} questions)` : `不提本站（${run.unbranded_questions} 题）`}
                </th>
              </tr>
            </thead>
            <tbody>
              {run.engines.map((e) => (
                <tr key={e.engine} className="border-t border-gray-100 align-top">
                  <td className={`${td} font-medium text-gray-900 whitespace-nowrap`}>{e.label}</td>
                  <td className={`${td} text-xs text-gray-500`}>
                    {isEn ? e.surface : SURFACE_ZH[e.surface] ?? e.surface}
                    {e.model ? ` · ${e.model}` : ""}
                  </td>
                  <td className={td}>
                    <CellText cell={e.branded} lang={lang} />
                  </td>
                  <td className={td}>
                    <CellText cell={e.unbranded} lang={lang} />
                    {e.unbranded && (
                      <div className="mt-1.5 max-w-[220px]">
                        <CiBar cell={e.unbranded} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className={h3}>
          {isEn
            ? `The fixed set over time (${fixedQuestions} questions, ${run.brand_questions} of them name the site)`
            : `固定题组的变化（${fixedQuestions} 题，其中 ${run.brand_questions} 题提到本站）`}
        </h3>
        <div className="relative overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left whitespace-nowrap">
              <tr>
                <th className={th}>AI</th>
                <th className={th}>{t(lang, "Run", "日期")}</th>
                <th className={th}>{t(lang, "Answers citing the site", "引用本站的回答")}</th>
                <th className={`${th} w-1/3`}>
                  <span className="sr-only">{t(lang, "Rate and interval", "比例和区间")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.citations.engines.map((label) =>
                runs
                  .map((r) => ({ r, e: engineIn(r, label) }))
                  .filter(({ e }) => e?.sets.frozen?.site_cited)
                  .map(({ r, e }, i) => (
                    <tr key={`${label}-${r.date}`} className={i === 0 ? "border-t border-gray-200" : "border-t border-gray-50"}>
                      <td className={`${td} font-medium text-gray-900 whitespace-nowrap`}>{i === 0 ? label : ""}</td>
                      <td className={`${td} whitespace-nowrap text-gray-700`}>
                        {fmtDay(r.date, lang, false)}
                        {r.baseline ? t(lang, " (baseline, 1 answer each)", "（基线，每题 1 次）") : ""}
                      </td>
                      <td className={td}>
                        <CellText cell={e!.sets.frozen!.site_cited} lang={lang} />
                      </td>
                      <td className={`${td} pt-3`}>
                        <CiBar cell={e!.sets.frozen!.site_cited!} />
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {t(
            lang,
            "Dot = share of valid answers citing the site; band = 95% interval. Google AI Mode was not in the baseline; Claude is asked once a month.",
            "圆点 = 引用本站的有效回答占比；色带 = 95% 区间。基线没测 Google AI Mode；Claude 每月问一次。"
          )}
        </p>

        {withReferrals.length > 0 && (
          <>
            <h3 className={h3}>{t(lang, "Visits AI assistants sent vs. pages they fetched", "AI 带来的访问 vs. AI 替用户读的页")}</h3>
            <p className={`${p} mb-3`}>
              {t(
                lang,
                "Visits are GA4 sessions referred by each assistant in the 7 days before a panel run. Fetches are that company's user-triggered crawler requests (ChatGPT-User, Claude-User, Perplexity-User) on the same days, UTC.",
                "访问 = 面板运行前 7 天 GA4 里由各家 AI 带来的会话；读页 = 同样几天（UTC）这家公司「用户触发」爬虫的请求（ChatGPT-User、Claude-User、Perplexity-User）。"
              )}
            </p>
            <div className="relative overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left whitespace-nowrap">
                  <tr>
                    <th className={th}>{t(lang, "7 days", "7 天")}</th>
                    <th className={th}>{t(lang, "Assistant", "AI 助手")}</th>
                    <th className={`${th} text-right`}>{t(lang, "Visits (GA4)", "访问（GA4）")}</th>
                    <th className={`${th} text-right`}>{t(lang, "Pages fetched (logs)", "读页（日志）")}</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {withReferrals.map((r) => {
                    const ref = r.ai_referrals!;
                    const rows: [string, string][] = [
                      ["ChatGPT", "OpenAI"],
                      ["Claude", "Anthropic"],
                      ["Perplexity", "Perplexity"],
                    ];
                    return rows.map(([assistant, vendor], i) => (
                      <tr key={`${r.date}-${assistant}`} className={i === 0 ? "border-t border-gray-200" : "border-t border-gray-50"}>
                        <td className={`${td} whitespace-nowrap text-gray-700`}>
                          {i === 0 ? `${fmtDay(ref.window_first_day, lang, false)} – ${fmtDay(ref.window_last_day, lang, false)}` : ""}
                        </td>
                        <td className={`${td} text-gray-900`}>{assistant}</td>
                        <td className={`${td} text-right`}>{fmt(ref.by_assistant.find(([a]) => a === assistant)?.[1] ?? 0)}</td>
                        <td className={`${td} text-right`}>
                          {ref.user_triggered_fetches ? fmt(ref.user_triggered_fetches[vendor] ?? 0) : "–"}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {t(
                lang,
                "GA4 only counts visitors who allow analytics (in the EEA, the UK and Switzerland only after accepting cookies), and some fetches come from our own panel, so compare orders of magnitude, not exact ratios.",
                "GA4 只算允许统计的访客（欧洲经济区、英国、瑞士要先点同意），部分读页是面板自己触发的，所以只比数量级，不算精确比例。"
              )}
            </p>
          </>
        )}
      </section>

      {/* 方法 */}
      <section className="mb-12">
        <h2 className={h2}>{t(lang, "Methodology", "方法")}</h2>

        <h3 className={h3}>{t(lang, "Where the data comes from", "数据从哪来")}</h3>
        <p className={p}>
          {isEn
            ? `Vercel streams the site's production request logs (pages, files, redirects and firewall events) through a log drain. A relay keeps only requests whose user agent looks automated and loads them into a self-hosted copy of GEOInflow, a crawler log analyzer that names the crawler and its operator and checks the IP address. This page and the downloads are daily and monthly counts from that table, in UTC. Logging began on ${fmtDay(coverage.first_day, "en")} at ${coverage.first_request_utc.slice(11)} UTC, so that day and that month are partial.`
            : `网站生产环境的请求日志（页面、文件、跳转、防火墙事件）由 Vercel 的日志转发（Log Drain）推出，中转只留 User-Agent 像自动程序的请求，存进本机自建的 GEOInflow（爬虫日志分析工具）：它认出是哪个爬虫、哪家公司的，并核对 IP。本页和下载文件是这张表按天、按月的计数，时间一律 UTC。日志从 ${fmtDay(coverage.first_day, "zh")} ${coverage.first_request_utc.slice(11)}（UTC）开始记，所以那一天和那个月都不完整。`}
        </p>

        <h3 className={h3}>{t(lang, "How crawlers are classified", "爬虫怎么分类")}</h3>
        <p className={`${p} mb-2`}>
          {t(
            lang,
            "Each request is matched to a crawler by its user agent and grouped by what the operator says the crawler is for. On this page, AI crawlers means the first three groups.",
            "按 User-Agent 认出是哪个爬虫，再按这家公司自己说的用途分组。本页说的「AI 爬虫」是前三组。"
          )}
        </p>
        <ul className={`${p} list-disc pl-5 space-y-1`}>
          <li>
            <strong>{TYPE_LABEL.ai_search[lang]}</strong>
            {t(lang, ": builds the index an AI answer engine searches (", "：给 AI 回答引擎建搜索索引（")}
            {byTypeBots("ai_search").join(", ")}
            {t(lang, ").", "）。")}
          </li>
          <li>
            <strong>{TYPE_LABEL.training[lang]}</strong>
            {t(lang, ": collects data for model training (", "：给模型训练收集数据（")}
            {byTypeBots("training").join(", ")}
            {t(lang, ").", "）。")}
          </li>
          <li>
            <strong>{TYPE_LABEL.user_triggered[lang]}</strong>
            {t(lang, ": fetches a page while an assistant answers a person (", "：AI 助手回答某个人的问题时现场读页（")}
            {byTypeBots("user_triggered").join(", ")}
            {t(lang, ").", "）。")}
          </li>
          <li>
            {isEn
              ? `Search engines (${byTypeBots("search_engine").slice(0, 4).join(", ")} …) and other crawlers are in the totals and the CSV: SEO tools, Common Crawl's CCBot (grouped as other even though its archive is widely used to train models) and ${fmt(unmapped?.requests ?? 0)} requests from automated user agents not mapped to any operator.`
              : `传统搜索引擎（${byTypeBots("search_engine").slice(0, 4).join("、")} 等）和其他爬虫算在总数和 CSV 里：SEO 工具、Common Crawl 的 CCBot（归在其他，虽然它的存档常被拿去训练模型），以及 ${fmt(unmapped?.requests ?? 0)} 次认不出是哪家的自动访问。`}
          </li>
        </ul>

        <h3 className={h3}>{t(lang, "How requests are verified", "怎么核实身份")}</h3>
        <p className={p}>
          {isEn
            ? `A user agent is a label anyone can send. For crawlers whose operators publish IP ranges, the request's IP is checked against the published list: inside means verified, outside means the label is doubtful. The rest stay unverified: operators that publish no list the tool uses (${listJoin(noListVendors, "en")}); requests checked while our copy of the list was more than 7 days old (${staleText}), a gap on our side rather than a sign of fakes; and unmapped agents. So ${share(verified, ai)} verified is a floor for genuine AI crawler traffic, not an estimate of spoofing.`
            : `User-Agent 谁都能填。公布了 IP 段的公司，就拿请求的 IP 去对：在段里算核验通过，不在段里说明这个名字可疑。其余都算没核验：没有公布 IP 段（或工具没接入）的（${listJoin(noListVendors, "zh")}）；核验时我们手里那份 IP 段已超过 7 天没更新的（${staleText}），这是我们这边的缺口，不说明是冒充的；以及认不出是哪家的。所以 ${share(verified, ai)} 是真 AI 爬虫流量的下限，不是冒充比例的估计。`}
        </p>

        <h3 className={h3}>{t(lang, "Limits", "局限")}</h3>
        <ul className={`${p} list-disc pl-5 space-y-1.5`}>
          <li>
            {isEn
              ? `One site. jasonzhu.ai is a bilingual (Chinese and English) indie blog with large prompt libraries${prompts ? `, which drew ${share(prompts.ai_requests, ai)} of AI crawler requests` : ""}. Other sites will see a different mix.`
              : `只有一个站。jasonzhu.ai 是中英双语的独立博客，提示词库很大${prompts ? `，占了 AI 爬虫请求的 ${share(prompts.ai_requests, ai)}` : ""}。别的网站的构成会不一样。`}
          </li>
          <li>
            {t(
              lang,
              "User agents can be faked; only the verified share is certain. Agents that browse with an ordinary browser user agent (some AI browsers and agent modes) can't be told apart from people and are not counted.",
              "User-Agent 可以冒充，只有核验通过的部分是确定的。用普通浏览器 User-Agent 上网的 AI（一些 AI 浏览器和代理模式）和真人分不开，不在这份数据里。"
            )}
          </li>
          {pdays && pdays.days.length > 0 && (
            <li>
              {isEn
                ? `Some user-triggered fetches are ours: the weekly panel and manual tests make assistants read the site. ChatGPT-User made ${listJoin(pdays.days.map((d) => `${fmt(Number(d["ChatGPT-User"]))} requests on ${fmtDay(d.date, "en", false)}`), "en")} (panel days), against a median of ${fmt(pdays.median_other_days["ChatGPT-User"])} on other days.`
                : `有一部分「用户触发」是我们自己：每周的面板和手动测试会让 AI 来读本站。面板那几天 ChatGPT-User 的请求是 ${pdays.days.map((d) => `${fmtDay(d.date, "zh", false)} ${fmt(Number(d["ChatGPT-User"]))} 次`).join("、")}，其余日子的中位数是 ${fmt(pdays.median_other_days["ChatGPT-User"])} 次。`}
            </li>
          )}
          {!perplexityUser && (
            <li>
              {t(
                lang,
                "Perplexity-User, Perplexity's agent for user requests, never appeared in the logs; every Perplexity request carried the PerplexityBot user agent.",
                "Perplexity 替用户读页的 Perplexity-User 一次都没出现过；Perplexity 的请求全部是 PerplexityBot。"
              )}
            </li>
          )}
          <li>
            {isEn
              ? `The answer panel asks about this site's own topics; ${run.brand_questions} of the ${fixedQuestions} fixed questions name the site. ChatGPT and Gemini App are read from the logged-out web interface (US English), Google AI Mode from the search results page, Perplexity and Claude through their APIs, which can differ from what signed-in users see.`
              : `面板问的是本站自己的题目，${fixedQuestions} 道固定题里有 ${run.brand_questions} 道提到本站。ChatGPT、Gemini App 抓的是未登录的网页界面（美国英文），Google AI Mode 抓搜索结果页，Perplexity 和 Claude 走 API，和登录用户看到的可能不一样。`}
          </li>
          <li>
            {t(
              lang,
              "October and the current month are partial. Days are UTC, so a day here starts at 8 a.m. Beijing time.",
              "10 月和当月都不完整。按 UTC 日计，这里的一天从北京时间早上 8 点开始。"
            )}
          </li>
        </ul>
      </section>

      {/* 下载 */}
      <section className="mb-12">
        <h2 className={h2}>{t(lang, "Download", "下载")}</h2>
        <ul className="space-y-2 text-sm">
          {stats.downloads.map((d) => (
            <li key={d.file} className="flex flex-wrap items-baseline gap-x-2">
              <a href={d.url} className="font-medium text-blue-700 hover:underline break-all">
                {d.file}
              </a>
              <span className="text-gray-500">
                {d.format === "text/csv"
                  ? isEn
                    ? `${fmtMonth(d.month, "en")}${d.partial ? " (partial)" : ""} · ${fmt(d.rows)} rows · ${fmtBytes(d.bytes)}`
                    : `${fmtMonth(d.month, "zh")}${d.partial ? "（不完整）" : ""} · ${fmt(d.rows)} 行 · ${fmtBytes(d.bytes)}`
                  : t(lang, "every aggregate on this page, definitions and the changelog", "本页全部汇总数、字段定义和更新记录")}
              </span>
            </li>
          ))}
        </ul>
        <p className={`${p} mt-4`}>
          {t(
            lang,
            "Each CSV has one row per UTC day and crawler: date, day_coverage (full or partial), vendor, bot, bot_type, requests, six verification columns and five status-class columns. The verification columns add up to requests, and so do the status columns.",
            "每份 CSV 一行是一天 × 一个爬虫：date、day_coverage（full 或 partial）、vendor、bot、bot_type、requests，六列核验结果和五列状态码分类。核验各列加起来等于 requests，状态码各列也是。"
          )}
        </p>
        <p className={`${p} mt-2`}>
          {t(
            lang,
            "Never published: IP addresses, user agent strings, locations, single log rows or timestamps, full URLs or query strings, AI answer text, search queries and other websites' URLs.",
            "不公开：IP、User-Agent 原文、地理位置、单条日志和精确时间、完整网址和查询参数、AI 回答原文、搜索词、别的网站的网址。"
          )}
        </p>
      </section>

      {/* 引用方式 */}
      <section className="mb-12">
        <h2 className={h2}>{t(lang, "How to cite", "怎么引用")}</h2>
        <p className={`${p} mb-3`}>
          {t(lang, "Free to share and adapt, including commercially, with credit, under ", "可以自由转载、改编（包括商用），注明出处即可，许可证 ")}
          <a href={stats.license_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
            CC BY 4.0
          </a>
          {t(lang, ". Please link to this page.", "。请链接到本页。")}
        </p>
        <pre className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap break-words font-mono">
          {citation}
        </pre>
        <details className="mt-2 text-xs text-gray-600">
          <summary className="cursor-pointer font-medium text-gray-700 hover:text-blue-700">BibTeX</summary>
          <pre className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200 overflow-x-auto font-mono text-[11px] leading-relaxed text-gray-800">
            {bibtex}
          </pre>
        </details>
        <p className={`${p} mt-3`}>
          {t(lang, "Questions or corrections: ", "有疑问或发现错误：")}
          <Link href={`/${lang}/contact`} className="text-blue-700 hover:underline">
            {t(lang, "contact page", "联系页")}
          </Link>
          {t(lang, ".", "。")}
        </p>
      </section>

      {/* 更新 */}
      <section className="mb-12">
        <h2 className={h2}>{t(lang, "Update cadence", "更新频率")}</h2>
        <p className={p}>
          {isEn
            ? `Monthly, in the first days of each month, covering the previous month in full. Next update: early ${fmtMonth(nextMonth, "en")}. Monthly files keep their address; the JSON always holds the latest version.`
            : `每月一次，在月初，补齐上个月的完整数据。下次更新：${fmtMonth(nextMonth, "zh")}初。每月的文件地址不变，JSON 始终是最新版本。`}
        </p>
      </section>

      <section className="mb-4">
        <h2 className={h2}>{t(lang, "Changelog", "更新记录")}</h2>
        <ul className="space-y-1.5 text-sm text-gray-600">
          {stats.changelog.map((c) => (
            <li key={c.date}>
              <span className="font-mono text-gray-800 mr-2">{c.date}</span>
              {isEn ? c.en : c.zh}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
