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

      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-blue-600 mb-2">
          {isZh
            ? "SEO / GEO 实战第一课 · 免费网站医院 × 7 关通关小游戏"
            : "SEO / GEO Course 1 · Free AI Website Clinic & 7-Level Game"}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {isZh
            ? "AI 网站急诊室：闯过这 7 关，让 ChatGPT 和 Google 先看懂你的网站"
            : "AI Website Clinic: Clear 7 Levels So ChatGPT & Google Can Read and Call Your Site"}
        </h1>
        <p className="text-gray-600 leading-relaxed">
          {isZh
            ? "很多独立开发者一上来就到处发外链、堆关键词，结果连「第 1 课：技术底座与 AI 抓取渲染」都没及格——要么被 WAF 拦在门外，要么关掉 JS 只剩白纸，更没有 JSON-LD、/llms.txt 和 WebMCP。输入你的域名免费挂号体检（或打开闯关模拟器），我们会按 7 大关卡 26 项指标给你打分（0~100 分，A~F 等级），并直接开出喂给 Cursor / Claude Code 的一键修复处方。"
            : "Before chasing backlinks or keywords, your site must pass Course 1: Technical Crawlability & Agent Protocols. Run a free 26-check diagnosis on your domain (or play the 7-level simulator) to get a 0–100 score, letter grade (A–F), and copy-paste Cursor / Claude Code fix prompts."}
        </p>
      </header>

      <AiReadinessClinic lang={lang} />

      {/* ═══════════════════════════════════════════════════════════════════════
          从第 1 课毕业后的进阶路线图（衔接第 2、3、4 课）
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mt-10 rounded-3xl border border-gray-200 bg-gray-100/60 p-5 md:p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isZh
            ? "🎓 第 1 课拿到 90+ 分（Grade A）毕业后，接下来修哪三门课？"
            : "🎓 Graduated Course 1 with Grade A? Here Are Courses 2, 3 & 4"}
        </h2>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {isZh
            ? "请记住：在这间急诊室拿到 95+ 分（Grade A），证明你的网站已经做到了「能被搜索引擎和 AI 爬虫丝滑抓取、读懂结构并作为工具调用」（第 1 课满分毕业）。但「能被读到 ≠ 会被优先推荐」，想在高商业意图提问里拿下排名前三，请继续打通后面三课："
            : "Scoring 95+ (Grade A) means AI engines can crawl, parse, and invoke your site without friction. To actually rank and get recommended in commercial prompts, continue with Courses 2, 3, and 4:"}
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold mb-2">
              {isZh ? "第 1 课（当前本页）· 已就绪" : "Course 1 (This Page)"}
            </span>
            <p className="font-bold text-gray-900 text-sm mb-1">
              {isZh ? "技术底座与 AI 抓取渲染" : "Technical Foundation & Agent Protocols"}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isZh
                ? "打通 Google 3 步流水线（Crawling → Rendering → Indexing）+ 7 关 26 项 AI 就绪度（Content-Signal、无 JS 直出、JSON-LD、llms.txt、WebMCP、Server Card）。"
                : "Master the 7-level / 26-check AI Readiness rubric: zero-JS rendering, JSON-LD, llms.txt, Markdown negotiation, WebMCP, and MCP Server Card."}
            </p>
          </div>

          <Link
            href={`/${lang}${GO_GLOBAL}#seo-schools-map`}
            className="block rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
          >
            <span className="inline-block rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-bold mb-2">
              {isZh ? "第 2 课 & 第 3 课 →" : "Courses 2 & 3 →"}
            </span>
            <p className="font-bold text-gray-900 text-sm mb-1">
              {isZh
                ? "实体语义话题地图 + Product-Led 搜索体验"
                : "Semantic Topical Map & Product-Led SEO"}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isZh
                ? "Koray 的「实体-属性-值（E-A-V）」表格 + Suski 5000 万条 AI 回答验证的「首段前 50 词 BLUF 直接给结论 + 30 格对比表」+ Eli Schwartz 的西南航空网格内链与抓取预算管理。"
                : "Koray's E-A-V semantic tables, Suski's 50-word BLUF lead & 30-cell comparison matrix, and Eli Schwartz's Southwest mesh internal linking."}
            </p>
          </Link>

          <Link
            href={`/${lang}/backlink-spam-list`}
            className="block rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
          >
            <span className="inline-block rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-bold mb-2">
              {isZh ? "第 4 课 →" : "Course 4 →"}
            </span>
            <p className="font-bold text-gray-900 text-sm mb-1">
              {isZh
                ? "站外共识与边际覆盖度 PR（backlink-guard）"
                : "Off-Site Consensus & Marginal Coverage PR"}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isZh
                ? "告别垃圾外链农场！用 Greedy Set Cover（贪心集合覆盖算法）找出 AI 联网搜索已经高频引用的 Top 5 第三方对比榜单，并用 backlink-guard 过滤毒外链。"
                : "Use Greedy Set Cover to target the top 5 third-party listicles already cited by AI engines, and filter toxic link farms with backlink-guard."}
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
