import type { Metadata } from "next";
import Link from "@/components/Link";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { findWork, PERSON_REF, workNode } from "@/lib/profiles";
import { withSocialCards } from "@/lib/social";
import ToolsClient from "./ToolsClient";

const SITE_URL = "https://jasonzhu.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  return withSocialCards(
    {
      title: dict.tools.title,
      description: dict.tools.desc,
      alternates: {
        canonical: `${SITE_URL}/${lang}/tools`,
        languages: {
          zh: `${SITE_URL}/zh/tools`,
          en: `${SITE_URL}/en/tools`,
          "x-default": `${SITE_URL}/en/tools`,
        },
      },
    },
    rawLang
  );
}

interface SelfBuiltTool {
  id: string;
  workId: string;
  name: { zh: string; en: string };
  badge: { zh: string; en: string };
  tagline: { zh: string; en: string };
  useCase: { zh: string; en: string };
  installCmd?: string;
  livePath?: string;
  liveLabel?: { zh: string; en: string };
  githubUrl: string;
  pypiUrl?: string;
}

const SELF_BUILT_TOOLS: SelfBuiltTool[] = [
  {
    id: "new-term-radar",
    workId: "https://github.com/zhuyansen/new-term-radar",
    name: { zh: "new-term-radar", en: "new-term-radar" },
    badge: { zh: "选品找新词 · CLI / Skill / MCP", en: "New-Term Radar · CLI / Skill / MCP" },
    tagline: {
      zh: "每天扫描 10 路早筛信号（X 实验室、HF、GitHub 爆发仓、90 天内起量新域名、GSC 3d vs 60d 新词、TrustMRR 收入榜、Reddit 求工具帖、8 家收款新卖家等），并用 14 天后 Google Trends 自动复盘命中率。",
      en: "Scans 10 daily early-signal channels (X labs, Hugging Face, GitHub breakouts, <90d rising domains, GSC 3d vs 60d queries, TrustMRR revenue leaders, Reddit tool requests, and 8-gateway new sellers) with 14-day Google Trends hit-rate verification.",
    },
    useCase: {
      zh: "适合：独立站找低竞争爆发新词，在 Ahrefs / Semrush 还没录词前抢先上页。",
      en: "Best for: Spotting breakout AI keywords before Ahrefs/Semrush index them.",
    },
    installCmd: "pip install new-term-radar",
    githubUrl: "https://github.com/zhuyansen/new-term-radar",
    pypiUrl: "https://pypi.org/project/new-term-radar/",
  },
  {
    id: "backlink-guard",
    workId: "https://github.com/zhuyansen/backlink-guard",
    name: { zh: "backlink-guard", en: "backlink-guard" },
    badge: { zh: "外链风控 & AI 引用 · CLI / MCP", en: "Backlink & GEO Audit · CLI / MCP" },
    tagline: {
      zh: "12 个命令打通外链与引用闭环：提交前查站群/卖链/降权（vet）、查 AI 爬虫可读性（ai-access）、扒竞品上线前 90 天首发目录（competitors --early）、挽回带外链 404（lost）及 5 引擎 AI 引用探测（cited / asked --rank）。",
      en: "12 CLI/MCP commands: vet PBNs and link sellers before submitting (vet), check AI crawler readability (ai-access), uncover competitors' first-90-day launch directories (competitors --early), recover backlinked 404s (lost), and probe 5-engine AI citations.",
    },
    useCase: {
      zh: "适合：新站冷启动做高质量目录外链，避开 580+ 垃圾站群与假外链坑。",
      en: "Best for: Building clean launch backlinks while avoiding 580+ doorway/link-seller domains.",
    },
    installCmd: "pip install backlink-guard",
    livePath: "/backlink-spam-list",
    liveLabel: { zh: "垃圾外链证据库 →", en: "Backlink Spam List →" },
    githubUrl: "https://github.com/zhuyansen/backlink-guard",
    pypiUrl: "https://pypi.org/project/backlink-guard/",
  },
  {
    id: "payment-guard",
    workId: "https://github.com/zhuyansen/payment-guard",
    name: { zh: "payment-guard", en: "payment-guard" },
    badge: { zh: "海外收款预检 · 在线工具 / CLI", en: "Payment Pre-Check · Web / CLI" },
    tagline: {
      zh: "按你的注册主体（大陆/香港/美国/英国个人或公司）匹配可开户收款平台，并在提交审核前逐条核对 Stripe、Paddle、Creem、Dodo Payments、Waffo 与 PayPal 公开审核清单，降低拒审和封号风险。",
      en: "Matches eligible payment gateways & MoRs by entity type (CN/HK/US/UK individual or company) and checks your site line-by-line against Stripe, Paddle, Creem, Dodo Payments, Waffo, and PayPal published review checklists before you apply.",
    },
    useCase: {
      zh: "适合：独立 SaaS 申请海外收款前自查定价页、退款政策与实体信息。",
      en: "Best for: Passing Stripe/Paddle/Creem/Dodo onboarding on the first try.",
    },
    installCmd: "pip install payment-guard",
    livePath: "/go-global/payments",
    liveLabel: { zh: "在线收款平台选择器 →", en: "Live Payment Picker →" },
    githubUrl: "https://github.com/zhuyansen/payment-guard",
    pypiUrl: "https://pypi.org/project/payment-guard/",
  },
  {
    id: "ai-readiness",
    workId: "https://github.com/zhuyansen/ai-visibility-checker",
    name: { zh: "AI 网站急诊室（ai-visibility-checker）", en: "AI Website Clinic (ai-visibility-checker)" },
    badge: { zh: "GEO 26 项实时体检 · 在线免费", en: "26-Check GEO Clinic · Free Web App" },
    tagline: {
      zh: "服务端实时并发探测 26 项真实 HTTP 指标，拆出「22 项核心基础分（83 分）」与「4 项实验标准（llms.txt / WebMCP / MCP Server Card，17 分）」，并自动生成一键贴进 Cursor / Claude Code 的修复处方。",
      en: "Runs 26 live server-side HTTP probes separating 22 core crawl/SSR/sitemap/schema signals (83 pts) from 4 optional experimental agent standards (17 pts: llms.txt, WebMCP, MCP Server Card), with one-click Cursor / Claude Code fix prompts.",
    },
    useCase: {
      zh: "适合：排查新站为什么不被 Google / ChatGPT / Perplexity 抓取或引用。",
      en: "Best for: Diagnosing why Google, ChatGPT, or Perplexity can't crawl or cite your site.",
    },
    livePath: "/go-global/ai-readiness",
    liveLabel: { zh: "打开 AI 网站急诊室 →", en: "Open AI Website Clinic →" },
    githubUrl: "https://github.com/zhuyansen/ai-visibility-checker",
  },
];

