import { AUTHOR_ALT_NAME, AUTHOR_NAME, ORCID_ID, ORCID_URL } from "./profiles";

export interface WorkingPaper {
  slug: string;
  title: string;
  titleZh: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  pages: number;
  pdfPath: string; // under /public/papers/...
  zenodoDoi: string;
  zenodoUrl: string;
  ssrnId: string;
  ssrnUrl: string;
  datasetDois: { label: string; doi: string; url: string }[];
  companionBlogSlug: string;
  keywords: string[];
  classification: string;
  abstract: string;
  abstractZh: string;
  bibtexKey: string;
  bibtex: string;
}

export const WORKING_PAPERS: WorkingPaper[] = [
  {
    slug: "indie-saas-payments-mor-shift-2026",
    title:
      "The Structural Shift from Payment Gateways to Merchant of Record Platforms Among Independent Software and AI Founders: Evidence from 200,000 Live Checkout Links and a $20 Cross-Border Subscription Fee Audit (2023–2026)",
    titleZh:
      "独立软件与 AI 创始人从支付网关向 Merchant of Record 平台的结构性迁移：基于 20 万活跃结账链接与 $20 跨境订阅费率审计的实证研究（2023–2026）",
    subtitle: "Empirical Working Paper · Digital Commerce & FinTech Infrastructure",
    date: "2026-11-21",
    pages: 10,
    pdfPath: "/papers/Zhu-2026-Indie-SaaS-Payments-MoR-Shift-Working-Paper.pdf",
    zenodoDoi: "10.5281/zenodo.24420871",
    zenodoUrl: "https://doi.org/10.5281/zenodo.24420871",
    ssrnId: "7737182",
    ssrnUrl: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737182",
    datasetDois: [
      {
        label: "200k Indie Checkout Links Dataset (Zenodo)",
        doi: "10.5281/zenodo.24386243",
        url: "https://doi.org/10.5281/zenodo.24386243",
      },
      {
        label: "$20 MoR Subscription Fee Benchmark (Zenodo)",
        doi: "10.5281/zenodo.24387072",
        url: "https://doi.org/10.5281/zenodo.24387072",
      },
      {
        label: "Backlink Spam & Checkout Abuse DB (Zenodo)",
        doi: "10.5281/zenodo.24387076",
        url: "https://doi.org/10.5281/zenodo.24387076",
      },
    ],
    companionBlogSlug: "indie-payments-report-2026",
    keywords: [
      "Merchant of Record",
      "Indie SaaS",
      "Cross-Border Payments",
      "AI Monetization",
      "Stripe",
      "Polar",
      "Dodo Payments",
      "Creem",
      "Paddle",
      "Waffo",
    ],
    classification: "JEL: G23, L81, L86, O33",
    abstract:
      "Using a web-scale link-graph census of approximately 200,000 live websites linking directly to hosted checkout pages across seven major payment platforms (Stripe Payment Links, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem, and classic Paddle links) combined with an itemized fee audit of a $20/month international AI SaaS subscription (including Waffo Pancake), this paper documents four structural transformations between 2023 and October 2026. After excluding 17,000 shared or abused checkout domains, annual seller cohorts expanded nearly fourfold (21,000 in 2023 to 82,000 through Oct 15, 2026); software share jumped from 6%–8% (2025) to 20% (Sept 2026) with AI rising to 12%; AI founders disproportionately select MoR platforms (29% on Dodo, 27% on Polar, 24% on Creem vs. 7% on Stripe); and modern MoR stacks retain $18.50–$18.84 on a $20 international order, outperforming a Hong Kong Stripe full SaaS stack ($18.21, non-MoR) and Lemon Squeezy ($17.92, sunsetting March 31, 2027).",
    abstractZh:
      "本文基于覆盖全球约 20 万活跃结账链接网站的图谱普查（覆盖 Stripe、Gumroad、Lemon Squeezy、Polar、Dodo Payments、Creem、Paddle）及 $20/月跨境 AI SaaS 订阅逐项费率审计（含 Waffo Pancake），实证揭示了 2023–2026 年独立开发者支付基础设施的四项结构性变化：新入场独立卖家近四倍增长、软件占比跃升至 20%（AI 占 12%）、AI 创始人向 MoR 平台显著迁移，以及计入跨境/汇兑/税费附加费后现代 MoR 实际到手高于香港 Stripe 全栈。",
    bibtexKey: "zhu2026indiepayments",
    bibtex: `@techreport{zhu2026indiepayments,
  author      = {Zhu, Jason (Yansen Zhu)},
  title       = {The Structural Shift from Payment Gateways to Merchant of Record Platforms Among Independent Software and AI Founders: Evidence from 200,000 Live Checkout Links and a \\$20 Cross-Border Subscription Fee Audit (2023--2026)},
  institution = {BRICKAI (GoSailGlobal LLC) / JasonZhu.AI},
  year        = {2026},
  month       = {11},
  type        = {Working Paper},
  doi         = {10.5281/zenodo.24420871},
  url         = {https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737182},
  note        = {ORCID: 0009-0000-2894-6285; SSRN Abstract ID: 7737182}
}`,
  },
  {
    slug: "ai-agent-skills-mcp-supply-chain-security-2026",
    title:
      "Supply-Chain Security in Open-Source AI Agent Ecosystems: Empirical Evidence and a Five-Dimension Audit Framework Across 105,000+ Indexed Agent Skills and Model Context Protocol (MCP) Servers",
    titleZh:
      "开源 AI Agent 生态的供应链安全实证研究：面向 105,000+ Agent Skills 与 MCP 服务器的五维安全审计框架（2026）",
    subtitle: "Empirical Working Paper · AI Systems Security & Software Supply Chains",
    date: "2026-11-21",
    pages: 7,
    pdfPath: "/papers/Zhu-2026-AI-Agent-Skills-MCP-Supply-Chain-Security-Working-Paper.pdf",
    zenodoDoi: "10.5281/zenodo.24420920",
    zenodoUrl: "https://doi.org/10.5281/zenodo.24420920",
    ssrnId: "7737258",
    ssrnUrl: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737258",
    datasetDois: [
      {
        label: "105k AI Agent Skills Security Audit Snapshot (Zenodo)",
        doi: "10.5281/zenodo.24387074",
        url: "https://doi.org/10.5281/zenodo.24387074",
      },
      {
        label: "130k AI Agent Skills Security Grades Census (Zenodo / Wikidata Q141735092)",
        doi: "10.5281/zenodo.21292799",
        url: "https://doi.org/10.5281/zenodo.21292799",
      },
    ],
    companionBlogSlug: "agent-skill-security-audit-200",
    keywords: [
      "AI Agent Security",
      "Model Context Protocol",
      "MCP Servers",
      "Claude Skills",
      "Software Supply Chain",
      "Static Analysis",
      "Prompt Injection",
      "AgentSkillsHub",
    ],
    classification: "ACM CCS: Security and privacy → Software and application security",
    abstract:
      "Autonomous coding agents—including Claude Code, OpenAI Codex, and Cursor—increasingly rely on community-authored skills and Model Context Protocol (MCP) servers installed directly from GitHub with full local shell and credential privileges. Drawing on Agent Skills Hub's open census (105,000+ entries in the benchmark audit snapshot; 130,173+ graded catalog records archived at CERN Zenodo and Wikidata Q141735092), this paper reveals an acute visibility gap: 97.8% (102,690 of 105,000+) indexed skills had never undergone any published security review. Across 2,300+ deeply audited skills, 94.4% passed cleanly while 5.6% triggered caution, unsafe, or rejection flags; across 21,582 popular rule-graded repositories, approximately 1 in 30 receives an UNSAFE or REJECT rating. We formalize a five-dimension supply-chain audit framework (Code Layer, Credential Handling, Vendor Provenance, Dependency Supply Chain, and Operational Risk) and demonstrate through three real-world case studies why GitHub stars fail as a proxy for security and engineering rigor.",
    abstractZh:
      "本文把开源 AI Agent Skills 与 MCP 服务器视为软件供应链依赖，基于 Agent Skills Hub 公开索引（105,000+ 深度审计快照与 130,173+ 规则分级普查，Wikidata Q141735092）揭示了 97.8% 技能从未经过任何安全审计的“黑盒盲区”，并提出覆盖代码层、凭据托管、维护者可信度、依赖供应链与运营风险的五维审计框架。",
    bibtexKey: "zhu2026agentskillssecurity",
    bibtex: `@techreport{zhu2026agentskillssecurity,
  author      = {Zhu, Jason (Yansen Zhu)},
  title       = {Supply-Chain Security in Open-Source AI Agent Ecosystems: Empirical Evidence and a Five-Dimension Audit Framework Across 105,000+ Indexed Agent Skills and Model Context Protocol (MCP) Servers},
  institution = {Agent Skills Hub (BRICKAI / GoSailGlobal LLC) and JasonZhu.AI},
  year        = {2026},
  month       = {11},
  type        = {Working Paper},
  doi         = {10.5281/zenodo.24420920},
  url         = {https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737258},
  note        = {ORCID: 0009-0000-2894-6285; SSRN Abstract ID: 7737258; Wikidata: Q141735092}
}`,
  },
];

