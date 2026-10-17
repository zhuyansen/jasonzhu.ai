import type { Metadata } from "next";
import Link from "@/components/Link";
import { getGuardData } from "@/lib/payment-guard";
import { GUARD_REPO, type Lang } from "@/lib/payment-guard-types";
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
      languages: { zh: `${SITE_URL}/zh${PATH}`, en: `${SITE_URL}/en${PATH}`, "x-default": `${SITE_URL}/zh${PATH}` },
    },
  }, rawLang);
}

export default async function PaymentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  const isZh = lang === "zh";
  const data = getGuardData();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <GoGlobalBreadcrumb lang={lang} here={isZh ? "收款平台选择器" : "Payment platform picker"} path="/payments" />
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{isZh ? "收款平台选择器" : "Payment platform picker"}</h1>
        <p className="text-gray-600 leading-relaxed">
          {isZh
            ? "选谁来收钱、卖什么，下面马上给出：哪几家能开户、收不收你这类产品、卖一笔 20 美元的海外订单到手多少，以及排名靠前那几家的开户步骤。每一条都来自平台自己的文档，并附原文链接。"
            : "Pick who holds the account and what you sell. Below you get which platforms you can open, whether they take your kind of product, what a $20 sale to a buyer abroad leaves you, and the steps to open the top ones. Every line comes from the platform's own pages, linked."}
        </p>
      </header>

      <PaymentPicker data={data} lang={lang} />

      <div className="mt-12">
        <Community lang={lang} />
      </div>

      <section className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-base font-semibold text-gray-900 mb-2">{isZh ? "这份数据怎么来的" : "Where this comes from"}</h2>
        <p className="mb-2">
          {isZh
            ? "排名、费率、开户条件和开户步骤都来自开源工具 payment-guard，它读的是各平台的官方文档；网页和命令行用的是同一份数据。"
            : "The ranking, fees, eligibility and steps come from the open-source tool payment-guard, which reads each platform's own documentation; this page and the command line use the same data."}{" "}
          <a href={GUARD_REPO} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            GitHub
          </a>
        </p>
        <p>
          {isZh ? "8 家平台的完整对比和 20 万卖家的真实选择：" : "All eight platforms compared, and what 200,000 sellers chose: "}
          <Link href={`/${lang}/blog/choose-payment-platform-2026`} className="text-blue-600 hover:underline">
            {isZh ? "独立开发者收款平台怎么选" : "how to choose a payment platform"}
          </Link>
          {isZh ? "；" : "; "}
          <Link href={`/${lang}/blog/indie-payments-report-2026`} className="text-blue-600 hover:underline">
            {isZh ? "20 万个收款链接告诉我们什么" : "what 200,000 checkout links say"}
          </Link>
        </p>
      </section>
    </div>
  );
}
