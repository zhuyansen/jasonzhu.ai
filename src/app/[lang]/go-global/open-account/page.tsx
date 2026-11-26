import type { Metadata } from "next";
import Link from "@/components/Link";
import { faqJsonLd, type FaqItem } from "@/lib/faq";
import { GO_GLOBAL, POST_GROUPS, groupPosts, postTitle } from "@/lib/go-global";
import { getGuardData } from "@/lib/payment-guard";
import type { GuardData, Lang, PlatformFacts } from "@/lib/payment-guard-types";
import { PERSON_REF, findWork, findWorkByDoi, workRef } from "@/lib/profiles";
import GoGlobalBreadcrumb from "../Breadcrumb";
import Community from "../Community";
import { withSocialCards } from "@/lib/social";

const SITE_URL = "https://jasonzhu.ai";
const PATH = "/go-global/open-account";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  const lang = isZh ? "zh" : "en";
  return withSocialCards({
    title: isZh ? "个人还是公司？海外收款平台开户指南（大陆、香港、美国、英国）" : "Individual or company? Opening a payment account to sell abroad",
    description: isZh
      ? "没注册公司也能收海外的钱：大陆个人能开 Creem、Dodo、Waffo Pancake，开不了 Stripe 和 Polar。各平台对个人和公司的官方要求、开户每一步要准备什么，什么时候值得注册公司。"
      : "No company is needed to start: what each payment platform asks of an individual or a company, every step of opening an account, and when a company is worth it. From the platforms' own pages.",
    alternates: {
      canonical: `${SITE_URL}/${lang}${PATH}`,
      languages: { zh: `${SITE_URL}/zh${PATH}`, en: `${SITE_URL}/en${PATH}`, "x-default": `${SITE_URL}/en${PATH}` },
    },
  }, rawLang);
}

function Source({ href, lang }: { href: string; lang: Lang }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs ml-1">
      {lang === "zh" ? "来源" : "source"}
    </a>
  );
}

type SupportRow = {
  platform: string;
  model: { zh: string; en: string };
  cnIndividual: { zh: string; en: string };
  cnCompany: { zh: string; en: string };
  overseasCompany: { zh: string; en: string };
  limits: { zh: string; en: string };
};

