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
      "Payment Platforms of New Online Sellers, 2023–2026: AI Sellers Make Up a Far Larger Share on Merchant of Record Platforms than on Stripe (Evidence from 200,000 Checkout Links and a $20 Cross-Border Subscription Fee Comparison)",
    titleZh:
      "2023–2026 年新卖家用哪些收款平台：MoR 平台上 AI 卖家的占比远高于 Stripe（基于 20 万个收款链接与 20 美元跨境订阅费用对比）",
    subtitle: "Empirical Working Paper · Digital Commerce & FinTech Infrastructure",
    date: "2026-11-21",
    pages: 11,
    pdfPath: "/papers/Zhu-2026-Indie-SaaS-Payments-MoR-Shift-Working-Paper.pdf",
    zenodoDoi: "10.5281/zenodo.24420870",
    zenodoUrl: "https://doi.org/10.5281/zenodo.24420870",
    ssrnId: "7737182",
    ssrnUrl: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737182",
    datasetDois: [
      {
        label: "New sellers on seven checkout platforms, summary tables (Zenodo)",
        doi: "10.5281/zenodo.24386242",
        url: "https://doi.org/10.5281/zenodo.24386242",
      },
      {
        label: "Fees on a $20 cross-border subscription, eight setups (Zenodo)",
        doi: "10.5281/zenodo.24387071",
        url: "https://doi.org/10.5281/zenodo.24387071",
      },
      {
        label: "Backlink spam list, 581 domains (Zenodo)",
        doi: "10.5281/zenodo.24387075",
        url: "https://doi.org/10.5281/zenodo.24387075",
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
      "Independent software and artificial intelligence (AI) developers increasingly monetize global audiences from day one, yet empirical evidence on their payment infrastructure choices remains scarce. Using DataForSEO's link graph to count about 200,000 checkout links on 198,000 websites that link directly to hosted checkout pages on seven payment platforms (Stripe Payment Links, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem, and classic Paddle links), combined with an itemized fee comparison for a $20/month international AI SaaS subscription (most rows from Liu Xiaopai's published breakdown, including Waffo Pancake), this paper documents four patterns between 2023 and October 15, 2026. First, after setting aside 17,000 websites whose checkout link also appears on five or more other sites, the number of new sellers per year rose from 21,000 in 2023 and 29,000 in 2024 to 56,000 in 2025 and 82,000 through October 15, 2026, counting only websites that still linked in October 2026. Second, software's share of new checkout-link sellers broke out of a 6%–8% plateau throughout 2025 to reach 20% in September 2026, while AI products rose from 2% (2023) to 12% (September 2026). Third, AI products make up a far larger share of new sellers on the Merchant of Record (MoR) platforms Dodo Payments (29%), Polar (27%) and Creem (24%) than on Stripe (7%) or Gumroad (8%); because Stripe's seller base is far larger, it still has more AI sellers in absolute numbers (about 7,200, against 2,354 new sellers of any kind on the three MoR platforms combined). Fourth, on one $20 international subscription with surcharges, currency conversion, recurring billing and tax handling included, several MoR setups keep more ($18.82–$18.84 on Dodo Payments' negotiated partner rate; $18.72 on Waffo Pancake before its 1% payout fee; $18.63 on a 3.9% MoR such as Creem after a 1% payout fee; $18.50 on Paddle) than a Hong Kong Stripe stack with Billing, Tax and Radar ($18.21, not an MoR) or Lemon Squeezy ($17.92; it stops processing payments on March 31, 2027).",
    abstractZh:
      "本文用 DataForSEO 的链接图，数了 7 家收款平台（Stripe 收款链接、Gumroad、Lemon Squeezy、Polar、Dodo Payments、Creem、Paddle 旧版收款链接）上 19.8 万个网站的约 20 万个收款链接，再加上一份 20 美元/月跨境 AI SaaS 订阅的逐项费用对比（大部分来自刘小排公开的拆算，含 Waffo Pancake），记录 2023 年到 2026 年 10 月 15 日的四个现象：每年新卖家从 2023 年的 2.1 万增加到 2026 年（截至 10 月 15 日）的 8.2 万（只计今天仍挂着链接的站）；新卖家里卖软件的比例 2026 年 9 月到了 20%，AI 产品 12%；Dodo Payments（29%）、Polar（27%）、Creem（24%）这几家 MoR 平台的新卖家里 AI 产品的占比远高于 Stripe（7%），但按绝对数 Stripe 的 AI 卖家（约 7,200 个）仍多于这三家所有新卖家的总和（2,354 个）；一笔 20 美元订阅算上各项附加费后，几种 MoR 方案到手的钱比香港 Stripe 全套更多。",
    bibtexKey: "zhu2026indiepayments",
    bibtex: `@techreport{zhu2026indiepayments,
  author      = {Zhu, Jason (Yansen Zhu)},
  title       = {Payment Platforms of New Online Sellers, 2023--2026: AI Sellers Make Up a Far Larger Share on Merchant of Record Platforms than on Stripe (Evidence from 200,000 Checkout Links and a \\$20 Cross-Border Subscription Fee Comparison)},
  institution = {BRICKAI (GoSailGlobal LLC) / JasonZhu.AI},
  year        = {2026},
  month       = {11},
  type        = {Working Paper},
  doi         = {10.5281/zenodo.24420870},
  url         = {https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737182},
  note        = {ORCID: 0009-0000-2894-6285; SSRN Abstract ID: 7737182}
}`,
  },
  {
    slug: "ai-agent-skills-mcp-supply-chain-security-2026",
    title:
      "Supply-Chain Security in Open-Source AI Agent Ecosystems: Security-Grade Coverage in a June 2026 Snapshot of 105,000+ Agent Skills and MCP Servers, and a Five-Dimension Review Checklist",
    titleZh:
      "开源 AI Agent 生态的供应链安全：2026 年 6 月 105,000+ 个 Agent Skill 与 MCP 服务器快照里的安全评级覆盖，及一份五维审查清单",
    subtitle: "Empirical Working Paper · AI Systems Security & Software Supply Chains",
    date: "2026-11-21",
    pages: 7,
    pdfPath: "/papers/Zhu-2026-AI-Agent-Skills-MCP-Supply-Chain-Security-Working-Paper.pdf",
    zenodoDoi: "10.5281/zenodo.24420919",
    zenodoUrl: "https://doi.org/10.5281/zenodo.24420919",
    ssrnId: "7737258",
    ssrnUrl: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737258",
    datasetDois: [
      {
        label: "Security-grade coverage, June 2026 snapshot (Zenodo)",
        doi: "10.5281/zenodo.24387073",
        url: "https://doi.org/10.5281/zenodo.24387073",
      },
      {
        label: "AI Agent Skills Security Grades, 130K, July 2026 (Zenodo / Wikidata Q141735092)",
        doi: "10.5281/zenodo.21292798",
        url: "https://doi.org/10.5281/zenodo.21292798",
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
      "Autonomous coding agents—including Claude Code, OpenAI Codex, and Cursor—increasingly rely on community-authored skills and Model Context Protocol (MCP) servers installed directly from GitHub. They run with the host agent's filesystem permissions, shell access and API credentials, yet public marketplaces rank them mostly by GitHub stars. Using the Agent Skills Hub catalog (agentskillshub.top), which the author founded, we report how much of this ecosystem carried any security grade. In a snapshot taken around 10 June 2026 the catalog held 105,000+ entries and 97.8% of them had no security grade; of the 2,300+ entries that had one, 94% were graded safe and about 5.6% caution, unsafe or reject. Coverage has grown since: on 21 November 2026 the catalog listed 281,000+ entries, 142,000+ of them with a rule-based grade, so the June share describes that snapshot only. In a separate snapshot of 6 July 2026 (130,173 entries), the 21,582 repositories with at least 5 GitHub stars were graded by static rules: 3.3% (about 1 in 30) received an UNSAFE or REJECT grade, and that rate was 3.8% for repositories with 5–20 stars against 0.4% for those with 1,000+ stars. We also set out the five-dimension checklist the author used to review 200+ repositories by hand, with three case studies showing why GitHub stars are a weak proxy for both security and engineering quality.",
    abstractZh:
      "本文把开源 AI Agent Skill 与 MCP 服务器当作软件供应链依赖，用 Agent Skills Hub 目录的数据看有多少条目有安全评级。2026 年 6 月 10 日前后的快照里，目录收录 105,000+ 个，97.8% 没有任何安全评级；已有评级的 2,300+ 个里，94% 为安全，约 5.6% 被标为警告、不安全或拒绝。到 2026 年 11 月 21 日，目录收录 28.1 万个，其中 14.2 万个有按规则给出的评级，所以 6 月的比例只代表那次快照。2026 年 7 月 6 日的另一份快照（130,173 条）里，5 星以上的 21,582 个仓库按规则评级，3.3%（约 30 个里 1 个）为不安全或拒绝；5–20 星的仓库是 3.8%，1,000 星以上是 0.4%。文中还给出作者人工审查 200+ 个仓库时用的五维清单和三个案例。",
    bibtexKey: "zhu2026agentskillssecurity",
    bibtex: `@techreport{zhu2026agentskillssecurity,
  author      = {Zhu, Jason (Yansen Zhu)},
  title       = {Supply-Chain Security in Open-Source AI Agent Ecosystems: Security-Grade Coverage in a June 2026 Snapshot of 105,000+ Agent Skills and MCP Servers, and a Five-Dimension Review Checklist},
  institution = {Agent Skills Hub (BRICKAI / GoSailGlobal LLC) and JasonZhu.AI},
  year        = {2026},
  month       = {11},
  type        = {Working Paper},
  doi         = {10.5281/zenodo.24420919},
  url         = {https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737258},
  note        = {ORCID: 0009-0000-2894-6285; SSRN Abstract ID: 7737258; Wikidata: Q141735092}
}`,
  },
];

export const OPEN_DATASETS = [
  {
    name: "New Sellers on Seven Checkout Platforms, 2023 to 15 October 2026: Summary Tables",
    license: "CC-BY-4.0",
    zenodo: "https://doi.org/10.5281/zenodo.24386242",
    github: "https://github.com/zhuyansen/indie-saas-payments-benchmark-2026",
    huggingface: "https://huggingface.co/datasets/jasonzhuyansen/indie-saas-payments-benchmark-2026",
    kaggle: "https://www.kaggle.com/datasets/yansenzhu/indie-saas-payments-benchmark-2026",
  },
  {
    name: "Fees Taken from a $20 Cross-Border Subscription, Itemized for Eight Payment Setups (November 2026)",
    license: "CC-BY-4.0",
    zenodo: "https://doi.org/10.5281/zenodo.24387071",
    github: "https://github.com/zhuyansen/indie-saas-payments-benchmark-2026",
    huggingface: "https://huggingface.co/datasets/jasonzhuyansen/indie-saas-payments-benchmark-2026",
    kaggle: "https://www.kaggle.com/datasets/yansenzhu/indie-saas-payments-benchmark-2026",
  },
  {
    name: "Security-Grade Coverage in the Agent Skills Hub Catalog: June 2026 Snapshot (105,000+ Entries) and November 2026 Count",
    license: "CC-BY-4.0",
    zenodo: "https://doi.org/10.5281/zenodo.24387073",
    github: "https://agentskillshub.top/how-we-grade/",
    huggingface: "https://huggingface.co/datasets/jasonzhuyansen/agent-skills-security-grades",
    kaggle: "https://www.kaggle.com/datasets/yansenzhu/agent-skills-security-grades",
  },
  {
    name: "Backlink Spam List: 581 Doorway Domains and Link Sellers with Public Evidence (Snapshot of 28 October 2026)",
    license: "CC-BY-4.0",
    zenodo: "https://doi.org/10.5281/zenodo.24387075",
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
