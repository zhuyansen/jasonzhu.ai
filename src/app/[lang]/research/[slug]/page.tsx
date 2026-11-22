import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { withSocialCards } from "@/lib/social";
import {
  getWorkingPaper,
  RESEARCH_AUTHOR,
  WORKING_PAPERS,
} from "@/lib/research";

const SITE_URL = "https://jasonzhu.ai";

export async function generateStaticParams() {
  const out: { lang: string; slug: string }[] = [];
  for (const lang of ["zh", "en"]) {
    for (const p of WORKING_PAPERS) {
      out.push({ lang, slug: p.slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = rawLang === "en" ? "en" : "zh";
  const paper = getWorkingPaper(slug);
  if (!paper) return {};

  const canonical = `${SITE_URL}/${lang}/research/${paper.slug}`;
  const pdfUrl = `${SITE_URL}${paper.pdfPath}`;

  // Highwire Press citation_* meta tags per Google Scholar Inclusion Guidelines
  const base = withSocialCards(
    {
      title: `${paper.title} — Jason Zhu`,
      description: paper.abstract.slice(0, 260),
      alternates: {
        canonical,
        languages: {
          zh: `${SITE_URL}/zh/research/${paper.slug}`,
          en: `${SITE_URL}/en/research/${paper.slug}`,
          "x-default": `${SITE_URL}/en/research/${paper.slug}`,
        },
      },
    },
    lang
  );

  return {
    ...base,
    other: {
      citation_title: paper.title,
      citation_author: "Zhu, Jason",
      citation_author_institution: RESEARCH_AUTHOR.affiliation,
      citation_author_orcid: RESEARCH_AUTHOR.orcid,
      citation_publication_date: paper.date.replace(/-/g, "/"),
      citation_online_date: paper.date.replace(/-/g, "/"),
      citation_pdf_url: pdfUrl,
      citation_abstract_html_url: `${SITE_URL}/en/research/${paper.slug}`,
      citation_doi: paper.zenodoDoi,
      citation_language: "en",
      citation_keywords: paper.keywords.join("; "),
      citation_technical_report_institution: RESEARCH_AUTHOR.affiliation,
    },
  };
}

export default async function WorkingPaperDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  const lang = rawLang === "en" ? "en" : "zh";
  const isEn = lang === "en";
  const paper = getWorkingPaper(slug);
  if (!paper) notFound();

  const pdfUrl = `${SITE_URL}${paper.pdfPath}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": `${SITE_URL}/${lang}/research/${paper.slug}#paper`,
    headline: paper.title,
    alternativeHeadline: paper.titleZh,
    abstract: paper.abstract,
    datePublished: paper.date,
    inLanguage: "en",
    keywords: paper.keywords.join(", "),
    url: `${SITE_URL}/${lang}/research/${paper.slug}`,
    sameAs: [paper.zenodoUrl, paper.ssrnUrl],
    identifier: [
      { "@type": "PropertyValue", propertyID: "DOI", value: paper.zenodoDoi },
      { "@type": "PropertyValue", propertyID: "SSRN", value: paper.ssrnId },
    ],
    author: {
      "@id": `${SITE_URL}/#person`,
      "@type": "Person",
      name: RESEARCH_AUTHOR.name,
      alternateName: RESEARCH_AUTHOR.altName,
      sameAs: [RESEARCH_AUTHOR.orcidUrl],
    },
    publisher: { "@id": `${SITE_URL}/#organization` },   // 全站 Organization 的 @id（layout.tsx）
    license: "https://creativecommons.org/licenses/by/4.0/",
    encoding: {
      "@type": "MediaObject",
      encodingFormat: "application/pdf",
      contentUrl: pdfUrl,
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/${lang}/research`}
        className="text-xs font-medium text-blue-600 hover:underline"
      >
        ← {isEn ? "All Working Papers & Datasets" : "返回全部工作论文与数据集"}
      </Link>

      <header className="mt-4 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          {paper.subtitle}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-3">
          {paper.title}
        </h1>
        {!isEn && (
          <p className="text-sm text-gray-600 mb-3">{paper.titleZh}</p>
        )}
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>{RESEARCH_AUTHOR.name}</strong> ({RESEARCH_AUTHOR.altName}) ·{" "}
            {RESEARCH_AUTHOR.affiliation}
          </p>
          <p className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
            <span>
              ORCID:{" "}
              <a
                href={RESEARCH_AUTHOR.orcidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono"
              >
                {RESEARCH_AUTHOR.orcid}
              </a>
            </span>
            <span>Date: {paper.date}</span>
            <span>{paper.pages} pages</span>
            <span>{paper.classification}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 mt-6">
          <a
            href={paper.pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {isEn ? "Download Full Paper (PDF)" : "下载完整论文 PDF"}
          </a>
          <a
            href={paper.ssrnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            SSRN Abstract #{paper.ssrnId}
          </a>
          <a
            href={paper.zenodoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            Zenodo DOI: {paper.zenodoDoi}
          </a>
        </div>
      </header>

      <section className="mb-8 p-6 rounded-xl bg-gray-50 border border-gray-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
          Abstract
        </h2>
        <p className="text-sm text-gray-800 leading-relaxed">{paper.abstract}</p>
        {!isEn && (
          <p className="text-sm text-gray-600 leading-relaxed mt-3 pt-3 border-t border-gray-200">
            {paper.abstractZh}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {paper.keywords.map((kw) => (
            <span
              key={kw}
              className="text-[11px] px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600"
            >
              {kw}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          {isEn ? "Supplementary Open Datasets (CC-BY-4.0)" : "配套开源数据集（CC-BY-4.0）"}
        </h2>
        <ul className="space-y-2 text-sm">
          {paper.datasetDois.map((d) => (
            <li key={d.doi}>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {d.label} — <span className="font-mono">{d.doi}</span>
              </a>
            </li>
          ))}
          <li>
            <Link
              href={`/${lang}/blog/${paper.companionBlogSlug}`}
              className="text-blue-600 hover:underline"
            >
              {isEn ? "Interactive Web Companion Report on JasonZhu.AI" : "JasonZhu.AI 网页精读版报告"}
            </Link>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold text-gray-900 mb-2">BibTeX Citation</h2>
        <pre className="p-4 rounded-xl bg-gray-900 text-gray-100 overflow-x-auto font-mono text-xs leading-relaxed">
          {paper.bibtex}
        </pre>
      </section>
    </div>
  );
}
