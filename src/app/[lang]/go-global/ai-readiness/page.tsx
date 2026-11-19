import type { Metadata } from "next";
import Link from "@/components/Link";
import { GO_GLOBAL } from "@/lib/go-global";
import { withSocialCards } from "@/lib/social";
import GoGlobalBreadcrumb from "../Breadcrumb";
import Community from "../Community";
import AiReadinessClinic from "./AiReadinessClinic";

const SITE_URL = "https://jasonzhu.ai";
const PATH = "/go-global/ai-readiness";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  const lang = isZh ? "zh" : "en";
  return withSocialCards(
    {
      title: isZh
        ? "AI 网站急诊室 & 第 1 课 7 关通关小游戏：测测你的网站能不能被 ChatGPT 和 Google AI 搜到（100 分制）"
        : "AI Website Clinic & Course 1 Game: 100-Point AI Readiness & GEO Visibility Checker",
      description: isZh
        ? "免费挂号体检你的独立站：按 7 大关卡、26 项真实 HTTP 指标（Crawl Permission、无 JS 可读性、Sitemap、JSON-LD、商业信任、llms.txt 与 WebMCP）打出 0-100 分和 A-F 等级，并一键生成 Cursor / Claude Code 修复药方 Prompt。"
        : "Free live diagnosis across 7 levels and 26 checks (100 points total): robots.txt, Content-Signal, zero-JS readability, JSON-LD, commercial trust, llms.txt, Markdown negotiation, WebMCP, and MCP Server Card.",
      alternates: {
        canonical: `${SITE_URL}/${lang}${PATH}`,
        languages: {
          zh: `${SITE_URL}/zh${PATH}`,
          en: `${SITE_URL}/en${PATH}`,
          "x-default": `${SITE_URL}/zh${PATH}`,
        },
      },
    },
    rawLang
  );
}