export const OPEN_DATASETS = [
  {
    name: "200,000 Indie Developer Checkout Links & Payment Platform Adoption (2023–2026)",
    license: "CC-BY-4.0",
    zenodo: "https://doi.org/10.5281/zenodo.24386243",
    github: "https://github.com/zhuyansen/indie-saas-payments-benchmark-2026",
    huggingface: "https://huggingface.co/datasets/jasonzhuyansen/indie-saas-payments-benchmark-2026",
    kaggle: "https://www.kaggle.com/datasets/yansenzhu/indie-saas-payments-benchmark-2026",
  },
  {
    name: "Merchant of Record & Payment Gateway Real Fee Benchmark on a $20 AI SaaS Subscription",
    license: "CC-BY-4.0",
    zenodo: "https://doi.org/10.5281/zenodo.24387072",
    github: "https://github.com/zhuyansen/indie-saas-payments-benchmark-2026",
    huggingface: "https://huggingface.co/datasets/jasonzhuyansen/indie-saas-payments-benchmark-2026",
    kaggle: "https://www.kaggle.com/datasets/yansenzhu/indie-saas-payments-benchmark-2026",
  },
  {
    name: "Open-Source AI Agent Skills & MCP Servers Security Grades & Supply-Chain Audit (105K / 130K)",
    license: "CC-BY-4.0",
    zenodo: "https://doi.org/10.5281/zenodo.24387074",
    github: "https://agentskillshub.top/how-we-grade/",
    huggingface: "https://huggingface.co/datasets/jasonzhuyansen/agent-skills-security-grades",
    kaggle: "https://www.kaggle.com/datasets/yansenzhu/agent-skills-security-grades",
  },
  {
    name: "Public Database of Backlink Spam Doorway Domains, Link-Selling Networks & Checkout Abuse (581 Verified Domains)",
    license: "CC-BY-4.0",
    zenodo: "https://doi.org/10.5281/zenodo.24387076",
    github: "https://github.com/zhuyansen/backlink-spam-list",
    huggingface: "https://huggingface.co/datasets/jasonzhuyansen/backlink-spam-doorway-domains-2026",
    kaggle: "https://www.kaggle.com/datasets/yansenzhu/backlink-spam-doorway-domains-2026",
  },
];

