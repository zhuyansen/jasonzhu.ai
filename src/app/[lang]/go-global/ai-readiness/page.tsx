import type { Metadata } from "next";
import Link from "@/components/Link";
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
        ? "免费公开体检任意网站（或付费隐藏自家网站记录）：按 GEO 五阶段（Reach → Search → Cite → Describe → Measure）与 7 大关卡 26 项真实 HTTP 指标打出 0-100 分和 A-F 等级，并生成 Cursor / Claude Code 修复处方。"
        : "Free public diagnosis across the 5 GEO stages (Reach → Search → Cite → Describe → Measure) and 7 levels (26 checks, 100 points total).",
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
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: isZh
          ? "按 GEO 五阶段（Reach → Search → Cite → Describe → Measure）与 7 大关卡 26 项真实 HTTP 检测，公开诊断任意网站能否被 Google、ChatGPT、Claude、Perplexity 抓取、检索、引用并准确描述。"
          : "100-point, 5-stage, 7-level, 26-check live diagnostic clinic for AI search visibility and WebMCP agent readiness.",
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
            {isZh ? "免费公开查询 × 7 关通关游戏" : "Free Public Directory × 7-Level Game"}
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
            ? "GEO 其实就五阶段：1. Reach（AI 能访问吗？）→ 2. Search（AI 能搜到吗？）→ 3. Cite（AI 会引用吗？）→ 4. Describe（AI 会把我们说对吗？）→ 5. Measure（能持续衡量吗？）。在下方输入任意域名即可免费公开体检（所有免费检测结果均收录至公开病历库供全网查询；若不想让同行看到你的新站域名或短板，可付费开启榜单隐身）。"
            : "GEO boils down to 5 stages: 1. Reach (Can AI access it?) → 2. Search (Can AI find it?) → 3. Cite (Will AI cite it?) → 4. Describe (Will AI describe us right?) → 5. Measure (Can we track it continuously?). Free scans are indexed in our public directory; upgrade to hide your domain."}
        </p>
      </header>

      <AiReadinessClinic lang={lang} />

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

      <div className="mt-10">
        <Community lang={lang} />
      </div>
    </div>
  );
}
