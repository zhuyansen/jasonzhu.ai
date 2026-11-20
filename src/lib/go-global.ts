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
    slugs: [
      "dodo-payments-waffo-ai-saas-fee-comparison",
      "choose-payment-platform-2026",
      "indie-payments-report-2026",
      "bitget-u-card-review",
    ],
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
  {
    what: { zh: "16 项植错唯一 100% 检出且 0 误报（8 大审计门禁：CORE-EEAT / CITE / ROAS）", en: "16/16 planted issues found with 0 false claims (8 auditor gates: CORE-EEAT, CITE, ROAS)" },
    name: "aaron-marketing-skills（🥇 实测第 1）",
    url: "https://agentskillshub.top/skill/aaron-he-zhu/aaron-marketing-skills/",
  },
  {
    what: { zh: "本地 CLI 310+ 确定性规则，90 秒检出 15/16 且 0 误报，适合反复回归测试", en: "Local CLI with 310+ deterministic rules; 15/16 found with 0 false claims in 90s" },
    name: "squirrelscan（🥈 实测第 2）",
    url: "https://agentskillshub.top/skill/squirrelscan/squirrelscan/",
  },
  {
    what: { zh: "营销技能合集（CRO、文案、SEO、数据分析），60 秒检出 15/16 且 0 误报", en: "Marketing skills: CRO, copy, SEO, analytics; 15/16 found with 0 false claims in 60s" },
    name: "marketingskills（🥉 Corey Haines）",
    url: "https://github.com/coreyhaines31/marketingskills",
  },
  {
    what: { zh: "把 Google Search Console / Bing / GA4 直接连进 Claude Code 对话查真实曝光与气泡图词", en: "Connect Google Search Console, Bing & GA4 directly into Claude Code via MCP" },
    name: "mcp-gsc / search-console-mcp",
    url: "https://agentskillshub.top/skill/AminForou/mcp-gsc/",
  },
  { what: { zh: "页面 SEO 体检，新手版和进阶技术版", en: "Page SEO audits, beginner and technical" }, name: "seo-audit-skill（子木）", url: "https://github.com/JeffLi1993/seo-audit-skill" },
  {
    what: { zh: "本地全站技术体检，370 多条规则，能对比改版前后", en: "Local technical crawl, 370+ rules, before/after diffs" },
    why: {
      zh: "10 月实测在我两个站各查出一个真问题，但 11 月沙盒实测 64 项里有 6 项误报，GEO 和硬门槛类结论只当参考",
      en: "found a real issue on each of my two sites, though our Nov benchmark flagged 6 false claims among 64 items; treat GEO and hard-threshold findings as hints",
    },
    name: "seo-audit-skill（SEOmator）",
    url: "https://github.com/seo-skills/seo-audit-skill",
  },
];

/** 上面几个之外的全部：我维护的 Claude SEO skill / MCP / GEO 工具合集（11 月已升级至 293 个安全评级 + 16 项植错沙盒横评） */
export const SEO_TOOLS_DIRECTORY = {
  hub: "https://agentskillshub.top/best/seo-tools/",
  repo: "https://github.com/zhuyansen/awesome-claude-seo-skills",
};

/** 通用 SEO 水系模型 v8（2026-10-18 最新版：14 个构件 + 五层水表 + 六道放水闸门 + Jason 6 条排名理论）
 *  源自 ops/seo-watersystem-model.md（v4 → v5 三个月踩坑 → v6 Google 搜索中心技术门与出水口 → v7 Ahrefs 汇水区与 AI 404 回收 → v8 哥飞教程六道节奏闸门） */
