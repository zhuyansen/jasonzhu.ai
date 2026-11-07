// English version of ../compliance.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Pages, filings and local representatives needed before launch, market by market: only the laws themselves, regulators and a legal
// database (DLA Piper's handbook), plus a few dated law-firm summaries (named as such). Tax registration is in the "digital-tax"
// guide and ICP filing in the "domains" guide; this guide only mentions them in passing.
const CALOPPA = "https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=8.&chapter=22.&lawCode=BPC";
const CPPA_FAQ = "https://cppa.ca.gov/faq.html";
const COPPA_2025 = "https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule";
const CA_ARL = "https://dwt.com/insights/2024/10/ab-2863-updates-california-automatic-renewal-law";
const FTC_VACATED = "https://www.lw.com/en/insights/eighth-circuit-vacates-ftc-click-to-cancel-rule";
const FTC_ANPRM =
  "https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-response-advance-notice-proposed-rulemaking-regarding-negative-option";
const ADA_GUIDANCE = "https://www.ada.gov/resources/web-guidance/";
const ADA_SUITS = "https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/";
const DLA_ID = "https://www.dlapiperdataprotection.com/index.html?t=law&c=ID";
const PSE_PORTAL = "https://pse.komdigi.go.id/";
const PSE_2022 = "https://www.thejakartapost.com/indonesia/2022/07/30/govt-blocks-yahoo-steam-paypal-for-failing-to-comply-with-licensing-policy.html";
const PSE_2025 = "https://www.hukumonline.com/berita/a/komdigi-blokir-ebay-hingga-maskapai-klm-lt68626c8177d07?page=all";
const PSE_2026 =
  "https://infopublik.id/kategori/siaran-pers/989544/siaran-pers-perketat-pengawasan-komdigi-minta-25-pse-lingkup-privat-penuhi-kewajiban-pendaftaran";
const DLA_VN = "https://www.dlapiperdataprotection.com/index.html?t=law&c=VN";
const JP_FOREIGN = "https://www.no-trouble.caa.go.jp/qa/foreign.html";
const JP_MAILORDER = "https://www.no-trouble.caa.go.jp/what/mailorder/";
const JP_FINAL_SCREEN = "https://www.caa.go.jp/notice/assets/consumer_transaction_cms203_240425_01.pdf";
const PPC_FOREIGN = "https://www.ppc.go.jp/all_faq_index/faq1-q11-2/";
const PPC_GUIDE = "https://www.ppc.go.jp/files/pdf/kihon_202309.pdf";
const SOUMU_EXTERNAL = "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/gaibusoushin_kiritsu.html";
const KR_ECOMMERCE_10 = "https://www.law.go.kr/LSW/ftcInfoP.do?ftcSeq=753";
const KFTC_AGENT =
  "https://www.ftc.go.kr/www/selectBbsNttView.do?pageUnit=10&pageIndex=1&searchCnd=all&key=12&bordCd=3&searchCtgry=01%2C02&nttSn=47730";
const KR_PIPA_AGENT = "https://prighter.com/resources/laws/korean-pipa/enforcement-decree/articles/article-32-2";
const KR_PIPA_2025 = "https://www.asiae.co.kr/en/article/2025053008290385821";
const DLA_KR = "https://www.dlapiperdataprotection.com/index.html?t=law&c=KR";
const RU_152_NOTIFY = "https://www.consultant.ru/document/cons_doc_LAW_61801/d996966e22e1320c9de1ab82d9f6be12c3d9d765/";
const RU_KOAP = "https://www.consultant.ru/document/cons_doc_LAW_34661/1f421640c6775ff67079ebde06a7d2f6d17b96db/";
const RU_152_LOCAL = "https://www.consultant.ru/document/cons_doc_LAW_61801/cbf4e15b7c330f9372e876cdf2bc928bad7950ef/";
const RU_152_TRANSFER = "https://www.consultant.ru/document/cons_doc_LAW_61801/e4ebbe1780de623c7cf32a59ca82a7bb523a25dd/";
const RU_152_POLICY = "https://www.consultant.ru/document/cons_doc_LAW_61801/eeeebe22bf738fd65bb66b95cc278911ae2525ee/";
const MIIT_ICP = "https://www.miit.gov.cn/gyhxxhb/jgsj/cyzcyfgs/bmgz/xxtxl/art/2024/art_84a0cfa0ebd049bbbe751dca9a008e56.html";
const CN_ICP_MEASURES = "http://www.cac.gov.cn/2000-09/30/c_126193701.htm";
const CN_PIPL = "http://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm";
const CN_DATA_EXPORT = "https://www.cac.gov.cn/2024-03/22/c_1712776611775634.htm";
const CN_RENEWAL = "https://www.gov.cn/zhengce/content/202403/content_6940158.htm";
const CN_GENAI = "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm";
const CN_AI_LABEL = "https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm";
const GDPR_13 = "https://gdpr-info.eu/art-13-gdpr/";
const GDPR_83 = "https://gdpr-info.eu/art-83-gdpr/";
const EDPB_SCOPE =
  "https://www.edpb.europa.eu/system/files/documents/files/file1/edpb_guidelines_3_2018_territorial_scope_after_public_consultation_en_1.pdf";
