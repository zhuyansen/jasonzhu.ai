// English version of ../ads-affiliate.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Earning from site traffic, market by market: only the ad networks', affiliate programmes' and regulators' own pages,
// plus a few dated media or law-firm summaries (named as such). Seller-side affiliates and ads are in the "channels" guide.
const ADSENSE_LANG = "https://support.google.com/adsense/answer/9727";
const ADSENSE_PAY = "https://support.google.com/adsense/answer/1714397";
const ADSENSE_HYPERWALLET = "https://support.google.com/adsense/answer/16691394";
const ADSENSE_HW_FAQ = "https://support.google.com/adsense/answer/15292512";
const ADSENSE_THRESHOLD = "https://support.google.com/adsense/answer/1709871";
const ADSENSE_TAX = "https://support.google.com/adsense/answer/1322037";
const AMAZON_FX = "https://affiliate-program.amazon.com/help/node/topic/G8VUMS6GTBCR9RGV";
const AMAZON_TAX = "https://affiliate-program.amazon.com/help/node/topic/GPFZ6W6CF4E5BD9V";
const AMAZON_PAY = "https://affiliate-program.amazon.com/gp/associates/help/t3/a2";
const FTC_2023 =
  "https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements";
const FTC_FAQ = "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking";
const SHOPEE_ID_TAX = "https://www.pajak.go.id/id/berita/pajak-lumajang-bantu-shopee-affiliator-padankan-nik-npwp";
const TOKOPEDIA_AFF = "https://affiliate.tokopedia.com/";
const INVOLVE = "https://involve.asia/terms-conditions/";
const ACCESSTRADE = "https://accesstrade.vn/dieu-khoan-su-dung/";
const ADMICRO = "http://publisher.admicro.vn/";
const A8_ABROAD = "https://www.a8.net/faq/9.html";
const A8_PAYOUT = "https://www.a8.net/faq/6.html";
const RAKUTEN_NEWS = "https://ecnomikata.com/ecnews/37724/";
const NEND_CLOSE = "https://gamebiz.jp/news/379899";
const CAA_STEALTH = "https://www.caa.go.jp/policies/policy/representation/fair_labeling/stealth_marketing/";
const SOUMU_EXTERNAL = "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/gaibusoushin_kiritsu.html";
const ADFIT_JOIN = "https://kakaobusiness.gitbook.io/main/partner/adfit/join";
const ADFIT_FAQ = "https://kakaobusiness.gitbook.io/main/partner/adfit/faq";
const KFTC_2024 = "https://shinkim.com/kor/media/newsletter/2613";
const KFTC_2025 = "https://www.ajunews.com/view/20251202085042877";
const GOOGLE_PAUSE = "https://support.google.com/publisherpolicies/answer/15766875";
const YANDEX_PAY = "https://yandex.ru/support/partner/ru/payments/index.md";
const YANDEX_OFFER_INTL = "https://yandex.com/legal/yan_service_offer_ae/";
const ADMITAD_COM = "https://www.admitad.com/";
const ADMITAD_RU = "https://www.admitad.ru/pravila-ispolzovaniya-platformy-admitad-ru/";
const RU_AD_LABEL = "https://www.consultant.ru/document/cons_doc_LAW_58968/2c4537e4796f6ff8b2736ed1b0d4fef08e14458e/";
const RU_AD_LEVY = "https://www.consultant.ru/document/cons_doc_LAW_58968/f5499f6a99f4f1011e473eae3412f6c7f0262387/";
const GOOGLE_CMP = "https://support.google.com/adsense/answer/13554116";
const IAB_TCF = "https://iabeurope.eu/transparency-consent-framework/";
const AMAZON_DE_PAY = "https://partnernet.amazon.de/help/topic/t3/a2";
const AMAZON_UK_PAY = "https://affiliate-program.amazon.co.uk/help/topic/t3/a2";
const ASA_AFFILIATE = "https://www.asa.org.uk/advice-online/affiliate-marketing.html";

