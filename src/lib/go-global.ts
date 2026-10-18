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

// 新手先看：John（YouTube「英文SEO实战派」）的每周 AMA，回答读者提问；第一期 John 和搭档（转写里叫 Span）一起答，第二期一个人。
// Jason 推荐给刚开始做出海的人（2026-10-17）。
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
  radar: { url: "https://x.com/GoSailGlobal/status/2109543158761808243", date: "2026-10-12", title: { zh: "直接开源出来新词雷达", en: "Open-sourcing the new-term radar" } },
  seoSystem: { url: "https://x.com/GoSailGlobal/status/2080588406091022747", date: "2026-07-24", title: { zh: "SEO 水系模型更新到 v4 了", en: "The SEO water model, v4" } },
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
  // 10-17 实测后加的，不在那条帖子里：在 jasonzhu.ai 和 agentskillshub.top 各查出一个真问题，但误报多
  {
    what: { zh: "本地全站技术体检，370 多条规则，能对比改版前后", en: "Local technical crawl, 370+ rules, before/after diffs" },
    why: {
      zh: "10 月实测在我两个站各查出一个真问题，但误报多，GEO 和硬门槛类结论只当参考",
      en: "tested in October, it found a real issue on each of my two sites but raises many false alarms; treat GEO and hard-threshold findings as hints",
    },
    name: "seo-audit-skill（SEOmator）",
    url: "https://github.com/seo-skills/seo-audit-skill",
  },
];

/** 上面几个之外的全部：我维护的 Claude SEO skill / MCP / GEO 工具合集（用户 10-18 要求加）。网页版是实时的，GitHub 版是同一份清单 */
export const SEO_TOOLS_DIRECTORY = {
  hub: "https://agentskillshub.top/best/seo-tools/",
  repo: "https://github.com/zhuyansen/awesome-claude-seo-skills",
};

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
  {
    title: { zh: "出海工具链：一个人从需求做到收款", en: "A toolchain for one person, from idea to payment" },
    by: "sitin",
    url: "https://x.com/sitinme/status/1994677962990289190",
    date: "2025-11-29",
    note: {
      zh: "按环节分九类：网站分析、趋势和关键词、竞品分析、开发部署、设计原型、模型 API、找需求、域名、收款，每类两三个常用工具。",
      en: "Nine stages, two or three common tools each: analytics, trends and keywords, competitors, build and deploy, design, model APIs, finding demand, domains, payments. In Chinese.",
    },
  },
];

// 10-17 用户发来的几条 X 帖子：只转述要点、注明作者和原帖，不带帖子里任何人的推荐或专属链接。
export interface SharedPick {
  what: { zh: string; en: string };
  name: string;
  url: string;
  why?: { zh: string; en: string };
  /** 出处（不同条目出自不同帖子时逐条写） */
  by?: string;
  post?: string;
  date?: string;
}

export interface ByPost {
  by: string;
  url: string;
  date: string;
  title: { zh: string; en: string };
}

/** 建站：域名后缀会不会影响排名（Niko） */
export const DOMAIN_TLD = {
  source: {
    by: "Niko",
    url: "https://x.com/guishou_56/status/1973971390220153221",
    date: "2025-10-03",
    title: { zh: "域名后缀到底会不会影响 SEO 排名？", en: "Does the domain ending affect rankings?" },
  } as ByPost,
  points: {
    zh: [
      "后缀对排名基本中立，影响的是信任感和点击习惯。",
      ".com、.net、.org 历史久，信任度和外链点击率更好；国家后缀（.cn、.us、.de）在本地搜索里有加权。",
      ".xyz、.online、.top、.shop 这类新后缀算法上不吃亏，但垃圾站多，搜索引擎更谨慎，要靠内容和外链证明质量。",
      "真正决定排名的是内容质量、外链、点击率和停留时间。",
    ],
    en: [
      "The ending is close to neutral for rankings; it changes trust and click habits.",
      ".com, .net and .org are old and trusted and get more clicks on links; country endings (.cn, .us, .de) get a boost in local results.",
      "New endings such as .xyz, .online, .top and .shop carry no penalty, but spam sites use them, so search engines are warier and content and links have to prove the site.",
      "What ranks a site is content, links, click-through and time on page.",
    ],
  },
};

