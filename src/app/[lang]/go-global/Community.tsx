import Link from "@/components/Link";
import { COMMUNITY } from "@/lib/payment-community";

/** 社群经验（哥飞的朋友们 + 刘小排收款实测）：按身份的两条路 + 选型要点 + Waffo/Dodo $20 订阅真实损耗对比。和官方数据分开放，注明出处和日期。 */
export default function Community({ lang, tips = true }: { lang: string; tips?: boolean }) {
  const isZh = lang !== "en";
  const l = isZh ? "zh" : "en";
  const dp = COMMUNITY.dodoPractice;

  return (
    <section id="community" className="rounded-3xl border border-gray-200 bg-white p-5 md:p-6 scroll-mt-24">
      <p className="text-sm font-medium text-teal-700 mb-1">{isZh ? "社群经验" : "From the community"}</p>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {isZh ? "哥飞的朋友们一年踩下来，怎么选收款" : "How Gefei's community picks a payment platform, after a year of trying"}
      </h2>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">
        {isZh
          ? `这是群里的经验，不是平台规则，和上面按官方文档算出的结果可以对照着看。来源：${COMMUNITY.handle} 的「AI SaaS 怎么收钱」，${COMMUNITY.date}。`
          : `This is experience from a group of builders, not platform rules: read it next to the results from the official pages. Source: ${COMMUNITY.handle}, "How does an AI SaaS get paid?", ${COMMUNITY.date}.`}{" "}
        <a href={COMMUNITY.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {isZh ? "看原帖" : "Original post"}
        </a>
      </p>
      <div className="grid gap-3 md:grid-cols-3 mb-5">
        {COMMUNITY.paths.map((p) => (
          <div key={p.who.en} className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500 mb-1">{p.who[l]}</p>
            <p className="text-sm font-medium text-gray-900 leading-relaxed">{p.pick[l]}</p>
            {"checks" in p &&
              p.checks?.map((c) => (
                <p key={c.url} className="mt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-200 pt-2">
                  <span className="font-medium text-teal-700">{isZh ? "官方核对：" : "Checked: "}</span>
                  {c[l]}{" "}
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {isZh ? "来源" : "source"}
                  </a>
                </p>
              ))}
          </div>
        ))}
      </div>

      {/* 刘小排 2026-11 实测：Waffo + Dodo Payments 双通道备份与 $20 订阅真实扣费对比 */}
      <div className="mb-5 rounded-2xl border border-teal-200 bg-teal-50/40 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-gray-900">{dp.headline[l]}</h3>
          <span className="text-xs text-gray-500">
            {dp.author[l]} · {dp.date} ·{" "}
            <a href={dp.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {isZh ? "微信原文" : "WeChat article"}
            </a>
            {" · "}
            <Link href={`/${isZh ? "zh" : "en"}/blog/${dp.blogSlug}`} className="text-blue-600 font-medium hover:underline">
              {isZh ? "站内完整拆解 →" : "Full breakdown →"}
            </Link>
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{dp.summary[l]}</p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white mb-3">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
                <th className="py-2.5 pl-3 pr-2">{isZh ? "收款方案（卖 $20/月跨国 AI 订阅）" : "Setup ($20/mo cross-border AI sub)"}</th>
                <th className="py-2.5 px-2">{isZh ? "费率拆解（含附加项）" : "Fee breakdown (incl. surcharges)"}</th>
                <th className="py-2.5 px-2 whitespace-nowrap">{isZh ? "被扣手续费" : "Fee taken"}</th>
                <th className="py-2.5 pl-2 pr-3 whitespace-nowrap">{isZh ? "实际到手" : "Net kept"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dp.comparison20Usd.map((row) => (
                <tr key={row.name.en} className={row.highlight ? "bg-emerald-50/70 font-medium" : ""}>
                  <td className="py-2.5 pl-3 pr-2 text-gray-900">{row.name[l]}</td>
                  <td className="py-2.5 px-2 text-xs text-gray-600">{row.fee[l]}</td>
                  <td className="py-2.5 px-2 whitespace-nowrap text-rose-700">{row.cost}</td>
                  <td className="py-2.5 pl-2 pr-3 whitespace-nowrap font-semibold text-emerald-700">{row.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700 leading-relaxed mb-3">
          {dp.highlights.map((h) => (
            <li key={h.en}>{h[l]}</li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <a
            href={dp.partnerUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-teal-700 px-3 py-1.5 font-semibold text-white hover:bg-teal-800 transition-colors"
          >
            {isZh
              ? "Dodo 专属费率注册入口（3.8%+$0.40，免国际卡/订阅费，前 $200 免手续费）→"
              : "Dodo Partner Rate Signup (3.8%+$0.40, 0% intl/sub fee, first $200 fee-free) →"}
          </a>
          <span className="text-gray-500">
            {isZh
              ? "（这是刘小排在原文里公开的 Dodo 邀请链接，费率是他谈下来的；不是本站的推荐链接，本站不拿分成）"
              : "(This is the Dodo invite link Liu Xiaopai published with his post; he negotiated the rate. It isn't our referral link and we earn nothing from it.)"}
          </span>
          <Link href={`/${isZh ? "zh" : "en"}/blog/${dp.blogSlug}`} className="text-blue-600 font-medium hover:underline">
            {isZh ? "阅读《Waffo + Dodo 双通道与 $20 订阅真实手续费对比》全文 →" : "Read full post: Waffo + Dodo Dual-Gateway & $20 Fee Comparison →"}
          </Link>
        </div>
      </div>

      {tips && (
        <>
          <h3 className="text-base font-semibold text-gray-900 mb-2">{isZh ? "选型要点" : "Rules of thumb"}</h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
            {COMMUNITY.tips.map((tip) => (
              <li key={tip.en}>{tip[l]}</li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

