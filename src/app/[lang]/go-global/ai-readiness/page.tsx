import type { Metadata } from "next";
import Link from "@/components/Link";
import { PERSON_REF } from "@/lib/profiles";
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
        ? "AI 网站急诊室 & 第 1 课 7 关通关小游戏：Reach → Search → Cite → Describe → Measure 五阶段体检（100 分制）"
        : "AI Website Clinic & Course 1 Game: 100-Point GEO 5-Stage & AI Readiness Checker",
      description: isZh
        ? "免费公开体检任意网站（或付费隐藏自家网站记录）：按 GEO 五阶段与 7 大关卡 26 项真实 HTTP 指标打出 0-100 分（拆出 22 项核心基础分 vs 4 项实验标准），并生成 Cursor / Claude Code 修复处方。"
        : "Free public diagnosis across 5 GEO stages and 7 levels (26 live HTTP checks): separates 22 core AI search checks (83 pts) from 4 experimental agent standards (17 pts) and generates Cursor / Claude Code fix prompts.",
      alternates: {
        canonical: `${SITE_URL}/${lang}${PATH}`,
        languages: {
          zh: `${SITE_URL}/zh${PATH}`,
          en: `${SITE_URL}/en${PATH}`,
          "x-default": `${SITE_URL}/en${PATH}`,
        },
      },
    },
    rawLang
  );
}

const USE_CASES = [
  {
    role: { zh: "独立开发者 / AI SaaS 创始人", en: "Indie Hacker / AI SaaS Founder" },
    scenario: {
      zh: "用 Next.js / React / Vercel 刚上线新站，GSC 收录慢、问 ChatGPT / Perplexity 完全搜不到自家产品。",
      en: "Launching a new Next.js, React, or Vercel site that indexes slowly and never shows up in ChatGPT or Perplexity answers.",
    },
    output: {
      zh: "30 秒查出是否被 Cloudflare WAF 误杀 AI 爬虫、是否因纯 CSR 渲染导致无 JS 正文为空，并直接复制一份 Cursor / Claude Code 修复 Prompt。",
      en: "In 30 seconds, pinpoint WAF bot blocks, empty no-JS SSR HTML, or missing Organization JSON-LD, and copy a ready-to-run Cursor / Claude Code patch prompt.",
    },
  },
  {
    role: { zh: "技术 SEO / GEO 负责人", en: "Technical SEO / GEO Engineer" },
    scenario: {
      zh: "接手客户或公司独立站做技术体检，需要把「真影响抓取引用的必做项」和「llms.txt / WebMCP 这类实验标准」拆开排优先级。",
      en: "Auditing a production or client domain and separating real crawl/indexing blockers from experimental checkboxes like llms.txt or WebMCP.",
    },
    output: {
      zh: "直接输出两层口径：22 项核心基础分（/100）决定先修哪些阻断项，4 项实验标准（/17）单独标记为选做，避免团队在低收益项上空转。",
      en: "Get a two-tier breakdown: 22 Core checks (0–100 Core Score) for P0 engineering tickets plus 4 clearly badged Experimental checks (/17) so teams never waste sprints on low-ROI items.",
    },
  },
  {
    role: { zh: "出海内容站 / 目录站站长", en: "Directory & Content Site Operator" },
    scenario: {
      zh: "想横向对比自己网站和行业头部竞品（如 glama.ai、skills.sh）在抓取放行、Schema 实体与首段切片上的差距。",
      en: "Benchmarking your site against niche leaders on bot access, Schema.org entities, sitemap hygiene, and lead passage chunks.",
    },
    output: {
      zh: "一键对比 7 关分项得分、查看 AI 无 JS 提取到的首段 260 字符切片是否自带品牌名，改完代码后复诊核验涨分幅度（Score Delta）。",
      en: "Compare 7-level category scores side-by-side, inspect the exact 260-char no-JS lead chunk AI extracts for brand attribution, and verify score delta after deploying fixes.",
    },
  },
];

