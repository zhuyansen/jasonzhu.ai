#set document(
  title: "The Structural Shift from Payment Gateways to Merchant of Record Platforms Among Independent Software and AI Founders: Evidence from 200,000 Live Checkout Links and a $20 Cross-Border Subscription Fee Audit (2023–2026)",
  author: "Jason Zhu (Yansen Zhu)",
  keywords: ("Merchant of Record", "Indie SaaS", "Cross-Border Payments", "AI Monetization", "Stripe", "Polar", "Dodo Payments", "Creem", "Paddle", "Waffo"),
  date: datetime(year: 2026, month: 11, day: 21),
)

#set page(
  paper: "us-letter",
  margin: (top: 0.85in, bottom: 0.85in, left: 0.92in, right: 0.92in),
  header: context {
    if counter(page).get().first() > 1 [
      #set text(size: 8.5pt, fill: luma(100), style: "italic")
      Zhu (2026) — Independent Software & AI Founder Payment Infrastructure (2023–2026)
      #h(1fr)
      Working Paper
      #v(-4pt)
      #line(length: 100%, stroke: 0.4pt + luma(190))
    ]
  },
  footer: context {
    set text(size: 8.5pt, fill: luma(100))
    line(length: 100%, stroke: 0.4pt + luma(200))
    v(-4pt)
    [ORCID: 0009-0000-2894-6285 · Canonical Home: jasonzhu.ai/en]
    h(1fr)
    [Page #counter(page).display("1 of 1", both: true)]
  }
)

#set text(
  font: ("New Computer Modern", "Libertinus Serif", "Georgia", "Times New Roman"),
  size: 10pt,
  lang: "en",
)

#set par(justify: true, leading: 0.58em, spacing: 0.85em)
#set heading(numbering: "1.1.")
#show heading.where(level: 1): it => {
  v(1.0em, weak: true)
  set text(size: 12pt, weight: "bold")
  block(breakable: false, it)
  v(0.4em, weak: true)
}
#show heading.where(level: 2): it => {
  v(0.8em, weak: true)
  set text(size: 10.5pt, weight: "bold")
  block(breakable: false, it)
  v(0.3em, weak: true)
}

#show link: set text(fill: rgb("#1d4ed8"))

// Title Block
#align(center)[
  #set text(hyphenate: false)
  #text(size: 8.5pt, tracking: 0.08em, fill: luma(90), weight: "semibold")[
    EMPIRICAL WORKING PAPER · DIGITAL COMMERCE & FINTECH INFRASTRUCTURE
  ]
  #v(0.5em)
  #text(size: 16pt, weight: "bold")[
    The Structural Shift from Payment Gateways to Merchant of Record Platforms Among Independent Software and AI Founders
  ]
  #v(0.3em)
  #text(size: 11.5pt, style: "italic", fill: luma(60))[
    Evidence from 200,000 Live Checkout Links and a \$20 Cross-Border Subscription Fee Audit (2023–2026)
  ]
  #v(0.9em)
  #text(size: 11pt, weight: "semibold")[Jason Zhu (Yansen Zhu)] \
  #text(size: 9.5pt, fill: luma(70))[
    Founder & Independent Researcher, BRICKAI (GoSailGlobal LLC) / JasonZhu.AI \
    ORCID: #link("https://orcid.org/0009-0000-2894-6285")[0009-0000-2894-6285] ·
    Email: #link("mailto:hello@gosailglobal.com")[hello\@gosailglobal.com] ·
    Web: #link("https://jasonzhu.ai/en")[jasonzhu.ai/en]
  ]
  #v(0.4em)
  #text(size: 9pt, fill: luma(95))[
    Version 1.1 · November 21, 2026 (wording corrections to version 1.0; see the revision note) · Data:
    #link("https://doi.org/10.5281/zenodo.24386242")[10.5281/zenodo.24386242] &
    #link("https://doi.org/10.5281/zenodo.24387071")[10.5281/zenodo.24387071]
  ]
]

#v(0.6em)

