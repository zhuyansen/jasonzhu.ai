"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "@/components/Link";
import {
  GUARD_REPO,
  holder,
  pickTable,
  type GuardData,
  type Lang,
  type PickRow,
  type PickTable,
} from "@/lib/payment-guard-types";
import { COMMUNITY } from "@/lib/payment-community";

const DEFAULT_WHO = "cn-individual";
const DEFAULT_SELL = "saas";

// 按钮上的短名字；结果里用 payment-guard 数据里的全称
const WHO_SHORT: Record<string, { zh: string; en: string; hint?: { zh: string; en: string } }> = {
  "cn-individual": { zh: "大陆个人", en: "Individual, mainland China", hint: { zh: "没注册公司选这个", en: "no registered company" } },
  "cn-company": { zh: "大陆公司", en: "Mainland China company" },
  "hk-company": { zh: "香港公司", en: "Hong Kong company" },
  "us-company": { zh: "美国公司", en: "US company (LLC)" },
  "uk-company": { zh: "英国公司", en: "UK company (Ltd)" },
};
const SELL_SHORT: Record<string, { zh: string; en: string }> = {
  saas: { zh: "订阅软件", en: "Subscription software" },
  software: { zh: "买断软件", en: "Software sold once" },
  "ai-app": { zh: "AI 应用", en: "AI app" },
  "ai-media": { zh: "AI 图片视频", en: "AI images and video" },
  template: { zh: "模板素材", en: "Templates and assets" },
  course: { zh: "录播课", en: "Recorded courses" },
  ebook: { zh: "电子书", en: "E-books" },
  service: { zh: "真人服务", en: "Services by a person" },
  physical: { zh: "实体商品", en: "Physical goods" },
  donation: { zh: "打赏捐赠", en: "Donations and tips" },
};

const T = {
  zh: {
    colon: "：",
    source: "来源",
    community: `社群经验（${COMMUNITY.author.zh}，${COMMUNITY.date}）`,
    who: "1. 谁来收钱？",
    unsure: "不确定选哪个？先看个人还是公司",
    sell: "2. 卖什么？",
    first: "按官方条件排第一（能开户、收这类产品、到手多）",
    chipOpen: "开户",
    chipFit: "这类产品",
    none: "没有能开户、又收这类产品的平台，原因见下面「不考虑的」。",
    keep: (sale: number, v: number) => `卖 $${sale} 到手 $${v.toFixed(2)}`,
    mor: "代收税（MoR）",
    all: "全部平台",
    cols: ["平台", "能不能开户", "收不收这类产品", "代收税（MoR）", "卖 $20 到手", "同类卖家在用"],
    under: "（低估）",
    say: "平台怎么看这类产品",
    out: "不考虑的",
    open: "怎么开户",
    steps: "步骤",
    needs: "要准备",
    signup: "去注册",
    guide: "官方说明",
    noSteps: "这家的开户步骤还没整理，先看官方说明：",
    details: "每家的细节",
    rows: { opening: "开户", fee: "费率", payout: "出款", review: "审核", chargebacks: "拒付" },
    check: "提交审核前，按这家的清单体检网站",
    checkBody: "平台审核的是你的网站。payment-guard 按每家公开的审核清单逐条检查，免费、开源，不注册也不提交任何东西。",
    checkLink: "用法和安装",
    sellers: (n: number, since: string, asOf: string) => `「同类卖家在用」：${n.toLocaleString("zh-CN")} 个 ${since} 以来开卖的同类产品（截至 ${asOf}）。`,
    read: (d: string) => `费率、开户条件和出款读取于 ${d}，平台会改，提交前点开官方链接再确认一次。`,
  },
  en: {
    colon: ": ",
    source: "source",
    community: `Community experience (${COMMUNITY.author.en}, ${COMMUNITY.date})`,
    who: "1. Who holds the account?",
    unsure: "Not sure? Individual or company, first",
    sell: "2. What do you sell?",
    first: "First on the platforms' own terms (opens for you, takes the product, keeps the most)",
    chipOpen: "Opening",
    chipFit: "This product",
    none: "No platform both opens for you and takes this product; the reasons are under Left out.",
    keep: (sale: number, v: number) => `$${v.toFixed(2)} kept from a $${sale} sale`,
    mor: "Merchant of Record",
    all: "Every platform",
    cols: ["Platform", "Can you open it", "Takes this product", "Merchant of Record", "Kept from $20", "Sellers like you use it"],
    under: " (undercounted)",
    say: "What the platforms say about this kind of product",
    out: "Left out",
    open: "How to open an account",
    steps: "Steps",
    needs: "Have ready",
    signup: "Sign up",
    guide: "Official guide",
    noSteps: "These steps are not written up yet; see the official guide: ",
    details: "Each platform",
    rows: { opening: "Opening", fee: "Fees", payout: "Payouts", review: "Review", chargebacks: "Chargebacks" },
    check: "Before you apply, check the site against this platform's list",
    checkBody: "The platform reviews your website. payment-guard checks it line by line against each platform's published review list: free, open source, and it never signs up or submits anything.",
    checkLink: "Install and use it",
    sellers: (n: number, since: string, asOf: string) => `"Sellers like you": ${n.toLocaleString("en-US")} sellers of this kind since ${since} (to ${asOf}).`,
    read: (d: string) => `Fees, eligibility and payouts read on ${d}; platforms change them, so open the official links before you apply.`,
  },
};

