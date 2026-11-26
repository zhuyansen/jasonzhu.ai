import type { Metadata } from "next";
import Link from "@/components/Link";
import { withSocialCards } from "@/lib/social";
import {
  OPEN_DATASETS,
  RESEARCH_AUTHOR,
  RESEARCH_IDENTIFIERS,
  WORKING_PAPERS,
} from "@/lib/research";
import { findWorkByDoi, PERSON_ID, workNode, type Work } from "@/lib/profiles";
import { fmt, fmtDay, stats as crawlerStats } from "@/lib/ai-crawler-stats";

const SITE_URL = "https://jasonzhu.ai";

export async function generateStaticParams() {
  return [{ lang: "zh" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = rawLang === "en" ? "en" : "zh";
  const isEn = lang === "en";
  return withSocialCards(
    {
      title: isEn
        ? "Research, Working Papers & Open Datasets — Jason Zhu"
        : "学术工作论文与开源数据集 — Jason Zhu",
      description: isEn
        ? "Empirical working papers (PDF, SSRN & CERN Zenodo DOIs) and CC-BY-4.0 open datasets on indie SaaS payment infrastructure (200k checkout links), $20 MoR fees, AI agent skills security (105k–130k), and backlink spam detection."
        : "Jason Zhu（祝彦森）公开发表的英文实证工作论文（PDF、SSRN 与 CERN Zenodo DOI）及 CC-BY-4.0 开源数据集：20 万独立开发者支付普查、$20 MoR 费率审计、105K–130K AI Agent Skills 安全审计与垃圾外链数据库。",
      alternates: {
        canonical: `${SITE_URL}/${lang}/research`,
        languages: {
          zh: `${SITE_URL}/zh/research`,
          en: `${SITE_URL}/en/research`,
          "x-default": `${SITE_URL}/en/research`,
        },
      },
    },
    lang
  );
}

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang === "en" ? "en" : "zh";
  const isEn = lang === "en";

  // 本页列出的论文和数据集（含论文引用的 130K 数据集），节点取自 src/lib/profiles.ts 的 WORKS：
  // 同一个作品在 /research、博客文章页、/backlink-spam-list 上是同一个 @id、同样的 sameAs。
  // 论文标题用本页显示的那个；每个作品的作者都指向 #person。
  const pageWorks: Work[] = [];
  const add = (doi: string) => {
    const w = findWorkByDoi(doi);
    if (w && !pageWorks.includes(w)) pageWorks.push(w);
  };
  WORKING_PAPERS.forEach((p) => add(p.zenodoDoi));
  OPEN_DATASETS.forEach((d) => add(d.zenodo));
  WORKING_PAPERS.forEach((p) => p.datasetDois.forEach((d) => add(d.doi)));
  const paperTitle = (w: Work) => WORKING_PAPERS.find((p) => findWorkByDoi(p.zenodoDoi) === w)?.title;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/${lang}/research#collection`,
        url: `${SITE_URL}/${lang}/research`,
        name: isEn
          ? "Empirical Working Papers & Open Datasets — Jason Zhu"
          : "实证工作论文与开源数据集 — Jason Zhu",
        author: { "@id": PERSON_ID },
        hasPart: pageWorks.map((w) => ({ "@id": w.id })),
      },
      ...pageWorks.map((w) => {
        const node = workNode(w);
        const title = paperTitle(w);
        return title ? { ...node, name: title, headline: title } : node;
      }),
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
          {isEn ? "OPEN RESEARCH & REPRODUCIBLE DATA" : "公开实证研究与可复现数据"}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {isEn
            ? "Working Papers & Open Datasets"
            : "实证工作论文与开源数据集"}
        </h1>
        <p className="text-gray-600 leading-relaxed">
          {isEn
            ? `Empirical research by ${RESEARCH_AUTHOR.name} (${RESEARCH_AUTHOR.altName}), ${RESEARCH_AUTHOR.affiliation}. Every working paper and underlying CSV dataset is openly archived under CC-BY-4.0 across CERN Zenodo, SSRN (Elsevier), Hugging Face, Kaggle, and GitHub.`
            : `由 ${RESEARCH_AUTHOR.name}（${RESEARCH_AUTHOR.altName}，${RESEARCH_AUTHOR.affiliation}）发布的一手实证工作论文与可复现数据集。所有论文 PDF 与原始 CSV 均按 CC-BY-4.0 协议同步归档至 CERN Zenodo、SSRN（Elsevier）、Hugging Face、Kaggle 与 GitHub。`}
        </p>

        {/* Persistent Identifier Badges */}
        <div className="flex flex-wrap gap-2 mt-5">
          {RESEARCH_IDENTIFIERS.map((ident) => (
            <a
              key={ident.label}
              href={ident.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 transition-colors"
            >
              <span className="font-semibold">{ident.label}:</span>
              <span className="font-mono">{ident.id}</span>
            </a>
          ))}
        </div>
      </div>

      {/* 持续更新的数据：AI 爬虫与 AI 引用（2026-11-26 起，每月更新） */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-5 pb-2 border-b border-gray-200">
          {isEn ? "Live Data (Updated Monthly)" : "持续更新的数据（每月）"}
        </h2>
        <Link
          href={`/${lang}/research/ai-crawlers`}
          className="block p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
            <span>
              {isEn
                ? `${fmtDay(crawlerStats.coverage.first_day, "en")} to ${fmtDay(crawlerStats.coverage.last_day, "en")} (UTC)`
                : `${crawlerStats.coverage.first_day} 至 ${crawlerStats.coverage.last_day}（UTC）`}
            </span>
            <span>·</span>
            <span>CSV · JSON</span>
            <span>·</span>
            <span className="font-mono text-emerald-700">CC-BY-4.0</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
            {isEn
              ? "How AI crawlers read a real indie site, and how often AI answers cite it"
              : "AI 爬虫怎么读一个真实的独立站，AI 回答又有多常引用它"}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isEn
              ? `${fmt(crawlerStats.totals.ai_requests)} AI crawler requests to jasonzhu.ai in ${crawlerStats.coverage.days} days: which crawlers came, what they read, how many could be verified against published IP ranges, and how often ChatGPT, Gemini, Google AI Mode and Perplexity cite the site.`
              : `${crawlerStats.coverage.days} 天里 jasonzhu.ai 收到 ${fmt(crawlerStats.totals.ai_requests)} 次 AI 爬虫请求：哪些爬虫来过、读了什么、多少能用公布的 IP 段核实身份，以及 ChatGPT、Gemini、Google AI Mode、Perplexity 引用本站的比例。`}
          </p>
          <span className="inline-block mt-3 text-sm font-medium text-blue-700">{isEn ? "See the data →" : "看数据 →"}</span>
        </Link>
      </section>

      {/* Working Papers */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-5 pb-2 border-b border-gray-200">
          {isEn ? "Working Papers (PDF · SSRN & CERN Zenodo)" : "学术工作论文（PDF · SSRN 与 CERN Zenodo）"}
        </h2>
        <div className="space-y-6">
          {WORKING_PAPERS.map((paper) => (
            <article
              key={paper.slug}
              className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                <span>{paper.date}</span>
                <span>·</span>
                <span>{paper.pages} pages (PDF)</span>
                <span>·</span>
                <span>{paper.classification}</span>
                <span>·</span>
                <span className="font-mono text-blue-700">DOI: {paper.zenodoDoi}</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                <Link
                  href={`/${lang}/research/${paper.slug}`}
                  className="hover:text-blue-700 transition-colors"
                >
                  {isEn ? paper.title : paper.titleZh}
                </Link>
              </h3>
              {!isEn && (
                <p className="text-xs text-gray-500 mb-2 font-medium">{paper.title}</p>
              )}

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {isEn ? paper.abstract : paper.abstractZh}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <a
                  href={paper.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {isEn ? "Download PDF" : "下载论文 PDF"} ({paper.pages}p)
                </a>
                <a
                  href={paper.ssrnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                >
                  SSRN #{paper.ssrnId}
                </a>
                <a
                  href={paper.zenodoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                >
                  CERN Zenodo DOI
                </a>
                <Link
                  href={`/${lang}/research/${paper.slug}`}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {isEn ? "Citation & BibTeX →" : "引用详情与 BibTeX →"}
                </Link>
                <Link
                  href={`/${lang}/blog/${paper.companionBlogSlug}`}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {isEn ? "Web Companion Article" : "网页精读版"}
                </Link>
              </div>

              <details className="text-xs text-gray-600">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-blue-600">
                  BibTeX ({paper.bibtexKey})
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200 overflow-x-auto font-mono text-[11px] leading-relaxed text-gray-800">
                  {paper.bibtex}
                </pre>
              </details>
            </article>
          ))}
        </div>
      </section>

      {/* Open Datasets */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5 pb-2 border-b border-gray-200">
          {isEn
            ? "Open Datasets (CC-BY-4.0 · Zenodo, Hugging Face, Kaggle, GitHub)"
            : "开源数据集（CC-BY-4.0 · Zenodo / Hugging Face / Kaggle / GitHub）"}
        </h2>
        <div className="space-y-4">
          {OPEN_DATASETS.map((ds) => (
            <div
              key={ds.name}
              className="p-5 rounded-xl border border-gray-200 bg-white flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-900">{ds.name}</h3>
                <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {ds.license}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href={ds.zenodo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700"
                >
                  CERN Zenodo DOI
                </a>
                <a
                  href={ds.huggingface}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700"
                >
                  Hugging Face
                </a>
                <a
                  href={ds.kaggle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700"
                >
                  Kaggle
                </a>
                <a
                  href={ds.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700"
                >
                  GitHub / Rubric
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