const HOW_TO_STEPS = [
  {
    step: "01",
    title: { zh: "输入域名，服务端实时并发探测 26 项 HTTP 指标", en: "Enter any domain for 26 live server-side HTTP checks" },
    desc: {
      zh: "直接向目标域名的 robots.txt、首页无 JS HTML、sitemap.xml、随机 404 路径、/llms.txt 与 /.well-known/mcp/server-card.json 发起真实请求，不依赖第三方估算分。",
      en: "Probes robots.txt, raw no-JS HTML, sitemap.xml, a random 404 URL, /llms.txt, and /.well-known/mcp/server-card.json directly — no third-party authority guesses.",
    },
  },
  {
    step: "02",
    title: { zh: "先看「核心基础分 /100」，再决定要不要做 4 项实验标准", en: "Prioritize the 22 Core checks before the 4 Experimental protocols" },
    desc: {
      zh: "先清掉第 1–5 关的红灯（AI 爬虫放行、SSR 正文可读、Sitemap/404 卫生、JSON-LD 实体与公开价格）；llms.txt、WebMCP 等 4 项带「实验标准」标签，按需选做即可。",
      en: "Fix Level 1–5 blockers first (crawler access, SSR text, sitemap/404 hygiene, JSON-LD entities, public pricing). Treat the 4 Experimental badges as optional forward-looking upgrades.",
    },
  },
  {
    step: "03",
    title: { zh: "一键复制修复处方交给 Cursor / Claude Code，上线后复诊验分", en: "Paste the generated fix prompt into Cursor / Claude Code & re-scan" },
    desc: {
      zh: "每个扣分项都附带可执行代码修改指令，支持一键汇总复制或直达 Cursor。部署后回到本页重新体检，自动对比上次得分显示复诊涨分（+X 分）。",
      en: "Every failed check includes an actionable code-change prompt (copy all or open in Cursor). Re-scan after deploying to automatically measure your score delta.",
    },
  },
];

