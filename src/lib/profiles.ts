// 实体图谱的数据：人、作品、相关网站分三份放，各自进各自的节点。
// sameAs 的意思是「这个网址说的就是同一个东西」。2026-11-21 线上实测，Person 的 sameAs 里混着 DOI、SSRN 论文页、
// PyPI 和 agentskillshub.top，等于说人就是论文、数据集和另一个网站。所以拆开：
// - PERSON_PROFILES：只放代表本人的档案。全站 Person 的 sameAs、llms.txt「作者」段读它。
// - WORKS：论文、数据集、开源工具。只进 /research、引用它的博客文章页、/backlink-spam-list 的 JSON-LD，作者指向 #person。
// - RELATED_SITES：作者办的另一个网站。全站图里单独一个节点，founder 指向 #person，不挂在谁下面。
// 改完跑 node scripts/check-entities.mjs（本地：node scripts/check-entities.mjs http://localhost:3000）。
//
// 2026-10-28 问四个 AI「Jason Zhu 是谁」：ChatGPT、Gemini 直接认出，豆包、DeepSeek 先列了一串同名的人，
// 所以补上中文名和国内平台的个人主页。视频号没有网页版主页，不放。
// 2026-11-24 拿掉 B 站（space.bilibili.com/266242152）：主页名字是「香菇的猪」、简介是空的，证明不了是本人，
// 反而让「这个账号是谁」更乱。改名成 Jason Zhu / 祝彦森、简介写上 jasonzhu.ai 之后再加回来。

export const SITE_URL = "https://jasonzhu.ai";
export const PERSON_ID = `${SITE_URL}/#person`;

export const AUTHOR_NAME = "Jason Zhu";
export const AUTHOR_ALT_NAME = "祝彦森";
export const AUTHOR_ALT_NAMES = ["祝彦森", "Yansen Zhu", "zhuyansen", "GoSailGlobal", "JasonZhu.AI"];

export const ORCID_ID = "0009-0000-2894-6285";
export const ORCID_URL = `https://orcid.org/${ORCID_ID}`;

