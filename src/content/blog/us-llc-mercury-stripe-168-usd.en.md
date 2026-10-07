---
coverImage: "/blog/us-llc-mercury-stripe-168-usd/cover-en.png"
title: >-
  Getting Paid Internationally for $168: Hands-On Notes on a US LLC + Mercury +
  Stripe (via XuanTong)
excerpt: >-
  XuanTong (@XuanTongAI) walks through what actually worked: a Wyoming LLC + EIN
  + Mercury + Stripe, for a one-time $168 and done in under a week. Here's the
  four-stage chain, the costs, the five documents most likely to get rejected,
  and a pre-flight checklist.
---

> This post is compiled from **XuanTong ([@XuanTongAI](https://x.com/XuanTongAI))**'s long-form X thread, ["Getting Paid Internationally for $168: A US Company + Mercury + Stripe — I Got Rejected Three Times Before I Figured It Out"](https://x.com/XuanTongAI/status/2081711885007941903). The original includes form screenshots for every step, so if you're filling things out as you go, read the original. Here, the key takeaways and gotchas are organized into a checklist for easy reference.
>
> The author notes this is the path that worked for him in **September 2025**; platform rules and review standards do change. This is also not legal or tax advice — once the amounts get large, talk to a professional. The scenario it fits: you're based in China, building a product for a global audience, and you want to accept credit cards.

## Start with the Full Chain

Collecting money internationally isn't just "sign up for Stripe." It's four services strung together in order, where the documents you get from each stage are the ticket into the next:

| Order | Stage | Purpose | Author's choice and cost |
|---|---|---|---|
| 1 | US LLC | US legal entity | Northwest Registered Agent, Wyoming LLC, $143 |
| 2 | EIN | Federal tax ID | Hired someone on Fiverr, $24.6, one business day |
| 3 | Mercury | USD account — where the money ultimately lands | Free to open |
| 4 | Stripe | Payment gateway — where customers swipe their cards | Free to activate |

The author sums it up well: the hard part isn't any individual form, it's that every handoff between stages requires you to produce exactly the right document.

## The Five Documents Most Likely to Get Rejected

This is the most valuable section of the original — every item here is something the author learned by getting rejected first:

| Where you get stuck | What got rejected | What works |
|---|---|---|
| Proof of address for company registration | Submitting a credit card statement | Submitting your ID card |
| ID card upload | Uploading only one side | Combine both sides into **a single PDF** (you can only upload one file) |
| EIN | Only getting the EIN number | Confirm **before ordering** that you'll receive the **147C** letter — Stripe will ask for it |
| Stripe identity verification | Using an ID card | You must use a **passport** |
| Mercury's source-of-first-funds check | — | Provide a bank deposit certificate (the author used one from China Merchants Bank) |

## Key Points for Each Stage

### Stage 1: Register the US LLC

- Entity type: LLC. State of formation: Wyoming — the best value in the author's comparison.
- Use the company address provided by the registered agent.
- Fill in your own contact details: a Chinese mobile number is fine, and **use the address on your ID card** — that way your ID card works directly as proof of address later.
- Don't buy the two add-ons: **Business Identity** (you won't need it, and it costs extra) and **Optional Items** (which charges $200 for EIN filing).
- After submitting, you'll get an email asking for proof of address — see the gotchas table above. The whole process wrapped up within a week, and registration documents are downloadable from the agent's dashboard.

### Stage 2: Get the EIN

- The author skipped the agent's $200 service and instead searched "EIN" on Fiverr to hire someone for $24.6.
- What you need to provide: your personal name, the company's legal name, the company's mailing address (the agent's — it's in your registration documents), state and date of formation, number of members (1), and a description of your business activities.
- **Before you place the order, make absolutely sure they can get you the 147C.**

### Stage 3: Open a Mercury Account

- Enter your name and address in English.
- You'll need two addresses: the company address (the agent's works fine — it mainly affects where the physical card is mailed) and your personal address (**must be the address on your ID card**, since it's used for proof of address).
- Late in the review process they'll ask for more documents. The author was asked for proof of address and proof of the source of the first deposit.

**US phone number**: the author initially bought a Boom Mobile SIM on JD.com (¥98, arrived pre-activated, $5/month), but the provider went out of business, so he switched to an ENC blank SIM.

### Stage 4: Set Up Stripe

Work through the pages in order: business type, tax info, company, personal, product, public details, and bank account. The two sticking points are the ones in the table above — the **EIN 147C** and your **passport**.

## Total Cost

| Item | Amount |
|---|---|
| Company registration (one-time) | $143 |
| EIN filing service (one-time) | $24.6 |
| US SIM card (one-time) | ¥98 |
| Annual report (yearly) | $60 |
| Registered agent (yearly) | $125 (the author has seen options for a few tens of dollars a year and plans to switch) |
| Tax filing assistance (optional) | Depends on whether you hire an accountant |

So roughly $168 one-time to get the whole chain running, then under $200 a year to maintain it. The author also notes that BOI (Beneficial Ownership Information) reporting is no longer required as a separate filing.

## Taxes: Collecting Money Is Only Half the Story

The author raises two key tax questions but doesn't go deep — he plans to write a separate post:

- Whether the IRS classifies your income as **service income** or **royalties**: service income isn't subject to withholding tax.
- Whether you can claim benefits under the US–China tax treaty: if you qualify, withholding is 10%, and you file a **W-8BEN** with Stripe.

His advice is worth copying too: don't rely on one-sided conclusions about taxes — once the amounts grow, sit down with an accountant who understands cross-border work.

## Pre-Flight Checklist

1. Scans of both sides of your ID card, **merged into one PDF**
2. Passport ready (Stripe only accepts passports)
3. A Visa card (to pay for company registration)
4. A bank deposit certificate (for Mercury's source-of-first-funds check)
5. A US phone number
6. Use the address on your ID card as your contact address during registration
7. Decline Business Identity and Optional Items
8. Confirm you'll get the 147C before hiring someone to file your EIN

## Related Posts on This Site

We've covered two other approaches to this same chain — worth comparing:

- [The Indie Hacker's Guide to Going Global: A US Company + EIN + Stripe + Bank for $193](/en/blog/indie-hacker-us-company-complete-guide)
- [The Complete Payment Setup for Global Websites: US Company Registration, EIN Application, Bank Account, and Stripe Activation](/en/blog/us-company-registration-full-guide)
- If you'd rather go the UK route: [Registering a UK Company and Opening a Wise Business Account](/en/blog/uk-company-wise-business-account)

## FAQ

### How much does it cost in total to register a US company from China and get Stripe working?

Based on XuanTong's experience, about $168 one-time ($143 for the Wyoming LLC registration + $24.6 for EIN filing), plus around ¥98 for a US SIM card. After that, you pay $60 for the annual report plus the registered agent fee each year — under $200 total.

### Can I use my ID card for Stripe verification?

No. Per the original post, Stripe's identity verification step only accepts a passport.

### What is a 147C, and why confirm it in advance?

The 147C is the EIN confirmation letter issued by the IRS. After you enter your EIN number, Stripe will ask for supporting documentation — that's when you need it. So when hiring someone to file your EIN, confirm upfront that they can get it for you.

### Why does my proof of address keep getting rejected?

Two common reasons: you submitted a credit card statement (not accepted), or you only uploaded one side of your ID card. The fix is to use your ID card and merge both sides into a single PDF.

---

Original: [Getting Paid Internationally for $168: A US Company + Mercury + Stripe — I Got Rejected Three Times Before I Figured It Out (XuanTong @XuanTongAI)](https://x.com/XuanTongAI/status/2081711885007941903)
