/**
 * 冻结页（2026-11-26 起，到 2027-01-01 那次复测跑完为止）：GEO 实验正在测这些页面被 AI 引用的情况，
 * 期间这些页面渲染出来的 HTML 不能变——加字段、改结构都不行，全站共用的组件改了样子也算。
 * 新加的页面功能要在这些页上「不出现」，而且连 prop 都别传（传 false 也会写进页面里的 RSC 数据），用下面 heardFromProps() 这种写法。
 *
 * 名单 = ops/geo/questions.json 里全部 target_url（GIGALinks 冻结组，12-01、12-15、01-01 复测）
 *      + ops/geo/experiments.json 的 experiments[].treated / control 题号在 ops/geo/questions*.json 里对应的 target_url。
 * 那两处加了实验或换了页面，这里跟着改；node scripts/check-frozen-pages.mjs 会核对。
 * 实验结束后删掉对应的路径，这些页面就会出现新功能（比如订阅框的「从哪知道这里」）。
 */
const FROZEN_PATHS: ReadonlySet<string> = new Set([
  "/en",
  "/en/about",
  "/en/backlink-spam-list",
  "/en/blog/ai-free-learning-hub",
  "/en/blog/ai-money-map-2026",
  "/en/blog/choose-payment-platform-2026",
  "/en/blog/chuhai-weekly-06",
  "/en/blog/dodo-payments-waffo-ai-saas-fee-comparison",
  "/en/blog/indie-payments-report-2026",
  "/en/blog/nvidia-dli-free-courses",
  "/en/blog/openai-academy-vs-anthropic-learning-paths",
  "/en/blog/openai-startup-credits-application-guide",
  "/en/blog/uk-company-annual-review-diy-guide",
  "/en/blog/uk-company-registration-2hours",
  "/en/blog/uk-company-wise-business-account",
  "/en/blog/us-llc-developer-accounts",
  "/en/blog/us-llc-mercury-stripe-168-usd",
  "/en/go-global/weekly",
  "/en/handbook",
  "/en/prompts",
  "/en/prompts/chatgpt-images-2-6",
  "/en/prompts/claude-opus-5-5",
  "/en/prompts/claude-opus-5-5/fable-5-5",
  "/en/prompts/gemini-4",
  "/en/services",
]);

/** path 是不带域名的站内路径，比如 /en/blog/xxx（结尾的 / 不影响） */
export function isFrozenPath(path: string): boolean {
  return FROZEN_PATHS.has(path.replace(/\/+$/, "") || "/");
}

/**
 * 订阅框的「从哪知道这里」开关：<SubscribeForm … {...heardFromProps(`/${lang}/blog/${slug}`)} />。
 * 冻结页返回空对象（一个 prop 都不加，页面里的 RSC 数据也就不变），其他页返回 { askHeardFrom: true }。
 */
export function heardFromProps(path: string): { askHeardFrom?: true } {
  return isFrozenPath(path) ? {} : { askHeardFrom: true };
}