const CHINA_SUPPORT_ROWS: SupportRow[] = [
  {
    platform: "Dodo Payments",
    model: { zh: "MoR（代缴全球税）", en: "MoR (handles global tax)" },
    cnIndividual: { zh: "支持（2026-03-23 起纳入名单；身份证/护照+自拍 Persona 核验）", en: "Supported (China added Mar 23, 2026; gov photo ID/passport + Persona selfie)" },
    cnCompany: { zh: "支持（董事及 ≥10% 股东需名单内证件）", en: "Supported (every director & 10%+ owner needs ID from accepted country)" },
    overseasCompany: { zh: "均支持（英国公司需补 W-8BEN-E 税表）", en: "Supported (UK entities also file Form W-8BEN-E)" },
    limits: { zh: "SWIFT 或本地转账至本人/对公账户；最低 $50，<$1,000 收 $5，≥$1,000 免 $5 费；美元电汇 $25", en: "SWIFT or local bank transfer; min $50; $5 fee under $1,000, $0 at $1,000+; $25 USD wire" },
  },
  {
    platform: "Waffo Pancake",
    model: { zh: "MoR（代缴全球税）", en: "MoR (handles global tax)" },
    cnIndividual: { zh: "支持（大陆身份证可开）", en: "Supported (mainland ID accepted)" },
    cnCompany: { zh: "可申请，目前仅打款给个人（对公收款仍在完善）", en: "Can apply; individual payout only (corporate payout not live yet)" },
    overseasCompany: { zh: "香港/美国可申请（暂个人收款）；英国不支持出款", en: "HK/US can apply (individual payout); UK payouts not supported" },
    limits: { zh: "银行卡或支付宝（支付宝单笔 ≤5 万、年 ≤30 万）；押款约 10 工作日；提现 1%（最低 $10）；仅出款至 CN/HK/US/JP/KR/SG", en: "Mainland bank card or Alipay (RMB 50,000/payout, RMB 300,000/yr); ~10 business-day hold; 1% fee (min $10)" },
  },
  {
    platform: "Creem",
    model: { zh: "MoR（代缴全球税）", en: "MoR (handles global tax)" },
    cnIndividual: { zh: "支持", en: "Supported" },
    cnCompany: { zh: "支持（提现到对公银行账户）", en: "Supported (corporate local bank account)" },
    overseasCompany: { zh: "均支持（打入公司名下对公账户）", en: "Supported (business account in company's name)" },
    limits: { zh: "个人走支付宝（单笔 ≤5 万元、年 30–60 万元）；每月 1/15 号出款（押 7–12 天）；费 $7/€7 或 1% 取高者，最低 $50/€50", en: "Individuals paid via Alipay (CNY 50,000/payout, CNY 300,000–600,000/yr); 1st & 15th payouts (7–12d hold); $7/€7 or 1% (higher)" },
  },
  {
    platform: "Paddle",
    model: { zh: "MoR（代缴全球税）", en: "MoR (handles global tax)" },
    cnIndividual: { zh: "支持（接受个人及个体经营，免公司验证）", en: "Supported (individuals & sole traders accepted; skips business verification)" },
    cnCompany: { zh: "支持（需营业执照及 ≥25% 股东核验）", en: "Supported (registration docs + every 25%+ owner)" },
    overseasCompany: { zh: "均支持（英国英镑打英国银行通常免费）", en: "Supported (GBP wire to UK bank usually free)" },
    limits: { zh: "按月出款（电汇或 Payoneer），最低 $100；支持人民币银行电汇", en: "Monthly wire or Payoneer, min $100; CNY paid by bank wire" },
  },
  {
    platform: "Gumroad",
    model: { zh: "MoR（2025 年起）", en: "MoR (since 2025)" },
    cnIndividual: { zh: "大概率能（仅限 PayPal 提现）", en: "Likely (PayPal payouts only)" },
    cnCompany: { zh: "大概率能（仅限 PayPal 提现）", en: "Likely (PayPal payouts only)" },
    overseasCompany: { zh: "均支持（可打公司注册国本地银行）", en: "Supported (local bank payout in country of registration)" },
    limits: { zh: "中国大陆不支持银行直提，仅能提现至 PayPal（美元，2% 费用）；最低 $100，押款 7 天", en: "No direct mainland China bank payout — PayPal only (USD, 2% fee); min $100, 7-day hold" },
  },
  {
    platform: "Lemon Squeezy",
    model: { zh: "MoR（已关新店）", en: "MoR (shutting down)" },
    cnIndividual: { zh: "不支持新店（2026-11-16 停收新店，2027-03-31 停服）", en: "Closed to new stores (closed Nov 16, 2026; stops Mar 31, 2027)" },
    cnCompany: { zh: "不支持新店（老店亦无法迁 Stripe Managed Payments）", en: "Closed to new stores (cannot migrate to Stripe Managed Payments)" },
    overseasCompany: { zh: "不支持新店（老店可于 2026-12-02 起迁 Stripe Managed Payments）", en: "Closed to new stores (existing stores may migrate from Dec 2, 2026)" },
    limits: { zh: "历史上大陆仅支持 PayPal 提现（3% 封顶 $30）；2027-03-31 全面停服，新项目勿选", en: "Legacy PayPal-only for mainland China (3% cap $30); PayPal subs cannot migrate; avoid for new projects" },
  },
  {
    platform: "Polar",
    model: { zh: "MoR（代缴全球税）", en: "MoR (handles global tax)" },
    cnIndividual: { zh: "不支持（仅通过 Stripe Connect Express 出款）", en: "Not supported (payouts only via Stripe Connect Express)" },
    cnCompany: { zh: "不支持（同个人）", en: "Not supported (same as individual)" },
    overseasCompany: { zh: "均支持（通过 Stripe Connect Express 出款）", en: "Supported (via Stripe Connect Express; UK needs GBP bank)" },
    limits: { zh: "最低 $10 手动提现；2026-05-12 后新组织押款 7 天；英国需英镑账户", en: "Manual withdrawals, min $10; 7-day hold for orgs created after May 12, 2026" },
  },
  {
    platform: "Stripe",
    model: { zh: "自己收单（非 MoR）", en: "Own merchant account (non-MoR)" },
    cnIndividual: { zh: "不支持（香港个人需 HKID，美国个人需 SSN/ITIN）", en: "Not supported (HK individual needs HKID; US needs SSN/ITIN)" },
    cnCompany: { zh: "不支持", en: "Not supported" },
    overseasCompany: { zh: "均支持（需注册国本地实体银行账户，拒收虚拟户）", en: "Supported (requires local bank account — no virtual accounts — & local address)" },
    limits: { zh: "打入注册国本地银行账户；Stripe Managed Payments（+3.5% 代缴税）不支持大陆主体及中国买家", en: "Payout to local bank; Stripe Managed Payments (+3.5% MoR) excludes mainland China entities & buyers" },
  },
  {
    platform: "PayPal",
    model: { zh: "自己收单（非 MoR）", en: "Own merchant account (non-MoR)" },
    cnIndividual: { zh: "支持（仅限 PayPal.cn 个人卖家户）", en: "Supported (PayPal.cn personal seller account only)" },
    cnCompany: { zh: "支持（PayPal.cn 企业卖家户）", en: "Supported (PayPal.cn business seller account)" },
    overseasCompany: { zh: "需按当地官网核对（payment-guard 未抓取港/美/英页）", en: "Check local PayPal HK/US/UK site (unverified in payment-guard)" },
    limits: { zh: "2026-06-30 后新开 paypal.com 大陆个人户不可收货款；PayPal.cn 人民币提现 2026 年内 0.5% 封顶（标准 1.0%）+6% 增值税，最低 $20；美元电汇 $35", en: "paypal.com mainland personal accounts opened after Jun 30, 2026 cannot accept seller payments; PayPal.cn CNY 0.5% cap in 2026 (1.0% std) + 6% VAT, min $20" },
  },
  {
    platform: "Wise (Wise Business)",
    model: { zh: "多币种企业收款账户（非收银台）", en: "Multi-currency business bank (not a gateway)" },
    cnIndividual: { zh: "不支持（Wise 中国境内服务仅对非中国籍人士开放）", en: "Not supported (local China service restricted to non-Chinese nationals)" },
    cnCompany: { zh: "不支持", en: "Not supported" },
    overseasCompany: { zh: "支持英国 Ltd / 美国 LLC（英国实测 £45 一次性开户费，£0 月费）", en: "Supported for UK Ltd / US LLC (UK verified: £45 one-time fee, £0/mo)" },
    limits: { zh: "区分注册地址与真实经营地址，严禁虚拟办公室/PO Box；居家董事可用近 3 个月个人银行/水电账单；Wise 明确拒收 Mercury 对账单", en: "Trading Address cannot be virtual office/PO Box; WFH directors may use personal bank/utility bills (<3 mo); Wise rejects Mercury statements" },
  },
  {
    platform: "Mercury",
    model: { zh: "美国线上商业银行（非收银台）", en: "US online business bank (not a gateway)" },
    cnIndividual: { zh: "不支持", en: "Not supported" },
    cnCompany: { zh: "不支持", en: "Not supported" },
    overseasCompany: { zh: "支持美国 LLC（无需 SSN，中国大陆远程可开；基础户 $0 月费）", en: "Supported for US LLC (no SSN, remote from China; $0/mo basic)" },
    limits: { zh: "需美国 LLC + IRS EIN 确认函（CP 575/147C）+ 护照 + 资金来源证明；Physical Address 须填真实国内居住地址", en: "Requires US LLC + IRS EIN letter (CP 575 or 147C) + passport + source-of-funds proof; Physical Address must be real home address" },
  },
];