const TOOLS_FAQ = [
  {
    q: {
      zh: "上面 4 个自研出海工具收费吗？数据从哪来？",
      en: "Are Jason's 4 self-built tools free and open source? Where does the data come from?",
    },
    a: {
      zh: "4 个工具全部采用 MIT 协议开源免费，其中 new-term-radar、backlink-guard、payment-guard 可直接通过 pip / GitHub 安装并作为 Agent Skill 或 MCP Server 调用；AI 网站急诊室与收款平台选择器可直接在本站网页免费使用。数据全部来自公开 HTTP 探测、各平台官方文档与实证研究，不收厂商赞助费。",
      en: "All 4 tools are MIT-licensed and free. new-term-radar, backlink-guard, and payment-guard install via PyPI/GitHub and work as CLIs, Agent Skills, or MCP servers; AI Website Clinic and Payment Picker run live in your browser. All data comes from live HTTP probes, official platform docs, and our published empirical studies.",
    },
  },
  {
    q: {
      zh: "下面精选的 40+ 第三方工具是怎么筛选的？有付费软广吗？",
      en: "How are the 40+ curated third-party tools below selected? Are any sponsored?",
    },
    a: {
      zh: "没有付费软广。列表里的工具都是我们在做独立出海产品、GEO/SEO 增长、跨境收款与 AI 工程实战里真实长期在用、且经得起对比的效率工具，按场景分类方便直接查找。",
      en: "No paid placements. Every third-party tool listed below is something we have actively used in shipping indie global products, SEO/GEO growth, cross-border payments, or AI engineering workflows.",
    },
  },
  {
    q: {
      zh: "刚做第一个出海独立站，这 4 个自研工具应该按什么顺序用？",
      en: "In what order should a first-time indie founder use these 4 self-built tools?",
    },
    a: {
      zh: "推荐闭环顺序：① 先用 new-term-radar 找低竞争新词验证选题；② 网站上线当天用 AI 网站急诊室跑一遍 22 项核心抓取/SSR/Schema 体检；③ 接海外收款前用 payment-guard 选平台并预检网站合规项；④ 冷启动做目录与外链时用 backlink-guard 过滤垃圾站并追踪 AI 引用。",
      en: "Recommended sequence: (1) Find low-competition breakout keywords with new-term-radar; (2) Run AI Website Clinic on launch day to clear all 22 core crawl/SSR/schema checks; (3) Use payment-guard before applying for Stripe/Paddle/Creem/Dodo; (4) Use backlink-guard to vet directories and track AI citations.",
    },
  },
  {
    q: {
      zh: "这些工具支持接入 Claude Code、Cursor 或其他 AI Agent 吗？",
      en: "Can these tools be called directly from Claude Code, Cursor, or other AI agents?",
    },
    a: {
      zh: "支持。new-term-radar、backlink-guard 和 payment-guard 均原生提供 CLI + Agent Skill / MCP 接口，可以在 Claude Code / Cursor 里直接让 Agent 自动找新词、查外链站群或预检收款页；AI 网站急诊室网页版则直接输出可一键打开 Cursor 的修复 Prompt。",
      en: "Yes. new-term-radar, backlink-guard, and payment-guard ship as CLIs and Agent Skills / MCP servers for Claude Code and Cursor, while AI Website Clinic generates one-click Cursor and Claude CLI fix prompts.",
    },
  },
];

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const dict = await getDictionary(lang);

  const softwareNodes = SELF_BUILT_TOOLS.map((t) => findWork(t.workId))
    .filter((w): w is NonNullable<typeof w> => Boolean(w))
    .map((w) => workNode(w));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: dict.tools.title,
        description: dict.tools.desc,
        url: `${SITE_URL}/${lang}/tools`,
        author: PERSON_REF,
        hasPart: softwareNodes.map((n) => ({
          "@type": n["@type"],
          "@id": n["@id"],
          name: n.name,
        })),
      },
      ...softwareNodes,
      {
        "@type": "FAQPage",
        mainEntity: TOOLS_FAQ.map((item) => ({
          "@type": "Question",
          name: item.q[lang],
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a[lang],
          },
        })),
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.tools.title}</h1>
        <p className="text-gray-500 max-w-3xl leading-relaxed">{dict.tools.desc}</p>
      </header>

      {/* 自研开源出海工具矩阵（4 个核心开源 / 在线工具） */}
      <section className="mb-14">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <span className="inline-block rounded-full bg-blue-100 text-blue-800 px-3 py-0.5 text-xs font-bold mb-2">
              {isZh ? "开源自研 · MIT License" : "Built by Jason Zhu · MIT Open Source"}
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              {isZh
                ? "我自研的 4 个出海 SEO / GEO & 收款工具"
                : "4 Open-Source Tools I Built for SEO, GEO & Cross-Border Payments"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isZh
                ? "覆盖「找新词 → 网站 GEO 体检 → 海外收款预检 → 外链风控与引用监控」完整闭环，全部免费开源，支持 CLI / Agent Skill / MCP。"
                : "Covering the full indie go-global loop: new-term discovery, live GEO site diagnostics, payment onboarding pre-checks, and backlink/citation auditing."}
            </p>
          </div>
          <a
            href="https://github.com/zhuyansen"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {isZh ? "全部 GitHub 仓库 →" : "All GitHub repos →"}
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SELF_BUILT_TOOLS.map((tool) => (
            <article
              key={tool.id}
              className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-6 flex flex-col justify-between hover:border-blue-300 transition-colors"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <h3 className="text-lg font-bold text-gray-900">{tool.name[lang]}</h3>
                  <span className="rounded-full bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    {tool.badge[lang]}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {tool.tagline[lang]}
                </p>
                <p className="text-xs font-medium text-emerald-800 bg-emerald-50/80 border border-emerald-200/70 rounded-lg px-3 py-2 mb-3">
                  {tool.useCase[lang]}
                </p>
                {tool.installCmd && (
                  <pre className="rounded-lg bg-slate-900 text-slate-100 text-xs font-mono px-3 py-2 mb-4 overflow-x-auto">
                    <code>{tool.installCmd}</code>
                  </pre>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-gray-100 text-sm font-medium">
                {tool.livePath && tool.liveLabel && (
                  <Link
                    href={`/${lang}${tool.livePath}`}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {tool.liveLabel[lang]}
                  </Link>
                )}
                <a
                  href={tool.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-gray-900 hover:underline"
                >
                  GitHub ↗
                </a>
                {tool.pypiUrl && (
                  <a
                    href={tool.pypiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-900 hover:underline"
                  >
                    PyPI ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 精选第三方出海与 AI 工具库 */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isZh ? "实战精选第三方 AI 与出海效率工具" : "Curated Third-Party AI & Indie Hacker Tools"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isZh
            ? "按分类筛选我们在出海研发、内容增长与 AI 工程中长期实测好用的工具。"
            : "Filter by category across tools we actively use for shipping global products, SEO/GEO, and AI workflows."}
        </p>

        <ToolsClient
          tools={dict.tools.items}
          categories={dict.tools.categories}
          lang={lang}
        />
      </section>

      {/* 常见问题 FAQ（与 FAQPage JSON-LD 一致） */}
      <section id="faq" className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {isZh ? "常见问题" : "Frequently Asked Questions"}
        </h2>
        <div className="divide-y divide-gray-200">
          {TOOLS_FAQ.map((item) => (
            <details key={item.q.en} className="group py-4">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-gray-900 text-sm md:text-base">
                <span>{item.q[lang]}</span>
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
              </summary>
              <p className="mt-2.5 text-sm text-gray-600 leading-relaxed pr-6">
                {item.a[lang]}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 上下文内链 */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 md:p-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          {isZh ? "延伸阅读与配套指南" : "Related Guides & Empirical Research"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <Link
            href={`/${lang}/go-global`}
            className="rounded-xl border border-gray-200 bg-white p-3.5 hover:border-blue-300 transition-colors"
          >
            <p className="font-semibold text-gray-900">
              {isZh ? "独立开发出海总指南" : "Go-Global Master Guide"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isZh ? "选品、建站、SEO/GEO、收款与公司注册全路线" : "Full playbook from idea and SEO/GEO to payments & LLCs"}
            </p>
          </Link>
          <Link
            href={`/${lang}/research`}
            className="rounded-xl border border-gray-200 bg-white p-3.5 hover:border-blue-300 transition-colors"
          >
            <p className="font-semibold text-gray-900">
              {isZh ? "实证研究论文与数据集" : "Working Papers & Datasets"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isZh ? "20 万结账链接支付研究、10 万+ Agent Skill 安全报告" : "200k-link MoR payments study & 105k+ agent skill security audit"}
            </p>
          </Link>
          <Link
            href={`/${lang}/blog`}
            className="rounded-xl border border-gray-200 bg-white p-3.5 hover:border-blue-300 transition-colors"
          >
            <p className="font-semibold text-gray-900">
              {isZh ? "全部出海实战文章" : "All Blog Articles"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isZh ? "GEO 实验复盘、支付对比、英国/美国公司注册实操" : "GEO experiments, payment breakdowns, and company setup guides"}
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
