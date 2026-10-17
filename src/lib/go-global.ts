// 出海专题（/[lang]/go-global）：专题首页按阶段把站内已有的出海文章编成几组。
// 文章用 slug 引用，slug 不存在的会被跳过（改名或下线不会让页面报错）。
import { getAllPosts, type BlogPostMeta } from "@/lib/mdx";

export const GO_GLOBAL = "/go-global";

export interface PostGroup {
  id: string;
  zh: string;
  en: string;
  slugs: string[];
}

export const POST_GROUPS: PostGroup[] = [
  {
    id: "company",
    zh: "注册公司和开银行账户",
    en: "Registering a company and opening a bank account",
    slugs: [
      "uk-company-registration-2hours",
      "uk-company-wise-business-account",
      "uk-company-wise-address-verification",
      "giffgaff-uk-phone-card",
      "us-company-registration-full-guide",
      "indie-hacker-us-company-complete-guide",
      "us-llc-mercury-stripe-168-usd",
      "china-individual-payment-zpay",
    ],
  },
  {
    id: "payments",
    zh: "收款平台和数据",
    en: "Payment platforms and data",
    slugs: ["choose-payment-platform-2026", "indie-payments-report-2026", "bitget-u-card-review"],
  },
  {
    id: "compliance",
    zh: "年审、报税和合规",
    en: "Annual filings, tax and compliance",
    slugs: [
      "uk-company-annual-review-timeline-checklist",
      "uk-company-annual-review-diy-guide",
      "uk-company-annual-review-tax-filing",
      "uk-company-data-protection-fee",
      "us-company-annual-tax-filing-diy",
      "electronic-signature-platform-comparison",
    ],
  },
  {
    id: "tools",
    zh: "工具合集和出海思路",
    en: "Tool lists and ways in",
    slugs: [
      "indie-dev-going-global-tool-collection",
      "zero-cost-indie-dev-going-global-toolkit",
      "going-global-three-essentials",
      "going-global-business-types",
    ],
  },
];

/** 一组文章的元数据，按配置顺序，跳过不存在的 slug */
export function groupPosts(group: PostGroup): BlogPostMeta[] {
  const bySlug = new Map(getAllPosts().map((p) => [p.slug, p]));
  return group.slugs.map((s) => bySlug.get(s)).filter((p): p is BlogPostMeta => Boolean(p));
}

/** 英文页有英文版就用英文标题 */
export function postTitle(post: BlogPostMeta, lang: string): string {
  return lang === "en" && post.titleEn ? post.titleEn : post.title;
}

// 新手先看：John（YouTube「英文SEO实战派」）的每周 AMA，回答读者提问。Jason 推荐给刚开始做出海的人（2026-10-17）。
// 标题、时长、日期取自 YouTube 页面；视频没有字幕，不替它写内容摘要。
export const BEGINNER_VIDEOS = {
  channel: { name: "英文SEO实战派", host: "John", url: "https://www.youtube.com/@seoactionblog" },
  videos: [
    { id: "vz7Y_Px-YEY", title: "Weekly AMA 第一期", date: "2024-04-27", duration: "1:11:48" },
    { id: "gAT7UDF806Y", title: "Weekly AMA 第二期", date: "2024-05-02", duration: "29:23" },
  ],
};

// 我（@GoSailGlobal）在 X 上的出海清单，专题首页按阶段引用。内容是 Jason 自己的推荐，转述要点、附原帖。
export interface Pick {
  what: { zh: string; en: string };
  name: string;
  url: string;
  why?: { zh: string; en: string };
  /** 我的推荐链接：页面上标「推荐链接」，链接带 rel="sponsored"（Google 对推广链接的要求） */
  referral?: boolean;
}

export const MY_POSTS = {
  stack: { url: "https://x.com/GoSailGlobal/status/2093541050614759662", date: "2026-08-29", title: { zh: "出海网站 SaaS 产品推荐", en: "What I use to run a SaaS site" } },
  growth: { url: "https://x.com/GoSailGlobal/status/2093961655747072092", date: "2026-08-30", title: { zh: "补充一些自己在用的出海产品", en: "More tools I use" } },
  backlinks: { url: "https://x.com/GoSailGlobal/status/2090693084317413479", date: "2026-08-21", title: { zh: "免费分享我收集的几大渠道外链", en: "Where I find backlinks" } },
};

export const STACK: Pick[] = [
  { what: { zh: "域名", en: "Domain" }, name: "Cloudflare", url: "https://www.cloudflare.com/products/registrar/", why: { zh: "第二年续费和首年同价", en: "renewals cost the same as the first year" } },
  { what: { zh: "网页托管", en: "Hosting" }, name: "Vercel", url: "https://vercel.com", why: { zh: "单个项目免费，起量后再转 Cloudflare", en: "free for one project; move to Cloudflare once traffic grows" } },
  { what: { zh: "数据库", en: "Database" }, name: "Supabase", url: "https://supabase.com", why: { zh: "免费额度内不花钱", en: "free within its quota" } },
];

/** 支付：我在帖子里首推 Waffo——海外主体用 Waffo，独立开发者用 Waffo Pancake */
export const MY_PAYMENT_PICK = {
  zh: "我首推 Waffo：有海外主体用 Waffo，独立开发者用 Waffo Pancake。",
  en: "My first pick is Waffo: Waffo for a company abroad, Waffo Pancake for an indie developer.",
};