export const ADS_AFFILIATE_EN: Guide = {
  slug: "ads-affiliate",
  short: "Ads and affiliate income",
  title: "Earning from your traffic: AdSense, local ad networks and affiliate programmes, market by market, and how foreign publishers get paid",
  description:
    "How tool and content sites earn from traffic in each market: AdSense limits and payout options for publishers in China, how Amazon's programmes pay foreign publishers, A8.net and Rakuten in Japan, Kakao AdFit in Korea, the Yandex Advertising Network, affiliate platforms in Indonesia and Vietnam, and the consent and disclosure rules in the EU, UK, US, Japan and Korea.",
  intro:
    "Ads and affiliate links are how most tool and content sites earn, but whether you can join and whether the money reaches you depends on where the traffic comes from. AdSense covers most markets, yet visitors from Russia see almost no Google ads; most local programmes in Japan and Korea want a local bank account, a local ID or an invitation; traffic from the EU and UK first needs a certified consent platform. Below, market by market: what a publisher with no local company or bank account can join, and how the money is paid.",
  checked: "2026-11-07",
  sections: [
    {
      id: "global",
      title: "Start with AdSense and Amazon",
      lead: "These two reach the most markets. First check what they require of the site's language, payout method and US tax form.",
      items: [
        {
          text: "AdSense serves ads only on pages whose main language is on its supported list, which includes Simplified and Traditional Chinese, Japanese, Korean, Indonesian, Vietnamese, Russian and English.",
          sources: [{ label: "AdSense supported languages", url: ADSENSE_LANG }],
        },
        {
          text: "Payout methods depend on where the publisher is: mainland China gets wire transfer and, since 30 October 2025, PayPal Hyperwallet (it must be a new Hyperwallet account, not an existing one); Hong Kong gets EFT and wire; Russia is not in the payout table.",
          sources: [
            { label: "AdSense payment methods", url: ADSENSE_PAY },
            { label: "Hyperwallet announcement", url: ADSENSE_HYPERWALLET },
            { label: "Hyperwallet FAQ", url: ADSENSE_HW_FAQ },
          ],
        },
        {
          text: "The payment threshold is US$100, or HK$800, £60, €70 or ¥8,000.",
          sources: [{ label: "AdSense payment thresholds", url: ADSENSE_THRESHOLD }],
        },
        {
          text: "Every monetising publisher must submit US tax information: W-8BEN for a non-US individual, W-8BEN-E for a company. Google withholds tax on earnings from US users according to the income type and any tax treaty.",
          sources: [{ label: "AdSense tax information", url: ADSENSE_TAX }],
        },
        {
          text: "Amazon's international bank transfer (Fx4Cash) is for partners of the US, UK, German, French, Italian, Spanish and Canadian programmes with a bank account in one of 52 countries (the US, the UK, the euro area and a few more). Mainland China and Hong Kong are not on the list.",
          sources: [{ label: "Amazon Fx4Cash FAQ", url: AMAZON_FX }],
        },
      ],
    },
    {
      id: "us",
      title: "United States: beyond AdSense and Amazon, disclosure is the work",
      items: [
        {
          text: "Amazon.com: a non-US partner who does not submit a W-8BEN claiming treaty benefits can have up to 30% withheld, as the IRS requires.",
          sources: [{ label: "Amazon tax help", url: AMAZON_TAX }],
        },
        {
          text: "Amazon.com pays about 60 days after the end of the month: US$10 minimum for bank transfer and gift card, US$100 for cheque. With only a mainland China or Hong Kong account, that leaves gift card or cheque, or a separate account in the US, UK or euro area.",
          sources: [
            { label: "Amazon payment methods", url: AMAZON_PAY },
            { label: "Fx4Cash", url: AMAZON_FX },
          ],
        },
        {
          text: "The FTC updated its Endorsement Guides in June 2023. Its FAQ says affiliate links on a site need clear disclosure, as close to the recommendation as possible; \"Paid link\" next to the link is enough, \"affiliate link\" alone is not; and US rules apply wherever it is reasonably foreseeable that US consumers will see the content, wherever the publisher is.",
          sources: [
            { label: "FTC 2023 announcement", url: FTC_2023 },
            { label: "FTC FAQ", url: FTC_FAQ },
          ],
        },
      ],
    },
    {
      id: "id",
      title: "Indonesia: plenty of shopping affiliates; Shopee payouts need an Indonesian tax ID",
      items: [
        {
          text: "Shopee Affiliate Indonesia requires a 16-digit tax number, the Indonesian ID number (NIK) linked to a tax account, before you can withdraw; Shopee withholds income tax on each payout. Without an Indonesian ID you cannot cash out.",
          sources: [{ label: "Indonesian tax office news (no year on the page)", url: SHOPEE_ID_TAX }],
        },
        {
          text: "Tokopedia Affiliate still runs; signing up sends you to TikTok. It asks for a Tokopedia account and a public social account or blog, and reviews the account before the first withdrawal to a personal bank account. No nationality requirement is stated.",
          sources: [{ label: "Tokopedia Affiliate", url: TOKOPEDIA_AFF }],
        },
        {
          text: "Involve Asia, a Southeast Asian affiliate network with Shopee, Lazada and other merchants, only asks for a legal entity or an individual aged 18 or over, with no country restriction stated; tax is withheld as the law requires.",
          sources: [{ label: "Involve Asia terms", url: INVOLVE }],
        },
      ],
    },
    {
      id: "vn",
      title: "Vietnam: Accesstrade is easy to join; Admicro wants a million page views a month",
      items: [
        {
          text: "Accesstrade Vietnam takes individuals and organisations as publishers and withholds personal income tax for individuals; its terms (version 5, updated 4 November 2026) say nothing about nationality, ID or a Vietnamese bank account.",
          sources: [{ label: "Accesstrade terms", url: ACCESSTRADE }],
        },
        {
          text: "The local ad network Admicro wants more than one million page views a month and a Google Analytics report with the application; it does not say whether it takes foreign publishers or how it pays.",
          sources: [{ label: "Admicro", url: ADMICRO }],
        },
      ],
    },
    {
      id: "jp",
      title: "Japan: A8.net wants a Japanese bank account, and nend has closed",
      items: [
        {
          text: "A8.net: you can join while living abroad if you have an account at a Japanese bank and a Japanese address where you can be reached; ads may only go on Japanese-language sites.",
          sources: [{ label: "A8.net FAQ", url: A8_ABROAD }],
        },
        {
          text: "A8.net pays once a site's earnings reach ¥1,000, settling at month end and transferring on the 15th of the month after next; the publisher pays the transfer fee.",
          sources: [{ label: "A8.net payouts", url: A8_PAYOUT }],
        },
        {
          text: "The Japanese Amazon programme is not part of Fx4Cash; its payment help page would not load on 7 November 2026, so its payout thresholds and which countries' bank accounts it pays to are unverified.",
          sources: [{ label: "Fx4Cash", url: AMAZON_FX }],
        },
        {
          text: "Rakuten Affiliate pays into Rakuten Cash first; according to media reports, moving it to a bank needs confirmed earnings of at least ¥3,001 in each of the last three months, an ID document and a site review.",
          sources: [{ label: "EC no Mikata (2024-04-16)", url: RAKUTEN_NEWS }],
        },
        {
          text: "The local ad network nend stopped serving on 29 March 2024 and closed its dashboard in May.",
          sources: [{ label: "gamebiz (2024-01-05)", url: NEND_CLOSE }],
        },
        {
          text: "Since October 2023, stealth marketing breaches the Act against Unjustifiable Premiums and Misleading Representations: content a company asks a third party to publish counts as its advertising and must say so. The advertiser is the one regulated, so affiliate articles will be asked to label it too.",
          sources: [{ label: "Consumer Affairs Agency", url: CAA_STEALTH }],
        },
        {
          text: "Since June 2023, the external transmission rule: news and curation sites must announce it or get consent before sending user information to third parties such as ad tags. The page does not say whether it covers operators abroad.",
          sources: [{ label: "Ministry of Internal Affairs and Communications", url: SOUMU_EXTERNAL }],
        },
      ],
    },
    {
      id: "kr",
      title: "Korea: Kakao AdFit is by approval or invitation, and disclosure goes first",
      items: [
        {
          text: "Kakao AdFit only serves media that were approved or invited in advance; signing up needs a code from your contact there, and company accounts must verify a Korean business registration number.",
          sources: [
            { label: "AdFit sign-up", url: ADFIT_JOIN },
            { label: "AdFit FAQ", url: ADFIT_FAQ },
          ],
        },
        {
          text: "The Korea Fair Trade Commission's revised endorsement guidelines took effect on 1 December 2024: commission on sales through a purchase link is an economic interest that must be disclosed; on a blog it goes in the title or at the start, and vague wording like \"may receive a small commission\" does not count. In December 2025 it added illustrated examples for blogs, Instagram, YouTube and TikTok.",
          sources: [
            { label: "Shin & Kim newsletter (2024-11-19)", url: KFTC_2024 },
            { label: "Aju News (2025-12-02)", url: KFTC_2025 },
          ],
        },
      ],
    },
    {
      id: "ru",
      title: "Russia: almost no Google ads, but the Yandex network takes foreign publishers",
      items: [
        {
          text: "Google suspended its ad systems in Russia and new Russian accounts in March 2022, and paused monetisation for Russia-based publishers on 12 August 2024; its January 2025 update still says AdMob ads are not served to users in Russia. Visitors from Russia bring a foreign site almost no Google ad revenue.",
          sources: [{ label: "Google regional monetisation pauses", url: GOOGLE_PAUSE }],
        },
        {
          text: "The Yandex Advertising Network is open to individuals and companies from other countries, paying to a bank account in US dollars or euros once earnings reach US$150 or €100.",
          sources: [{ label: "Yandex partner payments", url: YANDEX_PAY }],
        },
        {
          text: "Partners outside Russia sign an English-language agreement with Air Smart Advertising Solutions FZ-LLC in Dubai, under English law with arbitration at the Dubai International Arbitration Centre, so the money is paid from the UAE.",
          sources: [{ label: "Yandex network terms (effective 2024-11-28)", url: YANDEX_OFFER_INTL }],
        },
        {
          text: "The affiliate network Admitad is now two companies: the German admitad.com has no Russia in its country list, and the Russian admitad.ru, run by a Russian company, names Russian companies, sole traders and the self-employed as its users.",
          sources: [
            { label: "admitad.com", url: ADMITAD_COM },
            { label: "admitad.ru rules (2025-01-31)", url: ADMITAD_RU },
          ],
        },
        {
          text: "Russia's Advertising Law: online ads must be labelled «реклама», name the advertiser and carry an identifier from an advertising data operator before they run; Article 18.2, added in December 2024, levies 3% on revenue from online ads aimed at Russian consumers.",
          sources: [
            { label: "Advertising Law, Art. 18.1", url: RU_AD_LABEL },
            { label: "Advertising Law, Art. 18.2", url: RU_AD_LEVY },
          ],
        },
      ],
    },
    {
      id: "cn",
      title: "Mainland China: publishers can be paid by AdSense; the local programmes' rules could not be read",
      items: [
        {
          text: "Publishers in mainland China can join AdSense and be paid by wire transfer or, since 30 October 2025, PayPal Hyperwallet.",
          sources: [
            { label: "AdSense payment methods", url: ADSENSE_PAY },
            { label: "Hyperwallet announcement", url: ADSENSE_HYPERWALLET },
          ],
        },
        {
          text: "The rule pages of Taobao Union, JD Union and Baidu Union only render with scripts, so what they ask of foreign companies and of publishers from Hong Kong, Macau, Taiwan or abroad could not be read; see the open questions at the end.",
        },
      ],
    },
    {
      id: "eu-uk",
      title: "EU and UK: connect a certified consent platform first",
      items: [
        {
          text: "Google's rule: since 16 January 2024, serving personalised ads to users in the EEA and UK needs a Google-certified consent management platform (CMP) integrated with the IAB TCF; Switzerland since 31 July 2024. Without one you only get non-personalised or limited ads, and AdSense search ads do not serve at all.",
          sources: [{ label: "Google consent requirements", url: GOOGLE_CMP }],
        },
        {
          text: "The current TCF version is v2.3, required from 28 February 2026.",
          sources: [{ label: "IAB Europe", url: IAB_TCF }],
        },
        {
          text: "Amazon.de pays foreign partners by gift card or bank transfer from €25, or cheque from €50. Amazon.co.uk pays by bank transfer or gift card from £25, or cheque from £50 to non-UK residents only; without a UK account you give an IBAN and BIC.",
          sources: [
            { label: "Amazon.de payments", url: AMAZON_DE_PAY },
            { label: "Amazon.co.uk payments", url: AMAZON_UK_PAY },
          ],
        },
        {
          text: "The UK Advertising Standards Authority: affiliate content falls under the advertising code, and both the merchant and the writer are responsible; it suggests \"Ad\" in the title of a blog post, and \"*affiliate\" alone is not enough.",
          sources: [{ label: "ASA affiliate guidance", url: ASA_AFFILIATE }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Counting on AdSense for Russian traffic: Google does not serve ads to users in Russia; the Yandex network is the one you can join.",
      sources: [{ label: "Google regional monetisation pauses", url: GOOGLE_PAUSE }],
    },
    {
      text: "Assuming Japanese programmes are as open as Amazon: A8.net wants a Japanese bank account, a Japanese address and a Japanese site, nend has closed, and Rakuten sets a bar before paying to a bank.",
      sources: [{ label: "A8.net FAQ", url: A8_ABROAD }],
    },
    {
      text: "A vague disclosure at the end of the post: Korea wants it in the title or at the start, \"affiliate link\" alone is not enough in the US, and the UK suggests \"Ad\" in the title.",
      sources: [
        { label: "Shin & Kim newsletter", url: KFTC_2024 },
        { label: "FTC FAQ", url: FTC_FAQ },
        { label: "ASA", url: ASA_AFFILIATE },
      ],
    },
    {
      text: "Joining Amazon.com with only a mainland China or Hong Kong bank account: neither is on the international transfer list, so you get gift cards or cheques; without a treaty W-8BEN up to 30% is withheld.",
      sources: [
        { label: "Fx4Cash", url: AMAZON_FX },
        { label: "Amazon tax help", url: AMAZON_TAX },
      ],
    },
    {
      text: "European traffic without a certified consent platform: personalised ads stop and AdSense search ads do not serve at all.",
      sources: [{ label: "Google consent requirements", url: GOOGLE_CMP }],
    },
    {
      text: "Using an existing Hyperwallet account for AdSense: it has to be a new one.",
      sources: [{ label: "Hyperwallet announcement", url: ADSENSE_HYPERWALLET }],
    },
  ],
  unknowns: [
    "AdSense earnings per country: no public figures with a stated method; Google's revenue calculator does not give its method.",
    "Whether visitors in mainland China can load AdSense ads; Google does not say.",
    "The current eligibility rules of Naver AdPost and Coupang Partners (their sites refuse automated access), so the common claim that they need a Korean ID is unverified.",
    "What Taobao Union, JD Union and Baidu Union ask of foreign companies and foreign publishers.",
    "Whether Amazon.co.jp and Rakuten Affiliate can pay to a bank account in mainland China or Hong Kong.",
    "Shopee Vietnam's affiliate eligibility (the terms page would not load), and whether Shopee Indonesia accepts foreign publishers.",
    "Disclosure rules for affiliates in Indonesia and Vietnam, and whether China's 2023 internet advertising rules require an \"ad\" label on reviews with shopping links.",
    "How US-dollar and euro payments from Yandex actually arrive at banks in mainland China and Hong Kong.",
  ],
  related: [
    { label: "Channels beyond SEO (affiliates and ads for getting customers)", path: "/channels" },
    { label: "Pages and filings you need before launch", path: "/compliance" },
    { label: "How buyers pay, by market", path: "/local-payments" },
  ],
};
