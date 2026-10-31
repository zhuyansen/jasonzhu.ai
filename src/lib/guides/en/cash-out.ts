// English version of ../cash-out.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

export const CASH_OUT_EN: Guide = {
  slug: "cash-out",
  short: "Cash-out and tax",
  title: "After the money arrives from overseas: cashing out, the FX conversion quota and tax on foreign income",
  description:
    "For individuals in mainland China earning money from overseas: how to move it home, how the USD 50,000 annual FX conversion quota works, whether you have to file individual income tax on foreign income, and what CRS exchanges. Based on official rules, plus my own cash-out setup.",
  intro:
    "Once a payment platform pays you out, two questions remain: how the money gets back to China, and whether you owe tax on it. My own setup comes first, then the official rules.",
  checked: "2026-10-17",
  mine: {
    title: "My cash-out setup",
    lead: "From two posts I wrote in February 2026. There are two routes, depending on the amount.",
    points: [
      "Small amounts: spend it directly with WeChat Pay HK, or use the Bitget U Card, which has a free allowance of 400U a month with zero fees.",
      "Large amounts: I use Kraken Pro and withdraw straight to a Hong Kong bank card (this carries some risk), or go Kraken Pro → iFAST → Hong Kong card.",
      "LemFi works as a transit: convert to GBP on Kraken (0.2% trading fee) and withdraw to iFAST (GBP 1.95). Transfers out of iFAST are free, LemFi waives the fee on your first transfer, and new users get 10% cashback.",
    ],
    links: [
      { label: "How to cash out your earnings: a full plan from small to large amounts", url: "/blog/how-to-withdraw-money" },
      { label: "LemFi as a cash-out transit", url: "/blog/lemfi-withdrawal-transit" },
      { label: "Bitget U Card review", url: "/blog/bitget-u-card-review" },
    ],
  },
  warning: {
    text: "The setup above goes through crypto exchanges. A 2021 notice from the People's Bank of China and nine other agencies states that virtual currency business activities are illegal financial activities in mainland China, and that individuals who trade virtual currency bear any resulting losses themselves. If the amounts are large, understand the rules and how much risk you can take first.",
    sources: [
      { label: "PBOC Notice Yinfa [2021] No. 237", url: "https://www.gov.cn/zhengce/zhengceku/2021-10/08/content_5641404.htm" },
    ],
  },
  sections: [
    {
      id: "paths",
      title: "Ways to withdraw to China",
      lead: "First check where your payment platform pays out to, then pick a withdrawal tool.",
      items: [
        {
          text: "Stripe and Polar do not list mainland China as a supported account country. Creem pays Chinese individuals via Alipay, up to CNY 50,000 per payout. Paddle pays by wire transfer or Payoneer, with a USD 100 minimum. Dodo lists China among its payout countries.",
          sources: [
            { label: "Stripe", url: "https://stripe.com/global" },
            { label: "Polar", url: "https://polar.sh/docs/merchant-of-record/supported-countries" },
            { label: "Creem", url: "https://docs.creem.io/merchant-of-record/finance/payouts" },
            { label: "Paddle", url: "https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid" },
            { label: "Dodo", url: "https://docs.dodopayments.com/miscellaneous/accepted-countries-and-territories" },
          ],
        },
        {
          text: "PayPal China accounts: withdraw in USD by wire to a Chinese bank account. Minimum USD 150, USD 35 fee per withdrawal, arrives in 3 to 7 business days.",
          sources: [
            { label: "Withdrawal guide", url: "https://www.paypal.com/c2/smarthelp/article/faq1189" },
            { label: "Fees", url: "https://www.paypal.com/c2/webapps/mpp/merchant-fees" },
          ],
        },
        {
          text: "PayPal cross-border receiving (the CNY channel): individuals can link a personal bank card. Requests submitted before 13:00 Beijing time can arrive in as little as 4 hours. From January 15, 2026 to the end of the year, the CNY settlement fee is capped at 0.5%. You need genuine cross-border transactions behind the funds.",
          sources: [{ label: "PayPal cross-border receiving", url: "https://www.paypal.cn/portal/merchant/rmb-transfer" }],
        },
        {
          text: "Payoneer supports payouts in CNY. Personal accounts can only withdraw to an account in your own name, and withdrawal fees including currency conversion run from 1.2% to 4%.",
          sources: [
            { label: "Withdrawal guide", url: "https://www.payoneer.com/zh-hans/resources/how-to-use-payoneer/withdraw-payoneer-funds/" },
            { label: "Fees", url: "https://www.payoneer.com/legal/fees/" },
          ],
        },
        {
          text: "WorldFirst: personal accounts held by mainland individuals can withdraw to a personal bank card or Alipay account in the same name. PingPong: mainland individuals register with their national ID plus face verification and can withdraw to a personal bank card.",
          sources: [
            { label: "WorldFirst", url: "https://www.worldfirst.com.cn/content/articles/registration-guide/personal-and-enterprise" },
            { label: "PingPong", url: "https://www.pingpongx.com/zh/news/articles/260728153829123" },
          ],
        },
        {
          text: "Airwallex only serves businesses and does not open accounts for individuals. Wise's services inside China are only available to non-Chinese nationals.",
          sources: [
            { label: "Airwallex", url: "https://help.airwallex.com/hc/en-gb/articles/900001757026-Can-I-open-an-account-with-Airwallex-" },
            { label: "Wise terms", url: "https://wise.com/cn/legal/terms-of-use-en" },
          ],
        },
      ],
    },
    {
      id: "fx",
      title: "The FX conversion quota and FX reporting",
      items: [
        {
          text: "Each person gets an annual facilitation quota equivalent to USD 50,000 for selling foreign currency (jiehui) and another USD 50,000 for buying it. Within the quota, you only need your ID card.",
          sources: [{ label: "SAFE Huifa [2007] No. 1", url: "https://www.safe.gov.cn/neimenggu/file/file/20170728/b94fb1d6db30472584863040ecb838f3.pdf" }],
        },
        {
          text: "USD 50,000 is not a hard cap: genuine, lawful current account income above the quota can still be converted if you provide supporting documents such as contracts and proof of payment.",
          sources: [
            { label: "SAFE Q&A", url: "https://www.safe.gov.cn/neimenggu/file/file/20200228/fa90770027ed4d919de981c09bc25751.pdf" },
            { label: "SAFE reply", url: "https://www.safe.gov.cn/safe/file/file/20240301/67efecf61b05467399e235bb9f5794d9.pdf" },
          ],
        },
        {
          text: "Personal FX conversions handled through licensed payment institutions do not count against the annual facilitation quota. Each transaction should in principle not exceed the equivalent of USD 50,000.",
          sources: [{ label: "SAFE Huifa [2019] No. 13", url: "https://www.safe.gov.cn/safe/file/file/20190429/2ae51fdcd0634b9ab2d5c2c1e6e4442a.pdf" }],
        },
        {
          text: "Money received from abroad must be reported in the balance of payments filing. Single receipts up to the equivalent of USD 10,000 are exempt; larger ones must be reported within 5 business days of conversion or release of the funds.",
          sources: [{ label: "SAFE Huifa [2022] No. 22", url: "https://www.safe.gov.cn/safe/file/file/20220804/0c6938261bef40aaa7046ecd3ff7aa5a.pdf" }],
        },
        {
          text: "Going through a Hong Kong personal account: Hong Kong residents can remit up to CNY 80,000 a day to a same-name account on the mainland. Once the money is with a mainland individual, converting it is still subject to the USD 50,000 annual quota.",
          sources: [{ label: "Hong Kong Monetary Authority", url: "https://www.hkma.gov.hk/eng/smart-consumers/personal-cross-boundary-remittance-between-hong-kong-and-mainland-china/" }],
        },
      ],
    },
    {
      id: "tax",
      title: "Foreign income is subject to individual income tax",
      lead: "These are the rules only, not tax advice. If the amounts are large, talk to a professional tax adviser.",
      items: [
        {
          text: "Chinese tax residents (those with a domicile in China, or who stay in China for 183 days or more in a year) pay tax on both domestic and foreign income.",
          sources: [{ label: "Individual Income Tax Law", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5193028/content.html" }],
        },
        {
          text: "Foreign income is filed between March 1 and June 30 of the following year. Income tax already paid abroad can be credited, up to the amount payable under Chinese tax law, and you need tax payment certificates from the foreign tax authority.",
          sources: [
            { label: "Individual Income Tax Law", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5193028/content.html" },
            { label: "MOF and STA Announcement No. 3 of 2020", url: "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5207136/content.html" },
          ],
        },
        {
          text: "There is no specific official rule on whether an individual selling software or subscriptions online earns remuneration for personal services, royalties or business income. Each category has different rates (3% to 45%, or 5% to 35%) and different filing deadlines.",
          sources: [{ label: "Implementing Regulations of the IIT Law", url: "https://fgk.chinatax.gov.cn/zcfgk/c100010/c5194444/content.html" }],
        },
        {
          text: "If not filing leads to underpaid tax, the penalty is 50% to 5 times the underpaid amount, plus a late fee of 0.05% per day.",
          sources: [{ label: "Tax Collection and Administration Law", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5195081/content.html" }],
        },
        {
          text: "The Shanghai and Guangdong tax bureaus have both published cases of people paying back tax on foreign income. In January 2026, the tax authorities reminded taxpayers to self-check their foreign income for 2022 to 2024.",
          sources: [
            { label: "Shanghai notice", url: "https://shanghai.chinatax.gov.cn/xwdt/swxw/202503/t475826.html" },
            { label: "Guangdong notice", url: "https://guangdong.chinatax.gov.cn/gdsw/zqsw_jcdt/2025-11/20/content_548cc3d12c5f4155bac882c559b33f79.shtml" },
            { label: "Self-check reminder", url: "https://shanxi.chinatax.gov.cn/web/detail/sx-11400-2641-1817094" },
          ],
        },
        {
          text: "Platforms report income to the tax authorities too: under State Council Decree No. 810, Apple has reported Chinese developers' income every quarter since July 2025.",
          sources: [{ label: "Apple's notice", url: "https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-information-for-state-council-decree-no-810/" }],
        },
      ],
    },
    {
      id: "crs",
      title: "What CRS exchanges",
      items: [
        {
          text: "Both the mainland and Hong Kong implement CRS. Hong Kong financial institutions report the name, address, taxpayer identification number, account number and year-end balance of accounts held by mainland residents, along with interest, dividends and sale proceeds, to the Inland Revenue Department, which passes them to the mainland. Exchanges began in September 2018.",
          sources: [
            { label: "Inland Revenue Department", url: "https://www.ird.gov.hk/eng/faq/dta_aeoi.htm" },
            { label: "Mainland rules", url: "https://fgk.chinatax.gov.cn/zcfgk/c100012/c5207016/content.html" },
          ],
        },
        {
          text: "An article republished on the State Taxation Administration's website says China now routinely exchanges financial account information with more than 100 countries and regions and uses it to cross-check individual income tax filings.",
          sources: [{ label: "State Taxation Administration", url: "https://www.chinatax.gov.cn/chinatax/n810219/n810780/c5241796/content.html" }],
        },
        {
          text: "Hong Kong plans to start exchanging information on crypto assets from 2028.",
          sources: [{ label: "Inland Revenue Department consultation", url: "https://www.ird.gov.hk/chs/ppr/archives/25120901.htm" }],
        },
      ],
    },
    {
      id: "company",
      title: "If you receive payments through a Hong Kong company",
      items: [
        {
          text: "Hong Kong does not levy withholding tax on dividends. Dividends a mainland resident receives from a foreign company count as foreign income and are taxed at 20%.",
          sources: [
            { label: "Hong Kong tax policy", url: "https://www.fstb.gov.hk/en/treasury/general/prevailing-tax-policy.htm" },
            { label: "MOF and STA Announcement No. 3 of 2020", url: "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5207136/content.html" },
          ],
        },
        {
          text: "The anti-avoidance rule in Article 8 of the IIT Law: if a company controlled by an individual is set up in a jurisdiction with a clearly low tax burden and does not distribute profits without a reasonable business need, the tax authorities can make adjustments, collect the tax and charge interest.",
          sources: [{ label: "Individual Income Tax Law", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5193028/content.html" }],
        },
        {
          text: "A reply from SAFE's Shanghai branch: apart from special purpose vehicles set up under Circular 37, mainland resident individuals cannot make outbound direct investments.",
          sources: [{ label: "SAFE Shanghai Branch", url: "https://www.safe.gov.cn/shanghai/2017/0915/607.html" }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Splitting conversions or borrowing relatives' quotas: this is expressly prohibited. People who evade the quota are put on a watch list and lose the facilitation quota for that year and the following 2 years.",
      sources: [{ label: "SAFE Q&A", url: "https://www.safe.gov.cn/neimenggu/file/file/20200228/fa90770027ed4d919de981c09bc25751.pdf" }],
    },
    {
      text: "Using underground banks or private currency exchange: fines of up to 30% of the illegal amount, or from 30% up to the full amount in serious cases. In 2024 SAFE publicly named 10 individuals, and the penalties went into their credit records.",
      sources: [
        { label: "Foreign Exchange Administration Regulations", url: "https://www.safe.gov.cn/safe/2008/0806/5321.html" },
        { label: "SAFE notice", url: "https://www.safe.gov.cn/safe/2024/0321/24130.html" },
      ],
    },
    {
      text: "Names that don't match: within the quota, only immediate family members can act on your behalf. WorldFirst personal accounts can only withdraw to a card or Alipay account in the same name.",
      sources: [{ label: "SAFE Huifa [2007] No. 1", url: "https://www.safe.gov.cn/neimenggu/file/file/20170728/b94fb1d6db30472584863040ecb838f3.pdf" }],
    },
    {
      text: "Assuming VAT or sales tax collected by a foreign platform offsets your income tax: only income tax can be credited, and you need a tax payment certificate.",
      sources: [{ label: "Implementing Regulations of the IIT Law", url: "https://fgk.chinatax.gov.cn/zcfgk/c100010/c5194444/content.html" }],
    },
    {
      text: "Individuals selling services online count as e-commerce operators too: individual online sales of no more than CNY 100,000 a year do not need registration, but above that you are in principle required to register as a market entity.",
      sources: [
        { label: "E-Commerce Law", url: "https://www.cac.gov.cn/2018-09/01/c_1123362506.htm" },
        { label: "Measures for the Supervision and Administration of Online Transactions", url: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2025/art_4b47c79b8d994a42bba4835997688faa.html" },
      ],
    },
  ],
  unknowns: [
    "There is no clear official answer on which tax category an individual's online software or subscription sales fall under, or whether they count as domestic or foreign income. That decides whether you file by the 15th of the next month, between March and June of the next year, or with quarterly prepayments.",
    "Whether CNY settlement through PayPal cross-border receiving, WorldFirst or PingPong counts against the USD 50,000 quota is not stated on the platforms' pages, and I found no SAFE guidance on it.",
    "SAFE has not made clear whether a mainland individual who sets up an operating company in Hong Kong with their own funds needs a Circular 37 registration.",
    "I found no official guidance on whether PayPal, Payoneer or Wise balances count as financial accounts that must be reported under CRS.",
    "The State Taxation Administration itself has not issued a formal announcement or model cases on unreported foreign income. What's available are notices from local tax bureaus and media articles republished on the STA website.",
    "I could not find payout or withdrawal documentation for Waffo Pancake.",
  ],
  posts: ["how-to-withdraw-money", "lemfi-withdrawal-transit", "bitget-u-card-review", "china-individual-payment-zpay"],
};