function noopSubscribe() {
  return () => {};
}
const readWho = () => new URLSearchParams(window.location.search).get("who") ?? "";
const readSell = () => new URLSearchParams(window.location.search).get("sell") ?? "";

function syncUrl(key: "who" | "sell", value: string) {
  // replaceState：不产生历史记录，结果可以直接复制链接分享
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState(null, "", url.toString());
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function valid(value: string | undefined, options: Record<string, unknown>, fallback: string) {
  return value && value in options ? value : fallback;
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
      {children}
    </a>
  );
}

function Choices({
  title,
  options,
  value,
  onChoose,
  lang,
}: {
  title: string;
  options: { key: string; label: string; hint?: string }[];
  value: string;
  onChoose: (key: string) => void;
  lang: Lang;
}) {
  return (
    <fieldset className="mb-6">
      <legend className="text-base font-semibold text-gray-900 mb-3">{title}</legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2" role="radiogroup" lang={lang}>
        {options.map((o) => {
          const on = o.key === value;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChoose(o.key)}
              className={`text-left rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                on ? "border-blue-500 bg-blue-50 text-blue-800 font-medium" : "border-gray-200 text-gray-700 hover:border-blue-300"
              }`}
            >
              {o.label}
              {o.hint && <span className={`block text-xs mt-0.5 ${on ? "text-blue-600" : "text-gray-400"}`}>{o.hint}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function TopCard({ data, lang, row }: { data: GuardData; lang: Lang; row: PickRow }) {
  const t = T[lang];
  const p = data.platforms[row.platform];
  const chips = [
    `${t.chipOpen}${t.colon}${data.words[lang].open[row.open]}`,
    `${t.chipFit}${t.colon}${data.words[lang].fit[row.fit]}`,
    t.keep(data.sale, row.keep),
  ];
  if (p.mor) chips.push(`✅ ${t.mor}`);
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 mb-6">
      <p className="text-sm font-medium text-blue-700 mb-1">{t.first}</p>
      <p className="text-2xl font-bold text-gray-900 mb-3">{p.name}</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c} className="inline-block rounded-full bg-white border border-blue-100 px-3 py-1 text-sm text-gray-700">
            {c}
          </span>
        ))}
      </div>
      {COMMUNITY.platforms[row.platform] && (
        <p className="mt-3 rounded-lg bg-white/70 border border-gray-100 px-3 py-2 text-sm text-gray-600">
          <span className="font-medium text-gray-800">
            {t.community}
            {t.colon}
          </span>
          {COMMUNITY.platforms[row.platform][lang]}
        </p>
      )}
    </div>
  );
}

