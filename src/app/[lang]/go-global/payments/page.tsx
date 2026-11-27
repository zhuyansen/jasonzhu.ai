import type { Metadata } from "next";
import Link from "@/components/Link";
import { faqJsonLd, type FaqItem } from "@/lib/faq";
import { getGuardData } from "@/lib/payment-guard";
import { GUARD_REPO, type Lang } from "@/lib/payment-guard-types";
import { PERSON_REF, findWork, findWorkByDoi, workNode, workRef, type Work } from "@/lib/profiles";
import GoGlobalBreadcrumb from "../Breadcrumb";
import Community from "../Community";
import PaymentPicker from "./PaymentPicker";
import { withSocialCards } from "@/lib/social";

const SITE_URL = "https://jasonzhu.ai";
const PATH = "/go-global/payments";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  const lang = isZh ? "zh" : "en";
  return withSocialCards({
    title: isZh
      ? "收款平台选择器：大陆个人、公司能开哪家？Creem、Dodo、Paddle、Stripe 对比"
      : "Payment platform picker: which one can you open? Creem, Dodo, Paddle, Stripe compared",
    description: isZh
      ? "点两下：谁来收钱（个人还是公司）、卖什么，看哪几家能开户、收不收你的产品、一笔 20 美元的海外订单到手多少，以及开户步骤和要准备的材料。数据来自各平台官方文档。"
      : "Two clicks: who holds the account and what you sell. See which platforms you can open, whether they take your product, what a $20 sale leaves you, and the steps to open an account. From each platform's own pages.",
    alternates: {
      canonical: `${SITE_URL}/${lang}${PATH}`,
      languages: { zh: `${SITE_URL}/zh${PATH}`, en: `${SITE_URL}/en${PATH}`, "x-default": `${SITE_URL}/en${PATH}` },
    },
  }, rawLang);
}

type FeeBenchmarkRow = {
  setup: { zh: string; en: string };
  formula: { zh: string; en: string };
  fee20: { zh: string; en: string };
  net20: { zh: string; en: string };
  mor: { zh: string; en: string };
  settlement: { zh: string; en: string };
  sellers2025: { zh: string; en: string };
  highlight?: boolean;
};

