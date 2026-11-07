import type { Guide } from "../go-global-guides";

// 各市场买家怎么付钱、境外卖家能收哪些：份额多是第三方转引 Worldpay 的电商数据，能不能收以 Stripe、Paddle、
// Lemon Squeezy、PayPal 自己的文档为准。调研笔记在 ~/出海/research/2026-11-by-market/05-local-payments.md（不在仓库里）。
const STRIPE_TABLE = "https://docs.stripe.com/payments/payment-methods/payment-method-support";
const ANTOM = "https://www.antom.com/markets";
const LS_METHODS = "https://docs.lemonsqueezy.com/help/checkout/payment-methods";
const PADDLE = "https://developer.paddle.com/concepts/payment-methods";

export const LOCAL_PAYMENTS: Guide = {
  slug: "local-payments",
  short: "各市场买家怎么付钱",
  parent: { short: "收款平台选择器", path: "/payments" },
  title: "各市场的买家怎么付钱：美国、印尼、越南、日本、韩国、俄罗斯、中国、欧洲、英国，境外卖家能收哪些",
  description:
    "收款平台选择器按「你是谁、卖什么」排，这一页按「买家在哪」看：各市场网购主要用什么付款，Stripe、Paddle、Lemon Squeezy、PayPal 能收哪些、能不能做订阅，以及俄罗斯为什么基本收不了。",
  intro:
    "同一个订阅产品，美国人用钱包和信用卡，印尼人用电子钱包和转账，荷兰人用 iDEAL，俄罗斯发的卡基本付不进来。下面按市场列出买家常用的付款方式，以及境外卖家通过 Stripe、Paddle、Lemon Squeezy、PayPal 实际收得到哪些。Stripe 能开哪种付款方式取决于你的 Stripe 账户注册在哪个国家；Paddle 和 Lemon Squeezy 是代收方，不需要当地公司。份额多是第三方转引 Worldpay 的 2025 年电商数据。",
  checked: "2026-11-07",
  sections: [
    {
      id: "platforms",
      title: "先看平台：Lemon Squeezy 和 PayPal 能收什么",
      items: [
        {
          text: "Lemon Squeezy 支持卡（含 JCB、银联）、PayPal、Apple Pay、Google Pay、支付宝、微信支付、Cash App Pay 和 ACH；做订阅只能用卡、Apple Pay、Google Pay 和 PayPal。",
          sources: [{ label: "Lemon Squeezy", url: LS_METHODS }],
        },
        {
          text: "PayPal 提供 iDEAL、Bancontact、BLIK、P24 等欧洲本地付款方式；它的国家列表里有印尼、越南、日本、韩国和中国，没有俄罗斯。",
          sources: [
            { label: "PayPal 本地付款方式", url: "https://developer.paypal.com/docs/checkout/apm/" },
            { label: "PayPal 国家列表", url: "https://www.paypal.com/us/webapps/mpp/country-worldwide" },
          ],
        },
      ],
    },
    {
      id: "us",
      title: "美国",
      items: [
        {
          text: "2025 年电商：钱包 40%，信用卡 32%，借记卡 16%，先买后付 6%，银行直付 4%。",
          sources: [{ label: "Antom 转引 Worldpay", url: `${ANTOM}/united-states` }],
        },
        {
          text: "Stripe 的 ACH 借记（可以做订阅）只给美国、欧洲经济区、英国和瑞士的账户；Cash App Pay 和美国买家用的 Klarna 只给美国账户。",
          sources: [
            { label: "Stripe 付款方式总表", url: STRIPE_TABLE },
            { label: "Stripe Klarna", url: "https://docs.stripe.com/payments/klarna" },
          ],
        },
        {
          text: "Paddle 的卡、PayPal、Apple Pay、Google Pay 都能做订阅。",
          sources: [{ label: "Paddle", url: `${PADDLE}/overview` }],
        },
      ],
    },
    {
      id: "indonesia",
      title: "印尼",
      items: [
        {
          text: "2025 年电商：电子钱包 42%，银行转账 34%，货到付款 13%，卡只占 5% 到 7%。",
          sources: [{ label: "Antom 转引 Worldpay", url: `${ANTOM}/indonesia` }],
        },
        {
          text: "二维码支付 QRIS 2025 年 155.1 亿笔，比上一年多 148.54%（印尼央行口径）。",
          sources: [{ label: "Kontan（2026-03-12）", url: "https://keuangan.kontan.co.id/news/bi-mencatat-nilai-transaksi-qris-capai-rp-16448-triliun-pada-januari-2026" }],
        },
        {
          text: "Stripe 的 QRIS 和 GoPay 都是预览版，要申请审批：QRIS 只给印尼和美国账户，不能做订阅；GoPay 给印尼、新加坡、美国账户，可以做订阅。Paddle 和 Lemon Squeezy 没有印尼本地的付款方式。",
          sources: [
            { label: "Stripe QRIS", url: "https://docs.stripe.com/payments/qris" },
            { label: "Stripe GoPay", url: "https://docs.stripe.com/payments/gopay" },
          ],
        },
      ],
    },
    {
      id: "vietnam",
      title: "越南",
      items: [
        {
          text: "2025 年电商：电子钱包 38%，转账（VietQR）28%，货到付款 16%，信用卡 12%，借记卡 4%。",
          sources: [{ label: "Antom 转引 Worldpay", url: `${ANTOM}/vietnam` }],
        },
        {
          text: "VietQR 2025 年 1–10 月的笔数涨了 52%，近 9,000 万个手机银行账户在用。",
          sources: [{ label: "NAPAS（2025-11-21）", url: "https://en.napas.com.vn/napas-2025-member-organization-conference-184260317124736875.htm" }],
        },
        {
          text: "Stripe 的 MoMo 只给美国账户，要排队申请；Stripe 没有 VietQR。Paddle 和 Lemon Squeezy 没有越南本地的付款方式，Paddle 的 PayPal 也不支持用越南盾定价。",
          sources: [
            { label: "Stripe MoMo", url: "https://docs.stripe.com/payments/momo" },
            { label: "Paddle PayPal", url: `${PADDLE}/paypal` },
          ],
        },
      ],
    },
    {
      id: "japan",
      title: "日本",
      items: [
        {
          text: "2025 年电商：信用卡 58%，钱包 29%，便利店和现金 5%，转账 3%，先买后付 2%。",
          sources: [{ label: "Antom 转引 Worldpay", url: `${ANTOM}/japan` }],
        },
        {
          text: "Stripe 的便利店付款（Konbini）和 PayPay 只开给日本账户。便利店付款做订阅，只能每期单独开账单，买家每期到店付现金；PayPay 不能做订阅。",
          sources: [
            { label: "Stripe Konbini", url: "https://docs.stripe.com/payments/konbini" },
            { label: "Stripe PayPay", url: "https://docs.stripe.com/payments/paypay" },
          ],
        },
        {
          text: "境外卖家主要靠信用卡：Stripe 的美国、香港、新加坡、英国和欧洲经济区账户都能收 JCB 卡。Paddle 和 Lemon Squeezy 没有日本本地的付款方式。",
          sources: [{ label: "Stripe 卡组织", url: "https://docs.stripe.com/payments/cards/supported-card-brands" }],
        },
      ],
    },
    {
      id: "korea",
      title: "韩国",
      items: [
        {
          text: "2025 年电商：信用卡 49%，钱包 35%，转账 7%，借记卡 5%。多数韩国的卡走 9 个本土卡网络，不走 Visa 和 Mastercard。",
          sources: [
            { label: "Antom 转引 Worldpay", url: `${ANTOM}/south-korea` },
            { label: "Paddle 韩国卡", url: `${PADDLE}/korean-cards` },
          ],
        },
        {
          text: "Stripe 不需要韩国公司，也能收全部韩国本地卡和 Naver Pay、Kakao Pay、Samsung Pay、PAYCO（美国、香港、日本、新加坡、英国和多数欧盟账户可用）；本地卡、Kakao Pay、Naver Pay 能做订阅，Samsung Pay 和 PAYCO 不能。",
          sources: [{ label: "Stripe 韩国", url: "https://docs.stripe.com/payments/countries/korea" }],
        },
        {
          text: "韩国对订阅有特别规定：涨价要提前 30 天取得用户同意，每次扣款前 7 天要提醒。",
          sources: [{ label: "Stripe 韩国", url: "https://docs.stripe.com/payments/countries/korea" }],
        },
        {
          text: "Paddle 的韩国本地卡、Kakao Pay、Naver Pay 也能做订阅；Stripe 和 Paddle 都没有 Toss Pay。",
          sources: [{ label: "Paddle Kakao Pay", url: `${PADDLE}/kakaopay` }],
        },
      ],
    },
    {
      id: "russia",
      title: "俄罗斯：基本收不了",
      items: [
        {
          text: "俄罗斯发的 Visa 卡在境外不能用；俄罗斯本地用 Mir 卡（2026 年 7 月有 5.2 亿张）和快速支付系统 SBP。",
          sources: [
            { label: "Visa（2022-03-05）", url: "https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.18871.html" },
            { label: "俄罗斯央行", url: "https://www.cbr.ru/eng/psystem/" },
          ],
        },
        {
          text: "Stripe 不支持 Mir 卡，俄罗斯发的卡「不太可能付成功」，而且禁止用 Stripe 向俄罗斯境内的人提供 IT 支持、企业管理软件和设计软件的云服务。",
          sources: [{ label: "Stripe 制裁说明", url: "https://support.stripe.com/questions/sanctions-on-russia-and-belarus" }],
        },
        {
          text: "Paddle 和 Lemon Squeezy 都明确不向俄罗斯买家销售，PayPal 2022 年起暂停了俄罗斯的服务。剩下能付钱的只有持境外卡的买家，卖之前还要先自查制裁规定。",
          sources: [
            { label: "Paddle", url: "https://www.paddle.com/help/legal/sanctions/which-countries-are-supported-by-paddle" },
            { label: "Lemon Squeezy", url: "https://docs.lemonsqueezy.com/help/getting-started/supported-countries" },
            { label: "Interfax", url: "https://interfax.com/newsroom/top-stories/75588/" },
          ],
        },
      ],
    },
    {
      id: "china",
      title: "中国大陆",
      items: [
        {
          text: "2025 年电商：支付宝和微信支付合计 89%。",
          sources: [{ label: "FF News 转引 Worldpay", url: "https://ffnews.com/newsarticle/its-a-summer-of-football-but-which-payment-method-takes-the-trophy/" }],
        },
        {
          text: "Stripe 能收大陆买家的支付宝和微信支付（美国、香港、新加坡、日本、英国、欧盟等地的账户），但大陆公司开不了 Stripe 账户。支付宝的定期扣款要邀请，还要支付宝单独批准；微信支付的定期扣款还在内测。",
          sources: [
            { label: "Stripe 支付宝", url: "https://docs.stripe.com/payments/alipay" },
            { label: "Stripe 微信支付", url: "https://docs.stripe.com/payments/wechat-pay" },
          ],
        },
        {
          text: "Paddle 的支付宝要审批，只能用人民币定价，续费每笔不超过 1,600 元；微信支付只能在电脑上用，不能订阅。Lemon Squeezy 两种都能收，但只能一次性付款。",
          sources: [
            { label: "Paddle 支付宝", url: `${PADDLE}/alipay` },
            { label: "Paddle 微信支付", url: `${PADDLE}/wechat` },
            { label: "Lemon Squeezy", url: LS_METHODS },
          ],
        },
      ],
    },
    {
      id: "eu",
      title: "欧盟",
      items: [
        {
          text: "欧元区网购：卡 48%，钱包和 App 等其他电子方式 29%（2024 年）。",
          sources: [{ label: "欧洲央行", url: "https://www.ecb.europa.eu/press/pr/date/2024/html/ecb.pr241219~172b929461.en.html" }],
        },
        {
          text: "荷兰 iDEAL 占网购 71%（2025 年），2026–2027 年迁到 Wero；波兰 BLIK 2025 年电商 14 亿笔；比利时 Bancontact 2024 年线上 3.82 亿笔。",
          sources: [
            { label: "荷兰支付协会", url: "https://www.betaalvereniging.nl/en/knowledge-base/online-payments/" },
            { label: "Stripe iDEAL", url: "https://docs.stripe.com/payments/ideal" },
            { label: "BLIK", url: "https://www.blik.com/en/nearly-3-bn-blik-transactions-in-2025-and-over-2-m-new-users" },
            { label: "Bancontact", url: "https://www.bancontact.com/en/news/2-5-billion-payments-with-bancontact-and-payconiq-in-2024-2-5-billion-times-thank-you-for-your-trust-in-us" },
          ],
        },
        {
          text: "Stripe 的 iDEAL、Bancontact、SEPA 直接借记对美国、香港、新加坡、日本等账户开放，BLIK 不对香港和日本账户开放。SEPA 能做订阅；iDEAL 首次付款以后用 SEPA 续扣；BLIK 能做订阅（单笔最多 2,000 兹罗提）；Bancontact 不能。",
          sources: [
            { label: "Stripe 付款方式总表", url: STRIPE_TABLE },
            { label: "Stripe BLIK", url: "https://docs.stripe.com/payments/blik" },
            { label: "Stripe Bancontact", url: "https://docs.stripe.com/payments/bancontact" },
          ],
        },
        {
          text: "Stripe 的 Klarna 只有欧洲经济区、英国、瑞士的账户能收欧洲买家，美国和香港的卖家收不了。",
          sources: [{ label: "Stripe Klarna", url: "https://docs.stripe.com/payments/klarna" }],
        },
        {
          text: "Paddle 的 iDEAL、Bancontact、BLIK 都不能做订阅，也没有 SEPA 直接借记和 Klarna；Lemon Squeezy 这些都没有。",
          sources: [{ label: "Paddle iDEAL", url: `${PADDLE}/ideal` }],
        },
      ],
    },
    {
      id: "uk",
      title: "英国",
      items: [
        {
          text: "2025 年电商：钱包 40%，信用卡 23%，借记卡 22%，先买后付 8%，开放银行 6%。",
          sources: [{ label: "Antom 转引 Worldpay", url: `${ANTOM}/united-kingdom` }],
        },
        {
          text: "Stripe 的 Bacs 直接借记只给英国账户，Pay by Bank 只给英国、爱尔兰、芬兰账户；所以境外卖家主要靠卡、Apple Pay、Google Pay 和 PayPal。",
          sources: [{ label: "Stripe 付款方式总表", url: STRIPE_TABLE }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "用 Paddle 或 Lemon Squeezy 卖给俄罗斯买家：两家都明确不卖。",
      sources: [
        { label: "Paddle", url: "https://www.paddle.com/help/legal/sanctions/which-countries-are-supported-by-paddle" },
        { label: "Lemon Squeezy", url: "https://docs.lemonsqueezy.com/help/getting-started/supported-countries" },
      ],
    },
    {
      text: "在日本用便利店付款收订阅：只能每期单独开账单，买家每期都要去店里付现金。",
      sources: [{ label: "Stripe Konbini", url: "https://docs.stripe.com/payments/konbini" }],
    },
    {
      text: "以为 Stripe 的 QRIS、GoPay、MoMo 打开就能用：三个都是预览版，要申请审批。",
      sources: [
        { label: "Stripe QRIS", url: "https://docs.stripe.com/payments/qris" },
        { label: "Stripe MoMo", url: "https://docs.stripe.com/payments/momo" },
      ],
    },
    {
      text: "韩国订阅涨价不提前通知：要提前 30 天取得用户同意，每次扣款前 7 天提醒。",
      sources: [{ label: "Stripe 韩国", url: "https://docs.stripe.com/payments/countries/korea" }],
    },
    {
      text: "用美国或香港的 Stripe 账户开 Klarna，想覆盖欧洲买家：只有欧洲经济区、英国、瑞士的账户能收。",
      sources: [{ label: "Stripe Klarna", url: "https://docs.stripe.com/payments/klarna" }],
    },
    {
      text: "用 Lemon Squeezy 收支付宝、微信支付来做订阅：只支持一次性付款。",
      sources: [{ label: "Lemon Squeezy", url: LS_METHODS }],
    },
  ],
  unknowns: [
    "各国份额多来自第三方转引 Worldpay 的报告，原报告没读到；日本便利店付款的份额，Antom 说 5%，2Checkout 说 18%。",
    "俄罗斯网购按付款方式分的份额、比利时 Bancontact 在网购里的份额，都没找到官方数字。",
    "PayPal 的本地付款方式能不能做定期扣款，官方没写。",
    "Stripe 付款方式总表说 Bancontact 可以存成 SEPA 直接借记再续扣，和 Bancontact 单页的说法矛盾。",
    "日本强制 3D 验证是否也管境外商户，没查实。",
  ],
  related: [
    { label: "收款平台选择器", path: "/payments" },
    { label: "个人还是公司，怎么开户", path: "/open-account" },
    { label: "卖数字产品要交的税", path: "/digital-tax" },
    { label: "上线以后的风控", path: "/payment-risk" },
  ],
};
