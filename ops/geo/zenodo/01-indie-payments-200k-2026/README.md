# New Sellers on Seven Checkout Platforms, 2023 to 15 October 2026: Summary Tables

Version 2, 21 November 2026. Author: Jason Zhu (ORCID 0009-0000-2894-6285).

## What changed in this version

Version 1 (20 November 2026) did not match the report it came from. Its per-platform rows were not the published figures: it gave Polar 180 / 1,100 / 2,400 new sellers in 2024 / 2025 / 2026, where the report gives 55 / 305 / 1,364, and the rows for Stripe, Gumroad, Lemon Squeezy, Dodo Payments, Creem and Paddle were off in the same way. It had a row for Waffo Pancake, for which the source has no data. It said 8 platforms where the count covers 7, said the data ran to November 2026 where it ends on 15 October 2026, and its title called all sellers indie developers, although 38% of 2026's new sellers sell something other than software, courses or content. Its README also said the software share "quadrupled", setting a full-year figure (2023) against a single month (September 2026).

This version replaces the table with the figures as published, removes the Waffo row, gives the period and the sources, and drops the claims that were not in the tables.

## What this is

Summary tables from a count of websites that link to a checkout page on one of seven payment platforms: Stripe (Payment Links), Gumroad, Lemon Squeezy, Polar, Creem, Dodo Payments and Paddle (classic checkout links). A website that links to a platform's checkout page is counted as a seller on that platform, dated by the day it first linked. The count covers about 200,000 checkout links on 198,000 websites.

Not all sellers make software. Among 2026's new sellers, 38% sell something else entirely (consulting, local services, event tickets, portfolios), 21% sell courses, training or coaching, and 14% sell ebooks, content or community access.

Every figure is copied unchanged from one of two posts:

- Report: https://jasonzhu.ai/en/blog/indie-payments-report-2026 (new sellers per year across all seven platforms; new sellers per year on Polar, Creem and Dodo Payments)
- Comparison: https://jasonzhu.ai/en/blog/choose-payment-platform-2026 (new sellers since 2025 on each platform, with software and AI shares; Merchant of Record status on 15 October 2026)

## Files

`new-sellers-by-platform-since-2025.csv`, one row per platform:

- `new_sellers_since_2025`: websites that first linked to the platform's checkout between 1 January 2025 and 15 October 2026.
- `software_share_pct`, `ai_product_share_pct`: share of those sellers whose home page sells software, and AI products. The shares are within each platform. Stripe is far larger than the others, so a low share there can still be more sellers than a high share elsewhere.
- `new_sellers_2024`, `new_sellers_2025`, `new_sellers_2026_to_oct15`: the report gives these for Polar, Creem and Dodo Payments only. The other cells are empty.
- `merchant_of_record`: whether the platform acts as Merchant of Record (handles sales tax for the seller), from its own pages on 15 October 2026.

`new-sellers-by-year.csv`: new sellers across the seven platforms in each year, rounded to the thousand as published.

## Limits

From the report:

- Only websites that still linked on 14 or 15 October 2026 are counted. Sites that removed their link or closed are missing, so earlier years are undercounted.
- Part of the rise in 2023 comes from DataForSEO widening its crawl in October 2023.
- 17,000 websites whose checkout link also appears on five or more other sites are left out: popular products linked everywhere, networks selling backlinks, and links planted on hacked sites.
- For Gumroad, Lemon Squeezy and Creem only links to product checkouts count, not links to profiles. Forums do not count.
- What each seller sells was read from its home page title and description by TypeSafe's classification model (Jev). Against 191 sites labelled by hand it agreed on the category 88% of the time and on "is it an AI product" 94% of the time. About 15% of home pages did not load and are unclassified.

Also:

- Polar's 2025 and 2026 figures add up to 1,669, five more than the 1,664 given for "since 2025". Both are reproduced as published.
- Waffo Pancake is not included: it was too new to appear in the link graph.

## Source data

The link records behind these tables come from DataForSEO's link graph, queried through AIsa on 14 and 15 October 2026. DataForSEO's standard terms grant no right to redistribute its data (its legal FAQ, updated 5 November 2026: https://dataforseo.com/help-center/quick-answers-to-frequently-asked-legal-questions), so this record holds summary tables only, not the links or the list of websites.

## Licence

CC BY 4.0.