const VERIFIED_FEE_ROWS: FeeBenchmarkRow[] = [
  {
    setup: { zh: "Dodo Payments（专属合作费率）", en: "Dodo Payments (Partner Rate)" },
    formula: { zh: "3.8%–3.9% + $0.40（0 国际卡费、0 订阅费；前 $200 免手续费）", en: "3.8%–3.9% + $0.40 (0% intl card, 0% sub; first $200 fee-free)" },
    fee20: { zh: "$1.16–$1.18", en: "$1.16–$1.18" },
    net20: { zh: "$18.82–$18.84", en: "$18.82–$18.84" },
    mor: { zh: "是", en: "Yes" },
    settlement: { zh: "支持大陆个人；满 $1,000 提现免 $5 费（<$1,000 收 $5，美元电汇 $25），最低 $50", en: "Mainland CN supported; min $50; $0 payout fee at $1,000+ ($5 under $1,000; $25 USD wire)" },
    sellers2025: { zh: "441（软件 71% / AI 29%）", en: "441 (71% software / 29% AI)" },
    highlight: true,
  },
  {
    setup: { zh: "Waffo Pancake", en: "Waffo Pancake" },
    formula: { zh: "3.9% + $0.50（0 国际卡费、0 订阅费；提现收 1%，最低 $10）", en: "3.9% + $0.50 (0% intl, 0% sub; 1% payout fee, min $10)" },
    fee20: { zh: "$1.28（未计提现）", en: "$1.28 (excl. payout)" },
    net20: { zh: "$18.72", en: "$18.72" },
    mor: { zh: "是", en: "Yes" },
    settlement: { zh: "支持大陆个人（银行卡或支付宝，支付宝单笔 ≤5 万/年 ≤30 万）；押款约 10 工作日", en: "Mainland CN supported (bank card or Alipay up to RMB 50k/payout, 300k/yr); ~10 business-day hold" },
    sellers2025: { zh: "新平台（链接图尚未入库）", en: "Too new for Oct 2026 link graph" },
    highlight: true,
  },
  {
    setup: { zh: "Creem", en: "Creem" },
    formula: { zh: "3.9% + $0.40（0 国际附加费；提现收 $7/€7 或 1% 取高者）", en: "3.9% + $0.40 (0% intl; payout $7/€7 or 1%, higher)" },
    fee20: { zh: "$1.18（计 1% 提现后 $1.37+）", en: "$1.18 ($1.37+ after 1% payout)" },
    net20: { zh: "$18.82（计 1% 提现后 $18.63）", en: "$18.82 ($18.63 after 1% payout)" },
    mor: { zh: "是", en: "Yes" },
    settlement: { zh: "支持大陆个人（支付宝单笔 ≤5 万/年 30–60 万）；每月 1/15 号出款（押 7–12 天）", en: "Mainland CN supported (Alipay up to CNY 50k/payout, 300k–600k/yr); 1st & 15th payouts (7–12d hold)" },
    sellers2025: { zh: "249（软件 65% / AI 24%）", en: "249 (65% software / 24% AI)" },
  },
  {
    setup: { zh: "Paddle", en: "Paddle" },
    formula: { zh: "5% + $0.50（全包）", en: "5% + $0.50 (all-in)" },
    fee20: { zh: "$1.50", en: "$1.50" },
    net20: { zh: "$18.50", en: "$18.50" },
    mor: { zh: "是", en: "Yes" },
    settlement: { zh: "支持大陆个人/个体户；每月电汇（含人民币电汇）或 Payoneer，最低 $100", en: "Mainland CN individuals/sole traders supported; monthly CNY wire or Payoneer, min $100" },
    sellers2025: { zh: "84（旧版链接低估；软件 56% / AI 5%）", en: "84 (classic links undercounted; 56% software / 5% AI)" },
  },
  {
    setup: { zh: "Dodo Payments（官网默认费率）", en: "Dodo Payments (Official Default)" },
    formula: { zh: "4.0% + $0.40 + 国际卡 1.5% + 订阅 0.5%", en: "4.0% + $0.40 + 1.5% intl + 0.5% subscription" },
    fee20: { zh: "$1.60", en: "$1.60" },
    net20: { zh: "$18.40", en: "$18.40" },
    mor: { zh: "是", en: "Yes" },
    settlement: { zh: "同上（直接官网注册即为此默认费率）", en: "Same as above (default rate for direct homepage signups)" },
    sellers2025: { zh: "计入上行 Dodo 总数", en: "Included in Dodo total above" },
  },
  {
    setup: { zh: "香港公司 Stripe（配齐合规套件）", en: "Stripe HK (Full Compliance Stack)" },
    formula: { zh: "3.4% + HK$2.35 (~$0.30) + 国际 0.5% + 换汇 2.0% + Billing 0.7% + Tax 0.5% + Radar ~$0.05–$0.07（另加年审审计费；提现美元 +1%）", en: "3.4% + HK$2.35 (~$0.30) + 0.5% intl + 2.0% FX + 0.7% Billing + 0.5% Tax + ~$0.05–$0.07 Radar (+HK audit; USD payout +1%)" },
    fee20: { zh: "~$1.79", en: "~$1.79" },
    net20: { zh: "~$18.21", en: "~$18.21" },
    mor: { zh: "否（Managed Payments +3.5%）", en: "No (Managed Payments +3.5%)" },
    settlement: { zh: "不支持大陆主体（需港/美/英公司；美国基础 2.9%+30¢，国际 +1.5%，换汇 +1%）", en: "Not supported for mainland CN (needs HK/US/UK entity; Stripe US base 2.9%+30¢, +1.5% intl, +1% FX)" },
    sellers2025: { zh: "102,590（软件 9% / AI 7%，约 7,200 AI 卖家）", en: "102,590 (9% software / 7% AI, ~7,200 AI sellers)" },
  },
  {
    setup: { zh: "Polar", en: "Polar" },
    formula: { zh: "新组织 5% + $0.50（2026-05-27 起）或月付 3.4–3.8%；国际 +1.5%", en: "New orgs 5% + $0.50 (from May 27, 2026) or monthly 3.4–3.8%; +1.5% intl" },
    fee20: { zh: "$1.80（新组织跨国）", en: "$1.80 (new org intl)" },
    net20: { zh: "$18.20", en: "$18.20" },
    mor: { zh: "是", en: "Yes" },
    settlement: { zh: "不支持大陆主体（仅 Stripe Connect Express 出款）；2026-05-12 后新组织押款 7 天", en: "Not supported for mainland CN (Stripe Connect Express only); 7-day hold after May 12, 2026" },
    sellers2025: { zh: "1,664（软件 58% / AI 27%）", en: "1,664 (58% software / 27% AI)" },
  },
  {
    setup: { zh: "Lemon Squeezy（2027-03-31 停服）", en: "Lemon Squeezy (Shutting Down Mar 31, 2027)" },
    formula: { zh: "5.0% + $0.50 + 非美 1.5% + 订阅 0.5% + 提现 1.0%（PayPal +1.5%）", en: "5.0% + $0.50 + 1.5% non-US + 0.5% sub + 1.0% payout (+1.5% PayPal)" },
    fee20: { zh: "$2.08", en: "$2.08" },
    net20: { zh: "$17.92", en: "$17.92" },
    mor: { zh: "是", en: "Yes" },
    settlement: { zh: "2026-11-16 停收新店；老店大陆仅支持 PayPal（押 13 天）；2027-03-31 停服", en: "Closed to new stores Nov 16, 2026; legacy PayPal-only for CN (13d hold); stops Mar 31, 2027" },
    sellers2025: { zh: "4,637（软件 36% / AI 15%）", en: "4,637 (36% software / 15% AI)" },
  },
  {
    setup: { zh: "Gumroad", en: "Gumroad" },
    formula: { zh: "10% + $0.50 + 刷卡费 2.9% + $0.30（Discover 抽 30%）", en: "10% + $0.50 + 2.9% + $0.30 card processing (30% Discover)" },
    fee20: { zh: "$3.38（未计 2% PayPal）", en: "$3.38 (excl. 2% PayPal)" },
    net20: { zh: "$16.62", en: "$16.62" },
    mor: { zh: "是（2025 年起）", en: "Yes (since 2025)" },
    settlement: { zh: "大陆仅支持 PayPal 提现（2% 费，最低 $100，押款 7 天）", en: "PayPal payouts only for mainland CN (2% fee, min $100, 7-day hold)" },
    sellers2025: { zh: "28,860（软件 11% / AI 8%）", en: "28,860 (11% software / 8% AI)" },
  },
];