// Abstract Box
#block(
  width: 100%,
  inset: (x: 14pt, y: 11pt),
  fill: luma(248),
  stroke: (top: 0.8pt + luma(140), bottom: 0.8pt + luma(140)),
)[
  #align(center)[#text(size: 10pt, weight: "bold", tracking: 0.05em)[ABSTRACT]]
  #v(0.35em)
  #set text(size: 9.6pt)
  #set par(leading: 0.56em)
  Independent software and artificial intelligence (AI) developers increasingly monetize global audiences from day one, yet empirical evidence on their payment infrastructure choices remains scarce. Using DataForSEO's link graph to count about 200,000 checkout links on 198,000 websites that link directly to hosted checkout pages on seven payment platforms (Stripe Payment Links, Gumroad, Lemon Squeezy, Polar, Dodo Payments, Creem, and classic Paddle links), combined with an itemized fee comparison for a \$20/month international AI SaaS subscription (most rows from Liu Xiaopai's published breakdown, including Waffo Pancake), this paper documents four patterns between 2023 and October 15, 2026. First, after setting aside 17,000 websites whose checkout link also appears on five or more other sites, the number of new sellers per year rose from 21,000 in 2023 and 29,000 in 2024 to 56,000 in 2025 and 82,000 through October 15, 2026 (more than 10,000 new sellers a month in August and September 2026), counting only websites that still linked in October 2026. Second, software's share of new checkout-link sellers broke out of a 6%–8% plateau throughout 2025 to reach 20% in September 2026, while AI products rose from 2% (2023) to 12% (September 2026). Third, AI products make up a far larger share of new sellers on the Merchant of Record (MoR) platforms Dodo Payments (29%), Polar (27%) and Creem (24%) than on Stripe (7%) or Gumroad (8%); because Stripe's seller base is far larger, it still has more AI sellers in absolute numbers. Fourth, on one \$20 international subscription with surcharges, currency conversion, recurring billing and tax handling included, several MoR setups keep more (\$18.82–\$18.84 on Dodo Payments' negotiated partner rate; \$18.72 on Waffo Pancake before its 1% payout fee; \$18.63 on a 3.9% MoR such as Creem after a 1% payout fee; \$18.50 on Paddle) than a Hong Kong Stripe stack with Billing, Tax and Radar (\$18.21, not an MoR) or Lemon Squeezy (\$17.92; it stops processing payments on March 31, 2027). We further document multi-site operator clustering (276 groups spanning 666 domains), a 100-day median from domain registration to first checkout link for newly registered AI domains, and the mix of popular products, link-selling networks and hacked sites among the 17,000 excluded websites. The summary tables are archived on Zenodo under CC-BY-4.0; the underlying link records are DataForSEO's and cannot be redistributed.
  #v(0.45em)
  #text(size: 9pt)[
    *Keywords:* Merchant of Record (MoR), Indie SaaS, Cross-Border Payments, AI Monetization, Payment Gateways, Digital Tax Compliance, Stripe, Polar, Dodo Payments, Creem, Paddle, Waffo. \
    *JEL Classification:* G23 (Non-bank Financial Institutions; Financial Instruments), L81 (Retail and Wholesale Trade; e-Commerce), L86 (Information and Internet Services; Computer Software), O33 (Technological Change: Choices and Consequences).
  ]
]

#text(size: 8.8pt, fill: luma(60))[*Revision note (version 1.1, 21 November 2026).* No counts, shares or fees were changed. Version 1.0 read the platform shares as AI founders preferring Merchant of Record platforms; the shares describe the mix of sellers within each platform, and Stripe still has more AI sellers in absolute numbers. Version 1.0 also set Waffo Pancake's total, which leaves out its 1% payout fee, beside totals that include one; dated the start of the 2026 rise in the AI share to late 2025; stated Paddle's undercount as a finding rather than an inference; presented Liu Xiaopai's published breakdown as the author's audit with field verification; and described the Zenodo archive as a CERN one. These are corrected.]

#v(0.5em)

= Introduction

Over the past three years, the declining marginal cost of building and deploying software—accelerated by foundation models and AI coding agents—has dramatically lowered the barrier to launching globally distributed micro-SaaS and AI applications. Unlike traditional venture-backed software firms that establish domestic corporate entities, acquire merchant accounts, and hire dedicated finance teams before expanding internationally, solo founders and small distributed teams routinely sell \$10–\$49 monthly subscriptions or usage credits to buyers in dozens of tax jurisdictions within weeks of initial code deployment.

For these independent builders, cross-border payment infrastructure represents the primary operational bottleneck. Two distinct architectural models compete to serve this segment:

+ *Payment Service Providers / Gateways* (exemplified by Stripe), which process card payments at low headline domestic rates (e.g., 2.9% + \$0.30 in the United States or 3.4% + HK\$2.35 in Hong Kong), while leaving the merchant legally responsible for global Value-Added Tax (VAT), Goods and Services Tax (GST), US economic-nexus sales tax registration, chargeback compliance, and local entity incorporation.
+ *Merchant of Record (MoR) Platforms* (exemplified by Paddle, Lemon Squeezy, Polar, Dodo Payments, Creem, Waffo Pancake, and Gumroad since 2025), which legally act as the reseller of record to the end buyer—calculating, collecting, and remitting indirect taxes worldwide while consolidating settlement and supporting individual sellers in emerging markets and mainland China where Stripe does not natively onboard merchants.

Despite heated practitioner debate—intensified by Stripe's acquisition of Lemon Squeezy in 2024, the general availability of Stripe Managed Payments in April 2026 (+3.5% surcharge), Polar's May 2026 pricing revision, and Lemon Squeezy's November 2026 announcement that it will sunset payment processing on March 31, 2027—virtually no large-scale empirical study has measured which platforms new online sellers *actually use*, nor compared true all-in unit economics across gateways and MoR providers on standardized cross-border orders.

