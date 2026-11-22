# Security-Grade Coverage in the Agent Skills Hub Catalog: June 2026 Snapshot (105,000+ Entries) and November 2026 Count

Version 2, 21 November 2026. Author: Jason Zhu (ORCID 0009-0000-2894-6285), who founded Agent Skills Hub.

## What changed in this version

Version 1 gave "105,000+ indexed skills" and "97.8% never security-audited" without a date, so they read as a description of the catalog today. They describe the catalog around 10 June 2026, when the original post was written. On 21 November 2026 the catalog listed 281,000+ entries, 142,000+ of them with a rule-based security grade, so the June share no longer holds. This version dates the June figures and adds the November count as a separate row.

Version 1 also called the 2,300+ graded entries a "5-dimension supply-chain audit". They were the entries that had a security grade in the catalog at the time. The five dimensions are the checklist the author used to review 200+ repositories by hand; this record does not cover that review. Version 1's counts per group (102,690 / 2,171 / 129) had been worked back from the rounded percentages and are removed. The table now gives the shares as published.

## What this is

Agent Skills Hub (https://agentskillshub.top) indexes open-source AI agent skills, MCP servers and Codex skills from GitHub and gives some of them a security grade: safe, caution, unsafe or reject. The table has two dates.

- **Around 10 June 2026.** The catalog held 105,000+ entries. 97.8% had no security grade ("unknown"), 2.1% were graded safe and 0.1% caution, unsafe or reject. Of the 2,300+ entries with a grade, 94% were safe and about 5.6% caution, unsafe or reject. Source: https://jasonzhu.ai/en/blog/agent-skill-security-audit-200, dated 10 June 2026. The figures were read from the catalog database for that post; the exact time was not recorded, and the Hub's own notes of 13 June 2026 give the same 97.8%.
- **21 November 2026.** The catalog listed 281,000+ entries, 142,000+ of them with a rule-based security grade. Source: https://agentskillshub.top/llms.txt, read on 21 November 2026.

The share of graded entries rose sharply between the two dates because the Hub extended its grading, so the two rows are not a trend in the ecosystem itself. Shares are as published and rounded: 94% and about 5.6% do not add up to 100.

## File

`agent-skills-hub-security-grade-coverage.csv`:

- `snapshot_date`: 2026-06-10 is the date of the original post; the reading was made around then.
- `catalog_entries_at_least`, `entries_at_least`: lower bounds as published ("105,000+", "2,300+", "281,000+", "142,000+").
- `share_of_catalog_pct`, `share_of_graded_pct`: shares as published.

## Related

Per-entry grades for 130,173 entries (snapshot of 6 July 2026, graded by the Hub's published rules) are in a separate dataset: https://doi.org/10.5281/zenodo.21292799. The rules are described at https://agentskillshub.top/how-we-grade/.

## Licence

CC BY 4.0.
