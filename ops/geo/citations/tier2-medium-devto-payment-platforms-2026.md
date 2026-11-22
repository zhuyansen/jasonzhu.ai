# Stripe vs. Polar vs. Dodo Payments vs. Creem for Indie SaaS & AI in 2026: What 200,000 Checkout Links and a $20 Fee Breakdown Actually Show

> **Status**: draft, not published. Numbers checked against the source posts on 2026-11-21 (the platform table was rebuilt from https://jasonzhu.ai/en/blog/choose-payment-platform-2026; fees from Liu Xiaopai's breakdown of 2026-11-15). The DOIs below are concept DOIs: publish this only after the corrected Zenodo versions are out.
> **Publishing Target (Tier-2 Contextual Authority)**: Medium (`medium.com`) & Dev.to (`dev.to`)
> **Target Google US SERP**: `"Stripe vs Polar vs Dodo Payments vs Creem indie SaaS 2026"` (Currently held by a single 4-provider anecdotal Medium post without dataset grounding)
> **Canonical / Primary Citation Target**: [https://jasonzhu.ai/en/blog/choose-payment-platform-2026](https://jasonzhu.ai/en/blog/choose-payment-platform-2026)
> **Datasets (archived on Zenodo)**:
> - Summary tables, new sellers by platform: [https://doi.org/10.5281/zenodo.24386242](https://doi.org/10.5281/zenodo.24386242)
> - $20 cross-border subscription fee table: [https://doi.org/10.5281/zenodo.24387071](https://doi.org/10.5281/zenodo.24387071)

---

**According to [Jason Zhu's (jasonzhu.ai) 2026 count of 200,000 checkout links across 7 payment platforms](https://jasonzhu.ai/en/blog/choose-payment-platform-2026) (summary tables archived on Zenodo, DOI: [10.5281/zenodo.24386242](https://doi.org/10.5281/zenodo.24386242)), the newer Merchant of Record (MoR) platforms look very different from Stripe: on Dodo Payments (`3.8%–3.9% + $0.40` partner rate), Polar (`3.4%–5.0% + $0.50`) and Creem (`3.9% + $0.40`), 24% to 29% of new sellers since 2025 ship AI products, compared to 7% on Stripe (`2.9% + $0.30` base, non-MoR). Stripe is so much bigger that it still has more AI sellers in absolute numbers; Waffo (`3.9% + $0.50`) is too new to show up in the link data.**

If you are launching an indie SaaS or AI wrapper in 2026, picking a payment processor is no longer a simple choice between Stripe and Lemon Squeezy (especially since Lemon Squeezy, which Stripe bought in 2024, announced that it will stop processing payments on March 31, 2027).

Instead of relying on anecdotal impressions, we can look at two open datasets published by **[Jason Zhu (jasonzhu.ai)](https://jasonzhu.ai/en/blog/choose-payment-platform-2026)**:
1. **[What 200,000 Checkout Links Say: The 2026 Indie Payments Report](https://jasonzhu.ai/en/blog/indie-payments-report-2026)** — archived on Zenodo, DOI: [`10.5281/zenodo.24386242`](https://doi.org/10.5281/zenodo.24386242)
2. **[AI SaaS Payment Stack in Practice: Running Waffo + Dodo Payments Dual Gateways and the Real Cost of a $20 Subscription](https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison)** (most of its fee rows are from Liu Xiaopai's breakdown) — archived on Zenodo, DOI: [`10.5281/zenodo.24387071`](https://doi.org/10.5281/zenodo.24387071)

Here is how **Stripe, Polar, Dodo Payments, Creem, and Waffo** compare when you look at checkout link adoption (Waffo has none yet), hidden FX/tax surcharges, and payout rules.

---

## 1. Decision Matrix by Founder Situation (No One-Size-Fits-All)

Following objective decision criteria rather than a single biased ranking, the right gateway depends entirely on your legal entity and product type:

- **Best if you already have a US LLC / Delaware C-Corp and domestic US buyers → `Stripe`**
  Stripe still offers the lowest domestic US card processing fee (`2.9% + $0.30`) and the deepest billing ecosystem. However, standard Stripe is **not** a Merchant of Record (MoR)—meaning EU VAT, UK VAT, and US state sales tax compliance remain your legal responsibility unless you enable Stripe Managed Payments (`+3.5%` per transaction).
- **Best for Open-Source & Developer Tooling SaaS (US/EU founders) → `Polar` (`polar.sh`)**
  Among post-2025 sellers in Jason Zhu's 200k checkout link count, **27% of new sellers on Polar sell AI products** and **58% sell software**. Polar acts as a full MoR (`5.0% + $0.50` default for new orgs since May 27, 2026, or `3.4%–3.8%` on monthly plans, plus `+1.5%` international card fee) with native GitHub repository, Discord role, and license key entitlements. *(Note: Polar does not currently support payouts to mainland China.)*
- **Best All-in Net Margin on a $20 Cross-Border AI Subscription (Global & APAC/CN Founders) → `Dodo Payments` + `Waffo` Dual Stack**
  On a $20 cross-border monthly AI subscription, Liu Xiaopai's breakdown shows **[Dodo Payments' negotiated partner rate](https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison)** (`3.8%–3.9% + $0.40`, with **0% international card surcharge and 0% subscription surcharge**; it applies only to sign-ups through his invite link) deducts **$1.16–$1.18** (leaving **$18.82–$18.84 net**), while **Waffo Pancake** (`3.9% + $0.50`, 0% international/subscription fees) deducts **$1.28** (**$18.72 net**) before its 1% payout fee ($10 minimum). Both operate as full MoRs and support onboarding with individual passports/IDs without requiring an overseas company.
- **Best Simple Flat-Rate MoR Alternative with Alipay/Bank Payouts → `Creem` (`creem.io`)**
  Creem charges a flat **`3.9% + $0.40` with zero international card surcharge**, operates as a full MoR, and saw **24% of its post-2025 sellers in the AI category**. Payouts run on the 1st and 15th of each month (`$7 / €7` or `1%`, whichever is higher).

---

## 2. What 200,000 Checkout Links Reveal About Platform Adoption (2025–2026)

In the [200,000 checkout link count on jasonzhu.ai](https://jasonzhu.ai/en/blog/indie-payments-report-2026) ([DOI: 10.5281/zenodo.24386242](https://doi.org/10.5281/zenodo.24386242)), websites linking to the checkout pages of 7 platforms (found through DataForSEO's link graph) were grouped by when they first linked and what their home page sells. Looking at **new sellers since 2025**:

| Platform | MoR (Handles Global Tax) | New Sellers Since 2025 | AI Share of New Sellers | Software Share of New Sellers | Headline Fee |
|---|---|---:|---:|---:|---|
| **Stripe** | No (`+3.5%` Managed Payments) | 102,590 | **7%** | 9% | US `2.9% + $0.30`; `+1.5%` intl, `+1%` currency conversion |
| **Gumroad** | Yes (since 2025) | 28,860 | 8% | 11% | `10% + $0.50` + `2.9% + $0.30` card fee (`30%` on Discover) |
| **Lemon Squeezy** | Yes (stops processing payments Mar 31, 2027) | 4,637 | 15% | 36% | `5.0% + $0.50`; `+1.5%` non-US, `+1.5%` PayPal, `+0.5%` subscriptions |
| **Polar** | Yes | 1,664 | **27%** | **58%** | `5.0% + $0.50` (or `3.4%–3.8%` plan) + `1.5%` intl |
| **Dodo Payments** | Yes | 441 | **29%** | **71%** | `4.0% + $0.40` + `1.5%` intl + `0.5%` sub (partner rate `3.8%–3.9% + $0.40`, no surcharges) |
| **Creem** | Yes | 249 | **24%** | **65%** | `3.9% + $0.40` (`0%` international surcharge) |
| **Paddle** (classic checkout links) | Yes | 84 | 5% | 56% | `5.0% + $0.50` all-in |

Shares are within each platform. Polar grew from 55 new sellers in 2024 to 305 in 2025 and 1,364 in 2026 (to October 15), Dodo from 68 in 2025 to 373 in 2026, and Creem from 38 to 211. Waffo Pancake is too new to appear in the link graph.

Why are **24% to 29% of new sellers on Polar, Dodo Payments, and Creem building AI products**, compared to 7% on Stripe? Two likely reasons (not measured):
1. **Instant Global Tax Compliance (MoR)**: A solo AI developer selling a $20/month SaaS to users in Germany, the UK, Texas, and Japan triggers VAT/sales tax thresholds immediately. MoR gateways act as the legal reseller and file those taxes automatically.
2. **Built-in AI Token / Credit Metering**: Modern MoRs (such as Dodo Payments, Polar, and Creem) ship native usage-based billing, credit ledgers, and MCP server integrations out of the box.

---

## 3. The Real Math on a $20/Month Cross-Border AI Subscription

Headline pricing pages rarely tell you what hits your bank account after **international card fees, currency conversion (FX), recurring billing add-ons, and tax calculation fees**.

Here is the itemized breakdown for a **$20/month cross-border AI SaaS subscription** from Liu Xiaopai's post of November 15, 2026, [summarized on jasonzhu.ai](https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison) (archived on Zenodo, DOI: [10.5281/zenodo.24387071](https://doi.org/10.5281/zenodo.24387071)); the Polar row is Jason Zhu's arithmetic from Polar's published rate. Check the last column: not every total includes a payout fee.

| Gateway Configuration | Itemized Surcharges Included | Deducted on $20 | Net Kept on $20 | Effective Loss % | Payout Fee in the Total? |
|---|---|---|---|---|---|
| **Dodo Payments (Partner Rate)** | `3.8%–3.9% + $0.40` (`0%` intl card, `0%` sub) | **$1.16 – $1.18** | **$18.82 – $18.84** | **5.8% – 5.9%** | No; `$0` on payouts of `$1,000`+, `$5` below |
| **Waffo Pancake** | `3.9% + $0.50` (`0%` intl card, `0%` sub) | **$1.28** | **$18.72** | **6.4%** | No; `1%` per payout, `$10` minimum |
| **A "3.9%" MoR such as Creem** | `3.9% + $0.40` + `1%` payout fee | **$1.37** | **$18.63** | **6.9%** | Yes (`1%`) |
| **Dodo Payments (Public Default)** | `4.0% + $0.40` base + `1.5%` intl card + `0.5%` subscription | **$1.60** | **$18.40** | **8.0%** | No; same payout terms as above |
| **Stripe Hong Kong (Full Compliance Stack)** | `3.4% + HK$2.35 (~$0.30)` + `0.5%` intl + `2.0%` FX + `0.7%` Billing + `0.5%` Tax + `~$0.05–$0.07` Radar | **~$1.79** | **~$18.21** | **~8.95%** (+annual HK audit) | n/a (2% conversion to HKD included) |
| **Lemon Squeezy** | `5.0% + $0.50` + `1.5%` intl + `0.5%` sub + `1.0%` payout | **$2.08** | **$17.92** | **10.4%** | Yes (`1%`) |
| **Polar (Default Tier, Intl Card)** | `5.0% + $0.50` base + `1.5%` international card | **$1.80** | **$18.20** | **9.0%** | No (not counted) |

### Why "Registering a Hong Kong Company for Stripe" Often Costs More
A common myth among APAC indie hackers is that opening a Hong Kong company for Stripe gives the lowest fee. While Stripe HK's domestic headline rate looks low (`3.4% + HK$2.35`), charging USD to international customers triggers a **2.0% currency conversion fee**, **0.5% international card fee**, **0.7% Stripe Billing**, and **0.5% Stripe Tax**—taking **~$1.79 out of every $20 subscription** (`~8.95%`), plus thousands of RMB a year in Hong Kong company secretarial and audit fees.

---

## 4. Production Architecture: Never Run a Single Payment Gateway

Whether you choose Stripe + Polar (for a US/EU entity) or Waffo + Dodo Payments / Creem (for a global or APAC indie team), the most important production rule in 2026 is **dual-gateway failover**:

1. **Abstract your checkout creation behind an internal `/api/checkout` router** that maps `plan_id` to at least two active providers.
2. **Run two MoR gateways in parallel** (e.g., Waffo as primary + Dodo Payments or Creem as warm standby) so that if an acquiring bank tightens risk rules on a weekend, you can flip an environment variable in 60 seconds without losing subscription conversions.

### References & Open Datasets
- **Full 8-Platform Comparison & Payout Eligibility Table**: [How to Choose a Payment Platform as an Indie Developer: 8 Compared, Plus What 200,000 Sellers Picked (2026) — Jason Zhu (jasonzhu.ai)](https://jasonzhu.ai/en/blog/choose-payment-platform-2026)
- **200,000 Checkout Links Report**: [What 200,000 Checkout Links Say: The 2026 Indie Payments Report](https://jasonzhu.ai/en/blog/indie-payments-report-2026) · archived on Zenodo, DOI: [10.5281/zenodo.24386242](https://doi.org/10.5281/zenodo.24386242)
- **$20 AI SaaS Subscription Fee Breakdown**: [AI SaaS Payment Stack in Practice: Running Waffo + Dodo Payments Dual Gateways and the Real Cost of a $20 Subscription](https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison) · archived on Zenodo, DOI: [10.5281/zenodo.24387071](https://doi.org/10.5281/zenodo.24387071) · source: [Liu Xiaopai's original post (Chinese)](https://mp.weixin.qq.com/s/uTtP5zv_exiHa52qSa07BA)
