// English version of ../company-roles.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// How to split the work when you have a Chinese company, a UK company and a US single-member LLC, plus a step-by-step checklist for D-U-N-S and developer accounts.
// "What each company handles" is a suggestion, not an official rule. Everything else follows official pages, checked on 2026-10-20: Chinese VAT follows the VAT Law
// implementing regulations from 2026-01-01, the BOI exemption has been permanent since 2026-08-14, and visible labels for AI-generated content apply only to services
// that could confuse the public (implicit labels are required on everything).
// The US side only covers a foreign-owned single-member LLC (a disregarded entity for tax purposes). A C corporation is a different case.

const IRS_W9_FORM = "https://www.irs.gov/pub/irs-pdf/fw9.pdf";
const IRS_5472 = "https://www.irs.gov/instructions/i5472";
const IRS_SS4 = "https://www.irs.gov/instructions/iss4";
const APPLE_ICP = "https://developer.apple.com/help/app-store-connect/reference/app-information/";
const APPLE_STATUS = "https://developer.apple.com/help/app-store-connect/reference/app-information/app-and-submission-statuses/";
const APPLE_DUNS = "https://developer.apple.com/support/D-U-N-S/";
const APPLE_ENROLL = "https://developer.apple.com/support/enrollment/";
const APPLE_DSA = "https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/";
const GOOGLE_ORG = "https://support.google.com/googleplay/android-developer/answer/13628312";
const MIIT_FILING = "https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/art/2023/art_920db564162e4312916a01bed6540ad8.html";
const CAC_AI = "https://www.cac.gov.cn/2026-09/14/c_1791136833136332.htm";
const CAC_LABEL = "https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm";
const WY_SOS = "https://sos.wyo.gov/faqs.aspx?root=BUS";
const VAT_2026 = "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5247437/content.html";
const HMRC_TERRITORIES = "https://www.gov.uk/hmrc-internal-manuals/international-manual/intm412090";
// Chinese Android stores: listing requirements (software copyright) and business account verification, from each store's developer docs
const SOFTCOPY = [
  { label: "Xiaomi", url: "https://dev.mi.com/xiaomihyperos/documentation/detail?pId=2251" },
  { label: "OPPO", url: "https://open.oppomobile.com/documentation/page/info?id=12133" },
  { label: "vivo", url: "https://dev.vivo.com.cn/documentCenter/doc/90" },
  { label: "Honor", url: "https://developer.honor.com/cn/doc/guides/101152" },
  { label: "Tencent MyApp", url: "https://wikinew.open.qq.com/index.html#/iwiki/4007776097" },
  { label: "Huawei", url: "https://developer.huawei.com/consumer/cn/doc/doccenter-submission/80301" },
];
const STORE_ACCOUNTS = [
  { label: "Huawei", url: "https://developer.huawei.com/consumer/cn/doc/doccenter-getting-started/hdc-edrna-process-0000002752798603" },
  { label: "Xiaomi", url: "https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1731" },
  { label: "OPPO", url: "https://open.oppomobile.com/documentation/page/info?id=10446" },
  { label: "vivo", url: "https://dev.vivo.com.cn/documentCenter/doc/2" },
  { label: "Honor", url: "https://developer.honor.com/cn/doc/guides/100619" },
  { label: "Tencent MyApp", url: "https://wikinew.open.qq.com/index.html#/iwiki/4007776081" },
];

