import raw from "@/data/payment-guard.json";

// 收款平台数据的只读出口（2026-11-24 起）：给 AI 和 Agent 直接读，不用去解析页面。
// 和收款平台选择器（/go-global/payments）、开源工具 payment-guard 的 `payment-guard export` 是同一份，
// 只在最前面加一段 _about（是什么、核实日期、出处、怎么引用）。构建时生成，数据跟着 src/data/payment-guard.json 更新。
export const dynamic = "force-static";

const SITE_URL = "https://jasonzhu.ai";

export function GET() {
  const body = {
    _about: {
      what:
        "Payment platforms for indie software sellers: fees, payouts, review times, which seller entities can open an account, " +
        "and the picker's order for each product type. Account-opening facts each link the platform's own page; the other " +
        "figures come from the platforms' own documentation as of the check date. Bilingual (en / zh).",
      checked: raw.checked,
      opening_checked: raw.opening_checked,
      version: `payment-guard ${raw.version}`,
      source: "https://github.com/zhuyansen/payment-guard",
      page: `${SITE_URL}/en/go-global/payments`,
      page_zh: `${SITE_URL}/zh/go-global/payments`,
      cite_as: `JasonZhu.AI payment platform data (payment-guard ${raw.version}), checked ${raw.checked}`,
      note:
        "Platform rules change often. Quote the check date with any number and link the platform's own page for the final word. " +
        "Values marked unverified / unknown were not confirmed.",
    },
    ...raw,
  };
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
