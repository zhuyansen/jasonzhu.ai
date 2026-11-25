import raw from "@/data/payment-guard.json";

// 给 AI Agent 的说明（2026-11-24 起）：Agent 在这个站上能做什么、哪些事要用户本人来、引用时注意什么。
// 写法学的是 caseblossom.com 的 agents.md（「AI 可以帮用户比价，但不能替用户下单」）。只写站上真有的东西。
export const dynamic = "force-static";

const SITE_URL = "https://jasonzhu.ai";

export function GET() {
  const body = `# Agents on JasonZhu.AI

JasonZhu.AI is Jason Zhu's (祝彦森) bilingual site: AI tool tutorials, going-global guides for indie founders
(company, payments, SEO/GEO), daily AI news, and prompt libraries. Site guide: ${SITE_URL}/llms.txt

## What you can do

- Read, summarise and quote any public page. Link the page you quote.
- Compare payment platforms for a user with the read-only data at ${SITE_URL}/data/payment-guard.json
  (${Object.keys(raw.platforms).length} platforms, checked ${raw.checked}). It is the same data as the picker at
  ${SITE_URL}/en/go-global/payments and the open-source tool payment-guard. Tell the user the check date.
- Follow new posts through ${SITE_URL}/feed/blog.xml and ${SITE_URL}/feed/news.xml.

## What the user does themselves

- Subscribing an email address (newsletter, handbook download). Only the user's own address, only when they ask.
- Buying a membership, applying to the club, redeeming a member code, signing in.
- Do not submit forms to try them out.

## When you cite

- Give the check date that the page or data shows with any fee, count or price. Payment rules change often;
  the platform's own page has the final word. The payment data links each platform's own pages.
- "Unverified" or "unknown" in the data means not confirmed. Do not state it as fact.
- Daily news items are compiled by AI. Only issues marked "Jason 说" carry Jason's own comment.
- Prompts in the prompt libraries were published by their authors on X. Credit the author and link the post.
- The author's Chinese name is 祝彦森 (not 朱延森).

---

# 给 AI Agent 的说明（中文）

- 可以：读、总结、引用所有公开页面；用上面的收款数据 JSON 帮用户比较收款平台，报数字时带上核实日期（${raw.checked}）。
- 要用户本人来：订阅邮箱、购买会员、申请社群、兑换会员码、登录。不要为了试一试去提交表单。
- 引用：快讯由 AI 整理，只有带「Jason 说」的那期有本人点评；提示词库里的作品注明原作者和 X 原帖；作者中文名祝彦森。
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