/** 增长：新站做 GEO 和定页面优先级（子木的帖子，优先级一段出自他的新文章） */
export const GEO_NEW_SITE = {
  source: {
    by: "写增长的子木",
    url: "https://x.com/CoderJeffLee/status/2110992235982737493",
    date: "2026-10-16",
    title: { zh: "GEO，讲讲我的实操点 for 新站", en: "GEO for a new site, in practice" },
  } as ByPost,
  geo: {
    zh: [
      "先在 AI 里建立定位：把产品定位页面做好，让 AI 知道你是什么。",
      "研究 GEO 的内容主题和信源：看 GEO 做得好的竞品，用 Fan-out Queries（AI 把一个问题拆成的多个子查询）找主题；AI 常采信 Reddit、知乎这类信源，就去那里做内容。",
      "做 PR 和品牌，让 AI 采用你、推荐你。",
    ],
    en: [
      "Set your position in AI first: build the product pages that tell it what you are.",
      "Research GEO topics and sources: study competitors that AI already cites and the fan-out queries an AI splits a question into; AI leans on sources such as Reddit and Zhihu, so build content there.",
      "Work on PR and brand so AI uses and recommends you.",
    ],
  },
  priority: {
    zh: [
      "新站资源有限，先后顺序看产品相关性、商业价值、搜索意图、流量潜力、竞争难度和自己能不能交付，不要只按搜索量排。",
      "SEO 必做型页面：首页、功能页、场景页，以及定价、API、文档页，负责说清产品是什么、能做什么、服务谁。词再难、短期排不上，也要先建好，把标题、H1、介绍和 CTA 对上需求。",
      "SEO 增长型页面：工具页、长尾场景页、教程、榜单、对比和替代页，这些才按机会排先后。",
      "增长型按「蓝海词 → 中等词 → 大词」推进。蓝海词不只是搜索量小，还要需求明确、和产品相关、能真正交付结果、竞争可进入、有转化价值。",
    ],
    en: [
      "A new site has little to spend: order the work by product fit, business value, search intent, traffic potential, difficulty and whether you can deliver, not by volume alone.",
      "Must-have pages (home, feature, use-case, pricing, API and docs) say what the product is, does and serves. Build them first even when the terms are hard, with titles, H1s, copy and CTAs that match the need.",
      "Growth pages (tools, long-tail use cases, tutorials, lists, comparisons and alternatives) are the ones you order by opportunity.",
      "Grow from blue-ocean terms to mid-size terms to big ones. A blue-ocean term is not just small: the need is clear, it fits the product, you can deliver the result, the competition is beatable and it can convert.",
    ],
  },
  // Google 官方对 GEO 的说法（AI 优化指南 2026-07-15 + Search Console 帮助），紧挨着子木的做法放，免得把「用扇出查询找主题」读成「一个词建一页」
  official: {
    guide: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?hl=zh-cn",
    report: "https://support.google.com/webmasters/answer/16984139?hl=zh-cn",
    zh: "Google 的官方说法（2026-07-15）：在 Google 搜索里做 GEO 就是做 SEO；把内容「分块」、llms.txt 这类 AI 专用文件、虚假提及，都可以不管；为每个扇出查询单独建页算规模化内容滥用，所以扇出查询拿来找主题，别一个词建一页。网站在 AI 概览和 AI 模式里被展示了多少次，看 Search Console 的「生成式 AI 效果报告」（2026-08-31 起全球可用）。",
    en: "Google's own line (2026-07-15): for Google Search, GEO is SEO. Content chunking, AI-only files such as llms.txt and fake mentions can be ignored, and a page per fan-out query counts as scaled content abuse, so use fan-out queries to find topics, not to make one page each. How often AI Overviews and AI Mode show your site is in Search Console's generative AI performance report, live worldwide since 31 August 2026.",
  },
};