export const DATA_TOOLS: Pick[] = [
  { what: { zh: "站点数据", en: "Site data" }, name: "AITDK", url: "https://x.com/blankwebdev" },
  { what: { zh: "站点数据", en: "Site data" }, name: "SiteData", url: "https://x.com/fantexi997" },
  { what: { zh: "外链和排名数据", en: "Backlink and ranking data" }, name: "哥伦布", url: "https://x.com/jinlv11" },
  { what: { zh: "外链、流量、DR、社媒数据 API", en: "Backlink, traffic, DR and social data API" }, name: "AIsa", url: "https://go.aisa.one/yansen-zhu", referral: true },
];

export const SEO_SKILLS: Pick[] = [
  { what: { zh: "营销技能合集（CRO、文案、SEO、数据分析）", en: "Marketing skills: CRO, copy, SEO, analytics" }, name: "marketingskills（Corey Haines）", url: "https://github.com/coreyhaines31/marketingskills" },
  { what: { zh: "页面 SEO 体检，新手版和进阶技术版", en: "Page SEO audits, beginner and technical" }, name: "seo-audit-skill（子木）", url: "https://github.com/JeffLi1993/seo-audit-skill" },
  { what: { zh: "按 Google 指南和 Ahrefs 清单做 92 项检查", en: "92 checks from Google's guidelines and the Ahrefs checklist" }, name: "seo-audit（Wonfull）", url: "https://github.com/wonfull888/seo-audit" },
];

/** 找新词：我的开源工具 new-term-radar（每天从 X、HF、GitHub、竞品 sitemap 抓新名字，再给关键词表） */
export const NEW_TERM_RADAR = "https://github.com/zhuyansen/new-term-radar";

/** 外链清单（2026-08-21 那条）：一个月 DR 从 0 做到 15 时用的渠道 */
export const BACKLINK_SOURCES = [
  { zh: "用 DataForSEO 抓竞品的外链", en: "Competitors' backlinks pulled from DataForSEO" },
  { zh: "在 X 上收集征集外链的帖子", en: "Call-for-submission posts collected on X" },
  { zh: "Helloleo 分享的外链清单", en: "Helloleo's list" },
  { zh: "哥伦布的外链榜", en: "Columbus's backlink rankings" },
  { zh: "公众号里分享的外链表格", en: "A shared spreadsheet from a WeChat account" },
];

// 新手先看里的另外两样（用户 10-17 发来）：只链原帖、转述要点，不转贴帖子里别人的推荐链接。
export const BEGINNER_EXTRAS = [
  {
    title: { zh: "0 基础做 AI 应用：从想法到上线的终极教程", en: "Build an AI app from zero: from idea to launch" },
    by: "木子不写代码",
    url: "https://www.youtube.com/watch?v=EtTXeQGHgWI",
    date: "2026-05-13",
    duration: "46:28",
    note: {
      zh: "一期跟完就能做出并上线自己的第一个 AI 应用，按章节点进去看。",
      en: "Follow it once and your first AI app is built and live; jump in by chapter. In Chinese.",
    },
    // YouTube 上的 18 个章节（开始秒数），按帖子里的三段分组
    stages: [
      { zh: "基础入门", en: "Basics", chapters: [[42, "AI 编程工具准备", "AI coding tools"], [97, "基本操作和界面", "Basics and the interface"], [271, "智能体插件", "Agent plugins"]] },
      {
        zh: "开发流程",
        en: "Building",
        chapters: [
          [423, "用 superpowers 定开发计划", "A plan with superpowers"], [743, "前端和后端", "Front end and back end"], [845, "Supabase", "Supabase"],
          [886, "API 请求", "API requests"], [968, "子智能体驱动开发", "Sub-agent driven development"], [1031, "环境变量", "Environment variables"],
          [1321, "GitHub", "GitHub"], [1486, "Supabase 密钥", "Supabase keys"], [1610, "数据库迁移", "Database migrations"],
        ],
      },
      {
        zh: "上线实战",
        en: "Launch",
        chapters: [
          [1743, "验收功能", "Checking the features"], [1939, "前端设计优化", "Front-end design"], [2061, "端到端测试", "End-to-end tests"],
          [2234, "网站部署", "Deployment"], [2623, "购买域名", "Buying a domain"], [2682, "总结与展望", "Wrap-up"],
        ],
      },
    ] as { zh: string; en: string; chapters: [number, string, string][] }[],
  },
  {
    title: { zh: "AI 编程出海工具超级清单（2026 版）", en: "The 2026 tool list for shipping AI products abroad" },
    by: "小路",
    url: "https://x.com/xiaoluv12o/status/2044422996539089094",
    date: "2026-04-15",
    note: { zh: "域名、托管、AI 编程工具到上线要用的一整套，每样一句话说清用途。", en: "Domains, hosting and AI coding tools, each in a line. In Chinese." },
  },
];

/** 建站的另一种做法：全放 Cloudflare（左子祯 2026-03-10） */
export const CLOUDFLARE_STACK = {
  by: "左子祯",
  url: "https://x.com/zuozizhen/status/2031233335050313944",
  date: "2026-03-10",
  pieces: {
    zh: "域名、解析和防护在 Cloudflare 一站搞定；前端放 Pages（自带全球 CDN），后端用 Workers，数据库 D1，文件放 R2（不收出站流量费），缓存 KV，图片和视频用 Images、Stream，监控和统计用自带的。免费额度够大部分人起步。",
    en: "Domain, DNS and protection in one place; the front end on Pages (with a global CDN), the back end on Workers, D1 for the database, R2 for files (no egress fees), KV for cache, Images and Stream for media, and the built-in analytics. The free tier is enough for most starts.",
  },
};