/** 代表本人的档案。不放作品页（DOI、论文页、软件包、仓库）和别的网站。 */
export const PERSON_PROFILES: { label: string; url: string }[] = [
  { label: "ORCID", url: ORCID_URL },
  { label: "Google Scholar", url: "https://scholar.google.com/citations?user=AlP5JacAAAAJ" },
  { label: "SSRN", url: "https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=14044888" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/jason-zhu-a52aa73bb/" },
  { label: "Product Hunt", url: "https://www.producthunt.com/@yansen_zhu" },
  { label: "X", url: "https://x.com/GoSailGlobal" },
  { label: "GitHub", url: "https://github.com/zhuyansen" },
  { label: "Hugging Face", url: "https://huggingface.co/jasonzhuyansen" },
  { label: "Kaggle", url: "https://www.kaggle.com/yansenzhu" },
  { label: "YouTube", url: "https://www.youtube.com/@JasonZhuGoSail" },
  { label: "抖音", url: "https://www.douyin.com/user/MS4wLjABAAAABDQoQfOA67afaoRQ4u79rww04pMm4OoHwwyzJvPWS9E" },
  { label: "小红书", url: "https://www.xiaohongshu.com/user/profile/5bffc7d70000000008003b90" },
];

export type WorkType = "ScholarlyArticle" | "Dataset" | "SoftwareSourceCode";

export interface Work {
  /** JSON-LD @id。Zenodo 上的作品用 DOI 网址（和 Zenodo 自己的 JSON-LD 一致），开源工具用 GitHub 仓库网址。 */
  id: string;
  type: WorkType;
  /** llms.txt 里的短名 */
  label: string;
  name: string;
  description: string;
  /** 主页面：论文是本站论文页，数据集是 Zenodo 记录页，工具是 GitHub 仓库 */
  url: string;
  /** 同一个作品的其他页面。只放同一个东西：同一篇论文的 SSRN 页和 Zenodo 页算；装着两份数据的合集镜像不算 */
  sameAs: string[];
  /** Zenodo 总 DOI（concept DOI，不随版本变），不带 https://doi.org/ */
  doi?: string;
  ssrnId?: string;
  datePublished?: string;
  codeRepository?: string;
  pdfUrl?: string;
  /** 直接下载的数据文件 */
  downloads?: { url: string; format: string }[];
  /** 发布方不是作者本人时写它的 @id */
  publisher?: string;
  license: string;
}

const CC_BY = "https://creativecommons.org/licenses/by/4.0/";
const MIT = "https://opensource.org/licenses/MIT";

/**
 * 作品清单。2026-11-22 起 Zenodo 上的作品一律写总 DOI（concept DOI）：它总指向最新版本，以后发新版本不用改这里。
 * 名字照 2026-11-22 发布的新版本写。博客 frontmatter 和 src/lib/research.ts 里的 DOI 要和这里一致（scripts/check-entities.mjs 会查）。
 * 写进站上之前先查 https://doi.org/api/handles/<DOI>，responseCode 为 1 才用：安全论文的第一版 DOI（24420920）一直没登记上。
 */
export const WORKS: Work[] = [
  {
    id: "https://doi.org/10.5281/zenodo.24420870",
    type: "ScholarlyArticle",
    label: "Working paper: payment gateways to Merchant of Record platforms",
    name: "Payment Platforms of New Online Sellers, 2023–2026: AI Sellers Make Up a Far Larger Share on Merchant of Record Platforms than on Stripe (Evidence from 200,000 Checkout Links and a $20 Cross-Border Subscription Fee Comparison)",
    description: "Working paper on which payment platforms new online sellers use, from checkout-link data, with an itemized fee comparison for a $20 cross-border subscription.",
    url: `${SITE_URL}/en/research/indie-saas-payments-mor-shift-2026`,
    sameAs: ["https://zenodo.org/records/24420870", "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737182"],
    doi: "10.5281/zenodo.24420870",
    ssrnId: "7737182",
    datePublished: "2026-11-21",
    pdfUrl: `${SITE_URL}/papers/Zhu-2026-Indie-SaaS-Payments-MoR-Shift-Working-Paper.pdf`,
    license: CC_BY,
  },
  {
    id: "https://doi.org/10.5281/zenodo.24420919",
    type: "ScholarlyArticle",
    label: "Working paper: supply-chain security of open-source AI agent skills",
    name: "Supply-Chain Security in Open-Source AI Agent Ecosystems: Security-Grade Coverage in a June 2026 Snapshot of 105,000+ Agent Skills and MCP Servers, and a Five-Dimension Review Checklist",
    description: "Working paper on security grades for open-source AI agent skills and MCP servers in Agent Skills Hub's catalog (June and July 2026 snapshots), with a five-dimension review checklist.",
    url: `${SITE_URL}/en/research/ai-agent-skills-mcp-supply-chain-security-2026`,
    sameAs: ["https://zenodo.org/records/24420919", "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737258"],
    doi: "10.5281/zenodo.24420919",
    ssrnId: "7737258",
    datePublished: "2026-11-21",
    pdfUrl: `${SITE_URL}/papers/Zhu-2026-AI-Agent-Skills-MCP-Supply-Chain-Security-Working-Paper.pdf`,
    license: CC_BY,
  },
  {
    id: "https://doi.org/10.5281/zenodo.24386242",
    type: "Dataset",
    label: "Dataset: payment platform adoption, summary table",
    name: "New Sellers on Seven Checkout Platforms, 2023 to 15 October 2026: Summary Tables",
    description: "Summary table behind the 2026 indie payments report on jasonzhu.ai: new sellers per year and per payment platform, counted from websites that link to hosted checkout pages. The link-level data behind it is not included.",
    url: "https://zenodo.org/records/24386242",
    sameAs: [],
    doi: "10.5281/zenodo.24386242",
    datePublished: "2026-11-20",
    license: CC_BY,
  },
  {
    id: "https://doi.org/10.5281/zenodo.24387071",
    type: "Dataset",
    label: "Dataset: fees on a $20 cross-border subscription",
    name: "Fees Taken from a $20 Cross-Border Subscription, Itemized for Eight Payment Setups (November 2026)",
    description: "Itemized fees on a $20 cross-border subscription for eight payment setups (Merchant of Record platforms and Stripe Hong Kong), most rows from Liu Xiaopai's breakdown of November 2026.",
    url: "https://zenodo.org/records/24387071",
    sameAs: [],
    doi: "10.5281/zenodo.24387071",
    datePublished: "2026-11-20",
    license: CC_BY,
  },
  {
    id: "https://doi.org/10.5281/zenodo.24387073",
    type: "Dataset",
    label: "Dataset: AI agent skills security audit, summary table",
    name: "Security-Grade Coverage in the Agent Skills Hub Catalog: June 2026 Snapshot (105,000+ Entries) and November 2026 Count",
    description: "Share of the Agent Skills Hub catalog with a security grade in a June 2026 snapshot (105,000+ entries), with the catalog count of November 2026.",
    url: "https://zenodo.org/records/24387073",
    sameAs: [],
    doi: "10.5281/zenodo.24387073",
    datePublished: "2026-11-20",
    license: CC_BY,
  },
  {
    id: "https://doi.org/10.5281/zenodo.24387075",
    type: "Dataset",
    label: "Dataset: backlink spam list",
    name: "Backlink Spam List: 581 Doorway Domains and Link Sellers with Public Evidence (Snapshot of 28 October 2026)",
    description: "581 doorway domains and link sellers that sell or fake backlinks, each listed with public evidence such as shared titles, redirects or checkout links (snapshot of 28 October 2026). The live list is kept at jasonzhu.ai/en/backlink-spam-list and on GitHub.",
    url: "https://zenodo.org/records/24387075",
    sameAs: [
      "https://github.com/zhuyansen/backlink-spam-list",
      "https://huggingface.co/datasets/jasonzhuyansen/backlink-spam-doorway-domains-2026",
      "https://www.kaggle.com/datasets/yansenzhu/backlink-spam-doorway-domains-2026",
    ],
    doi: "10.5281/zenodo.24387075",
    datePublished: "2026-11-20",
    downloads: [{ url: "https://raw.githubusercontent.com/zhuyansen/backlink-spam-list/main/list.csv", format: "text/csv" }],
    license: CC_BY,
  },
  {
    id: "https://doi.org/10.5281/zenodo.21292798",
    type: "Dataset",
    label: "Dataset: AI Agent Skills Security Grades (130K), Agent Skills Hub",
    name: "AI Agent Skills Security Grades (130K)",
    description: "Rule-based security grades for about 130,000 open-source AI agent skills and MCP servers indexed by Agent Skills Hub.",
    url: "https://zenodo.org/records/21292798",
    sameAs: [
      "https://www.wikidata.org/wiki/Q141735092",
      "https://huggingface.co/datasets/jasonzhuyansen/agent-skills-security-grades",
      "https://www.kaggle.com/datasets/yansenzhu/agent-skills-security-grades",
    ],
    doi: "10.5281/zenodo.21292798",
    datePublished: "2026-07-10",
    publisher: "https://agentskillshub.top/#organization",
    license: CC_BY,
  },
  {
    id: "https://github.com/zhuyansen/backlink-guard",
    type: "SoftwareSourceCode",
    label: "Software: backlink-guard",
    name: "backlink-guard",
    description: "Checks a link source before you submit to it, verifies the listing, and audits your own backlinks for link-spam patterns. A CLI and an agent skill.",
    url: "https://github.com/zhuyansen/backlink-guard",
    sameAs: ["https://pypi.org/project/backlink-guard/"],
    codeRepository: "https://github.com/zhuyansen/backlink-guard",
    license: MIT,
  },
  {
    id: "https://github.com/zhuyansen/payment-guard",
    type: "SoftwareSourceCode",
    label: "Software: payment-guard",
    name: "payment-guard",
    description: "Helps pick a payment platform you can open and checks a website against the platform's published review requirements before you apply. A CLI and an agent skill.",
    url: "https://github.com/zhuyansen/payment-guard",
    sameAs: ["https://pypi.org/project/payment-guard/"],
    codeRepository: "https://github.com/zhuyansen/payment-guard",
    license: MIT,
  },
  {
    id: "https://github.com/zhuyansen/new-term-radar",
    type: "SoftwareSourceCode",
    label: "Software: new-term-radar",
    name: "new-term-radar",
    description: "Daily radar for new AI terms: names of new models, products and repos seen on X, Hugging Face, GitHub and sitemaps.",
    url: "https://github.com/zhuyansen/new-term-radar",
    sameAs: ["https://pypi.org/project/new-term-radar/"],
    codeRepository: "https://github.com/zhuyansen/new-term-radar",
    license: MIT,
  },
  {
    id: "https://github.com/zhuyansen/ai-visibility-checker",
    type: "SoftwareSourceCode",
    label: "Software: ai-visibility-checker",
    name: "ai-visibility-checker",
    description: "Checks whether AI crawlers and agents can read a website and writes a prompt for a coding agent to fix what failed.",
    url: "https://github.com/zhuyansen/ai-visibility-checker",
    sameAs: [],
    codeRepository: "https://github.com/zhuyansen/ai-visibility-checker",
    license: MIT,
  },
];

/** 作者办的另一个网站。sameAs 只描述它自己。用 Organization 是因为要写 founder，@id 和它自己站上的 JSON-LD 一致。 */
export const RELATED_SITES = [
  {
    id: "https://agentskillshub.top/#organization",
    label: "Agent Skills Hub",
    name: "Agent Skills Hub",
    alternateName: "AgentSkillsHub",
    url: "https://agentskillshub.top/",
    sameAs: [
      "https://www.wikidata.org/wiki/Q141986406",
      "https://www.crunchbase.com/organization/agent-skills-hub",
    ],
  },
];

// ---- JSON-LD：同一个作品在每一页输出同样的节点 ----

/** 指向本人。带上 @type 和 name，只读这一块 JSON-LD 的工具也知道是谁。 */
export const PERSON_REF = { "@type": "Person", "@id": PERSON_ID, name: AUTHOR_NAME };

export function findWorkByDoi(doi: string): Work | undefined {
  const d = doi.replace(/^https?:\/\/doi\.org\//i, "").toLowerCase();
  return WORKS.find((w) => w.doi?.toLowerCase() === d);
}

export function findWork(id: string): Work | undefined {
  return WORKS.find((w) => w.id === id);
}

export function workRef(w: Work) {
  return { "@type": w.type, "@id": w.id, name: w.name };
}

export function workNode(w: Work): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@type": w.type,
    "@id": w.id,
    name: w.name,
    description: w.description,
    url: w.url,
  };
  if (w.sameAs.length) node.sameAs = w.sameAs;
  const ids: Record<string, string>[] = [];
  if (w.doi) ids.push({ "@type": "PropertyValue", propertyID: "DOI", value: w.doi, url: `https://doi.org/${w.doi}` });
  if (w.ssrnId) ids.push({ "@type": "PropertyValue", propertyID: "SSRN", value: w.ssrnId });
  if (ids.length) node.identifier = ids.length === 1 ? ids[0] : ids;
  if (w.datePublished) node.datePublished = w.datePublished;
  node.license = w.license;

  if (w.type === "ScholarlyArticle") {
    node.headline = w.name;
    node.inLanguage = "en";
    node.author = PERSON_REF;
    if (w.pdfUrl) node.encoding = { "@type": "MediaObject", encodingFormat: "application/pdf", contentUrl: w.pdfUrl };
  } else if (w.type === "Dataset") {
    node.creator = PERSON_REF;
    node.isAccessibleForFree = true;
    if (w.doi) node.includedInDataCatalog = { "@type": "DataCatalog", name: "Zenodo", url: "https://zenodo.org" };
    if (w.downloads?.length) {
      node.distribution = w.downloads.map((d) => ({ "@type": "DataDownload", encodingFormat: d.format, contentUrl: d.url }));
    }
  } else {
    node.author = PERSON_REF;
    node.codeRepository = w.codeRepository;
    node.programmingLanguage = "Python";
  }
  if (w.publisher) node.publisher = { "@id": w.publisher };
  return node;
}

/** 文中出现了哪些作品（DOI、Zenodo 记录页、SSRN 论文号、GitHub 仓库、PyPI 页），按 WORKS 的顺序返回。 */
export function worksCitedIn(text: string): Work[] {
  const keys = (w: Work) => {
    const out: string[] = [];
    if (w.doi) {
      const n = w.doi.split("zenodo.").pop();
      out.push(`zenodo.${n}`, `zenodo.org/records/${n}`);
    }
    if (w.ssrnId) out.push(`abstract_id=${w.ssrnId}`);
    if (w.codeRepository) out.push(w.codeRepository.replace(/^https:\/\//, ""));
    for (const u of w.sameAs) if (u.includes("pypi.org/project/")) out.push(u.replace(/^https:\/\//, "").replace(/\/$/, ""));
    return out;
  };
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return WORKS.filter((w) => keys(w).some((k) => new RegExp(`${esc(k)}(?![\\w-])`, "i").test(text)));
}