/** 增长：SEO 关键词工具（用户 10-17 给的分组名「seo关键词」） */
export const KEYWORD_TOOLS: SharedPick[] = [
  {
    what: { zh: "关键词难度查询", en: "Keyword difficulty lookup" },
    name: "哥飞的 KD 工具",
    url: "https://seo.web.cafe/kd/",
    why: { zh: "非社群用户每天也能查 100 次", en: "100 lookups a day even outside his community" },
    by: "droidHZ",
    post: "https://x.com/hezhiyan7/status/2064710884791112052",
    date: "2026-06-10",
  },
  {
    what: { zh: "SEO Agent", en: "An SEO agent" },
    name: "哥飞 SEO Agent",
    url: "https://seo.web.cafe/chat/",
    by: "哥飞",
    post: "https://x.com/gefei55/status/2106024221671567671",
    date: "2026-10-02",
  },
  // Jesse 的「佛系 SEO」只留的两样免费工具（见 JESSE_SEO）
  {
    what: { zh: "免费，粗看一个词有多少搜索需求", en: "Free; a rough read of a term's demand" },
    name: "Backlinko Keyword Tool",
    url: "https://backlinko.com/tools/keyword",
    by: "Jesse Lau 遁一子",
    post: "https://x.com/jesselaunz/status/1871673239644360706",
    date: "2024-12-24",
  },
  {
    what: { zh: "看一个词的热度怎么走", en: "How interest in a term moves" },
    name: "Google Trends",
    url: "https://trends.google.com/trends/",
    by: "Jesse Lau 遁一子",
    post: "https://x.com/jesselaunz/status/1871673239644360706",
    date: "2024-12-24",
  },
];

/** 增长：Jesse Lau 的「佛系 SEO」（用户 10-17 发来，2024-12-24 的帖子）：SEO 就照 Google 的新手指南做，工具只留两样免费的 */
export const JESSE_SEO = {
  source: {
    by: "Jesse Lau 遁一子",
    url: "https://x.com/jesselaunz/status/1871673239644360706",
    date: "2024-12-24",
    title: { zh: "我现在是佛系 SEO", en: "My low-effort SEO" },
  } as ByPost,
  zh: "Google 的 SEO 主要就是把 Google 自己的《SEO 新手指南》仔细读完、照着做，别的都不用管。工具从 Ahrefs、Ubersuggest 换成了两样免费的：Backlinko 的关键词工具和 Google Trends，只粗看一个词有多少需求，搜索量小到一天连一块钱都撑不起就不做。Similarweb 只适合打听别人的站，对自己的细分领域没什么用。",
  en: "Google SEO mostly comes down to reading Google's own SEO starter guide carefully and doing what it says; the rest hardly matters. He swapped Ahrefs and Ubersuggest for two free tools, Backlinko's keyword tool and Google Trends, used only for a rough sense of demand: a term whose searches cannot earn even a dollar a day is dropped. Similarweb is for nosing into other sites and does little for his own niche.",
};

/** 增长：上线先装的统计（droidHZ） */
export const ANALYTICS_BASICS = {
  source: {
    by: "droidHZ",
    url: "https://x.com/hezhiyan7/status/1986338996071637054",
    date: "2025-11-06",
    title: { zh: "分享一些常见的数据分析工具", en: "Common analytics tools" },
  } as ByPost,
  picks: [
    {
      what: { zh: "看收录、索引、搜索展示和点击，也在这里请求收录", en: "Indexing, impressions and clicks; request indexing here" },
      name: "Google Search Console",
      url: "https://search.google.com/search-console",
      why: { zh: "填好信息、配一条 DNS 记录就能接入", en: "verified with a DNS record" },
    },
    { what: { zh: "访问量、访问时长、退出率等基础数据", en: "Visits, time on site, exits" }, name: "Google Analytics", url: "https://analytics.google.com/analytics/web" },
    { what: { zh: "同样看访问量、时长和退出率", en: "The same basics" }, name: "Plausible", url: "https://plausible.io/" },
    { what: { zh: "用户操作录屏和热力图", en: "Session recordings and heatmaps" }, name: "Microsoft Clarity", url: "https://clarity.microsoft.com/" },
  ] as SharedPick[],
  tip: {
    zh: "GA、Plausible 和 Clarity 都是填好信息以后，把官方给的那段代码交给 AI，让它加到网站上。",
    en: "For GA, Plausible and Clarity, fill in the details and hand the snippet they give you to an AI to add to the site.",
  },
};

