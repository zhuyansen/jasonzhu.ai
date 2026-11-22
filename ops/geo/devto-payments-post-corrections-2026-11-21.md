# dev.to 支付文要改的地方（2026-11-21 整理）

> **2026-11-22 已改完**：按下面 13 条用 dev.to 接口改了标题、简介和正文（id 5087822），改完读回核对过：正文和仓库稿逐字相同，网址、标签、canonical_url 都没变。

文章：https://dev.to/yansen_zhu_9b0dae1c4cc0da/i-analyzed-200000-indie-checkout-links-2023-2026-why-ai-saas-builders-are-choosing-mors-over-1020 （#5087822，2026-11-21 11:45 UTC 发布）

线上正文和仓库稿 `ops/geo/devto-200k-indie-payments-mor-shift.md` 的旧版逐字相同（2026-11-21 用 dev.to 公开接口核对过）。仓库稿已经改好。

**什么时候改**：等 Zenodo 01、02、04 号的新版本发布以后。新稿里的 DOI 用的是概念 DOI（10.5281/zenodo.24386242、24387071、24387075），发布前它们还指向旧版本的错数。

**最省事的改法**：在 dev.to 编辑器里把正文整个换成仓库稿 frontmatter（两条 `---` 之间）以下的全部内容，再按第 1、2 条改标题和简介。下面逐条列出改了什么，方便核对。

## 逐条

1. **标题**（可选）
   - 原：I Analyzed 200,000 Indie Checkout Links (2023–2026): Why AI SaaS Builders Are Choosing MoRs Over Stripe
   - 改：I Counted 200,000 Checkout Links (2023–2026): Software Hit 20% of New Sellers, and AI Is a Far Bigger Share on the Newer MoRs
   - 原因：数的不全是独立开发者（2026 年新卖家 38% 卖的是咨询、本地服务这类）；「AI 开发者选 MoR 不选 Stripe」是把各平台内部的占比读成了选择，按绝对数 Stripe 上的 AI 卖家反而更多。改标题后网址会不会变没有核实，不放心就只改正文。

2. **简介**（description）
   - 原：…linking to Stripe, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem, Paddle, and Waffo…
   - 改：Data from 198,000 websites linking to Stripe, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem and Paddle, plus an itemized $20 AI SaaS fee comparison that includes Waffo.
   - 原因：链接数据只有 7 家，Waffo 太新、链接图里没有它。

3. **开头加粗段**：「CERN Zenodo DOI」→「summary tables archived on Zenodo」；「software sellers quadrupled from 5% to 20%」→「the share of new sellers selling software went from 5% in 2023 to 20% in September 2026」（原句把 2023 全年和 2026 年 9 月单月放在一起算倍数）；「on Merchant of Record (MoR) platforms」→「on Dodo Payments, Polar and Creem」。

4. **第二段**：去掉平台列表里的 Waffo；写明数据来自 DataForSEO 的链接图、截止 2026-10-15；「itemized real-world fee audit」→「itemized fee breakdown…, most of it from Liu Xiaopai's published numbers」；「CERN Zenodo DOI」→「archived on Zenodo」。

5. **第 1 节标题**：「Software Quadrupled, and AI Sellers Cluster Heavily on Newer MoRs」→「Software's Share Rose, and the Newer MoRs Have the Highest Share of AI Sellers」。

6. **第 1 节的表（整张换掉）**：原表是 Zenodo 01 号旧版的错数（Polar 2,400、Dodo 980、Creem 620、Paddle 590、Waffo 180 等），列名还写成「2026 to Oct 15」。换成选平台文里 2025 年以来的数：Stripe 102,590（9% / 7%）、Gumroad 28,860（11% / 8%）、Lemon Squeezy 4,637（36% / 15%）、Polar 1,664（58% / 27%）、Dodo 441（71% / 29%）、Creem 249（65% / 24%）、Paddle 84（56% / 5%）。删掉 Waffo 行，最后一列改成各平台对中国大陆卖家的支持情况。表下面加一段：Waffo 太新没有数据；占比是各平台内部的，Stripe 体量大得多，按绝对数 AI 卖家仍然更多；Polar 55 → 305 → 1,364、Dodo 68 → 373、Creem 38 → 211。

7. **表下的数据集链接**：「Full dataset (CSV + methodology, CC BY 4.0): CERN Zenodo DOI 10.5281/zenodo.24386243」→「Summary tables (CC BY 4.0), archived on Zenodo: DOI 10.5281/zenodo.24386242」。Zenodo 上只有汇总表，原始链接数据按 DataForSEO 的条款不能再分发。

8. **「Why the sharp split? Two practical drivers:」** →「Two likely reasons for the split (my reading, not measured):」，两条原因本身不动。

9. **第 2 节**：表前加一句出处（大部分行来自刘小排 2026-11-15 的拆算，Paddle 和 Polar 是我按公开费率算的、没算提现费）。表里改四行：Dodo 合作价注明「只有走刘小排的邀请链接才有」；Waffo 注明「before its 1% payout fee ($10 minimum)」；「Creem (Standard MoR)」改成「A "3.9%" MoR such as Creem」（刘小排原文这一行没点名平台）；Paddle、Polar 注明「payout fees not counted」。最后一列列名改成「Fees Included」。

10. **第 2 节表下的链接**：「CERN Zenodo DOI 10.5281/zenodo.24387072」→「archived on Zenodo: DOI 10.5281/zenodo.24387071」，再加刘小排原文链接 https://mp.weixin.qq.com/s/uTtP5zv_exiHa52qSa07BA 。

11. **第 3 节**：标题去掉「Multi-Site Operators Win on Velocity」里的「Win on Velocity」（没有数据支持）。100 天中位数注明是 2026 年最强的 1,000 个新 AI 卖家里、2025 年 7 月以后注册域名的那 198 个。「276 operators running 666 monetized domains … four repeatable models (niche micro-SaaS portfolios, AI wrapper studios, SEO/directory funnels, and developer toolkits)」这四种模式是编的，换成报告原文的四种：产品工厂、每种语言一个精确匹配域名（靠 AdSense）、每个行业一个域名、每个国家一个域名；「276 operators」改成「276 groups covering 666 sites（共用统计或广告账号的站，大概率是同一个人）」。

12. **第 4 节第 3 条**：「17,000+ websites sharing recycled or injected checkout links across doorway farms」→ 17,000 个网站的收款链接同时出现在 5 个以上的站上，其中有爆款被到处转发，也有卖外链的站群和被黑网站里注入的链接；能举证的站群列在 /backlink-spam-list（581 个域名，存档于 Zenodo，DOI 10.5281/zenodo.24387075）。原句把爆款也算成了滥用。

13. **文末「Open Datasets & Full Reports」**：两个 DOI 换成概念 DOI（24386242、24387071）；「$20 Subscription Real Fee Audit」改成「$20 Subscription Fee Breakdown」。

改完后在 `ops/geo/tier1-data-outreach-pack.md` 第七节那条 dev.to 回执旁边记一笔改版日期。
