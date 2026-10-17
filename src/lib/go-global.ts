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
  // 两期的要点：本机转写后由我们转述（不是逐字稿），t 是开始秒数，点了跳到 YouTube 那一段。
  // 2024 年 4–5 月录的，谈的多是 2024 年 3 月那次核心算法更新前后的情况，页面上要注明时效。
  videos: [
    {
      id: "vz7Y_Px-YEY",
      title: "Weekly AMA 第一期",
      date: "2024-04-27",
      duration: "1:11:48",
      points: [
        { t: 282, zh: "SEO 的未来会延伸到 AI 搜索里；做联盟营销别贪多：专心做一个站、做你最喜欢的内容，再加一种变现（数字产品、课程）。", en: "SEO will extend into AI search; in affiliate, do not spread thin: one site, the content you love most, and another income such as digital products or courses." },
        { t: 542, zh: "SEO 链路是抓取、收录、排名、点击、转化；看数据从大到小拆：月、周、日，再按国家和页面类型；八成转化来自两成页面，盯住它们。", en: "The chain is crawl, index, rank, click, convert; read the data from big to small (month, week, day, then country and page type); 80% of conversions come from 20% of pages, so watch those." },
        { t: 917, zh: "定期更新重要，但别为了更新而更新，只改日期可能被当成刷；按重要程度分级，核心文章每月对照前十名更新，其余半年到一年审一次。", en: "Updating matters, but not for its own sake: changing only the date can be flagged; tier your pages, core articles monthly against the top ten, the rest every six to twelve months." },
        { t: 1163, zh: "找国外写手：合作前说清不收 AI 稿；AI 检测工具不准，最终靠你自己判断写得好不好。", en: "Hiring writers abroad: say up front that AI drafts are not accepted; AI detectors are unreliable, so judge the quality yourself." },
        { t: 1477, zh: "多语言网站：用 hreflang 标签，结构选子目录（像 /jp/ 这样），一般按语言分就够，不用再按国家拆。", en: "Multilingual sites: use hreflang, put languages in subdirectories (like /jp/), and in most cases split by language, not country." },
        { t: 1744, zh: "独立站 SEO：产品页、分类页做能直接成交的词，首页做品牌；辅助内容做话题相关和内链；别在自己的店里写「best X」测评，那是内容站的词。", en: "Store SEO: product and collection pages target buying keywords, the home page the brand; supporting content builds topical relevance and internal links; leave 'best X' roundups to review sites." },
        { t: 2282, zh: "把别人的网站翻译成另一种语言发出来，既是抄袭也是重复内容，谷歌专门打击过。", en: "Publishing a translation of someone else's site is plagiarism and duplicate content, which Google has targeted." },
        { t: 2472, zh: "AI 写、人工审，风险不在 AI，在商业模式：内容站谁写都容易被打，电商、SaaS、有品牌的站问题不大。", en: "AI drafts with human review: the risk is the business model, not AI; content sites get hit whoever writes, stores, SaaS and brand sites far less." },
        { t: 2973, zh: "SEO 标题不用死卡字数，五六十个字符、带上关键词就行；标题是为了在搜索结果里吸引点击，H1 是给进了页面的人看的。", en: "SEO titles need no strict limit: 50–60 characters with the keyword; the title earns the click in search results, the H1 serves readers on the page." },
        { t: 3284, zh: "每次核心算法更新都被打，不一定是你做错了什么；怎么恢复，目前没人说得清。", en: "Being hit by every core update is not necessarily your fault; nobody can yet say how to recover." },
        { t: 3411, zh: "别把鸡蛋放在一个篮子里：最好有自己的产品、服务或品牌，SEO 只是渠道之一。", en: "Do not put all your eggs in one basket: have your own product, service or brand; SEO is one channel among several." },
        { t: 3655, zh: "新手别从「做哪个流量渠道」入手，先想清楚商业模式：你能做、别人做不好的是什么，用户在哪里，再选渠道。", en: "Beginners should not start from the channel: first the business model, what you can do that others cannot, where your users are, then the channel." },
        { t: 3846, zh: "AI 工具导航站一万多个页面都被收录了却没排名：AI 生成的介绍没有价值；可以改成 G2 那样让用户评论打分，新站批量上 AI 页面还可能被少抓、甚至人工处罚。", en: "An AI tools directory with 10,000 indexed but unranked pages: AI-written listings add no value; move toward G2-style user reviews and ratings; a new site pushing AI pages in bulk can lose crawl budget or get a manual action." },
      ] as AmaPoint[],
    },
    {
      id: "gAT7UDF806Y",
      title: "Weekly AMA 第二期",
      date: "2024-05-02",
      duration: "29:23",
      points: [
        { t: 110, zh: "新站一下子用 AI 发大量页面风险很高：站没权重、内容又一般，容易被去索引；就算还被收录，流量也可能比算法更新前掉八九成。", en: "A new site that publishes masses of AI pages at once is at high risk: with no authority and middling content it can be deindexed, and even indexed sites lost 80–90% of traffic after the update." },
        { t: 262, zh: "沙盒期有没有，没人说得清，John 自己不信。", en: "Whether a sandbox exists nobody can say; John does not believe in it." },
        { t: 464, zh: "「采集 + AI」想在谷歌拿排名，2022、2023 年以后基本没戏。", en: "Scraping plus AI as a way to rank on Google stopped working after 2022–2023." },
        { t: 493, zh: "SEO 一半偏文一半偏理：内容是根本，会写最好，不会写就找写手；做技术 SEO 也一样有市场。", en: "SEO is half writing, half engineering: content is the base, so write or hire a writer; technical SEO is in demand too." },
        { t: 553, zh: "外贸站被算法打了：有历史的品牌站别急着重做，先查内容质量；B2B 站写成了内容站、连 About Us、创始人和地址都没有，最容易被打。", en: "A penalized B2B site with a brand and history should not be rebuilt at once: check content quality first; a B2B site turned blog, with no About page, founder or address, is the likeliest to be hit." },
        { t: 773, zh: "电商的颜色、尺寸：每个规格都有人搜，才单独做页面，并改标题、H1 和描述；否则一个页面让用户自己选。", en: "Colour and size variants: give a variant its own page only if people search for it, with its own title, H1 and description; otherwise one page with options." },
        { t: 1080, zh: "想做好技术 SEO：挑一个方向（收录、网站速度），在自己或客户的网站（WordPress、Shopify）上练。", en: "To get good at technical SEO, pick one area (indexing, site speed) and practise on your own or a client's site (WordPress, Shopify)." },
        { t: 1270, zh: "没有外链预算，竞争大的词很难排上去，要跟老板说清楚。", en: "Without a link budget, competitive terms are very hard to rank for; say so to whoever holds the budget." },
        { t: 1506, zh: "SEO 公式以前是「内容 + 外链 + 技术」，现在还要加上用户交互信号和品牌。", en: "The SEO formula used to be content + links + technical; now add user signals and brand." },
        { t: 1596, zh: "不会编程别纠结建站：做电商直接用 Shopify，先想清楚产品和竞争力，找人建站，别追求一次完美。", en: "No coding? Do not agonize over the site: use Shopify for a store, think through the product and its edge first, hire someone to build, and do not aim for perfect." },
      ] as AmaPoint[],
    },
  ],
  timing: {
    zh: "2024 年 4–5 月录的，谈的多是 2024 年 3 月谷歌核心算法更新前后的情况；谷歌 SEO 这两年变化快，部分说法可能已经过时。",
    en: "Recorded in April and May 2024, mostly about Google's March 2024 core update; Google SEO has changed fast since, so some points may be dated.",
  },
};

