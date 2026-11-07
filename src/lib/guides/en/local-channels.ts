// English version of ../local-channels.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Local promotion channels by market: audience figures mostly from DataReportal's Digital 2026 (data from October 2025, mostly ad reach,
// not monthly users) and government surveys; account and posting rules only from each platform's own help pages and terms,
// plus a few dated media reports (named as such).
const PEW_SOCIAL = "https://www.pewresearch.org/internet/fact-sheet/social-media/";
const DR_US = "https://datareportal.com/reports/digital-2026-united-states-of-america";
const DR_ID = "https://datareportal.com/reports/digital-2026-indonesia";
const DR_VN = "https://datareportal.com/reports/digital-2026-vietnam";
const VN_147 = "https://en.baochinhphu.vn/social-media-platforms-have-to-authenticate-users-via-phone-numbers-decree-111241112173317774.htm";
const ZALO_VERIFY = "https://oa.zalo.me/home/documents/policy/xac-thuc-tai-khoan";
const ZALO_OA = "https://oa.zalo.me/home/documents/policy/dang-ky-va-su-dung-tai-khoan-zalo-official-account-doanh-nghiep";
const VIBLO_TERMS = "https://viblo.asia/terms/vi_term";
const SOUMU_SNS = "https://www.soumu.go.jp/menu_news/s-news/01iicp01_02000130.html";
const DR_JP = "https://datareportal.com/reports/digital-2026-japan";
const LINE_HELP = "https://help2.line.me/official_account_jp/web?lang=ja";
const LINE_VERIFY = "https://www.lycbiz.com/jp/column/line-official-account/guideline/20190829/";
const QIITA_GUIDE = "https://help.qiita.com/ja/articles/qiita-community-guideline";
const ZENN_GUIDE = "https://zenn.dev/guideline";
const NOTE_IR = "https://edinetdb.jp/company/E38043/text";
const DR_KR = "https://datareportal.com/reports/digital-2026-south-korea";
const NAVER_ACCOUNT = "https://seoulstart.com/guides/naver-account-guide";
const NAVER_PASSPORT = "https://m.etnews.com/20260609000083";
const KAKAO_CHANNEL = "https://kakaobusiness.gitbook.io/main/channel/start";
const KAKAO_GLOBAL = "https://kakaobusiness.gitbook.io/global/channel/createchannel/licenses";
const GN_GUIDE = "https://news.hada.io/guidelines";
const DISQUIET = "https://yozm.wishket.com/magazine/detail/1975/";
const OKKY = "https://okky.kr/";
const DR_RU = "https://datareportal.com/reports/digital-2026-russian-federation";
const MT_TELEGRAM = "https://www.themoscowtimes.com/2026/02/10/roskomnadzor-tightens-restrictions-on-telegram-as-users-report-disruptions-a91907";
const MEDUZA_TELEGRAM =
  "https://meduza.io/en/feature/2026/06/11/russia-has-been-blocking-telegram-for-months-meduza-asked-five-popular-channel-admins-if-it-s-working";
const WHATSAPP_BLOCK = "https://abc17news.com/money/cnn-business-consumer/2026/02/12/russia-says-it-has-blocked-whatsapp-amid-wider-clampdown-on-social-media/";
const MAX_MEDIASCOPE = "https://verstka.media/messendzher-max-vpervye-operedil-telegram-po-mesyachnoj-auditorii-v-rossii-mediascope";
const MAX_40 = "https://mobile-review.com/all/news/messendzher-max-stal-dostupen-dlya-registraczii-v-40-stranah/";
const RU_406 = "https://habr.com/ru/news/751532/";
const HABR_RULES = "https://habr.com/ru/docs/help/rules/";
const HABR_SANDBOX = "https://habr.com/docs/help/sandbox";
const HABR_PRICE = "https://company.habr.com/static/price-non-resident-ru.pdf";
const VC_RULES = "https://vc.ru/rules";
const RU_ERID = "https://pravo163.ru/pokupka-inostrannymi-kompaniyami-reklamy-u-blogerov/";
const RU_BLOGGERS = "https://rg.ru/2024/08/15/iuristy-raziasnili-kak-budet-rabotat-zakon-o-registracii-blogerov.html";
const RU_META_ADS = "https://rbc.ru/society/07/04/2025/67f3c1569a79478b85f9f1ec";
const CNNIC_57 = "https://www.cnnic.net.cn/n4/2026/0304/c88-11549.html";
const TENCENT_Q2 = "https://www.tencent.com/wp-content/uploads/2026/08/Tencent-Announces-2026-Second-Quarter-Results.pdf";
const BILI_IR = "https://ir.bilibili.com/";
const WX_MP = "https://mp.weixin.qq.com/";
const WX_AGREEMENT = "https://mp.weixin.qq.com/cgi-bin/readtemplate?t=home/agreement_tmpl&type=info&lang=zh_CN";
const ZHIHU_TERMS = "https://www.zhihu.com/term/zhihu-terms";
const V2EX_ABOUT = "https://www.v2ex.com/about";
const V2EX_NODE_HELP = "https://www.v2ex.com/help/node";
const EUROSTAT =
  "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Digital_economy_and_society_statistics_-_households_and_individuals";
