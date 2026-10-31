// English version of ../payment-risk.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

const CARD_TESTING = "https://docs.stripe.com/disputes/prevention/card-testing";
const MONITORING = "https://docs.stripe.com/disputes/monitoring-programs";
const DISPUTES = "https://docs.stripe.com/disputes/how-disputes-work";
const PADDLE_CB = "https://www.paddle.com/help/manage/risk-prevention/understanding-chargebacks-with-paddle";

export const PAYMENT_RISK_EN: Guide = {
  slug: "payment-risk",
  short: "Risk after launch",
  title: "Payment risk after you go live: fraud and card testing, chargeback rates, holds and reserves",
  description:
    "Where things most often go wrong once your site starts taking money: card testing attacks, chargeback rates over the limit, frozen accounts and reserves, free trial abuse on AI products, and the rules at Stripe, PayPal, Paddle, Lemon Squeezy, Creem, Dodo, Polar and Waffo Pancake.",
  intro:
    "Passing the payment platform's review is only the start. After launch, fraud, chargebacks and refunds decide whether your account survives. Based on each provider's official docs: what gets you frozen, where the chargeback red lines are, and how to prevent problems.",
  checked: "2026-10-17",
  sections: [
    {
      id: "card-testing",
      title: "Fraud and card testing",
      items: [
        {
          text: "Card testing is when someone runs a script to check stolen or generated card numbers in bulk, usually with small payments or by saving cards. Warning signs are a sudden spike in failed or blocked payments, lots of small orders, and junk names and emails.",
          sources: [{ label: "Stripe card testing guide", url: CARD_TESTING }],
        },
        {
          text: "After an attack, chargebacks, early fraud warnings and decline rates all go up, and legitimate payments may be declined more often even after the attack stops. Refund the suspicious payments that went through first, then add protection.",
          sources: [{ label: "Stripe card testing guide", url: CARD_TESTING }],
        },
        {
          text: "The first line of defense is the latest Stripe Checkout or Payment Element, which come with rate limiting, AI models and CAPTCHA built in. If you build your own, verify the CAPTCHA on the server, cover every request that can save a card or make a payment, and limit orders and card saves per IP and per account.",
          sources: [{ label: "Stripe card testing guide", url: CARD_TESTING }],
        },
        {
          text: "Custom Radar rules (for example, only 1 payment per IP per hour, or blocking failed CVC checks) need the Plus or Pro plan. The basic Radar Lite only has AI protection and card testing protection.",
          sources: [
            { label: "Radar rules 101", url: "https://stripe.com/guides/radar-rules-101" },
            { label: "How Radar works", url: "https://docs.stripe.com/radar/how-radar-works" },
          ],
        },
        {
          text: "Two self-inflicted problems: repeatedly retrying failed cards after an attack, or a leaked secret key. Both create traffic that looks like card testing.",
          sources: [{ label: "Stripe card testing guide", url: CARD_TESTING }],
        },
      ],
    },
    {
      id: "disputes",
      title: "Chargebacks",
      items: [
        {
          text: "Stripe: as soon as a dispute is opened, the disputed amount and a dispute fee are taken from your balance. In the US the fee is USD 15 per dispute, plus another USD 15 to contest it (the contest fee is refunded if you win). In Hong Kong it is HKD 85 plus HKD 85. You can submit evidence only once and cannot change it afterwards.",
          sources: [
            { label: "How disputes work", url: DISPUTES },
            { label: "Dispute fees", url: "https://support.stripe.com/questions/june-2025-pricing-updates-for-disputes" },
            { label: "Responding to disputes", url: "https://docs.stripe.com/disputes/responding" },
          ],
        },
        {
          text: "When you get an early fraud warning on an order worth no more than the dispute fee, refunding it right away is the cheapest option.",
          sources: [{ label: "How disputes work", url: DISPUTES }],
        },
        {
          text: "The industry norm treats a chargeback rate above 0.75% as excessive. Individual platforms set lower limits: Polar 0.4%, Dodo 0.5% (which also counts refunds and cancellations), Paddle 0.65%.",
          sources: [
            { label: "Stripe", url: "https://docs.stripe.com/disputes/measuring" },
            { label: "Polar", url: "https://polar.sh/docs/merchant-of-record/account-reviews" },
            { label: "Dodo terms", url: "https://dodopayments.com/legal/terms-of-use" },
            { label: "Paddle", url: PADDLE_CB },
          ],
        },
        {
          text: "The card networks are watching too. From April 1, 2026, Visa's VAMP lowers the \"excessive\" threshold to 1.5% in Asia Pacific, the EU, the US and other regions, with a minimum count of 1,500 in the month. Mastercard puts you in monitoring at a chargeback rate of 1.5% or more with 100 or more chargebacks in the month, and fines start from the second month.",
          sources: [
            { label: "Visa fact sheet", url: "https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf" },
            { label: "Stripe summary", url: MONITORING },
          ],
        },
        {
          text: "If your account is closed because of chargebacks, you may be added to the MATCH or VMSS list for 5 years, which makes it hard to get any acquirer to take you.",
          sources: [{ label: "Stripe", url: "https://docs.stripe.com/disputes/match" }],
        },
        {
          text: "Chargeback fees at each MoR: Paddle charges USD 20 per chargeback, not refunded even if you win, and it contests disputes fully automatically without accepting extra evidence from sellers. Lemon Squeezy USD 15. Creem USD 25. Dodo USD 30. Polar's docs say USD 15 while its terms say up to USD 30. Waffo Pancake USD 25, plus USD 10 to contest.",
          sources: [
            { label: "Paddle", url: PADDLE_CB },
            { label: "Lemon Squeezy", url: "https://docs.lemonsqueezy.com/help/payments/refunds-chargebacks" },
            { label: "Creem", url: "https://docs.creem.io/merchant-of-record/finance/refunds-and-chargebacks" },
            { label: "Dodo", url: "https://dodopayments.com/pricing" },
            { label: "Polar", url: "https://polar.sh/docs/merchant-of-record/fees" },
            { label: "Waffo Pancake", url: "https://docs.waffo.ai/mor/chargebacks.md" },
          ],
        },
      ],
    },
    {
      id: "reserves",
      title: "Holds and reserves",
      items: [
        {
          text: "Stripe sets reserves based on your industry, chargeback rate, refund rate and similar factors. Common triggers are long delivery times, rising chargebacks and unexplained spikes in processing volume. Reserves usually last 30 to 90 days and come in two types: fixed and rolling.",
          sources: [
            { label: "Reserves FAQ", url: "https://support.stripe.com/questions/reserves-faq" },
            { label: "Reserves", url: "https://support.stripe.com/topics/reserves" },
          ],
        },
        {
          text: "PayPal: being a new seller, not selling for a long time, multiple refunds or chargebacks, or a sudden change in sales pattern can all get funds held. The US site says holds last \"usually up to 21 days\". PayPal recommends keeping buyer complaints below 1% of sales.",
          sources: [
            { label: "Funds availability (US site)", url: "https://www.paypal.com/us/brc/article/funds-availability" },
            { label: "Reserves (China site)", url: "https://www.paypal.com/c2/webapps/mpp/reserves?locale.x=en_C2" },
          ],
        },
        {
          text: "Paddle can suspend sales immediately if your chargeback or refund rate is too high. After the relationship ends, funds are released only after 6 months or when the last subscription expires, whichever is later.",
          sources: [{ label: "Paddle terms", url: "https://www.paddle.com/legal/terms" }],
        },
        {
          text: "Polar can delay payouts for high-risk accounts by up to 120 days. Some Creem investigations take up to 90 days, and once an account is closed, Creem will not open another one for the same person.",
          sources: [
            { label: "Polar terms", url: "https://polar.sh/legal/terms" },
            { label: "Creem terms", url: "https://www.creem.io/terms" },
          ],
        },
        {
          text: "Waffo Pancake: sales proceeds become withdrawable after about 10 business days. Alipay withdrawals can only go to a personal account in mainland China, up to CNY 50,000 per withdrawal and CNY 300,000 per person per year.",
          sources: [
            { label: "Payout flow", url: "https://docs.waffo.ai/merchant/payout-flow.md" },
            { label: "Fees", url: "https://docs.waffo.ai/mor/fees.md" },
          ],
        },
      ],
    },
    {
      id: "trial-abuse",
      title: "Free trial abuse on AI products",
      items: [
        {
          text: "Free trials are often abused with prepaid cards, virtual cards, or the same card signing up for many accounts. Stripe Radar has dedicated free trial abuse protection that blocks high-risk customers before the trial starts. To use it, first turn on \"Run Radar on saved payment methods\".",
          sources: [{ label: "Free trial abuse protection", url: "https://docs.stripe.com/radar/free-trial-abuse" }],
        },
        {
          text: "Trials that don't collect a card attract lots of fake customers. Stripe suggests requiring account signup and a CAPTCHA before the trial, or switching to a paid trial (for example USD 1 for the first week).",
          sources: [
            { label: "Free trials", url: "https://docs.stripe.com/billing/subscriptions/trials/free-trials" },
            { label: "Trials", url: "https://docs.stripe.com/billing/subscriptions/trials" },
          ],
        },
        {
          text: "Radar rules can block prepaid cards, disposable emails, proxies and Tor, and cases where one email has used several cards.",
          sources: [{ label: "Rule attributes", url: "https://docs.stripe.com/radar/rules/supported-attributes" }],
        },
        {
          text: "Paddle's checkout does not support cardless trials. For cardless trials, Paddle recommends blocking disposable emails and adding reCAPTCHA or Cloudflare Turnstile. Polar has a \"Prevent trial abuse\" toggle that detects repeat trials by email and card fingerprint.",
          sources: [
            { label: "Paddle", url: "https://developer.paddle.com/build/subscriptions/cardless-trials" },
            { label: "Polar", url: "https://polar.sh/docs/features/trials" },
          ],
        },
      ],
    },
    {
      id: "refunds",
      title: "Refunds: what the platform has already promised buyers for you",
      items: [
        {
          text: "Paddle does not offer refunds by default, but statutory periods must be honored: 14 days in the EU, the UK and elsewhere, 7 days in China, South Korea, Brazil and Canada. Within 14 days, or whenever it thinks a transaction may turn into a chargeback, Paddle can refund directly and recover the amount from you.",
          sources: [
            { label: "Refund policy", url: "https://www.paddle.com/legal/refund-policy" },
            { label: "Paddle terms", url: "https://www.paddle.com/legal/terms" },
          ],
        },
        {
          text: "Lemon Squeezy, Creem and Polar all reserve the right to issue refunds on their own within 60 days of purchase to prevent chargebacks, even if you say \"no refunds\".",
          sources: [
            { label: "Lemon Squeezy", url: "https://docs.lemonsqueezy.com/help/payments/refunds-chargebacks" },
            { label: "Creem", url: "https://docs.creem.io/merchant-of-record/finance/refunds-and-chargebacks" },
            { label: "Polar", url: "https://polar.sh/docs/features/refunds" },
          ],
        },
        {
          text: "Dodo's standard refund request window for buyers is 7 days, and merchants cannot refund from the dashboard after 30 days. On Waffo Pancake, buyers of one-time products can request a refund within 14 days of payment, subject to merchant approval.",
          sources: [
            { label: "Dodo", url: "https://docs.dodopayments.com/features/transactions/refunds" },
            { label: "Waffo Pancake", url: "https://docs.waffo.ai/features/refunds.md" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Thinking a refund erases the record: card network monitoring ignores refunds, and early fraud warnings still count after you refund. On Paddle, chargebacks you win still count toward your chargeback rate.",
      sources: [
        { label: "Stripe", url: MONITORING },
        { label: "Paddle", url: PADDLE_CB },
      ],
    },
    {
      text: "Trying to refund after the chargeback is opened: during a dispute you cannot refund outside the dispute process.",
      sources: [{ label: "How disputes work", url: DISPUTES }],
    },
    {
      text: "Buyers not recognizing the name on their statement: with an MoR, the statement shows names like \"LEMSQZY* STORE\" or \"CREEM.IO* STORE\". Put your product name clearly in receipts and emails, or buyers may dispute it as an unknown charge.",
      sources: [
        { label: "Lemon Squeezy", url: "https://www.lemonsqueezy.com/why-did-lemon-squeeezy-charge-me" },
        { label: "Creem", url: "https://docs.creem.io/for-customers/why-creem-charged-me.md" },
      ],
    },
    {
      text: "No reminders before a trial ends or a renewal: Stripe recommends reminding customers 7 days before an annual renewal and 2 to 3 days before a monthly one, and offering one-click cancellation in the app.",
      sources: [{ label: "Stripe", url: MONITORING }],
    },
    {
      text: "Pushing volume hard right after launch: an unexplained spike in processing volume can trigger a reserve on its own.",
      sources: [{ label: "Stripe Reserves FAQ", url: "https://support.stripe.com/questions/reserves-faq" }],
    },
    {
      text: "Ignoring the platform's requests for information: Polar requires a response within 72 hours, or it can refund the buyer directly.",
      sources: [{ label: "Polar terms", url: "https://polar.sh/legal/terms" }],
    },
    {
      text: "New accounts in Asia Pacific need extra care: from October 2026, Visa's new MERP monitoring program targets fraud, chargebacks and authorization declines in an account's early days.",
      sources: [{ label: "Stripe", url: MONITORING }],
    },
  ],
  unknowns: [
    "Mastercard's rules manual blocks automated fetching, so the Mastercard threshold numbers are taken from Stripe's docs.",
    "Visa does not publish the thresholds for its new MERP program.",
    "PayPal's China site does not state how long holds last; \"up to 21 days\" comes from the US site. The line in the user agreement about holds \"generally limited to 180 days\" comes from search results for the official page, and I could not read it in the page itself.",
    "Paddle is inconsistent in two places: its help page gives a 0.65% chargeback rate (by amount), while its billing metrics page uses a separate count-based standard.",
    "Stripe, Lemon Squeezy, Creem and Waffo Pancake do not publish the chargeback rate at which they suspend accounts. I found no official trial abuse guidance from Lemon Squeezy, Creem, Dodo or Waffo Pancake.",
  ],
  posts: ["choose-payment-platform-2026", "indie-payments-report-2026"],
};
