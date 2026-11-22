// 这个文件不 import 任何东西，服务端页面和客户端组件（收款平台选择器）都可以引。

// 社群经验：哥飞的朋友们一年的收款踩坑总结（X @gefei55，2026-10，8 张图）。这是经验，不是官方规则：
// 页面上和官方文档的数据分开放、注明出处和日期；只做转述和要点，不搬原图原文。
// checks：10-17 对照官方页面核对过的说法（和社群原话不一致的以官方为准，原话保留、核对写在下面）。
// 2026-11-21 删掉 PayPal 那条里的「2026 年 6 月 30 日之后在 paypal.com 注册的个人账户不能收货款」：
// paypal.cn 的个人卖家页、账户选择页、公告中心和搜索结果里都没找到 PayPal 的原文，按「找不到出处就删」处理。
export const COMMUNITY = {
  url: "https://x.com/gefei55/status/2110744564189515986",
  author: { zh: "哥飞的朋友们", en: "Gefei's community" },
  handle: "@gefei55",
  date: "2026-10",
  paths: [
    {
      who: { zh: "只有国内个人身份", en: "Only a mainland Chinese ID" },
      pick: {
        zh: "Waffo（waffo.ai）+ Dodo Payments（dodopayments.com）双通道组合，或 PayPal.cn（注册时选个人卖家）；另有护照和香港银行卡的，也能开 Stripe 个人户",
        en: "Waffo (waffo.ai) + Dodo Payments (dodopayments.com) dual-gateway setup, or PayPal.cn (as a personal seller); with a passport and a Hong Kong bank card, a Stripe personal account too",
      },
      checks: [
        {
          zh: "PayPal.cn 的个人卖家账户用个人实名认证开户（中国居民、满 18 岁）；收海外付款 4.40% + 0.30 美元；可以按人民币提现到国内银行卡（2026 年内 0.5% 封顶，标准 1.0%，另加 6% 增值税），也可以电汇美元（每笔 35 美元）。",
          en: "PayPal.cn's personal seller account opens with real-name verification (China residents, 18 and over); payments from abroad cost 4.40% + US$0.30; withdraw in CNY to a Chinese bank card (0.5% cap through 2026, 1.0% standard, plus 6% VAT on the fee) or by USD wire (US$35 each).",
          url: "https://www.paypal.cn/portal/individual-seller",
        },
        {
          zh: "paypal.com 用户协议「中国大陆」一节：2026 年 6 月 30 日（或 PayPal 另行通知的更晚日期）之后新开的个人账户，除了收亲友的个人转账，不能再作为卖家收款，商品和服务的货款都不行。大陆个人卖货用上一条的 PayPal.cn 个人卖家账户。",
          en: "PayPal's user agreement, Mainland China section: personal accounts opened after 30 June 2026 (or a later date PayPal announces) can no longer request or accept payments as a seller, goods and services included; only personal payments from friends and family. Mainland individuals who sell use the PayPal.cn personal seller account above.",
          url: "https://www.paypal.com/c2/legalhub/paypal/useragreement-full",
        },
        {
          zh: "Stripe 香港个人开户要香港身份证号；没有的话，要有香港商业登记号，按独资经营开户，还要香港地址和本人名下的香港银行账户。只有护照和香港银行卡不够。",
          en: "Stripe Hong Kong needs an HKID number for an individual; without one, a Hong Kong Business Registration Number as a sole proprietorship, plus a Hong Kong address and a Hong Kong bank account in your name. A passport and a Hong Kong bank card are not enough.",
          url: "https://support.stripe.com/questions/requirements-for-hong-kong-based-businesses",
        },
      ],
    },
    {
      who: { zh: "有公司（海外或国内公司、个体户）", en: "A company (abroad or in China) or a sole proprietorship" },
      pick: { zh: "Stripe（一个网站一个商户）或 PayPal.cn，也可以走 Subotiz", en: "Stripe (one merchant per website) or PayPal.cn, or Subotiz" },
      checks: [
        {
          zh: "Stripe 官方：各自独立运营的网站或业务要分别开 Stripe 账户，被停用的用户不能未经批准再开新账户。",
          en: "Stripe: websites or businesses run independently need separate Stripe accounts, and a suspended user may not open a new one without Stripe's approval.",
          url: "https://docs.stripe.com/get-started/account/multiple-accounts",
        },
        {
          zh: "Subotiz 官方定位是面向 SaaS 的 MoR（5% + 50 美分），可以接 PayPal、Checkout.com、Airwallex 等，接入列表里没有 Stripe；一个账号最多 100 个店铺。",
          en: "Subotiz describes itself as a Merchant of Record for SaaS (5% + 50¢); it connects PayPal, Checkout.com, Airwallex and others, with no Stripe in that list; one account holds up to 100 stores.",
          url: "https://www.subotiz.com/global-payments",
        },
      ],
    },
    {
      who: { zh: "做换脸、deepfake、NSFW", en: "Face swap, deepfakes, NSFW" },
      pick: { zh: "主流通道基本不收，别拿主账号冒险", en: "The main channels refuse it; do not risk your main account" },
    },
  ],
  platforms: {
    stripe: { zh: "自己收单，付费转化最高；守规矩：一个网站一个商户，被封后别马上用同一个域名重开", en: "Your own merchant account, the best conversion; keep the rules: one merchant per site, and do not reopen with the same domain after a ban" },
    waffo: { zh: "推荐：国内个人能注册、提现到支付宝，审核一般几个小时；真人 deepfake 类不收", en: "Recommended: mainland individuals can sign up and withdraw to Alipay, reviews often take hours; no deepfakes of real people" },
    creem: { zh: "2026 年 8 月起不再推荐，新站直接选别家", en: "No longer recommended since August 2026; new sites pick another" },
    dodo: {
      zh: "推荐与 Waffo 组成双通道备份（刘小排 2026-11 实测）：大陆个人身份证/护照可开；通过专属合作链接注册费率从默认 6%+$0.40 降至 3.8%~3.9%+$0.40（0 国际卡费、0 订阅费、前 $200 免手续费），卖 $20 跨国订阅仅扣 $1.18；原生支持微信支付+40 多种本地支付统一结算美元，内置 AI 积分/用量计费与官方 MCP，满 $1,000 提现免 $5 手续费",
      en: "Recommended dual-gateway pairing with Waffo (Liu Xiaopai, 2026-11): mainland ID/passport accepted; partner signup link drops the rate from 6%+$0.40 default to 3.8%–3.9%+$0.40 (0% international card fee, 0% subscription fee, first $200 fee-free), taking just $1.18 on a $20 subscription; native WeChat Pay + 40+ local payment methods settling in USD, built-in AI credits/usage billing & official MCP, and $0 payout fee above $1,000",
    },
    paddle: { zh: "群里用的人还少，经验不多", en: "Few in the group use it yet" },
    lemonsqueezy: { zh: "已被 Stripe 收购，审核规则向 Stripe 看齐", en: "Owned by Stripe now; its reviews follow Stripe's rules" },
    polar: { zh: "不支持中国地区", en: "Does not support China" },
    paypal: { zh: "国内个人身份能注册（选个人卖家）；出事「有商量，可整改」；争议率要控制住，高了会被限制", en: "A mainland ID can sign up (as a personal seller); problems can be talked through and fixed; keep disputes low or the account gets limited" },
  } as Record<string, { zh: string; en: string }>,
  tips: [
    { zh: "别在正式环境自己付款测试，用沙箱：大概率触发风控", en: "Never test with a real payment in live mode; use the sandbox, or risk control will flag you" },
    { zh: "控制拒付率和争议率：被关店大多和 NSFW、争议率高有关", en: "Keep chargebacks and disputes low: most closed stores involved NSFW or high dispute rates" },
    { zh: "一个网站对应一个商户：多个网站共用一个商户，会被当成违规使用", en: "One website, one merchant: several sites on one merchant read as misuse" },
    { zh: "被封了别马上用同一个域名再开，这算对抗", en: "After a ban, do not reopen with the same domain right away: that counts as evasion" },
    { zh: "至少备一个收款渠道，救急用（例如线上同时配好 Waffo + Dodo Payments，主通道抽风时改一行配置即可切流）", en: "Keep a second payment channel for emergencies (e.g., wire up Waffo + Dodo Payments in parallel so you can fail over with a one-line config change)" },
    { zh: "先保证能稳定收到钱，再谈省一两个点的费率", en: "Getting paid reliably matters more than one or two points of fees" },
    { zh: "先接一个跑起来，再按用户地区补渠道：欧洲多用 PayPal，美国多用信用卡；同时接 PayPal 和 Stripe 付费率会上升，给欧元区用户欧元价格", en: "Start with one, then add channels by region: Europe uses PayPal a lot, the US pays by card; offering PayPal and Stripe together lifts conversion, and euro prices help in the euro area" },
  ],
  dodoPractice: {
    author: { zh: "刘小排", en: "Liu Xiaopai" },
    date: "2026-11-15",
    url: "https://mp.weixin.qq.com/s/uTtP5zv_exiHa52qSa07BA",
    blogSlug: "dodo-payments-waffo-ai-saas-fee-comparison",
    partnerUrl: "https://app.dodopayments.com/partners/W5PU4ZrGTK/signup",
    headline: {
      zh: "刘小排实测：Waffo + Dodo Payments 双通道备份与 $20 跨国 AI 订阅真实扣费对比",
      en: "Liu Xiaopai's Field Report: Waffo + Dodo Payments Dual-Gateway Stack & $20 AI Subscription Real Cost Comparison",
    },
    summary: {
      zh: "做出海产品不要只接一家收款平台。目前线上同时跑 Waffo（主力）+ Dodo Payments（双主力/备份）：大陆个人身份证或护照即可开户，MoR 全包全球税务；通过专属链接注册可将 Dodo 默认的 6%+$0.40（4%基础+1.5%国际卡+0.5%订阅）降至 3.8%~3.9%+$0.40（0 国际卡费、0 订阅费、前 $200 免手续费），且攒满 $1,000 提现免 $5 手续费。",
      en: "Never rely on a single payment gateway abroad. Running Waffo (primary) + Dodo Payments (co-primary/backup) lets mainland individuals onboard with an ID/passport under a full MoR tax model. Signing up via the partner link drops Dodo's default 6%+$0.40 rate down to 3.8%–3.9%+$0.40 (0% international card fee, 0% subscription fee, first $200 fee-free), with $0 payout fee when withdrawing $1,000+.",
    },
    comparison20Usd: [
      {
        name: { zh: "Dodo Payments（专属合作费率）", en: "Dodo Payments (Partner Rate)" },
        fee: { zh: "3.8%~3.9% + $0.40（0 国际卡费、0 订阅费）", en: "3.8%–3.9% + $0.40 (0% intl, 0% subscription)" },
        cost: "$1.16 ~ $1.18",
        net: "$18.82 ~ $18.84",
        highlight: true,
      },
      {
        name: { zh: "Waffo Pancake", en: "Waffo Pancake" },
        fee: { zh: "3.9% + $0.50（0 国际卡费、0 订阅费；提现 1%）", en: "3.9% + $0.50 (0% intl, 0% sub; 1% payout)" },
        cost: "$1.28",
        net: "$18.72",
        highlight: false,
      },
      {
        name: { zh: "Dodo Payments（官网默认费率）", en: "Dodo Payments (Official Default)" },
        fee: { zh: "4.0% + $0.40 + 1.5% 国际卡 + 0.5% 订阅", en: "4.0% + $0.40 + 1.5% intl + 0.5% subscription" },
        cost: "$1.60",
        net: "$18.40",
        highlight: false,
      },
      {
        name: { zh: "香港公司 Stripe（含换汇/Billing/Tax/Radar）", en: "Stripe HK (with FX / Billing / Tax / Radar)" },
        fee: { zh: "3.4%+HK$2.35 + 0.5%国际卡 + 2%换汇 + 0.7%订阅 + 0.5%税 + 风控（另加香港公司每年年审审计费）", en: "3.4%+HK$2.35 + 0.5% intl + 2% FX + 0.7% Billing + 0.5% Tax + Radar (+annual HK audit)" },
        cost: "~$1.79",
        net: "~$18.21",
        highlight: false,
      },
      {
        // 2026-11-16 官方宣布关停：https://www.lemonsqueezy.com/blog/saying-goodbye-to-lemon-squeezy
        name: { zh: "Lemon Squeezy（老牌 MoR；2026-11-16 起不收新店，2027-03-31 停止收款）", en: "Lemon Squeezy (legacy MoR; no new stores since 16 Nov 2026, stops processing payments on 31 Mar 2027)" },
        fee: { zh: "5.0% + $0.50 + 1.5% 国际卡 + 0.5% 订阅 + 1% 提现", en: "5.0% + $0.50 + 1.5% intl + 0.5% sub + 1% payout" },
        cost: "$2.08",
        net: "$17.92",
        highlight: false,
      },
    ],
    highlights: [
      {
        zh: "原生支持微信支付 + 40 多种本地支付（Alipay HK、Kakao Pay、Pix、UPI、Apple Pay、USDC）：国内用户无需外币卡直接付人民币，后台统一按美元结算",
        en: "Native WeChat Pay + 40+ local methods (Alipay HK, Kakao Pay, Pix, UPI, Apple Pay, USDC): domestic Chinese users pay via WeChat Pay while you settle uniformly in USD",
      },
      {
        zh: "原生内置 AI 用量 / 积分（Credits）计费与官方 MCP Server：适合按 Token 或积分包扣减的 AI 产品，可在 Cursor / Claude Code 中直接调用 MCP 接入",
        en: "Built-in AI usage / credits billing & official MCP Server: purpose-built for token/credit-based AI apps with direct MCP integration in Cursor or Claude Code",
      },
      {
        zh: "提现省钱规则：$50 起提，单笔低于 $1,000 收 $5 固定费，攒满 $1,000 以上提现免手续费（$0）",
        en: "Payout rule of thumb: $50 minimum; payouts under $1,000 cost $5 flat, while payouts of $1,000+ are $0 fee",
      },
    ],
  },
};