export const RESEARCH_IDENTIFIERS = [
  { label: "ORCID", id: ORCID_ID, url: ORCID_URL },
  { label: "Google Scholar", id: "AlP5JacAAAAJ", url: "https://scholar.google.com/citations?user=AlP5JacAAAAJ" },
  { label: "SSRN (Elsevier)", id: "14044888", url: "https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=14044888" },
  { label: "Wikidata (AgentSkillsHub)", id: "Q141986406", url: "https://www.wikidata.org/wiki/Q141986406" },
  { label: "Wikidata (130K Dataset)", id: "Q141735092", url: "https://www.wikidata.org/wiki/Q141735092" },
  { label: "Hugging Face", id: "jasonzhuyansen", url: "https://huggingface.co/jasonzhuyansen" },
  { label: "Kaggle", id: "yansenzhu", url: "https://www.kaggle.com/yansenzhu" },
  { label: "GitHub", id: "zhuyansen", url: "https://github.com/zhuyansen" },
];

export const RESEARCH_AUTHOR = {
  name: AUTHOR_NAME,
  altName: AUTHOR_ALT_NAME,
  orcid: ORCID_ID,
  orcidUrl: ORCID_URL,
  affiliation: "BRICKAI (GoSailGlobal LLC) / JasonZhu.AI",
};

export function getWorkingPaper(slug: string): WorkingPaper | undefined {
  return WORKING_PAPERS.find((p) => p.slug === slug);
}