export default async function AiReadinessPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang: "zh" | "en" = rawLang === "en" ? "en" : "zh";
  const isZh = lang === "zh";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: isZh
          ? "AI 网站急诊室 & 第 1 课 7 关通关小游戏"
          : "AI Website Clinic & 7-Level Readiness Game",
        url: `${SITE_URL}/${lang}${PATH}`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: isZh
          ? "100 分制、7 大关卡、26 项真实 HTTP 检测，诊断你的网站能否被 Google、ChatGPT、Claude、Perplexity 抓取、读懂并调用。"
          : "100-point, 7-level, 26-check live diagnostic clinic for AI search visibility and WebMCP agent readiness.",
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GoGlobalBreadcrumb
        lang={lang}
        here={isZh ? "AI 网站急诊室（第 1 课闯关游戏）" : "AI Website Clinic (Course 1 Game)"}
        path="/ai-readiness"
      />

      {/* 页面主标题区 */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
            {isZh ? "SEO / GEO 实战第 1 课" : "SEO / GEO Course 1"}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            {isZh ? "免费网站医院 × 7 关通关游戏" : "Free AI Website Clinic × 7-Level Game"}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {isZh ? "支持 Cursor / Claude Code 一键处方修复" : "One-Click Cursor & Claude Code Prescriptions"}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
          {isZh
            ? "AI 网站急诊室：闯过这 7 关，让 ChatGPT 和 Google 先看懂你的网站"
            : "AI Website Clinic: Clear 7 Levels So ChatGPT & Google Can Read and Call Your Site"}
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-3xl">
          {isZh
            ? "很多独立开发者一上来就到处发外链、堆关键词，结果连「第 1 课：技术底座与 AI 抓取渲染」都没及格——要么被 WAF 拦在门外，要么关掉 JS 只剩白纸，更没有 JSON-LD、/llms.txt 和 WebMCP。在下方输入你的域名免费挂号体检（或切换到 7 关闯关模拟器动手练习），3 秒生成 100 分制临床报告与一键修复药方。"
            : "Before chasing backlinks or keywords, your site must pass Course 1: Technical Crawlability & Agent Protocols. Enter your domain below for a free 26-check live diagnosis (or switch to the 7-Level Simulator) to get your 0–100 score, A–F grade, and copy-paste Cursor / Claude Code fix prompts."}
        </p>
      </header>

      <AiReadinessClinic lang={lang} />

      {/* ═══════════════════════════════════════════════════════════════════════
          从第 1 课毕业后的进阶路线图（衔接第 2、3、4 课）
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-blue-50/40 p-6 md:p-8 shadow-2xs">
        <div className="max-w-3xl mb-6">
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold mb-2">
            {isZh ? "四门课完整通关路线图" : "4-Course Mastery Roadmap"}
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">
            {isZh
              ? "🎓 第 1 课拿到 90+ 分（Grade A）毕业后，接下来修哪三门课？"
              : "🎓 Graduated Course 1 with Grade A? Continue to Courses 2, 3 & 4"}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isZh
              ? "在这间急诊室拿到 95+ 分（Grade A），证明你的网站已经做到了「能被搜索引擎和 AI 爬虫无障碍抓取、读懂结构并作为工具调用」（第 1 课满分毕业）。但「能被读到 ≠ 会被优先推荐」，想在高商业意图提问里拿下排名前三，请依次打通全套四门课："
              : "Scoring 95+ (Grade A) means AI engines can crawl, parse, and invoke your site without friction. To actually rank and get recommended in commercial prompts, complete all 4 courses:"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* 第 1 课 */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-emerald-400 bg-emerald-50/30 p-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  {isZh ? "第 1 课 · 当前页" : "Course 1 · Here"}
                </span>
                <span className="text-xs font-bold text-emerald-700">100 Pts</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">
                {isZh ? "技术底座与 AI 抓取渲染" : "Technical Foundation & Agent Protocols"}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isZh
                  ? "打通 Google 3 步流水线（Crawling → Rendering → Indexing）+ 7 关 26 项 AI 就绪度（Content-Signal、无 JS 直出、JSON-LD、llms.txt、WebMCP、Server Card）。"
                  : "Master the 7-level / 26-check AI Readiness rubric: zero-JS rendering, JSON-LD, llms.txt, Markdown negotiation, WebMCP, and MCP Server Card."}
              </p>
            </div>
            <p className="mt-4 pt-3 border-t border-emerald-200/70 text-xs font-bold text-emerald-800">
              {isZh ? "✓ 在上方急诊室测到 85+ 分即毕业" : "✓ Score 85+ above to graduate"}
            </p>
          </div>

          {/* 第 2 课 */}
          <Link
            href={`/${lang}${GO_GLOBAL}#seo-schools-map`}
            className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  {isZh ? "第 2 课" : "Course 2"}
                </span>
                <span className="text-xs font-semibold text-blue-600">Koray & Suski</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">
                {isZh ? "实体语义与话题地图 (E-A-V)" : "Entity Semantics & Topical Map"}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isZh
                  ? "用「实体-属性-值（E-A-V）」构建话题权威地图；所有核心页严格执行「首段前 50 词 BLUF 直接给结论 + 30 格参数对比表」（5000 万条 AI 回答实证）。"
                  : "Build Topical Authority with E-A-V tables, 50-word BLUF leads, and 30-cell comparison matrices backed by 50M AI answers."}
              </p>
            </div>
            <p className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-blue-600">
              {isZh ? "查看六大流派坐标地图 →" : "View 6-School Map →"}
            </p>
          </Link>

          {/* 第 3 课 */}
          <Link
            href={`/${lang}/sitemap-html`}
            className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  {isZh ? "第 3 课" : "Course 3"}
                </span>
                <span className="text-xs font-semibold text-indigo-600">Eli Schwartz</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">
                {isZh ? "Product-Led 搜索体验与内链" : "Product-Led SEO & Mesh Linking"}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isZh
                  ? "像本急诊室和收款选择器一样「把产品做成内容」；用西南航空网格内链（HTML Sitemap 距首页 ≤2 次点击）+ 开心乐园餐原则砍掉低质模板页。"
                  : "Build interactive tools as content, flatten crawl depth to ≤2 clicks via HTML Sitemap mesh linking, and prune thin pages."}
              </p>
            </div>
            <p className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-indigo-600">
              {isZh ? "查看全站网格目录示范 →" : "View HTML Sitemap Demo →"}
            </p>
          </Link>

          {/* 第 4 课 */}
          <Link
            href={`/${lang}/backlink-spam-list`}
            className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  {isZh ? "第 4 课" : "Course 4"}
                </span>
                <span className="text-xs font-semibold text-purple-600">backlink-guard</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">
                {isZh ? "站外共识与边际覆盖度 PR" : "Off-Site Consensus & Marginal PR"}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isZh
                  ? "告别 Fiverr 垃圾外链农场！用 Greedy Set Cover（贪心集合覆盖算法）找出 AI 联网搜索已高频引用的 Top 5 第三方对比榜单占座，并用 backlink-guard 验毒。"
                  : "Target the top 5 third-party listicles already cited by AI search using Greedy Set Cover, and filter toxic link farms with backlink-guard."}
              </p>
            </div>
            <p className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-purple-600">
              {isZh ? "查看垃圾外链黑名单库 →" : "View Backlink Spam List →"}
            </p>
          </Link>
        </div>
      </section>

      <div className="mt-10">
        <Community lang={lang} />
      </div>
    </div>
  );
}
