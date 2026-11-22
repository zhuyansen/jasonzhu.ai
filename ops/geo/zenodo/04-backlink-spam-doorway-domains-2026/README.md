# Backlink Spam List: 581 Doorway Domains and Link Sellers with Public Evidence (Snapshot of 28 October 2026)

Version 2, 21 November 2026. Author: Jason Zhu (ORCID 0009-0000-2894-6285).

## What changed in this version

Version 1 was titled as a database of domains but held no domains. Its only file described three "patterns". One of them counted 17,000+ websites carrying a shared checkout link as abuse, although that group also includes popular products linked from many sites. The other two ("expired domain doorway farm" and "hacked CMS checkout injection", with their thresholds) had no source in the underlying work. This version replaces that file with the list itself: the 581 entries published at https://jasonzhu.ai/en/backlink-spam-list and https://github.com/zhuyansen/backlink-spam-list, each with its evidence.

## What this is

A list of domains that make or sell backlink spam, each with evidence anyone can check: a title shared with other listed sites, a redirect to the same storefront, a shared checkout link. Most entries are doorway domains, registered in bulk and redirecting to a few storefronts that sell backlinks. A tool's spam score is not evidence on its own, and a directory that sells followed listings but is otherwise a real site is not listed.

The doorway networks came to light while counting checkout links for https://jasonzhu.ai/en/blog/indie-payments-report-2026: one checkout link sitting on more than a hundred sites built from one template.

Snapshot: `list.csv` at commit d60e53a0552d1f60839abd44385283d9d76734d7 of https://github.com/zhuyansen/backlink-spam-list (28 October 2026), byte for byte. The live list can change: anyone can report a site or dispute an entry there.

## File

`backlink-spam-list.csv`, 581 rows, columns as in the source:

- `domain`
- `category`: `link-network` (one operator's sites, sharing a title, redirect, checkout link or analytics account with listed sites; 564 entries) or `link-seller` (selling links is its business; 17 entries)
- `family`: the network the entry belongs to (12 networks). 562 link-network entries and 9 link sellers (the networks' storefronts) carry a family; 8 standalone link sellers and 2 other entries do not
- `evidence`: what was found, in words
- `evidence_url`: where to check it
- `first_listed`: 2026-10-16 for 568 entries, 2026-10-28 for 13
- `last_checked`
- `status`: `listed` for every row
- `source`: `seed` for every row (the first batch)

## Licence

CC BY 4.0, as the list itself.