/** 增长：用 GSC 气泡图挑该改的词和页面（用户 10-17 给的分组名「页面优化方案」）：Jesse Lau 的帖子 + Google 官方教程，
 *  再加同一栏目（监控和调试）里用户发来的两篇官方文档。四个象限的做法两边说法不完全一样，分开写。 */
export const PAGE_TUNING = {
  source: {
    by: "Jesse Lau 遁一子",
    url: "https://x.com/jesselaunz/status/2109774797928612223",
    date: "2026-10-12",
    title: { zh: "Google 官方 SEO 教程里的四象限气泡图", en: "The four-quadrant bubble chart from Google's own SEO guide" },
  } as ByPost,
  doc: {
    url: "https://developers.google.com/search/docs/monitor-debug/bubble-chart-analysis?hl=zh-cn",
    updated: "2025-12-18",
    template: "https://datastudio.google.com/reporting/1e5b5f6a-38d7-4547-a54b-69594681a09b/page/xFbeC/preview?hl=zh-cn",
  },
  setup: {
    zh: "在 Looker Studio 里接上 Search Console（选「网站展示」表），每个查询词画成一个气泡：纵轴是平均排名，倒过来放，第 1 名在最上面；横轴是点击率；两个轴都用对数刻度。气泡越大点击越多，颜色区分设备，两条平均线把图分成四块。默认看过去 28 天。",
    en: "Connect Search Console to Looker Studio (the site impression table) and draw each query as a bubble: average position on the vertical axis, flipped so position 1 is on top, click-through rate on the horizontal one, both on log scales. Bigger bubbles mean more clicks, colours split devices, and two average lines cut the chart into four parts. The default window is the last 28 days.",
  },
  quadrants: [
    { name: { zh: "排名高、点击率高", en: "High rank, high CTR" }, act: { zh: "不用动，现在就很好。", en: "Leave them; they already work." } },
    {
      name: { zh: "排名低、点击率高", en: "Low rank, high CTR" },
      act: {
        zh: "用户翻到后面还愿意点，说明需要你，但 Google 觉得页面和词不够匹配。有对应的页面就给这个词补内容，没有就专门做一页；这类词排名一上去，效果最明显。",
        en: "People scroll down and still click, so they want you, but Google sees a weak match. Add content for the query to the page that covers it, or make a page if none does; these gain the most once the rank rises.",
      },
    },
    {
      name: { zh: "排名低、点击率低", en: "Low rank, low CTR" },
      act: {
        zh: "先分相关和不相关。和产品相关的词，内容和标题一起改，这比从零去抢一个还没出现在搜索里的词容易；不相关的放掉，把力气花在能带来对口流量的词上。",
        en: "Split them first. For queries that fit your product, rework the content and the title, which is easier than starting on a query you do not appear for at all; let the unrelated ones go and spend the effort on queries that bring the right visitors.",
      },
    },
    {
      name: { zh: "排名高、点击率低", en: "High rank, low CTR" },
      act: {
        zh: "Jesse 认为这类词多半被 AI 摘要截走了点击，没太好的办法。Google 给的检查方向：对手是不是用了结构化数据、显示成富媒体结果；这个词是不是用户本来就不想找你；用户是不是在摘要里就拿到了答案。想让人点进来，就改标题和描述。",
        en: "Jesse thinks AI Overviews take most of these clicks and there is little to do. Google suggests checking whether competitors show rich results from structured data, whether people searching it want something else, and whether the snippet already answers them; if you want the click, rewrite the title and description.",
      },
    },
  ],
  next: {
    zh: "挑出词以后，在 Search Console 里按这个查询筛选，找到它对应的页面，再把标题、描述、图片 alt 和小标题改得具体、准确。",
    en: "Once you have the queries, filter by each one in Search Console to find its pages, then make their titles, descriptions, image alt text and headings specific and accurate.",
  },
  more: [
    {
      title: { zh: "GSC 和 GA 一起看", en: "Search Console and Analytics together" },
      url: "https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console?hl=zh-cn",
      updated: "2026-01-09",
      template: "https://lookerstudio.google.com/reporting/408e669d-07d1-4353-a1dc-94f06bde27ef/page/Hqrp/preview?hl=zh-cn",
      note: {
        zh: "官方模板把 GSC 的点击和 GA 的自然搜索会话并排放。两边数字对不上是正常的，看趋势一不一致；搜索表现以 GSC 为准，站内行为以 GA 为准。",
        en: "Google's template puts Search Console clicks beside Analytics organic sessions. The numbers never match exactly; check that the trends do. Search Console is the truth for search, Analytics for what people do on the site.",
      },
    },
    {
      title: { zh: "社交和视频内容在 Google 上的表现", en: "Your social and video posts in Google Search" },
      url: "https://developers.google.com/search/docs/monitor-debug/analyze-social-video-content?hl=zh-cn",
      updated: "2026-09-12",
      note: {
        zh: "X、YouTube、TikTok、Instagram 账号可以作为「平台资源」加进 Search Console，看别人在 Google 上搜什么词找到你的帖子和视频；有 24 小时过滤，能看新视频是不是在起量，还能对比 YouTube 长视频（/watch）和 Shorts（/shorts/）。",
        en: "X, YouTube, TikTok and Instagram accounts can be added to Search Console as platform properties, showing which Google searches find your posts and videos. A 24-hour filter shows whether a new video is taking off, and you can compare long YouTube videos (/watch) with Shorts (/shorts/).",
      },
    },
  ] as { title: { zh: string; en: string }; url: string; updated: string; template?: string; note: { zh: string; en: string } }[],
};

