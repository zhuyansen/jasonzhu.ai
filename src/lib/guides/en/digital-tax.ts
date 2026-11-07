// English version of ../digital-tax.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Tax a foreign seller owes on digital services sold to consumers in each market: tax authorities, laws and the
// merchant-of-record platforms' own docs; some new Vietnamese rules come from Big Four summaries. General information, not tax advice.
const OSS_GUIDE =
  "https://vat-one-stop-shop.ec.europa.eu/document/download/55f4ec9d-83e6-4942-9e8d-11d44c243087_en?filename=OSS+Guidelines_revised_1Jan2027_0.pdf";
const NTA_FOREIGN = "https://www.nta.go.jp/english/taxes/consumption_tax/0024006-219.pdf";
const KR_VAT_LAW = "https://www.law.go.kr/LSW/lsInfoP.do?lsId=001571";
const ID_PMSE = "https://www.pajak.go.id/id/pajakdigital";
const PADDLE_TAX = "https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-or-vat-for";
const STRIPE_MP = "https://docs.stripe.com/payments/managed-payments/tax-compliance";

export const DIGITAL_TAX_EN: Guide = {
  slug: "digital-tax",
  short: "Tax on digital products",
  parent: { short: "Payment platform picker", path: "/payments" },
  title: "Tax on selling digital products to consumers abroad: the rules in the EU, UK, US, Japan, South Korea, Indonesia, Vietnam and Russia, and what payment platforms pay for you",
  description:
    "The tax a foreign seller owes when selling subscriptions, AI tools or e-books to consumers in each market: the EU and UK tax the first sale, Japan, Korea, Indonesia, Vietnam and Russia have rules aimed at foreign sellers, US states have sales tax, and Paddle, Lemon Squeezy, FastSpring and the app stores pay some of it for you.",
  intro:
    "Digital products sold to consumers are taxed where the buyer is in most markets, and foreign sellers aren't exempt: the EU and the UK tax the first sale, and Japan, South Korea, Indonesia, Vietnam and Russia all have rules aimed at foreign sellers. The easiest route is a merchant of record, which becomes the seller and calculates, collects and pays the tax for you. Below, a foreign seller means one with no company or office in that market.",
  checked: "2026-11-07",
  warning: {
    text: "This page summarises tax authorities' pages and the laws themselves. It is general information, not tax advice; for your own situation, ask a tax adviser in that country.",
  },
  sections: [
    {
      id: "mor",
      title: "First, what payment platforms pay for you",
      lead: "When you take payments directly through Stripe or PayPal you are the seller and must register and file in each country yourself; a merchant of record acts as the seller for you.",
      items: [
        {
          text: "Paddle's tax page (updated August 2025): in the EU it uses OSS and covers consumer buyers only; it charges UK 20%, Japan 10% and Indonesia 12% to both consumers and businesses; Korea 10% to consumers only; Vietnam under the foreign contractor tax; 38 US states plus Denver and Washington DC. Russia and China aren't listed.",
          sources: [{ label: "Paddle tax", url: PADDLE_TAX }],
        },
        {
          text: "Lemon Squeezy says only that it collects and pays tax as merchant of record, with no country list, and doesn't sell to Russian buyers. In January 2026 it announced Stripe Managed Payments and plans to move existing users; that service pays tax in more than 80 countries, including the EU, UK, US, Japan, Korea, Indonesia and Vietnam, but not Russia or mainland China.",
          sources: [
            { label: "Lemon Squeezy tax", url: "https://docs.lemonsqueezy.com/help/payments/sales-tax-vat" },
            { label: "Lemon Squeezy 2026 update", url: "https://www.lemonsqueezy.com/blog/2026-update" },
            { label: "Stripe Managed Payments", url: STRIPE_MP },
          ],
        },
        {
          text: "FastSpring collects tax in the EU, UK, Japan, Korea, Indonesia, Vietnam, Russia and 45 US states; in Russia and Vietnam business buyers aren't exempt even with a tax number.",
          sources: [{ label: "FastSpring", url: "https://developer.fastspring.com/docs/about-vat-and-sales-tax" }],
        },
        {
          text: "In-app purchases: Apple calculates, collects and pays tax in more than 80 regions. With Google Play billing, Google handles tax for foreign developers in the EU, the UK, listed US states, Indonesia, Japan, Korea, Vietnam and Russia; with alternative billing, the developer pays.",
          sources: [
            { label: "Apple", url: "https://developer.apple.com/in-app-purchase/" },
            { label: "Google Play", url: "https://support.google.com/googleplay/android-developer/answer/138000" },
          ],
        },
      ],
    },
    {
      id: "eu",
      title: "EU: tax from the first sale",
      items: [
        {
          text: "Standard rates range from 17% (Luxembourg) to 27% (Hungary).",
          sources: [{ label: "EU rates", url: "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm" }],
        },
        {
          text: "The €10,000 threshold applies only to sellers established in a single EU country. A seller outside the EU owes VAT in the buyer's country from the first sale to a consumer.",
          sources: [{ label: "EU OSS guide", url: OSS_GUIDE }],
        },
        {
          text: "Register for the non-Union OSS in any one member state and declare all EU sales there. Returns are quarterly, nil returns included, and both return and payment are due by the end of the month after the quarter.",
          sources: [
            { label: "EU OSS", url: "https://europa.eu/youreurope/business/taxation/vat/one-stop-shop/index_en.htm" },
            { label: "EU OSS guide", url: OSS_GUIDE },
          ],
        },
        {
          text: "For sales to businesses, the buyer usually accounts for the VAT in its own country under the reverse charge.",
          sources: [{ label: "Cross-border VAT", url: "https://europa.eu/youreurope/business/taxation/vat/cross-border-vat/index_en.htm" }],
        },
      ],
    },
    {
      id: "uk",
      title: "UK: register from the first sale too",
      items: [
        {
          text: "The standard rate is 20%. Sellers with no UK establishment can't use the £90,000 threshold and must register within 30 days of the first taxable supply, digital services included.",
          sources: [
            { label: "UK rates", url: "https://www.gov.uk/vat-rates" },
            { label: "HMRC registration", url: "https://www.gov.uk/government/publications/vat-notice-7001-should-i-be-registered-for-vat/vat-notice-7001-should-i-be-registered-for-vat" },
          ],
        },
        {
          text: "Returns are usually quarterly, due with payment one month and seven days after the period ends; UK business buyers account for the VAT under the reverse charge.",
          sources: [
            { label: "HMRC returns", url: "https://www.gov.uk/vat-returns" },
            { label: "HMRC place of supply", url: "https://www.gov.uk/guidance/vat-place-of-supply-of-services-notice-741a" },
          ],
        },
      ],
    },
    {
      id: "us",
      title: "United States: state sales tax",
      items: [
        {
          text: "Economic nexus thresholds: $100,000 of yearly sales into the state in 41 states; $500,000 in California and Texas; $500,000 and more than 100 transactions in New York. Fifteen states keep an \"or 200 transactions\" test; Illinois and Kentucky dropped theirs in 2026.",
          sources: [
            { label: "Sales Tax Institute", url: "https://salestaxinstitute.com/resources/economic-nexus-state-guide" },
            { label: "Avalara", url: "https://www.avalara.com/us/en/blog/2025/06/states-eliminating-economic-nexus-transaction-thresholds" },
          ],
        },
        {
          text: "SaaS: about 18 states and Washington DC tax it in full, and Connecticut, Maryland, Ohio, Texas and others in part. California and Florida don't tax it today, but California and Colorado will from 1 January 2027.",
          sources: [
            { label: "TaxJar", url: "https://www.taxjar.com/sales-tax/saas-sales-tax" },
            { label: "Eide Bailly (2026-10-15)", url: "https://www.eidebailly.com/insights/blogs/2026/10/salt20261015" },
          ],
        },
        {
          text: "Digital downloads such as e-books and downloaded software are generally taxed in about 31 states.",
          sources: [{ label: "Avalara", url: "https://www.avalara.com/us/en/blog/state-by-state-guide-to-digital-products-and-sales-tax.html" }],
        },
      ],
    },
    {
      id: "japan",
      title: "Japan: 10% consumption tax",
      items: [
        {
          text: "The rate is 10%: 7.8% national and 2.2% local.",
          sources: [{ label: "National Tax Agency", url: "https://www.nta.go.jp/english/taxes/consumption_tax/01.htm" }],
        },
        {
          text: "Foreign sellers file and pay themselves on electronic services sold to consumers (e-books, software, cloud services); for services only businesses use, such as advertising, the Japanese buyer pays under the reverse charge. A site that says \"businesses only\" but doesn't actually stop individuals still counts as selling to consumers.",
          sources: [{ label: "NTA guide for foreign businesses", url: NTA_FOREIGN }],
        },
        {
          text: "Sales of up to ¥10 million in the base period are exempt, and foreign sellers must appoint a tax agent. You can also register voluntarily as a qualified invoice issuer, which Japanese business buyers need to claim input tax; once registered, you owe tax whatever your sales.",
          sources: [{ label: "NTA guide for foreign businesses", url: NTA_FOREIGN }],
        },
        {
          text: "Platform taxation since April 2025: for sales made and paid through designated platforms (App Store, Google Play, AWS Marketplace, Nintendo eShop, and Epic Games Store from 1 December 2026), the platform files and pays, and the seller doesn't.",
          sources: [
            { label: "Platform taxation", url: "https://www.nta.go.jp/english/taxes/consumption_tax/0024004-028_01.pdf" },
            { label: "Designated platforms", url: "https://www.nta.go.jp/publication/pamph/shohi/kazei/pdf/0024010-019.pdf" },
          ],
        },
      ],
    },
    {
      id: "korea",
      title: "South Korea: 10% VAT, no threshold",
      items: [
        {
          text: "A foreign business supplying games, audio and video, software, advertising or cloud services to Korea online must register as a simplified business within 20 days of starting, with no sales threshold in the law. The rate is 10%, filed and paid within 25 days after each quarter.",
          sources: [{ label: "Korean VAT Act", url: KR_VAT_LAW }],
        },
        {
          text: "Sales to registered Korean businesses for their business use fall outside this registration; open marketplaces and platforms that collect payment are treated as the supplier.",
          sources: [{ label: "Korean VAT Act", url: KR_VAT_LAW }],
        },
      ],
    },
    {
      id: "indonesia",
      title: "Indonesia: appointed by the tax office",
      items: [
        {
          text: "Foreign e-commerce sellers collect VAT at a nominal 12%, but on 11/12 of the price, so about 11% in effect.",
          sources: [
            { label: "Directorate General of Taxes", url: ID_PMSE },
            { label: "PMK 131/2024 explainer", url: "https://www.pajak.go.id/id/artikel/pmk-1312024-tarif-ppn-sebelas-dua-belas" },
          ],
        },
        {
          text: "Sellers with Indonesian sales over Rp600 million a year (or Rp50 million a month), and/or over 12,000 visits a year (or 1,000 a month), are appointed as collectors by the tax office; smaller sellers can apply. Payment and returns are monthly, due by the end of the following month.",
          sources: [{ label: "Directorate General of Taxes", url: ID_PMSE }],
        },
      ],
    },
    {
      id: "vietnam",
      title: "Vietnam: new rules in 2025 and again in 2026",
      items: [
        {
          text: "Since 1 July 2025, VAT on services a foreign seller supplies to Vietnam through e-commerce or digital platforms is 10%, up from 5%.",
          sources: [
            { label: "Deloitte", url: "https://www.deloitte.com/content/dam/assets-zone1/southeast-asia/en/docs/services/tax/2024/vn-tax-alert-new-law-on-vat-vi.pdf" },
            { label: "PwC", url: "https://taxsummaries.pwc.com/vietnam/corporate/other-taxes" },
          ],
        },
        {
          text: "Decree 252, in force since 1 July 2026: Vietnamese business buyers withhold the tax when they pay; platforms with ordering and payment functions withhold it; where nobody withholds, the seller registers, files and pays itself, monthly for regular business.",
          sources: [
            { label: "EY (2026-07-30)", url: "https://www.ey.com/en_vn/technical/tax/tax-and-law-updates/digital-tax-regulatory-update-in-vietnam" },
            { label: "PwC", url: "https://taxsummaries.pwc.com/vietnam/corporate/withholding-taxes" },
          ],
        },
        {
          text: "A seller whose Vietnamese income has all been withheld at source doesn't need to register for tax.",
          sources: [{ label: "LuatVietnam (2026-07-09)", url: "https://luatvietnam.vn/legal-updates/foreign-suppliers-exempt-from-tax-registration-in-certain-cases-from-july-1-2026-892-110260-article.html" }],
        },
      ],
    },
    {
      id: "russia",
      title: "Russia",
      items: [
        {
          text: "VAT rose to 22% on 1 January 2026; electronic services are taxed at 22/122 of the tax-inclusive price, about 18.03%.",
          sources: [
            { label: "Federal Tax Service", url: "https://www.nalog.gov.ru/rn26/news/smi/16596761/" },
            { label: "Tax Code art. 174.2", url: "https://www.audit-it.ru/nk/174_2.html" },
          ],
        },
        {
          text: "Foreign e-service providers register in the tax service's dedicated online office, which takes about 30 working days to open. Returns are due by the 25th and payment by the 28th of the month after each quarter. Sellers also pay on sales to Russian businesses; there is no reverse charge.",
          sources: [
            { label: "Foreign provider office", url: "https://lkioreg.nalog.ru/en/" },
            { label: "Tax Code art. 174.2", url: "https://www.audit-it.ru/nk/174_2.html" },
          ],
        },
        {
          text: "In practice Paddle and Lemon Squeezy don't sell to Russian buyers at all; see the guide on how buyers pay.",
          sources: [{ label: "Paddle", url: "https://www.paddle.com/help/legal/sanctions/which-countries-are-supported-by-paddle" }],
        },
      ],
    },
    {
      id: "china",
      title: "Mainland China",
      items: [
        {
          text: "The VAT Law took effect on 1 January 2026: services consumed in China are taxable, generally at 6%, and for taxable transactions by foreign sellers the buyer withholds the tax.",
          sources: [{ label: "VAT Law", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5237365/content.html" }],
        },
        {
          text: "The implementing regulations don't say how a foreign seller registers when selling to individuals; we found no route like the EU's OSS.",
          sources: [{ label: "Implementing regulations", url: "https://fgk.chinatax.gov.cn/zcfgk/c100010/c5246349/content.html" }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Assuming you owe no EU VAT until €10,000 of sales: that threshold is only for sellers established in the EU.",
      sources: [{ label: "EU OSS guide", url: OSS_GUIDE }],
    },
    {
      text: "Assuming the UK's £90,000 threshold applies: foreign sellers must register from the first sale.",
      sources: [{ label: "HMRC registration", url: "https://www.gov.uk/government/publications/vat-notice-7001-should-i-be-registered-for-vat/vat-notice-7001-should-i-be-registered-for-vat" }],
    },
    {
      text: "Writing \"businesses only\" on the site and treating every sale as B2B: Japan's tax agency says it still counts as selling to consumers if individuals can buy.",
      sources: [{ label: "NTA guide for foreign businesses", url: NTA_FOREIGN }],
    },
    {
      text: "Watching only the dollar threshold in the US: 15 states also count transactions, and 200 sales a year is enough.",
      sources: [{ label: "Sales Tax Institute", url: "https://salestaxinstitute.com/resources/economic-nexus-state-guide" }],
    },
    {
      text: "Expecting Russian business buyers to self-account for VAT: Russia makes the foreign seller pay.",
      sources: [{ label: "Tax Code art. 174.2", url: "https://www.audit-it.ru/nk/174_2.html" }],
    },
  ],
  unknowns: [
    "Vietnam: we couldn't read Decrees 252 and 90 in the original, and the tax portal for foreign suppliers didn't load; the corporate income tax rate on digital services, the monthly deadline, any registration threshold, and whether the 2% VAT cut from July 2025 to the end of 2026 applies to foreign digital services are unconfirmed.",
    "Russia: the 18.03% comes from a reprint of the Tax Code, not a tax service page; whether FastSpring actually accepts Russian payments today.",
    "South Korea: the penalty for not registering is unconfirmed.",
    "Indonesia: the tax office page doesn't say how sales to businesses are treated.",
    "Japan: the exact definition of the base period, and other 2024 changes for newly formed foreign companies.",
    "EU: whether e-books qualify for reduced rates differs by country; we didn't check each one.",
    "US: state filing frequencies and local taxes aren't covered, and sources disagree on how many states tax SaaS.",
    "Paddle's tax page dates from August 2025 and may not reflect Vietnam's move to 10%; Lemon Squeezy hasn't published a timetable for moving to Stripe.",
  ],
  related: [
    { label: "Payment platform picker", path: "/payments" },
    { label: "How buyers pay, by market", path: "/local-payments" },
    { label: "A China, UK and US company: who does what", path: "/company-roles" },
    { label: "Cashing out and tax", path: "/cash-out" },
  ],
};
