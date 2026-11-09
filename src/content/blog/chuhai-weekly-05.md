---
title: "出海选品周报 · 第 5 期：自带 key、一次买断的 AI 小工具多了起来"
date: "2026-11-09"
category: "出海"
tags: ["出海", "出海选品周报", "独立开发", "选品", "海外收款"]
coverImage: "/blog/chuhai-weekly-05/cover.png"
series: "chuhai-weekly"
issue: 5
excerpt: "11 月 2 日至 8 日：4,735 个新卖家挂上收款链接；最近四周软件里 AI 产品占比从 58% 升到 63%；本周值得看的 5 个新产品；用户自带 key、只卖买断外壳的打法；Polar 进了 ChatGPT 和 Claude，Lemon Squeezy 说会帮老用户迁到 Stripe Managed Payments。"
---

每周数一遍 8 家收款平台（Stripe、Gumroad、Lemon Squeezy、Polar、Creem、Dodo、Paddle、Waffo）上新挂出收款链接的网站，看看大家在卖什么、什么起量了、哪些需求还没人做。

## 本周数字

- 链接图本周新收录 **4,735 个卖家**，其中卖软件的 833 个，AI 产品 584 个。按平台：Stripe 3,387，Gumroad 951，Lemon Squeezy 174，Polar 155，Dodo 36，Creem 30，Paddle 2。Waffo 仍没有收录到新卖家。
- 上周的数字补收到了 6,450 个（上期写的是 6,307），本周的数字之后也会往上涨。
- 11 月才过一周，所以拿最近四周（10 月 12 日至 11 月 8 日）和之前四周比：新卖家 2.25 万对 1.42 万；卖软件的比例 18.4% 对 18.8%，基本没变；软件里 AI 产品的比例从 58% 升到 63%。
- 本周 Polar 占新卖家的 3.3%，Lemon Squeezy 占 3.7%，都比 10 月整月（4.0% 和 5.0%）低。一周说明不了什么，等 11 月整月收完再看。

> 单周数字波动很大：链接图是一批一批收录新链接的，见过每周 1,100 到 6,500 的区间。看趋势要看月度。

## 本周值得看的 5 个新产品

1. **Drakar**（drakar.mgcrea.io，Stripe 收款）：Mac 原生窗口里跑 Claude Code 和 Codex，对话、权限确认、改动对比、多会话并排都在一个窗口，内存只占 VS Code 的六分之一。直接用你电脑上已装的 claude、codex 和你自己的订阅。源码 MIT 公开，卖的是签过名的安装包，一次买断 $14.99，需要 macOS 26。
2. **Lume**（lume.tild.io，Lemon Squeezy 收款）：按一个快捷键，在任何应用上方弹出 AI 面板，问完答案直接插回刚才的光标处。用你自己的 API key（OpenRouter、Anthropic、OpenAI 或本地 Ollama），key 存在钥匙串里，Lume 不经手任何请求。免费问 15 次，之后一次买断 €6.99。
3. **Gatekeep**（gatekeep.nanocorp.app，Stripe 收款）：给 Airbnb 房东筛客人。每个预订请求按对方的评价记录和社交账号打风险分，风险高的标出来，再替你发一条客气的婉拒。$29/月，最多 5 套房，14 天免费试用，还在早期阶段。
4. **Levr**（levr.ai，Stripe 收款）：给小企业贷款经纪人用的工作台，从客户资料收集、上传文件 AI 自动填表、一份申请投多家贷方，到佣金跟踪都在一处。经纪人免费用，钱向贷方那边收，这种两边市场的收费方式值得记一下。
5. **Tempr**（temprhq.io，Stripe 收款）：团队用 AI 的总闸门。Claude Code 走公司的 Claude 套餐、Codex 走 ChatGPT 套餐、其他工具走 API key，统一设预算、遮掉提示词里的密钥和个人信息、管哪些人能调哪些 MCP 工具、留日志。每月 1 万次请求免费，Pro $49/月。

## 本周一个打法：用户自带 key，你卖一个买断的壳

本周挑的 5 个里有 3 个是同一个思路：不转卖模型额度，让用户用自己的 API key 或自己已经在付的 Claude、ChatGPT 订阅，产品只卖界面和流程。上期的 Asset Lab（模型用自己的 Fal key）也是这样。

- **价格可以很低，还能买断**：不背 token 成本，就不用按月收钱兜底。Lume 买断 €6.99，Drakar $14.99，用户不用再多开一个订阅。
- **卖点写成「我们不碰你的数据和钱」**：key 存本地钥匙串、请求直连模型商、源码公开，这些在页面上都写在最显眼的位置。对已经付了 Claude、ChatGPT 订阅的人，这比「我们模型更强」好说服。
- **团队版换成管控**：到了公司里，同一个思路变成 Tempr 这种，卖的是预算、权限和日志。

风险：壳很容易被模型厂商自己做掉，或被开源项目追平。活得下来的往往是绑定一个具体场景（编程、写作、影像）、把那个场景的细节做透的。

## 收款平台动态

- **Polar**：11 月 3 日博客宣布上线 ChatGPT 官方插件，并成为 Claude 里认可的 MCP 服务。注册账号、配置定价、权益、计量和额度、接入代码、在沙盒里测试、从别的平台迁移，都可以在对话里让 agent 做。Claude 里安装：`/plugin install polar --marketplace polarsource/agent-toolkit`。原文：https://polar.sh/blog/polar-for-claude-and-chatgpt
- **Lemon Squeezy**：博客发了一篇「2026 Update」（页面标的发布日期是 11 月 7 日）。联合创始人承认过去一年客服变慢、更新变少，团队在做 Stripe 自己的代收款（merchant of record）产品 Stripe Managed Payments，目前支持 35 个以上国家的商户，说很快会开放公开注册，目标是让 Lemon Squeezy 用户方便地迁过去。在用 Lemon Squeezy 的卖家可以开始留意迁移方案。原文：https://www.lemonsqueezy.com/blog/2026-update

几家平台的完整对比见：《[独立开发者收款平台怎么选](/zh/blog/choose-payment-platform-2026)》；20 万卖家的全量数据见《[20 万个收款链接告诉我们什么](/zh/blog/indie-payments-report-2026)》。

---

数据来自 DataForSEO 的链接图和首页分类（Jev）。周报只发汇总数字和我自己挑过的产品，不发名单。
