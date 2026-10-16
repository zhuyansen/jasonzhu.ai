import type { Metadata } from "next";
import Link from "@/components/Link";
import { type Locale } from "@/lib/dictionaries";
import {
  families,
  getSpamList,
  SPAM_LIST_DISPUTE,
  SPAM_LIST_REPO,
  SPAM_LIST_REPORT,
} from "@/lib/spam-list";
import SpamListClient from "./SpamListClient";

const SITE_URL = "https://jasonzhu.ai";
// 名单在 GitHub 上由大家共同维护；页面每天最多重读一次（ISR），不用为名单变化重新部署
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  return {
    title: isZh
      ? "垃圾外链来源库：卖外链站群的门户域名，每条附公开证据"
      : "Backlink spam list: link networks and link sellers, each with public evidence",
    description: isZh
      ? "提交外链前先查一下：几百个卖外链站群的门户域名和店面，每一条都附任何人可核实的证据（共用标题、跳转、收款链接）。大家共同在 GitHub 上举报和维护。"
      : "Look a domain up before you submit to it: hundreds of doorway domains and storefronts of link-selling networks, each with evidence anyone can check. Reported and kept up together on GitHub.",
    alternates: {
      canonical: `${SITE_URL}/${lang}/backlink-spam-list`,
      languages: {
        zh: `${SITE_URL}/zh/backlink-spam-list`,
        en: `${SITE_URL}/en/backlink-spam-list`,
        "x-default": `${SITE_URL}/zh/backlink-spam-list`,
      },
    },
  };
}

export default async function BacklinkSpamListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const { entries } = await getSpamList();
  const fams = families(entries);
  const sellers = entries.filter((e) => e.category === "link-seller").length;
  const lastChecked = entries.reduce((m, e) => (e.lastChecked > m ? e.lastChecked : m), "");
  const biggest = fams[0];

  const stats = [
    { n: entries.length, label: isZh ? "条记录" : "entries" },
    { n: fams.length, label: isZh ? "个站群" : "networks" },
    { n: sellers, label: isZh ? "个卖链接的站" : "link sellers" },
  ];
  const actions = [
    { href: SPAM_LIST_REPORT, label: isZh ? "举报一个站" : "Report a site", primary: true },
    { href: SPAM_LIST_DISPUTE, label: isZh ? "申诉某条记录" : "Dispute an entry", primary: false },
    { href: SPAM_LIST_REPO, label: isZh ? "GitHub 仓库" : "The GitHub repository", primary: false },
    { href: "https://github.com/zhuyansen/backlink-guard", label: isZh ? "用 backlink-guard 自动查" : "Check sites with backlink-guard", primary: false },
  ];
  const categories = isZh
    ? [
        ["link-network", "同一个人运营的一批站", "和其他已收录站共用的标题、跳转、收款链接或统计账号"],
        ["link-seller", "以卖链接为业", "它自己页面上的 PBN、DR/DA 套餐，或站群跳转过去的店面"],
        ["hacked", "被黑网站里被注入的页面", "被注入的页面或链接，比如博彩、成人产品的收款链接"],
        ["shortener", "被拿来批量刷「外链」的短链", "网站本身"],
      ]
    : [
        ["link-network", "one operator's sites", "a title, redirect, checkout link or analytics account shared with listed sites"],
        ["link-seller", "selling links is its business", "its own pages (PBN, DR and DA packages) or the storefront a network redirects to"],
        ["hacked", "a page injected into a hacked site", "the injected page or link, such as a checkout link for gambling or adult products"],
        ["shortener", "a URL shortener used for bulk backlinks", "the site itself"],
      ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-blue-600 mb-2">
          {isZh ? `大家共同维护 · 最近核实 ${lastChecked}` : `Kept up together · last checked ${lastChecked}`}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {isZh ? "垃圾外链来源库" : "Backlink spam list"}
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-3xl">
          {isZh
            ? "专门制造或出售垃圾外链的网站，每一条都附任何人都能在公开网页上核实的证据。提交你的网站之前，或者发现一批奇怪的外链指向你时，先在这里查一下这个域名。"
            : "Sites that build or sell spam backlinks, each with evidence anyone can check on the public web. Before you submit your site somewhere, or when odd links start pointing at it, look the domain up here."}
        </p>
      </header>

      <section className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{s.n.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap gap-2 mb-10">
        {actions.map((a) => (
          <a
            key={a.href}
            href={a.href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              a.primary
                ? "px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                : "px-4 py-2 rounded-full border border-gray-200 text-gray-700 text-sm hover:border-blue-300 hover:text-blue-700"
            }
          >
            {a.label}
          </a>
        ))}
      </section>

      {biggest && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{isZh ? "站群" : "The networks"}</h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed max-w-3xl">
            {isZh
              ? `大部分记录是站群的门户域名：成批注册的域名都跳转到少数几个卖外链的店面。最大的一群有 ${biggest.doorways} 个域名，全部跳转到 ${biggest.storefront || biggest.name}。`
              : `Most entries are doorway domains: domains registered in bulk that redirect to a few storefronts selling backlinks. The largest family has ${biggest.doorways} domains, all redirecting to ${biggest.storefront || biggest.name}.`}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left whitespace-nowrap">
                <tr>
                  <th className="px-4 py-2 font-medium">{isZh ? "站群" : "Family"}</th>
                  <th className="px-4 py-2 font-medium text-right">{isZh ? "门户域名" : "Doorways"}</th>
                  <th className="px-4 py-2 font-medium">{isZh ? "店面" : "Storefront"}</th>
                  <th className="px-4 py-2 font-medium">{isZh ? "共用标题" : "Shared title"}</th>
                </tr>
              </thead>
              <tbody>
                {fams.map((f) => (
                  <tr key={f.name} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-900">{f.name}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-900">{f.doorways}</td>
                    <td className="px-4 py-2 text-gray-600">{f.storefront || "–"}</td>
                    <td className="px-4 py-2 text-gray-500">{f.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mb-10 rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">{isZh ? "收什么、凭什么收" : "What goes in, and on what evidence"}</h2>
        <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
          {categories.map(([key, what, evidence]) => (
            <li key={key}>
              <code className="text-gray-900">{key}</code>
              {isZh ? `：${what}。证据：${evidence}。` : `: ${what}. Evidence: ${evidence}.`}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
          {isZh
            ? "工具给出的分数（垃圾分、「SPAM」标记）本身不算证据。只是出售传权重收录、本身是真实网站的目录站不收：那是需要权衡的政策风险，不是站群。记错了？任何人都可以申诉，被移除的记录保留历史。名单采用 CC BY 4.0 授权。"
            : "A tool's score (a spam score, a \"SPAM\" mark) is not evidence on its own. A directory that sells followed listings but is otherwise a real site is not listed: that is a policy risk to weigh, not a network. Anyone can dispute an entry, and a removed one keeps its history. The list is CC BY 4.0."}
          {" "}
          <Link href={`/${lang}/blog`} className="text-blue-600 hover:underline">
            {isZh ? "更多外链与 SEO 文章" : "More on backlinks and SEO"}
          </Link>
        </p>
      </section>

      <SpamListClient entries={entries} lang={lang} />
    </div>
  );
}
