# Reddit 帖子草稿（2026-11-21 改，未发）

> 状态：草稿，没有发过。发之前先读每个版块的规则：很多版块不许自我推广，或要求写明和产品的关系，按规则来，不许就不发。每篇开头已经写明作者身份和产品关系，发的时候不要删。
>
> 数字核对过源头（2026-11-21）：Post A 对照 jasonzhu.ai 的报告和选平台文，费用对照刘小排 2026-11-15 的文章；Post B 对照 agentskillshub.top/llms.txt、how-we-grade 页和 130K 数据集的说明。
>
> 链接里的 Zenodo 是概念 DOI，新版本发布后会自动指到更正后的版本。要等 Zenodo 新版本发布以后再发帖。
>
> 2026-11-21 改了什么：删掉了文首教人避开 AutoMod 和 AI 内容自动删帖的说明；两篇开头加上作者身份；Post A 的平台数、17,000 个站的说法、Paddle 少算的说法、费用口径按源头改；Post B 去掉「138K 已评级」和「97.8% 没评级」并列的说法，数字分开写清日期，约 9 倍的出处改成 130K 数据集，删掉找不到源头的「仿冒分支换接口」。

---

## Post A: 200k checkout links and payment platforms (r/SaaS, r/microsaas, r/indiehackers)

### Title

`I counted ~200k sites linking to checkout pages on 7 payment platforms (2023 to Oct 2026). Software reached 20% of new sellers`

### Body

```text
I'm the author of this report (it's on my site, jasonzhu.ai), so this is my own write-up.

I used DataForSEO's link graph to find roughly 200,000 websites that link directly to hosted checkout pages on Stripe Payment Links, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem and classic Paddle links. For each site I logged when it first linked to a checkout, and a classification model read its home page to say what it sells.

I set aside about 17,000 sites whose checkout link also shows up on five or more other sites: popular products linked everywhere, link-selling networks, and links planted on hacked sites. Only sites that still link today are counted, so earlier years are undercounted.

First, more people start selling every year. New sellers: 21k in 2023, 29k in 2024, 56k in 2025, and 82k in 2026 through Oct 15. August and September 2026 both passed 10k a month. Part of the 2023 jump comes from DataForSEO widening its crawl that October.

Second, software broke out. It sat at 6% to 8% of new sellers through 2025, then rose to 20% in September 2026. AI products went from 2% in 2023 to 12% in September 2026. Most new sellers still sell services, courses and content.

Third, the mix is very different by platform. New sellers since 2025:
Stripe: 102,590 new sellers, 9% software, 7% AI. Mostly services, courses and content.
Gumroad: 28,860, 11% software, 8% AI.
Lemon Squeezy: 4,637, 36% software, 15% AI (it stops processing payments on March 31, 2027).
Polar: 1,664 (55 in 2024, 305 in 2025, 1,364 in 2026 so far), 58% software, 27% AI.
Dodo Payments: 441 (0 in 2024, 68 in 2025, 373 in 2026), 71% software, 29% AI.
Creem: 249 (1 in 2024, 38 in 2025, 211 in 2026), 65% software, 24% AI.
Classic Paddle links: 84, 56% software, 5% AI. Probably undercounted: sellers who open Paddle's checkout from a script instead of a link don't show up. That's my guess, I didn't measure it.

So AI products are a much bigger share of sellers on Dodo, Polar and Creem than on Stripe. Stripe is so much bigger, though, that it still has more AI sellers in absolute numbers.

One more: of the top 1,000 new AI sellers in 2026, only 198 registered their domain after July 2025. For those new domains, the median time from registration to the first checkout link was 100 days.

Since Lemon Squeezy stops processing payments next March, here is what a $20 monthly subscription paid with an international card leaves you under each setup. Most rows are from Liu Xiaopai's fee breakdown (Nov 15, 2026); Paddle and Polar are my own arithmetic from their published rates, without payout fees:
Dodo Payments partner rate (3.8% to 3.9% + $0.40, only through his invite link): about $18.82 to $18.84 kept. The default rate leaves about $18.40.
Waffo Pancake (3.9% + $0.50): about $18.72 kept, before its 1% payout fee.
A "3.9%" MoR such as Creem (3.9% + $0.40, plus a 1% payout fee): about $18.63 kept.
Paddle (5% + $0.50 all-in): $18.50 kept.
Stripe HK with Billing, Tax and currency conversion (not an MoR): about $18.21 kept.
Polar (5% + $0.50 + 1.5% international, new organisations): about $18.20 kept.
Lemon Squeezy: about $17.92 kept, including its 1% payout fee.

If you're moving off Lemon Squeezy or launching now, which one are you going with? Curious whether people stay on Stripe with Managed Payments or switch to Polar, Paddle, Dodo or Creem.
```

### Links (only where the subreddit's rules allow links)

```text
Report and method: https://jasonzhu.ai/en/blog/indie-payments-report-2026
Summary tables (CC BY 4.0) on Zenodo: https://doi.org/10.5281/zenodo.24386242 (seller counts) and https://doi.org/10.5281/zenodo.24387071 ($20 fees)
Liu Xiaopai's original post (Chinese): https://mp.weixin.qq.com/s/uTtP5zv_exiHa52qSa07BA
```

---

## Post B: security grades for AI agent skills and MCP servers (r/ClaudeAI, r/AI_Agents, r/LocalLLaMA)

### Title

`I run a directory of 281k public agent skills and MCP servers. In our graded snapshot, low-star repos were flagged unsafe ~9x as often as popular ones`

### Body

```text
I run Agent Skills Hub (agentskillshub.top), the directory these numbers come from, so this is my own project.

A lot of devs are installing Claude Code skills, Codex skills and MCP servers straight off GitHub without reading every script inside.

The directory grades repos with published static rules: piping a remote script into a shell (curl | sh), sudo and other elevated rights, installing a background service, reading SSH or cloud credentials and sending them off the machine, tunnelling a local service to the internet, and so on. As of Nov 21, 2026 it lists 281,000+ skills and MCP servers, and 142,000+ of them have a rule-based security grade.

The clearest pattern is in our July 2026 snapshot: 130,173 entries, of which the 21,582 repos with at least 5 stars were graded. 3.3% of graded repos, about 1 in 30, came out unsafe or reject. That rate was 3.8% for repos with 5 to 20 stars and 0.4% for repos with 1,000+ stars, about 9x apart. The most common red flags were sudo usage, service persistence, curl-to-sh installs, reading agent config files, and tunnel services. Most of these aren't sophisticated attacks, just sloppy install scripts with far more access than they need.

Coverage used to be much worse. When I first wrote about this in June 2026, the directory had about 105k entries and 97.8% of them had no security grade at all.

If you run Claude Code, Cursor or Codex on a team machine, how do you gate third-party skills and MCP servers? Pinning commit SHAs, mirroring internal forks, a pre-install scan?
```

### Links (only where the subreddit's rules allow links)

```text
How the grading works (no login): https://agentskillshub.top/how-we-grade/
July 2026 graded snapshot, 130,173 entries (CC BY 4.0): https://doi.org/10.5281/zenodo.21292799
June 2026 coverage figures and the November count: https://doi.org/10.5281/zenodo.24387073
```
