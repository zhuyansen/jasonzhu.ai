import type { Guide } from "../go-global-guides";

// SEO 以外的获客渠道：只写各平台自己的规则（帮助中心、社区准则、官方文档），不写「怎么刷」。
const PH = "https://www.producthunt.com/launch";
const SHOW_HN = "https://news.ycombinator.com/showhn.html";
const X_AUTOMATION = "https://help.x.com/en/rules-and-policies/x-automation";
const GMAIL = "https://support.google.com/mail/answer/81126";

export const CHANNELS: Guide = {
  slug: "channels",
  short: "SEO 以外的获客",
  title: "SEO 以外的获客渠道：Product Hunt、HN、Reddit、X、目录站、邮件、联盟和广告的官方规则",
  description:
    "独立开发者出海，除了 SEO 还能靠什么拿到第一批用户：Product Hunt、Hacker News、Reddit、X、AI 工具目录站、邮件订阅、联盟分佣和付费广告，每个平台的官方规则和新手最容易踩的坑。",
  intro:
    "SEO 起量慢，上线头几个月往往要靠别的渠道拿第一批用户。每个平台都有明确的规则，踩了线轻则降权，重则封号。下面只写各平台自己的规定。",
  checked: "2026-10-17",
  sections: [
    {
      id: "product-hunt",
      title: "Product Hunt",
      lead: "适合打开就能用的软件和 AI 工具；waitlist、目录、模板、课程一般上不了首页。",
      items: [
        {
          text: "免费。只能用个人账号发，任何人都能提交，不需要找 hunter；新注册的账号要等 1 周才能发产品。",
          sources: [
            { label: "怎么运作", url: `${PH}/how-product-hunt-works` },
            { label: "发布之前", url: `${PH}/before-launch` },
          ],
        },
        {
          text: "最多可以提前 1 个月排期，官方建议太平洋时间 0:01 发布，拿满 24 小时。",
          sources: [{ label: "准备发布", url: `${PH}/preparing-for-launch` }],
        },
        {
          text: "不能直接要 upvote，只能请人来看看、留言反馈。求票、用机器人、点赞换奖励、群发私信都违规，会降权、删帖或封号。",
          sources: [
            { label: "分享你的发布", url: `${PH}/sharing-your-launch` },
            { label: "社区准则", url: "https://help.producthunt.com/en/articles/3615694-community-guidelines" },
          ],
        },
        {
          text: "能不能上首页由 Product Hunt 团队审核，看有用、新颖、做工和创意；没上首页的帖子仍在全部列表里。付费只有广告位，没有花钱买首页的选项。",
          sources: [
            { label: "首页审核标准", url: "https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines" },
            { label: "广告", url: "https://www.producthunt.com/sponsor" },
          ],
        },
      ],
    },
    {
      id: "hacker-news",
      title: "Hacker News 的 Show HN",
      lead: "适合开发者工具、开源项目和能在线直接试的 demo。",
      items: [
        {
          text: "必须是别人能上手试的东西，最好不用注册就能试。博客、列表、落地页和注册页都不算 Show HN。",
          sources: [{ label: "Show HN 规则", url: SHOW_HN }],
        },
        {
          text: "项目要是你本人做的，你要在帖子里回答问题；不许叫朋友来点赞或评论。",
          sources: [{ label: "Show HN 规则", url: SHOW_HN }],
        },
        {
          text: "不要主要拿 HN 做推广，帖子和评论里不要放 AI 生成或改写的文字。",
          sources: [{ label: "社区准则", url: "https://news.ycombinator.com/newsguidelines.html" }],
        },
        {
          text: "拉票会让帖子、账号甚至整个网站被降权或封禁；不要删帖重发。",
          sources: [{ label: "常见问题", url: "https://news.ycombinator.com/newsfaq.html" }],
        },
      ],
    },
    {
      id: "reddit",
      title: "Reddit",
      lead: "适合能解决某个细分社区具体问题的工具，前提是你本人在那里长期活跃。",
      items: [
        {
          text: "全站规则：遵守各版块自己的规则，只在真正感兴趣的社区参与，不许 spam。发的东西主要是自家链接的，要控制频率，或者改投广告。",
          sources: [
            { label: "Reddit 规则", url: "https://redditinc.com/policies/reddit-rules" },
            { label: "Spam 说明", url: "https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam" },
          ],
        },
        {
          text: "常用经验是 10 次投稿里最多 1 次是自己的内容；不许暗示求票，也不许用私信拉票。",
          sources: [{ label: "Reddiquette", url: "https://support.reddithelp.com/hc/en-us/articles/205926439-Reddiquette" }],
        },
        {
          text: "有商业关系的帖子可以打 Brand Affiliate 标签，按法律要求披露是发帖人自己的责任。",
          sources: [{ label: "品牌标签", url: "https://support.reddithelp.com/hc/en-us/articles/23972085214484-What-s-a-brand-affiliate-tag" }],
        },
        {
          text: "Reddit Ads 开户免费，广告上线前要审核，通常最多 48 个工作小时；广告账户的国家和币种设定后不能改。",
          sources: [
            { label: "开户", url: "https://business.reddithelp.com/s/article/Create-and-manage-your-Reddit-Ads-account" },
            { label: "投放", url: "https://business.reddithelp.com/s/article/Set-up-a-Reddit-Ads-Campaign" },
          ],
        },
      ],
    },
    {
      id: "x",
      title: "X（Twitter）",
      lead: "适合公开记录开发过程，以及能用短视频或动图演示效果的产品。",
      items: [
        {
          text: "禁止不走官方 API 的自动化（比如用脚本操作网页），可能永久封号；也不许在一个或多个账号上发重复或高度相似的内容。",
          sources: [{ label: "自动化规则", url: X_AUTOMATION }],
        },
        {
          text: "只凭关键词搜索就自动回复是禁止的；AI 自动回复机器人要先拿到 X 的书面批准。",
          sources: [{ label: "自动化规则", url: X_AUTOMATION }],
        },
        {
          text: "禁止买卖账号、互刷或花钱刷赞和关注、蹭热门话题导流、大量发不请自来的回复或私信。",
          sources: [{ label: "真实性政策", url: "https://help.x.com/en/rules-and-policies/authenticity" }],
        },
        {
          text: "联盟链接、带佣金的折扣码和收到的赠品都算付费合作，发帖时要打开 Paid Partnership 标识。",
          sources: [{ label: "付费合作政策", url: "https://help.x.com/en/rules-and-policies/paid-partnerships-policy" }],
        },
      ],
    },
    {
      id: "directories",
      title: "AI 工具目录站",
      lead: "适合面向普通用户的 AI 应用，用来拿早期曝光、让品牌词被收录。",
      items: [
        {
          text: "There's An AI For That：基础收录 49 美元一次性，平均 1 到 2 天上线；免费途径只有每月一次的 X 征集帖。",
          sources: [{ label: "提交页", url: "https://theresanaiforthat.com/launch/" }],
        },
        {
          text: "Toolify：99 美元一次性，48 小时内上线，页面写明不保证销量和流量。",
          sources: [{ label: "提交页", url: "https://www.toolify.ai/submit" }],
        },
        {
          text: "Futurepedia 的旧提交页已经 404，现在能找到的是 497 美元的认证收录。",
          sources: [{ label: "认证收录", url: "https://www.futurepedia.io/enhanced" }],
        },
        {
          text: "别把付费收录当成买外链：Google 的垃圾内容政策把「用钱换链接」算作链接垃圾，付费链接应该加 rel=\"sponsored\" 或 nofollow。",
          sources: [{ label: "Google 垃圾内容政策", url: "https://developers.google.com/search/docs/essentials/spam-policies" }],
        },
      ],
    },
    {
      id: "email",
      title: "邮件订阅",
      lead: "所有 SaaS 都适用，尤其是有免费工具或试用、能攒下邮箱的产品。",
      items: [
        {
          text: "Gmail 2024 年 2 月起要求所有发件人有 SPF 或 DKIM、正反向 DNS 和 TLS，垃圾邮件率低于 0.3%。",
          sources: [{ label: "Gmail 发件人要求", url: GMAIL }],
        },
        {
          text: "每天给个人 Gmail 发约 5,000 封以上的算批量发件人：SPF、DKIM、DMARC 都要有（DMARC 设 p=none 就行），营销邮件要支持一键退订，垃圾邮件率建议低于 0.1%。Yahoo 和 Microsoft 的要求差不多。",
          sources: [
            { label: "Gmail", url: GMAIL },
            { label: "Yahoo", url: "https://senders.yahooinc.com/best-practices/" },
            { label: "Microsoft", url: "https://support.microsoft.com/en-us/outlook/fix-ndr-error-550-5-7-515-in-outlook-com" },
          ],
        },
        {
          text: "收件人要主动订阅并确认邮箱，不要买名单。",
          sources: [{ label: "Gmail 发件人要求", url: GMAIL }],
        },
        {
          text: "给美国用户发营销邮件按 CAN-SPAM：要写实体邮寄地址（可以用邮政信箱），10 个工作日内处理退订，每封违规最高罚 53,088 美元。",
          sources: [{ label: "FTC 指南", url: "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business" }],
        },
        {
          text: "发第一期之前（按上面的要求整理）：用自己的域名，配好 SPF、DKIM 和 DMARC，加一键退订，写上邮寄地址，只发给确认过的订阅者，接入 Google Postmaster Tools 看垃圾邮件率。",
        },
      ],
    },
    {
      id: "affiliate",
      title: "联盟分佣",
      lead: "适合有订阅收入、毛利高、用户集中在博主和社群里的产品。",
      items: [
        {
          text: "Lemon Squeezy 自带联盟功能，联盟带来的订单额外收 3%，佣金冻结 30 天后发放；它支持的收款国家里没有中国大陆。",
          sources: [
            { label: "费用", url: "https://docs.lemonsqueezy.com/help/affiliates-for-merchants/fees" },
            { label: "付款", url: "https://docs.lemonsqueezy.com/help/affiliates-for-merchants/payouts" },
            { label: "支持国家", url: "https://docs.lemonsqueezy.com/help/getting-started/supported-countries" },
          ],
        },
        {
          text: "Creem 自带联盟中心，佣金可以设 0 到 100%，推广者要先做身份验证，每月 1 日和 15 日付款。",
          sources: [{ label: "Creem 文档", url: "https://docs.creem.io/features/affiliate-program" }],
        },
        {
          text: "Dodo Payments 没有自带联盟，官方对接 Affonso、Dub Partners 和 Rekomi；Polar 的文档里只有 Affonso 的集成指南。",
          sources: [
            { label: "Dodo 文档", url: "https://docs.dodopayments.com/features/affiliates" },
            { label: "Polar 文档", url: "https://polar.sh/docs/features/integrations/affonso" },
          ],
        },
        {
          text: "用第三方工具要先看支付平台对不对得上：Rewardful 每月 49 美元起，只支持旧版 Paddle Classic；Tolt 每月 69 美元起，支持 Stripe 和 Paddle；PromoteKit 每月 29 美元起，只支持 Stripe。",
          sources: [
            { label: "Rewardful", url: "https://www.rewardful.com/pricing" },
            { label: "Rewardful 和 Paddle", url: "https://www.rewardful.com/paddle" },
            { label: "Tolt", url: "https://tolt.com/pricing" },
            { label: "PromoteKit", url: "https://www.promotekit.com/pricing" },
          ],
        },
      ],
    },
    {
      id: "ads",
      title: "付费广告",
      lead: "适合已经验证过有人付费、客单价能覆盖获客成本的产品。",
      items: [
        {
          text: "Google Ads 的广告客户最终都要验证，到期没完成账户会被暂停。中国的个人要交政府签发的带照片证件，所有信息必须和付款资料完全一致。",
          sources: [
            { label: "广告客户验证", url: "https://support.google.com/adspolicy/answer/9703665" },
            { label: "验证期限", url: "https://support.google.com/adspolicy/answer/15588490" },
            { label: "中国的材料要求", url: "https://support.google.com/adspolicy/answer/9872280?hl=en&co=GENIE.CountryCode%3DCN" },
          ],
        },
        {
          text: "Meta：投放前要有 Facebook 主页和有效的付款方式；投欧盟必须填写广告主和付款方。",
          sources: [
            { label: "广告账户", url: "https://www.facebook.com/business/help/407323696966570" },
            { label: "欧盟要求", url: "https://www.facebook.com/business/help/721913190475838" },
          ],
        },
        {
          text: "广告出价看的是转化：先在 GA4 里把关键事件标上星，再关联 Google Ads 创建转化；关键事件只对标记以后的数据生效。",
          sources: [
            { label: "GA4 关键事件", url: "https://support.google.com/analytics/answer/13128484" },
            { label: "从关键事件创建转化", url: "https://support.google.com/analytics/answer/13965727" },
          ],
        },
        {
          text: "投欧洲经济区、英国和瑞士，要先征得用户同意并接入 Consent Mode v2；Consent Mode 本身不提供同意弹窗，要配合你自己的弹窗或认证的同意管理平台。",
          sources: [
            { label: "必须征得同意", url: "https://support.google.com/google-ads/answer/16142339" },
            { label: "Consent Mode v2", url: "https://support.google.com/google-ads/answer/13695607" },
            { label: "同意弹窗", url: "https://support.google.com/google-ads/answer/10000067" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "在群里发「帮我点个赞」，或者搞点赞抽奖：Product Hunt 和 Hacker News 都明令禁止。",
      sources: [
        { label: "Product Hunt", url: `${PH}/sharing-your-launch` },
        { label: "Show HN", url: SHOW_HN },
      ],
    },
    {
      text: "新号在好几个 Reddit 版块贴同一条产品链接，这正是 Reddit 官方举的 spam 例子；发之前先看各版侧栏的规则。",
      sources: [{ label: "Spam 说明", url: "https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam" }],
    },
    {
      text: "用浏览器脚本批量发帖、按关键词自动回复推产品：X 禁止，可能永久封号。",
      sources: [{ label: "自动化规则", url: X_AUTOMATION }],
    },
    {
      text: "用没配 SPF、DKIM、DMARC 的域名群发，或者导入买来的名单冷发。",
      sources: [{ label: "Gmail 发件人要求", url: GMAIL }],
    },
    {
      text: "联盟工具和支付平台对不上，或者漏算联盟订单的额外费用（例如 Lemon Squeezy 多收 3%）。",
      sources: [{ label: "Rewardful 和 Paddle", url: "https://www.rewardful.com/paddle" }],
    },
    {
      text: "没设关键事件和转化就开始投广告；投欧洲没接 Consent Mode v2。",
      sources: [{ label: "Consent Mode v2", url: "https://support.google.com/google-ads/answer/13695607" }],
    },
  ],
  unknowns: [
    "Product Hunt 首页怎么打分、广告多少钱都没公开；Hacker News 进 Show 页要多少分也没公开。",
    "Reddit Ads 的最低预算，以及 Reddit Ads、Reddit Pro 是否对中国大陆主体开放，官方没说明。",
    "中国大陆的广告主投 Google Ads 和 Meta 是否必须通过代理商开户，没找到官方页面。",
    "Stripe Managed Payments 有没有联盟功能、Creem 对联盟订单是否额外收费，官方没写。",
    "欧盟对营销邮件的同意要求（GDPR 和 ePrivacy），这次没有查官方原文。",
  ],
};
