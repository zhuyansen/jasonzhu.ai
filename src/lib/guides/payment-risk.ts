import type { Guide } from "../go-global-guides";

// 上线以后的风控：盗刷和卡测试、拒付、冻结和保证金、AI 产品的试用滥用、平台已经替你对买家承诺的退款。
// 全部按 Stripe、PayPal、卡组织和各家 MoR 的官方文档、条款整理。
const CARD_TESTING = "https://docs.stripe.com/disputes/prevention/card-testing";
const MONITORING = "https://docs.stripe.com/disputes/monitoring-programs";
const DISPUTES = "https://docs.stripe.com/disputes/how-disputes-work";
const PADDLE_CB = "https://www.paddle.com/help/manage/risk-prevention/understanding-chargebacks-with-paddle";

export const PAYMENT_RISK: Guide = {
  slug: "payment-risk",
  short: "上线后的风控",
  title: "收款上线以后的风控：盗刷和卡测试、拒付率、冻结和保证金",
  description:
    "网站开始收钱以后最容易出事的地方：卡测试攻击、拒付率超线、账户冻结和保证金、AI 产品的免费试用被薅，以及 Stripe、PayPal、Paddle、Lemon Squeezy、Creem、Dodo、Polar、Waffo Pancake 各自的规则。",
  intro:
    "过了收款平台的审核只是开始。上线以后，盗刷、拒付和退款会直接决定账户能不能活下去。下面按各家官方文档整理：什么情况会被冻结，拒付率的红线在哪里，怎么防。",
  checked: "2026-10-17",
  sections: [
    {
      id: "card-testing",
      title: "盗刷和卡测试",
      items: [
        {
          text: "卡测试是有人用脚本批量验证偷来或枚举出来的卡号，常用小额支付或绑卡来试。征兆是失败或被拦截的支付突然激增、大量小额订单、姓名和邮箱乱填。",
          sources: [{ label: "Stripe 卡测试指南", url: CARD_TESTING }],
        },
        {
          text: "被攻击后，拒付、早期欺诈预警和拒绝率都会上升，攻击停了以后正常交易也可能更容易被拒。先把已经成功的可疑交易退款，再加防护。",
          sources: [{ label: "Stripe 卡测试指南", url: CARD_TESTING }],
        },
        {
          text: "首选防线是用最新版的 Stripe Checkout 或 Payment Element，自带限流、AI 模型和验证码。自己做的话，验证码要在服务端校验、覆盖所有能绑卡或付款的请求，再按 IP 和账户限制下单和绑卡次数。",
          sources: [{ label: "Stripe 卡测试指南", url: CARD_TESTING }],
        },
        {
          text: "Radar 自定义规则（例如同一 IP 每小时只允许 1 笔、CVC 校验不通过就拦）需要 Plus 或 Pro 套餐；基础的 Radar Lite 只有 AI 防护和卡测试防护。",
          sources: [
            { label: "Radar 规则入门", url: "https://stripe.com/guides/radar-rules-101" },
            { label: "Radar 怎么运作", url: "https://docs.stripe.com/radar/how-radar-works" },
          ],
        },
        {
          text: "两种自伤：攻击之后对失败的卡反复重试，或者 secret key 泄露，都会制造出像卡测试一样的流量。",
          sources: [{ label: "Stripe 卡测试指南", url: CARD_TESTING }],
        },
      ],
    },
    {
      id: "disputes",
      title: "拒付",
      items: [
        {
          text: "Stripe：拒付一发起就从余额扣走争议金额和争议费。美国每笔收到争议费 15 美元，应诉再收 15 美元（胜诉退还应诉费），香港是 85 加 85 港元。证据只能交一次，交了不能改。",
          sources: [
            { label: "争议流程", url: DISPUTES },
            { label: "争议费", url: "https://support.stripe.com/questions/june-2025-pricing-updates-for-disputes" },
            { label: "怎么应诉", url: "https://docs.stripe.com/disputes/responding" },
          ],
        },
        {
          text: "收到早期欺诈预警时，订单金额不超过争议费的，主动退款最划算。",
          sources: [{ label: "争议流程", url: DISPUTES }],
        },
        {
          text: "行业惯例把拒付率高于 0.75% 视为过高；各家平台自己的线更低：Polar 0.4%，Dodo 0.5%（还算上退款和取消），Paddle 0.65%。",
          sources: [
            { label: "Stripe", url: "https://docs.stripe.com/disputes/measuring" },
            { label: "Polar", url: "https://polar.sh/docs/merchant-of-record/account-reviews" },
            { label: "Dodo 条款", url: "https://dodopayments.com/legal/terms-of-use" },
            { label: "Paddle", url: PADDLE_CB },
          ],
        },
        {
          text: "卡组织也在盯：Visa 的 VAMP 从 2026 年 4 月 1 日起把亚太、欧盟、美国等地「过高」的门槛降到 1.5%，同时要求当月计数达到 1,500 笔；Mastercard 拒付率 1.5% 以上且当月 100 笔以上就进监控，第 2 个月起罚款。",
          sources: [
            { label: "Visa 说明", url: "https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf" },
            { label: "Stripe 汇总", url: MONITORING },
          ],
        },
        {
          text: "因为拒付被关户，可能被列入 MATCH 或 VMSS 名单，保留 5 年，换哪家收单都难。",
          sources: [{ label: "Stripe", url: "https://docs.stripe.com/disputes/match" }],
        },
        {
          text: "各家 MoR 的拒付费：Paddle 每笔 20 美元，胜诉也不退，而且全自动应诉、不接受卖家补证据；Lemon Squeezy 15 美元；Creem 25 美元；Dodo 30 美元；Polar 文档写 15 美元、条款写最高 30 美元；Waffo Pancake 25 美元，应诉另收 10 美元。",
          sources: [
            { label: "Paddle", url: PADDLE_CB },
            { label: "Lemon Squeezy", url: "https://docs.lemonsqueezy.com/help/payments/refunds-chargebacks" },
            { label: "Creem", url: "https://docs.creem.io/merchant-of-record/finance/refunds-and-chargebacks" },
            { label: "Dodo", url: "https://dodopayments.com/pricing" },
            { label: "Polar", url: "https://polar.sh/docs/merchant-of-record/fees" },
            { label: "Waffo Pancake", url: "https://docs.waffo.ai/mor/chargebacks.md" },
          ],
        },
      ],
    },
    {
      id: "reserves",
      title: "冻结和保证金",
      items: [
        {
          text: "Stripe 的保证金按行业、拒付率、退款率等来定，交付周期长、拒付升高、处理量无法解释地暴涨都是常见原因；期限一般 30 到 90 天，分固定和滚动两种。",
          sources: [
            { label: "保证金问答", url: "https://support.stripe.com/questions/reserves-faq" },
            { label: "保证金", url: "https://support.stripe.com/topics/reserves" },
          ],
        },
        {
          text: "PayPal：新卖家、长期不卖、多起退款或拒付、销售模式突变都可能让资金被冻结，美国站写「通常最多 21 天」；PayPal 建议把买家投诉率控制在销售额的 1% 以下。",
          sources: [
            { label: "资金可用性（美国站）", url: "https://www.paypal.com/us/brc/article/funds-availability" },
            { label: "保证金（中国站）", url: "https://www.paypal.com/c2/webapps/mpp/reserves?locale.x=en_C2" },
          ],
        },
        {
          text: "Paddle 在拒付率或退款率过高时可以立即暂停销售；终止合作后，款项要等满 6 个月或最后一个订阅到期（取较晚的）才释放。",
          sources: [{ label: "Paddle 条款", url: "https://www.paddle.com/legal/terms" }],
        },
        {
          text: "Polar 对高风险账户最长可以延迟付款 120 天；Creem 的部分调查最长 90 天，关户后不再给同一个人重开。",
          sources: [
            { label: "Polar 条款", url: "https://polar.sh/legal/terms" },
            { label: "Creem 条款", url: "https://www.creem.io/terms" },
          ],
        },
        {
          text: "Waffo Pancake：销售款约 10 个工作日后才进入可提余额；提到支付宝只能是中国大陆个人账户，单笔不超过 5 万元，每人每年不超过 30 万元。",
          sources: [
            { label: "打款流程", url: "https://docs.waffo.ai/merchant/payout-flow.md" },
            { label: "费用", url: "https://docs.waffo.ai/mor/fees.md" },
          ],
        },
      ],
    },
    {
      id: "trial-abuse",
      title: "AI 产品的免费试用被薅",
      items: [
        {
          text: "免费试用常被预付卡、虚拟卡和同一张卡在多个账户反复注册薅。Stripe Radar 有专门的试用滥用防护，在试用开始前拦下高风险客户，用之前要先打开「对保存的支付方式运行 Radar」。",
          sources: [{ label: "试用滥用防护", url: "https://docs.stripe.com/radar/free-trial-abuse" }],
        },
        {
          text: "不收卡的试用会招来大量假客户。Stripe 建议先注册账号、过验证码再开试用，或者改成付费试用（例如首周 1 美元）。",
          sources: [
            { label: "免费试用", url: "https://docs.stripe.com/billing/subscriptions/trials/free-trials" },
            { label: "试用", url: "https://docs.stripe.com/billing/subscriptions/trials" },
          ],
        },
        {
          text: "Radar 规则能拦预付卡、一次性邮箱、代理和 Tor，以及同一个邮箱用过好几张卡的情况。",
          sources: [{ label: "规则属性", url: "https://docs.stripe.com/radar/rules/supported-attributes" }],
        },
        {
          text: "Paddle 的结账页不支持无卡试用，Paddle 建议无卡试用屏蔽一次性邮箱，并加 reCAPTCHA 或 Cloudflare Turnstile；Polar 有「Prevent trial abuse」开关，按邮箱和卡指纹识别重复试用。",
          sources: [
            { label: "Paddle", url: "https://developer.paddle.com/build/subscriptions/cardless-trials" },
            { label: "Polar", url: "https://polar.sh/docs/features/trials" },
          ],
        },
      ],
    },
    {
      id: "refunds",
      title: "退款：平台已经替你对买家承诺了什么",
      items: [
        {
          text: "Paddle 默认不退款，但法定期限必须给：欧盟、英国等 14 天，中国、韩国、巴西、加拿大 7 天。Paddle 在 14 天内、或者认为某笔交易可能变成拒付时，可以直接退款并向你追回。",
          sources: [
            { label: "退款政策", url: "https://www.paddle.com/legal/refund-policy" },
            { label: "Paddle 条款", url: "https://www.paddle.com/legal/terms" },
          ],
        },
        {
          text: "Lemon Squeezy、Creem 和 Polar 都保留在购买后 60 天内为防拒付自行退款的权利，你写了「不退款」也一样。",
          sources: [
            { label: "Lemon Squeezy", url: "https://docs.lemonsqueezy.com/help/payments/refunds-chargebacks" },
            { label: "Creem", url: "https://docs.creem.io/merchant-of-record/finance/refunds-and-chargebacks" },
            { label: "Polar", url: "https://polar.sh/docs/features/refunds" },
          ],
        },
        {
          text: "Dodo 的买家标准退款申请期是 7 天，商家后台超过 30 天就不能退；Waffo Pancake 的一次性商品在付款后 14 天内可以申请，由商家审批。",
          sources: [
            { label: "Dodo", url: "https://docs.dodopayments.com/features/transactions/refunds" },
            { label: "Waffo Pancake", url: "https://docs.waffo.ai/features/refunds.md" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "以为退款能抹掉记录：卡组织的监控不看退款，早期欺诈预警退了款照样计入；在 Paddle，赢下的拒付也算进拒付率。",
      sources: [
        { label: "Stripe", url: MONITORING },
        { label: "Paddle", url: PADDLE_CB },
      ],
    },
    {
      text: "拒付开了才想退款：争议期间不能在流程之外退款。",
      sources: [{ label: "争议流程", url: DISPUTES }],
    },
    {
      text: "买家认不出账单上的名字：走 MoR 时，账单上显示的是「LEMSQZY* STORE」「CREEM.IO* STORE」这类名字，收据和邮件里要写清产品名，不然容易被当成陌生扣款拒付。",
      sources: [
        { label: "Lemon Squeezy", url: "https://www.lemonsqueezy.com/why-did-lemon-squeeezy-charge-me" },
        { label: "Creem", url: "https://docs.creem.io/for-customers/why-creem-charged-me.md" },
      ],
    },
    {
      text: "试用到期和续费不提醒：Stripe 建议年付续费前 7 天、月付前 2 到 3 天发提醒，并提供应用内一键取消。",
      sources: [{ label: "Stripe", url: MONITORING }],
    },
    {
      text: "一上线就猛冲量：处理量无法解释地暴涨，本身就会触发保证金。",
      sources: [{ label: "Stripe 保证金问答", url: "https://support.stripe.com/questions/reserves-faq" }],
    },
    {
      text: "不回平台的问询：Polar 要求 72 小时内提供信息，否则可以直接给买家退款。",
      sources: [{ label: "Polar 条款", url: "https://polar.sh/legal/terms" }],
    },
    {
      text: "亚太的新账户要格外小心：Visa 的新监控 MERP 从 2026 年 10 月起专盯开户初期的欺诈、拒付和授权拒绝。",
      sources: [{ label: "Stripe", url: MONITORING }],
    },
  ],
  unknowns: [
    "Mastercard 的规则手册原文拒绝自动抓取，Mastercard 的门槛数字转引自 Stripe 的文档。",
    "Visa 的新监控 MERP 不公布阈值。",
    "PayPal 中国站没写冻结天数，「最多 21 天」出自美国站；用户协议里「一般以 180 天为限」的说法来自官方页面的搜索结果，正文没能直接读到。",
    "Paddle 两处口径不一致：帮助页写拒付率 0.65%（按金额），计费指标页另有一套按笔数的标准。",
    "Stripe、Lemon Squeezy、Creem、Waffo Pancake 没公布暂停账户的具体拒付率；Lemon Squeezy、Creem、Dodo、Waffo Pancake 没找到官方的试用滥用防护建议。",
  ],
  posts: ["choose-payment-platform-2026", "indie-payments-report-2026"],
};