function DetailedChinaMatrix({ lang, checked }: { lang: Lang; checked: string }) {
  const isZh = lang === "zh";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-xs sm:text-sm">
        <caption className="px-4 py-2.5 text-left text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200">
          {isZh
            ? `来源：JasonZhu.AI 2026 海外收款与跨境银行开户支持矩阵（核实自各平台官方文档与开源数据集 payment-guard，核对日期：${checked}）`
            : `Source: JasonZhu.AI 2026 Mainland China Individual vs. Company Payment & Banking Support Matrix (verified from official platform documentation & open-source payment-guard, checked ${checked})`}
        </caption>
        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">{isZh ? "平台 / 银行" : "Platform / Bank"}</th>
            <th scope="col" className="px-3 py-2.5 text-left font-semibold">{isZh ? "中国大陆个人（无公司）" : "Mainland China Individual"}</th>
            <th scope="col" className="px-3 py-2.5 text-left font-semibold">{isZh ? "中国大陆公司" : "Mainland China Company"}</th>
            <th scope="col" className="px-3 py-2.5 text-left font-semibold">{isZh ? "香港 / 美国 / 英国公司" : "HK / US / UK Company"}</th>
            <th scope="col" className="px-3 py-2.5 text-left font-semibold">{isZh ? "提现路径与关键限制（官方核实）" : "Payout Rails & Verified Limits"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {CHINA_SUPPORT_ROWS.map((r) => (
            <tr key={r.platform} className="align-top">
              <th scope="row" className="px-3 py-2.5 text-left font-semibold text-gray-900 whitespace-nowrap">
                {r.platform}
                <span className="block text-xs font-normal text-gray-400 mt-0.5">{r.model[lang]}</span>
              </th>
              <td className="px-3 py-2.5 text-gray-700 leading-relaxed">{r.cnIndividual[lang]}</td>
              <td className="px-3 py-2.5 text-gray-700 leading-relaxed">{r.cnCompany[lang]}</td>
              <td className="px-3 py-2.5 text-gray-700 leading-relaxed">{r.overseasCompany[lang]}</td>
              <td className="px-3 py-2.5 text-gray-600 leading-relaxed">{r.limits[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Matrix({ data, lang }: { data: GuardData; lang: Lang }) {
  const entities = Object.keys(data.entities);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-medium">{lang === "zh" ? "平台" : "Platform"}</th>
            {entities.map((e) => (
              <th key={e} scope="col" className="px-3 py-2 text-left font-medium whitespace-nowrap">
                {data.entities[e][lang]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Object.entries(data.platforms).map(([key, p]) => (
            <tr key={key}>
              <th scope="row" className="px-3 py-2 text-left font-medium text-gray-900 whitespace-nowrap">
                {p.name}
                <span className="block text-xs font-normal text-gray-400">{p.mor ? (lang === "zh" ? "代收税（MoR）" : "Merchant of Record") : lang === "zh" ? "自己收单" : "your own merchant account"}</span>
              </th>
              {entities.map((e) => (
                <td key={e} className="px-3 py-2 whitespace-nowrap">
                  {data.words[lang].open[p.entities[e]?.status ?? "unverified"]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Steps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-800 mb-1.5">{title}</p>
      <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700 leading-relaxed">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

function PlatformSection({ data, lang, platformKey, p }: { data: GuardData; lang: Lang; platformKey: string; p: PlatformFacts }) {
  const isZh = lang === "zh";
  const sides = (["individual", "company"] as const).filter((side) => p.opening[side]);
  return (
    <section id={platformKey} className="rounded-2xl border border-gray-100 p-5 scroll-mt-24">
      <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
      <p className="text-sm text-gray-500 mb-3">
        {p.mor ? (isZh ? "代收税（MoR）" : "Merchant of Record") : isZh ? "自己收单，税自己处理" : "Your own merchant account; you handle tax"} · {p.fee[lang]}
      </p>
      {p.warning && (
        <p className="mb-3 rounded-lg bg-red-50/70 border border-red-100 px-3 py-2 text-sm text-gray-700 leading-relaxed">
          ⚠️ {p.warning[lang]}
          <Source href={p.warning.source} lang={lang} />
        </p>
      )}
      <ul className="text-sm text-gray-700 space-y-1 mb-4">
        {Object.entries(p.entities).map(([e, v]) => (
          <li key={e}>
            <span className="text-gray-500">{data.entities[e]?.[lang] ?? e}</span>
            {isZh ? "：" : ": "}
            {data.words[lang].open[v.status]}
            {v.note[lang] ? (isZh ? `，${v.note[lang]}` : `, ${v.note[lang]}`) : ""}
            <Source href={v.source} lang={lang} />
          </li>
        ))}
      </ul>
      {sides.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 mb-3">
          {sides.map((side) => {
            const content = p.opening[side]![lang];
            return (
              <div key={side} className="rounded-xl bg-gray-50 p-4 space-y-3">
                <Steps title={side === "individual" ? (isZh ? "个人开户" : "As an individual") : isZh ? "公司开户" : "As a company"} steps={content.steps} />
                {content.needs.length > 0 && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">{isZh ? "要准备：" : "Have ready: "}</span>
                    {content.needs.join(isZh ? "；" : "; ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-600 mb-3">{isZh ? "开户步骤还没整理，先看官方说明。" : "The steps are not written up yet; see the official guide."}</p>
      )}
      {p.opening.entities && (
        <p className="text-xs text-gray-500 mb-3">
          {isZh ? "上面的步骤只适用于：" : "These steps hold only for: "}
          {p.opening.entities.map((e) => data.entities[e]?.[lang] ?? e).join(isZh ? "、" : ", ")}
        </p>
      )}
      <p className="text-sm flex flex-wrap gap-x-4 gap-y-1">
        {p.opening.signup && (
          <a href={p.opening.signup} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {isZh ? "去注册" : "Sign up"}
          </a>
        )}
        {(p.opening.source || p.review_doc) && (
          <a href={p.opening.source || p.review_doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {isZh ? "官方开户说明" : "Official onboarding guide"}
          </a>
        )}
        {p.review_doc && p.review_doc !== p.opening.source && (
          <a href={p.review_doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {isZh ? "网站审核清单" : "Website review list"}
          </a>
        )}
      </p>
    </section>
  );
}

function faqs(lang: Lang): FaqItem[] {
  const isZh = lang === "zh";
  return isZh
    ? [
        {
          question: "没有公司能收海外的钱吗？",
          answer: "能。Creem、Dodo Payments、Waffo Pancake 和 Paddle 都接受中国大陆个人开户；Stripe 和 Polar 不行，它们要香港、美国或英国等地的公司。",
        },
        {
          question: "中国大陆个人能开 Stripe 吗？",
          answer: "按 Stripe 的官方说明不能：它不给中国大陆的个人或公司开户，要用香港、美国或英国公司开。",
        },
        {
          question: "个人开户要准备什么？",
          answer: "身份证件（Dodo 要政府签发的实体带照片证件加自拍）、本人名下的收款账户（Creem 给大陆个人打款到支付宝，Dodo 要本人名下的银行账户），以及一个已经上线、写清价格和服务条款的网站。",
        },
        {
          question: "什么时候该注册公司？",
          answer: "收入超过个人的提现上限（比如 Creem 给大陆个人的支付宝每年 30–60 万元）、想用 Stripe，或者要和合伙人一起收钱的时候。收入在国内怎么报税，请问会计。",
        },
        {
          question: "2026 年中国大陆个人开发者能用 Gumroad 收款并提现到国内银行卡吗？",
          answer: "不能直接提现到国内银行卡。按 Gumroad 官方收款文档与 JasonZhu.AI 核实，中国大陆卖家目前只能通过 PayPal 接收美元提现（最低 $100、押款 7 天、PayPal 提现另收 2% 费用），且平台抽成较高（10% + $0.50 另加 2.9% + $0.30 刷卡费，Discover 订单抽 30%）。如果是 SaaS 或 AI 工具且希望直接提现到支付宝或国内银行卡，优先考虑 Dodo Payments、Waffo Pancake 或 Creem。",
        },
        {
          question: "中国大陆个人没有公司能申请 Paddle 吗？怎么提现？",
          answer: "能。按 Paddle 官方账户验证文档与 JasonZhu.AI 核实，Paddle 接受个人和个体经营者申请（免公司验证），中国大陆不在不支持名单上，且支持按月通过银行电汇（支持人民币电汇）或 Payoneer 出款（最低 $100）。费率为全包 5% + $0.50（含全球税务 MoR），相比 Dodo Payments 合作费率（3.8%–3.9% + $0.40）和 Waffo Pancake（3.9% + $0.50）略高。",
        },
        {
          question: "中国大陆开发者 2026 年还能注册 Lemon Squeezy 吗？老店怎么迁移？",
          answer: "不能注册新店。Lemon Squeezy 已于 2026 年 11 月 16 日停止接受新店注册，并将于 2027 年 3 月 31 日正式停止收款。官方从 2026 年 12 月 2 日起提供迁移至 Stripe Managed Payments 的工具，但 Stripe Managed Payments 不支持中国大陆主体及中国买家，PayPal 订阅也无法迁移。大陆个人开发者建议迁移至 Dodo Payments 或 Waffo Pancake。",
        },
        {
          question: "中国大陆开发者想开 Wise 企业账户或 Mercury 银行账户，需要什么主体？",
          answer: "两者均不支持中国大陆个人（中国籍）或大陆公司直开：Wise 中国境内服务仅对非中国籍人士开放，Mercury 只服务美国注册公司。实操中通常注册英国 Ltd 搭配 Wise Business（£45 一次性开户费、£0 月费；地址验证需真实物理经营地址，居家董事可交近 3 个月本人银行/水电账单，Wise 明确拒收 Mercury 对账单），或注册美国怀俄明 LLC + IRS EIN（CP 575/147C）远程开 Mercury（$0 月费）并接美国 Stripe。",
        },
      ]
    : [
        {
          question: "Can I get paid from abroad without a company?",
          answer: "Yes. Creem, Dodo Payments, Waffo Pancake, and Paddle accept individuals in mainland China; Stripe and Polar do not and require a company in Hong Kong, the US, or the UK.",
        },
        {
          question: "Can an individual in mainland China open Stripe?",
          answer: "Not by Stripe's own pages: it opens no accounts for individuals or companies in mainland China, so a Hong Kong, US, or UK company is needed.",
        },
        {
          question: "What does an individual need to open an account?",
          answer: "An identity document (Dodo wants a physical government photo ID and a selfie), a payout account in your own name (Creem pays mainland individuals to Alipay, Dodo to a bank account in your name), and a live website with prices and terms.",
        },
        {
          question: "When is a company worth it?",
          answer: "When income passes an individual's payout limits (Creem's Alipay payouts to mainland individuals stop at CNY 300,000–600,000 a year), when you want Stripe, or when partners share the income. Ask an accountant about tax at home.",
        },
        {
          question: "Can mainland China individual developers get paid to a local bank on Gumroad in 2026?",
          answer: "No. According to Gumroad's payout policy verified by JasonZhu.AI, Gumroad does not support direct local bank payouts in mainland China; mainland China sellers can only withdraw via PayPal in USD (minimum $100, 7-day hold, 2% PayPal payout fee), on top of Gumroad's 10% + $0.50 fee plus 2.9% + $0.30 card processing (30% on Discover sales). For SaaS or AI tools with direct mainland bank or Alipay payouts, Dodo Payments, Waffo Pancake, or Creem are lower-cost MoR alternatives.",
        },
        {
          question: "Does Paddle accept individual developers in mainland China without a registered company?",
          answer: "Yes. Per Paddle's account verification documentation verified by JasonZhu.AI, Paddle accepts individuals and sole traders (skipping business verification), mainland China is not on Paddle's unsupported country list, and payouts are sent monthly via bank wire (including CNY wire) or Payoneer with a $100 minimum. Paddle charges an all-in 5% + $0.50 MoR fee.",
        },
        {
          question: "Can mainland China developers still open Lemon Squeezy in 2026, and what happens to existing stores?",
          answer: "No new stores are accepted. Lemon Squeezy stopped taking new stores on November 16, 2026 and stops processing payments on March 31, 2027. While migration tooling to Stripe Managed Payments opens December 2, 2026, Stripe Managed Payments excludes mainland China entities and buyers in China, and PayPal subscriptions cannot migrate. Mainland China developers should migrate to Dodo Payments or Waffo Pancake.",
        },
        {
          question: "Can mainland China developers open a Wise Business or Mercury bank account directly?",
          answer: "Not as a mainland China individual or mainland China company: Wise's local service in China is restricted to non-Chinese nationals, and Mercury serves US-registered entities only. Mainland founders typically form a UK Ltd to open Wise Business (£45 one-time setup, £0/month; real physical trading address required — home-based directors may use personal bank/utility bills under 3 months old, and Wise rejects Mercury statements), or form a US Wyoming LLC with an IRS EIN letter (CP 575 or 147C) to open Mercury remotely ($0/month, no SSN required).",
        },
      ];
}

export default async function OpenAccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const isZh = lang === "zh";
  const data = getGuardData();
  const faqItems = faqs(lang);
  const companyGroup = POST_GROUPS.find((g) => g.id === "company");
  const companyPosts = companyGroup ? groupPosts(companyGroup) : [];

  const guardWork = findWork("https://github.com/zhuyansen/payment-guard");
  const sellersDataset = findWorkByDoi("10.5281/zenodo.24386242");
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/${lang}${PATH}#webpage`,
    url: `${SITE_URL}/${lang}${PATH}`,
    name: isZh
      ? "个人还是公司？海外收款平台开户指南（大陆、香港、美国、英国）"
      : "Individual or company? Opening a payment account to sell abroad",
    inLanguage: isZh ? "zh-CN" : "en",
    dateModified: data.checked,
    author: PERSON_REF,
    publisher: PERSON_REF,
    citation: [guardWork, sellersDataset].filter(Boolean).map((w) => workRef(w!)),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }} />
      <GoGlobalBreadcrumb lang={lang} here={isZh ? "个人还是公司，怎么开户" : "Individual or company"} path="/open-account" />
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{isZh ? "个人还是公司？海外收款开户指南" : "Individual or company? Opening a payment account"}</h1>
        <p className="text-gray-600 leading-relaxed">
          {isZh
            ? "没注册公司也能开始收海外的钱。下面是各收款平台对个人和公司的官方要求、开户每一步要准备什么，以及什么时候值得注册一家公司。每一条都附平台原文链接。"
            : "You can start selling abroad without a company. Below: what each payment platform asks of an individual and of a company, every step of opening an account, and when a company is worth it, each with a link to the platform's own page."}
        </p>
      </header>

      <section className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{isZh ? "先说结论" : "In short"}</h2>
        <p className="text-sm text-gray-800 leading-relaxed mb-4 bg-white/80 rounded-xl border border-blue-100 p-4">
          {isZh ? (
            <>
              <strong>JasonZhu.AI 2026 海外收款开户结论</strong>（基于官方规则核实与 20 万卖家收款链接研究，Zenodo DOI：
              <a href="https://doi.org/10.5281/zenodo.24386242" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">10.5281/zenodo.24386242</a>
              ）：截至 2026 年 11 月，<strong>中国大陆个人（无海外公司）</strong>可直接开户收海外美元并结汇的合规 MoR 平台为 <strong>Dodo Payments</strong>（2026-03-23 起支持大陆，银行转账）、<strong>Waffo Pancake</strong>（支持支付宝/银行卡，支付宝单笔 5 万、年 30 万）、<strong>Creem</strong>（支持支付宝，单笔 5 万、年 30–60 万）和 <strong>Paddle</strong>（接受个人/个体经营，人民币电汇）；<strong>Gumroad</strong> 对大陆仅支持 PayPal 提现；<strong>PayPal</strong> 需注册 <strong>PayPal.cn 个人卖家账户</strong>（2026-06-30 后新开 paypal.com 大陆个人户不可收货款）；<strong>Lemon Squeezy</strong> 已于 2026-11-16 停收新店并将于 2027-03-31 停服；<strong>Stripe、Polar、Wise（境内中国籍）与 Mercury</strong> 均不支持中国大陆个人或大陆公司直开，需通过香港公司、美国 LLC 或英国 Ltd 开设。
            </>
          ) : (
            <>
              <strong>JasonZhu.AI 2026 Account Opening Summary</strong> (verified against official platform policies & our 200,000+ checkout-link study, Zenodo DOI{" "}
              <a href="https://doi.org/10.5281/zenodo.24386242" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">10.5281/zenodo.24386242</a>
              ): As of November 2026, <strong>individuals in mainland China (without an overseas company)</strong> can directly open Merchant of Record (MoR) accounts on <strong>Dodo Payments</strong> (mainland China accepted since March 23, 2026; SWIFT/local bank payout), <strong>Waffo Pancake</strong> (mainland bank card or Alipay up to RMB 50,000/payout, RMB 300,000/year), <strong>Creem</strong> (Alipay up to CNY 50,000/payout, CNY 300,000–600,000/year), and <strong>Paddle</strong> (individuals &amp; sole traders accepted; CNY bank wire). <strong>Gumroad</strong> pays mainland China sellers via PayPal only; <strong>PayPal</strong> requires a <strong>PayPal.cn personal seller account</strong> (paypal.com personal accounts opened after June 30, 2026 cannot accept seller payments). <strong>Lemon Squeezy</strong> closed to new stores on November 16, 2026 and stops processing on March 31, 2027. <strong>Stripe, Polar, Wise (local China service for Chinese nationals), and Mercury</strong> require a Hong Kong, US LLC, or UK Ltd entity.
            </>
          )}
        </p>
        <ul className="space-y-2 text-sm text-gray-700 leading-relaxed list-disc pl-5">
          {data.advice.map((a) => (
            <li key={a.en}>
              {a[lang]}
              <Source href={a.source} lang={lang} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href={`/${lang}${GO_GLOBAL}/payments`} className="font-medium text-blue-600 hover:underline">
            {isZh ? "去收款平台选择器，按主体算 $20 实测到手金额 →" : "Open the payment platform picker & $20 net payout calculator →"}
          </Link>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {isZh ? "谁能开哪家：中国大陆个人 vs 公司主体支持矩阵（2026）" : "Who can open which: Mainland China Individual vs. Company Support Matrix (2026)"}
        </h2>
        <DetailedChinaMatrix lang={lang} checked={data.checked} />
        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-gray-700 space-y-1.5">
          <p>
            <strong className="text-gray-900">{isZh ? "只面向国内用户收微信/支付宝？" : "Selling inside China in RMB (WeChat Pay / Alipay)?"}</strong>{" "}
            <Link href={`/${lang}/blog/china-individual-payment-zpay`} className="text-blue-600 font-medium hover:underline">
              {isZh ? "看无执照国内个人收款 ZPay / 虎皮椒与个体户 0.6% 对比 →" : "Read our ZPay & China individual RMB payment comparison →"}
            </Link>
          </p>
          <p>
            <strong className="text-gray-900">{isZh ? "英国公司触发 Wise 地址验证？" : "Hit Wise Business address verification on a UK Ltd?"}</strong>{" "}
            <Link href={`/${lang}/blog/uk-company-wise-address-verification`} className="text-blue-600 font-medium hover:underline">
              {isZh ? "看英国公司 Wise 地址验证实操指南（居家办公账单清单与被拒排查）→" : "Read our UK Company Wise Address Verification Guide (WFH bills & checklist) →"}
            </Link>
          </p>
        </div>

        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            {isZh ? "展开按 7 类主体细分的 payment-guard 原始状态速查表（大陆/香港/美国/英国个人与公司）" : "Expand raw 7-entity payment-guard status grid (CN/HK/US/UK individual & company)"}
          </summary>
          <div className="mt-3">
            <Matrix data={data} lang={lang} />
            <p className="mt-2 text-xs text-gray-400">
              {isZh
                ? `「大概率能」是平台文档能推出来但没有明说，「官方没说」是文档没提；这两种先问平台客服再动手。读取于 ${data.checked}。`
                : `"Likely" means the platform's pages imply it without saying so, "not stated" means they do not say; ask the platform's support first. Read on ${data.checked}.`}
            </p>
          </div>
        </details>
      </section>

      <div className="mb-10">
        <Community lang={lang} tips={false} />
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{isZh ? "每家怎么开户" : "How to open each one"}</h2>
        <div className="space-y-4">
          {Object.entries(data.platforms).map(([key, p]) => (
            <PlatformSection key={key} data={data} lang={lang} platformKey={key} p={p} />
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          {isZh ? `开户步骤读取于 ${data.opening_checked}，平台会改，注册前点开官方说明再确认一次。` : `Steps read on ${data.opening_checked}; platforms change them, so open the official guide before you sign up.`}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{isZh ? "要注册公司的话" : "If you register a company"}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {isZh ? `官方费用和要求，读取于 ${data.opening_checked}；不是法律或税务建议。` : `Official fees and requirements, read on ${data.opening_checked}; not legal or tax advice.`}
        </p>
        <p className="text-sm text-gray-700 mb-4">
          {isZh ? "注册完不是结束：香港公司每年要周年申报、续商业登记、审计报税，还要有公司秘书。" : "Registering is not the end: a Hong Kong company files an annual return, renews its business registration, is audited and files profits tax every year, and needs a company secretary."}{" "}
          <Link href={`/${lang}${GO_GLOBAL}/hk-company`} className="text-blue-600 hover:underline">
            {isZh ? "香港公司每年要做什么 →" : "A Hong Kong company, year by year →"}
          </Link>
        </p>
        <p className="text-sm text-gray-700 mb-4">
          {isZh
            ? "手上不止一家公司（比如国内公司、英国公司再加一家美国 LLC）：做 App 和收款各挂哪家，每家每年要报什么。"
            : "More than one company (say one in China, one in the UK and a US LLC): which one publishes the app and takes the money, and what each files every year."}{" "}
          <Link href={`/${lang}${GO_GLOBAL}/company-roles`} className="text-blue-600 hover:underline">
            {isZh ? "三家公司怎么分工 →" : "Who does what →"}
          </Link>
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {data.registration.map((r) => (
            <div key={r.key} className="rounded-2xl border border-gray-100 p-4">
              <p className="font-semibold text-gray-900 mb-2">{r.name[lang]}</p>
              <ul className="space-y-1.5 text-sm text-gray-700 leading-relaxed list-disc pl-5">
                {r.facts.map((f) => (
                  <li key={f.en}>
                    {f[lang]}
                    <Source href={f.source} lang={lang} />
                  </li>
                ))}
              </ul>
              {r.key === "hk" && (
                <Link href={`/${lang}${GO_GLOBAL}/hk-company`} className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                  {isZh ? "注册以后每年要做什么 →" : "What it takes every year →"}
                </Link>
              )}
              {r.key === "us" && (
                <Link href={`/${lang}${GO_GLOBAL}/company-roles#us-llc`} className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                  {isZh ? "外国人一人 LLC 每年要报什么 →" : "What a foreign-owned single-member LLC files →"}
                </Link>
              )}
              {r.key === "uk" && (
                <div className="mt-3 space-y-1">
                  <Link href={`/${lang}${GO_GLOBAL}/company-roles#overseas-app`} className="block text-sm text-blue-600 hover:underline">
                    {isZh ? "用英国公司上架海外版 App →" : "Publishing the overseas app from a UK company →"}
                  </Link>
                  <Link href={`/${lang}/blog/uk-company-wise-address-verification`} className="block text-sm text-blue-600 hover:underline">
                    {isZh ? "英国公司 Wise 地址验证指南 →" : "UK Ltd Wise address verification guide →"}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {companyPosts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{isZh ? "注册公司的实操文章" : "Hands-on guides to registering a company"}</h2>
          <ul className="space-y-2">
            {companyPosts.map((post) => (
              <li key={post.slug} className="text-sm">
                <Link href={`/${lang}/blog/${post.slug}`} className="text-gray-700 hover:text-blue-600 hover:underline">
                  {postTitle(post, lang)}
                </Link>
                <span className="ml-2 text-xs text-gray-400">{post.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10 rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1.5">
          {isZh ? "需要实战陪跑与最新过审清单？" : "Need verified playbooks & founder peer support?"}
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {isZh
            ? "在海外公司注册、Wise/Mercury KYC 地址验证、或 Dodo/Waffo/Stripe 网站审核上卡住了？GoSail Club 启航会沉淀了一线出海开发者的实操案例与避坑清单。"
            : "Stuck on overseas company setup, Wise/Mercury KYC address verification, or MoR review? GoSail Club brings together real indie founders sharing verified checklists and payout solutions."}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={`/${lang}/club`} className="inline-flex items-center rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white hover:opacity-90">
            {isZh ? "了解 GoSail Club 启航会 →" : "Explore GoSail Club →"}
          </Link>
          <Link href={`/${lang}${GO_GLOBAL}/payments`} className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600">
            {isZh ? "返回收款平台选择器 →" : "Open Payment Platform Picker →"}
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{isZh ? "常见问题" : "FAQ"}</h2>
        <div className="space-y-4">
          {faqItems.map((f) => (
            <div key={f.question}>
              <h3 className="font-semibold text-gray-900 mb-1">{f.question}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-gray-400 leading-relaxed">
        {isZh
          ? "这里只整理平台的开户要求，不是法律或税务建议。数据来自开源工具 payment-guard，和收款平台选择器用的是同一份。"
          : "This covers what the platforms ask for; it is not legal or tax advice. The data comes from the open-source payment-guard, the same as the picker's."}
      </p>
    </div>
  );
}