function PlatformTable({ data, lang, table }: { data: GuardData; lang: Lang; table: PickTable }) {
  const t = T[lang];
  return (
    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.all}</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              {t.cols.map((c) => (
                <th key={c} scope="col" className="px-3 py-2 text-left font-medium whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.rows.map((r) => (
              <tr key={r.platform}>
                <th scope="row" className="px-3 py-2 text-left font-medium text-gray-900 whitespace-nowrap">
                  {data.platforms[r.platform].name}
                </th>
                <td className="px-3 py-2 whitespace-nowrap">{data.words[lang].open[r.open]}</td>
                <td className="px-3 py-2 whitespace-nowrap">{data.words[lang].fit[r.fit]}</td>
                <td className="px-3 py-2">{data.platforms[r.platform].mor ? "✅" : "–"}</td>
                <td className="px-3 py-2 tabular-nums">${r.keep.toFixed(2)}</td>
                <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                  {r.share === null ? "–" : `${r.share}%${r.platform === "paddle" ? t.under : ""}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.category_note[lang] && (
        <p className="mt-3 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900 leading-relaxed">
          <span className="font-medium">
            {t.say}
            {t.colon}
          </span>
          {table.category_note[lang]}
        </p>
      )}
    </section>
  );
}

function LeftOut({ data, lang, table }: { data: GuardData; lang: Lang; table: PickTable }) {
  if (!table.excluded.length) return null;
  return (
    <section className="mb-8">
      <h3 className="text-base font-semibold text-gray-900 mb-2">{T[lang].out}</h3>
      <ul className="space-y-1.5 text-sm text-gray-600 list-disc pl-5">
        {table.excluded.map((x) => (
          <li key={x.platform}>
            <span className="font-medium text-gray-800">{data.platforms[x.platform].name}</span>
            {T[lang].colon}
            {x.why[lang]} <ExternalLink href={x.source}>{T[lang].source}</ExternalLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HowToOpen({ data, lang, who, rows }: { data: GuardData; lang: Lang; who: string; rows: PickRow[] }) {
  const t = T[lang];
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.open}</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {rows.slice(0, 3).map((r) => {
          const p = data.platforms[r.platform];
          const side = p.opening[holder(who)]?.[lang];
          return (
            <div key={r.platform} className="rounded-2xl border border-gray-100 p-4 flex flex-col">
              <p className="font-semibold text-gray-900 mb-2">{p.name}</p>
              {side ? (
                <>
                  <ol className="list-decimal pl-5 space-y-1.5 text-sm text-gray-700 leading-relaxed mb-3">
                    {side.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  {side.needs.length > 0 && (
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium text-gray-800">
                        {t.needs}
                        {t.colon}
                      </span>
                      {side.needs.join(lang === "zh" ? "；" : "; ")}
                    </p>
                  )}
                  <p className="mt-auto text-sm flex flex-wrap gap-x-3">
                    {p.opening.signup && <ExternalLink href={p.opening.signup}>{t.signup}</ExternalLink>}
                    {p.opening.source && <ExternalLink href={p.opening.source}>{t.guide}</ExternalLink>}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600">
                  {t.noSteps}
                  <ExternalLink href={p.review_doc}>{t.guide}</ExternalLink>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Details({ data, lang, who, rows }: { data: GuardData; lang: Lang; who: string; rows: PickRow[] }) {
  const t = T[lang];
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.details}</h3>
      <div className="space-y-2">
        {rows.map((r) => {
          const p = data.platforms[r.platform];
          const e = p.entities[who];
          const facts: [string, string][] = [
            [t.rows.fee, p.fee[lang]],
            [t.rows.payout, p.payout[lang]],
            [t.rows.review, p.review_time[lang]],
            [t.rows.chargebacks, p.chargebacks[lang]],
          ];
          return (
            <details key={r.platform} className="group rounded-xl border border-gray-100 px-4 py-3">
              <summary className="cursor-pointer font-medium text-gray-900">{p.name}</summary>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>
                  <span className="font-medium text-gray-800">
                    {t.rows.opening}
                    {t.colon}
                  </span>
                  {e.note[lang] || data.words[lang].open[e.status]} <ExternalLink href={e.source}>{t.source}</ExternalLink>
                </li>
                {facts
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <li key={k}>
                      <span className="font-medium text-gray-800">
                        {k}
                        {t.colon}
                      </span>
                      {v}
                    </li>
                  ))}
                {[...r.extra[lang], ...p.notes[lang]].map((n) => (
                  <li key={n}>{n}</li>
                ))}
                {COMMUNITY.platforms[r.platform] && (
                  <li>
                    <span className="font-medium text-gray-800">
                      {t.community}
                      {t.colon}
                    </span>
                    {COMMUNITY.platforms[r.platform][lang]} <ExternalLink href={COMMUNITY.url}>{t.source}</ExternalLink>
                  </li>
                )}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function CheckCta({ lang, rows }: { lang: Lang; rows: PickRow[] }) {
  const t = T[lang];
  const top = rows.filter((r) => r.platform !== "gumroad").slice(0, 3).map((r) => r.platform).join(",");
  const command = `payment-guard check ${lang === "zh" ? "你的域名" : "yoursite.com"} --for ${top || "creem,dodo,waffo"}${lang === "zh" ? " --lang zh" : ""}`;
  return (
    <section className="mb-8 rounded-2xl bg-gray-900 text-gray-100 p-5">
      <p className="font-semibold mb-2">{t.check}</p>
      <p className="text-sm text-gray-300 leading-relaxed mb-3">{t.checkBody}</p>
      <pre className="text-sm bg-black/40 rounded-lg p-3 overflow-x-auto mb-3">
        <code>{command}</code>
      </pre>
      <a href={GUARD_REPO} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-300 hover:underline">
        {t.checkLink} →
      </a>
    </section>
  );
}

export default function PaymentPicker({ data, lang }: { data: GuardData; lang: Lang }) {
  const t = T[lang];
  const urlWho = useSyncExternalStore(noopSubscribe, readWho, () => "");
  const urlSell = useSyncExternalStore(noopSubscribe, readSell, () => "");
  const [chosenWho, setWho] = useState<string>();
  const [chosenSell, setSell] = useState<string>();
  const who = valid(chosenWho ?? urlWho, data.entities, DEFAULT_WHO);
  const sell = valid(chosenSell ?? urlSell, data.products, DEFAULT_SELL);
  const table = pickTable(data, who, sell);
  const kind = data.products[sell]?.kind;

  const whoOptions = Object.keys(data.entities).map((key) => ({
    key,
    label: WHO_SHORT[key]?.[lang] ?? data.entities[key][lang],
    hint: WHO_SHORT[key]?.hint?.[lang],
  }));
  const sellOptions = Object.keys(data.products).map((key) => ({ key, label: SELL_SHORT[key]?.[lang] ?? data.products[key][lang] }));

  return (
    <div>
      <Choices
        title={t.who}
        options={whoOptions}
        value={who}
        lang={lang}
        onChoose={(key) => {
          setWho(key);
          syncUrl("who", key);
        }}
      />
      <p className="-mt-3 mb-6 text-sm">
        <Link href={`/${lang}/go-global/open-account`} className="text-blue-600 hover:underline">
          {t.unsure} →
        </Link>
      </p>
      <Choices
        title={t.sell}
        options={sellOptions}
        value={sell}
        lang={lang}
        onChoose={(key) => {
          setSell(key);
          syncUrl("sell", key);
        }}
      />

      {table && (
        <div aria-live="polite">
          <p className="text-sm text-gray-500 mb-3">
            {capitalize(data.entities[who][lang])} · {capitalize(data.products[sell][lang])}
          </p>
          {table.rows[0] ? <TopCard data={data} lang={lang} row={table.rows[0]} /> : <p className="mb-6 text-gray-700">{t.none}</p>}
          <PlatformTable data={data} lang={lang} table={table} />
          <LeftOut data={data} lang={lang} table={table} />
          {table.rows.length > 0 && <HowToOpen data={data} lang={lang} who={who} rows={table.rows} />}
          {table.rows.length > 0 && <Details data={data} lang={lang} who={who} rows={table.rows} />}
          <CheckCta lang={lang} rows={table.rows} />
          <p className="text-xs text-gray-400 leading-relaxed">
            {kind && data.usage.sellers[kind] ? `${t.sellers(data.usage.sellers[kind], data.usage.since, data.usage.as_of)}${data.usage.caveat[lang]} ` : ""}
            {t.read(data.checked)}
          </p>
        </div>
      )}
    </div>
  );
}
