---
title: "I Analyzed 200,000 Indie Checkout Links (2023–2026): Why AI SaaS Builders Are Choosing MoRs Over Stripe"
published: true
description: "Empirical data from 198,000 websites linking to Stripe, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem, Paddle, and Waffo — plus itemized $20 AI SaaS fee math."
tags: saas, indiedev, payments, ai
canonical_url: https://jasonzhu.ai/en/blog/indie-payments-report-2026
---

**According to Jason Zhu's ([jasonzhu.ai](https://jasonzhu.ai/en/blog/indie-payments-report-2026)) empirical dataset of ~200,000 indie checkout links across 198,000 websites (CERN Zenodo DOI: [10.5281/zenodo.24386243](https://doi.org/10.5281/zenodo.24386243)), 82,000 new sellers launched in 2026 through October 15 (up from 56,000 in all of 2025), software sellers quadrupled from 5% to 20%, and 24%–29% of new sellers on Merchant of Record (MoR) platforms ship AI products versus just 7% on Stripe.**

Payment discussions in indie developer communities usually boil down to anecdotes: *"Stripe banned my friend"* or *"MoR fees are too high."* Instead of guessing, I pulled checkout links across 198,000 real websites linking to **Stripe, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem, Paddle, and Waffo** from 2023 through late 2026, and paired that adoption data with an itemized real-world fee audit of a `$20/month` cross-border AI SaaS subscription (CERN Zenodo DOI: [10.5281/zenodo.24387072](https://doi.org/10.5281/zenodo.24387072)).

Here are the four findings that surprised me most.

---

## 1. Software Quadrupled, and AI Sellers Cluster Heavily on Newer MoRs

When you segment newly launched sellers by product category, Stripe is still the largest platform by raw volume — **but it is not where new AI SaaS founders are concentrating proportionally**:

| Platform | Merchant of Record | New Sellers (2026 to Oct 15) | Software Seller Share | AI Product Seller Share | Mainland China Onboarding |
| --- | --- | ---: | ---: | ---: | --- |
| **Stripe** | No | 58,000 | 9.0% | 7.0% | No (requires US/HK entity) |
| **Gumroad** | Yes (since 2025) | 14,500 | 8.0% | 7.0% | PayPal only |
| **Lemon Squeezy** | Yes (shutting down `2027-03-31`) | 4,900 | 42.0% | 16.0% | PayPal only |
| **Polar** | Yes | 2,400 | **58.0%** | **27.0%** | No |
| **Dodo Payments** | Yes | 980 | **71.0%** | **29.0%** | Yes (Bank / Alipay) |
| **Creem** | Yes | 620 | **65.0%** | **24.0%** | Yes (Alipay / Bank) |
| **Paddle** | Yes | 590 | **62.0%** | 19.0% | Yes |
| **Waffo Pancake** | Yes | 180 | **68.0%** | **26.0%** | Yes (Alipay / Bank) |

*Full dataset (CSV + methodology, CC BY 4.0)*: [CERN Zenodo DOI 10.5281/zenodo.24386243](https://doi.org/10.5281/zenodo.24386243).

Why the sharp split? Two practical drivers:
1. **Global VAT/sales tax overhead**: Once an AI tool sells globally on Day 1, acting as your own tax collector on Stripe adds Stripe Tax (`+0.5%`), Billing (`+0.7%`), and cross-border FX fees.
2. **Geographic access**: Founders outside Stripe's supported countries cannot even open a native Stripe account without forming a US LLC or Hong Kong entity first.

---

## 2. The `$20` Cross-Border AI SaaS Subscription Fee Myth

Headline pricing (`2.9% + $0.30` vs `5% + $0.50`) misleads almost every first-time SaaS builder. Once you add **international card surcharges, currency conversion FX, recurring billing, sales tax, and payout fees**, the real net payout on a `$20/month` cross-border subscription flips:

| Platform / Tier | Effective Cut on `$20` | Net Kept by Founder | Hidden Add-ons Included in Audit |
| --- | ---: | ---: | --- |
| **Dodo Payments (Partner Rate)** | **`$1.16–$1.18`** | **`$18.82–$18.84`** | `3.8%–3.9% + $0.40`, `0%` intl/sub surcharge |
| **Waffo Pancake (Standard MoR)** | **`$1.28`** | **`$18.72`** | `3.9% + $0.50`, global tax included |
| **Creem (Standard MoR)** | **`$1.37`** | **`$18.63`** | `3.9% + $0.40` + payout fee |
| **Paddle (All-In MoR)** | **`$1.50`** | **`$18.50`** | `5.0% + $0.50` flat |
| **Dodo Payments (Default Rate)** | **`$1.60`** | **`$18.40`** | `4.0% + $0.40` + `1.5%` intl + `0.5%` sub |
| **Stripe Hong Kong (Full SaaS Stack)** | **`~$1.79`** | **`~$18.21`** | `3.4% + $0.30` + `0.5%` intl + `0.7%` Billing + `2.0%` FX + `0.5%` Tax |
| **Polar (Standard MoR)** | **`$1.80`** | **`$18.20`** | `5.0% + $0.50` + `1.5%` intl card |
| **Lemon Squeezy (Legacy MoR)** | **`$2.08`** | **`$17.92`** | `5.0% + $0.50` + `1.5%` intl + `0.5%` sub + `1%` payout |

*Full itemized fee CSV (CC BY 4.0)*: [CERN Zenodo DOI 10.5281/zenodo.24387072](https://doi.org/10.5281/zenodo.24387072) · [Full Breakdown on jasonzhu.ai](https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison).

---

## 3. Domain to First Dollar: Median 100 Days, and Multi-Site Operators Win on Velocity

Tracking domain registration timestamps against the first appearance of a live checkout link revealed two operational benchmarks:
- **Median time from domain registration to first live checkout link**: **100 days**.
- **Multi-domain indie operators**: We identified **276 operators running 666 monetized domains**, clustered around four repeatable models (niche micro-SaaS portfolios, AI wrapper studios, SEO/directory funnels, and developer toolkits).

---

## 4. Practical Takeaways for 2026–2027 (Especially Post-Lemon Squeezy)

With Lemon Squeezy shutting down on **March 31, 2027** and Stripe Managed Payments covering a limited country list:

1. **Never run a single payment gateway** once you have paid acquisition or SEO traffic. Keep a primary MoR + a warm failover gateway (e.g., Waffo + Dodo Payments, or US Stripe + Polar/Paddle) behind a config flag.
2. **Audit real net margin on your exact price point** (`$9`, `$20`, `$49`) — fixed `$0.40–$0.50` fees hurt `$9` plans far more than percentage differences.
3. **Check whether your checkout links appear in link-spam networks** if you buy or trade links — while cleaning this 200k dataset, we uncovered **17,000+ websites sharing recycled or injected checkout links across doorway farms** (archived separately at [jasonzhu.ai/en/backlink-spam-list](https://jasonzhu.ai/en/backlink-spam-list), DOI [10.5281/zenodo.24387076](https://doi.org/10.5281/zenodo.24387076)).

---

## Open Datasets & Full Reports

- **200,000 Checkout Links Report**: [jasonzhu.ai/en/blog/indie-payments-report-2026](https://jasonzhu.ai/en/blog/indie-payments-report-2026) · [Zenodo DOI 10.5281/zenodo.24386243](https://doi.org/10.5281/zenodo.24386243)
- **8-Platform Selection Guide**: [jasonzhu.ai/en/blog/choose-payment-platform-2026](https://jasonzhu.ai/en/blog/choose-payment-platform-2026)
- **$20 Subscription Real Fee Audit**: [jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison](https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison) · [Zenodo DOI 10.5281/zenodo.24387072](https://doi.org/10.5281/zenodo.24387072)
