// English version of ../local-payments.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// How buyers pay in each market and what a foreign seller can accept: shares mostly from third parties citing Worldpay's
// e-commerce data; what each platform can take comes from Stripe, Paddle, Lemon Squeezy and PayPal's own docs.
const STRIPE_TABLE = "https://docs.stripe.com/payments/payment-methods/payment-method-support";
const ANTOM = "https://www.antom.com/markets";
const LS_METHODS = "https://docs.lemonsqueezy.com/help/checkout/payment-methods";
const PADDLE = "https://developer.paddle.com/concepts/payment-methods";

export const LOCAL_PAYMENTS_EN: Guide = {
  slug: "local-payments",
  short: "How buyers pay, by market",
  parent: { short: "Payment platform picker", path: "/payments" },
  title: "How buyers pay in each market: the US, Indonesia, Vietnam, Japan, South Korea, Russia, China, the EU and the UK, and what a foreign seller can accept",
  description:
    "The payment platform picker ranks by who you are and what you sell; this page goes by where the buyer is: how people pay online in each market, which methods Stripe, Paddle, Lemon Squeezy and PayPal can take, which support subscriptions, and why Russia is mostly closed.",
  intro:
    "For the same subscription, Americans pay with wallets and credit cards, Indonesians with e-wallets and bank transfers, the Dutch with iDEAL, and cards issued in Russia mostly fail. Below are the methods buyers use in each market and what a foreign seller can actually accept through Stripe, Paddle, Lemon Squeezy and PayPal. Which methods Stripe offers depends on the country your Stripe account is registered in; Paddle and Lemon Squeezy are merchants of record and need no local company. Shares are mostly third parties citing Worldpay's 2025 e-commerce data.",
  checked: "2026-11-07",
  sections: [
    {
      id: "platforms",
      title: "The platforms first: what Lemon Squeezy and PayPal take",
      items: [
        {
          text: "Lemon Squeezy supports cards (including JCB and UnionPay), PayPal, Apple Pay, Google Pay, Alipay, WeChat Pay, Cash App Pay and ACH; subscriptions work only with cards, Apple Pay, Google Pay and PayPal.",
          sources: [{ label: "Lemon Squeezy", url: LS_METHODS }],
        },
        {
          text: "PayPal offers European local methods such as iDEAL, Bancontact, BLIK and P24. Its country list includes Indonesia, Vietnam, Japan, South Korea and China, but not Russia.",
          sources: [
            { label: "PayPal local methods", url: "https://developer.paypal.com/docs/checkout/apm/" },
            { label: "PayPal countries", url: "https://www.paypal.com/us/webapps/mpp/country-worldwide" },
          ],
        },
      ],
    },
    {
      id: "us",
      title: "United States",
      items: [
        {
          text: "E-commerce in 2025: wallets 40%, credit cards 32%, debit cards 16%, buy now pay later 6%, bank payments 4%.",
          sources: [{ label: "Antom citing Worldpay", url: `${ANTOM}/united-states` }],
        },
        {
          text: "Stripe's ACH debit (usable for subscriptions) is only for accounts in the US, the EEA, the UK and Switzerland; Cash App Pay and Klarna for US buyers are only for US accounts.",
          sources: [
            { label: "Stripe method support", url: STRIPE_TABLE },
            { label: "Stripe Klarna", url: "https://docs.stripe.com/payments/klarna" },
          ],
        },
        {
          text: "Paddle's cards, PayPal, Apple Pay and Google Pay all support subscriptions.",
          sources: [{ label: "Paddle", url: `${PADDLE}/overview` }],
        },
      ],
    },
    {
      id: "indonesia",
      title: "Indonesia",
      items: [
        {
          text: "E-commerce in 2025: e-wallets 42%, bank transfers 34%, cash on delivery 13%, cards only 5–7%.",
          sources: [{ label: "Antom citing Worldpay", url: `${ANTOM}/indonesia` }],
        },
        {
          text: "QRIS, the national QR payment, handled 15.51 billion transactions in 2025, up 148.54% (Bank Indonesia's figure).",
          sources: [{ label: "Kontan (2026-03-12)", url: "https://keuangan.kontan.co.id/news/bi-mencatat-nilai-transaksi-qris-capai-rp-16448-triliun-pada-januari-2026" }],
        },
        {
          text: "Stripe's QRIS and GoPay are both in preview and need approval. QRIS is only for Indonesian and US accounts and can't do subscriptions; GoPay is for Indonesian, Singaporean and US accounts and can. Paddle and Lemon Squeezy have no Indonesian local methods.",
          sources: [
            { label: "Stripe QRIS", url: "https://docs.stripe.com/payments/qris" },
            { label: "Stripe GoPay", url: "https://docs.stripe.com/payments/gopay" },
          ],
        },
      ],
    },
    {
      id: "vietnam",
      title: "Vietnam",
      items: [
        {
          text: "E-commerce in 2025: e-wallets 38%, bank transfers (VietQR) 28%, cash on delivery 16%, credit cards 12%, debit cards 4%.",
          sources: [{ label: "Antom citing Worldpay", url: `${ANTOM}/vietnam` }],
        },
        {
          text: "VietQR transactions grew 52% in January–October 2025, with nearly 90 million mobile banking accounts using it.",
          sources: [{ label: "NAPAS (2025-11-21)", url: "https://en.napas.com.vn/napas-2025-member-organization-conference-184260317124736875.htm" }],
        },
        {
          text: "Stripe's MoMo is only for US accounts and has a waitlist; Stripe has no VietQR. Paddle and Lemon Squeezy have no Vietnamese local methods, and Paddle's PayPal can't price in Vietnamese dong.",
          sources: [
            { label: "Stripe MoMo", url: "https://docs.stripe.com/payments/momo" },
            { label: "Paddle PayPal", url: `${PADDLE}/paypal` },
          ],
        },
      ],
    },
    {
      id: "japan",
      title: "Japan",
      items: [
        {
          text: "E-commerce in 2025: credit cards 58%, wallets 29%, convenience store and cash 5%, bank transfers 3%, buy now pay later 2%.",
          sources: [{ label: "Antom citing Worldpay", url: `${ANTOM}/japan` }],
        },
        {
          text: "Stripe's convenience store payments (Konbini) and PayPay are only for Japanese accounts. For subscriptions, Konbini can only send a separate bill each period that the buyer pays in cash at a store; PayPay can't do subscriptions.",
          sources: [
            { label: "Stripe Konbini", url: "https://docs.stripe.com/payments/konbini" },
            { label: "Stripe PayPay", url: "https://docs.stripe.com/payments/paypay" },
          ],
        },
        {
          text: "Foreign sellers rely mainly on credit cards: Stripe accounts in the US, Hong Kong, Singapore, the UK and the EEA can all take JCB. Paddle and Lemon Squeezy have no Japanese local methods.",
          sources: [{ label: "Stripe card brands", url: "https://docs.stripe.com/payments/cards/supported-card-brands" }],
        },
      ],
    },
    {
      id: "korea",
      title: "South Korea",
      items: [
        {
          text: "E-commerce in 2025: credit cards 49%, wallets 35%, bank transfers 7%, debit cards 5%. Most Korean cards run on nine domestic card networks, not Visa or Mastercard.",
          sources: [
            { label: "Antom citing Worldpay", url: `${ANTOM}/south-korea` },
            { label: "Paddle Korean cards", url: `${PADDLE}/korean-cards` },
          ],
        },
        {
          text: "Stripe can take all Korean local cards plus Naver Pay, Kakao Pay, Samsung Pay and PAYCO without a Korean company (from accounts in the US, Hong Kong, Japan, Singapore, the UK and most of the EU). Local cards, Kakao Pay and Naver Pay support subscriptions; Samsung Pay and PAYCO don't.",
          sources: [{ label: "Stripe Korea", url: "https://docs.stripe.com/payments/countries/korea" }],
        },
        {
          text: "Korea has special subscription rules: a price increase needs the user's consent 30 days ahead, and each charge needs a reminder 7 days before.",
          sources: [{ label: "Stripe Korea", url: "https://docs.stripe.com/payments/countries/korea" }],
        },
        {
          text: "Paddle's Korean local cards, Kakao Pay and Naver Pay also support subscriptions. Neither Stripe nor Paddle offers Toss Pay.",
          sources: [{ label: "Paddle Kakao Pay", url: `${PADDLE}/kakaopay` }],
        },
      ],
    },
    {
      id: "russia",
      title: "Russia: mostly closed",
      items: [
        {
          text: "Visa cards issued in Russia don't work abroad. Inside Russia people use Mir cards (520 million in July 2026) and the Faster Payments System (SBP).",
          sources: [
            { label: "Visa (2022-03-05)", url: "https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.18871.html" },
            { label: "Bank of Russia", url: "https://www.cbr.ru/eng/psystem/" },
          ],
        },
        {
          text: "Stripe doesn't support Mir; payments with Russian-issued cards are \"unlikely to be successful\", and Stripe forbids using it to provide IT support, enterprise management software or design software as cloud services to people in Russia.",
          sources: [{ label: "Stripe sanctions note", url: "https://support.stripe.com/questions/sanctions-on-russia-and-belarus" }],
        },
        {
          text: "Paddle and Lemon Squeezy both refuse sales to Russian buyers, and PayPal suspended its Russian service in 2022. Only buyers holding foreign cards can still pay, and you should check the sanctions rules before selling.",
          sources: [
            { label: "Paddle", url: "https://www.paddle.com/help/legal/sanctions/which-countries-are-supported-by-paddle" },
            { label: "Lemon Squeezy", url: "https://docs.lemonsqueezy.com/help/getting-started/supported-countries" },
            { label: "Interfax", url: "https://interfax.com/newsroom/top-stories/75588/" },
          ],
        },
      ],
    },
    {
      id: "china",
      title: "Mainland China",
      items: [
        {
          text: "E-commerce in 2025: Alipay and WeChat Pay together 89%.",
          sources: [{ label: "FF News citing Worldpay", url: "https://ffnews.com/newsarticle/its-a-summer-of-football-but-which-payment-method-takes-the-trophy/" }],
        },
        {
          text: "Stripe can take Alipay and WeChat Pay from mainland buyers (from accounts in the US, Hong Kong, Singapore, Japan, the UK, the EU and more), but a mainland company can't open a Stripe account. Recurring Alipay charges are invitation-only and need Alipay's own approval; recurring WeChat Pay is still in beta.",
          sources: [
            { label: "Stripe Alipay", url: "https://docs.stripe.com/payments/alipay" },
            { label: "Stripe WeChat Pay", url: "https://docs.stripe.com/payments/wechat-pay" },
          ],
        },
        {
          text: "Paddle's Alipay needs approval, prices only in yuan and caps each renewal at ¥1,600; its WeChat Pay works only on desktop and can't do subscriptions. Lemon Squeezy takes both, for one-time payments only.",
          sources: [
            { label: "Paddle Alipay", url: `${PADDLE}/alipay` },
            { label: "Paddle WeChat Pay", url: `${PADDLE}/wechat` },
            { label: "Lemon Squeezy", url: LS_METHODS },
          ],
        },
      ],
    },
    {
      id: "eu",
      title: "European Union",
      items: [
        {
          text: "Online shopping in the euro area: cards 48%, wallets, apps and other electronic methods 29% (2024).",
          sources: [{ label: "European Central Bank", url: "https://www.ecb.europa.eu/press/pr/date/2024/html/ecb.pr241219~172b929461.en.html" }],
        },
        {
          text: "iDEAL handles 71% of online purchases in the Netherlands (2025) and moves to Wero in 2026–2027; BLIK in Poland handled 1.4 billion e-commerce transactions in 2025; Bancontact in Belgium handled 382 million online payments in 2024.",
          sources: [
            { label: "Dutch Payments Association", url: "https://www.betaalvereniging.nl/en/knowledge-base/online-payments/" },
            { label: "Stripe iDEAL", url: "https://docs.stripe.com/payments/ideal" },
            { label: "BLIK", url: "https://www.blik.com/en/nearly-3-bn-blik-transactions-in-2025-and-over-2-m-new-users" },
            { label: "Bancontact", url: "https://www.bancontact.com/en/news/2-5-billion-payments-with-bancontact-and-payconiq-in-2024-2-5-billion-times-thank-you-for-your-trust-in-us" },
          ],
        },
        {
          text: "Stripe offers iDEAL, Bancontact and SEPA Direct Debit to accounts in the US, Hong Kong, Singapore, Japan and elsewhere; BLIK isn't available to Hong Kong or Japanese accounts. SEPA supports subscriptions; iDEAL renews through SEPA after the first payment; BLIK supports subscriptions (up to 2,000 złoty per charge); Bancontact doesn't.",
          sources: [
            { label: "Stripe method support", url: STRIPE_TABLE },
            { label: "Stripe BLIK", url: "https://docs.stripe.com/payments/blik" },
            { label: "Stripe Bancontact", url: "https://docs.stripe.com/payments/bancontact" },
          ],
        },
        {
          text: "With Stripe, only accounts in the EEA, the UK or Switzerland can take Klarna from European buyers; US and Hong Kong sellers can't.",
          sources: [{ label: "Stripe Klarna", url: "https://docs.stripe.com/payments/klarna" }],
        },
        {
          text: "Paddle's iDEAL, Bancontact and BLIK can't do subscriptions, and it has no SEPA Direct Debit or Klarna; Lemon Squeezy has none of these.",
          sources: [{ label: "Paddle iDEAL", url: `${PADDLE}/ideal` }],
        },
      ],
    },
    {
      id: "uk",
      title: "United Kingdom",
      items: [
        {
          text: "E-commerce in 2025: wallets 40%, credit cards 23%, debit cards 22%, buy now pay later 8%, open banking 6%.",
          sources: [{ label: "Antom citing Worldpay", url: `${ANTOM}/united-kingdom` }],
        },
        {
          text: "Stripe's Bacs Direct Debit is only for UK accounts, and Pay by Bank only for UK, Irish and Finnish accounts, so foreign sellers rely mainly on cards, Apple Pay, Google Pay and PayPal.",
          sources: [{ label: "Stripe method support", url: STRIPE_TABLE }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Selling to Russian buyers through Paddle or Lemon Squeezy: both explicitly refuse.",
      sources: [
        { label: "Paddle", url: "https://www.paddle.com/help/legal/sanctions/which-countries-are-supported-by-paddle" },
        { label: "Lemon Squeezy", url: "https://docs.lemonsqueezy.com/help/getting-started/supported-countries" },
      ],
    },
    {
      text: "Using Konbini for subscriptions in Japan: each period becomes a separate bill the buyer pays in cash at a store.",
      sources: [{ label: "Stripe Konbini", url: "https://docs.stripe.com/payments/konbini" }],
    },
    {
      text: "Assuming Stripe's QRIS, GoPay or MoMo work once switched on: all three are in preview and need approval.",
      sources: [
        { label: "Stripe QRIS", url: "https://docs.stripe.com/payments/qris" },
        { label: "Stripe MoMo", url: "https://docs.stripe.com/payments/momo" },
      ],
    },
    {
      text: "Raising a Korean subscription price without notice: you need the user's consent 30 days ahead and a reminder 7 days before each charge.",
      sources: [{ label: "Stripe Korea", url: "https://docs.stripe.com/payments/countries/korea" }],
    },
    {
      text: "Turning on Klarna in a US or Hong Kong Stripe account to reach European buyers: only EEA, UK and Swiss accounts can take it.",
      sources: [{ label: "Stripe Klarna", url: "https://docs.stripe.com/payments/klarna" }],
    },
    {
      text: "Selling subscriptions with Alipay or WeChat Pay on Lemon Squeezy: it supports one-time payments only.",
      sources: [{ label: "Lemon Squeezy", url: LS_METHODS }],
    },
  ],
  unknowns: [
    "Most shares come from third parties citing Worldpay's report, which we couldn't read; for Japan's convenience-store share Antom says 5% and 2Checkout 18%.",
    "We found no official figures for Russia's online payments by method or for Bancontact's share of Belgian e-commerce.",
    "Whether PayPal's local methods support recurring charges; PayPal doesn't say.",
    "Stripe's method table says Bancontact can be saved as SEPA Direct Debit for renewals, which contradicts Stripe's Bancontact page.",
    "Whether Japan's mandatory 3D Secure also applies to foreign merchants; not confirmed.",
  ],
  related: [
    { label: "Payment platform picker", path: "/payments" },
    { label: "Individual or company: opening accounts", path: "/open-account" },
    { label: "Tax on selling digital products", path: "/digital-tax" },
    { label: "Payment risk after launch", path: "/payment-risk" },
  ],
};
