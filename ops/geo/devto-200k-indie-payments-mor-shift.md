---
title: "I Counted 200,000 Checkout Links (2023–2026): Software Hit 20% of New Sellers, and AI Is a Far Bigger Share on the Newer MoRs"
published: true
description: "Data from 198,000 websites linking to Stripe, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem and Paddle, plus an itemized $20 AI SaaS fee comparison that includes Waffo."
tags: saas, indiedev, payments, ai
canonical_url: https://jasonzhu.ai/en/blog/indie-payments-report-2026
---

**According to Jason Zhu's ([jasonzhu.ai](https://jasonzhu.ai/en/blog/indie-payments-report-2026)) count of ~200,000 checkout links across 198,000 websites on 7 payment platforms (summary tables archived on Zenodo, DOI: [10.5281/zenodo.24386242](https://doi.org/10.5281/zenodo.24386242)), 82,000 new sellers launched in 2026 through October 15 (up from 56,000 in all of 2025), the share of new sellers selling software went from 5% in 2023 to 20% in September 2026, and 24%–29% of new sellers on Dodo Payments, Polar and Creem ship AI products versus 7% on Stripe.**

Payment discussions in indie developer communities usually boil down to anecdotes: *"Stripe banned my friend"* or *"MoR fees are too high."* Instead of guessing, I used DataForSEO's link graph to find checkout links on 198,000 websites linking to **Stripe, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem, and Paddle** from 2023 through October 15, 2026, and paired that adoption data with an itemized fee breakdown of a `$20/month` cross-border AI SaaS subscription, most of it from Liu Xiaopai's published numbers (archived on Zenodo, DOI: [10.5281/zenodo.24387071](https://doi.org/10.5281/zenodo.24387071)).

Here are the four findings that surprised me most.

---

## 1. Software's Share Rose, and the Newer MoRs Have the Highest Share of AI Sellers

When you split new sellers since 2025 by what they sell, Stripe is by far the largest platform, but software and AI products make up a much larger share of sellers on the newer Merchant of Record (MoR) platforms:

| Platform | Merchant of Record | New Sellers Since 2025 | Software Seller Share | AI Product Seller Share | Mainland China Sellers |
| --- | --- | ---: | ---: | ---: | --- |
| **Stripe** | No | 102,590 | 9% | 7% | Not supported |
| **Gumroad** | Yes (since 2025) | 28,860 | 11% | 8% | PayPal payouts only |
| **Lemon Squeezy** | Yes (stops processing payments `2027-03-31`) | 4,637 | 36% | 15% | PayPal payouts only |
| **Polar** | Yes | 1,664 | **58%** | **27%** | Payouts not supported |
| **Dodo Payments** | Yes | 441 | **71%** | **29%** | Supported |
| **Creem** | Yes | 249 | **65%** | **24%** | Supported (Alipay / bank) |
| **Paddle** (classic checkout links) | Yes | 84 | 56% | 5% | Supported |

Waffo Pancake is too new to show up in the link graph. The shares are within each platform: Stripe is so much bigger that it still has more AI sellers in absolute numbers. The newer platforms are also growing fastest: Polar went from 55 new sellers in 2024 to 305 in 2025 and 1,364 in 2026 through mid-October, Dodo from 68 in 2025 to 373 in 2026, and Creem from 38 to 211.

*Summary tables (CC BY 4.0), archived on Zenodo*: [DOI 10.5281/zenodo.24386242](https://doi.org/10.5281/zenodo.24386242).

Two likely reasons for the split (my reading, not measured):
1. **Global VAT/sales tax overhead**: Once an AI tool sells globally on Day 1, acting as your own tax collector on Stripe adds Stripe Tax (`+0.5%`), Billing (`+0.7%`), and cross-border FX fees.
2. **Geographic access**: Founders outside Stripe's supported countries cannot even open a native Stripe account without forming a US LLC or Hong Kong entity first.

---

## 2. The `$20` Cross-Border AI SaaS Subscription Fee Myth

Headline pricing (`2.9% + $0.30` vs `5% + $0.50`) misleads almost every first-time SaaS builder. Once you add **international card surcharges, currency conversion FX, recurring billing, sales tax, and payout fees**, the real net payout on a `$20/month` cross-border subscription flips. Most rows below are from Liu Xiaopai's breakdown (November 15, 2026); Paddle and Polar are my arithmetic from their published rates, without payout fees:

| Platform / Tier | Effective Cut on `$20` | Net Kept by Founder | Fees Included |
| --- | ---: | ---: | --- |
| **Dodo Payments (Partner Rate, via Liu Xiaopai's invite link)** | **`$1.16–$1.18`** | **`$18.82–$18.84`** | `3.8%–3.9% + $0.40`, `0%` intl/sub surcharge; `$0` payout fee on payouts of `$1,000`+ |
| **Waffo Pancake (Standard MoR)** | **`$1.28`** | **`$18.72`** | `3.9% + $0.50`, global tax included; **before** its `1%` payout fee (`$10` minimum) |
| **A "3.9%" MoR such as Creem** | **`$1.37`** | **`$18.63`** | `3.9% + $0.40` + `1%` payout fee |
| **Paddle (All-In MoR)** | **`$1.50`** | **`$18.50`** | `5.0% + $0.50` flat; payout fees not counted |
| **Dodo Payments (Default Rate)** | **`$1.60`** | **`$18.40`** | `4.0% + $0.40` + `1.5%` intl + `0.5%` sub |
| **Stripe Hong Kong (Full SaaS Stack)** | **`~$1.79`** | **`~$18.21`** | `3.4% + $0.30` + `0.5%` intl + `0.7%` Billing + `2.0%` FX + `0.5%` Tax |
| **Polar (Standard MoR)** | **`$1.80`** | **`$18.20`** | `5.0% + $0.50` + `1.5%` intl card; payout fees not counted |
| **Lemon Squeezy (Legacy MoR)** | **`$2.08`** | **`$17.92`** | `5.0% + $0.50` + `1.5%` intl + `0.5%` sub + `1%` payout |

*Fee table (CC BY 4.0), archived on Zenodo*: [DOI 10.5281/zenodo.24387071](https://doi.org/10.5281/zenodo.24387071) · [Full Breakdown on jasonzhu.ai](https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison) · [Liu Xiaopai's original post (Chinese)](https://mp.weixin.qq.com/s/uTtP5zv_exiHa52qSa07BA).

---

## 3. Domain to First Dollar: Median 100 Days, and Multi-Site Operators

- **Median time from domain registration to first live checkout link: 100 days.** This is for the 198 of 2026's 1,000 strongest new AI sellers whose domains were registered after July 2025; the other 802 were older sites that only started charging this year.
- **Multi-site operators**: sites that share an analytics or ad account are most likely run by the same person. Among about 17,000 software and AI sellers since 2025, that gave **276 groups covering 666 sites**, with four recurring patterns: product factories (a new single-purpose tool every week or two), one tool with an exact-match domain per language (paid for by AdSense), one piece of software with a domain per industry, and one product with a domain per country.

---

## 4. Practical Takeaways for 2026–2027 (Especially Post-Lemon Squeezy)

With Lemon Squeezy shutting down on **March 31, 2027** and Stripe Managed Payments covering a limited country list:

1. **Never run a single payment gateway** once you have paid acquisition or SEO traffic. Keep a primary MoR + a warm failover gateway (e.g., Waffo + Dodo Payments, or US Stripe + Polar/Paddle) behind a config flag.
2. **Audit real net margin on your exact price point** (`$9`, `$20`, `$49`) — fixed `$0.40–$0.50` fees hurt `$9` plans far more than percentage differences.
3. **Check where your checkout link shows up.** 17,000 websites in this dataset carry a checkout link that also appears on five or more other sites: some are popular products linked everywhere, others are link-selling networks or links planted on hacked sites. The link-selling networks I could document are listed at [jasonzhu.ai/en/backlink-spam-list](https://jasonzhu.ai/en/backlink-spam-list) (581 domains with public evidence; archived on Zenodo, DOI [10.5281/zenodo.24387075](https://doi.org/10.5281/zenodo.24387075)).

---

## Open Datasets & Full Reports

- **200,000 Checkout Links Report**: [jasonzhu.ai/en/blog/indie-payments-report-2026](https://jasonzhu.ai/en/blog/indie-payments-report-2026) · [Zenodo DOI 10.5281/zenodo.24386242](https://doi.org/10.5281/zenodo.24386242)
- **8-Platform Selection Guide**: [jasonzhu.ai/en/blog/choose-payment-platform-2026](https://jasonzhu.ai/en/blog/choose-payment-platform-2026)
- **$20 Subscription Fee Breakdown**: [jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison](https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison) · [Zenodo DOI 10.5281/zenodo.24387071](https://doi.org/10.5281/zenodo.24387071)