const CLINIC_FAQ = [
  {
    q: {
      zh: "为什么把 26 项检查拆成「22 项核心基础（83 分）」和「4 项实验标准（17 分）」？",
      en: "Why are the 26 checks split into 22 Core checks (83 pts) and 4 Experimental standards (17 pts)?",
    },
    a: {
      zh: "实测数据和主流搜索引擎文档一致表明：真正决定网站能否被 Google、ChatGPT、Perplexity 抓到并引用的，是前 22 项核心 HTTP/渲染/Sitemap/JSON-LD 指标；而 /llms.txt、WebMCP 和 MCP Server Card 目前仍处于早期实验阶段，尚未成为搜索引擎引用门槛。保留 100 分总分方便与旧病历和标杆榜横向对比，同时单独给出「核心基础分 /100」和「实验标准」徽章，避免站长被总分误导去盲目堆实验文件。",
      en: "Empirical crawler data shows that crawl access, no-JS HTML, sitemap/404 hygiene, and JSON-LD (the 22 Core checks) directly determine whether Google, ChatGPT, and Perplexity index and cite your site, whereas /llms.txt, WebMCP, and MCP Server Card remain early experimental specs. We keep the 100-point total for backward compatibility with existing benchmarks while surfacing a standalone 0–100 Core Score and explicit Experimental badges so you fix real blockers first.",
    },
  },
  {
    q: {
      zh: "没有配 /llms.txt 或 WebMCP，会影响被 ChatGPT 或 Perplexity 引用吗？",
      en: "Will skipping /llms.txt or WebMCP hurt my citations in ChatGPT or Perplexity?",
    },
    a: {
      zh: "目前不会。只要你的「核心基础分」达到 90+/100（AI 爬虫放行、无 JS 可读正文、干净 Sitemap、完整 JSON-LD 与首段明确回答问题），即使 /llms.txt 和 WebMCP 为 0 分，也完全不影响在 Google AI Overviews、ChatGPT Search 和 Perplexity 中被引用。",
      en: "No. As long as your Core Score is strong (AI bots allowed, clean SSR HTML, accurate sitemap, solid JSON-LD, and concise answer passages), scoring 0/17 on experimental protocols will not block citations in Google AI Overviews, ChatGPT Search, or Perplexity.",
    },
  },
  {
    q: {
      zh: "为什么很多 React / Vite / Next.js 网站在「第 2 关：无 JS 可读」直接拿 0 分？",
      en: "Why do many React / Vite / SPA websites score 0 on Level 2 (Content readable without JS)?",
    },
    a: {
      zh: "OpenAI 的 GPTBot / OAI-SearchBot、Anthropic 的 ClaudeBot 和 PerplexityBot 大多只抓取服务端首次返回的原始 HTML，不执行客户端 JavaScript。如果页面初始 HTML 里只有空的 <div id=\"root\"></div>，AI 爬虫看到的几乎是空白页。改为 SSR / SSG 预渲染即可直接拿满这 8 分。",
      en: "GPTBot, OAI-SearchBot, ClaudeBot, and PerplexityBot fetch raw server HTML without executing client-side JavaScript. If your initial response is an empty <div id=\"root\"></div>, AI crawlers see nothing. Switching key landing pages to SSR or static pre-rendering immediately recovers those 8 points.",
    },
  },
  {
    q: {
      zh: "网站接入了 Cloudflare，为什么会在第 1 关触发 WAF 拦截警告？",
      en: "My site uses Cloudflare — why does Level 1 warn about bot detection?",
    },
    a: {
      zh: "Cloudflare 的部分安全规则（如 Bot Fight Mode、开启“屏蔽 AI 爬虫”或对非常规 User-Agent 弹出 403 / Just a moment 质询页）会把 ChatGPT-User、PerplexityBot 一起拦下。检查 Cloudflare Security → Bots 与 WAF 自定义规则，放行你要获取流量的搜索型 AI 爬虫即可。",
      en: "Cloudflare Bot Fight Mode, 'Block AI Bots', or aggressive Managed Challenges return HTTP 403 or 'Just a moment' interstitials to ChatGPT-User and PerplexityBot. Review Cloudflare Security → Bots and allow search/citation crawlers you want traffic from.",
    },
  },
  {
    q: {
      zh: "免费体检记录会公开吗？如果不想让同行看到我的新站域名怎么办？",
      en: "Are free scans public? How do I keep an unreleased domain private?",
    },
    a: {
      zh: "免费体检默认会收录进下方的公开病历库（方便社区横向学习）。如果你的新站正处于保密测试期、不想被同行查到域名或体检短板，可以点击报告右上角「隐藏此站公开记录」申请榜单隐身。",
      en: "Free scans are listed in the public directory below so founders can learn from real benchmarks. If you are auditing a stealth domain, click 'Hide Public Record' on the report header to delist it from public rankings.",
    },
  },
  {
    q: {
      zh: "这个在线急诊室和开源的 ai-visibility-checker CLI 有什么区别？",
      en: "How does this live clinic relate to the open-source ai-visibility-checker CLI?",
    },
    a: {
      zh: "两者同源，均由 Jason Zhu 维护。原 GitHub 命令行工具（zhuyansen/ai-visibility-checker）已完成归档，最新口径（拆出核心分 vs 实验标准、GEO 五阶段漏斗、首段切片预览和一键 Cursor / Claude Code 处方）统一在当前在线版持续更新。",
      en: "Both were built by Jason Zhu. The standalone CLI repo (zhuyansen/ai-visibility-checker) has been archived, and this live clinic is now the actively maintained version with unified Core vs. Experimental scoring, 5-stage funnel diagnosis, lead-chunk preview, and one-click fix prompts.",
    },
  },
];