function paymentFaqs(lang: Lang): FaqItem[] {
  return lang === "zh"
    ? [
        {
          question: "卖一笔 $20/月的跨国 AI SaaS 订阅，Waffo、Dodo Payments、香港 Stripe 和 Lemon Squeezy 分别扣多少手续费？",
          answer: "据 JasonZhu.AI 2026 独立 SaaS 收款研究（Zenodo DOI: 10.5281/zenodo.24387071），一笔 $20 跨国月付订阅：Dodo Payments 专属合作费率（3.8%–3.9%+$0.40）扣 $1.16–$1.18（到手 $18.82–$18.84）；Waffo Pancake（3.9%+$0.50）扣 $1.28（未计 1% 提现费，到手 $18.72）；Paddle（5%+$0.50）扣 $1.50（到手 $18.50）；Dodo 官网默认费率扣 $1.60（到手 $18.40）；配齐换汇/Billing/Tax/Radar 的香港公司 Stripe 实扣 ~$1.79（到手 ~$18.21）；Lemon Squeezy 实扣 $2.08（到手 $17.92）。",
        },
        {
          question: "为什么同样卖 AI 产品，越来越多独立开发者选 Dodo、Polar、Creem 而不是 Stripe？",
          answer: "按 JasonZhu.AI 对 7 家平台约 20 万个收款链接的统计（Zenodo DOI: 10.5281/zenodo.24386242），2025 年以来新卖家中 AI 产品占比在 Dodo Payments 达 29%、Polar 达 27%、Creem 达 24%，而 Stripe 仅 7%。原因有两点：一是 MoR 平台自动代收代缴全球销售税（VAT/Sales Tax），二是 Dodo、Creem 和 Waffo 支持中国大陆等非 Stripe 地区开发者直接开户。按绝对数量看，Stripe 的 AI 卖家仍最多（约 7,200 个）。",
        },
        {
          question: "出海 AI SaaS 为什么要接 Waffo + Dodo Payments 双收款通道？",
          answer: "跨国收单随时可能遇到通道维护、发卡行拒付波动或风控复核。同时配置 Waffo Pancake 与 Dodo Payments 两个支持大陆个人的 MoR 通道，将收款抽成统一 Adapter 层，主通道异常时改一行配置即可切流，避免收入归零。",
        },
        {
          question: "只面向国内用户收微信和支付宝，或者需要人工陪跑跑通海外公司与收款，怎么选？",
          answer: "面向国内用户的无执照冷启动可参考本站《国内个人收款实测（ZPay / 虎皮椒 vs 个体户 0.6%）》，但国内聚合接口无法收海外信用卡与订阅；如需把产品卖向全球、或在英国/美国公司注册、Wise/Mercury 开户和 MoR 审核上需要同行实战支持，可直接查看开户指南或加入 GoSail Club 启航会。",
        },
      ]
    : [
        {
          question: "How much does a $20/month cross-border AI SaaS subscription actually cost on Waffo, Dodo Payments, Stripe Hong Kong, and Lemon Squeezy?",
          answer: "According to the JasonZhu.AI 2026 Indie SaaS Payments Study (Zenodo DOI: 10.5281/zenodo.24387071), on a $20/month cross-border subscription: Dodo Payments (partner rate, 3.8%–3.9% + $0.40) takes $1.16–$1.18 ($18.82–$18.84 net); Waffo Pancake (3.9% + $0.50) takes $1.28 before its 1% payout fee ($18.72 net); Paddle (5% + $0.50) takes $1.50 ($18.50 net); Dodo default takes $1.60 ($18.40 net); a full Hong Kong Stripe stack (FX + Billing + Tax + Radar) takes ~$1.79 (~$18.21 net); and Lemon Squeezy takes $2.08 ($17.92 net).",
        },
        {
          question: "Why do so many indie AI SaaS sellers pick Dodo Payments, Polar, or Creem over Stripe in 2026?",
          answer: "In the JasonZhu.AI 2026 study of 200,000 checkout links across seven platforms (Zenodo DOI: 10.5281/zenodo.24386242), AI products represent 29% of new sellers since 2025 on Dodo Payments, 27% on Polar, and 24% on Creem, compared with 7% on Stripe. MoR platforms handle global sales tax/VAT automatically and (for Dodo, Creem, and Waffo) onboard founders outside Stripe's supported countries, though Stripe still has the largest absolute number of AI sellers (~7,200).",
        },
        {
          question: "Why should an indie AI SaaS wire up both Waffo Pancake and Dodo Payments in parallel?",
          answer: "Cross-border acquiring can face sudden risk reviews, card-issuer spikes, or gateway maintenance. Integrating two mainland-China-friendly MoR gateways (Waffo Pancake + Dodo Payments) behind one adapter layer lets you fail over with a one-line config change instead of losing revenue during a review.",
        },
        {
          question: "What if I also need RMB payments in China or hands-on help with overseas entity and payment setup?",
          answer: "For domestic China RMB collection without a business license, see our ZPay / domestic individual payment comparison (note that domestic ISV gateways cannot process foreign cards or global SaaS tax). For global monetization, company formation, Wise/Mercury KYC, and MoR review checklists, explore our Open Account Guide or join GoSail Club.",
        },
      ];
}