const DR_UK = "https://datareportal.com/reports/digital-2026-united-kingdom";
const DR_DE = "https://datareportal.com/reports/digital-2026-germany";
const DR_FR = "https://datareportal.com/reports/digital-2026-france";
const XING_WIKI = "https://de.wikipedia.org/wiki/XING";
const WYKOP_RULES = "https://wykop.pl/regulamin";

export const LOCAL_CHANNELS_EN: Guide = {
  slug: "local-channels",
  short: "Local channels",
  title: "Local promotion channels by market: which platforms and communities people use, and whether a foreign person or company can open an account",
  description:
    "Local channels beyond SEO, market by market: X, LINE, Qiita and Zenn in Japan; KakaoTalk, Naver and GeekNews in Korea; Facebook and Zalo in Vietnam; TikTok in Indonesia; VK, Habr and the restricted Telegram in Russia; WeChat official accounts, Bilibili and V2EX in China; LinkedIn in Europe. Audience sizes, whether business accounts need a local licence, and what each allows you to promote.",
  intro:
    "Each market gathers somewhere else: X and LINE in Japan, KakaoTalk and Naver in Korea, Facebook and Zalo in Vietnam, VK in Russia, WeChat in China. Two patterns hold almost everywhere: official and business accounts usually need a local business licence, and developer communities do not take plain promotion; what they take is the technical story of your own product. Audience figures mostly come from DataReportal's Digital 2026 and are mostly ad reach, not monthly users, so compare them only by order of magnitude. Global channels such as Product Hunt, Hacker News and Reddit are in the \"Channels beyond SEO\" guide.",
  checked: "2026-11-07",
  sections: [
    {
      id: "us",
      title: "United States: follow the global channels guide",
      items: [
        {
          text: "Pew's 2026 survey: 84% of US adults use YouTube, 70% Facebook and 51% Instagram.",
          sources: [{ label: "Pew Research (2026-10-19)", url: PEW_SOCIAL }],
        },
        {
          text: "Ad reach: YouTube 254 million, Facebook 198 million, TikTok 153 million (18+), X 99 million (28.5% of the population); LinkedIn has 270 million registered members.",
          sources: [{ label: "DataReportal US", url: DR_US }],
        },
      ],
    },
    {
      id: "id",
      title: "Indonesia: TikTok and YouTube are the biggest, LinkedIn is growing",
      items: [
        {
          text: "180 million social media users, 62.9% of the population. Ad reach: TikTok 180 million (18+), YouTube 151 million, Facebook 121 million, Instagram 108 million, X 22.9 million.",
          sources: [{ label: "DataReportal Indonesia", url: DR_ID }],
        },
        {
          text: "LinkedIn has 37 million registered members, up 15.6% in a year, while X's ad reach fell 8.6% (different measures, so read only the direction).",
          sources: [{ label: "DataReportal Indonesia", url: DR_ID }],
        },
      ],
    },
    {
      id: "vn",
      title: "Vietnam: Facebook, Zalo and TikTok, and a Zalo official account needs a Vietnamese licence",
      items: [
        {
          text: "Facebook ad reach is 79 million (77.6% of the population), Zalo has 78.3 million monthly users (reported by VNG), TikTok 76.1 million (18+), YouTube 62.1 million; Instagram only 11.7 million.",
          sources: [{ label: "DataReportal Vietnam", url: DR_VN }],
        },
        {
          text: "Decree 147, in force from 25 December 2024: social platforms at home and abroad must verify users with a Vietnamese phone number, or an ID number for those without one; only verified accounts can post or share.",
          sources: [{ label: "Vietnam government news (2024-11-12)", url: VN_147 }],
        },
        {
          text: "Verifying a Zalo Official Account requires proof that the business is registered and operating under Vietnamese law; documents are due within 14 days of creation, and an account rejected and not resubmitted within 14 days is locked for good. A foreign company opening one directly will not get far.",
          sources: [
            { label: "Zalo OA verification rules", url: ZALO_VERIFY },
            { label: "Zalo OA usage rules", url: ZALO_OA },
          ],
        },
        {
          text: "The developer community Viblo is still active, but its terms forbid commercial promotion; posts with advertising content or links are restricted and accounts can be suspended.",
          sources: [{ label: "Viblo terms", url: VIBLO_TERMS }],
        },
      ],
    },
    {
      id: "jp",
      title: "Japan: X is far stronger than elsewhere, and developer communities only take technical posts",
      items: [
        {
          text: "The Ministry of Internal Affairs and Communications' December 2025 survey (ages 13–79): LINE 92.9%, YouTube 81.5%, Instagram 54.8%, X 44.7%, TikTok 36.7%, Facebook 27.0%.",
          sources: [{ label: "MIC (2026-06-26)", url: SOUMU_SNS }],
        },
        {
          text: "X reaches 71.2 million people in Japan, 57.9% of the population (28.5% in the US); LINE has 99 million monthly users.",
          sources: [{ label: "DataReportal Japan", url: DR_JP }],
        },
        {
          text: "A verified LINE Official Account is only open to accounts in Japan, Taiwan and Thailand; an account's country is set automatically when it is created and cannot change; a company applying needs a Japanese corporate number, and individuals cannot be verified.",
          sources: [
            { label: "LINE Official Account help", url: LINE_HELP },
            { label: "LY verification notes (updated 2026-10-28)", url: LINE_VERIFY },
          ],
        },
        {
          text: "Qiita does not allow posts whose main purpose is promotion or sales; a post about how you built your own product is not promotion. Zenn also asks you to avoid posts mainly promoting a product and to keep promotion to the end of the post.",
          sources: [
            { label: "Qiita community guidelines", url: QIITA_GUIDE },
            { label: "Zenn guidelines", url: ZENN_GUIDE },
          ],
        },
        {
          text: "note has 11.14 million members (end of November 2025), good for long posts about the story behind a product.",
          sources: [{ label: "note annual securities report excerpt", url: NOTE_IR }],
        },
      ],
    },
    {
      id: "kr",
      title: "Korea: everyone is on KakaoTalk, and a business channel needs a business licence",
      items: [
        {
          text: "KakaoTalk has 49.1 million monthly users, 95.1% of the population; ad reach is YouTube 42.9 million, Instagram 25.6 million, TikTok 11.8 million, X 10.4 million.",
          sources: [{ label: "DataReportal South Korea", url: DR_KR }],
        },
        {
          text: "According to a third-party guide, a Naver account can be opened with a foreign phone number, but real-name features such as Naver Pay and shopping need a Korean number in your own name; since June 2026 foreigners can verify with a passport, but only for bookings and payments in Naver Map.",
          sources: [
            { label: "Seoul Start guide", url: NAVER_ACCOUNT },
            { label: "Electronic Times (2026-06-09)", url: NAVER_PASSPORT },
          ],
        },
        {
          text: "Anyone can open a KakaoTalk channel for free; turning it into a business channel needs a business registration number and licence. Kakao only describes the route for US companies (passport plus a US business licence); other countries are not covered.",
          sources: [
            { label: "Kakao channel basics", url: KAKAO_CHANNEL },
            { label: "Kakao documents for foreign companies", url: KAKAO_GLOBAL },
          ],
        },
        {
          text: "The developer community GeekNews: products you or your team made may only be posted to Show, and only things people can try directly; blogs, landing pages and YouTube links are not accepted, and posting several projects in a short time gets you limited.",
          sources: [{ label: "GeekNews guidelines", url: GN_GUIDE }],
        },
        {
          text: "Disquiet is a community for showing products and writing build logs (330,000 users in 2023); the developer community OKKY has a dedicated promotion and ads board.",
          sources: [
            { label: "Wishket report (2023-04-14)", url: DISQUIET },
            { label: "OKKY", url: OKKY },
          ],
        },
      ],
    },
    {
      id: "ru",
      title: "Russia: VK and Habr first; Telegram can no longer be relied on",
      items: [
        {
          text: "VK has 92.5 million monthly users; TikTok reaches 66.7 million (18+); X only 464,000.",
          sources: [{ label: "DataReportal Russia", url: DR_RU }],
        },
        {
          text: "Roskomnadzor began restricting Telegram on 10 February 2026, and by June it would not open without a VPN; according to Agentstvo, the throttling in late April and early May cut Russian channels' audiences by about half. The Kremlin confirmed in February 2026 that WhatsApp is blocked.",
          sources: [
            { label: "The Moscow Times (2026-02-10)", url: MT_TELEGRAM },
            { label: "Meduza (2026-06-11)", url: MEDUZA_TELEGRAM },
            { label: "CNN (2026-02-12, syndicated)", url: WHATSAPP_BLOCK },
          ],
        },
        {
          text: "The domestic messenger Max: Mediascope put its monthly reach at 86.3 million in June 2026, above Telegram's 75.7 million; since March 2026 it accepts phone numbers from 40 countries, and the reports name Vietnam, Indonesia, the UAE, Thailand and Turkey, not China.",
          sources: [
            { label: "Verstka (2026-07-21)", url: MAX_MEDIASCOPE },
            { label: "Mobile-review (2026-03-06)", url: MAX_40 },
          ],
        },
        {
          text: "Federal Law 406, in force since December 2023: Russian sites may only let users sign up and log in with a Russian phone number, the government services account or a Russian account system; foreign email is not allowed.",
          sources: [{ label: "Habr news (2023-07-31)", url: RU_406 }],
        },
        {
          text: "On Habr, promotional content belongs in a company blog or a one-off post in the «Я пиарюсь» hub; new authors go through a sandbox review that advertising does not pass. A company blog for non-residents starts at US$6,710 for three months. vc.ru's rules also ban posts promoting commercial services.",
          sources: [
            { label: "Habr rules (2026-07-08)", url: HABR_RULES },
            { label: "Habr sandbox", url: HABR_SANDBOX },
            { label: "Habr non-resident prices", url: HABR_PRICE },
            { label: "vc.ru rules (2019)", url: VC_RULES },
          ],
        },
        {
          text: "Paying Russian bloggers: since September 2022 online ads need an identifier (ERID), issued against a Russian tax number, so a foreign company has to go through a Russian intermediary; bloggers with over 10,000 followers who have not registered with Roskomnadzor may not take ads since 2025; since September 2025 ads on blocked platforms such as Instagram and Facebook are banned.",
          sources: [
            { label: "pravo163 (checked 2026-09-22)", url: RU_ERID },
            { label: "Rossiyskaya Gazeta (2024-08-15)", url: RU_BLOGGERS },
            { label: "RBC (2025-04-07)", url: RU_META_ADS },
          ],
        },
      ],
    },
    {
      id: "cn",
      title: "Mainland China: WeChat official accounts, Bilibili and V2EX, all with real names",
      items: [
        {
          text: "1.125 billion internet users (December 2025); WeChat and Weixin together have 1.439 billion monthly users (including abroad), Bilibili 371 million.",
          sources: [
            { label: "CNNIC 57th report", url: CNNIC_57 },
            { label: "Tencent Q2 2026 results", url: TENCENT_Q2 },
            { label: "Bilibili investor relations", url: BILI_IR },
          ],
        },
        {
          text: "The WeChat Official Accounts Platform has service accounts (companies and organisations) and subscription accounts (individuals, media and companies), registered under real names; the agreement bans pushing users to follow, click or share, and cross-promotion with other accounts or platforms without Tencent's written permission.",
          sources: [
            { label: "WeChat Official Accounts Platform", url: WX_MP },
            { label: "Platform service agreement", url: WX_AGREEMENT },
          ],
        },
        {
          text: "Zhihu requires real-identity verification as the law demands, with a separate agreement for organisation accounts.",
          sources: [{ label: "Zhihu terms (updated 2025-03-20)", url: ZHIHU_TERMS }],
        },
        {
          text: "V2EX has over 750,000 members; your own projects go in the 分享创造 (Show and tell) node, and company marketing must go in the 推广 (Promotion) node; misplaced posts are moved and repeat offences affect the account.",
          sources: [
            { label: "About V2EX", url: V2EX_ABOUT },
            { label: "V2EX node help", url: V2EX_NODE_HELP },
          ],
        },
      ],
    },
    {
      id: "eu-uk",
      title: "Europe and the UK: LinkedIn, Reddit and X, with few local communities",
      items: [
        {
          text: "67% of people aged 16–74 in the EU use social networks (2025).",
          sources: [{ label: "Eurostat", url: EUROSTAT }],
        },
        {
          text: "LinkedIn members: UK 48 million, France 38 million, Germany 24 million. Reddit ad reach: UK 45.8 million, Germany 29.3 million, France 20.5 million. X: 19 million each in the UK and Germany, 12.4 million in France.",
          sources: [
            { label: "DataReportal UK", url: DR_UK },
            { label: "DataReportal Germany", url: DR_DE },
            { label: "DataReportal France", url: DR_FR },
          ],
        },
        {
          text: "Do not treat XING as Germany's LinkedIn: it closed its groups and events in 2023 and became a job platform.",
          sources: [{ label: "Wikipedia (citing heise and others)", url: XING_WIKI }],
        },
        {
          text: "The only still-active national community found was Poland's Wykop, whose rules ban vote manipulation, spamming and hidden advertising.",
          sources: [{ label: "Wykop rules (2026-05-11)", url: WYKOP_RULES }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Betting your Russian promotion on Telegram channels, as people did before 2025: it has been restricted since 2026, channel audiences fell by about half, and WhatsApp is blocked.",
      sources: [{ label: "Meduza (2026-06-11)", url: MEDUZA_TELEGRAM }],
    },
    {
      text: "Opening a local official account with a foreign company: a Zalo official account needs a Vietnamese licence, a Kakao business channel needs a business licence, and a verified LINE account needs a Japanese corporate number.",
      sources: [
        { label: "Zalo OA verification rules", url: ZALO_VERIFY },
        { label: "Kakao channel basics", url: KAKAO_CHANNEL },
        { label: "LY verification notes", url: LINE_VERIFY },
      ],
    },
    {
      text: "Posting a product pitch in developer communities: Qiita, Zenn, Viblo and Habr do not take promotion-first posts, and GeekNews only takes Show posts people can try; what works is how you built it.",
      sources: [
        { label: "Qiita community guidelines", url: QIITA_GUIDE },
        { label: "GeekNews guidelines", url: GN_GUIDE },
      ],
    },
    {
      text: "Paying Russian bloggers yourself: you need an ERID, which a foreign company can only get through a Russian intermediary, and unregistered bloggers may not take ads.",
      sources: [{ label: "pravo163", url: RU_ERID }],
    },
    {
      text: "Comparing DataReportal figures as monthly users: most are ad reach, some exceed the population, so compare only orders of magnitude.",
      sources: [{ label: "DataReportal US", url: DR_US }],
    },
  ],
  unknowns: [
    "WhatsApp usage in Indonesia and how active Kaskus still is, and whether Indonesia has a developer community like Qiita or Viblo.",
    "Whether a personal Zalo account can be opened with a Chinese phone number, and how Vietnam's Decree 147 applies to accounts registered abroad.",
    "Whether a foreign company without a Japanese corporate number can get a verified LINE account, and Hatena Bookmark's own monthly users.",
    "Naver's own help text on foreign phone numbers, and what non-US foreign companies need for a Kakao business channel.",
    "Whether VK accepts foreign phone numbers now, and the full list of the 40 countries Max accepts.",
    "What a foreign company or person needs for a WeChat subscription or service account, and what Xiaohongshu, Bilibili and Zhihu ask of foreign entities.",
    "Whether the UK, Germany or France have local tech communities worth listing.",
  ],
  related: [
    { label: "Channels beyond SEO (Product Hunt, HN, Reddit, X)", path: "/channels" },
    { label: "Which search engine to please first", path: "/search-engines" },
    { label: "Language and localisation details", path: "/localization" },
  ],
};
