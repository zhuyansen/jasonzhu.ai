---
coverImage: "/blog/indie-payments-report-2026/cover-en.png"
title: "What 200,000 Checkout Links Say: The 2026 Indie Payments Report"
excerpt: >-
  I counted about 200,000 sellers across seven payment platforms. 82,000 started
  selling in 2026 before mid-October, the share selling software has nearly
  tripled in two years, and AI sellers cluster on Dodo, Polar and Creem rather
  than Stripe.
---

If a website links to a checkout page (a Stripe Payment Link, a Gumroad product, or a Lemon Squeezy, Polar, Creem, Dodo Payments or Paddle checkout), I count it as selling through that platform. On that basis I counted every seller I could find: **about 200,000 sellers on 198,000 websites**. For each one I recorded the day it first linked to a checkout, then read its home page to see what it sells.

The short version:

- **More people start selling every year.** 21,000 new sellers in 2023, 29,000 in 2024, 56,000 in 2025, and 82,000 in 2026 up to October 15.
- **More of them sell software.** The share of new sellers selling software was 5% in 2023 and 8% in 2025; in September 2026 alone it reached 20%. AI products went from 2% to 12%.
- **AI sellers mostly don't pick Stripe.** Since 2025, 24–29% of new sellers on Dodo, Polar and Creem sell AI products, against 7–8% on Stripe and Gumroad.
- **One person often runs many sites.** Some ship a new single-purpose tool every week or two; others put the same tool on a separate domain for each language, industry or country.
- **Checkout links get abused.** 17,000 websites carry a checkout link that also appears on five or more other sites: a hit product linked everywhere, a network selling backlinks, or a gambling or adult product injected into hacked sites.

## 1. More people start selling every year

![New sellers per year](/blog/indie-payments-report-2026/new-sellers-by-year-en.png)

With two and a half months to go, 2026 is already almost half again as large as all of 2025. In August and September, more than 10,000 new sellers appeared each month.

Two caveats. First, only sites that **still link today** are counted; sites that removed their link or closed are missing, so the earlier years are undercounted. Second, part of the 2023 jump comes from DataForSEO widening its crawl in October 2023, not only from more sellers.

## 2. More of them sell software

![Share of new sellers selling software and AI products, by month](/blog/indie-payments-report-2026/software-share-by-month-en.png)

Throughout 2025 the share of new sellers selling software stayed between 6% and 8%. It started climbing in March 2026 and reached 20% in September: one new seller in five now sells software. AI products rose faster over the same period, from 5% to 12%.

Software is still not the bulk of what checkout links sell. Among 2026's new sellers, 38% sell something else entirely (consulting, local services, event tickets, portfolios), 21% sell courses, training or coaching, and 14% sell ebooks, content or community access.

## 3. AI sellers cluster on the newer payment platforms

![New sellers since 2025 on each platform](/blog/indie-payments-report-2026/platforms-ai-share-en.png)

Stripe has by far the most sellers (103,000 new since 2025), but only 9% of them sell software and 7% AI products. The newer platforms look nothing like that: 71% of Dodo's new sellers sell software and 29% AI products; Polar is at 58% and 27%, Creem at 65% and 24%.

They are also the ones growing fastest:

| Platform | New sellers in 2024 | 2025 | 2026 (to Oct 15) |
|---|---|---|---|
| Polar | 55 | 305 | 1,364 |
| Creem | 1 | 38 | 211 |
| Dodo Payments | 0 | 68 | 373 |

Two things set them apart. They act as Merchant of Record, handling sales tax worldwide for the seller (Stripe itself does not). And they accept sellers from more countries: Creem, Dodo and Waffo accept sellers in mainland China, which Stripe does not (Polar's payouts don't reach mainland China either). I compare their fees and terms in a separate post: [How to choose a payment platform as an indie developer](/en/blog/choose-payment-platform-2026).

## 4. One person, many sites

I read the home pages of about 17,000 software and AI sellers that started since 2025 and matched the analytics and ad accounts on them (AdSense, Google Analytics, Tag Manager, Clarity, the Meta pixel) and their checkout stores. Sites that share an account are most likely run by the same person. That gave 276 groups covering 666 sites, and four recurring patterns:

- **Product factories.** A new single-purpose tool every week or two, each on its own domain or a free Cloudflare Pages subdomain, all on one analytics account. One maker launched nine AI tools for small businesses between July and October; another launched seven "local-first tools your coding agent drives" between May and October.
- **One tool, one exact-match domain per language, paid for by AdSense.** A background remover, for instance, with a German, a Spanish and a Dutch site, each on the local words for "remove background".
- **One piece of software, one domain per industry**, such as a booking system sold separately for kennels, hotels and marinas.
- **One product, one domain per country**, such as .de, .fr, .es and .pl.

## 5. From registering a domain to selling: a median of 100 days

I took the 1,000 strongest of 2026's new AI sellers and looked up when their domains were registered. Only 198 were registered after July 2025; the rest are older sites that only started charging this year. For the new domains, the median time from registration to the first checkout link was 100 days.

## 6. The grey side of checkout links

17,000 websites carry a checkout link that also appears on five or more other sites. All of them are left out of the numbers above. They fall into three groups:

- **Hit products linked everywhere.** Blogs, reviews and directories link to a popular product's checkout. Several of the most-linked software products are Mac utilities made by indie developers.
- **Networks selling backlinks.** One checkout link sits on more than a hundred sites built from one template, all titled along the lines of "Backlink Checker" or "SEO Score Checker".
- **Links injected into hacked sites.** Gumroad links for gambling or adult products planted on the sites of schools, clinics and museums.

If you find a Gumroad or Stripe link on your own site that you don't recognise, check whether it was injected.

## How the data was gathered, and its limits

- **The sellers** come from DataForSEO's link graph (queried through AIsa on October 14–15, 2026): every site linking to the checkout pages of these seven platforms, and the day each site first linked. For Gumroad, Lemon Squeezy and Creem only links to product checkouts count, not links to profiles; forums don't count either, since anyone can post a link there.
- **What they sell** was read from each seller's home page title and description by Jev, TypeSafe's classification model. Against 191 sites I labelled by hand, it agreed on the seven categories 88% of the time and on "is it an AI product" 94% of the time. About 15% of sellers' home pages did not load and are unclassified.
- **Excluded:** sites sharing a checkout link with many others (networks and reposts), and the default text of site builders (a Notion page reading "A collaborative AI workspace" is not the seller describing itself).
- **Registration dates** come from whois and **visits** are estimates, both looked up through GoAnyAPI.
- **No lists published.** This report gives totals only, not the sites.
