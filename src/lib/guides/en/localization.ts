// English version of ../localization.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Language and localisation details, market by market: for search engines, only Google's, Yandex's and Baidu's own docs;
// for writing conventions, Microsoft's localisation style guide for each language and Unicode CLDR; for law, only the
// legal texts (some copied on Wikisource), regulators and law-firm briefings (named as such).
const G_LOCALIZED = "https://developers.google.com/search/docs/specialty/international/localized-versions";
const G_MULTI = "https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites";
const G_URL = "https://developers.google.com/search/docs/crawling-indexing/url-structure";
const G_SPAM = "https://developers.google.com/search/docs/essentials/spam-policies";
const G_UPDATE_2025 = "https://developers.google.com/search/updates#spring-cleaning-in-our-multilingual-documentation";
const SER_2025 = "https://www.seroundtable.com/google-softens-automated-translation-stance-39579.html";
const G_TRANSLATED = "https://developers.google.com/search/docs/appearance/translated-results";
const US_EO = "https://www.whitehouse.gov/presidential-actions/2025/03/designating-english-as-the-official-language-of-the-united-states/";
const CLDR_EN = "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-dates-full/main/en/ca-gregorian.json";
const CLDR_EN_GB = "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-dates-full/main/en-GB/ca-gregorian.json";
const MS_ID = "https://aka.ms/indonesian-styleguide";
const ID_LAW_24 = "https://id.wikisource.org/wiki/Undang-Undang_Republik_Indonesia_Nomor_24_Tahun_2009";
const ID_LAW_8 = "https://id.wikisource.org/wiki/Undang-Undang_Republik_Indonesia_Nomor_8_Tahun_1999";
const MS_VI = "https://aka.ms/vietnamese-styleguide";
const MS_JA = "https://aka.ms/japanese-styleguide";
const CLDR_JA_DATES = "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-dates-full/main/ja/ca-gregorian.json";
const CLDR_JA_CURRENCY = "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-numbers-full/main/ja/currencies.json";
const MS_KO = "https://aka.ms/korean-styleguide";
const YANDEX_HREFLANG = "https://yandex.ru/support/webmaster/ru/yandex-indexing/locale-pages";
const YANDEX_URLS = "https://yandex.ru/support/webmaster/en/recommendations/site-structure";
const RU_CPL_10_1 = "https://www.consultant.ru/document/cons_doc_LAW_305/484f0c7a6ab5d52f83b2d9f852ff8378932d96e2/";
const RU_RPN_SITES =
  "https://www.comnews.ru/content/244017/2026-02-28/2026-w09/1010/rospotrebnadzor-zakon-o-zaschite-russkogo-yazyka-kasaetsya-saytov-internete";
const RU_LIDINGS = "https://www.lidings.com/ru/media/legalupdates/zakon-o-zashchite-russkogo-yazyka-razbiraemsya-v-detalyakh/";
const RU_ART_8 = "https://www.consultant.ru/law/hotdocs/93031.html";
const MS_RU = "https://aka.ms/russian-styleguide";
const CN_LANGUAGE_LAW = "https://zh.wikisource.org/wiki/中华人民共和国国家通用语言文字法_(2025年)";
const BAIDU_URL = "https://ziyuan.baidu.com/college/articleinfo?id=1263";
const MS_ZH_TW = "https://aka.ms/chinese-traditional-styleguide";
const MS_HK_SOFTWARE = "https://www.microsoft.com/zh-hk/software-download";
const MS_TW_SOFTWARE = "https://www.microsoft.com/zh-tw/software-download";
const HK_DIGITAL_POLICY = "https://www.digitalpolicy.gov.hk/tc/";
const TW_MODA = "https://moda.gov.tw/";
const HK_AQHI = "https://www.aqhi.gov.hk/tc/";
const TW_AIR = "https://airtw.moenv.gov.tw/";
const OPENCC = "https://github.com/BYVoid/OpenCC";
const FR_TOUBON = "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000349929";
const FR_CULTURE =
  "https://www.culture.gouv.fr/thematiques/langue-francaise-et-langues-de-france/agir-pour-les-langues/garantir-l-emploi-du-francais";
const FR_FINES = "https://simonassocies.com/wp-content/uploads/2024/06/Lettre-de-la-Consommation-Juin-2024-vf.pdf";
const MS_DE = "https://aka.ms/german-styleguide";
const APPLE_DE = "https://www.apple.com/de/iphone/";
const MS_EN_GB = "https://aka.ms/english-uk-styleguide";

