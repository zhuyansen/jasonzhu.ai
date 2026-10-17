// 这个文件不 import 任何东西，服务端页面和客户端组件（收款平台选择器）都可以引。

// 社群经验：哥飞的朋友们一年的收款踩坑总结（X @gefei55，2026-10，8 张图）。这是经验，不是官方规则：
// 页面上和官方文档的数据分开放、注明出处和日期；只做转述和要点，不搬原图原文。
export const COMMUNITY = {
  url: "https://x.com/gefei55/status/2110744564189515986",
  author: { zh: "哥飞的朋友们", en: "Gefei's community" },
  handle: "@gefei55",
  date: "2026-10",
  paths: [
    {
      who: { zh: "只有国内个人身份", en: "Only a mainland Chinese ID" },
      pick: { zh: "PayPal.cn（注册时选个人卖家）或 Waffo（waffo.ai）；另有护照和香港银行卡的，也能开 Stripe 个人户", en: "PayPal.cn (as a personal seller) or Waffo (waffo.ai); with a passport and a Hong Kong bank card, a Stripe personal account too" },
    },
    {
      who: { zh: "有公司（海外或国内公司、个体户）", en: "A company (abroad or in China) or a sole proprietorship" },
      pick: { zh: "Stripe（一个网站一个商户）或 PayPal.cn，也可以走 Subotiz", en: "Stripe (one merchant per website) or PayPal.cn, or Subotiz" },
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