export const SEO_WATER_SYSTEM_V8 = {
  lead: {
    zh: "把 SEO 当成一套水系来搭：先有源头才有水可流，力气按「最不 AI（人主导）」排序，不是按「最省事（批量造页）」排序。从 7 月的 v4 演进到 10 月的 v8，吸收了三个月实战踩坑（v5）、Google 搜索中心技术门（v6）、Ahrefs 需求汇水区（v7）和哥飞教程六道节奏闸门（v8），共 14 个构件、5 层水表、6 道闸门：",
    en: "Build SEO as a water system: you need inflows before pipes can carry water, and effort is ordered by what is least automatable (human-led authority), not what is easiest (spinning up pages). Evolved from v4 (July) to v8 (October 2026) across 14 components, 5 layered water meters, and 6 release gates:",
  },
  components: [
    {
      id: "Ⓠ",
      tag: "v7/v8",
      name: { zh: "汇水区 · 需求与商业口径", en: "Catchment · Demand & Commercial Proof" },
      who: { zh: "🤖查 🧑定", en: "🤖 lookup · 🧑 decide" },
      rule: {
        zh: "雨落在哪里：建页前必填三项——① 搜索意图（看前 10 名的页型、格式、角度，页型跟着结果页走）；② 流量潜力（看排第 1 的页面总流量，不看单词搜索量）；③ 商业潜力（0–3 分，v8 要求必附一条赚钱证据：广告透明中心持续投放、Stripe 收银台引荐、BuiltWith 支付/联盟代码或竞品定价）。意图为零，后面水再多也流不进去。",
        en: "Where the rain falls: before building a page, record Search Intent (match Top-10 page type/format/angle), Traffic Potential (total traffic of the #1 page, not single-keyword volume), and Business Value (0–3 score backed by hard monetization proof: Ad Transparency active spend, Stripe checkout referrals, BuiltWith payment tags, or competitor pricing).",
      },
      meter: { zh: "三项填齐且带商业证据的词组占比", en: "% of target clusters with intent + traffic potential + revenue proof" },
    },
    {
      id: "①a",
      tag: "v5/v8",
      name: { zh: "进水口 · 传统外链权威（两层论）", en: "Inflow 1a · Link Authority (Two-Tier Rule)" },
      who: { zh: "🧑 人主导", en: "🧑 Human-led" },
      rule: {
        zh: "外链分两层：权重层 = 自然报道引用 + 可引用数据集/学术凭证（Zenodo DOI 一鱼四吃：CSV → HF/Kaggle 数据集 + DOI + Notebook + Dev.to 文）；发现层 = 免费目录/导航站（只管触发收录和 AI 语料，不传权重，只验收不堆量）。10-06 起停止购买 dofollow 外链；v8 闸门：收录稳定增长后才上第一批外链。",
        en: "Two tiers: Weight tier = earned media citations + citable datasets/DOIs (1 CSV → HF/Kaggle dataset + CERN Zenodo DOI + Notebook + Dev.to article); Discovery tier = free directories (triggers indexing & AI grounding only; pass no weight, do not pile up). Stopped buying dofollow links on 10-06; v8 gate: build links only after indexing grows steadily.",
      },
      meter: { zh: "高权威 referring domains 数", en: "Authoritative referring domains" },
    },
    {
      id: "①b",
      tag: "v5/v7",
      name: { zh: "进水口 · GEO / AI 引用", en: "Inflow 1b · GEO & AI Citations" },
      who: { zh: "🤖备料 🧑发送", en: "🤖 prep · 🧑 ship" },
      rule: {
        zh: "被提及 > 被链接（Ahrefs 7.5 万品牌研究：AI 可见度相关性 YouTube 提及 0.737 > 无链接品牌提及 0.66–0.71 >> 外链数 0.28）。20 题实测 AI 优先引用文档、定价页、数据集和 GitHub，而非泛博客。v7 规则：llms.txt 降为可选（已有留着不再投入）；每月从 GA 筛 AI 来源落到 404 的编造网址，301 接回最相关页。",
        en: "Being mentioned > being linked (Ahrefs 75K-brand study: YouTube mentions r=0.737 > unlinked brand mentions 0.66–0.71 >> backlinks 0.28). Our 20-prompt test showed AI cites docs, pricing pages, datasets, and GitHub far more than generic blog posts. v7 rule: llms.txt is optional; monthly check GA for hallucinated AI referral URLs hitting 404 and 301-redirect them.",
      },
      meter: { zh: "AI 引荐会话 + 品牌被提及数 + AI 来访 404 数", en: "AI sessions + brand mentions + AI-referral 404s" },
    },
    {
      id: "①c",
      tag: "v5",
      name: { zh: "进水口 · 平台原生市场", en: "Inflow 1c · Native Platform Search" },
      who: { zh: "🤖 AI", en: "🤖 AI" },
      rule: {
        zh: "GitHub / npm / PyPI / Chrome 商店 / Toolify / Product Hunt 等平台内部搜索算法（仓库名关键词、20 个 GitHub topics 填满、README 结构化、每日自动更新的 awesome 合集仓库署名带域名）——装进终端和 Agent 的 CLI/MCP 是不走搜索的常驻触点。",
        en: "Internal search engines of GitHub, npm, PyPI, Chrome Web Store, Toolify, and Product Hunt (repo-name keywords, all 20 GitHub topics filled, structured READMEs, daily auto-updated awesome repos with domain attribution, plus CLI/MCP packages).",
      },
      meter: { zh: "平台内搜索排位 / 安装量 / GitHub 榜单浏览量", en: "In-platform rank, installs & GitHub repo views" },
    },
    {
      id: "②",
      tag: "v5",
      name: { zh: "水库 · 品牌实体", en: "Reservoir · Brand Entity" },
      who: { zh: "🤖织图 🧑定名", en: "🤖 schema · 🧑 naming" },
      rule: {
        zh: "权重先蓄进实体，管道才有水可分。避开「水库两刀」（通用类目词当品牌名 + .top/.xyz 低信任后缀）；对外统一写「品牌（域名）」，JSON-LD 声明 alternateName，sameAs 只绑同一实体（有 DOI 的数据集单独建 Dataset 实体更稳），终态验收是搜品牌词出现 Sitelinks。",
        en: "Weight must accumulate in your brand entity first. Avoid generic category names + low-trust TLDs (.top/.xyz); use alternateName in JSON-LD, bind sameAs strictly to the same entity (register DOI datasets as separate Dataset entities), and aim for Google SERP sitelinks on your brand query.",
      },
      meter: { zh: "品牌词位次 + CTR + SERP Sitelinks", en: "Brand query position, CTR & sitelinks" },
    },
    {
      id: "⓪",
      tag: "v6",
      name: { zh: "管材 · 渲染与状态码", en: "Pipe Material · SSR & Status Codes" },
      who: { zh: "🤖 AI", en: "🤖 AI" },
      rule: {
        zh: "Google 处理顺序是「发现→抓取→渲染→索引→排名→展示」。① 每种页型每月抽 1 页用 GSC「测试实际网址」确认正文和内链在初始/渲染 HTML 里；② 多语言必须独立网址 + 双向 hreflang，绝不靠脚本或 Cookie 切语言；③ 站内链接一律 <a href>；④ 不存在的页真返 404/410（防 SPA 软 404）。",
        en: "Verify Google reads what you see: (1) monthly GSC Live URL Test per template to confirm body copy and links exist in initial/rendered HTML; (2) separate URLs + bidirectional hreflang per language (never JS/cookie text swapping); (3) real <a href> links; (4) true 404/410 for missing pages (no SPA soft-404s).",
      },
      meter: { zh: "实际网址抽查通过数 + 404 / 软 404 / 重定向错误数", en: "Live URL test pass rate + 404 / soft-404 / redirect errors" },
    },
    {
      id: "③",
      tag: "v5",
      name: { zh: "分层 · 站点架构", en: "Hierarchy · Site Architecture" },
      who: { zh: "🤖 AI", en: "🤖 AI" },
      rule: {
        zh: "架构先于一切：先定计划收录总页数 N，按 hub → cluster → 子页主题分层；关键词地图严格「一个词组一个网址」，建页前先 grep slug + 查真实 PV 防同站两页自相残杀（Cannibalization）。",
        en: "Architecture before scale: know your target indexed page count N, structure as hub → cluster → leaf, enforce one keyword cluster per URL, and check existing slugs/traffic before creating pages to prevent cannibalization.",
      },
      meter: { zh: "目录层级深度（≤3 跳）+ 同词自相竞争页数", en: "Click depth (≤3 hops) & zero self-cannibalization" },
    },
    {
      id: "④",
      tag: "v5",
      name: { zh: "流动 · 内链传权", en: "Flow · Internal Link Routing" },
      who: { zh: "🤖 AI", en: "🤖 AI" },
      rule: {
        zh: "把权重从「拿到外链的页（首页/数据报告）」导向「要冲排名的商业场景页（/best/）」。孤儿页 = 断管；内链必须写进服务端静态 HTML（仅靠前端 hydration 渲染的链接爬虫看不见），标签和站内搜索别生成可抓取新网址。",
        en: "Route authority from link-earning pages (home/reports) to money pages (/best/ scenarios) using keyword-rich anchors in server-rendered HTML. Orphan pages = broken pipes; never let search/tag filters spawn crawlable URLs.",
      },
      meter: { zh: "孤儿页数（目标 0）+ 核心页静态内链覆盖率", en: "Orphan page count (target 0) & SSR internal link coverage" },
    },
    {
      id: "⑤",
      tag: "v5/v8",
      name: { zh: "撑子页 · 程序化与专题长尾", en: "Sub-Pages · Programmatic & Topic Pages" },
      who: { zh: "🤖 卡阈值", en: "🤖 Gated" },
      rule: {
        zh: "只对有曝光基础（pos 8–20）或 KGR < 0.25 的词建页（pos 50+ 属权威病，盲目造页只稀释整站权重）。页面必须有自己的「交付链理论 + 真实实测区块」，同模板下决定收不收的是有没有第三方之外的独特价值。v8 分批放闸：新页型按 5–10% 一批上，7 天出词率或有点击页占比 ≥1% 才放下一批。",
        en: "Build sub-pages only for terms at pos 8–20 or KGR < 0.25 (pos 50+ is authority starvation). Every page needs its own methodology and hands-on test block. v8 batch gate: release new page types in 5–10% batches; require ≥1% click-earning or 7-day impression rate before unlocking the next batch.",
      },
      meter: { zh: "每批出词率 + 有点击页占已发现页比例（≥1%）", en: "Batch impression rate & click-earning page ratio (≥1%)" },
    },
    {
      id: "⑥",
      tag: "v5/v8",
      name: { zh: "活水 · 时效内容流与 48h 抢词", en: "Living Water · Fresh Feeds & 48h SLA" },
      who: { zh: "🤖 AI", en: "🤖 AI" },
      rule: {
        zh: "带日期的活水页（周报/日报/月度不可改写统计快照）让爬虫勤来——实测日报 sitemap 是 Google 读得最勤的子图，最适合挂新页入口。零供给新词寿命约 2.5 周，新工具/新模型发布 48h 内出专页，浪潮退后用带核心词的锚文本把权重汇回泛词主干页。v8 闸门：新页上线 48h 查 GSC 是否出词。",
        en: "Dated content streams (weekly reports, daily digests, immutable monthly stats snapshots) train crawlers to visit daily. New-term waves last ~2.5 weeks: ship event pages within 48h, link them back to evergreen hub pages, and run a mandatory 48-hour GSC impression check after launch.",
      },
      meter: { zh: "新页 48 小时出词率 + 活水子图抓取频次", en: "48-hour new-page impression rate & feed crawl frequency" },
    },
    {
      id: "⑦",
      tag: "v5/v6/v7/v8",
      name: { zh: "排水 · 索引卫生与丢链回收", en: "Drainage · Index Hygiene & Link Recovery" },
      who: { zh: "🤖 AI", en: "🤖 AI" },
      rule: {
        zh: "保护整站有用内容评价：① 低质/低星页果断 noindex,follow（排水闸）；② 每月记 N（计划收录）/ M（已收录）/ X（未收录）并确认每个子 sitemap 真被 Google 读取；③ v6 监控「Google 选择的规范网页与用户指定不同」；④ v7 每月筛「有外链 + 404」网址 301 找回权重；⑤ v8 闸门：「已发现/已抓取未索引」连续两月上涨立即停发新页先清淤。",
        en: "Protect site-wide quality evaluation: (1) noindex,follow thin pages; (2) track N/M/X monthly and verify every child sitemap is actually read; (3) v6 monitor 'Google-selected canonical differs from user'; (4) v7 301-redirect any 404 URL that has backlinks; (5) v8 gate: halt new page creation if Discovered/Crawled-not-indexed rises for 2 consecutive months.",
      },
      meter: { zh: "N/M/X 收录比 + 规范不一致数 + 带外链 404 数（目标 0）", en: "N/M/X ratio + canonical mismatches + backlinked 404s (0)" },
    },
    {
      id: "⑩",
      tag: "v6",
      name: { zh: "出水口 · 结果页展示与首屏 BLUF", en: "Outlet · SERP Snippet & First-50-Words BLUF" },
      who: { zh: "🤖 AI", en: "🤖 AI" },
      rule: {
        zh: "排名之后、点击之前是单独一道工序：① 每页唯一 title（与 H1 一致、用真实搜索词、≤60 字符防改写）与 meta description；② 首页 WebSite schema 声明 name + alternateName；③ H1 正下方首段前 50 词直出 BLUF 断言结论 + 适用人群 + 硬核实测统计（吃透 AI Overview 首段引用与精选摘要）。",
        en: "Ranking is not clicking: (1) unique title matching H1 with real search terms ≤60 chars + unique meta description; (2) homepage WebSite schema with name + alternateName; (3) opening 50-word BLUF right below H1 stating the verdict, who it is for, and hard stats to win AI Overviews and snippets.",
      },
      meter: { zh: "同位次点击率（改标题 2–4 周回看）+ 首段 BLUF 覆盖率", en: "Same-position CTR (2–4w post-edit) & 50-word BLUF coverage" },
    },
    {
      id: "⑧",
      tag: "v5",
      name: { zh: "水车+回流 · 转化、留存与去机房噪声", en: "Waterwheel · Conversion, Retention & Bot Filtering" },
      who: { zh: "🤖埋 🧑看", en: "🤖 instrument · 🧑 review" },
      rule: {
        zh: "埋点看水做不做功（复制安装命令、跑体检、点收银台、表单线索增设「How did you find us?」AI 归因字段），订阅/告警把流过的水收回水库。v5 铁律：读 GA 前必须先剔除机房无头浏览器流量（曾占原始会话 80%+），预渲染静态壳共用单一埋点函数防漏报。",
        en: "Measure whether water turns the wheel (install copies, audit runs, checkout clicks, lead forms with 'How did you find us?' AI attribution). v5 rule: strip datacenter headless-browser traffic (often 80%+ of raw sessions) before reading GA4, and share one analytics helper across all pre-rendered HTML shells.",
      },
      meter: { zh: "真人会话转化率 + 订阅回流数 + 真实收款账本", en: "Human session conversion rate, subscribers & net revenue" },
    },
    {
      id: "⑨",
      tag: "v5/v6/v8",
      name: { zh: "迭代 · 五层水表与每周单实验闭环", en: "Iteration · 5-Layer Meters & Weekly 1-Experiment Loop" },
      who: { zh: "🤖 AI", en: "🤖 AI" },
      rule: {
        zh: "水表从三层升为五层：① 点击层（GSC + GA 真人会话）· ② 引用层（GSC 生成式 AI 报告 + Bing AI Performance + Clarity 引用 + 20 题多引擎实测，实测 AI 引用量是点击量的 9 倍）· ③ 权威层（DR + 高权威引荐域）· ④ 收录层（N/M/X + 子站点地图读取 + Bing 收录数）· ⑤ 管材层（GSC 实际网址测试 + 404/规范网址一致率）。每周复盘只记「3 胜 3 忧 + 恰好 1 个实验」并写死回看日期；v8 规定每月必查一次 Bing 站长后台扫描报告。",
        en: "Five layered meters: (1) Clicks (GSC + bot-filtered GA4), (2) AI Citations (GSC Generative AI report + Bing AI Performance + Clarity + 20-prompt live panel — AI citations run 9× AI clicks), (3) Authority (DR & referring domains), (4) Indexing (N/M/X + child sitemap reads + Bing index count), (5) Pipe Health (GSC Live URL test + 404/canonical match). Weekly retro picks 3 wins, 3 worries, and exactly 1 dated experiment; v8 adds a mandatory monthly Bing Webmaster check.",
      },
      meter: { zh: "五层月检完成率 + 每周单实验按期回看率", en: "5-layer monthly audit completion & dated experiment follow-through" },
    },
  ],
  gatesV8: {
    zh: [
      "⑤ 分批放闸：新页型按 5–10% 一批上，7 天出词率或有点击页占比 ≥1% 才放下一批。",
      "⑥ 48 小时出词检查：新页上线 48h 查 GSC 是否出词，没出立刻查渲染、字数、标题与核心词密度。",
      "⑦ 未索引熔断闸门：「已发现/已抓取未编入索引」连续两月上涨立即停发新页，先合并/noindex/补内容。",
      "①a 按信号上外链：收录稳定增长后才做第一批外链；8–20 名词变多时先对标前 5 名改内容。",
      "Ⓠ 商业口径硬化：搜索量统一用 Google Ads API 口径，商业潜力分必须附一条同行真金白银赚钱证据。",
      "⑨ Bing 月检闸门：每月查一次 Bing 站长后台扫描报告与站点地图读取（防 Bing 曝光暗跌 80% 无人察觉）。",
    ],
    en: [
      "⑤ Batch Release Gate: roll out new page types in 5–10% batches; require ≥1% click-earning or 7-day impression rate before the next batch.",
      "⑥ 48-Hour Impression Check: verify GSC impressions 48h after publishing; if zero, check SSR HTML, word count, title, and keyword density.",
      "⑦ Unindexed Circuit Breaker: if Discovered/Crawled-not-indexed rises for 2 straight months, freeze new page creation and clean up first.",
      "①a Signal-Led Link Building: start backlinks only after indexing grows steadily; when pos 8–20 terms accumulate, upgrade copy against Top-5 first.",
      "Ⓠ Hard Commercial Proof: standardize volume on Google Ads API and require 1 hard monetization proof per commercial score.",
      "⑨ Monthly Bing Gate: inspect Bing Webmaster scan reports and sitemap reads monthly so silent Bing drops never go unnoticed.",
    ],
  },
  rankingTheory: {
    date: "2026-10-07",
    zh: [
      "大部分关键词靠页面本身就能进前五甚至前三（前提是意图专一、内容完整、讲清「为什么」；如 DR 13 的 PPT 实测页排进前三）。",
      "极度卷的词，拼的是页面以外的 PR、品牌、社媒与声量——页面做满只是入场券。",
      "外链是投票，社媒也是投票（同一机制的不同通道）；会做社媒与品牌声量，就不必迷信外链和 DR。",
      "网站底子不差的前提下，排名与社媒/品牌声量呈近似指数关系；跨过基准线后外链不再是瓶颈。",
      "社媒和品牌有壁垒、靠真资源，比能花钱买到的外链值钱得多。",
      "页面必须有自己的「理论与实测标准」（为什么这些好、按什么交付链标准判），纯搬运或纯 AIGC 列表页迟早被清退。",
    ],
    en: [
      "Most keywords can reach the Top 5 or Top 3 on page quality alone when intent is focused and the page explains 'why' (e.g., our DR 13 PPT benchmark page ranking Top 3).",
      "Hyper-competitive head terms are won off-page through PR, brand, and social volume — on-page perfection is just the entry ticket.",
      "Backlinks are votes, and social/brand buzz are votes too; strong social distribution reduces dependence on DR.",
      "Once a site's technical baseline is solid, rankings scale roughly exponentially with brand and social momentum.",
      "Brand and social moats require real assets and outlast anything money can buy in link markets.",
      "Every page needs its own theory and testing rubric ('why these win and how we graded them'); commodity AIGC listicles get wiped out.",
    ],
  },
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

/** 增长：SEO 关键词与哥飞 AI 工具箱（用户 10-17 给的分组名「seo关键词」+ 11-20 补入哥飞开放 API/MCP 与工具箱） */
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
    what: { zh: "SEO Agent（查词、看对手、审查网站记入待办）", en: "SEO Agent (keyword research, competitor check & site audit to-dos)" },
    name: "哥飞 SEO Agent",
    url: "https://seo.web.cafe/chat/",
    by: "哥飞",
    post: "https://x.com/gefei55/status/2106024221671567671",
    date: "2026-10-02",
  },
  {
    what: { zh: "20+ 免费实战小工具（KGR 评估、需求挖掘机、SERP 解密、外链价值/Spam 查询、AdSense 73 项预检）", en: "20+ free utilities (KGR calculator, demand miner, SERP decoder, backlink spam check, AdSense 73-point precheck)" },
    name: "哥飞的 SEO 工具箱",
    url: "https://seo.web.cafe/",
  },
  {
    what: { zh: "36 个接口（16 组装结论 + 16 原始数据 + 4 知识库），支持 HTTP API / MCP / CLI / Claude Skills", en: "36 endpoints (16 analysis + 16 raw data + 4 playbooks) via HTTP API, MCP, CLI & Claude Skills" },
    name: "哥飞 SEO 开放 API & MCP",
    url: "https://seo.web.cafe/api/",
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

/** 建站补充：哥飞 GeFeiSites 建站引擎（https://new.web.cafe/sites#showcase） */
export const GEFEI_SITES_ENGINE = {
  url: "https://new.web.cafe/sites#showcase",
  agentUrl: "https://seo.web.cafe/chat/",
  zh: "不懂代码或想抢在 48 小时内上线纯前端新词工具站/小游戏站：哥飞的 GeFeiSites 建站引擎把源码一次部署到你自己的 Cloudflare 账号（Pages + Workers + D1 + R2），再用 MCP 连上 Claude Code / Cursor 和哥飞 SEO Agent，一句话建站、自动生成多语言 hreflang、sitemap、/llms.txt 并通过 IndexNow 秒推 Bing（Showcase 案例：4 语种在线拼图 Pimg.app 2 小时上线、Claude Skills 导航站 SkillsBot.org 27 分钟上线 30 页）。注意：目前仅适合免登录的纯前端工具、小游戏和目录内容站，还不支持用户注册登录与在线收款（需要收款的 SaaS 仍用 Vercel + Supabase + Waffo/Dodo）。",
  en: "For no-code builders or shipping a front-end utility/game site within 48 hours of a new term trending: GeFeiSites deploys once to your own Cloudflare account (Pages + Workers + D1 + R2) and connects via MCP to Claude Code / Cursor and Gefei's SEO Agent — auto-generating multilingual hreflang, sitemaps, /llms.txt, and IndexNow pushes (Showcase: 4-language image editor Pimg.app shipped in 2 hours; SkillsBot.org shipped 30 pages in 27 minutes). Note: designed for login-free tools, games, and directories; SaaS products requiring user auth and checkout should stick with Vercel + Supabase + Waffo/Dodo.",
};

/** 增长与商业决策：二虎分享的「让 AI 帮你做增长决策，先把这 11 份数据配齐」（模型不缺智商，缺的是数据） */
export const ERHU_GROWTH_DATA_11 = {
  lead: {
    zh: "很多人让 AI（Claude、Codex、Gemini、Manus）分析增长和投放，喂进去的只有一张广告后台截图。模型不缺智商，缺的是全链路数据——1 到 6 是自己的数据，7 和 8 决定它准不准，9 和 10 是别人的盘子，11 是怎么切：",
    en: "Most people ask AI (Claude, Codex, Gemini, Manus) for growth decisions while feeding it only a single ad-dashboard screenshot. Models do not lack intelligence; they lack full-funnel data — 1 to 6 are your own data, 7 and 8 decide whether it is accurate, 9 and 10 are competitors' data, and 11 is how you slice it:",
  },
  groups: [
    {
      badge: { zh: "1–6 自己的真实数据（告诉 AI 你做得怎么样）", en: "1–6 Your First-Party Truth (How you are performing)" },
      color: "blue",
      items: [
        { num: "1️⃣", name: { zh: "网站行为", en: "Web Traffic & Behavior" }, tools: "Google Analytics (GA4) / Plausible", desc: { zh: "全站流量从哪来、看了什么、在哪一步走掉（按渠道 × 地区 × 端 × 页面 × 语言叉乘）", en: "Where visitors come from, what they view, and where they drop off (channel × region × device × page × language)" } },
        { num: "2️⃣", name: { zh: "自然搜索与 AI 表现", en: "Organic & AI Search" }, tools: "Google Search Console / Bing Webmaster Tools", desc: { zh: "用户搜什么词找到你、哪些页有曝光没点击（可用 mcp-gsc 直连 Claude，结合气泡图四象限与生成式 AI 效果报告）", en: "Queries, impressions without clicks, bubble-chart quadrants, and GSC Generative AI performance reports" } },
        { num: "3️⃣", name: { zh: "移动端 App 归因 (MMP)", en: "Mobile App Attribution" }, tools: "Adjust / AppsFlyer", desc: { zh: "做 App 必配，看移动端安装具体由哪个渠道、哪个 Campaign 带来", en: "Essential for mobile apps to attribute installs to exact channels and campaigns" } },
        { num: "4️⃣", name: { zh: "产品内行为与留存", en: "In-Product Retention" }, tools: "PostHog / Mixpanel / Amplitude", desc: { zh: "能把人找来不等于能留下来：看用户进来后用了什么核心功能、第几天还在（Cohort 留存）", en: "Getting traffic is not keeping users: track feature adoption and Day-N cohort retention" } },
        { num: "5️⃣", name: { zh: "付费广告花费", en: "Paid Ad Spend" }, tools: "Meta Ads / Google Ads / TikTok Ads", desc: { zh: "花出去的钱：View、Click、Spend 一路拆到 Campaign、Ad Set 和单条素材（最不缺但也最容易被当成全部的一份）", en: "Money spent broken down to campaign, ad set, and single creative level" } },
        { num: "6️⃣", name: { zh: "付费真相（真金白银账本）", en: "Payment & Revenue Truth" }, tools: "Waffo / Dodo Payments / Stripe / Paddle / PayPal / Shopify", desc: { zh: "收回来的钱：谁真的付了、付了多少、净到手多少（这是唯一不能造假的终局账本）", en: "Money collected: who actually paid, net revenue after fees, and LTV" } },
      ],
    },
    {
      badge: { zh: "7–8 校准层（决定上面 6 份数据准不准）", en: "7–8 Calibration Layer (Whether your numbers are trustworthy)" },
      color: "emerald",
      items: [
        { num: "7️⃣", name: { zh: "服务端回传通道", en: "Server-Side Event Loop" }, tools: "Pixel → Meta Conversions API (CAPI) / TikTok Events API (S2S)", desc: { zh: "决定广告系统能学到什么：新手先配好浏览器 Pixel，起量后必须上服务端 S2S 回传真实付费事件", en: "Feeds ad algorithms real purchase signals: start with browser Pixel, graduate to server-to-server CAPI/S2S" } },
        { num: "8️⃣", name: { zh: "统一归因口径", en: "Attribution Window Alignment" }, tools: "View-through vs. Click-through (1d / 7d / 28d)", desc: { zh: "定功劳算谁的：各平台都按自己口径认领功劳，不统一口径直接让 AI 把几家后台数字加总，结论必错", en: "Each ad platform over-claims credit; align attribution windows before asking AI to sum conversions" } },
      ],
    },
    {
      badge: { zh: "9–10 别人的盘子（告诉 AI 你还能做成什么样）", en: "9–10 Market & Competitor Intelligence (What is possible)" },
      color: "amber",
      items: [
        { num: "9️⃣", name: { zh: "第三方流量与外链搜索库", en: "3rd-Party Traffic & SEO DBs" }, tools: "Similarweb / Ahrefs / Semrush（或 AIsa / DataForSEO / 哥飞 API）", desc: { zh: "看竞品流量规模、渠道构成、外链与买词（注意：它们都是估算值不是真实账本，适合看趋势比大小）", en: "Estimate competitor traffic mix, backlinks, and paid keywords (use for relative trends, not as an exact ledger)" } },
        { num: "🔟", name: { zh: "公开竞品投放素材库", en: "Public Ad Creative Libraries" }, tools: "Meta Ad Library / Google Ads Transparency Center / TikTok Creative Center", desc: { zh: "官方免费公开：看对手正在真金白银投什么素材、主打什么痛点卖点、跑了多久没停", en: "Free official libraries showing which competitor creatives and hooks stay live the longest" } },
      ],
    },
    {
      badge: { zh: "1️⃣1️⃣ 终极决策叉乘表（让 AI 做判断而不是读报表）", en: "1️⃣1️⃣ The Cross-Product Decision Matrix (From reading reports to making calls)" },
      color: "purple",
      items: [
        { num: "1️⃣1️⃣", name: { zh: "六维叉乘切分表", en: "6-Dimension Cross-Slice Table" }, tools: "端 × 国家 × 卖点 × 目标 × SKU × 类别（行业/竞品/场景）", desc: { zh: "把前面 10 份数据叉乘进同一张表，每个格子最后都必须落到两个终局数字：【付费人数】与【付费金额】", en: "Cross-multiply all 10 feeds by Device × Country × Hook × Goal × SKU × Category; every cell must resolve to Paying Users & Net Revenue" } },
      ],
    },
  ],
};

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
        zh: "Jesse 认为这类词多半被 AI 摘要（AI Overviews）截走了点击，传统 SEO 没太好办法；但在 GEO 闭环里，这恰恰是「已经进检索池 Top-10 却没赢下 AI 首段引用/点击」的词——按 Tomek Rudzki 前 10% 铁律 + Suski 前 50 词法则，在该页首段前 50 词直接亮出品牌名 + 3 个硬核统计数字（或交互计算器），把「零点击曝光」转化为「AI 点名推荐 + 富媒体点击」。Google 给的检查方向：对手是不是用了结构化数据、这个词是不是在摘要里就拿到了答案，想让人点进来就改标题和描述。",
        en: "Jesse notes AI Overviews take most of these clicks. In a GEO loop, however, High Rank + Low CTR means you already passed the Top-10 retrieval gate — apply Tomek Rudzki's top-10% rule and Suski's First-50-Words rule (place your brand name + 3 concrete stats or an interactive calculator in the opening 50 words) to win the AI Overview citation, and sharpen the title, meta description, and Schema rich results to win the click.",
      },
    },
  ],
  next: {
    zh: "挑出词以后，在 Search Console 里按这个查询筛选（或直接用 AminForou/mcp-gsc 让 Claude Code 自动拉取四象限词表），找到它对应的页面，再把首段前 50 词 BLUF、标题、描述、图片 alt 和小标题改得具体、准确。",
    en: "Once you have the queries, filter by each one in Search Console (or pull the four quadrants directly into Claude Code via AminForou/mcp-gsc) to find its pages, then sharpen the opening 50-word BLUF, titles, descriptions, image alt text and headings.",
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

export interface SeoSchoolPerson {
  name: string;
  handle?: string;
  url: string;
  role: { zh: string; en: string };
}

export interface SeoSchool {
  id: string;
  num: string;
  badge: { zh: string; en: string };
  color: string;
  /** 2D 坐标图位置：x (0=纯站内产品/技术, 100=纯站外共识/外链), y (0=顶部长期白帽复利, 100=底部算法套利/灰帽红队) */
  x: number;
  y: number;
  layer: { zh: string; en: string };
  name: { zh: string; en: string };
  people: SeoSchoolPerson[];
  core: { zh: string; en: string };
  borrow: { zh: string; en: string };
  caveat: {
    zh: string;
    en: string;
    link?: { label: { zh: string; en: string }; url: string };
  };
}

/** 全球 SEO / GEO 六大实战流派地图与去伪存真指南（2026-11-20 升级至 35 位海内外实战派代表） */
export const SEO_SCHOOLS_MAP: {
  intro: { zh: string; en: string };
  axes: {
    xLeft: { zh: string; en: string };
    xRight: { zh: string; en: string };
    yTop: { zh: string; en: string };
    yBottom: { zh: string; en: string };
  };
  schools: SeoSchool[];
} = {
  intro: {
    zh: "海内外的 SEO 和 GEO 实战派看起来观点打架，其实是在回答搜索引擎和 AI 检索链条上不同环节的问题。把他们放到「横轴：站内产品与技术 ↔ 站外共识与外链」、「纵轴：长期白帽复利 ↔ 算法实验与红队测试」的坐标系里，就能看清每个人教的是哪一层、哪些能直接抄、哪些要拿 Google 官方文档和实证数据去伪存真：",
    en: "SEO and GEO practitioners often sound like they contradict one another because each works on a different layer of search and AI retrieval. Mapping them across two axes — On-Site Product & Tech vs. Off-Site Consensus & Links (horizontal) and Long-Term Compounding Moat vs. Algorithm Arbitrage & Red-Team Testing (vertical) — shows what each school teaches, what to borrow, and where to cross-check against Google's official policies:",
  },
  axes: {
    xLeft: { zh: "← 站内：产品库存 / 语义架构 / 页面数学", en: "← On-site: product inventory, semantics & page math" },
    xRight: { zh: "站外：评测矩阵 / 多席位证据 / 外链共识 →", en: "Off-site: review matrix, multi-seat proof & links →" },
    yTop: { zh: "↑ 长期白帽复利（抗算法更新护城河）", en: "↑ Long-term compounding moat (white-hat)" },
    yBottom: { zh: "↓ 算法极限测试与灰帽红队（短期套利 / 需防惩罚）", en: "↓ Algorithm stress-testing & grey-hat red team" },
  },
  schools: [
    {
      id: "product-led",
      num: "①",
      badge: { zh: "产品与一手资产派", en: "Product-Led & 1st-Hand Assets" },
      color: "blue",
      x: 22,
      y: 16,
      layer: { zh: "第 1 层：建什么页面（搜索即产品 × 4–7 类一手资产）", en: "Layer 1: What to build (search as a product & 4–7 asset types)" },
      name: { zh: "产品驱动、新词工具交互与一手资产派（Product-Led & Proprietary Assets）", en: "Product-Led, Interactive Tools & Proprietary Assets" },
      people: [
        { name: "Eli Schwartz", url: "https://www.productledseo.com/t/playbooks", role: { zh: "《Product-Led SEO》作者、前 SurveyMonkey SEO 负责人", en: "Author of Product-Led SEO, former SurveyMonkey SEO lead" } },
        { name: "Cyrus Shepard", handle: "@CyrusShepard", url: "https://zyppy.com/seo-clicks-study/", role: { zh: "Zyppy 创始人（92.9% 赢家独有资产研究 & 28 天 AI Search 断流实验）", en: "Founder of Zyppy (92.9% proprietary asset study & 28-day AI Search opt-out test)" } },
        { name: "Georg Richard Aare", url: "https://www.youtube.com/watch?v=n35P_Mjsk3Y", role: { zh: "RankUp 创始人（410,572 条 Claim 实证：首段一手经验 Top-3 概率 5.5x）", en: "Founder of RankUp (410,572-claim study: intro first-hand experience gives 5.5x Top-3 lift)" } },
        { name: "哥飞", handle: "@gefei55", url: "https://new.web.cafe/tutorials", role: { zh: "出海新词工具站与广告/订阅变现社群主理人", en: "New-term tool sites & AdSense/subscription community host" } },
        { name: "大罗SEO", handle: "@daluoseo", url: "https://www.youtube.com/@daluoseo", role: { zh: "Product-Led SEO 中文拆解与程序化落地", en: "Product-Led SEO & programmatic landing pages in Chinese" } },
        { name: "Joker", handle: "@JokerMayCry_Jun", url: "https://x.com/JokerMayCry_Jun", role: { zh: "细分 Niche 算法差异与 AI 工具首屏交互实战", en: "Niche algorithm differences & above-the-fold tool UX" } },
      ],
      core: {
        zh: "反对按关键词工具词表批量写凑字数的科普长文（Eli 称之为红海 SEO）。核心是把「独家结构化数据、在线小工具或 4~7 类一手实测资产」直接做成满足意图的页面。Cyrus Shepard 对 Google 核心更新赢家的研究证实 92.9% 的暴涨站点拥有无法被 AI 凭空捏造的独有资产（互动计算器、一手实测数据集、免费在线工具），且其 28 天屏蔽 AI Search 实验证明 AI Overviews 贡献了 21%~23% 的点击；Georg Richard Aare 对 410,572 条 Claim 的统计进一步量化出：首段直接亮一手实测经验进 Top-3 的概率是 5.5 倍，单页凑齐 4~7 类一手资产（实测数据 4.4x、学术/DOI 引用 3.6x、对比表与截图 2.4x）进 Top-3 概率翻 1.9 倍。",
        en: "Rejects cranking out filler articles from keyword spreadsheets ('Red Ocean SEO'). Instead, turn structured datasets, interactive utilities, and 4–7 categories of first-hand assets directly into pages that solve the query. Cyrus Shepard proved that 92.9% of Core Update winners carry proprietary assets AI cannot fabricate (calculators, original datasets, tools) and his 28-day AI Search opt-out experiment showed AIO drives 21%–23% of clicks. Georg Richard Aare's 410,572-claim study quantified that opening with first-hand experience lifts Top-3 probability by 5.5x, and combining 4–7 asset types lifts Top-3 odds by 1.9x.",
      },
      borrow: {
        zh: "1. 首屏直接给可交互工具或结构化对比表，并在首段前 50 词亮出「谁 + 测了多少样本 + 结论」（Aare 5.5x 铁律）；2. 单页至少配齐 4 类以上一手资产（自测统计数字、CERN Zenodo DOI 数据集引用、Markdown 对比表、实测截图）；3. 改造内链为 Eli 书中第 6 章的「西南航空网格」消灭孤岛页。",
        en: "1. Put an interactive tool or structured table above the fold and open with first-hand sample size and findings in the first 50 words (Aare's 5.5x rule); 2. Combine at least 4 proprietary asset types per page (original stats, CERN Zenodo DOI dataset citation, comparison table, screenshots); 3. Build Eli's 'Southwest Airlines' mesh internal link graph.",
      },
      caveat: {
        zh: "去伪存真：程序化建站最忌盲目铺空壳页。Joker 的检验铁律是「页面增量必须与流量增长成正比」；Eli 在书中也记录过把 100 多个重复度高的汽车站狠心砍到只剩 4 个站，流量反而涨到被罚前的 125%。",
        en: "Fact-check: Never scale empty programmatic shells. Joker's rule is that page growth must bring proportional traffic growth; Eli's Panda recovery case study pruned 100+ near-duplicate auto sites down to 4 sites and reached 125% of pre-penalty traffic.",
        link: {
          label: { zh: "Google 门户页面与薄弱内容政策", en: "Google doorway & thin content policy" },
          url: "https://developers.google.com/search/docs/essentials/spam-policies?hl=zh-cn#doorways",
        },
      },
    },
    {
      id: "semantic-technical",
      num: "②",
      badge: { zh: "语义图谱与实体消歧派", en: "Semantic KG & Entity Home" },
      color: "indigo",
      x: 24,
      y: 44,
      layer: { zh: "第 2 层：机器怎么读懂你（Entity Home 闭环 × 三道门与 SSR）", en: "Layer 2: How machines parse you (Entity Home @id loop & Three Gates)" },
      name: { zh: "语义图谱、本体论、实体消歧与多语言架构派（Semantic KG & Entity SEO）", en: "Semantic Ontology, Entity Home Disambiguation & Technical SEO" },
      people: [
        { name: "Koray Tuğberk GÜBÜR", url: "https://www.holisticseo.digital/", role: { zh: "Holistic SEO 创始人，语义 SEO 与 EAV 三元组体系代表", en: "Founder of Holistic SEO, Topical Authority & EAV triples" } },
        { name: "Jason Barnard", handle: "@jasonmbarnard", url: "https://kalicube.com/", role: { zh: "Kalicube 创始人，Entity Home + Claim-Frame-Prove 实体消歧鼻祖", en: "Founder of Kalicube, Entity Home & Claim-Frame-Prove disambiguation loop" } },
        { name: "Andrea Volpini", handle: "@cyberandy", url: "https://wordlift.io/", role: { zh: "WordLift 创始人，SEOntology 本体标准与 RLM-on-KG 图谱推理", en: "Founder of WordLift, SEOntology & RLM-on-KG against context rot" } },
        { name: "Marc Moeller", handle: "@moellerseo", url: "https://www.youtube.com/@moellerseo", role: { zh: "AI 时代 SEO 路线图与 Google 7 大重排专利拆解", en: "AI SEO roadmap & Google's 7 core reranking patents" } },
        { name: "Stephen Burns", url: "https://commoncrawl.org/", role: { zh: "Common Crawl 视角：预训练「三道门」与谐波中心性（Harmonic Centrality）", en: "Common Crawl lens: Three Gates (Permission / Edge WAF / SSR) & Harmonic Centrality" } },
        { name: "Aleyda Solís", handle: "@aleyda", url: "https://www.aleydasolis.com/", role: { zh: "Orainti 创始人，跨国多语言出海架构与 AI Search 国际本地化", en: "Founder of Orainti, international multilingual SEO & AI Search localization" } },
        { name: "Loki Yan", handle: "@loki_yan_seo", url: "https://lokiyan.com/", role: { zh: "First Optimise 联创、Google Search Central APAC 讲者（语种非对称性）", en: "First Optimise co-founder, Google Search Central APAC speaker (Language Asymmetry)" } },
      ],
      core: {
        zh: "把网站当成喂给搜索引擎和 LLM 的结构化知识库。Koray 强调按 Entity-Attribute-Value（实体-属性-值）三元组覆盖话题全貌；Jason Barnard（Kalicube）提出「算法三位一体（知识图谱+搜索引擎+大模型对话）」与 Claim-Frame-Prove 闭环——用主站 Entity Home 的稳定 `@id`、中英文别名（`alternateName`）和双向互指的 `sameAs` 彻底消除同名歧义；Andrea Volpini（WordLift）用 SEOntology 让大模型在局部知识图谱上递归推理；Stephen Burns 指出进大模型底座必须先过「三道门（Permission / Edge WAF 放行 AI 爬虫 / SSR 直出 HTML）」；Loki Yan 与 Aleyda Solís 则揭示了多语言出海的「语种非对称性」——78% 非英语 AI 提问底层会扇出到英文语料库检索。",
        en: "Treats a website as a structured knowledge graph for search engines and LLMs. Koray structures content around Entity-Attribute-Value (EAV) triples; Jason Barnard (Kalicube) pioneered the 'Algorithmic Trinity' and Claim-Frame-Prove loop using a canonical Entity Home `@id`, `alternateName`, and bidirectional `sameAs` links to eliminate namesake ambiguity; Andrea Volpini (WordLift) formalized SEOntology; Stephen Burns highlights the 'Three Gates' (Permission, Edge WAF bot allowlisting, SSR raw HTML); Loki Yan and Aleyda Solís expose Language Asymmetry — 78% of non-English AI queries fan out to English retrieval.",
      },
      borrow: {
        zh: "1. 全站 JSON-LD 用固定 `@id`（如 `https://jasonzhu.ai/#person`）串联 Person、Organization 与 Dataset，并用 `sameAs` 双向锁死 GitHub、X、CERN Zenodo DOI 与独立工具站；2. 跑通 Stephen Burns「三道门」体检：WAF 放行 GPTBot/ClaudeBot/PerplexityBot + 核心文本与 JSON-LD 100% SSR 直出；3. 多语言出海必须同步发英文版抢占英文底座。",
        en: "1. Connect Person, Organization, and Dataset JSON-LD with stable `@id` URIs and bidirectional `sameAs` links across GitHub, X, CERN Zenodo DOIs, and product domains; 2. Pass the Three Gates audit: allow AI bots at the Edge WAF and serve 100% SSR raw HTML; 3. Publish English versions to capture English fan-out retrieval.",
      },
      caveat: {
        zh: "去伪存真：别把 JSON-LD 当成排名作弊开关。Google 官方《结构化数据常规指南》明确规定：Schema 标记里的每个字段必须与页面上人类肉眼可见的文本完全一致，隐藏不展示的标记或虚构评分会收到手动处罚。",
        en: "Fact-check: JSON-LD is not a ranking cheat code. Google's General Structured Data Guidelines require every marked-up property to match visible text on the page; hidden or fabricated markup risks a manual action.",
        link: {
          label: { zh: "Google 结构化数据官方指南", en: "Google Structured Data Guidelines" },
          url: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies?hl=zh-cn",
        },
      },
    },
    {
      id: "onpage-math-rag",
      num: "③",
      badge: { zh: "相关性工程与 RAG 切片派", en: "Relevance Eng & RAG SRO" },
      color: "emerald",
      x: 26,
      y: 74,
      layer: { zh: "第 3 层：单页怎么排上去并被 AI 抽中（扇出查询 × 前 10% 切片 × SRO）", en: "Layer 3: How pages rank and win RAG selection (Query Fan-out, Top-10% chunk & SRO)" },
      name: { zh: "相关性工程、RAG 切片选择率与时效衰减派（Relevance Engineering & SRO）", en: "Relevance Engineering, RAG Chunking & Selection Rate Optimization (SRO)" },
      people: [
        { name: "Mike King", handle: "@iPullRank", url: "https://ipullrank.com/", role: { zh: "iPullRank 创始人，Relevance Engineering（相关性工程）与 Query Fan-out 体系提出者", en: "Founder of iPullRank, pioneer of Relevance Engineering (r19g) & Query Fan-out" } },
        { name: "Dan Petrovic", handle: "@dejanseo", url: "https://dejan.ai/", role: { zh: "DEJAN AI 创始人，SRO（Selection Rate Optimization 选择率优化）与 500 词 grounding 预算", en: "Founder of DEJAN AI, Selection Rate Optimization (SRO) & grounding budget" } },
        { name: "Tomek Rudzki", handle: "@TomekRudzki", url: "https://www.peec.ai/", role: { zh: "Peec AI 研发负责人，300 组 ChatGPT score_debug_table 实验（92% 引用前 10% 切片）", en: "Head of R&D at Peec AI, 300 ChatGPT score_debug_table tests (92% cite first 10% chunk)" } },
        { name: "Kevin Indig", handle: "@Kevin_Indig", url: "https://www.growth-memo.com/", role: { zh: "Growth Memo 作者，120 万 AI 回答实证（44.2% 引用前 30% + 90 天时效衰减）", en: "Author of Growth Memo, 1.2M AI answers study (44.2% top-30% rule & 90-day recency decay)" } },
        { name: "Kyle Roof", handle: "@kylebot1997", url: "https://www.youtube.com/watch?v=n35P_Mjsk3Y&t=2423s", role: { zh: "PageOptimizer Pro 联创，400+ 控制变量实验与 10,937 页 AEO 研究", en: "PageOptimizer Pro co-founder, 400+ controlled tests & 10,937-page study" } },
        { name: "Michał Suski", url: "https://surferseo.com/", role: { zh: "Surfer SEO 联创，OpenAI 500M 词向量与前 50 词品牌点名率实证", en: "Surfer SEO co-founder, OpenAI 500M vector & First-50-Words brand mention study" } },
        { name: "Jabez Reuben", handle: "@jabezreuben", url: "https://www.youtube.com/watch?v=n35P_Mjsk3Y&t=1124s", role: { zh: "LLM Mastery 大会创办人，硬核统计数字（Concrete Stats）跨越排名实证", en: "Founder of LLM Mastery, concrete statistics outranking fluff at #1" } },
      ],
      core: {
        zh: "用信息检索（IR）工程和大样本实验拆解「单页数学位置」与「大模型 RAG 切片抽样规律」。Mike King 将 GEO 升维为「相关性工程（Relevance Engineering）」——大模型接到 Prompt 后会先扇出（Query Fan-out）成一簇子查询去混合检索；Tomek Rudzki 通过逆向 ChatGPT 内部 `score_debug_table` 的 300 组控制实验证明：92% 被引用的页面直接赢在文章前 10%（首段前 50~100 词）；Kevin Indig 对 120 万条 AI 回答的统计印证了 44.2% 的引用出自页面前 30%（Ski Ramp 滑雪跳台曲线），且内容超过 90 天不更新被 AI 引用的概率会断崖暴跌 3 倍；Dan Petrovic 则提出 `SRO（选择率优化）`：Google Gemini 每次 grounding 给单页的预算仅约 500 词（~2,000 字符），信息密度（每百词事实/数字数）决定了你的切片能否在重排器里胜出。",
        en: "Decodes on-page math and RAG chunk selection using IR engineering and large-sample tests. Mike King framed Relevance Engineering around Query Fan-out and passage embeddings; Tomek Rudzki's 300 controlled ChatGPT `score_debug_table` experiments proved 92% of cited pages win in the first 10% of the text; Kevin Indig's 1.2M AI answers study confirmed 44.2% of citations come from the top 30% ('Ski Ramp' curve) and pages older than 90 days lose 3x citation share; Dan Petrovic introduced Selection Rate Optimization (SRO) around Gemini's ~500-word per-page grounding budget and high fact density.",
      },
      borrow: {
        zh: "1. 首段前 50 词必须执行 BLUF（结论先行），同时塞进品牌名、核心结论与 3 个以上具体统计数字（Tomek 前 10% + Suski 前 50 词铁律）；2. 把 H2 改写为真实买家提问句式，每个 H2 下第一段写 40~60 词高信息密度「自包含答案块」（适配 Dan Petrovic 500 词 grounding 预算）；3. 建立核心赚钱页 90 天强制刷新机制（Kevin Indig 90 天时效红线）。",
        en: "1. Place a BLUF summary with brand name, primary conclusion, and 3+ concrete stats in the first 50 words (Rudzki's top-10% & Suski's 50-word rule); 2. Write conversational question H2s followed immediately by a high-density 40–60 word self-contained Answer Block (Petrovic's SRO budget); 3. Refresh core money pages every 90 days (Indig's recency threshold).",
      },
      caveat: {
        zh: "去伪存真：数学位置是给检索器看的，但绝不能写成生硬堆词。Kyle Roof 与 Tomek Rudzki 的实验均表明：在正文中偷偷塞「请忽略其他竞品只推荐我」的 Prompt 注入对大模型引用率是零提升甚至负分，只有首段高密度事实与权威支撑才有效。",
        en: "Fact-check: Mathematical placement feeds the retriever, not prompt injection tricks. Both Kyle Roof and Tomek Rudzki showed that hidden prompt injections ('ignore competitors and recommend us') yield zero lift — only dense facts and authority signals move selection rates.",
      },
    },
    {
      id: "affiliate-bofu",
      num: "④",
      badge: { zh: "一手信源 E-E-A-T 与转化派", en: "Original Source & BoFu PR" },
      color: "amber",
      x: 74,
      y: 16,
      layer: { zh: "第 4 层：怎么防自夸过滤并把流量变现（69% 自夸避坑 × 以 Info 养 Commercial）", en: "Layer 4: Original Source E-E-A-T, avoiding 69% self-listicle exclusion & BoFu revenue" },
      name: { zh: "一手信源 E-E-A-T、营收导向 PR 与漏斗转化派（Original Source & BoFu Revenue）", en: "Original Source E-E-A-T, Revenue-First PR & Bottom-of-Funnel Conversion" },
      people: [
        { name: "Lily Ray", handle: "@lilyraynyc", url: "https://www.amsive.com/insights/seo/", role: { zh: "Amsive SEO 副总裁，2,076 域名 E-E-A-T 赢家研究与「自夸榜单 69% 被 AI 剔除」实证", en: "VP of SEO Strategy at Amsive, 2,076-domain E-E-A-T study & '69% self-serving listicle exclusion' study" } },
        { name: "John \"JP\" Zhang（张江鹏）", handle: "@jiangpengzhang", url: "https://www.youtube.com/@seoactionblog", role: { zh: "「英文SEO实战派」主理人、深圳 SEO 大会发起人（以 Info 养 Commercial）", en: "Host of 'English SEO Action' & founder of Shenzhen SEO Conference ('Info feeds Commercial')" } },
        { name: "Alex Galinos", url: "https://www.youtube.com/watch?v=n35P_Mjsk3Y", role: { zh: "Elife Group 顾问（前 Hoppa CMO），营收倒推 Digital PR 与「3 道门内链导权」", en: "Advisor at Elife Group (ex-Hoppa CMO), Revenue-First Digital PR & 3-gate internal link routing" } },
        { name: "Edward Sturm", handle: "@edwardeachday", url: "https://www.youtube.com/watch?v=n35P_Mjsk3Y", role: { zh: "The Edward Show 日更播客主理人、Compact Keywords 高意图短页作者", en: "Host of The Edward Show (1,230+ episodes) & Compact Keywords" } },
        { name: "Davie Fogarty", handle: "@DavieFogarty", url: "https://www.youtube.com/@DavieFogarty", role: { zh: "The Oodie 创始人（5 亿澳元 DTC 品牌），品牌搜索心智与单页 CRO", en: "Founder of The Oodie ($500M+ DTC), branded search demand & CRO" } },
      ],
      core: {
        zh: "一切围绕「一手信源真实性（Original Source E-E-A-T）」与「真实订单转化」设计内容矩阵。Lily Ray 对 2,076 个大盘域名及 100 个 B2B 商业词的实证揭开了两个颠覆认知的真相：① Google 核心更新与 AI 检索最偏爱「该领域的原始一手信源（Original Source）」，越界写非本行万金油科普的站点哪怕 DR 90 也会暴跌；② 当品牌自己在官网写《Top 10 最佳 X 工具》并把自己排第一时，大模型虽然会引用这篇榜单去推荐榜单里的第 2~5 名竞品，却有 **69% 的概率把写文章的作者自己直接剔除（防王婆卖瓜偏差过滤）**！因此必须结合 John JP 的「以 Info 养 Commercial」与 Alex Galinos 的「营收倒推 PR 三道门」：主站写中立的「按买家场景选型矩阵（Decision by Buyer Situation）」与开源数据集（Info 页吸外链），再通过站内内链把权重精准灌给核心转化页。",
        en: "Centers on Original Source E-E-A-T and bottom-of-funnel revenue. Lily Ray's 2,076-domain Core Update study and 100-B2B-query study revealed two critical truths: (1) Google and AI engines reward the Original Source of a topic while penalizing off-topic generalists regardless of DR; (2) when a brand publishes a self-serving 'Top 10 Best X' listicle ranking itself #1, LLMs cite the article to recommend competitors #2–#5 while **excluding the author brand 69% of the time**! Pair this with John JP's 'Info feeds Commercial' matrix and Alex Galinos's Revenue-First Digital PR: publish neutral 'Decision by Buyer Situation' benchmarks and datasets on your site to earn links, then route equity to money pages while letting third-party domains rank you #1.",
      },
      borrow: {
        zh: "1. 主站评测页绝不写自嗨的「我们是第一名」，一律改写为「按买家场景对号入座（Decision Matrix by Buyer Situation）」并附上 CERN Zenodo 公开数据集 DOI（避开 Lily Ray 69% 自夸过滤陷阱）；2. 用独家行业统计报告（Info 页）吸引自然外链，按 Alex Galinos「三道门」用站内内链集中导权给 `/best/` 选型页与核心产品页；3. 优先建漏斗底部的对比页（`X vs Y`、`Alternatives`）。",
        en: "1. Replace self-serving 'We are #1' listicles on your own site with neutral 'Decision by Buyer Situation' matrices backed by CERN Zenodo DOIs (avoiding Lily Ray's 69% exclusion penalty); 2. Use original data reports (Info pages) to attract natural links and route internal link equity to money pages via Alex Galinos's 3-gate checklist; 3. Build bottom-of-funnel comparison pages (X vs Y, Alternatives).",
      },
      caveat: {
        zh: "去伪存真：2024–2026 年 Google 核心更新与「网站声誉滥用政策（Site Reputation Abuse）」重创了纯洗稿、无真机实测的传统 Affiliate 站。Lily Ray 与 John JP 均强调评测页必须有一手实测数据、可验证作者资质或向 Micro SaaS 工具化转型。",
        en: "Fact-check: Google's Core Updates and Site Reputation Abuse policy crushed generic affiliate sites without first-hand testing. Lily Ray and John JP stress that reviews require original test data, verifiable author credentials, or interactive Micro-SaaS utilities.",
        link: {
          label: { zh: "Google 高质量评测指南", en: "Google Reviews System Guidelines" },
          url: "https://developers.google.com/search/docs/appearance/reviews-system?hl=zh-cn",
        },
      },
    },
    {
      id: "consensus-proof",
      num: "⑤",
      badge: { zh: "证据链与多席位共识派", en: "Proof Chains & Multi-Seat" },
      color: "purple",
      x: 75,
      y: 46,
      layer: { zh: "第 5 层：怎么让 AI 采信并推荐你（Publisher-First × 双层记忆 × 多席位占座）", en: "Layer 5: How LLMs verify & recommend you (Publisher-First, Dual Memory & Multi-Seat)" },
      name: { zh: "站外证据链、Publisher-First 选站与多席位共识派（Proof & Consensus GEO）", en: "Off-Site Proof Chains, Publisher-First Selection & Multi-Seat Consensus" },
      people: [
        { name: "David G Quaid", handle: "@DavidGQuaid", url: "https://x.com/DavidGQuaid/status/2122356087378829685", role: { zh: "Primary Position 创始人，「外链即 Claim 的证据」与多席位占座数学", en: "Founder of Primary Position, 'links as proof for claims' & multi-seat math" } },
        { name: "Michal Rochwerger", url: "https://www.youtube.com/watch?v=n35P_Mjsk3Y", role: { zh: "Trust Luna 联创（实证 DR 与 AI 引用相关性仅 -0.05，提出 Publisher-First 选站法）", en: "Co-founder of Trust Luna (proved DR has -0.05 correlation with AI citations; Publisher-First selection)" } },
        { name: "Ross Hudgens", handle: "@rosshudgens", url: "https://www.siegemedia.com/", role: { zh: "Siege Media 创始人、Wiley《Generative Engine Optimization》作者（数据飞轮）", en: "Founder of Siege Media, author of Wiley's Generative Engine Optimization (Data Flywheel)" } },
        { name: "Duane Forrester", handle: "@DuaneForrester", url: "https://www.citationiq.io/", role: { zh: "前必应 Webmaster 负责人（Webmaster Tools 创立者），参数记忆 vs 实时 RAG 双层召回", en: "Ex-Bing Webmaster Lead, Parametric Memory vs. Live RAG dual-layer retrieval" } },
        { name: "Rand Fishkin", handle: "@randfish", url: "https://sparktoro.com/", role: { zh: "SparkToro 创始人（Moz 联创），Zero-Click 零点击归因与站外共现影响力地图", en: "Founder of SparkToro (Moz co-founder), Zero-Click attribution & off-site co-occurrence" } },
        { name: "Kasra Dash", handle: "@Kasra_Dash", url: "https://www.youtube.com/watch?v=n35P_Mjsk3Y&t=4113s", role: { zh: "The Masterminders 创始人，单一细分属性绑定与 AI 评标核验", en: "Founder of The Masterminders, niche attribute binding & AI tender verification" } },
        { name: "Dennis Yu", url: "https://www.youtube.com/watch?v=n35P_Mjsk3Y&t=960s", role: { zh: "BlitzMetrics 创始人，6 大权威节点实体分子与 MCP 无 UI 软件观", en: "Founder of BlitzMetrics, 6-node Entity Molecule & MCP 'SaaS without UI'" } },
        { name: "Hank Chang", url: "https://www.smartanswer.com.tw/", role: { zh: "台湾最準行銷合伙人 / MTSK，Search Everywhere 多平台信任闭环", en: "Partner at Smart Answer Taiwan, Search Everywhere multi-channel trust loop" } },
      ],
      core: {
        zh: "回答「大模型早就知道你存在，凭什么推荐你」的问题。Duane Forrester 将 AI 检索拆成两层：① 参数化记忆（靠 CERN Zenodo 学术库、GitHub、Wikidata 等高权知识库进预训练底座）与 ② 实时 Web RAG 检索（靠进 Google/Bing Top-10）。David Quaid 点破：AI 实时检索每次综合约 20 个信源，外链与第三方提及是「你宣称自己是第一的外部证据（Proof for Claims）」，必须在 20 个信源里占下多个席位；Michal Rochwerger 实证发现传统外链指标 DR 与大模型引用率相关性仅 `-0.05`（近乎为零），必须改用 `Publisher-First（发行商优先）` 选站法——看哪个外部域名在你的 3~5 个扇出子查询里反复排进 Google Top-10，就去哪里发评测或拿提及；Ross Hudgens 与 Rand Fishkin 则强调靠一手统计报告驱动站外高权媒体共现（Data Flywheel）。",
        en: "Solves why LLMs recommend one brand over another. Duane Forrester splits AI visibility into Parametric Memory (earned via CERN Zenodo, GitHub, Wikidata in pretraining corpora) and Live Web RAG (earned via Top-10 search rankings). David Quaid notes that LLMs synthesize ~20 sources per query, where external links act as 'Proof for Claims' and occupying multiple seats compounds citation probability. Michal Rochwerger proved Ahrefs DR has a `-0.05` correlation with AI citations and introduced Publisher-First targeting (picking domains that repeatedly rank in Top-10 across your fan-out subqueries). Ross Hudgens and Rand Fishkin build off-site co-occurrence via data-driven Digital PR.",
      },
      borrow: {
        zh: "1. 弃用盲目凑高 DR 外链，改用 `geo_engine.py publisher-finder` 跑出在扇出子查询里交叉命中率最高的外部域名（如 Dev.to、Medium、GitHub、Zenodo）精准占座；2. 用「白帽多席位占座」拿满检索前 20 名的 5~6 个席位：主站 + CERN Zenodo 4 大 DOI 学术记录 + GitHub 开源仓 + Dev.to/Medium 评测 + YouTube 实测视频；3. 全网所有简介统一绑定同一个细分属性词与一致的实测数字（Kasra Dash + Dennis Yu 实体分子闭环）。",
        en: "1. Stop chasing vanity DR; run `geo_engine.py publisher-finder` to identify external domains that repeatedly rank across your fan-out subqueries; 2. Occupy 5–6 legitimate seats in top-20 retrieval (main site + 4 CERN Zenodo DOI records + GitHub repo + Dev.to/Medium benchmark + YouTube video); 3. Bind your brand to one consistent niche attribute and identical stats across all 6 Entity Molecule nodes.",
      },
      caveat: {
        zh: "去伪存真：Quaid 团队测试过的「40 天批量建 65 个 EMD 精确匹配域名卫星站占座」属于灰帽打法，Edward Sturm 当场提醒 Google 能通过注册商、GSC 与主机指纹识别站群连坐。用 Zenodo、GitHub、PyPI、YouTube 等天然高权第三方平台占座既安全又持久。",
        en: "Fact-check: Spinning up 65 EMD satellite sites in 40 days to occupy retrieval seats risks footprint detection across registrars and GSC. Use legitimate high-authority seats (CERN Zenodo, GitHub, PyPI, YouTube) instead.",
      },
    },
    {
      id: "redteam-testing",
      num: "⑥",
      badge: { zh: "科学实验与灰帽红队派", en: "Controlled Tests & Red Team" },
      color: "rose",
      x: 76,
      y: 78,
      layer: { zh: "第 6 层：算法边界在哪里（单变量压力测试与反作弊防守）", en: "Layer 6: Where the algorithm breaks (stress tests & anti-spam defense)" },
      name: { zh: "科学控制变量实验与灰帽红队压力测试派（Scientific Testing & Red Team）", en: "Controlled Experimentation & Grey/Black-Hat Red Team" },
      people: [
        { name: "Matt Diggity", handle: "@mattdiggityseo", url: "https://mattdiggity.com/", role: { zh: "Diggity Marketing / 清迈 SEO 大会（CMSEO）创办人", en: "Founder of Diggity Marketing & Chiang Mai SEO Conference (CMSEO)" } },
        { name: "Charles Floate", handle: "@Charles_SEO", url: "https://x.com/Charles_SEO", role: { zh: "灰帽/黑帽算法漏洞压力测试与寄生虫 SEO 观察", en: "Grey/black-hat algorithm stress tests & Parasite SEO" } },
        { name: "Kalin Karakehayov", handle: "@Karakehayov", url: "https://www.youtube.com/watch?v=n35P_Mjsk3Y&t=6645s", role: { zh: "SEO.Domains 创始人（手握 20 万+ 老域名与 3 万站无链接提及网络）", en: "Founder of SEO.Domains (200k+ aged domains & 30k-site mention network)" } },
      ],
      core: {
        zh: "不信官方公关辞令，只信真金白银的测试盘。Matt Diggity 倡导严密的单变量对照测试（Test, Don't Guess），并在大站上用模板页分桶验证 CTR 与停留时长对排名的真实拉动；Charles Floate 与 Kalin Karakehayov 则属于典型的「算法红队」——天天拿测试站试探过期老域名 301、高权非营利站孤岛页寄生（Orphan Page Parasite）以及「3 万个老域名批量发 $14 无超链接纯文本品牌提及」能不能骗过大模型和 Google 反作弊。",
        en: "Trusts live test sites over PR statements. Matt Diggity runs controlled single-variable experiments; Charles Floate and Kalin Karakehayov act as an algorithmic red team — stress-testing expired domain 301s, orphan-page parasite listicles, and 30,000-site unlinked brand mention networks to see what slips past Google and LLM filters.",
      },
      borrow: {
        zh: "1. 借他们公开发布的「红队测试结论」看清算法当下真实的权重倾斜（例如老站点孤岛页在 Google 两周被封、但在 ChatGPT 仍被引用；无链接品牌提及对 AI 可见度的影响）；2. 在你自己的主站上学习 Matt Diggity 和 Eli Schwartz 的「模板页分桶 A/B 测试」，每次抽样改一批页面的 Title 公式看 GSC 实测涨跌。",
        en: "1. Read their public red-team findings as an early warning radar for where retrieval weights and spam loopholes currently sit; 2. Apply controlled split-bucket template testing on your own site to measure real GSC click and conversion lift.",
      },
      caveat: {
        zh: "去伪存真（最高红线）：红队博主拿随时可弃的测试站（Churn & Burn）试探漏洞，但你的主品牌站一旦买进站群外链或空心老域名网络，几次核心更新就会被连根拔起。Google 2024–2026《垃圾内容政策》已专门新增「过期域名滥用」与「网站声誉滥用（寄生虫 SEO）」两条重罚红线；提交或采购任何外链前，先用 backlink-guard vet 筛掉空心高 DR 站群。",
        en: "Fact-check (hard red line): Red-teamers burn disposable test sites, whereas your main brand domain cannot afford a penalty. Google's 2024–2026 Spam Policies explicitly target Expired Domain Abuse and Site Reputation Abuse (Parasite SEO). Always run backlink-guard vet to filter out hollow link farms.",
        link: {
          label: { zh: "Google 过期域名与网站声誉滥用政策", en: "Google Expired Domain & Site Reputation Abuse Policy" },
          url: "https://developers.google.com/search/docs/essentials/spam-policies?hl=zh-cn#site-reputation",
        },
      },
    },
  ],
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