export const COMPANY_ROLES_EN: Guide = {
  slug: "company-roles",
  short: "Splitting work across 3 companies",
  parent: { short: "Opening accounts", path: "/open-account" },
  title: "A Chinese company, a UK company and a US LLC: which one owns the app, how to open the accounts, and what each files every year",
  description:
    "You have a Chinese company, a UK company and a US single-member LLC. Which one should own the China app and which the global app, in what order to get D-U-N-S numbers and Apple, Google and Chinese Android store developer accounts, what each company files every year, and how the Chinese company can charge the UK company a service fee under a contract for development work. Based on official pages.",
  intro:
    "Each company has its own hurdles. Apple's China storefront needs an MIIT filing number, which only a Chinese company can get. Store revenue booked to the UK company is generally not subject to US withholding under the US-UK tax treaty. A US LLC is the easiest way to open a US Stripe account, but a foreign-owned single-member LLC has to file Form 5472 every year. Below is one way to split the work and an order for opening accounts, then what each company has to do based on official pages, and finally how to move money between the three companies in a compliant way.",
  checked: "2026-10-20",
  sections: [
    {
      id: "roles",
      title: "What each company handles",
      lead: "This is one way to split it, not an official rule: it is based on what each company can do and which one loses the least to tax on incoming payments.",
      items: [
        {
          text: "The Chinese company runs the China app: it lists on Apple's China storefront (using the Chinese company's own developer account) and on Chinese Android stores, and takes payments through Apple in-app purchase, WeChat Pay and Alipay. Apple's China storefront requires an MIIT filing number, and the filing needs a Chinese entity, so neither the UK nor the US company can get one.",
          sources: [
            { label: "Apple", url: APPLE_ICP },
            { label: "MIIT", url: MIIT_FILING },
          ],
        },
        {
          text: "The UK company runs the global app and is the entity for all overseas business: it lists on every Apple storefront except mainland China and on Google Play, and takes web payments through a UK Stripe account or a merchant of record such as Paddle. When filling in W-8BEN-E with Apple and Google, claim the US-UK tax treaty benefits, and US storefront revenue is generally not subject to withholding.",
          sources: [{ label: "IRS W-8BEN-E instructions", url: "https://www.irs.gov/instructions/iw8bene" }],
        },
        {
          text: "The US single-member LLC only handles US payments and anything that needs a US entity: a US Stripe account for web payments from US customers (US cards on a US account get domestic rates; on a UK account they count as international cards and may also incur currency conversion fees), and a US account to receive dollars. It doesn't open any store accounts.",
          sources: [
            { label: "Stripe US pricing", url: "https://stripe.com/pricing" },
            { label: "Stripe UK pricing", url: "https://stripe.com/gb/pricing" },
          ],
        },
        {
          text: "Why the stores don't go under the single-member LLC: a foreign-owned single-member LLC is disregarded for tax purposes and can't file a W-9, even with a US tax ID. The foreign owner has to file a W-8 series form instead, and US storefront revenue is treated as paid to a foreign individual and may be subject to withholding.",
          sources: [{ label: "IRS Form W-9", url: IRS_W9_FORM }],
        },
        {
          text: "The China app and the global app are two separate apps: they use different Bundle IDs and each sits under its own developer account. Data of users in China is stored on servers in China, and data of overseas users is stored overseas. Sending personal information out of China is subject to separate rules.",
        },
      ],
    },
    {
      id: "accounts",
      title: "D-U-N-S and developer accounts: do them in this order",
      lead: "D-U-N-S is the slowest, so start there. Open the UK company's accounts first and ship the global app first. Submit the China app once the filing and software copyright are done.",
      items: [
        {
          text: "Step 1, D-U-N-S (Dun & Bradstreet number): the Chinese company and the UK company each need one. The US LLC doesn't, as long as it opens no store accounts. Sign in with your Apple Account and search with Apple's D-U-N-S lookup tool. If you can't find your company, submit a request in the tool with the company's legal name, headquarters address, mailing address and your work contact details. It's free. D&B issues the number within 5 business days, and expediting doesn't help. After issuance it can take Apple up to 2 more business days to see it. If you hear nothing for over 2 weeks, or you already have a number but the details don't match, email D&B to sort it out.",
          sources: [
            { label: "Apple D-U-N-S guide", url: APPLE_DUNS },
            { label: "Chinese version", url: "https://developer.apple.com/cn/support/D-U-N-S/" },
            { label: "Lookup tool", url: "https://developer.apple.com/enroll/duns-lookup/" },
          ],
        },
        {
          text: "Step 2, enroll the UK company in the Apple Developer Program (organization): the company must be a legal entity (not a trade name or branch); it needs a D-U-N-S number; you need the authority to sign agreements for the company, and if you're not the owner you must provide a contact who can confirm that; use a work email on the company domain; the company domain must host a working website (social media pages and parked domains don't count); and your Apple Account must have two-factor authentication and use your legal name. You can enroll in the Apple Developer app on iPhone, iPad or Mac. The fee is US$99 a year, shown in local currency when you enroll. Apple may contact you to verify, or ask for notarized documents.",
          sources: [
            { label: "Apple enrollment requirements", url: APPLE_ENROLL },
            { label: "Fees", url: "https://developer.apple.com/programs/enroll/" },
          ],
        },
        {
          text: "Step 3, register the UK company on Google Play (organization account): a one-time US$25, not refunded if identity verification fails. You need a D-U-N-S number (free, but Google says it can take up to 30 days), an organization phone number and website. The contact and the public developer email and phone must all be verified with codes. You also submit government ID and organization documents that match your payments profile, and verify your website. The closed testing requirement (at least 12 testers for 14 days in a row) only applies to personal accounts created after 13 November 2023.",
          sources: [
            { label: "Google organization account requirements", url: GOOGLE_ORG },
            { label: "Identity verification", url: "https://support.google.com/googleplay/android-developer/answer/10841920" },
            { label: "Closed testing requirement", url: "https://support.google.com/googleplay/android-developer/answer/14151465" },
          ],
        },
        {
          text: "Step 4, the UK company's App Store Connect: sign the Paid Apps Agreement and enter tax forms (W-8BEN-E) and bank details. Declare your EU DSA trader status. Every developer must declare it, the organization's D-U-N-S address is shown automatically on EU product pages, and since 17 February 2025 apps without a declaration have been removed from the EU. Remove mainland China from the availability list.",
          sources: [
            { label: "Apple DSA requirements", url: APPLE_DSA },
            { label: "Apple announcement", url: "https://developer.apple.com/news/?id=einwn76m" },
          ],
        },
        {
          text: "Step 5, the US LLC's EIN: you can't apply online without an SSN or ITIN. You can call +1 267-941-1099 (not toll-free; Monday to Friday, 6:00 to 23:00 Eastern; the caller must be authorized to receive the number for the company), or fax Form SS-4 from outside the US to 304-707-9471, which usually comes back within 4 business days. By mail it takes about 4 weeks. Once you have the EIN, open a US bank account and a US Stripe account. In Stripe, fill in W-8BEN as the individual owner.",
          sources: [
            { label: "IRS SS-4 instructions", url: IRS_SS4 },
            { label: "IRS online application", url: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" },
          ],
        },
        {
          text: "Step 6, the Chinese company's Apple developer account: in mainland China you can only enroll through the Apple Developer app on iPhone or iPad. It requires CFCA identity verification and a selfie, and the fee is 688 yuan a year.",
          sources: [{ label: "Apple guide (Chinese)", url: "https://developer.apple.com/cn/support/app-account/" }],
        },
        {
          text: "Step 7, business developer accounts on Chinese Android stores: Huawei, Xiaomi, OPPO, vivo, Honor and Tencent MyApp all verify with your business licence, followed by a payment from the company bank account or a manual review (details vary by store). Xiaomi only accepts business accounts. Get the software copyright, app filing (and AI registration if needed) done before submitting the app.",
          sources: STORE_ACCOUNTS,
        },
      ],
    },
    {
      id: "china-app",
      title: "China app: what the Chinese company has to do",
      items: [
        {
          text: "App filing: an MIIT notice issued in August 2023 requires apps that provide internet information services in China to be filed before launch. Existing apps had to file between September 2023 and March 2024. App stores may not distribute apps without a filing.",
          sources: [
            { label: "MIIT notice", url: MIIT_FILING },
            { label: "Chinese government website", url: "https://www.gov.cn/zhengce/zhengceku/202308/content_6897341.htm" },
          ],
        },
        {
          text: "The filing number on Apple's China storefront: enter it under App Information in App Store Connect. It must match the MIIT filing. Apps without a valid filing number can't be listed on the mainland China storefront.",
          sources: [
            { label: "App information", url: APPLE_ICP },
            { label: "Status reference", url: APPLE_STATUS },
          ],
        },
        {
          text: "Software copyright: Xiaomi, OPPO, vivo, Honor and Tencent MyApp require, for every app, a Computer Software Copyright Registration Certificate, or one of an App Electronic Copyright Certificate or a Software Copyright Certification Certificate. Xiaomi doesn't accept \"application pending\". Huawei doesn't require it for now, except for games (which need software copyright plus a game publishing licence).",
          sources: SOFTCOPY,
        },
        {
          text: "Generative AI: generative AI services with public opinion attributes or social mobilization capability must be filed or registered with the Cyberspace Administration of China (CAC). Apps or features that directly call an already filed large model (through an API, for example) are registered with the local CAC office. As of 31 August 2026, 1,112 services nationwide had completed filing and 731 apps or features had completed registration. After launch, you must publicly display the name of the model used and its filing number or launch number.",
          sources: [{ label: "CAC announcement, 2026-09-14", url: CAC_AI }],
        },
        {
          text: "Labelling AI-generated content: from 1 September 2025, AI-generated text, images, audio, video and virtual scenes must carry an implicit label in the file metadata. Content that could confuse or mislead the public (face swaps or synthetic voices, for example) must also carry a visible explicit label. App stores check labelling materials when you list the app.",
          sources: [
            { label: "Labelling Measures", url: CAC_LABEL },
            { label: "Deep Synthesis Provisions, Art. 17", url: "https://www.cac.gov.cn/2022-12/11/c_1672221949354811.htm" },
          ],
        },
      ],
    },
    {
      id: "overseas-app",
      title: "Global app: what the UK company has to do",
      lead: "For opening the accounts, see steps 2 to 4 above. This section covers the yearly tasks.",
      items: [
        {
          text: "Corporation Tax: 19% on profits up to £50,000, 25% above £250,000, with marginal relief in between. If you have associated companies, both thresholds are divided by the number of companies.",
          sources: [
            { label: "GOV.UK", url: "https://www.gov.uk/corporation-tax-rates" },
            { label: "Rates table", url: "https://www.gov.uk/government/publications/rates-and-allowances-corporation-tax/rates-and-allowances-corporation-tax" },
          ],
        },
        {
          text: "Data protection fee: UK companies that process personal data pay it to the ICO every year. Tier 1, for up to 10 staff or annual turnover up to £632,000, is £52, or £47 by direct debit (since February 2025; it used to be £40).",
          sources: [
            { label: "ICO", url: "https://ico.org.uk/for-organisations/data-protection-fee/faqs-data-protection-fee-payment-and-online-registration/" },
            { label: "SI 2025/63", url: "https://www.legislation.gov.uk/uksi/2025/63/contents" },
          ],
        },
        {
          text: "Annual accounts and confirmation statement: both go to Companies House every year. For how to do it yourself, see the related posts at the end.",
          sources: [
            { label: "Annual accounts", url: "https://www.gov.uk/file-your-company-annual-accounts" },
            { label: "Confirmation statement", url: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house" },
          ],
        },
      ],
    },
    {
      id: "us-llc",
      title: "US single-member LLC: what to file every year",
      lead: "For the state side, this uses the most common choice, a Wyoming LLC, as the example. Other states have different annual reports and state taxes.",
      items: [
        {
          text: "Form 5472: a foreign-owned single-member LLC files Form 5472 every year by the Form 1120 due date (15 April for a calendar year), attached to a Form 1120 with only the basic information filled in and \"Foreign-owned U.S. DE\" written across the top. All transactions between the owner and the company, such as putting money into the company or taking money out, must be reported. It can't be e-filed: fax it to 855-887-7737, or mail it to the IRS address in Ogden, Utah (see the instructions). If you can't make it, request an extension with Form 7004 before 15 April, usually for 6 months. The penalty for not filing or filing incompletely is US$25,000, plus another US$25,000 for every 30 days it stays uncorrected beyond 90 days after the IRS notice.",
          sources: [
            { label: "IRS 5472 instructions", url: IRS_5472 },
            { label: "Form 1120 due date", url: "https://www.irs.gov/instructions/i1120" },
            { label: "Form 7004 extension", url: "https://www.irs.gov/instructions/i7004" },
          ],
        },
        {
          text: "Wyoming annual report: due on the first day of the month of formation each year (formed on 15 January means due 1 January every year), and you can file up to 120 days early. The fee is US$60 or 0.0002 times the company's assets in Wyoming, whichever is higher (US$60 for assets up to US$300,000). If it is still not filed 60 days after the due date, the company is administratively dissolved, and it can be reinstated within 2 years.",
          sources: [{ label: "Wyoming Secretary of State", url: WY_SOS }],
        },
        {
          text: "State income tax: Wyoming has no personal income tax and no corporate income tax. Compare California: an LLC formed in California or doing business there pays at least US$800 a year, plus an LLC fee of US$900 to 11,790 by bracket once California total income reaches US$250,000. The corporate (C corp) rate is 8.84%. An out-of-state company also counts as doing business in California if its California sales exceed US$757,070 a year (the 2025 threshold) or 25% of total sales.",
          sources: [
            { label: "State of Wyoming", url: "https://www.wyo.gov/about-wyoming" },
            { label: "California LLC", url: "https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html" },
            { label: "California tax rates", url: "https://www.ftb.ca.gov/file/business/tax-rates.html" },
            { label: "California \"doing business\" rules", url: "https://www.ftb.ca.gov/file/business/doing-business-in-california.html" },
          ],
        },
        {
          text: "BOI (beneficial ownership information) reporting: a FinCEN final rule effective 14 August 2026 permanently exempts companies formed in the US from the reporting requirement.",
          sources: [
            { label: "FinCEN", url: "https://www.fincen.gov/news/news-releases/fincen-permanently-ends-beneficial-ownership-reporting-requirements-millions" },
            { label: "Federal Register", url: "https://www.federalregister.gov/documents/2026/08/14/2026-16576/beneficial-ownership-information-reporting-requirement-revision" },
          ],
        },
      ],
    },
    {
      id: "dev-fee",
      title: "The Chinese company doing development for the UK company: contract and service fee",
      lead: "If the global app's code is written by the team in China, the common approach is a development services contract between the two companies: the UK company pays a service fee under the contract, and the IP in the code belongs to the UK company.",
      items: [
        {
          text: "Spell out in the contract: scope of services and deliverables, acceptance criteria, that the code and related IP belong to the UK company once paid, the pricing method, monthly or quarterly English invoices, currency and payment terms, confidentiality and governing law.",
        },
        {
          text: "Pricing: since both companies are controlled by the same person, this is a related-party transaction and must be priced at arm's length. Development services commonly use cost plus (costs plus a comparable profit margin). The Chinese company must attach the related-party transactions report forms to its annual corporate income tax return. A separate local file is only needed when other related-party transactions exceed 40 million yuan a year.",
          sources: [{ label: "STA Announcement No. 42 [2016]", url: "https://fgk.chinatax.gov.cn/zcfgk/c100012/c5194659/content.html" }],
        },
        {
          text: "VAT (from 1 January 2026, under the VAT Law implementing regulations): software services (including software development), R&D services and similar services provided to an overseas entity and consumed entirely outside China are zero-rated. To use the zero rate, complete the export refund (exemption) filing. Software services contracts must also first be registered in MOFCOM's Service Outsourcing and Software Export Management Information System, and R&D services need a technology export contract registration certificate. Small-scale taxpayers get an exemption instead and must complete an exemption filing. You can also give up the zero rate and choose exemption, but you can't switch back for 36 months. Refunds or exemptions not claimed within 36 months are taxed as domestic sales.",
          sources: [
            { label: "VAT Law implementing regulations", url: "https://www.gov.cn/zhengce/content/202512/content_7053149.htm" },
            { label: "Announcement No. 11 [2026]", url: VAT_2026 },
            { label: "Scope of software services", url: "https://www.gov.cn/zhengce/zhengceku/202602/content_7056762.htm" },
            { label: "Exemption filing (Announcement No. 29 [2016])", url: "https://fgk.chinatax.gov.cn/zcfgk/c100012/c5194646/content.html" },
          ],
        },
        {
          text: "Corporate income tax: a small low-profit enterprise (annual taxable income up to 3 million yuan, up to 300 employees, total assets up to 50 million yuan) counts only 25% of its income as taxable and pays 20% on that, which works out to 5%. This runs until 31 December 2027.",
          sources: [{ label: "MOF and STA Announcement No. 12 [2023]", url: "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5210453/content.html" }],
        },
        {
          text: "Contract registration: technology export contracts (including technical service contracts) are registered online within 60 days after the contract takes effect. Custom software development for overseas clients counts as software export and goes through MOFCOM's software export contract registration, which you need for the zero rate.",
          sources: [
            { label: "Measures on Technology Import and Export Contract Registration", url: "https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=679" },
            { label: "Software Export Management and Statistics Measures", url: "https://www.gov.cn/gongbao/content/2002/content_61890.htm" },
          ],
        },
        {
          text: "Receiving the money: the UK company wires it to the Chinese company's corporate foreign currency account. For a single payment up to US$50,000, the bank in principle doesn't review documents. Above that, the bank checks documents such as the contract and invoice. Incoming funds from abroad must be reported for balance of payments within 5 business days after crediting or conversion. Advance payments between related parties should in principle not exceed 12 months.",
          sources: [
            { label: "Current Account FX Business Guidelines (2020)", url: "https://www.gov.cn/gongbao/content/2020/content_5560296.htm" },
            { label: "Balance of payments reporting (Hui Fa [2022] No. 22)", url: "https://www.safe.gov.cn/shanghai/file/file/20220805/3c96795aa2c74461bd9eee8efe4d8b0c.pdf" },
          ],
        },
        {
          text: "On the UK side: UK transfer pricing rules don't apply to transactions between an SME and a Chinese related party, because China is on HMRC's qualifying territories list. The Chinese related-party rules still apply on the Chinese side.",
          sources: [
            { label: "HMRC SME exemption", url: "https://www.gov.uk/hmrc-internal-manuals/international-manual/intm412070" },
            { label: "Qualifying territories list", url: HMRC_TERRITORIES },
          ],
        },
        {
          text: "Don't write it as a licence with revenue share: when a UK company pays royalties abroad, it must withhold income tax at the 20% basic rate, reduced to 10% under the China-UK tax treaty. So write the contract as \"development services plus assignment of IP in the code\", not \"licence to use, with a share of sales\". If one contract mixes services and a licence, the two must be split.",
          sources: [
            { label: "Income Tax Act 2007 s.906", url: "https://www.legislation.gov.uk/ukpga/2007/3/section/906" },
            { label: "HMRC guidance", url: "https://www.gov.uk/hmrc-internal-manuals/international-manual/intm630250" },
            { label: "Splitting mixed contracts", url: "https://www.gov.uk/hmrc-internal-manuals/international-manual/intm630330" },
            { label: "China-UK tax treaty", url: "https://www.gov.uk/government/publications/china-tax-treaties/2011-uk-china-double-taxation-agreement-in-force" },
          ],
        },
        {
          text: "Export controls: the Catalogue of Technologies Prohibited or Restricted from Export (2023 edition) lists only two restricted AI technologies: AI interaction interface technology designed specifically for Chinese and ethnic minority languages, and personalized information push technology based on data analysis. Exporting them needs a licence. On 16 October 2026 MOFCOM published a draft for comment that would add 23 more AI technologies (large models, agents and more), and technologies on the list already need registration before export. MOFCOM's Q&A says providing services through an API, app, website or SaaS is not technology export, while local deployment overseas is. Check the list before handing code to the UK company.",
          sources: [
            { label: "2023 catalogue", url: "https://www.most.gov.cn/tztg/202312/W020231221620858841394.pdf" },
            { label: "2026 draft for comment", url: "https://www.mofcom.gov.cn/zwgk/zcfb/art/2026/art_0a31a3c9ac404f7a9b0e917ce3412997.html" },
            { label: "MOFCOM press Q&A", url: "https://www.mofcom.gov.cn/syxwfb/art/2026/art_a4acff07e134447fbe7bbeb486df3ea6.html" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Not removing mainland China when listing under the UK company's Apple account: without a valid filing number, the app can't go live on the mainland China storefront.",
      sources: [{ label: "Apple status reference", url: APPLE_STATUS }],
    },
    {
      text: "Leaving D-U-N-S until last: Apple's side takes up to 5 plus 2 business days, and Google says it can take up to 30 days.",
      sources: [
        { label: "Apple", url: APPLE_DUNS },
        { label: "Google", url: GOOGLE_ORG },
      ],
    },
    {
      text: "Filing a W-9 for a foreign-owned single-member LLC: not allowed. The foreign owner files a W-8.",
      sources: [{ label: "IRS Form W-9", url: IRS_W9_FORM }],
    },
    {
      text: "Thinking a year with no business means no Form 5472: the owner putting money in or taking money out counts as a reportable transaction, and missing it costs US$25,000.",
      sources: [{ label: "IRS 5472 instructions", url: IRS_5472 }],
    },
    {
      text: "Forgetting the Wyoming annual report: 60 days past the due date, the company is administratively dissolved.",
      sources: [{ label: "Wyoming Secretary of State", url: WY_SOS }],
    },
    {
      text: "Moving money between the three companies without a contract, or having the UK company pay into a personal account: you won't be able to explain it for tax or foreign exchange purposes in China or abroad.",
    },
  ],
  unknowns: [
    "How the US single-member LLC's profits are classified for Chinese individual income tax, and whether US withholding can be credited: there is no official guidance for this structure, so ask a tax adviser.",
    "What cost-plus markup counts as reasonable for related-party transactions: there is no fixed official number; it depends on comparable companies.",
    "Google only says the 12-tester closed test applies to personal accounts, and doesn't explicitly say organization accounts are exempt.",
    "Apple hasn't published the UK annual fee in pounds; it is shown in local currency when you enroll.",
    "HMRC has no page that directly says service fees paid abroad are free of withholding. It only says contracts that mix services and licences must be split.",
    "The new AI technology export list is still a draft for comment (deadline 15 November 2026), so the final scope isn't settled.",
  ],
  posts: ["us-llc-mercury-stripe-168-usd", "uk-company-annual-review-timeline-checklist", "uk-company-wise-business-account"],
};