export const LOCALIZATION_EN: Guide = {
  slug: "localization",
  short: "Language and localisation",
  title: "Language and localisation details: how to write hreflang and URLs in local scripts, the risks of machine-translated pages, forms of address and formats in each language, and the language requirements in law",
  description:
    "The details of a multilingual overseas site, market by market: which hreflang codes Google recognises, whether URLs in local scripts work, and whether machine-translated pages count as spam; how to address users in Japanese, Korean, Indonesian, Vietnamese, Russian and German; how Traditional Chinese wording differs between Taiwan and Hong Kong; Russia's Russian-language requirement from March 2026, France's Toubon law, Indonesia's language law and China's newly revised Law on the Standard Spoken and Written Chinese Language.",
  intro:
    "AI can turn an English site into several languages quickly, but there are three things the machine won't think about for you: whether search engines accept the result, whether it reads naturally to local people, and whether the law sets hard requirements. Google judges a page's language only by its visible content, and translating the interface but not the main text gets a page treated as a duplicate; Japanese, Korean and German all have conventions on forms of address and tone; since March 2026 Russia has required information for consumers to be in Russian, and the regulator says websites count too; in France, offers and descriptions for consumers must have a French version. The basics of hreflang, and the advice not to switch visitors to another language automatically by IP, are in the \"Choosing a domain\" guide.",
  checked: "2026-11-07",
  sections: [
    {
      id: "google",
      title: "First, how Google handles multilingual pages",
      items: [
        {
          text: "How to write hreflang: the language as an ISO 639-1 code, plus an optional region as a two-letter ISO 3166-1 code; you can also add a script code, such as zh-Hans (Simplified) or zh-Hant (Traditional). Google automatically treats zh-TW as Traditional; a region on its own is invalid; case doesn't matter.",
          sources: [{ label: "Google: localized versions", url: G_LOCALIZED }],
        },
        {
          text: "Google judges a page's language only by its visible content. It doesn't look at the lang attribute or the URL, and doesn't use hreflang to judge the language either.",
          sources: [
            { label: "Google: multi-regional sites", url: G_MULTI },
            { label: "Google: localized versions", url: G_LOCALIZED },
          ],
        },
        {
          text: "URLs can use words in the local language (or a transliteration where needed), and you can also use an internationalised domain name; use UTF-8, and percent-encode non-ASCII characters in links.",
          sources: [
            { label: "Google: multi-regional sites", url: G_MULTI },
            { label: "Google: URL structure", url: G_URL },
          ],
        },
        {
          text: "Machine and AI translation: the scaled content abuse policy, in force since March 2024, names pages generated in bulk through automated transformations such as translation that give users little value, however the content is made. In June 2025 Google removed its advice to block automatically translated pages with robots.txt, saying this was only a documentation change and its behaviour had not changed. That is not a green light for machine translation.",
          sources: [
            { label: "Google spam policies", url: G_SPAM },
            { label: "Google documentation update (2025-06-11)", url: G_UPDATE_2025 },
            { label: "Search Engine Roundtable (2025-06-12)", url: SER_2025 },
          ],
        },
        {
          text: "Pages where only the interface is translated and the main text stays in the original language are treated as duplicates.",
          sources: [{ label: "Google: localized versions", url: G_LOCALIZED }],
        },
        {
          text: "Google also translates search results itself: when a result's language differs from the search language, it may translate the title and snippet, and clicking through opens a machine-translated page. Target languages include Indonesian, Vietnamese, Korean and English, but not Japanese, Russian or Chinese. To opt out of this, add notranslate.",
          sources: [{ label: "Google: translated search results", url: G_TRANSLATED }],
        },
      ],
    },
    {
      id: "us",
      title: "United States: no requirement for private sites to use English; mind the date format",
      items: [
        {
          text: "The March 2025 executive order made English the official language of the United States. It is directed at federal agencies and mentions no requirements for private businesses.",
          sources: [{ label: "The White House (2025-03-01)", url: US_EO }],
        },
        {
          text: "The short date format is month/day/year in the US and day/month/year in the UK, so 11/07/26 reads the opposite way in each; pages for both are best written in a format that can't be misread, such as 7 November 2026.",
          sources: [
            { label: "Unicode CLDR English", url: CLDR_EN },
            { label: "Unicode CLDR British English", url: CLDR_EN_GB },
          ],
        },
      ],
    },
    {
      id: "id",
      title: "Indonesia: address users as Anda; the law requires Indonesian",
      items: [
        {
          text: "Microsoft's Indonesian style guide always addresses the user as Anda (capitalised), in a formal tone; it has no examples addressing the user as kamu.",
          sources: [{ label: "Microsoft Indonesian style guide", url: MS_ID }],
        },
        {
          text: "Law No. 24 of 2009: agreements involving Indonesian citizens must be in Indonesian; where there is a foreign party, that party's language or English can be used as well. Information on goods and services circulating in Indonesia must be in Indonesian. Read literally, terms of service agreed with Indonesian users also count as such agreements; we found no enforcement or case law. Law No. 8 of 1999 on Consumer Protection also prohibits failing to provide instructions for use in Indonesian.",
          sources: [
            { label: "Law No. 24 of 2009 (Wikisource)", url: ID_LAW_24 },
            { label: "Law No. 8 of 1999 (Wikisource)", url: ID_LAW_8 },
          ],
        },
      ],
    },
    {
      id: "vn",
      title: "Vietnam: address users as bạn; URLs work with or without tone marks",
      items: [
        {
          text: "Microsoft's Vietnamese style guide addresses the user as bạn, and when speaking generally it doesn't use gendered forms of address (ông, bà, anh, chị and so on).",
          sources: [{ label: "Microsoft Vietnamese style guide", url: MS_VI }],
        },
        {
          text: "Under Google's rules, a URL can use Vietnamese words with tone marks (percent-encoded) or a transliteration with the tone marks removed.",
          sources: [{ label: "Google: URL structure", url: G_URL }],
        },
      ],
    },
    {
      id: "jp",
      title: "Japan: です・ます style, without overdoing honorifics",
      items: [
        {
          text: "Microsoft's Japanese style guide: generally use the です・ます style, and end menus, buttons and titles with a noun; generally don't use honorific or humble expressions, but do use them where there is a seller and customer relationship (for example お問い合わせください), without being overly polite.",
          sources: [{ label: "Microsoft Japanese style guide (2026-10-20)", url: MS_JA }],
        },
        {
          text: "Leave out the subject wherever you can; use あなた with care, and お客様 for customers. Write katakana full-width, and Latin letters and digits half-width.",
          sources: [{ label: "Microsoft Japanese style guide (2026-10-20)", url: MS_JA }],
        },
        {
          text: "Write dates as 2026年11月7日; in a Japanese locale the yen sign is the full-width ￥.",
          sources: [
            { label: "Unicode CLDR Japanese dates", url: CLDR_JA_DATES },
            { label: "Unicode CLDR Japanese currencies", url: CLDR_JA_CURRENCY },
          ],
        },
      ],
    },
    {
      id: "kr",
      title: "South Korea: -세요 for requests, -십시오 for legal texts",
      items: [
        {
          text: "Microsoft's Korean style guide: when asking users to do something, use -세요 instead of -십시오 (참조하십시오 → 참조하세요), which is more natural; use -습니다 for statements; use -십시오 in end-user licence agreements and legal texts.",
          sources: [{ label: "Microsoft Korean style guide", url: MS_KO }],
        },
        {
          text: "The same guide advises avoiding unnecessary formality, using fewer hard-to-understand Sino-Korean words, and not adding words like 수행, 실행 or 제공 after action nouns (제거를 수행합니다 → 제거합니다).",
          sources: [{ label: "Microsoft Korean style guide", url: MS_KO }],
        },
      ],
    },
    {
      id: "ru",
      title: "Russia: since March 2026, information for consumers must be in Russian, websites included",
      items: [
        {
          text: "Yandex supports hreflang in the page head, but no longer reads language versions from the Sitemap; it treats hreflang as a recommendation, not a directive.",
          sources: [{ label: "Yandex: language versions", url: YANDEX_HREFLANG }],
        },
        {
          text: "Yandex: Cyrillic URLs are fine, but the page and the URL must use the same encoding; transliterated URLs also let the crawler understand what the page is about.",
          sources: [{ label: "Yandex: site structure", url: YANDEX_URLS }],
        },
        {
          text: "The new Article 10.1 of Russia's Consumer Rights Protection Law took effect on 1 March 2026: non-advertising information in public places or aimed at consumers in general must be in Russian; a foreign language may be added, and trade names and trademarks are exempt. The article doesn't mention websites, but the consumer rights regulator says websites count as public places too, and a law firm reads it the same way.",
          sources: [
            { label: "Article 10.1", url: RU_CPL_10_1 },
            { label: "ComNews (2026-02-28)", url: RU_RPN_SITES },
            { label: "Lidings law firm (2026-03-23)", url: RU_LIDINGS },
          ],
        },
        {
          text: "The existing Article 8 already requires information about the seller and the goods to be in Russian, and the new article doesn't change it. We could not find whether this applies to sellers abroad, or what the penalties are.",
          sources: [{ label: "Consultant (2026-03-04)", url: RU_ART_8 }],
        },
        {
          text: "Microsoft's Russian style guide addresses the user as вы (lower case in its example sentences); none of them use ты.",
          sources: [{ label: "Microsoft Russian style guide", url: MS_RU }],
        },
      ],
    },
    {
      id: "cn",
      title: "Mainland China: the revised Law on the Standard Spoken and Written Chinese Language, in force from 2026",
      items: [
        {
          text: "The revised Law on the Standard Spoken and Written Chinese Language took effect on 1 January 2026: online games, online audio-visual programmes, signs and advertisements, company names, and the names and descriptions of goods sold in China, among others, must use the standard spoken and written Chinese language as their basic language and script. The only internet platforms it names as having to meet national standards are those run by the government or providing public services; ordinary commercial sites are not named.",
          sources: [{ label: "Law on the Standard Spoken and Written Chinese Language (revised 2025, Wikisource)", url: CN_LANGUAGE_LAW }],
        },
        {
          text: "Traditional characters may be used only in the listed cases, such as historical relics and sites, surnames, calligraphy, and publishing, teaching and research. For a violation, the competent authority orders a correction; refusing to correct brings a warning or a public notice of criticism. No fine amount is set.",
          sources: [{ label: "Law on the Standard Spoken and Written Chinese Language (revised 2025, Wikisource)", url: CN_LANGUAGE_LAW }],
        },
        {
          text: "Baidu advises against Chinese characters in URLs, as they easily cause recognition problems; a URL, counted from www, should be no longer than 1,024 bytes.",
          sources: [{ label: "Baidu Search Resource Platform (2019-08-17)", url: BAIDU_URL }],
        },
      ],
    },
    {
      id: "zh-hant",
      title: "Traditional Chinese: go through the wording separately for Taiwan and Hong Kong",
      items: [
        {
          text: "In hreflang, zh-TW is treated as Traditional Chinese, zh-Hant can serve as a fallback for any region, and zh-HK is also valid under the language-plus-region rule. When one language has regional versions with similar content, Google recommends marking them with canonical and hreflang, and giving users in no particular region a fallback version.",
          sources: [
            { label: "Google: localized versions", url: G_LOCALIZED },
            { label: "Google: multi-regional sites", url: G_MULTI },
          ],
        },
        {
          text: "The wording differences show on official sites: Microsoft writes 軟件 (\"software\", Hong Kong) and 軟體 (Taiwan); the Hong Kong government writes 網絡 (\"network\") and 數碼 (\"digital\"), Taiwan 網路 and 數位; Hong Kong writes 空氣質素 (\"air quality\"), Taiwan 空氣品質.",
          sources: [
            { label: "Microsoft Hong Kong", url: MS_HK_SOFTWARE },
            { label: "Microsoft Taiwan", url: MS_TW_SOFTWARE },
            { label: "Hong Kong Digital Policy Office", url: HK_DIGITAL_POLICY },
            { label: "Taiwan Ministry of Digital Affairs", url: TW_MODA },
            { label: "Hong Kong Air Quality Health Index", url: HK_AQHI },
            { label: "Taiwan Air Quality Monitoring Network", url: TW_AIR },
          ],
        },
        {
          text: "Microsoft's Traditional Chinese style guide exists only in a Taiwan version: it always addresses the user as 您 (the polite \"you\"), and puts a half-width space between Chinese and Latin letters or digits.",
          sources: [{ label: "Microsoft Traditional Chinese style guide", url: MS_ZH_TW }],
        },
        {
          text: "Automatic Simplified-to-Traditional conversion: among OpenCC's configurations, only s2twp swaps in the words common in Taiwan; s2t, s2tw and s2hk convert characters only and don't change words.",
          sources: [{ label: "OpenCC", url: OPENCC }],
        },
      ],
    },
    {
      id: "eu-uk",
      title: "Europe and the UK: France requires French; in German, choose du or Sie",
      items: [
        {
          text: "France's Toubon law: the names, offers, descriptions, instructions for use, warranty terms, invoices and advertising of goods and services must be in French; where there is a translation, the French version must be just as clear. France's Ministry of Culture says this also applies to sales to France through websites and e-commerce platforms.",
          sources: [
            { label: "Toubon law (Légifrance)", url: FR_TOUBON },
            { label: "French Ministry of Culture", url: FR_CULTURE },
          ],
        },
        {
          text: "Fines are counted per violation: €750 for an individual and €3,750 for a company, which can be multiplied by the number of violations; invoices and orders between businesses don't have to be in French.",
          sources: [{ label: "Simon Associés law firm (2024-06)", url: FR_FINES }],
        },
        {
          text: "Addressing users in German: Microsoft uses Sie for adult users and du for under-18s; Apple's German site uses du. Pick one and use it across the whole site.",
          sources: [
            { label: "Microsoft German style guide (2026-04-15)", url: MS_DE },
            { label: "Apple Germany", url: APPLE_DE },
          ],
        },
        {
          text: "Belgium: write hreflang as de-BE, nl-BE or fr-BE; be on its own is Belarusian.",
          sources: [{ label: "Google: localized versions", url: G_LOCALIZED }],
        },
        {
          text: "British English: Favourite, Centre, Optimise; Mobile phone, not Cell phone; sentence-ending punctuation goes outside the quotation marks.",
          sources: [{ label: "Microsoft British English style guide", url: MS_EN_GB }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Converting Simplified to Traditional in one click and calling it the Taiwan version: the characters change but the words don't, and Taiwanese users see at a glance that it's a mainland site; the Hong Kong version also needs its own pass through a word list.",
      sources: [{ label: "OpenCC", url: OPENCC }],
    },
    {
      text: "Putting hreflang only in the Sitemap: Google reads it there, but Yandex no longer does, so put it in the head; a region code on its own is invalid, and be on its own is Belarusian.",
      sources: [
        { label: "Yandex: language versions", url: YANDEX_HREFLANG },
        { label: "Google: localized versions", url: G_LOCALIZED },
      ],
    },
    {
      text: "Taking Google's removal of \"block automatically translated pages\" as a green light for machine translation: the scaled content abuse policy still names translation, and a page that translates the interface but not the main text is also treated as a duplicate.",
      sources: [{ label: "Google spam policies", url: G_SPAM }],
    },
    {
      text: "Serving Russian consumers English pages only: the regulator holds that from March 2026 websites must have Russian too.",
      sources: [{ label: "ComNews (2026-02-28)", url: RU_RPN_SITES }],
    },
    {
      text: "No French in offers, descriptions and invoices for French consumers: fines add up with each violation.",
      sources: [{ label: "Simon Associés law firm", url: FR_FINES }],
    },
    {
      text: "Copying the English tone: overdoing honorifics or using あなた carelessly in Japanese, -십시오 in Korean requests, and mixing du and Sie in German.",
      sources: [
        { label: "Microsoft Japanese style guide", url: MS_JA },
        { label: "Microsoft Korean style guide", url: MS_KO },
      ],
    },
  ],
  unknowns: [
    "What Naver and Baidu officially say about hreflang.",
    "The text of the Vietnamese-language provisions in Vietnam's Consumer Rights Protection Law, and the text of Indonesia's Presidential Regulation No. 63 of 2019.",
    "The penalties under Russia's Article 10.1, and whether it applies to sellers and websites abroad.",
    "The texts of the language laws of Belgium, Switzerland and Quebec in Canada.",
    "Whether Japan or South Korea has a law requiring private websites to use the national language: we found none, but could not confirm from the statutes that there is none.",
    "The text of California Civil Code section 1632 (certain contracts negotiated in Spanish, Chinese, Vietnamese and other languages must come with a translation).",
  ],
  related: [
    { label: "Choosing a domain (hreflang and language redirects)", path: "/domains" },
    { label: "Which search engine to please first", path: "/search-engines" },
    { label: "Pages and filings before launch", path: "/compliance" },
  ],
};
