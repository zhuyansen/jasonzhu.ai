import type { Metadata } from "next";
import Link from "@/components/Link";
import SubscribeForm from "@/components/SubscribeForm";
import { getWeeklyIssues } from "@/lib/mdx";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import GoGlobalBreadcrumb from "../Breadcrumb";

const SITE_URL = "https://jasonzhu.ai";

// 出海选品周报板块（出海专题下，/[lang]/go-global/weekly；旧地址 /[lang]/weekly 在 next.config 里 308 过来）：
// 每期是一篇 series: chuhai-weekly 的博客文章（/[lang]/blog/<slug>），这里是目录页。
// 周报只有中文：en 页 canonical 指回 zh、不进 sitemap，和未翻译的博客文章同一规则。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  return {
    title: isZh ? "出海选品周报：每周的新卖家、新产品和验证过的需求" : "Weekly: new sellers, new products and verified demand",
    description: isZh
      ? "每周一更新：数一遍 Stripe、Gumroad、Lemon Squeezy、Polar、Creem、Dodo、Paddle 上新挂出收款链接的网站，看大家在卖什么、什么起量了、哪些需求还没人做。"
      : "Every Monday: the websites that started taking payments on Stripe, Gumroad, Lemon Squeezy, Polar, Creem, Dodo and Paddle, what they sell, what is taking off, and which demand nobody serves yet. In Chinese.",
    alternates: { canonical: `${SITE_URL}/zh/go-global/weekly` },
  };
}

export default async function WeeklyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const dict = await getDictionary(lang);
  const issues = getWeeklyIssues();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <GoGlobalBreadcrumb lang={lang} here={isZh ? "选品周报" : "Weekly"} path="/weekly" />
      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-medium text-blue-600 mb-2">{isZh ? "每周一更新" : "Every Monday"}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{isZh ? "出海选品周报" : "Going-Global Weekly"}</h1>
        <p className="text-gray-600 leading-relaxed">
          {isZh
            ? "每周数一遍 7 家收款平台（Stripe、Gumroad、Lemon Squeezy、Polar、Creem、Dodo、Paddle）上新挂出收款链接的网站：大家在卖什么，什么起量了，哪些需求还没人做。"
            : "Every week I count the websites that started taking payments on seven platforms (Stripe, Gumroad, Lemon Squeezy, Polar, Creem, Dodo, Paddle): what they sell, what is taking off, and which demand nobody serves yet. Issues are written in Chinese."}
        </p>
      </header>

      {/* How it is made */}
      <section className="mb-10 rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">{isZh ? "每期怎么做" : "How each issue is made"}</h2>
        <ul className="space-y-2 text-sm text-gray-600 leading-relaxed list-disc pl-5">
          <li>
            {isZh
              ? "新卖家：链向这 7 家结账页的网站，按第一次挂链接的日期算，来自 DataForSEO 链接图；站群、转发站和论坛都剔除。"
              : "New sellers: sites linking to these seven platforms' checkout pages, dated by their first link, from DataForSEO's link graph; networks, reposts and forums excluded."}
          </li>
          <li>
            {isZh
              ? "卖什么：读每个卖家的首页，由分类模型判断它卖的是什么、是不是 AI 产品，推荐的产品都由我挑过、打开看过。"
              : "What they sell: each seller's home page is read and classified by a model; every product featured was picked and opened by hand."}
          </li>
          <li>
            {isZh
              ? "说一个需求在涨，必须先用 Google Trends 12 个月的曲线核实：关键词工具的「同比暴涨」很多是假的。"
              : "A claim that demand is rising is checked against Google Trends' 12-month curve first: keyword tools' year-over-year jumps are often false."}
          </li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          {isZh ? "全量数据和方法：" : "The full data and method: "}
          <Link href={`/${lang}/blog/indie-payments-report-2026`} className="text-blue-600 hover:underline">
            {isZh ? "20 万个收款链接告诉我们什么" : "What 200,000 checkout links say"}
          </Link>
          {isZh ? "；各收款平台费率对比：" : "; payment platforms compared: "}
          <Link href={`/${lang}/blog/choose-payment-platform-2026`} className="text-blue-600 hover:underline">
            {isZh ? "独立开发者收款平台怎么选" : "how to choose one"}
          </Link>
        </p>
      </section>

      {/* Issues */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isZh ? `全部 ${issues.length} 期` : `All ${issues.length} issue${issues.length === 1 ? "" : "s"}`}
        </h2>
        {issues.length === 0 ? (
          <p className="text-gray-500">{isZh ? "第 1 期即将发布。" : "The first issue is on its way."}</p>
        ) : (
          <ol className="space-y-4">
            {issues.map((issue) => (
              <li key={issue.slug}>
                <Link
                  href={`/${lang}/blog/${issue.slug}`}
                  className="block rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {isZh ? `第 ${issue.issue} 期` : `Issue ${issue.issue}`}
                    </span>
                    <span className="text-sm text-gray-400">{issue.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 leading-snug">{issue.title}</h3>
                  {issue.excerpt && <p className="mt-2 text-sm text-gray-500 leading-relaxed">{issue.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Subscribe */}
      <SubscribeForm source="weekly" lang={lang} dict={dict} />
    </div>
  );
}