/** 增长：没学过 SEO 先补课（用户 10-17 发来）。Google 搜索中心的官方文档（中文版），加哥飞列的学习顺序。
 *  web.cafe 是哥飞的付费社群：标题和目录公开、教程正文要会员登录，页面上写明；只链教程本身，不转述正文。 */
export interface LearnLink {
  label: string;
  url: string;
  /** 有英文版的（比如 Ahrefs 的课程），英文页链英文版 */
  en?: { label: string; url: string };
}

export const LEARN_SEO = {
  google: {
    home: "https://developers.google.com/search/docs?hl=zh-cn",
    // 10-17 逐篇打开核过标题和「最后更新时间」
    reads: [
      {
        title: { zh: "SEO 入门指南", en: "SEO Starter Guide" },
        url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=zh-cn",
        updated: "2025-12-18",
        why: {
          zh: "从这篇开始：Google 怎么找到、看懂你的网站，网址、标题、摘要、链接、图片这些基本功，最后一节专讲不用操心的事",
          en: "start here: how Google finds and understands a site, the basics of URLs, titles, snippets, links and images, and a closing section on what not to worry about",
        },
      },
      {
        title: { zh: "Google 搜索运作方式的深度指南", en: "How Google Search works, in depth" },
        url: "https://developers.google.com/search/docs/fundamentals/how-search-works?hl=zh-cn",
        updated: "2025-12-18",
        why: { zh: "抓取、编入索引、呈现结果三个阶段，页面没被收录时知道卡在哪一步", en: "crawling, indexing and serving, so you know where a missing page got stuck" },
      },
      {
        title: { zh: "Google 搜索要素", en: "Google Search Essentials" },
        url: "https://developers.google.com/search/docs/essentials?hl=zh-cn",
        updated: "2025-12-18",
        why: { zh: "能进 Google 的门槛：技术要求、垃圾内容政策和几条关键最佳实践", en: "the bar for appearing at all: technical requirements, spam policies and the key best practices" },
      },
      {
        title: { zh: "垃圾内容政策", en: "Spam policies" },
        url: "https://developers.google.com/search/docs/essentials/spam-policies?hl=zh-cn",
        updated: "2026-09-02",
        why: {
          zh: "哪些做法会被降权甚至移除：买卖链接、批量生成内容、滥用过期域名、借别人网站的声誉等",
          en: "what gets a site demoted or removed: buying or selling links, scaled content, expired domains, borrowing another site's reputation and more",
        },
      },
      {
        title: { zh: "创建实用、可靠、以用户为中心的内容", en: "Creating helpful, reliable, people-first content" },
        url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=zh-cn",
        updated: "2026-10-08",
        why: {
          zh: "一组自查问题，看内容是写给人看的还是为排名凑的；10 月新加的「主要内容」一节说，只靠 Feed 自动生成页面、用 AI 批量写又没人把关，算几乎没有投入，注明出处也替代不了原创",
          en: "questions for checking whether content is written for people or for rankings; a section added in October says pages generated from a feed, or AI text in bulk without human review, show next to no effort, and citing sources does not replace original work",
        },
      },
      // 原来放的是《AI 功能和您的网站》（2025-12-31），换成更新、更完整的这篇
      {
        title: { zh: "针对 Google 搜索中的生成式 AI 功能优化网站", en: "Optimizing your website for generative AI features on Google Search" },
        url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?hl=zh-cn",
        updated: "2026-07-15",
        why: {
          zh: "Google 对 GEO 的正式说法：在 Google 搜索里它就是 SEO；哪些 GEO 技巧可以不管，为什么不该给每个扇出查询单独建页",
          en: "Google's formal line on GEO: for Google Search it is SEO; which GEO tricks to ignore, and why not to build a page per fan-out query",
        },
      },
      {
        title: { zh: "Search Console 使用入门", en: "Get started with Search Console" },
        url: "https://developers.google.com/search/docs/monitor-debug/search-console-start?hl=zh-cn",
        updated: "2025-12-18",
        why: {
          zh: "上线后：验证网站、看收录、提交站点地图、看搜索效果；官方建议大约每月看一次，改了内容再看",
          en: "after launch: verify the site, check indexing, submit a sitemap, read performance; Google suggests a look about once a month and after changes",
        },
      },
      {
        title: { zh: "调试 Google 搜索流量下降问题", en: "Debugging drops in Google Search traffic" },
        url: "https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops?hl=zh-cn",
        updated: "2025-12-18",
        why: {
          zh: "流量掉了先按这篇排查：算法更新、技术问题、安全问题、垃圾内容、季节变化还是改版迁移，再拉 16 个月数据找规律",
          en: "when traffic drops, check this first: an algorithm update, a technical or security problem, spam, seasonality or a site move, then read 16 months of data for patterns",
        },
      },
    ] as { title: { zh: string; en: string }; url: string; updated: string; why: { zh: string; en: string } }[],
  },
  gefei: {
    steps: [
      {
        zh: "先把 Ahrefs 的免费 SEO 课程粗读一遍，不用读懂，知道有哪些概念就行。",
        en: "Skim Ahrefs' free SEO course once; you only need to know the ideas exist.",
        links: [{ label: "Ahrefs：SEO 新手指南", url: "https://ahrefs.com/zh/seo", en: { label: "Ahrefs: SEO basics", url: "https://ahrefs.com/seo" } }],
      },
      {
        zh: "再把进阶教程看一遍，这一步也只求了解。",
        en: "Read through the advanced tutorials, again just for the picture.",
        links: [{ label: "进阶教程", url: "https://new.web.cafe/tutorial/0c91c83924e9495aa75384becf6304ff" }],
      },
      {
        zh: "回过头读哥飞写的新手入门。",
        en: "Go back to his beginner tutorials.",
        links: [{ label: "新手入门", url: "https://new.web.cafe/tutorial/7c36c9a7c6e34d21b8f3efd857d980aa" }],
      },
      {
        zh: "学怎么挖需求、找词。",
        en: "Learn to find demand and keywords.",
        links: [
          { label: "挖掘需求", url: "https://new.web.cafe/tutorial/89afd4d0414d41e6b5f9304ee42df055" },
          { label: "小白怎么找词", url: "https://new.web.cafe/tutorial/detail/fp0zl0dtob" },
        ],
      },
      {
        zh: "学怎么判断一个关键词能不能做。",
        en: "Learn to judge whether a keyword is worth doing.",
        links: [{ label: "如何判断一个关键词是否能做", url: "https://new.web.cafe/tutorial/detail/7v7tfjneg9" }],
      },
      {
        zh: "网站上线以后做什么，拿一个月收入 5 万美元的站把谷歌排名再讲一遍。",
        en: "What to do after launch, with Google ranking explained again through a site making $50k a month.",
        links: [{ label: "上站之后要做什么", url: "https://new.web.cafe/tutorial/detail/sk5je1bj0f" }],
      },
      {
        zh: "工具的落地页怎么设计，从 V1.0 一路改到 V2.0。",
        en: "How to design a tool's landing page, from V1.0 to V2.0.",
        links: [{ label: "落地页从 V1.0 到 V2.0", url: "https://new.web.cafe/tutorial/detail/5yyr7zjxk7" }],
      },
      {
        zh: "照精品工具页面的思路做精品工具站。",
        en: "Build a small, polished tool site, one good tool page at a time.",
        links: [{ label: "如何做精品工具站", url: "https://new.web.cafe/tutorial/detail/za408lc1q9" }],
      },
      {
        zh: "最后跟着「养网站防老」系列把全流程走一遍（11 篇），可以先通读，再一步步照着做。",
        en: "Last, walk the whole process with his eleven-part series on a site to retire on: read it once, then follow it step by step.",
        links: [{ label: "养网站防老", url: "https://new.web.cafe/tutorial/7PG1iQzr3sXx1tyKmf9ZYd" }],
      },
      {
        zh: "外链：哥飞认为博客评论外链依然有用。",
        en: "Backlinks: he finds blog-comment links still useful.",
        links: [
          { label: "博客评论外链怎么找、怎么做", url: "https://new.web.cafe/experience/ao30ki8tzk" },
          { label: "从博客评论外链想到的找需求思路", url: "https://new.web.cafe/topic/xoi32sha0d" },
        ],
      },
    ] as { zh: string; en: string; links: LearnLink[] }[],
    all: "https://new.web.cafe/tutorials",
    note: {
      zh: "web.cafe 是哥飞的付费社群：标题和目录谁都能看，教程正文要开通会员登录后才能读。第一步的 Ahrefs 课程免费。",
      en: "web.cafe is 哥飞's paid community: anyone can see the titles and contents, but reading the tutorials needs a membership. The Ahrefs course in step one is free. All in Chinese.",
    },
  },
  // 哥飞推荐博客评论外链；Google 的垃圾链接政策（2026-09-02 更新）点名了自动建链和评论里的优化链接，紧挨着写清楚
  commentRule: {
    url: "https://developers.google.com/search/docs/essentials/spam-policies?hl=zh-cn#link-spam",
    zh: "Google 的垃圾链接政策（2026-09-02 更新）把「用自动程序或服务给网站建链接」和「评论里带优化过的链接」都算作垃圾链接。评论只在相关的博客里认真写，别用工具批量发，也别塞关键词锚文本。",
    en: "Google's link spam policy (updated 2026-09-02) counts links built with automated programs or services, and comments carrying optimized links, as link spam. Comment only on related blogs and write a real comment; never post in bulk with a tool or stuff keyword anchors.",
  },
};

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
      zh: "竞争大的词很难。John 的看法是：没有外链建设，别的做得再好也很难排上去。我的建议是外链少而精，提交之前用 backlink-guard 查一下对方的站值不值得发。",
      en: "Not for competitive terms. John's view: without link building the rest rarely gets you there. My advice: keep backlinks few and good, and check a site with backlink-guard before you submit to it.",
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
