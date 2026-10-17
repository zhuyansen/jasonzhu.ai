import type { Metadata } from "next";
import Link from "@/components/Link";
import { faqJsonLd, type FaqItem } from "@/lib/faq";
import { GO_GLOBAL, POST_GROUPS, groupPosts, postTitle } from "@/lib/go-global";
import { getGuardData } from "@/lib/payment-guard";
import type { GuardData, Lang, PlatformFacts } from "@/lib/payment-guard-types";
import GoGlobalBreadcrumb from "../Breadcrumb";
import Community from "../Community";

const SITE_URL = "https://jasonzhu.ai";
const PATH = "/go-global/open-account";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  const lang = isZh ? "zh" : "en";
  return {
    title: isZh ? "个人还是公司？海外收款平台开户指南（大陆、香港、美国、英国）" : "Individual or company? Opening a payment account to sell abroad",
    description: isZh
      ? "没注册公司也能收海外的钱：大陆个人能开 Creem、Dodo、Waffo Pancake，开不了 Stripe 和 Polar。各平台对个人和公司的官方要求、开户每一步要准备什么，什么时候值得注册公司。"
      : "No company is needed to start: what each payment platform asks of an individual or a company, every step of opening an account, and when a company is worth it. From the platforms' own pages.",
    alternates: {
      canonical: `${SITE_URL}/${lang}${PATH}`,
      languages: { zh: `${SITE_URL}/zh${PATH}`, en: `${SITE_URL}/en${PATH}`, "x-default": `${SITE_URL}/zh${PATH}` },
    },
  };
}

function Source({ href, lang }: { href: string; lang: Lang }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs ml-1">
      {lang === "zh" ? "来源" : "source"}
    </a>
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
          answer: "能。Creem、Dodo Payments、Waffo Pancake 都接受中国大陆个人开户；Stripe 和 Polar 不行，它们要香港、美国等地的公司。",
        },
        {
          question: "中国大陆个人能开 Stripe 吗？",
          answer: "按 Stripe 的官方说明不能：它不给中国大陆的个人或公司开户，要用香港或美国公司开。",
        },
        {
          question: "个人开户要准备什么？",
          answer: "身份证件（Dodo 要政府签发的实体带照片证件加自拍）、本人名下的收款账户（Creem 给大陆个人打款到支付宝，Dodo 要本人名下的银行账户），以及一个已经上线、写清价格和服务条款的网站。",
        },
        {
          question: "什么时候该注册公司？",
          answer: "收入超过个人的提现上限（比如 Creem 给大陆个人的支付宝每年 30–60 万元）、想用 Stripe，或者要和合伙人一起收钱的时候。收入在国内怎么报税，请问会计。",
        },
      ]
    : [
        {
          question: "Can I get paid from abroad without a company?",
          answer: "Yes. Creem, Dodo Payments and Waffo Pancake take individuals in mainland China; Stripe and Polar do not and need a company in Hong Kong, the US or elsewhere.",
        },
        {
          question: "Can an individual in mainland China open Stripe?",
          answer: "Not by Stripe's own pages: it opens no accounts for individuals or companies in mainland China, so a Hong Kong or US company is needed.",
        },
        {
          question: "What does an individual need to open an account?",
          answer: "An identity document (Dodo wants a physical government photo ID and a selfie), a payout account in your own name (Creem pays mainland individuals to Alipay, Dodo to a bank account in your name), and a live website with prices and terms.",
        },
        {
          question: "When is a company worth it?",
          answer: "When income passes an individual's payout limits (Creem's Alipay payouts to mainland individuals stop at CNY 300,000–600,000 a year), when you want Stripe, or when partners share the income. Ask an accountant about tax at home.",
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
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
            {isZh ? "已经知道身份了？直接用收款平台选择器 →" : "Know who holds the account? Use the payment platform picker →"}
          </Link>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{isZh ? "谁能开哪家" : "Who can open which"}</h2>
        <Matrix data={data} lang={lang} />
        <p className="mt-2 text-xs text-gray-400">
          {isZh
            ? `「大概率能」是平台文档能推出来但没有明说，「官方没说」是文档没提；这两种先问平台客服再动手。读取于 ${data.checked}。`
            : `"Likely" means the platform's pages imply it without saying so, "not stated" means they do not say; ask the platform's support first. Read on ${data.checked}.`}
        </p>
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