export interface AmaPoint {
  t: number;
  zh: string;
  en: string;
}

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

// 新手常见问题（专题首页，生成 FAQPage JSON-LD）：前面是专题本身能回答的，后面来自 John 的两期 AMA（注明出处和时间点）。
export interface FaqEntry {
  q: { zh: string; en: string };
  a: { zh: string; en: string };
  /** 站内链接写成 /go-global/... 这样的路径（页面会加语言前缀），站外写完整地址 */
  link?: { href: string; zh: string; en: string };
  /** AMA 出处：哪一期、从第几秒开始 */
  from?: { video: string; t: number };
}

export const NEWBIE_FAQ: FaqEntry[] = [
  {
    q: { zh: "没有公司，能收海外的钱吗？", en: "Can I get paid from abroad without a company?" },
    a: {
      zh: "能。Creem、Dodo Payments、Waffo Pancake 和 PayPal.cn 都接受中国大陆个人开户，Stripe 和 Polar 不行。先用个人开，收入多了再考虑注册公司。",
      en: "Yes. Creem, Dodo Payments, Waffo Pancake and PayPal.cn take individuals in mainland China; Stripe and Polar do not. Start as an individual and register a company once income grows.",
    },
    link: { href: "/go-global/open-account", zh: "个人还是公司，怎么开户 →", en: "Individual or company →" },
  },
  {
    q: { zh: "中国大陆个人能开 Stripe 吗？", en: "Can an individual in mainland China open Stripe?" },
    a: {
      zh: "不能。Stripe 不给中国大陆的个人或公司开户；香港个人户要香港身份证号，美国个人户要 SSN 或 ITIN，所以大陆创业者要用香港或美国公司开。",
      en: "No. Stripe opens no accounts for individuals or companies in mainland China; a Hong Kong individual account needs an HKID and a US one an SSN or ITIN, so a mainland founder opens with a Hong Kong or US company.",
    },
    link: { href: "/go-global/open-account", zh: "看各家对个人和公司的要求 →", en: "What each platform asks →" },
  },
  {
    q: { zh: "第一家收款平台开哪个？", en: "Which payment platform should I open first?" },
    a: {
      zh: "用收款平台选择器，选「谁来收钱」和「卖什么」，会按能不能开户、收不收这类产品和到手多少排出来，并给出开户步骤。社群经验是大陆个人多从 PayPal.cn 或 Waffo Pancake 开始：先接一个跑起来，再按用户地区补渠道。",
      en: "Use the payment platform picker: choose who holds the account and what you sell, and it ranks the platforms by whether you can open them, whether they take the product and what a sale leaves you, with the steps to open. Many mainland sellers start with PayPal.cn or Waffo Pancake: get one running, then add channels by region.",
    },
    link: { href: "/go-global/payments", zh: "打开收款平台选择器 →", en: "Open the picker →" },
  },
  {
    q: { zh: "收款平台要审网站，提交前要准备什么？", en: "The payment platform reviews my site: what should be ready?" },
    a: {
      zh: "不登录就能看到的价格页、服务条款、隐私政策、退款政策、能收信的支持邮箱，法律页面的链接放在页脚。提交前可以用开源工具 payment-guard 按各家公开的清单逐条查一遍；Creem 被拒是终局，尤其要先查。",
      en: "A pricing page visible without logging in, terms, privacy and refund policies, a monitored support email, and the legal pages linked from the footer. Check the site against each platform's published list with the open-source payment-guard first; at Creem a rejection is final.",
    },
    link: { href: "https://github.com/zhuyansen/payment-guard", zh: "payment-guard →", en: "payment-guard →" },
  },
  {
    q: { zh: "域名在哪买，网站放哪？", en: "Where do I buy the domain and host the site?" },
    a: {
      zh: "我用 Cloudflare 买域名（第二年续费和首年同价），网站放 Vercel（单个项目免费），数据库用 Supabase（免费额度够起步）。也可以全放 Cloudflare：Pages、Workers、D1、R2 一站搞定。",
      en: "I buy domains on Cloudflare (renewals cost the same as the first year), host on Vercel (free for one project) and use Supabase for the database (its free tier is enough to start). Or put everything on Cloudflare: Pages, Workers, D1 and R2.",
    },
    link: { href: "/go-global#build", zh: "看建站那一步 →", en: "The build step →" },
  },
  {
    q: { zh: "不会编程，能做出自己的产品吗？", en: "Can I build a product without coding?" },
    a: {
      zh: "能。木子的零基础教程从 AI 编程工具讲到部署和买域名，46 分钟跟完就能上线第一个 AI 应用。John 的建议是别在建站上纠结：做电商直接用 Shopify，先想清楚卖什么产品、有什么竞争力。",
      en: "Yes. Muzi's tutorial goes from AI coding tools to deployment and a domain; follow its 46 minutes and your first AI app is live. John's advice: do not agonize over the site; use Shopify for a store and work out the product and its edge first.",
    },
    from: { video: "gAT7UDF806Y", t: 1596 },
  },
  {
    q: { zh: "新站能不能用 AI 一下子发很多文章？", en: "Can a new site publish lots of AI articles at once?" },
    a: {
      zh: "风险很高。站没有权重、内容又一般，一下子发大量页面容易被去索引；靠「采集 + AI」拿谷歌排名，2022、2023 年以后基本没戏。",
      en: "It is risky. A site with no authority and middling content that publishes masses of pages is easily deindexed, and scraping plus AI stopped ranking on Google after 2022–2023.",
    },
    from: { video: "gAT7UDF806Y", t: 110 },
  },
  {
    q: { zh: "网站被谷歌算法打了，要不要重做一个新站？", en: "My site was hit by a Google update: should I start a new one?" },
    a: {
      zh: "有历史的品牌站别急着重做，先查内容质量。B2B 站写成了内容站、连 About Us、创始人和地址都没有，最容易被打；没有品牌的关键词域名站，放弃也没关系。",
      en: "Not if it is a brand site with history: check content quality first. A B2B site turned into a blog with no About page, founder or address is the likeliest to be hit; a keyword domain with no brand can be let go.",
    },
    from: { video: "gAT7UDF806Y", t: 553 },
  },
  {
    q: { zh: "没有外链预算，SEO 还有机会吗？", en: "Is there a chance in SEO without a backlink budget?" },
    a: {
      zh: "竞争大的词很难：没有外链建设，别的做得再好也很难排上去。外链要少而精，提交之前可以用 backlink-guard 查一下对方的站值不值得发。",
      en: "Not for competitive terms: without link building the rest rarely gets you there. Keep backlinks few and good, and check a site with backlink-guard before you submit to it.",
    },
    from: { video: "gAT7UDF806Y", t: 1270 },
  },
  {
    q: { zh: "新手该从哪个流量渠道入手：SEO、投广告还是社媒？", en: "Which channel should a beginner start with: SEO, ads or social?" },
    a: {
      zh: "John 的建议是别从渠道入手，先想清楚商业模式：你能做、别人做不好的是什么（产品、软件、咨询），用户在哪里，再选渠道。不要为了学 SEO 而做 SEO。",
      en: "John's advice: do not start from the channel. Work out the business model first: what you can do that others cannot (a product, software, consulting) and where your users are, then pick the channel. Do not do SEO for its own sake.",
    },
    from: { video: "vz7Y_Px-YEY", t: 3655 },
  },
  {
    q: { zh: "用 AI 写内容、再人工审核，会被谷歌打吗？", en: "Will Google penalize AI content that a person reviews?" },
    a: {
      zh: "风险不在 AI，在商业模式：纯内容站谁写都容易被打，电商、SaaS、有品牌的站问题不大。谷歌不会因为你用了 AI 就惩罚你，关键还是内容质量。",
      en: "The risk is the business model, not AI: pure content sites get hit whoever writes; stores, SaaS and brand sites far less. Google does not penalize the use of AI as such; quality decides.",
    },
    from: { video: "vz7Y_Px-YEY", t: 2472 },
  },
  {
    q: { zh: "网站要做多语言，用什么结构？", en: "How should a multilingual site be structured?" },
    a: {
      zh: "用 hreflang 标签告诉谷歌每个语言版本，结构选子目录（例如 /jp/），一般按语言分就够了，不用再按国家拆。",
      en: "Use hreflang to tell Google about each language version and put the languages in subdirectories (such as /jp/); in most cases splitting by language is enough, without country versions.",
    },
    from: { video: "vz7Y_Px-YEY", t: 1477 },
  },
  {
    q: { zh: "AI 工具导航站的页面都收录了，为什么没排名？", en: "My AI tools directory is indexed: why does it not rank?" },
    a: {
      zh: "收录不等于有排名。AI 生成的工具介绍在谷歌眼里没有额外价值；可以改成 G2、Trustpilot 那样让用户评论打分，再加有用的资讯和教程。新站一下子上大量 AI 页面，还可能被少抓、甚至人工处罚。",
      en: "Indexed is not ranked. AI-written tool listings add nothing in Google's eyes; move toward G2 or Trustpilot-style reviews and ratings, with useful news and tutorials. A new site pushing AI pages in bulk can also lose crawl budget or get a manual action.",
    },
    from: { video: "vz7Y_Px-YEY", t: 3846 },
  },
];
