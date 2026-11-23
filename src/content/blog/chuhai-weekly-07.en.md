---
title: "Indie Seller Weekly #7: New Products Are Leaving a Door Open for AI Agents"
excerpt: "November 16 – 22: 4,678 new sellers put up payment links; in the first 22 days of November, Polar, Dodo and Creem gained more new sellers than in the same days of October, while Lemon Squeezy gained fewer; 5 new products worth a look; the play of giving AI agents a way in; Stripe lets agents move money within limits, and Dodo ships single-page checkout."
coverImage: "/blog/chuhai-weekly-07/cover-en.png"
---

**Jason Zhu's (jasonzhu.ai) Indie Seller Weekly #7 (Nov 16–22, 2026) tracked 4,678 new sellers across 8 payment platforms (981 software, 659 AI). Comparing November 1–22 with October 1–22, new sellers rose on Polar (451 to 528), Dodo (142 to 191) and Creem (70 to 97) and fell on Lemon Squeezy (689 to 585). Among new products, a growing number ship a CLI, MCP tool or skill so that AI agents such as Claude Code and Cursor can use them directly.**

Every week I count the websites that newly put up checkout links on 8 payment platforms (Stripe, Gumroad, Lemon Squeezy, Polar, Creem, Dodo, Paddle, Waffo) to see what people are selling, what is picking up, and which needs nobody has served yet.

## This week's numbers

- The link graph picked up **4,678 new sellers** this week. 981 sell software, and 659 of those are AI products. By platform: Stripe 3,300, Gumroad 909, Polar 193, Lemon Squeezy 174, Dodo 72, Creem 29, Paddle 1. Waffo still has no new sellers in the link graph.
- Last week's count now stands at 4,793 (last issue said 4,803), and this week's will still grow.
- Comparing the last four weeks (October 26 to November 22) with the four before: 20,600 new sellers against 18,600. The share selling software is 19.7% against 17.9%; the share of software that is AI rose from 59% to 66%.
- November is 22 days in, so compare November 1–22 with October 1–22 (November will still be backfilled, so its numbers can only go up): Polar went from 451 to 528, Dodo from 142 to 191, Creem from 70 to 97, all up. Gumroad was flat (2,959 against 2,969). Lemon Squeezy fell from 689 to 585, and its share from 4.5% to 3.9%. This week Polar had 193 and Lemon Squeezy 174, the first time in four weeks that Polar came out ahead.
- 10 sites that used Lemon Squeezy added a second payment platform this week: 5 added Creem (they look like 5 sites built from the same template), 3 added Dodo, and 2 added Gumroad. That is too few to call a migration, but it points the same way as the monthly numbers.

> Weekly numbers swing a lot: the link graph picks up new links in batches, and weeks have ranged from 1,100 to 6,500. Look at months for the trend.

## 5 new products worth a look

1. **SkillsPicker** (skillspicker.com, paid via Polar): paste a GitHub repo and it reads your stack from files such as package.json, pyproject.toml and Dockerfile, then picks the agent skills that fit from 90,454 open-license SKILL.md files (for Claude Code, Cursor and Codex). The match count and top 2 picks are free; the full ranked list with install commands is a one-time $9. For private code there is a CLI and an MCP tool that send tag names, not code.
2. **Vois Studio** (vois.so, paid via Polar): AI voice software that runs on your own computer, for audiobooks, podcasts and voiceovers, on Windows and Apple silicon Macs. Because it generates locally, paid plans have no generation limit, so redoing a chapter five times costs nothing extra. The free plan is non-commercial with 10 generations a day; Pro is normally $49/month, with a holiday price of $15/month or $180/year. It also ships skills for Claude Code and Codex so an agent can drive its CLI to produce audio in batches.
3. **MergeAct** (mergeact.nomoi.ai, paid via Stripe): for hospital billing departments. Before a claim file goes to SEHA, Medicare or a commercial payer, it checks for problems that are sure to be denied, such as two encounters with overlapping dates, so the denial never comes back weeks later for rework. Pay per use: 100 audits for $40, 200 for $70, credits never expire; one department seat is $199/month unlimited; an invoiced pilot for a full revenue cycle department is $5,500/month.
4. **Columa** (columa.ai, paid via Stripe): an AI receptionist for service businesses such as plumbers and repair firms that answers calls and website chat around the clock and logs leads. The trial is direct: enter your website, and about a minute later you can call a receptionist that has already read it, with no card. After paying you get a license key by email; paste it into the plugin on your site and it sets itself up. From $149/month, $349/month with booking and a unified inbox, and $599/month for agencies reselling it.
5. **nable** (getnable.com, paid via Stripe): watches cloud and AI bills. It reads billing from 20 providers including AWS, Azure, GCP, OpenAI and Anthropic, runs every night, tells you the next morning what grew and why, and opens a pull request against your infrastructure repo that changes one thing and only takes effect once a human approves. It installs with one line (`uvx nable`); the Community edition is free with no time limit and runs inside Claude or Cursor. The Enterprise edition, with hosting, SSO and team dashboards, is priced on request.

