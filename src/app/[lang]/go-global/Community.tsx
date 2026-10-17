import { COMMUNITY } from "@/lib/payment-community";

/** 社群经验（哥飞的朋友们）：按身份的两条路 + 选型要点。和官方数据分开放，注明出处和日期。 */
export default function Community({ lang, tips = true }: { lang: string; tips?: boolean }) {
  const isZh = lang !== "en";
  const l = isZh ? "zh" : "en";
  return (
    <section id="community" className="rounded-2xl border border-gray-100 p-5 scroll-mt-24">
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