const NL_FINE = "https://www.huntonprivacyblog.com/2021/05/19/dutch-dpa-fines-company-525000-eur-for-failure-to-designate-eu-representative/";
const EU_COOKIES = "https://europa.eu/youreurope/citizens/consumers/internet-telecoms/data-protection-online-privacy/index_en.htm";
const EU_OMNIBUS =
  "https://www.heuking.de/en/news-events/newsletter-articles/detail/cookie-consent-under-the-digital-omnibus-planned-changes-and-technical-implementation.html";
const EU_CRD = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02011L0083-20220528";
const EU_RETURNS = "https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm";
const EU_WITHDRAW_BUTTON = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023L2673";
const EU_EAA = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019L0882";
const EU_DSA = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022R2065";
const BIPT_DSA =
  "https://bipt.be/consumers/publication/providers-of-intermediary-services-without-an-establishment-in-the-eu-appointment-of-a-legal-representative";
const DDG_5 = "https://www.gesetze-im-internet.de/ddg/__5.html";
const DDG_33 = "https://www.gesetze-im-internet.de/ddg/__33.html";
const UK_GDPR_27 = "https://www.legislation.gov.uk/eur/2016/679/article/27";
const UK_DUAA_START = "https://www.legislation.gov.uk/uksi/2026/82/regulation/2/made";
const UK_DUAA_COOKIES = "https://www.legislation.gov.uk/ukpga/2025/18/schedule/12";
const UK_COOKIE_FINES = "https://www.mishcon.com/news/unlawful-cookies-a-new-avenue-for-the-ico-to-issue-fines";
const UK_RETURNS = "https://www.gov.uk/accepting-returns-and-giving-refunds";