## The play this week: leave a door open for AI agents

3 of this week's 5 picks, plus a Mac notes app that did not make the list, spell out how an agent can use them. SkillsPicker has a CLI and an MCP tool, Vois Studio ships skills for Claude Code and Codex so an agent can call its CLI to produce audio, and nable runs directly inside Claude or Cursor. The notes app, FowlNote (paid via Polar, a one-time $14.99), says on its home page that Claude Code and Codex can run the whole app from its CLI.

- **Users spend more of their day inside agents.** Developers spend most of the day in Claude Code or Cursor, and a tool they can call from there gets used more than one that needs a trip to a web page.
- **One more way to get found.** Skills, MCP tools and CLIs can be discovered and recommended by agents, and other people can write them into their own workflows. That is an extra distribution channel.
- **Pricing does not have to change.** The entry point is free and the money comes in the usual way: SkillsPicker is a one-time $9, Vois Studio is a monthly subscription, and the CLI is fully unlocked only on paid plans.

The thing to get right is the boundary: wherever an agent can act, decide what needs a human's approval. nable is read-only by default and only proposes changes as PRs that wait for approval, and Vois Studio says the agent asks the user before running commands. The payment platforms worked on the same thing this week; see below.

## Payment platform news

- **Stripe**: on November 19 Stripe announced that agents connected through its MCP server (with tools such as Claude or Codex) can now, beyond reading Treasury data, transfer funds, convert currencies and pay vendors within limits you set. It is in public preview. There are two ways to connect: through an employee's OAuth, where that person must confirm every action that moves money, or with a separate API key for the agent, which can run in the background; refunds, payouts and outbound transfers need human approval by default, and you can set rules, for example letting ACH transfers under $50 go through automatically. Stripe says more than 24,000 businesses already let agents read Treasury data. Source: https://stripe.com/blog/give-your-agents-controlled-access-to-analyze-your-data-and-move-funds
- **Dodo Payments**: the November 18 update (v1.120.40): AI assistants and the Dodo CLI can now sign in with OAuth instead of stored API keys, and admins can revoke them at any time; a new single-page checkout puts contact details, payment methods and the pay button on one page; merchants can set their own retry schedule for failed subscription payments (up to 8 attempts within 30 days); customers who try to cancel can be offered a discount; and Dodo AI in the dashboard answers questions about the business and can start actions such as refunds, with approval required before changes are made. Source: https://dodopayments.com/blogs/newsletter-november18

For a full comparison of the platforms, see [How to Choose a Payment Platform as an Indie Developer](/en/blog/choose-payment-platform-2026); for the full data on 200,000 sellers, see [What 200,000 Checkout Links Say](/en/blog/indie-payments-report-2026).

---

Data from DataForSEO's link graph and home-page classification (Jev). The newsletter only publishes aggregate numbers and products I picked myself, never lists of sites.