This working paper addresses both gaps through two complementary empirical investigations:
- *Adoption count:* A count, from DataForSEO's link graph, of about 200,000 checkout links on 198,000 websites linking directly to hosted checkout endpoints on seven payment platforms between 2023 and October 15, 2026, paired with automated homepage product classification (validated against human annotation), analytics-ID clustering of multi-site operators, and WHOIS registration-to-monetization lag analysis.
- *Micro unit-economics audit:* A line-by-line cost decomposition of a standardized \$20/month international AI SaaS subscription across eight payment setups (including Stripe Hong Kong's full Billing + Tax + FX + Radar stack, Lemon Squeezy, Polar, Paddle, Creem, Waffo Pancake, Dodo Payments default pricing, and Dodo Payments negotiated partner pricing), based on official fee schedules read on October 15, 2026 and on Liu Xiaopai's published breakdown of November 15, 2026.

Our results show a clear difference in composition. Stripe has by far the most checkout-link sellers, mostly services, courses and content, while software and AI products make up a much larger share of sellers on the newer MoR platforms, which are also growing fastest. Turnkey global tax handling, onboarding outside Stripe's supported countries, and competitive all-in fees once cross-border add-ons are counted are plausible reasons; we do not measure them.

= Data Collection and Methodology

== Web-Scale Checkout-Link Census

To observe revealed payment platform adoption without relying on self-reported surveys or vendor marketing claims, we queried DataForSEO's backlink graph (accessed via AIsa on October 14–15, 2026) for every live root domain linking directly to hosted checkout URL patterns of seven payment platforms: Stripe Payment Links (`buy.stripe.com`), Gumroad product checkouts, Lemon Squeezy checkouts, Polar checkouts, Dodo Payments checkouts, Creem checkouts, and classic Paddle checkout links.

Several strict inclusion and hygiene filters were enforced prior to aggregation:
+ *Product checkout specificity:* For Gumroad, Lemon Squeezy, and Creem, only links pointing to specific product checkout endpoints were counted; generic creator profile pages and storefront directory pages were excluded.
+ *Platform/forum exclusion:* User-generated forums, Q&A boards, and social aggregators were excluded because any third party can post outbound checkout URLs there without operating the host domain.
+ *First-seen timestamping:* For every qualifying seller domain, we recorded the earliest date the link graph observed an outbound link to the checkout endpoint (`first_seen`) to construct annual and monthly seller-entry cohorts from January 2023 through October 15, 2026.
+ *Shared checkout links:* Any checkout URL appearing on five or more distinct root domains was set aside from the seller statistics. This filter identified 17,000 websites, described in Section 6.

== Automated Product Classification and Validation

To distinguish software and AI products from courses, ebooks, agencies, and local services, we fetched each seller's homepage title and meta description and classified every domain into seven mutually exclusive categories plus a binary `is_ai_product` indicator using TypeSafe's Jev classification model. Default boilerplate strings emitted by website builders (e.g., Notion's generic *"A collaborative AI workspace"* template text) were stripped prior to inference to prevent false-positive AI classifications. Approximately 15% of seller homepages failed to load at crawl time and are retained as unclassified in the denominator rather than dropped selectively.

To validate classification fidelity, the author manually labeled a stratified random sample of $N = 191$ seller homepages across all seven platforms without inspecting model predictions. Inter-rater agreement between human labels and model inference reached:
- *88.0%* exact agreement across the seven product categories; and
- *94.0%* exact agreement on the binary `is_ai_product` indicator.

== Multi-Site Operator Clustering and Monetization Lag

To examine whether the 2026 surge reflects unique first-time founders or serial "product-factory" operators running portfolios of micro-sites, we parsed the HTML source of roughly 17,000 software and AI seller homepages launched since January 2025. We extracted third-party tracking identifiers—specifically Google AdSense publisher IDs, Google Analytics (`G-` / `UA-`), Google Tag Manager (`GTM-`), Microsoft Clarity, Meta Pixel IDs, and shared checkout store identifiers—and constructed connected components of domains sharing at least one non-generic identifier.

Separately, to measure time-to-monetization, we selected the top 1,000 strongest new AI sellers of 2026 (ranked by estimated traffic from GoAnyAPI) and retrieved WHOIS domain creation dates. Monetization lag for newly registered domains (created after July 2025) is defined as:

$ Delta t_i = t_i^("first_checkout") - t_i^("whois_reg") $

== Standardized \$20 Cross-Border Subscription Fee Decomposition

Headline processor fees frequently obscure the true cost of cross-border SaaS monetization. To compare platforms on an apples-to-apples basis, we modeled a recurring monthly AI SaaS order of face value $P = \$20.00$ USD paid by an international cardholder (non-domestic issuer) where the seller requires automated recurring billing, sales tax compliance, and fraud screening. For each payment stack $j$, total effective deduction $F_j(P)$ and net merchant take-home $N_j(P)$ are decomposed as:

$ F_j(P) = P dot (r_("base",j) + r_("intl",j) + r_("sub",j) + r_("fx",j) + r_("tax",j) + r_("payout",j)) + c_("fixed",j) + c_("radar",j) $
$ N_j(P) = P - F_j(P) $

where $r_("base",j)$ and $c_("fixed",j)$ represent base processing rates and fixed per-transaction fees; $r_("intl",j)$ captures international card surcharges; $r_("sub",j)$ denotes recurring billing add-ons (such as Stripe Billing at 0.7% or Lemon Squeezy/Dodo default subscription fees at 0.5%); $r_("fx",j)$ captures mandatory currency conversion (e.g., Stripe Hong Kong's 2.0% USD-to-HKD conversion); $r_("tax",j)$ captures automated tax modules (e.g., Stripe Tax at 0.5%, whereas MoRs embed tax inside $r_("base",j)$); $r_("payout",j)$ captures percentage withdrawal charges (or amortized flat payout fees); and $c_("radar",j)$ captures fraud screening fees. Official pricing pages were read on October 15, 2026. The Dodo Payments partner rate and the \$20 breakdowns for Dodo Payments, Waffo Pancake, Stripe Hong Kong, Lemon Squeezy and other "3.9%" MoR platforms come from Liu Xiaopai's post of November 15, 2026; the Paddle and Polar rows are the author's arithmetic from their published rates.

= Macro Adoption Findings: The 2026 Inflection

== Accelerating Annual Cohorts of Independent Sellers

Counting only websites that still linked in October 2026, the number of new sellers linking directly to checkout endpoints rose every year from 2023 to 2026:
- *2023:* 21,000 new sellers
- *2024:* 29,000 new sellers (+38.1% YoY)
- *2025:* 56,000 new sellers (+93.1% YoY)
- *2026 (Jan 1 – Oct 15 only):* 82,000 new sellers (+46.4% above *all* of 2025 with 2.5 months remaining)

In both August and September 2026, monthly cohort additions exceeded 10,000 new monetizing domains. Figure 1 illustrates this multi-year expansion.

#figure(
  image("/public/blog/indie-payments-report-2026/new-sellers-by-year-en.png", width: 76%),
  caption: [New sellers per year: websites first linking directly to a checkout page (2023 through October 15, 2026; the 17,000 websites sharing a checkout link with five or more others are excluded). Source: author's count from DataForSEO's link graph; summary tables at DOI 10.5281/zenodo.24386242.],
) <fig-yearly>

Two methodological caveats apply to the temporal slope. First, the census measures *surviving* live links as of October 2026; defunct projects from 2023–2024 that removed checkout links or let domains expire are unobserved, creating modest survivorship bias that understates earlier cohorts. Second, part of the step-up in late 2023 coincides with DataForSEO expanding its crawl breadth in October 2023. Neither caveat obviously accounts for the rise within 2026, though changes in DataForSEO's crawl cannot be ruled out.

== Software and AI Breakout in 2026

A striking compositional shift occurred inside the 2026 seller cohorts. Throughout all twelve months of 2025, software products remained flat at *6% to 8%* of newly monetizing checkout-link domains (up only modestly from 5% in 2023). Starting in March 2026, software's share rose rapidly every month, reaching *20% in September 2026*—meaning one in every five newly monetizing checkout-link sites now sells software. AI products went from *2% in 2023* to *12% in September 2026*; over the 2026 rise alone they climbed from about 5% to 12% (Figure 2).

#figure(
  image("/public/blog/indie-payments-report-2026/software-share-by-month-en.png", width: 76%),
  caption: [Monthly share of newly observed checkout-link sellers offering software products and AI-native products (2023–September 2026). Software broke out from a 6%–8% plateau in March 2026 to 20% by September 2026.],
) <fig-monthly-share>

Despite this surge, software is still not the majority category across hosted checkout links overall. Among all 2026 new sellers, *38%* sell non-digital or heterogeneous services (consulting, local businesses, event tickets, agency retainers), *21%* sell courses, coaching, or training programs, and *14%* sell ebooks, templates, or paid community memberships.

== Platform Stratification: AI Founders Cluster on MoR Providers

Splitting the sellers since 2025 by platform shows a sharp difference in composition between general-purpose processors and developer-focused Merchant of Record platforms (Table 1 and Figure 3).

#figure(
  table(
    columns: (1.5fr, 0.9fr, 0.8fr, 0.8fr, 1.3fr),
    align: (left, right, right, right, left),
    stroke: none,
    table.hline(stroke: 1pt),
    table.header(
      [*Platform*], [*New Sellers (2025+)*], [*Software Share*], [*AI Share*], [*2024 → 2025 → 2026 (to Oct 15)*]
    ),
    table.hline(stroke: 0.5pt),
    [Stripe (Payment Links)], [102,590], [9%], [7%], [Dominant base (mostly local/services)],
    [Gumroad], [28,860], [11%], [8%], [Primarily ebooks, templates, courses],
    [Lemon Squeezy], [4,637], [36%], [15%], [Sunsetting payments Mar 31, 2027],
    [Polar], [1,664], [58%], [27%], [55 → 305 → 1,364 (+347% vs '25)],
    [Dodo Payments], [441], [71%], [29%], [0 → 68 → 373 (+449% vs '25)],
    [Creem], [249], [65%], [24%], [1 → 38 → 211 (+455% vs '25)],
    [Paddle (classic links)\*], [84], [56%], [5%], [Probably undercounted\*],
    table.hline(stroke: 1pt),
  ),
  caption: [New sellers since January 2025 by platform (`first_seen >= 2025-01-01`). Shares are within each platform. Polar's 2025 and 2026 figures add up to 1,669 against 1,664 since 2025; both are as published. \*Only classic Paddle checkout links are counted; sellers who open Paddle's checkout from a script rather than a link are missed, so Paddle is probably undercounted (not measured). Waffo Pancake is too new to appear in the link graph.],
) <tab-platforms>

#figure(
  image("/public/blog/indie-payments-report-2026/platforms-ai-share-en.png", width: 76%),
  caption: [Share of new sellers since 2025 selling software and AI products, by platform. The AI share on Dodo Payments, Polar and Creem is three to four times Stripe's.],
) <fig-platform-ai>

The contrast in composition is large. While Stripe added 102,590 new checkout-link sellers since 2025, only *9%* sell software and *7%* sell AI products. Conversely, *71%* of Dodo Payments' new sellers, *65%* of Creem's, and *58%* of Polar's sell software—with AI products accounting for *29%*, *24%*, and *27%* of their respective cohorts. These platforms are also growing fastest: between full-year 2025 and mid-October 2026 alone, annual cohort additions multiplied by *4.5×* on Polar (305 to 1,364), *5.5×* on Dodo Payments (68 to 373), and *5.6×* on Creem (38 to 211). Because Stripe's base is so much larger, it still accounts for more new AI sellers in absolute numbers than the three MoR platforms combined: the difference is in composition, not in where most AI sellers are.

Two mechanisms plausibly contribute (we do not measure them):
+ *Turnkey global indirect tax compliance:* Selling AI tools globally triggers immediate VAT/GST registration obligations in the EU, UK, Australia, Japan, and dozens of US states. Standard Stripe is *not* an MoR; merchants who want Stripe to absorb tax liability must enroll in Stripe Managed Payments (generally available since April 2026) at an incremental *+3.5%* surcharge on top of card processing fees.
+ *Geographic onboarding:* Builders in countries Stripe does not support, mainland China among them, cannot open a Stripe account directly (we did not measure where sellers are based). Dodo Payments, Creem, and Waffo Pancake onboard mainland Chinese individuals via national ID or passport and settle directly to local bank accounts or Alipay, eliminating the legal cost and annual audit burden of incorporating a Hong Kong company or US LLC before achieving product-market fit.

= Multi-Site Operators and Time-to-Monetization

== Portfolio "Product Factories" and Domain Matrices

Inspecting shared analytics and ad-network identifiers across ~17,000 software and AI seller homepages launched since 2025 uncovered *276 distinct multi-site operator clusters spanning 666 domains*. Qualitative review of these clusters identifies four repeatable indie monetization archetypes:

+ *Rapid single-purpose product factories:* One operator shipping a focused AI micro-tool every 1–2 weeks—each deployed on its own root domain or free Cloudflare Pages subdomain under one unified analytics property. In our sample, one solo builder launched nine small-business AI utilities between July and October 2026; another shipped seven local-first coding-agent tools between May and October 2026.
+ *Multilingual exact-match SEO matrices:* A single core utility (e.g., an image background remover) replicated across separate exact-match domains in German, Spanish, and Dutch, monetized via hybrid Google AdSense and direct checkout upsells.
+ *Vertical industry clones:* One underlying SaaS engine packaged onto separate domain brands per niche vertical (for example, identical reservation software marketed separately to kennels, boutique hotels, and marinas).
+ *Country-code ccTLD localization:* Identical software deployed across `.de`, `.fr`, `.es`, and `.pl` domains to capture local search intent and regional pricing.

== Median 100-Day Lag from Domain Registration to First Checkout

Among the 1,000 strongest new AI sellers of 2026 (by estimated traffic), *802 domains (80.2%)* were registered *prior* to July 2025—indicating that the majority of high-traffic 2026 AI monetizers either repurposed existing content/tool sites or transitioned free traffic assets into paid tiers rather than starting from zero domain authority. Among the remaining *198 genuinely brand-new domains* registered after July 2025, the median interval from WHOIS registration date to first observed live checkout link was exactly *100 days* (roughly 3.3 months), reflecting typical cycles of MVP construction, SEO/community seeding, and payment gateway approval.

= Unit Economics: Itemized Audit of a \$20 Cross-Border AI SaaS Subscription

With Lemon Squeezy formally announcing the sunset of its payment processing on March 31, 2027 (steering merchants toward Stripe Managed Payments) and Polar raising default new-organization fees to 5.0% + \$0.50 (+1.5% international) in May 2026, founders face concrete margin decisions.

Table 2 compares all eight major platforms on headline terms, MoR status, and geographic payout support as verified on October 15, 2026. Table 3 then applies Equation (1) to compute the dollar deductions and net take-home on a standardized *\$20.00 international recurring AI SaaS subscription*.

#figure(
  table(
    columns: (1.2fr, 1.8fr, 0.7fr, 1.0fr, 1.1fr),
    align: (left, left, center, left, left),
    stroke: none,
    table.hline(stroke: 1pt),
    table.header(
      [*Platform*], [*Official Fee Structure (Oct 2026)*], [*MoR*], [*Mainland CN*], [*Notable Payout / Terms*]
    ),
    table.hline(stroke: 0.5pt),
    [Stripe (US / HK)], [US 2.9%+\$0.30; HK 3.4%+HK\$2.35; +intl, +FX, +0.7% Billing, +0.5% Tax], [No\*], [Not supported], [Managed Payments adds +3.5%; HK requires company + audit],
    [Dodo Payments], [Default 4%+\$0.40 (+1.5% intl, +0.5% sub); Partner 3.8–3.9%+\$0.40 all-in], [Yes], [Yes (ID/Bank)], [\$0 payout fee if ≥\$1,000 (\$5 under \$1k); WeChat Pay native],
    [Waffo Pancake], [3.9% + \$0.50 (0% intl, 0% sub)], [Yes], [Yes (Alipay/Bank)], [~10 business-day hold; 1% payout fee (\$10 min)],
    [Creem], [3.9% + \$0.40 (0% intl)], [Yes], [Yes (Alipay/Bank)], [Payout 1% or \$7/€7 min (1st & 15th); Alipay ≤CNY 50k],
    [Paddle], [5.0% + \$0.50 all-in], [Yes], [Yes], [Established B2B MoR; FTC \$5M settlement in June 2025],
    [Polar], [5.0% + \$0.50 (+1.5% intl) since May 27, 2026; or monthly plans 3.4–3.8%], [Yes], [Payouts unsupported], [7-day reserve for orgs created post-May 12, 2026],
    [Lemon Squeezy], [5.0% + \$0.50 (+1.5% non-US, +0.5% sub, +1% payout)], [Yes], [PayPal only], [Sunsetting payment processing March 31, 2027],
    [Gumroad], [10% + \$0.50 + card fee (2.9%+\$0.30); 30% on Discover], [Yes], [PayPal only], [Built-in creator storefront; highest take-rate],
    table.hline(stroke: 1pt),
  ),
  caption: [Comparison of fee schedules, Merchant of Record (MoR) coverage, and mainland China onboarding across eight payment platforms (verified October 15, 2026, updated with November 2026 Lemon Squeezy sunset notice). \*Stripe is non-MoR by default.],
) <tab-eight-platforms>

#figure(
  table(
    columns: (1.45fr, 1.95fr, 0.85fr, 0.85fr, 0.6fr),
    align: (left, left, right, right, center),
    stroke: none,
    table.hline(stroke: 1pt),
    table.header(
      [*Payment Setup*], [*Itemized Fee Components on \$20 Order*], [*Taken*], [*Net Kept*], [*MoR*]
    ),
    table.hline(stroke: 0.5pt),
    [*Dodo Payments (Partner)*], [3.8%–3.9% + \$0.40; 0% intl, 0% sub; \$0 payout (≥\$1k)], [*\$1.16–\$1.18*], [*\$18.82–\$18.84*], [Yes],
    [*Waffo Pancake*], [3.9% + \$0.50; 0% intl, 0% sub (before 1% payout fee)], [*\$1.28*], [*\$18.72*], [Yes],
    [3.9% MoR, e.g. Creem], [3.9% + \$0.40 + 1.0% payout fee], [\$1.37], [\$18.63], [Yes],
    [Paddle (All-In)], [5.0% + \$0.50 all-in (0% intl/sub surcharge)], [\$1.50], [\$18.50], [Yes],
    [Dodo Payments (Default)], [4.0% + \$0.40 + 1.5% intl + 0.5% sub], [\$1.60], [\$18.40], [Yes],
    [Stripe HK (Full Stack)], [3.4%+\$0.30 + 0.5% intl + 2.0% FX + 0.7% Billing + 0.5% Tax + Radar], [~\$1.79], [~\$18.21], [No],
    [Polar (Post-May 2026)], [5.0% + \$0.50 + 1.5% international card fee], [\$1.80], [\$18.20], [Yes],
    [Lemon Squeezy (Legacy)], [5.0% + \$0.50 + 1.5% intl + 0.5% sub + 1.0% payout], [\$2.08], [\$17.92], [Yes],
    table.hline(stroke: 1pt),
  ),
  caption: [Fees on a \$20.00 international monthly AI SaaS subscription. The Dodo Payments, Waffo Pancake, 3.9% MoR, Stripe Hong Kong and Lemon Squeezy rows are from Liu Xiaopai's post of November 15, 2026 (his 3.9% row names no platform; Creem's published terms give the same \$1.37); Paddle and Polar are the author's arithmetic from rates read on October 15, 2026, without payout fees. Waffo's total leaves out its 1% payout fee; the 3.9% MoR and Lemon Squeezy totals include one. Summary table: DOI 10.5281/zenodo.24387071.],
) <tab-20usd-audit>

== The "Hong Kong Stripe Illusion" and Dual-Gateway Failover

A widespread assumption among Asian indie founders is that incorporating a Hong Kong limited company to run Stripe produces the lowest processing cost. Table 3 demonstrates why this assumption breaks down for cross-border USD AI subscriptions: once Stripe Hong Kong's *2.0% USD-to-HKD currency conversion fee*, *0.5% international card fee*, *0.7% Stripe Billing fee*, *0.5% Stripe Tax fee*, and Radar fraud screening (~\$0.05–\$0.07) are summed, total deductions reach *~\$1.79 per \$20 charge (~9.0% effective take-rate)*—yielding only *~\$18.21 net*, *before* factoring in thousands of RMB per year in Hong Kong secretarial and statutory audit expenses, and *still* leaving global sales-tax remittance liability with the founder.

By contrast, negotiated MoR partner pricing (such as Dodo Payments' partner tier at `3.8%–3.9% + $0.40` with zero international/subscription surcharges and \$0 payout fees above \$1,000) retains *\$18.82–\$18.84* per \$20 order—saving *\$0.61 per transaction* relative to Hong Kong Stripe while absorbing global VAT/GST compliance and natively supporting WeChat Pay and 40+ local payment methods settled in USD.

Finally, Liu Xiaopai recommends *multi-gateway redundancy*: because cross-border acquirers can impose abrupt risk reviews or reserve holds, he runs checkout behind a provider-agnostic adapter with *two MoR gateways in parallel* (Waffo Pancake and Dodo Payments), so that payments can be switched to the other gateway in minutes without halting paid acquisition.

= The Grey Market of Checkout Links: Abuse and Link-Selling Networks

During cleaning, we set aside *17,000 websites* whose checkout link also appeared on five or more other domains. They fall into three groups:

+ *Viral product syndication:* Legitimate hit products (frequently macOS developer utilities) whose checkout URLs are linked organically across blogs, review roundups, and software directories.
+ *Backlink-selling doorway networks:* One checkout URL embedded across more than 100 template-cloned domains bearing generic SEO tool titles (such as "Backlink Checker" or "SEO Score Checker"). A separate public list documents 581 doorway and link-selling domains with their evidence (shared titles, redirects, checkout links): jasonzhu.ai/en/backlink-spam-list, archived on Zenodo (DOI: #link("https://doi.org/10.5281/zenodo.24387075")[10.5281/zenodo.24387075]).
+ *Links injected into hacked sites:* Gumroad links for gambling or adult products planted on the websites of schools, clinics and museums.

For researchers counting payment platform adoption from web crawls, leaving shared checkout links in would count one link many times over. For website administrators, periodic audits of outbound `buy.stripe.com` and `gumroad.com` links provide an inexpensive early-warning indicator of CMS compromise.

= Limitations and Threats to Validity

Four limitations bound the interpretation of our census:
+ *Overlay and API checkout undercounting:* Platforms whose default integration relies on client-side JavaScript overlays or server-side checkout sessions (most notably Paddle and custom Stripe Checkout API implementations) are underrepresented relative to hosted static Payment Links. Our platform counts therefore measure *direct-link adoption* rather than total gross merchandise volume (GMV).
+ *Survivorship bias in historical cohorts:* Because the link graph was queried in October 2026, early sellers from 2023–2024 that shut down or migrated URLs before October 2026 are absent from the count.
+ *Unclassified homepages:* Roughly 15% of seller domains returned HTTP errors, geo-blocks, or blank SPAs at crawl time and remain unclassified.
+ *Dynamic fee schedules:* MoR pricing is actively contested (evidenced by Polar's May 2026 adjustment, Lemon Squeezy's November 2026 sunset announcement, and negotiated partner rates). Fee comparisons are a snapshot of October–November 2026; check each platform's current pricing.

= Conclusion and Data Availability

Between 2023 and October 2026 the number of new sellers linking to checkout pages nearly quadrupled, software's share of new sellers reached 20% in September 2026 (AI products 12%), and software and AI products came to make up a much larger share of sellers on the newer Merchant of Record platforms than on Stripe, though Stripe still has more AI sellers in absolute numbers. On one \$20 international subscription with all surcharges counted, several MoR setups kept more than a Hong Kong Stripe stack while also handling sales tax. Fees change, and each seller should check them at its own price point.

#v(0.4em)
*Open Data & Replication Artifacts (CC-BY-4.0):*
- *Summary tables, new sellers by platform and year (Zenodo):* #link("https://doi.org/10.5281/zenodo.24386242")[https://doi.org/10.5281/zenodo.24386242]
- *\$20 subscription fee table (Zenodo):* #link("https://doi.org/10.5281/zenodo.24387071")[https://doi.org/10.5281/zenodo.24387071]
- *GitHub Open CSV Repository:* #link("https://github.com/zhuyansen/indie-saas-payments-benchmark-2026")[https://github.com/zhuyansen/indie-saas-payments-benchmark-2026]
- *Hugging Face Dataset Mirror:* #link("https://huggingface.co/datasets/jasonzhuyansen/indie-saas-payments-benchmark-2026")[https://huggingface.co/datasets/jasonzhuyansen/indie-saas-payments-benchmark-2026]
- *Kaggle Dataset Mirror:* #link("https://www.kaggle.com/datasets/yansenzhu/indie-saas-payments-benchmark-2026")[https://www.kaggle.com/datasets/yansenzhu/indie-saas-payments-benchmark-2026]
- *Interactive Calculator & Live Companion Reports:* #link("https://jasonzhu.ai/en/blog/indie-payments-report-2026")[https://jasonzhu.ai/en/blog/indie-payments-report-2026] and #link("https://jasonzhu.ai/en/go-global/payments")[https://jasonzhu.ai/en/go-global/payments]
- *Author Persistent Identifiers:* ORCID #link("https://orcid.org/0009-0000-2894-6285")[0009-0000-2894-6285] · Google Scholar #link("https://scholar.google.com/citations?user=AlP5JacAAAAJ")[AlP5JacAAAAJ]

#set heading(numbering: none)
= References

#set text(size: 9.2pt)
#set par(hanging-indent: 1.5em, leading: 0.55em, spacing: 0.55em)

Creem. (2026). *Merchant of Record Pricing, Payouts, and Supported Countries Documentation*. Accessed October 15, 2026. https://docs.creem.io/merchant-of-record/finance/payouts

Dodo Payments. (2026). *Global Pricing, Accepted Countries and Territories, and Partner Program*. Accessed October 15, 2026. https://dodopayments.com/pricing

Gumroad. (2026). *Gumroad's Fees and Getting Paid Help Center*. Accessed October 15, 2026. https://gumroad.com/help/article/66-gumroads-fees

Lemon Squeezy. (2026a). *Pricing, Fees, and 2026 Platform Update*. Accessed October 15, 2026. https://docs.lemonsqueezy.com/help/getting-started/fees

Lemon Squeezy. (2026b). *Payment Processing Sunset Notice (Effective March 31, 2027) and Migration to Stripe Managed Payments*. November 2026.

Liu, X. (2026, November 15). [WeChat post, in Chinese, on negotiating a Dodo Payments partner rate and running Waffo and Dodo Payments together]. https://mp.weixin.qq.com/s/uTtP5zv_exiHa52qSa07BA

Paddle. (2026). *All-In Merchant of Record Pricing and Supported Countries*. Accessed October 15, 2026. https://www.paddle.com/pricing

Polar. (2026). *Merchant of Record Pricing Schedule and Supported Countries (Post-May 2026 Revision)*. Accessed October 15, 2026. https://polar.sh/resources/pricing

Stripe. (2026). *Stripe Hong Kong Pricing, Global Supported Countries, Stripe Billing, Stripe Tax, and Stripe Managed Payments*. Accessed October 15, 2026. https://stripe.com/en-hk/pricing and https://stripe.com/managed-payments

U.S. Federal Trade Commission. (2025). *FTC Settlement Order with Paddle Regarding Tech-Support Merchant Processing (\$5 Million Penalty)*. June 2025.

Waffo. (2026). *Waffo Pancake Merchant of Record Fee Schedule and Supported Payout Countries*. Accessed October 15, 2026. https://docs.waffo.ai/mor/fees

Zhu, J. (2026a). *New Sellers on Seven Checkout Platforms, 2023 to 15 October 2026: Summary Tables* (Version 2) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.24386242

Zhu, J. (2026b). *Fees Taken from a \$20 Cross-Border Subscription, Itemized for Eight Payment Setups (November 2026)* (Version 2) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.24387071

Zhu, J. (2026c). *Backlink Spam List: 581 Doorway Domains and Link Sellers with Public Evidence (Snapshot of 28 October 2026)* (Version 2) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.24387075