export const COMPLIANCE_EN: Guide = {
  slug: "compliance",
  short: "Pages and filings before launch",
  title: "Compliance pages and filings you need before launch: privacy policies, cookies, seller information pages and local representatives, and what a small seller abroad must do in each market",
  description:
    "Market by market, the pages to put up, the filings to make and the representatives to appoint before launching to local users: privacy policies and auto-renewal rules in the US; PSE registration in Indonesia; Vietnam's Personal Data Protection Law; the notice under Japan's Act on Specified Commercial Transactions; Korea's E-Commerce Act; personal data localisation in Russia; China's Personal Information Protection Law and operating licence; the GDPR representative, cookies, 14-day withdrawal, the European Accessibility Act and the DSA in the EU; Germany's Impressum; and the UK's new cookie rules.",
  intro:
    "Being abroad with no local company does not put you out of reach of local law: Japan's Act on Specified Commercial Transactions, the EU and UK GDPR and China's Personal Information Protection Law all state that they cover foreign sellers, and Indonesia's PSE registration is required of operators abroad too; in 2022 PayPal and Steam were blocked there for not registering. Below, market by market: the pages to put up, the filings to make and the representatives to appoint before launching to local users, and the thresholds at which each applies. Tax registration is covered in the guide on tax for digital products, and ICP filing in the domain guide.",
  checked: "2026-11-07",
  warning: {
    text: "This page summarises the laws of each country and what their regulators say. It is general information, not legal advice; for your own product and users, ask a local lawyer.",
  },
  sections: [
    {
      id: "us",
      title: "United States: privacy policies have no threshold, and auto-renewal is regulated by state",
      items: [
        {
          text: "California's CalOPPA: every commercial website that collects personal information from California residents must post a privacy policy conspicuously. It must say what is collected, which categories of third parties it is shared with, how users can review and change it, how users are told about changes to the policy, and how the site responds to \"Do Not Track\". This rule has no revenue or user threshold.",
          sources: [{ label: "California Business and Professions Code", url: CALOPPA }],
        },
        {
          text: "The CCPA only covers businesses that meet any one of three tests: revenue above US$26,625,000 in the previous year (the figure since 2025); buying, selling or sharing the personal information of 100,000 or more California residents; or getting half or more of their revenue from selling or sharing personal information. Most small sites meet none of them.",
          sources: [{ label: "California Privacy Protection Agency", url: CPPA_FAQ }],
        },
        {
          text: "Sites directed at children under 13 are covered by COPPA. The amended rule took effect on 23 June 2025, and compliance with most provisions is required from 22 April 2026; for example, sharing children's data with third parties for advertising needs separate parental consent.",
          sources: [{ label: "Federal Register (2025-04-22)", url: COPPA_2025 }],
        },
        {
          text: "Amendments to California's Automatic Renewal Law apply from 1 July 2025: automatic renewal needs the user's separate, express consent, and a free trial that turns into a paid plan counts too; cancelling must be as easy as signing up.",
          sources: [{ label: "DWT law firm briefing (2024-10-01)", url: CA_ARL }],
        },
        {
          text: "The FTC's \"click to cancel\" rule was vacated in full by the Eighth Circuit Court of Appeals on 8 July 2025, but the federal ROSCA and the states' automatic renewal laws still apply; in March 2026 the FTC began seeking public comment again.",
          sources: [
            { label: "Latham & Watkins (2025-07-11)", url: FTC_VACATED },
            { label: "FTC (2026-03-11)", url: FTC_ANPRM },
          ],
        },
        {
          text: "Accessibility: Department of Justice guidance says the ADA applies to the goods and services businesses offer online, but it sets no technical standard for private websites; 3,117 website accessibility lawsuits were filed in federal courts in 2025.",
          sources: [
            { label: "US Department of Justice", url: ADA_GUIDANCE },
            { label: "Seyfarth figures (2026-03)", url: ADA_SUITS },
          ],
        },
      ],
    },
    {
      id: "id",
      title: "Indonesia: operators abroad must register as a PSE too, or be blocked",
      items: [
        {
          text: "Anyone offering goods or services in Indonesia through a website or app, whether based in Indonesia or abroad, must register with Komdigi as a private electronic system operator (PSE). The registration portal states that every private PSE must register.",
          sources: [
            { label: "DLA Piper Indonesia (2026-02-13)", url: DLA_ID },
            { label: "PSE registration portal", url: PSE_PORTAL },
          ],
        },
        {
          text: "Examples of enforcement: on 30 July 2022, Yahoo, Steam, PayPal, Epic Games and others were blocked for not registering; in June 2025, eBay, KLM and others were blocked in Indonesia; in September 2026, Komdigi wrote to 25 operators requiring them to register by a deadline, two of them based abroad.",
          sources: [
            { label: "Jakarta Post (2022-07-30)", url: PSE_2022 },
            { label: "Hukumonline (2025-06-30)", url: PSE_2025 },
            { label: "Komdigi press release (2026-09-17)", url: PSE_2026 },
          ],
        },
        {
          text: "The two-year transition period of the Personal Data Protection Law (UU 27/2022) ended on 17 October 2024, and full compliance is now required: a data breach must be notified in writing to the individuals concerned and the regulator within 72 hours, and administrative fines go up to 2% of annual revenue. The implementing regulation has not been issued yet.",
          sources: [{ label: "DLA Piper Indonesia (2026-02-13)", url: DLA_ID }],
        },
      ],
    },
    {
      id: "vn",
      title: "Vietnam: a new Personal Data Protection Law in force since January 2026",
      items: [
        {
          text: "The Personal Data Protection Law (No. 91/2025/QH15) took effect on 1 January 2026, and its accompanying Decree No. 356/2025 took effect the same day, replacing Decree No. 13 of 2023.",
          sources: [{ label: "DLA Piper Vietnam (2026-02-15)", url: DLA_VN }],
        },
        {
          text: "If you process personal data of Vietnamese citizens, you must submit an impact assessment to the Ministry of Public Security within 60 days of starting. If you transfer the data abroad (including storing it on servers or clouds outside Vietnam), you must also submit a transfer impact assessment within 60 days, then review it every six months. Consent must be obtained for each purpose separately, and silence is not consent.",
          sources: [{ label: "DLA Piper Vietnam (2026-02-15)", url: DLA_VN }],
        },
        {
          text: "Small businesses and start-ups that meet the conditions are exempt for five years from both assessments and from appointing a data protection officer. Unlawful cross-border transfers can be fined up to 5% of the previous year's revenue.",
          sources: [{ label: "DLA Piper Vietnam (2026-02-15)", url: DLA_VN }],
        },
      ],
    },
    {
      id: "jp",
      title: "Japan: sellers abroad also need the notice under the Act on Specified Commercial Transactions",
      items: [
        {
          text: "The Consumer Affairs Agency states that selling to consumers in Japan through a website from abroad is also covered by the Act on Specified Commercial Transactions, whatever your nationality and wherever your server is; no licence or registration is needed, though.",
          sources: [{ label: "Consumer Affairs Agency: selling to Japan from abroad", url: JP_FOREIGN }],
        },
        {
          text: "The address in the notice (headed \"特定商取引法に基づく表記\") must be where you actually run the business. An address abroad is fine, but you may not borrow the address of a friend or relative in Japan.",
          sources: [{ label: "Consumer Affairs Agency: selling to Japan from abroad", url: JP_FOREIGN }],
        },
        {
          text: "You can leave out your name, address and phone number by writing \"provided in writing or by email immediately on request\", as long as you really can do that; the return and cancellation conditions cannot be left out.",
          sources: [{ label: "Consumer Affairs Agency: online selling rules", url: JP_MAILORDER }],
        },
        {
          text: "Since June 2022, the final confirmation screen of an online order must show the quantity, the price, when and how to pay, the delivery time, and the conditions for withdrawal and cancellation. Between September 2023 and April 2024 the Consumer Affairs Agency penalised three businesses selling subscriptions, all involving their final confirmation screens.",
          sources: [{ label: "Consumer Affairs Agency (2024-04-25)", url: JP_FINAL_SCREEN }],
        },
        {
          text: "The Act on the Protection of Personal Information covers foreign businesses too: it applies when you handle the personal information of people in Japan in order to provide them with services. Users must be able to find out the business's name, address and representative, the purposes of use, how to make requests, the security measures and where to complain; this usually goes in the site's privacy policy.",
          sources: [
            { label: "Personal Information Protection Commission FAQ", url: PPC_FOREIGN },
            { label: "Personal Information Protection Commission guidelines", url: PPC_GUIDE },
          ],
        },
        {
          text: "In Japan, cookies rely on public notice, not consent: news, social media, search and curation sites must publish in Japanese what information is sent, to whom and for what purpose; online shops that only sell their own products are out of scope.",
          sources: [{ label: "Ministry of Internal Affairs and Communications: external transmission rule", url: SOUMU_EXTERNAL }],
        },
      ],
    },
    {
      id: "kr",
      title: "South Korea: business details go on the home page, and the domestic agent rules have thresholds",
      items: [
        {
          text: "Article 10 of the E-Commerce Act: an online shop must show on its home page its trade name and the name of its representative, business address, phone number and email, business registration number, terms of use and so on.",
          sources: [{ label: "Korea Fair Trade Commission decision", url: KR_ECOMMERCE_10 }],
        },
        {
          text: "Under the amended E-Commerce Act, a foreign business with no address or place of business in Korea must appoint a domestic agent and show it on its home page if its revenue in the previous year was ₩1 trillion or more, if it averages 1 million or more visits a month from Korean consumers, or if the Fair Trade Commission requires it. This takes effect on 21 January 2027. Small sellers are generally below these thresholds.",
          sources: [{ label: "Korea Fair Trade Commission (2026-07-14)", url: KFTC_AGENT }],
        },
        {
          text: "The domestic agent rule in the Personal Information Protection Act also has thresholds (for example, revenue of ₩1 trillion or more in the previous year). Since October 2025, a foreign company with a legal entity in Korea must appoint that entity as its agent. A 2026 amendment raised the maximum fine for repeat violations to 10% of revenue.",
          sources: [
            { label: "Prighter translation of the article", url: KR_PIPA_AGENT },
            { label: "Asia Economy (2025-05-30)", url: KR_PIPA_2025 },
            { label: "DLA Piper South Korea (2026-03-20)", url: DLA_KR },
          ],
        },
      ],
    },
    {
      id: "ru",
      title: "Russia: notify the regulator first, and keep the data in Russia",
      items: [
        {
          text: "You must notify Roskomnadzor in writing before processing personal data; most of the earlier exemptions were removed in September 2022. Companies that fail to notify are fined 100,000 to 300,000 rubles.",
          sources: [
            { label: "152-FZ Art. 22", url: RU_152_NOTIFY },
            { label: "Code of Administrative Offences Art. 13.11", url: RU_KOAP },
          ],
        },
        {
          text: "When collecting personal data of Russian citizens, you may not use databases outside Russia to record, organise, store or update it (Article 18, part 5, as amended in 2025). Companies in breach are fined 1 million to 6 million rubles, and 6 million to 18 million for a repeat offence.",
          sources: [
            { label: "152-FZ Art. 18", url: RU_152_LOCAL },
            { label: "Code of Administrative Offences Art. 13.11", url: RU_KOAP },
          ],
        },
        {
          text: "Cross-border transfers need a separate notification beforehand. If you collect personal data online, you must publish your personal data processing policy and protection measures on the page where you collect it.",
          sources: [
            { label: "152-FZ Art. 12", url: RU_152_TRANSFER },
            { label: "152-FZ Art. 18.1", url: RU_152_POLICY },
          ],
        },
      ],
    },
    {
      id: "cn",
      title: "Mainland China: the Personal Information Protection Law reaches abroad, and paid information services need an operating licence",
      items: [
        {
          text: "For ICP filing, see the domain guide. The filing number must be shown at the bottom centre of the home page; operating without a filing is fined CNY 10,000.",
          sources: [{ label: "MIIT filing rules", url: MIIT_ICP }],
        },
        {
          text: "Providing information services to users in China for a fee is a commercial internet information service: you need an operating licence first, and must show the licence number prominently on the home page. Operating without a licence is fined up to CNY 1 million, and in serious cases the site is shut down.",
          sources: [{ label: "Measures for the Administration of Internet Information Services", url: CN_ICP_MEASURES }],
        },
        {
          text: "The Personal Information Protection Law reaches abroad: it also applies when you process the personal information of people in China in order to provide them with products or services, and you must then set up a dedicated office or appoint a representative in China and report it to the regulators (Article 53).",
          sources: [{ label: "Personal Information Protection Law", url: CN_PIPL }],
        },
        {
          text: "The privacy notice must at least give the processor's name and contact details, the purposes, the methods, the types of information, the retention period and how users can exercise their rights. In serious cases, fines go up to CNY 50 million or 5% of the previous year's revenue.",
          sources: [{ label: "Personal Information Protection Law", url: CN_PIPL }],
        },
        {
          text: "Data export: transfers that are genuinely necessary to conclude or perform a contract with the individual (cross-border shopping, for example), and transfers of non-sensitive personal information of fewer than 100,000 people in total in a year, are exempt from the security assessment, the standard contract and certification.",
          sources: [{ label: "CAC (2024-03-22)", url: CN_DATA_EXPORT }],
        },
        {
          text: "Auto-renewal: since July 2024, users must be reminded prominently before the service starts and before each automatic renewal. Generative AI services for the public in China have their own measures, and since September 2025 AI-generated content must be labelled.",
          sources: [
            { label: "Implementing Regulations of the Consumer Rights Protection Law", url: CN_RENEWAL },
            { label: "Measures for Generative AI Services", url: CN_GENAI },
            { label: "Measures for Labelling AI-Generated Content", url: CN_AI_LABEL },
          ],
        },
      ],
    },
    {
      id: "eu",
      title: "EU: GDPR representative, cookies, 14-day withdrawal, accessibility and the DSA",
      items: [
        {
          text: "The privacy notice (GDPR Article 13) must give the contact details of the controller and its EU representative, the purposes and legal basis, the recipients, transfers abroad, the retention period, the user's rights and the right to complain. Breaches can be fined up to €20 million or 4% of global turnover.",
          sources: [
            { label: "GDPR Art. 13", url: GDPR_13 },
            { label: "GDPR Art. 83", url: GDPR_83 },
          ],
        },
        {
          text: "A company outside the EU that offers goods or services to people in the EU must designate an EU representative in writing (Article 27). The exemption only covers occasional processing that does not include large-scale processing of sensitive data, and a site that runs continuously can hardly count as occasional. In 2021 the Dutch regulator fined Locatefamily.com €525,000 for not designating one.",
          sources: [
            { label: "EDPB guidelines on territorial scope", url: EDPB_SCOPE },
            { label: "Hunton (2021-05-19)", url: NL_FINE },
          ],
        },
        {
          text: "Cookies need consent before they are set; just informing users, or telling them how to turn cookies off, does not count. Only cookies needed for the transmission, or strictly necessary for a service the user explicitly asked for (such as a shopping basket), are exempt from consent. The EU is discussing a relaxation, which is not expected to take effect before 2027.",
          sources: [
            { label: "Your Europe (EU)", url: EU_COOKIES },
            { label: "Heuking law firm (2026-10-23)", url: EU_OMNIBUS },
          ],
        },
        {
          text: "14-day withdrawal: for online digital content to lose the right of withdrawal, you need all three of these: the user's prior express consent to start immediately, their acknowledgement that they lose the right of withdrawal as a result, and your confirmation on a durable medium such as email. If one is missing, a user who withdraws pays nothing at all. For services such as SaaS that start early at the user's request, the user pays a proportionate amount on withdrawal.",
          sources: [
            { label: "Consumer Rights Directive", url: EU_CRD },
            { label: "Your Europe (EU)", url: EU_RETURNS },
          ],
        },
        {
          text: "From 19 June 2026, contracts concluded online must offer a withdrawal function: labelled \"withdraw from contract here\" or with equally clear wording, available throughout the withdrawal period, with a further confirmation step; you must then send an acknowledgement of receipt promptly.",
          sources: [{ label: "Directive 2023/2673", url: EU_WITHDRAW_BUTTON }],
        },
        {
          text: "The European Accessibility Act (EAA) has applied to e-commerce services for consumers since 28 June 2025. Microenterprises with fewer than 10 staff and an annual turnover or balance sheet of no more than €2 million are exempt when providing services.",
          sources: [{ label: "Directive 2019/882", url: EU_EAA }],
        },
        {
          text: "Digital Services Act (DSA): a provider with no establishment in the EU that offers intermediary services such as hosting in the EU (storing content users upload, for example) must appoint a legal representative in one member state, and micro and small enterprises are not exempt; the terms of use must set out the content moderation policy. A site merely being reachable does not count as offering services in the EU; what matters is the number of users or whether it targets the EU.",
          sources: [
            { label: "DSA Regulation", url: EU_DSA },
            { label: "Belgian regulator (2026-09-22)", url: BIPT_DSA },
          ],
        },
        {
          text: "Germany's Impressum: now based on section 5 of the German Digital Services Act (DDG), commercial digital services must list their name and business address, legal representative, a way to contact them quickly (including email), commercial register number, VAT number and so on. Missing details can be fined up to €50,000.",
          sources: [
            { label: "DDG § 5", url: DDG_5 },
            { label: "DDG § 33", url: DDG_33 },
          ],
        },
      ],
    },
    {
      id: "uk",
      title: "UK: appoint a UK representative; the cookie rules were partly relaxed in 2026",
      items: [
        {
          text: "UK GDPR Article 27 still stands: a foreign company subject to the UK GDPR must designate a UK representative in writing, and the exemption conditions are the same as in the EU.",
          sources: [{ label: "UK GDPR Art. 27", url: UK_GDPR_27 }],
        },
        {
          text: "The cookie changes in the Data (Use and Access) Act took effect on 5 February 2026: cookies used only for statistics to improve your own service, or only to adapt the site's appearance and functions, can be used without consent, but you must tell users clearly and give them a free, simple way to refuse. Advertising tracking still needs consent.",
          sources: [
            { label: "Commencement regulations SI 2026/82", url: UK_DUAA_START },
            { label: "Data (Use and Access) Act, Schedule 12", url: UK_DUAA_COOKIES },
          ],
        },
        {
          text: "From the same day, the maximum fine for cookie breaches rose from £500,000 to £17.5 million or 4% of global turnover.",
          sources: [{ label: "Mishcon de Reya (2026-02-12)", url: UK_COOKIE_FINES }],
        },
        {
          text: "Consumers who buy online can cancel within 14 days, and refunds must be made within 14 days.",
          sources: [{ label: "GOV.UK", url: UK_RETURNS }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Assuming local law does not apply because you are abroad with no local company: Japan's Act on Specified Commercial Transactions, the representative clauses of the GDPR and UK GDPR, and Article 53 of China's Personal Information Protection Law all specifically cover foreign sellers, and in Indonesia a site that does not register as a PSE gets blocked.",
      sources: [
        { label: "Consumer Affairs Agency: selling to Japan from abroad", url: JP_FOREIGN },
        { label: "Jakarta Post (2022-07-30)", url: PSE_2022 },
      ],
    },
    {
      text: "Selling online digital content in the EU without the \"agree to start immediately and give up the right of withdrawal\" checkbox at checkout and the confirmation email: users who withdraw within 14 days can pay nothing, and from 19 June 2026 a withdrawal button is also required.",
      sources: [
        { label: "Consumer Rights Directive", url: EU_CRD },
        { label: "Directive 2023/2673", url: EU_WITHDRAW_BUTTON },
      ],
    },
    {
      text: "Thinking the UK's new rules let you drop the cookie banner: only two kinds were relaxed (statistics, and appearance and functions); you still have to tell users and give them a way to refuse, and the maximum fine has actually risen to £17.5 million.",
      sources: [{ label: "Data (Use and Access) Act, Schedule 12", url: UK_DUAA_COOKIES }],
    },
    {
      text: "Using a Japanese friend's address in the notice under the Act on Specified Commercial Transactions, or not posting the notice at all: the address must be where you actually do business; you can write \"provided on request\", but the return rules cannot be left out.",
      sources: [{ label: "Consumer Affairs Agency: selling to Japan from abroad", url: JP_FOREIGN }],
    },
    {
      text: "Assuming in the US that falling below the CCPA thresholds means you need to post nothing: CalOPPA has no threshold, and collecting information from California users is enough to require a privacy policy.",
      sources: [{ label: "California Business and Professions Code", url: CALOPPA }],
    },
    {
      text: "Keeping Russian users' data on a cloud abroad by default: collecting and storing Russian citizens' data in a database abroad is illegal in itself, and a company is fined 1 million to 6 million rubles even for a first offence.",
      sources: [{ label: "152-FZ Art. 18", url: RU_152_LOCAL }],
    },
  ],
  unknowns: [
    "The e-commerce registration conditions that Vietnam's Decree No. 85/2021 sets for foreign merchants, and whether the new E-Commerce Law has taken effect.",
    "The threshold at which Indonesia's PP 80/2019 requires foreign e-commerce businesses to appoint a local representative, and whether Komdigi actually enforces the rules against small foreign SaaS businesses.",
    "How Russia's 152-FZ decides that a foreign site is \"aimed at Russia\" (Russian language, a .ru domain, payment in rubles and so on); the regulator has not published its position.",
    "Korea: how a small foreign seller with no business licence should fill in the business details on its home page, and whether it must file a mail-order business report.",
    "Whether Japan's external transmission rule covers operators abroad, and whether the \"returnable within 8 days\" rule applies to digital content and online services.",
    "How exactly section 5 of Germany's DDG applies to sellers outside the EU.",
    "Whether the UK ICO's annual data protection fee applies to controllers based abroad.",
    "China: whether a site on a server abroad that charges users in China counts as providing services \"within China\" and whether it needs an operating licence; and whether a foreign site collecting personal information directly from people in China counts as data export.",
  ],
  related: [
    { label: "Choosing a domain (ICP filing)", path: "/domains" },
    { label: "Where to host and whether it loads (data localisation)", path: "/hosting" },
    { label: "Tax on selling digital products", path: "/digital-tax" },
    { label: "Ads and affiliate income (consent for ads)", path: "/ads-affiliate" },
  ],
};
