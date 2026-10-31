// English version of ../hk-company.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// What a Hong Kong company has to do every year after incorporation, and what it costs: compiled from the Companies Registry,
// the Inland Revenue Department, the ordinances and the HKMA. Audit, secretary and address prices have no official rate and are marked "market quote".
const CR = "https://www.cr.gov.hk/en/compliance/annual-return/private-company.htm";
const BEL = "https://www.ird.gov.hk/eng/pdf/bel26e.pdf";
const CR_AUDIT_FAQ = "https://cr.gov.hk/en/companies_ordinance/faq_account-audit.htm";

export const HK_COMPANY_EN: Guide = {
  slug: "hk-company",
  short: "HK company upkeep",
  parent: { short: "Opening accounts", path: "/open-account" },
  title: "What a Hong Kong company has to do every year: annual return, business registration, audit, tax return and costs",
  description:
    "You set up a Hong Kong company to open Stripe. Now every year you have to file an annual return, renew business registration, get an audit and file a profits tax return, and keep a company secretary and a Hong Kong address. A timeline and the minimum yearly cost, based on official Companies Registry and Inland Revenue Department pages.",
  intro:
    "Many people register a Hong Kong company to open Stripe and only find out afterwards that there are fixed filings and an audit every year. This guide is based on the Companies Registry, the Inland Revenue Department and the ordinances themselves, and covers everything from the first year to closing the company.",
  checked: "2026-10-17",
  sections: [
    {
      id: "yearly",
      title: "What you file every year",
      items: [
        {
          text: "Annual return (NAR1): due within 42 days after the anniversary of incorporation each year. HK$105 if filed on time. Filed more than 42 days late but within 3 months, it is HK$870, rising step by step to HK$3,480, and the Registrar can neither extend nor waive it. Late filing is also a criminal offence, with a maximum fine of HK$50,000. No return is due in the year of incorporation.",
          sources: [
            { label: "Companies Registry", url: CR },
            { label: "Companies Ordinance s.662", url: "https://www.elegislation.gov.hk/hk/cap622!en/s662" },
          ],
        },
        {
          text: "Business registration certificate: a local company must renew it every year, whether or not it does any business, until the company is dissolved. For certificates starting on or after 1 April 2026, a 1-year certificate is HK$2,350 (HK$2,200 fee plus HK$150 levy) and a 3-year certificate is HK$6,170.",
          sources: [
            { label: "Inland Revenue Department", url: "https://www.ird.gov.hk/eng/tax/bre_cbr.htm" },
            { label: "Fee data", url: "https://www.ird.gov.hk/datagovhk/brfee.csv" },
          ],
        },
        {
          text: "Profits tax return (BIR51): a new company usually receives its first one about 18 months after incorporation and has 3 months to file it. After that, returns are bulk issued on 1 April each year and are generally due within 1 month. If you have a tax representative, you get a block extension based on your year-end date.",
          sources: [
            { label: "Block extension letter", url: BEL },
            { label: "2026 issue announcement", url: "https://www.ird.gov.hk/eng/ppr/archives/26040102.htm" },
          ],
        },
        {
          text: "Employer's return (BIR56A): issued every April and due within 1 month of receipt. You must file it even with no employees (tick \"NO\").",
          sources: [{ label: "Inland Revenue Department", url: "https://www.ird.gov.hk/eng/tax/ere_obl.htm" }],
        },
      ],
    },
    {
      id: "audit",
      title: "You can't skip the audit",
      items: [
        {
          text: "Any company with income must attach an auditor's report and financial statements to its profits tax return. From the 2022/23 year of assessment this applies whatever the income. The claim you see online that companies with annual income under HK$2 million don't need to attach them is out of date.",
          sources: [
            { label: "Inland Revenue Department", url: "https://www.ird.gov.hk/eng/tax/bus_cpt.htm" },
            { label: "2023 announcement", url: "https://www.ird.gov.hk/eng/ppr/archives/23040301.htm" },
          ],
        },
        {
          text: "Only a certified public accountant (practising) or a CPA firm can do the audit. The \"simplified reporting exemption\" only lets you prepare the statements under the SME financial reporting standard. You still need an audit.",
          sources: [
            { label: "Companies Ordinance s.393", url: "https://www.elegislation.gov.hk/hk/cap622!en/s393" },
            { label: "Companies Registry FAQ", url: CR_AUDIT_FAQ },
          ],
        },
        {
          text: "A company declared dormant is exempt from the audit and the annual return, but loses the exemption as soon as it has any accounting transaction. A company that has taken money through Stripe can't use it.",
          sources: [
            { label: "Companies Ordinance s.5", url: "https://www.elegislation.gov.hk/hk/cap622!en/s5" },
            { label: "s.447", url: "https://www.elegislation.gov.hk/hk/cap622!en/s447" },
          ],
        },
        {
          text: "There is no official audit fee. Market quotes: HK$5,000 to 10,000 for a company with no transactions, HK$8,000 to 20,000 for a small company with turnover under HK$5 million, usually including the tax computation.",
          sources: [{ label: "Market quote, not official", url: "https://air-corporate.com/hk/blog/hong-kong-company-audit" }],
        },
      ],
    },
    {
      id: "secretary",
      title: "Company secretary, registered address and significant controllers register",
      items: [
        {
          text: "You must have a company secretary. An individual must ordinarily reside in Hong Kong; a company must have its registered office or a place of business in Hong Kong. A sole director can't also be the secretary.",
          sources: [
            { label: "Companies Ordinance s.474", url: "https://www.elegislation.gov.hk/hk/cap622!en/s474" },
            { label: "s.475", url: "https://www.elegislation.gov.hk/hk/cap622!en/s475" },
          ],
        },
        {
          text: "The registered office must be in Hong Kong. Overseas addresses, \"care of\" addresses and P.O. boxes are not accepted. Anyone providing secretary or address services as a business needs a TCSP licence, and you can look up licensees online for free.",
          sources: [
            { label: "Companies Registry FAQ", url: "https://www.cr.gov.hk/en/faq/local-company/incorporation.htm" },
            { label: "TCSP register", url: "https://www.tcsp.cr.gov.hk/" },
          ],
        },
        {
          text: "Every local company must keep a significant controllers register in Hong Kong. It is not filed with the Registrar, and you must appoint a designated representative. The maximum fine for a breach is HK$25,000.",
          sources: [
            { label: "Register FAQ", url: "https://www.cr.gov.hk/en/legislation/scr/faq.htm" },
            { label: "Companies Ordinance s.653H", url: "https://www.elegislation.gov.hk/hk/cap622!en/s653H" },
          ],
        },
        {
          text: "Secretary and address services have no official price either. Market quotes: HK$1,300 to 8,000 a year for a company secretary, with the registered address sometimes charged separately.",
          sources: [{ label: "Market quote, not official", url: "https://sleek.com/hk/resources/company-secretary-cost-hong-kong/" }],
        },
      ],
    },
    {
      id: "offshore",
      title: "If the money is earned in mainland China, do you pay Hong Kong profits tax?",
      items: [
        {
          text: "Hong Kong only taxes profits arising in Hong Kong, for residents and non-residents alike. The test is where the operations that earn the profit are carried out. A contract made by phone or online by someone in Hong Kong counts as made in Hong Kong.",
          sources: [
            { label: "Inland Revenue Ordinance s.14", url: "https://www.elegislation.gov.hk/hk/cap112!en/s14" },
            { label: "DIPN 21", url: "https://www.ird.gov.hk/eng/pdf/dipn21.pdf" },
          ],
        },
        {
          text: "Online businesses follow the same principle. Where the server sits does not by itself decide the source of profits. In a June 2026 reply to the Legislative Council, the government said it depends on the nature and extent of the activities in Hong Kong and the facts of each case.",
          sources: [
            { label: "DIPN 39", url: "https://www.ird.gov.hk/eng/pdf/dipn39.pdf" },
            { label: "LegCo reply", url: "https://www.info.gov.hk/gia/general/202606/17/P2026061700398.htm" },
          ],
        },
        {
          text: "Claiming offshore status doesn't excuse you from filing: you still file the tax return and audited statements, declare the offshore profits in the return and attach an explanation. In a dispute, the burden of proof is on the company.",
          sources: [
            { label: "Block extension letter", url: BEL },
            { label: "Inland Revenue Ordinance s.68", url: "https://www.elegislation.gov.hk/hk/cap112!en/s68" },
          ],
        },
        {
          text: "Two-tiered rates: 8.25% on the first HK$2 million of profit, 16.5% on the rest. For 2025/26 there is a one-off 100% reduction, capped at HK$3,000 per case.",
          sources: [
            { label: "Inland Revenue Department", url: "https://www.ird.gov.hk/eng/tax/bus_pft.htm" },
            { label: "Budget measures", url: "https://www.ird.gov.hk/eng/tax/budget.htm" },
          ],
        },
        {
          text: "The foreign-sourced income exemption (FSIE) regime only covers interest, dividends, disposal gains and IP income. SaaS subscriptions and software sales are trading income, so they fall outside it and are still judged by the source principle above.",
          sources: [{ label: "IRD FSIE", url: "https://www.ird.gov.hk/eng/tax/bus_fsie.htm" }],
        },
      ],
    },
    {
      id: "bank",
      title: "Bank accounts",
      items: [
        {
          text: "The HKMA requires banks to take a risk-based approach rather than blanket rules, and they should not refuse an account just because the directors and shareholders are non-residents. If you have trouble opening an account, contact the HKMA's dedicated team: phone 2878 1133, email accountopening@hkma.gov.hk.",
          sources: [
            { label: "HKMA", url: "https://www.hkma.gov.hk/eng/smart-consumers/account-opening/role-of-the-hkma/" },
            { label: "Due diligence FAQ", url: "https://www.hkma.gov.hk/media/eng/doc/key-functions/banking-stability/aml-cft/faq_cdd.pdf" },
          ],
        },
        {
          text: "Digital banks are authorized by the HKMA, but each sets its own account opening requirements. For example, ZA Bank's business account requires every shareholder and director to hold a Hong Kong identity card.",
          sources: [
            { label: "HKMA digital banks", url: "https://www.hkma.gov.hk/eng/key-functions/banking/banking-regulatory-and-supervisory-regime/digital-banks/" },
            { label: "ZA Bank requirements", url: "https://bank.za.group/en/faqs/Business/Open_account/Account_opening_requirements/66504817b359be4a1952343b" },
          ],
        },
        {
          text: "Airwallex is not a bank. Its Hong Kong entity holds a money service operator licence issued by Customs, and the group separately holds a stored value facility licence.",
          sources: [
            { label: "Airwallex help", url: "https://help.airwallex.com/hc/en-gb/articles/900001757106" },
            { label: "SVF licensee register", url: "https://www.hkma.gov.hk/eng/regulatory-resources/registers/register-of-svf-licensees/" },
          ],
        },
      ],
    },
    {
      id: "calendar",
      title: "The yearly timeline and minimum cost",
      lead: "Example: incorporated on 15 June, year-end 31 December, with an accountant as tax representative. A regular year from the third year on:",
      items: [
        { text: "January: the new financial year starts, and last year's books go to the accountant for audit." },
        { text: "Early April: the IRD sends out the profits tax return and the employer's return. If you have profits but haven't received a return, you must notify the IRD in writing within 4 months of the year-end.", sources: [{ label: "Inland Revenue Department", url: "https://www.ird.gov.hk/eng/tax/noc.htm" }] },
        { text: "Early May: the employer's return is due, even with no employees." },
        { text: "Mid June: business registration expires. Pay HK$2,350." },
        { text: "Late July: the annual return is due (42nd day after the anniversary). HK$105." },
        { text: "Mid to late August: the profits tax return and audited statements are due (for 2025/26: 31 August on paper, 2 October electronically).", sources: [{ label: "Block extension letter", url: BEL }] },
        { text: "Any time: report changes of director, secretary or registered address within 15 days.", sources: [{ label: "Companies Registry FAQ", url: "https://www.cr.gov.hk/en/faq/local-company/directors-secretary.htm" }] },
        {
          text: "Minimum yearly cost: about HK$2,455 in official fees (HK$105 annual return plus HK$2,350 business registration). Add market quotes of HK$1,300 to 8,000 for secretary and address and HK$5,000 to 20,000 for the audit, and the total is roughly HK$9,000 to 30,000 a year, not counting bookkeeping, profits tax or bank fees.",
        },
      ],
    },
    {
      id: "close",
      title: "How to close it when you're done",
      items: [
        {
          text: "Conditions for deregistration: all members agree; the company never started business or has not operated for 3 months before the application; it has no liabilities; it is not party to any legal proceedings; and it owns no immovable property in Hong Kong.",
          sources: [{ label: "Companies Ordinance s.750", url: "https://www.elegislation.gov.hk/hk/cap622!en/s750" }],
        },
        {
          text: "First apply to the IRD for a Notice of No Objection to deregistration (HK$270, usually 21 working days), then file the application with the Companies Registry within 3 months (HK$420). The Registrar publishes a notice in the Gazette, and if no one objects within 3 months, the company is dissolved.",
          sources: [
            { label: "Inland Revenue Department", url: "https://www.ird.gov.hk/eng/tax/bus_han.htm" },
            { label: "Companies Registry", url: "https://www.cr.gov.hk/en/services/deregister-company.htm" },
          ],
        },
        {
          text: "Until the company is dissolved, you still have to file annual returns and pay business registration fees.",
          sources: [{ label: "Companies Registry FAQ", url: "https://www.cr.gov.hk/en/faq/local-company/dereg-striking-off-winding-up.htm" }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Thinking no income means nothing to do: business registration, the annual return and the employer's return are due every year. Late annual returns keep getting more expensive and are a criminal offence.",
      sources: [{ label: "Companies Registry", url: CR }],
    },
    {
      text: "Thinking small companies don't need an audit: every company except a dormant one needs an audit by a practising CPA, and taking money through Stripe means you're not dormant.",
      sources: [{ label: "Companies Registry FAQ", url: CR_AUDIT_FAQ }],
    },
    {
      text: "Thinking offshore status is automatic: you have to declare it, explain it and be able to prove it.",
      sources: [{ label: "Inland Revenue Ordinance s.68", url: "https://www.elegislation.gov.hk/hk/cap112!en/s68" }],
    },
    {
      text: "Business records must be kept for at least 7 years.",
      sources: [{ label: "Inland Revenue Ordinance s.51C", url: "https://www.elegislation.gov.hk/hk/cap112!en/s51C" }],
    },
  ],
  unknowns: [
    "Whether profits of a SaaS company run remotely by a mainland China team, with no staff in Hong Kong, count as offshore: the official sources only give the principles, with no example of this kind of business, so it is decided case by case.",
    "Mainland China tax questions (whether the company could be treated as a Chinese resident enterprise, individual income tax, CRS information exchange) are outside the scope of Hong Kong official sources.",
    "Audit, secretary, registered address and bookkeeping have no official fee schedule. The prices above are quotes from individual providers, and I found no reliable quote for bookkeeping.",
    "The HKMA has not published which banks accept companies with mainland Chinese shareholders or directors.",
  ],
  posts: ["uk-company-annual-review-timeline-checklist", "us-company-annual-tax-filing-diy"],
};