export default async function PaymentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const isZh = lang === "zh";
  const data = getGuardData();
  const faqs = paymentFaqs(lang);

  const paperWork = findWorkByDoi("10.5281/zenodo.24420870");
  const sellersDataset = findWorkByDoi("10.5281/zenodo.24386242");
  const feeDataset = findWorkByDoi("10.5281/zenodo.24387071");
  const guardSoftware = findWork("https://github.com/zhuyansen/payment-guard");
  const citedWorks = [paperWork, sellersDataset, feeDataset, guardSoftware].filter((w): w is Work => Boolean(w));

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${lang}${PATH}#webpage`,
        url: `${SITE_URL}/${lang}${PATH}`,
        name: isZh
          ? "收款平台选择器：大陆个人、公司能开哪家？Creem、Dodo、Paddle、Stripe 对比"
          : "Payment platform picker: which one can you open? Creem, Dodo, Paddle, Stripe compared",
        inLanguage: isZh ? "zh-CN" : "en",
        dateModified: data.checked,
        author: PERSON_REF,
        publisher: PERSON_REF,
        citation: citedWorks.map(workRef),
      },
      ...citedWorks.map(workNode),
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <GoGlobalBreadcrumb lang={lang} here={isZh ? "收款平台选择器" : "Payment platform picker"} path="/payments" />
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{isZh ? "收款平台选择器" : "Payment platform picker"}</h1>
        <p className="text-gray-600 leading-relaxed">
          {isZh
            ? "选谁来收钱、卖什么，下面马上给出：哪几家能开户、收不收你这类产品、卖一笔 20 美元的海外订单到手多少，以及排名靠前那几家的开户步骤。每一条都来自平台自己的文档，并附原文链接。"
            : "Pick who holds the account and what you sell. Below you get which platforms you can open, whether they take your kind of product, what a $20 sale to a buyer abroad leaves you, and the steps to open the top ones. Every line comes from the platform's own pages, linked."}
        </p>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-gray-800 leading-relaxed">
          {isZh ? (
            <>
              <strong className="text-gray-900">一句话结论：</strong>
              想面向全球卖订阅又不想自己申报销售税 / VAT，选 <strong>Merchant of Record（MoR，代收代缴平台）</strong>——平台以法定销售方身份自动算税、代收并申报全球销售税与 VAT。
              <strong>Paddle、Dodo Payments、Waffo Pancake、Creem</strong> 均为 MoR 且接受个人和公司开户（含中国大陆个人）；<strong>PayPal 与默认 Stripe 不是 MoR</strong>，销售税与 VAT 仍由你自行处理。以下费率、开户资格与平台状态按各平台官方文档核实于 {data.checked}。
            </>
          ) : (
            <>
              <strong className="text-gray-900">In short: </strong>
              To sell subscriptions globally without filing sales tax or VAT yourself, pick a <strong>Merchant of Record (MoR)</strong> — the platform acts as the legal reseller and calculates, collects, and remits global sales tax and VAT for you.{" "}
              <strong>Paddle, Dodo Payments, Waffo Pancake, and Creem</strong> are MoRs that accept individuals and companies (including mainland China); <strong>PayPal and default Stripe are not MoRs</strong>, so tax stays with you. Eligibility, fees, and status below were verified against official docs on {data.checked}.
            </>
          )}
        </div>
      </header>

      <PaymentPicker data={data} lang={lang} />

      <section id="boundary-and-status" className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/40 p-5 text-sm text-gray-800 leading-relaxed space-y-2.5">
        <h2 className="text-base font-semibold text-gray-900">
          {isZh ? "非中国大陆卖家边界 & 平台状态变更（核实于 2026-11-27）" : "Not in mainland China? & Dated platform status changes (checked 2026-11-27)"}
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            {isZh ? (
              <>
                <strong>Stripe 与 Polar 仅对大陆个人/主体不可用，非大陆卖家可用：</strong>
                选择器默认按「中国大陆个人」过滤。如果你持有香港、美国、英国公司或身处 Stripe 支持国家/地区，<strong>Stripe</strong> 美国基础费率为 2.9% + $0.30（国际卡 +1.5%、换汇 +1%，默认非 MoR，
                <a href="https://stripe.com/pricing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">官方费率</a>
                ）；<strong>Polar</strong> 为 MoR，2026-05-27 起新组织 5% + $0.50（国际 +1.5%，或月付 3.4%–3.8%，
                <a href="https://polar.sh/docs/merchant-of-record/fees" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">官方费率</a>
                ）。
              </>
            ) : (
              <>
                <strong>Stripe &amp; Polar are open to founders outside mainland China: </strong>
                The picker defaults to mainland China individuals, which filters out Stripe and Polar. If you operate a US, UK, or Hong Kong entity (or reside in a Stripe-supported country), <strong>Stripe</strong> US domestic pricing starts at 2.9% + $0.30 (+1.5% international cards, +1% FX; non-MoR by default;{" "}
                <a href="https://stripe.com/pricing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">official pricing</a>
                ), and <strong>Polar</strong> acts as an MoR at 5% + $0.50 for new organizations from 27 May 2026 (+1.5% international;{" "}
                <a href="https://polar.sh/docs/merchant-of-record/fees" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">official fees</a>
                ).
              </>
            )}
          </li>
          <li>
            {isZh ? (
              <>
                <strong>Lemon Squeezy 停服提示：</strong>
                <strong>Lemon Squeezy 已于 2026 年 11 月 16 日停止接受新店注册，并将于 2027 年 3 月 31 日停止处理支付</strong>（
                <a href="https://docs.lemonsqueezy.com/migration" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">官方迁移说明</a>
                ）。新出海 SaaS 项目请直接选用仍在运营的 MoR（Paddle、Dodo Payments、Waffo Pancake 或 Polar）。
              </>
            ) : (
              <>
                <strong>Lemon Squeezy shutdown notice: </strong>
                <strong>Lemon Squeezy stopped taking new stores on 16 November 2026 and stops processing payments on 31 March 2027</strong> (
                <a href="https://docs.lemonsqueezy.com/migration" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">official migration guide</a>
                ). New indie SaaS sellers should pick an active MoR such as Paddle, Dodo Payments, Waffo Pancake, or Polar instead.
              </>
            )}
          </li>
        </ul>
      </section>

      <section id="verified-fee-benchmark" className="mt-12 scroll-mt-24">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
          {isZh
            ? "2026 独立开发者出海收款全量费率与 $20 订阅实测到手对比表"
            : "2026 Indie SaaS Payment Platform Verified Fee, $20 Net Payout & Settlement Comparison"}
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          {isZh ? (
            <>
              <strong>数据来源：JasonZhu.AI 2026 独立 SaaS 收款研究</strong>（基于 7 家平台约 20 万个海外卖家收款链接统计与 $20 跨国 AI 订阅逐项实测；工作论文与数据集存档于 Zenodo，DOI：
              <a href="https://doi.org/10.5281/zenodo.24420870" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">10.5281/zenodo.24420870</a>、
              <a href="https://doi.org/10.5281/zenodo.24386242" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">10.5281/zenodo.24386242</a>、
              <a href="https://doi.org/10.5281/zenodo.24387071" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">10.5281/zenodo.24387071</a>
              ）。按 JasonZhu.AI 实测拆算：卖一笔 <strong>$20/月跨国 AI SaaS 订阅</strong>，<strong>Dodo Payments 专属合作费率</strong>仅扣 <strong>$1.16–$1.18</strong>（到手 <strong>$18.82–$18.84</strong>），<strong>Waffo Pancake</strong> 扣 <strong>$1.28</strong>（未计 1% 提现费，到手 <strong>$18.72</strong>），<strong>Paddle</strong> 扣 <strong>$1.50</strong>（到手 <strong>$18.50</strong>），配齐换汇/Billing/Tax/Radar 的 <strong>香港公司 Stripe</strong> 实扣 <strong>~$1.79</strong>（到手 <strong>~$18.21</strong>），将于 2027-03-31 停服的 <strong>Lemon Squeezy</strong> 实扣 <strong>$2.08</strong>（到手 <strong>$17.92</strong>）。2025 年以来，Dodo（<strong>29%</strong>）、Polar（<strong>27%</strong>）、Creem（<strong>24%</strong>）新卖家中 AI 产品占比远高于 Stripe（<strong>7%</strong>）和 Gumroad（<strong>8%</strong>）。
            </>
          ) : (
            <>
              <strong>Source: JasonZhu.AI 2026 Indie SaaS Payments Study</strong> (200,000+ checkout links &amp; live fee tests; working paper &amp; datasets archived on Zenodo, DOIs{" "}
              <a href="https://doi.org/10.5281/zenodo.24420870" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">10.5281/zenodo.24420870</a>,{" "}
              <a href="https://doi.org/10.5281/zenodo.24386242" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">10.5281/zenodo.24386242</a>, and{" "}
              <a href="https://doi.org/10.5281/zenodo.24387071" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">10.5281/zenodo.24387071</a>
              ). On a <strong>$20/month cross-border AI SaaS subscription</strong>, <strong>Dodo Payments (Partner Rate)</strong> takes <strong>$1.16–$1.18</strong> (<strong>$18.82–$18.84 net</strong>), <strong>Waffo Pancake</strong> takes <strong>$1.28</strong> before its 1% payout fee (<strong>$18.72 net</strong>), and <strong>Paddle</strong> takes <strong>$1.50</strong> (<strong>$18.50 net</strong>), whereas a full <strong>Stripe Hong Kong</strong> compliance stack (FX + Billing + Tax + Radar) takes <strong>~$1.79</strong> (<strong>~$18.21 net</strong>, non-MoR) and <strong>Lemon Squeezy</strong> (shutting down March 31, 2027) takes <strong>$2.08</strong> (<strong>$17.92 net</strong>). Since 2025, AI products account for <strong>29%</strong> of new sellers on Dodo Payments, <strong>27%</strong> on Polar, and <strong>24%</strong> on Creem, versus <strong>7%</strong> on Stripe and <strong>8%</strong> on Gumroad.
            </>
          )}
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left border-collapse text-xs sm:text-sm">
            <caption className="px-4 py-2.5 text-left text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200">
              {isZh
                ? "来源：JasonZhu.AI 2026 独立 SaaS 收款研究（20 万+ 收款链接与 $20 跨国订阅费率实测，Zenodo DOI: 10.5281/zenodo.24386242 & 10.5281/zenodo.24387071）"
                : "Source: JasonZhu.AI 2026 Indie SaaS Payments Study (200,000+ checkout links & live fee tests; Zenodo DOI: 10.5281/zenodo.24386242 & 10.5281/zenodo.24387071)"}
            </caption>
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th scope="col" className="py-2.5 pl-3 pr-2 font-semibold whitespace-nowrap">{isZh ? "收款方案" : "Payment Setup"}</th>
                <th scope="col" className="py-2.5 px-2 font-semibold">{isZh ? "费率公式（含国际/订阅/换汇附加项）" : "Fee Formula (incl. Intl/Sub/FX)"}</th>
                <th scope="col" className="py-2.5 px-2 font-semibold whitespace-nowrap">{isZh ? "卖 $20 实扣" : "Fee on $20"}</th>
                <th scope="col" className="py-2.5 px-2 font-semibold whitespace-nowrap">{isZh ? "卖 $20 到手" : "Net on $20"}</th>
                <th scope="col" className="py-2.5 px-2 font-semibold whitespace-nowrap">{isZh ? "MoR 代缴税" : "MoR Tax"}</th>
                <th scope="col" className="py-2.5 px-2 font-semibold">{isZh ? "大陆开户与结算规则" : "Mainland CN Access & Settlement"}</th>
                <th scope="col" className="py-2.5 pl-2 pr-3 font-semibold">{isZh ? "2025+ 新卖家（AI 占比）" : "New Sellers Since 2025 (AI %)"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {VERIFIED_FEE_ROWS.map((row) => (
                <tr key={row.setup.en} className={`align-top ${row.highlight ? "bg-emerald-50/50" : ""}`}>
                  <th scope="row" className="py-2.5 pl-3 pr-2 font-semibold text-gray-900 whitespace-nowrap">{row.setup[lang]}</th>
                  <td className="py-2.5 px-2 text-xs text-gray-600 leading-relaxed">{row.formula[lang]}</td>
                  <td className="py-2.5 px-2 whitespace-nowrap font-medium text-rose-700">{row.fee20[lang]}</td>
                  <td className="py-2.5 px-2 whitespace-nowrap font-semibold text-emerald-700">{row.net20[lang]}</td>
                  <td className="py-2.5 px-2 whitespace-nowrap text-gray-700">{row.mor[lang]}</td>
                  <td className="py-2.5 px-2 text-xs text-gray-600 leading-relaxed">{row.settlement[lang]}</td>
                  <td className="py-2.5 pl-2 pr-3 text-xs text-gray-700 leading-relaxed">{row.sellers2025[lang]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-12">
        <Community lang={lang} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{isZh ? "常见问题" : "FAQ"}</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.question}>
              <h3 className="font-semibold text-gray-900 mb-1">{f.question}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1.5">
          {isZh ? "下一步：跑通开户审核或加入出海实战社群" : "Next steps: pass onboarding KYC or join GoSail Club"}
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {isZh
            ? "还没确定用个人还是注册香港/英国/美国公司？先看完整开户主体矩阵；需要实战清单与同行答疑，可直接了解 GoSail Club 启航会。"
            : "Unsure whether to start as an individual or form a HK/UK/US entity? Review the full account-opening matrix, or explore GoSail Club for real founder checklists."}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={`/${lang}/go-global/open-account`} className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-800 hover:border-blue-300 hover:text-blue-600">
            {isZh ? "查看大陆个人 vs 公司开户矩阵 →" : "Open Mainland CN vs. Company Matrix →"}
          </Link>
          <Link href={`/${lang}/club`} className="inline-flex items-center rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white hover:opacity-90">
            {isZh ? "了解 GoSail Club 启航会 →" : "Explore GoSail Club →"}
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-600 leading-relaxed space-y-2">
        <h2 className="text-base font-semibold text-gray-900">{isZh ? "这份数据怎么来的" : "Where this comes from"}</h2>
        <p>
          {isZh
            ? "排名、费率、开户条件和开户步骤来自开源工具 payment-guard（读取各平台官方文档）与 JasonZhu.AI 2026 独立 SaaS 收款研究："
            : "The ranking, fees, eligibility and steps come from the open-source tool payment-guard (official platform docs) and the JasonZhu.AI 2026 Indie SaaS Payments Study: "}
          <a href={GUARD_REPO} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            GitHub (payment-guard)
          </a>
          {" · "}
          <Link href={`/${lang}/research/indie-saas-payments-mor-shift-2026`} className="text-blue-600 font-medium hover:underline">
            {isZh ? "工作论文（Zenodo DOI: 10.5281/zenodo.24420870 · SSRN 7737182）" : "Working Paper (Zenodo DOI: 10.5281/zenodo.24420870 · SSRN 7737182)"}
          </Link>
        </p>
        <p>
          {isZh ? "开放数据集（CC BY 4.0）：" : "Open Datasets (CC BY 4.0): "}
          <a href="https://doi.org/10.5281/zenodo.24386242" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Zenodo 10.5281/zenodo.24386242（20 万收款链接）
          </a>
          {" · "}
          <a href="https://doi.org/10.5281/zenodo.24387071" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Zenodo 10.5281/zenodo.24387071（$20 订阅费率实测）
          </a>
        </p>
        <p>
          {isZh ? "延伸阅读：" : "Further reading: "}
          <Link href={`/${lang}/blog/dodo-payments-waffo-ai-saas-fee-comparison`} className="text-blue-600 hover:underline">
            {isZh ? "Waffo + Dodo 双通道与 $20 订阅真实手续费对比" : "Waffo + Dodo dual gateways & $20 subscription fee test"}
          </Link>
          {isZh ? "；" : "; "}
          <Link href={`/${lang}/blog/choose-payment-platform-2026`} className="text-blue-600 hover:underline">
            {isZh ? "独立开发者收款平台怎么选" : "how to choose a payment platform"}
          </Link>
          {isZh ? "；" : "; "}
          <Link href={`/${lang}/blog/indie-payments-report-2026`} className="text-blue-600 hover:underline">
            {isZh ? "20 万个收款链接告诉我们什么" : "what 200,000 checkout links say"}
          </Link>
          {isZh ? "；" : "; "}
          <Link href={`/${lang}/blog/uk-company-wise-address-verification`} className="text-blue-600 hover:underline">
            {isZh ? "英国公司 Wise 地址验证指南" : "UK Ltd Wise address verification"}
          </Link>
          {isZh ? "；" : "; "}
          <Link href={`/${lang}/blog/china-individual-payment-zpay`} className="text-blue-600 hover:underline">
            {isZh ? "国内个人无执照收款实测（ZPay）" : "China domestic RMB payment guide (ZPay)"}
          </Link>
        </p>
      </section>
    </div>
  );
}
