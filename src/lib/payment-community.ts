// 这个文件不 import 任何东西，服务端页面和客户端组件（收款平台选择器）都可以引。

// 社群经验：哥飞的朋友们一年的收款踩坑总结（X @gefei55，2026-10，8 张图）。这是经验，不是官方规则：
// 页面上和官方文档的数据分开放、注明出处和日期；只做转述和要点，不搬原图原文。
// checks：10-17 对照官方页面核对过的说法（和社群原话不一致的以官方为准，原话保留、核对写在下面）。
export const COMMUNITY = {
  url: "https://x.com/gefei55/status/2110744564189515986",
  author: { zh: "哥飞的朋友们", en: "Gefei's community" },
  handle: "@gefei55",
  date: "2026-10",
  paths: [
    {
      who: { zh: "只有国内个人身份", en: "Only a mainland Chinese ID" },
      pick: { zh: "PayPal.cn（注册时选个人卖家）或 Waffo（waffo.ai）；另有护照和香港银行卡的，也能开 Stripe 个人户", en: "PayPal.cn (as a personal seller) or Waffo (waffo.ai); with a passport and a Hong Kong bank card, a Stripe personal account too" },
      checks: [
        {
          zh: "PayPal.cn 的个人卖家账户用个人实名认证开户（中国居民、满 18 岁）；收海外付款 4.40% + 0.30 美元；可以按人民币提现到国内银行卡（2026 年内 0.5% 封顶，标准 1.0%，另加 6% 增值税），也可以电汇美元（每笔 35 美元）。2026 年 6 月 30 日之后在 paypal.com 注册的个人账户不能收货款。",
          en: "PayPal.cn's personal seller account opens with real-name verification (China residents, 18 and over); payments from abroad cost 4.40% + US$0.30; withdraw in CNY to a Chinese bank card (0.5% cap through 2026, 1.0% standard, plus 6% VAT on the fee) or by USD wire (US$35 each). Personal accounts opened on paypal.com after 30 June 2026 cannot take payments for goods.",
          url: "https://www.paypal.cn/portal/individual-seller",
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
    dodo: { zh: "群里用的人还少，经验不多", en: "Few in the group use it yet" },
    paddle: { zh: "群里用的人还少，经验不多", en: "Few in the group use it yet" },
    lemonsqueezy: { zh: "已被 Stripe 收购，审核规则向 Stripe 看齐", en: "Owned by Stripe now; its reviews follow Stripe's rules" },
    polar: { zh: "不支持中国地区", en: "Does not support China" },
  } as Record<string, { zh: string; en: string }>,
  tips: [
    { zh: "别在正式环境自己付款测试，用沙箱：大概率触发风控", en: "Never test with a real payment in live mode; use the sandbox, or risk control will flag you" },
    { zh: "控制拒付率和争议率：被关店大多和 NSFW、争议率高有关", en: "Keep chargebacks and disputes low: most closed stores involved NSFW or high dispute rates" },
    { zh: "一个网站对应一个商户：多个网站共用一个商户，会被当成违规使用", en: "One website, one merchant: several sites on one merchant read as misuse" },
    { zh: "被封了别马上用同一个域名再开，这算对抗", en: "After a ban, do not reopen with the same domain right away: that counts as evasion" },
    { zh: "至少备一个收款渠道，救急用", en: "Keep a second payment channel for emergencies" },
    { zh: "先保证能稳定收到钱，再谈省一两个点的费率", en: "Getting paid reliably matters more than one or two points of fees" },
    { zh: "先接一个跑起来，再按用户地区补渠道：欧洲多用 PayPal，美国多用信用卡；同时接 PayPal 和 Stripe 付费率会上升，给欧元区用户欧元价格", en: "Start with one, then add channels by region: Europe uses PayPal a lot, the US pays by card; offering PayPal and Stripe together lifts conversion, and euro prices help in the euro area" },
  ],
};
