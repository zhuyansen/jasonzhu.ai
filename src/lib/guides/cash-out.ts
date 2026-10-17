import type { Guide } from "../go-global-guides";

// 钱怎么回到国内、怎么报税。Jason 的出金方案出自他 2026-02 的两篇文章；官方规则在 sections，每条带来源。
export const CASH_OUT: Guide = {
  slug: "cash-out",
  short: "出金和报税",
  title: "收到海外的钱以后：怎么出金、结汇额度和境外所得报税",
  description:
    "大陆个人收到海外收入以后，钱怎么提到国内、每年 5 万美元的结汇额度怎么算、境外所得要不要报个税、CRS 会交换哪些信息，按官方规定整理，附我自己的出金方案。",
  intro: "收款平台把钱打给你以后，还有两件事：钱怎么回到国内，以及要不要报税。先看我自己的做法，再看官方规定。",
  checked: "2026-10-17",
  mine: {
    title: "我的出金方案",
    lead: "出自我 2026 年 2 月的两篇文章，按金额分两种走法。",
    points: [
      "钱少：用香港微信支付直接消费；或者用 Bitget U 卡，每个月有 400U 的免费额度，零费率。",
      "钱多：我走 Kraken Pro，直接提到香港银行卡（这条有点风险）；或者 Kraken Pro → iFAST → 港卡。",
      "LemFi 可以当中转：在 Kraken 换成英镑（交易费 0.2%）提到 iFAST（1.95 英镑），iFAST 转出免费，LemFi 首笔免手续费，新人还有 10% 返现。",
    ],
    links: [
      { label: "赚了钱怎么出金？从小额到大额的完整方案", url: "/blog/how-to-withdraw-money" },
      { label: "出金中转方 LemFi", url: "/blog/lemfi-withdrawal-transit" },
      { label: "Bitget U 卡体验", url: "/blog/bitget-u-card-review" },
    ],
  },
  warning: {
    text: "上面的方案要经过加密货币交易所。人民银行等十个部门 2021 年的通知写明：虚拟货币相关业务活动在境内属于非法金融活动，个人参与虚拟货币交易「由此引发的损失由其自行承担」。金额大的话，先弄清楚相关规定和自己能承受的风险。",
    sources: [
      { label: "银发〔2021〕237号", url: "https://www.gov.cn/zhengce/zhengceku/2021-10/08/content_5641404.htm" },
    ],
  },
  sections: [
    {
      id: "paths",
      title: "提现到国内的几条路",
      lead: "先看上游的收款平台把钱打到哪里，再选提现工具。",
      items: [
        {
          text: "Stripe 和 Polar 的开户国家里没有中国大陆；Creem 给中国个人打款走支付宝，单笔不超过 5 万元；Paddle 用电汇或 Payoneer，满 100 美元起付；Dodo 的打款国家里有中国。",
          sources: [
            { label: "Stripe", url: "https://stripe.com/global" },
            { label: "Polar", url: "https://polar.sh/docs/merchant-of-record/supported-countries" },
            { label: "Creem", url: "https://docs.creem.io/merchant-of-record/finance/payouts" },
            { label: "Paddle", url: "https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid" },
            { label: "Dodo", url: "https://docs.dodopayments.com/miscellaneous/accepted-countries-and-territories" },
          ],
        },
        {
          text: "PayPal 中国账户：以美元电汇到国内银行账户，最低 150 美元，每笔 35 美元手续费，3 到 7 个工作日到账。",
          sources: [
            { label: "提现说明", url: "https://www.paypal.com/c2/smarthelp/article/faq1189" },
            { label: "费用", url: "https://www.paypal.com/c2/webapps/mpp/merchant-fees" },
          ],
        },
        {
          text: "PayPal 跨境收款（人民币通道）：个人可以绑个人银行卡，北京时间 13:00 前提交最快 4 小时到账；2026 年 1 月 15 日到年底人民币结算费 0.5% 封顶；要有真实的跨境交易背景。",
          sources: [{ label: "PayPal 跨境收款", url: "https://www.paypal.cn/portal/merchant/rmb-transfer" }],
        },
        {
          text: "Payoneer 支持人民币到账，个人账户只能转到本人的账户，含换汇的提现费 1.2% 到 4%。",
          sources: [
            { label: "提现说明", url: "https://www.payoneer.com/zh-hans/resources/how-to-use-payoneer/withdraw-payoneer-funds/" },
            { label: "费用", url: "https://www.payoneer.com/legal/fees/" },
          ],
        },
        {
          text: "万里汇：大陆个人账号可以提到同名的个人银行卡或支付宝。PingPong：内地个人用身份证加人脸认证注册，可以提到个人银行卡。",
          sources: [
            { label: "万里汇", url: "https://www.worldfirst.com.cn/content/articles/registration-guide/personal-and-enterprise" },
            { label: "PingPong", url: "https://www.pingpongx.com/zh/news/articles/260728153829123" },
          ],
        },
        {
          text: "Airwallex 只服务企业，不给个人开户；Wise 在中国境内的服务只对非中国籍人士开放。",
          sources: [
            { label: "Airwallex", url: "https://help.airwallex.com/hc/en-gb/articles/900001757026-Can-I-open-an-account-with-Airwallex-" },
            { label: "Wise 条款", url: "https://wise.com/cn/legal/terms-of-use-en" },
          ],
        },
      ],
    },
    {
      id: "fx",
      title: "结汇额度和外汇申报",
      items: [
        {
          text: "每人每年结汇、购汇各有等值 5 万美元的便利化额度，额度内凭身份证办理。",
          sources: [{ label: "汇发〔2007〕1号", url: "https://www.safe.gov.cn/neimenggu/file/file/20170728/b94fb1d6db30472584863040ecb838f3.pdf" }],
        },
        {
          text: "5 万美元不是上限：真实合法的经常项目收入超出额度，凭合同、付款证明等真实性材料照样能结汇。",
          sources: [
            { label: "外汇局问答", url: "https://www.safe.gov.cn/neimenggu/file/file/20200228/fa90770027ed4d919de981c09bc25751.pdf" },
            { label: "外汇局答复", url: "https://www.safe.gov.cn/safe/file/file/20240301/67efecf61b05467399e235bb9f5794d9.pdf" },
          ],
        },
        {
          text: "通过支付机构办理的个人结售汇，不占年度便利化额度，单笔原则上不超过等值 5 万美元。",
          sources: [{ label: "汇发〔2019〕13号", url: "https://www.safe.gov.cn/safe/file/file/20190429/2ae51fdcd0634b9ab2d5c2c1e6e4442a.pdf" }],
        },
        {
          text: "从境外收款要做国际收支申报：单笔不超过等值 1 万美元的可以免填，超过的要在结汇或解付后 5 个工作日内申报。",
          sources: [{ label: "汇发〔2022〕22号", url: "https://www.safe.gov.cn/safe/file/file/20220804/0c6938261bef40aaa7046ecd3ff7aa5a.pdf" }],
        },
        {
          text: "走香港个人户：香港居民汇人民币到内地同名账户，每天上限 8 万元；钱到了内地个人手里再结汇，仍受每年 5 万美元额度的约束。",
          sources: [{ label: "金管局", url: "https://www.hkma.gov.hk/eng/smart-consumers/personal-cross-boundary-remittance-between-hong-kong-and-mainland-china/" }],
        },
      ],
    },
    {
      id: "tax",
      title: "境外所得要报个税",
      lead: "下面只列规则，不是税务建议；金额大的，找专业的税务顾问。",
      items: [
        {
          text: "中国税收居民（在境内有住所，或一年内在境内住满 183 天）要就境内和境外的所得纳税。",
          sources: [{ label: "个人所得税法", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5193028/content.html" }],
        },
        {
          text: "境外所得在次年 3 月 1 日到 6 月 30 日申报。在境外缴过的所得税可以抵免，但不超过按中国税法算出的应纳税额，还要有境外税务机关的纳税凭证。",
          sources: [
            { label: "个人所得税法", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5193028/content.html" },
            { label: "公告 2020 年第 3 号", url: "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5207136/content.html" },
          ],
        },
        {
          text: "个人在线卖软件或订阅，算劳务报酬、特许权使用费还是经营所得，官方没有专门规定；税目不同，税率（3% 到 45%，或 5% 到 35%）和申报时间都不同。",
          sources: [{ label: "个税法实施条例", url: "https://fgk.chinatax.gov.cn/zcfgk/c100010/c5194444/content.html" }],
        },
        {
          text: "不申报导致少缴税款的，罚少缴税款的 50% 到 5 倍，另加每天万分之五的滞纳金。",
          sources: [{ label: "税收征收管理法", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5195081/content.html" }],
        },
        {
          text: "上海、广东的税务局都通报过补缴境外所得个税的案例；2026 年 1 月，税务部门提醒纳税人自查 2022 到 2024 年的境外所得。",
          sources: [
            { label: "上海通报", url: "https://shanghai.chinatax.gov.cn/xwdt/swxw/202503/t475826.html" },
            { label: "广东通报", url: "https://guangdong.chinatax.gov.cn/gdsw/zqsw_jcdt/2025-11/20/content_548cc3d12c5f4155bac882c559b33f79.shtml" },
            { label: "自查提醒", url: "https://shanxi.chinatax.gov.cn/web/detail/sx-11400-2641-1817094" },
          ],
        },
        {
          text: "平台也会把收入报给税务局：苹果按国务院第 810 号令，自 2025 年 7 月起每季度报送中国开发者的收入。",
          sources: [{ label: "苹果的说明", url: "https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-information-for-state-council-decree-no-810/" }],
        },
      ],
    },
    {
      id: "crs",
      title: "CRS 会交换什么",
      items: [
        {
          text: "内地和香港都实施 CRS：香港的金融机构把内地居民账户的姓名、地址、纳税人识别号、账号、年末余额，以及利息、股息和出售所得报给香港税务局，再交换给内地，2018 年 9 月起开始交换。",
          sources: [
            { label: "香港税务局", url: "https://www.ird.gov.hk/eng/faq/dta_aeoi.htm" },
            { label: "内地的规则", url: "https://fgk.chinatax.gov.cn/zcfgk/c100012/c5207016/content.html" },
          ],
        },
        {
          text: "税务总局网站转载的文章说，我国已经和 100 多个国家和地区常态化交换金融账户信息，并用来比对个税申报。",
          sources: [{ label: "税务总局网站", url: "https://www.chinatax.gov.cn/chinatax/n810219/n810780/c5241796/content.html" }],
        },
        {
          text: "香港计划 2028 年起交换加密资产的资料。",
          sources: [{ label: "香港税务局咨询", url: "https://www.ird.gov.hk/chs/ppr/archives/25120901.htm" }],
        },
      ],
    },
    {
      id: "company",
      title: "用香港公司收款的话",
      items: [
        {
          text: "香港对股息不征预扣税；内地居民个人从境外公司拿到的分红属于境外所得，按 20% 计税。",
          sources: [
            { label: "香港税务政策", url: "https://www.fstb.gov.hk/en/treasury/general/prevailing-tax-policy.htm" },
            { label: "公告 2020 年第 3 号", url: "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5207136/content.html" },
          ],
        },
        {
          text: "个税法第八条的反避税规则：个人控制的、设在税负明显偏低地区的公司，没有合理经营需要却不分配利润，税务机关可以调整、补税并加收利息。",
          sources: [{ label: "个人所得税法", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5193028/content.html" }],
        },
        {
          text: "外汇局上海分局答复：境内居民个人除了按 37 号文设立的特殊目的公司，不能进行境外直接投资。",
          sources: [{ label: "外汇局上海分局", url: "https://www.safe.gov.cn/shanghai/2017/0915/607.html" }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "拆分结汇、借亲友的额度：明令禁止，规避额度的人会被列入「关注名单」，当年和之后 2 年不再享有便利化额度。",
      sources: [{ label: "外汇局问答", url: "https://www.safe.gov.cn/neimenggu/file/file/20200228/fa90770027ed4d919de981c09bc25751.pdf" }],
    },
    {
      text: "找地下钱庄或私下换汇：罚违法金额的 30% 以下，情节严重的 30% 以上到等值；外汇局 2024 年通报过 10 名个人，处罚信息纳入征信。",
      sources: [
        { label: "外汇管理条例", url: "https://www.safe.gov.cn/safe/2008/0806/5321.html" },
        { label: "外汇局通报", url: "https://www.safe.gov.cn/safe/2024/0321/24130.html" },
      ],
    },
    {
      text: "户名对不上：额度内只能委托直系亲属代办；万里汇的个人账号只能提到同名卡或同名支付宝。",
      sources: [{ label: "汇发〔2007〕1号", url: "https://www.safe.gov.cn/neimenggu/file/file/20170728/b94fb1d6db30472584863040ecb838f3.pdf" }],
    },
    {
      text: "以为境外平台代收的增值税、销售税能抵个税：抵免只认所得税，而且要有纳税凭证。",
      sources: [{ label: "个税法实施条例", url: "https://fgk.chinatax.gov.cn/zcfgk/c100010/c5194444/content.html" }],
    },
    {
      text: "个人在网上卖服务也算电子商务经营者：一年累计不超过 10 万元的个人网络交易不需要登记，超过的原则上要办市场主体登记。",
      sources: [
        { label: "电子商务法", url: "https://www.cac.gov.cn/2018-09/01/c_1123362506.htm" },
        { label: "网络交易监督管理办法", url: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2025/art_4b47c79b8d994a42bba4835997688faa.html" },
      ],
    },
  ],
  unknowns: [
    "个人在线卖软件或订阅归哪个税目、算境内还是境外所得，官方没有明确；这决定了申报时间是次月 15 日、次年 3 到 6 月，还是按季预缴。",
    "PayPal 跨境收款、万里汇、PingPong 的人民币结算占不占 5 万美元额度，平台页没写，也没查到外汇局的说明。",
    "大陆个人用自有资金设香港经营公司要不要做 37 号文登记，外汇局没有说清。",
    "PayPal、Payoneer、Wise 的账户余额算不算 CRS 必须报送的「金融账户」，没查到官方说明。",
    "税务总局自己没有发布过境外所得未申报的正式公告或典型案例，能查到的是地方税务局的通报和总局网站转载的媒体文章。",
    "Waffo Pancake 的打款和提现说明没找到。",
  ],
  posts: ["how-to-withdraw-money", "lemfi-withdrawal-transit", "bitget-u-card-review", "china-individual-payment-zpay"],
};