const L1_TO_L4_CURRICULUM = [
  {
    layer: "L1",
    stage: "1. Reach → 2. Search",
    title: {
      zh: "L1：抓取与入库 (Crawl & Pretrain)",
      en: "L1: Crawl & Pretrain",
    },
    jargon: {
      zh: "收录、蜘蛛池、外链权重、pSEO 批量铺页",
      en: "Indexing, spider pools, link juice, pSEO mass pages",
    },
    irMotherTongue: {
      zh: "候选集准入 (Candidate Admission) + 图中心性配额 + 预训练近重复去重",
      en: "Candidate Admission + Graph Centrality Quota + Near-Duplicate Dedup",
    },
    lockedSecret: {
      zh: "🔒 内部实验闭环（第 1 周）：新域名抓取配额安全红线与防模板折叠实验（会员专享，不对外公开）",
      en: "🔒 Week 1 Closed-Loop Lab: Domain crawl quota thresholds & anti-folding rules (Members Only)",
    },
  },
  {
    layer: "L2",
    stage: "4. Describe",
    title: {
      zh: "L2：实体与本体 (Entity & Ontology)",
      en: "L2: Entity & Ontology",
    },
    jargon: {
      zh: "品牌词、Schema、E-E-A-T、知识面板",
      en: "Brand keywords, Schema, E-E-A-T, Knowledge Panel",
    },
    irMotherTongue: {
      zh: "知识图谱实体对齐 (Entity Resolution) + EAV 三元组 (Entity-Attribute-Value) 唯一性校验",
      en: "Knowledge Graph Entity Resolution + EAV Triple Uniqueness Verification",
    },
    lockedSecret: {
      zh: "🔒 内部实验闭环（第 2 周）：公域无唯一 item_id 下的跨源实体对齐与防分裂实验（会员专享，不对外公开）",
      en: "🔒 Week 2 Closed-Loop Lab: Cross-source entity alignment & split prevention (Members Only)",
    },
  },
  {
    layer: "L3",
    stage: "2. Search",
    title: {
      zh: "L3：召回与扇出 (Retrieval & Fan-out)",
      en: "L3: Retrieval & Fan-out",
    },
    jargon: {
      zh: "关键词密度、长尾词、Query Fan-out",
      en: "Keyword density, long-tail keywords, Query Fan-out",
    },
    irMotherTongue: {
      zh: "Query Rewriting / Expansion (Suggest 下拉框与多路召回) + 双塔向量 / BM25 混合召回",
      en: "Query Rewriting / Expansion + Dual-Tower Vector / BM25 Hybrid Retrieval",
    },
    lockedSecret: {
      zh: "🔒 内部实验闭环（第 3 周）：AI 后台多路改写扇出规律与跨语种高召回词槽实验（会员专享，不对外公开）",
      en: "🔒 Week 3 Closed-Loop Lab: Background query fan-out patterns & cross-lingual retrieval slots (Members Only)",
    },
  },
  {
    layer: "L4",
    stage: "3. Cite → 4. Describe",
    title: {
      zh: "L4：切片重排与生成 (Chunking & Synthesis)",
      en: "L4: Chunking & Synthesis",
    },
    jargon: {
      zh: "BLUF、Listicle 排名、被引用 vs 被点名",
      en: "BLUF, Listicle ranking, Cited vs Named",
    },
    irMotherTongue: {
      zh: "Passage Chunking (首段核心词窗) + Cross-Encoder 重排 + 生成归因 (Citation vs Naming)",
      en: "Passage Chunking + Cross-Encoder Reranking + Generation Attribution",
    },
    lockedSecret: {
      zh: "🔒 内部实验闭环（第 4 周）：黄金切片词窗参数、结构化重排矩阵与防白嫖品牌绑定实验（会员专享，不对外公开）",
      en: "🔒 Week 4 Closed-Loop Lab: Golden chunk window formula & brand self-attribution matrix (Members Only)",
    },
  },
];

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
          ? "AI 网站急诊室 & GEO 五阶段 × 7 关通关小游戏"
          : "AI Website Clinic & GEO 5-Stage 7-Level Readiness Game",
        url: `${SITE_URL}/${lang}${PATH}`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "All",
        creator: PERSON_REF,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: isZh
          ? "按 GEO 五阶段与 7 大关卡 26 项真实 HTTP 检测（22 项核心基础 83 分 + 4 项实验标准 17 分），公开诊断任意网站能否被 Google、ChatGPT、Claude、Perplexity 抓取、检索、引用并准确描述。"
          : "100-point, 5-stage, 7-level, 26-check live diagnostic clinic separating 22 core AI search signals (83 pts) from 4 experimental agent protocols (17 pts).",
      },
      {
        "@type": "FAQPage",
        mainEntity: CLINIC_FAQ.map((item) => ({
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
            {isZh ? "GEO 五阶段：Reach → Search → Cite → Describe → Measure" : "GEO 5 Stages: Reach → Search → Cite → Describe → Measure"}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            {isZh ? "22 项核心必做 + 4 项实验标准分层计分" : "22 Core Checks + 4 Experimental Standards"}
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            {isZh ? "🔒 支持付费隐藏网站记录" : "🔒 Paid Stealth Delisting Available"}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
          {isZh
            ? "AI 网站急诊室：闯过这 7 关，打通 Reach → Search → Cite → Describe → Measure"
            : "AI Website Clinic: Clear 7 Levels Across Reach → Search → Cite → Describe → Measure"}
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-3xl">
          {isZh
            ? "GEO 其实就五阶段：1. Reach（AI 能访问吗？）→ 2. Search（AI 能搜到吗？）→ 3. Cite（AI 会引用吗？）→ 4. Describe（AI 会把我们说对吗？）→ 5. Measure（能持续衡量吗？）。在下方输入任意域名即可免费公开体检，报告会自动区分「22 项核心基础分」与「4 项前沿实验标准（llms.txt / WebMCP / MCP Server Card）」，并生成一键可贴进 Cursor / Claude Code 的修复处方。"
            : "GEO boils down to 5 stages: 1. Reach → 2. Search → 3. Cite → 4. Describe → 5. Measure. Enter any domain below for a free live HTTP scan that cleanly separates 22 core AI-search checks from 4 optional experimental agent protocols (llms.txt, WebMCP, MCP Server Card) and generates ready-to-paste Cursor / Claude Code fix prompts."}
        </p>
      </header>

      <AiReadinessClinic lang={lang} />

      {/* 适用场景（角色 + 场景 + 预期产出） */}
      <section className="mt-12">
        <div className="mb-5">
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold mb-2">
            {isZh ? "适用场景 · Use Cases" : "Use Cases"}
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
            {isZh ? "谁最适合用 AI 网站急诊室？能直接拿到什么结果？" : "Who Is This Built For & What Do You Walk Away With?"}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {USE_CASES.map((uc) => (
            <div
              key={uc.role.en}
              className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1.5">
                  {uc.role[lang]}
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
                  {uc.scenario[lang]}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {uc.output[lang]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 步上手流程 */}
      <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 md:p-8">
        <span className="inline-block rounded-full bg-blue-100 text-blue-800 px-3 py-0.5 text-xs font-bold mb-2">
          {isZh ? "3 步上手" : "How It Works in 3 Steps"}
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-5">
          {isZh ? "从第一次体检到验证涨分，10 分钟跑完闭环" : "From First Scan to Verified Score Delta in 10 Minutes"}
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {HOW_TO_STEPS.map((s) => (
            <div key={s.step} className="rounded-2xl bg-gray-50 border border-gray-200/80 p-5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white mb-3">
                {s.step}
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5 leading-snug">
                {s.title[lang]}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {s.desc[lang]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          升级 3：搜广推（IR + KG + RAG + 实验科学）× 公域 SEO/GEO L1~L4 四周闭环实验映射表
          （严格保护内部核心参数与阈值经验，仅展示架构映射，核心配方加密锁定）
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mt-12 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-6 border-b border-white/10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300 mb-2.5">
              {isZh
                ? "检索系统 (IR) + 知识图谱 (KG) + 推荐重排 (RAG) + 实验科学"
                : "IR + Knowledge Graph + RAG Reranking + Experimental Science"}
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">
              {isZh
                ? "🎓 从第 1 课通关到 L1~L4 四周闭环实验：用搜广推母语重构公域 GEO"
                : "🎓 L1–L4 Closed-Loop Curriculum: Re-Mapping Public SEO/GEO with IR, KG & RAG"}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isZh
                ? "在上方急诊室拿到 85+ 分（Grade A）只是完成了公开协议层的地基。真正决定你的网站能否在公域被召回、被重排选中并准确点名的，是下面这 4 个模块（每周跑一个闭环实验，核心内部参数与实战阈值仅在 GoSail Club 内部公开）："
                : "Scoring 85+ (Grade A) above clears the public HTTP protocol layer. Mastering public retrieval, reranking, and brand attribution requires our 4-module weekly closed-loop experiments (confidential parameters available exclusively inside GoSail Club):"}
            </p>
          </div>

          <Link
            href={`/${lang}/club`}
            className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-xs font-black text-slate-950 shadow-lg hover:from-amber-300 hover:to-amber-400 whitespace-nowrap flex-none"
          >
            {isZh ? "🔒 加入内部会员解锁 L1~L4 实验参数 →" : "🔒 Join Club to Unlock L1–L4 Lab →"}
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs font-bold text-slate-300">
                <th className="py-3.5 pl-4 pr-3">{isZh ? "公域 SEO / GEO 环节" : "Public SEO / GEO Layer"}</th>
                <th className="py-3.5 px-3">{isZh ? "站长圈常说的黑话" : "Webmaster Jargon"}</th>
                <th className="py-3.5 px-3">{isZh ? "翻译成搜广推 / 图谱母语" : "IR / KG / RAG Architecture"}</th>
                <th className="py-3.5 pl-3 pr-4">{isZh ? "内部闭环实验 & 踩坑阈值（保密）" : "Confidential Lab & Thresholds"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {L1_TO_L4_CURRICULUM.map((row) => (
                <tr key={row.layer} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 pl-4 pr-3 align-top">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-lg bg-blue-600 px-2 py-0.5 text-xs font-extrabold text-white">
                        {row.layer}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-300">
                        {row.stage}
                      </span>
                    </div>
                    <p className="font-bold text-white text-sm">{row.title[lang]}</p>
                  </td>
                  <td className="py-4 px-3 align-top text-xs text-slate-300 leading-relaxed">
                    {row.jargon[lang]}
                  </td>
                  <td className="py-4 px-3 align-top text-xs font-semibold text-emerald-300 leading-relaxed">
                    {row.irMotherTongue[lang]}
                  </td>
                  <td className="py-4 pl-3 pr-4 align-top">
                    <Link
                      href={`/${lang}/club`}
                      className="block rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200 hover:bg-amber-500/20 transition-colors leading-relaxed"
                    >
                      {row.lockedSecret[lang]}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 常见问题 FAQ（与上方 FAQPage JSON-LD 一致） */}
      <section id="faq" className="mt-12 rounded-3xl border border-gray-200 bg-white p-6 md:p-8">
        <span className="inline-block rounded-full bg-gray-100 text-gray-700 px-3 py-0.5 text-xs font-bold mb-2">
          FAQ
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-5">
          {isZh ? "常见问题：计分口径、实验标准与排障" : "Frequently Asked Questions"}
        </h2>
        <div className="divide-y divide-gray-200">
          {CLINIC_FAQ.map((item) => (
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

      {/* 相关出海工具与实证研究内链 */}
      <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 md:p-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          {isZh ? "下一步：配合这些免费工具与实证数据一起用" : "Next Steps: Related Free Tools & Research"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Link
            href={`/${lang}/research/ai-crawlers`}
            className="rounded-xl border border-gray-200 bg-white p-3.5 hover:border-blue-300 transition-colors"
          >
            <p className="font-semibold text-gray-900">
              {isZh ? "AI 爬虫实测数据" : "AI Crawler Empirical Data"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isZh ? "看各大 AI 爬虫真实抓取与引用行为" : "Real crawl vs. citation logs across major AI bots"}
            </p>
          </Link>
          <Link
            href={`/${lang}/go-global/payments`}
            className="rounded-xl border border-gray-200 bg-white p-3.5 hover:border-blue-300 transition-colors"
          >
            <p className="font-semibold text-gray-900">
              {isZh ? "海外收款平台选择器" : "Payment Platform Picker"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isZh ? "按主体与费率对比 Stripe / Paddle / Creem / Dodo" : "Compare MoR & gateway fees, rules, and pre-checks"}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools`}
            className="rounded-xl border border-gray-200 bg-white p-3.5 hover:border-blue-300 transition-colors"
          >
            <p className="font-semibold text-gray-900">
              {isZh ? "出海自研工具与精选库" : "Open-Source & Curated Tools"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isZh ? "new-term-radar、backlink-guard、payment-guard 等" : "new-term-radar, backlink-guard, payment-guard & more"}
            </p>
          </Link>
          <Link
            href={`/${lang}/go-global`}
            className="rounded-xl border border-gray-200 bg-white p-3.5 hover:border-blue-300 transition-colors"
          >
            <p className="font-semibold text-gray-900">
              {isZh ? "独立开发出海总指南" : "Go-Global Master Guide"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isZh ? "从选品、建站、SEO/GEO 到收款开户全路线" : "End-to-end roadmap from idea and SEO/GEO to payments"}
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
