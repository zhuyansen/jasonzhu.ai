// English version of ../hosting.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Where to host and whether local users can open the site, market by market: only cloud and CDN providers' official docs,
// regulators, law databases and measurements with a stated method (OONI, GreatFire). The Globalping measurement for
// mainland China is our own, taken on 2026-09-17, with a small sample.
const CF_ROUTING = "https://developers.cloudflare.com/support/troubleshooting/general-troubleshooting/geographic-traffic-routing/";
const CF_HN = "https://news.ycombinator.com/item?id=45042460";
const CF_NETWORK = "https://www.cloudflare.com/network/";
const VERCEL_REGIONS = "https://vercel.com/docs/regions";
const VERCEL_FN_REGION = "https://vercel.com/docs/functions/configuring-functions/region";
const NETLIFY_FN = "https://docs.netlify.com/functions/optional-configuration/";
const CLOUDFRONT_PRICE = "https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/";
const CLOUDFRONT_FEATURES = "https://aws.amazon.com/cloudfront/features/";
const FASTLY_MAP = "https://www.fastly.com/network-map/";
const DOJ_DATA = "https://www.justice.gov/nsd/data-security";
const ID_BLOCK_2025 = "https://www.hukumonline.com/berita/a/komdigi-blokir-ebay-hingga-maskapai-klm-lt68626c8177d07?page=all";
const OONI_ID = "https://ooni.org/post/indonesia-internet-censorship/";
const OONI_ID_REDDIT =
  "https://api.ooni.io/api/v1/aggregation?probe_cc=ID&test_name=web_connectivity&domain=www.reddit.com&since=2026-08-01&until=2026-11-01";
const DLA_ID_TRANSFER = "https://www.dlapiperdataprotection.com/?t=transfer&c=ID";
const VN_CABLES = "https://english.vov.vn/en/society/four-undersea-cables-hit-faults-vietnams-international-internet-slows-locally-post1328208.vov";
const VN_CABLES_WMEDIA = "https://w.media/four-out-of-six-subsea-cables-in-vietnam-out-of-service/";
const VN_DECREE_53 = "https://www.tilleke.com/insights/decree-53-provides-long-awaited-guidance-on-implementation-of-vietnams-cybersecurity-law/";
const DLA_VN_TRANSFER = "https://www.dlapiperdataprotection.com/?t=transfer&c=VN";
const PPC_OVERSEAS_SERVER = "https://www.ppc.go.jp/all_faq_index/faq1-q12-3/";
const ISOC_KR = "https://www.internetsociety.org/resources/doc/2022/south-koreas-interconnection-rules/";
const TWITCH_KR = "https://blog.twitch.tv/en/2023/12/05/an-update-on-twitch-in-korea/";
const KR_GOOGLE_MAPS =
  "https://www.cp24.com/news/world/2026/02/27/south-korea-allows-google-to-export-map-data-after-years-of-frustration-over-google-maps";
const KR_PIPA_28_8 = "https://prighter.com/resources/laws/korean-pipa/main/articles/article-28-8";
const CF_RUSSIA = "https://blog.cloudflare.com/russian-internet-users-are-unable-to-access-the-open-internet/";
const RU_ECH =
  "https://meduza.io/en/news/2024/11/08/russia-s-internet-censor-demands-a-break-from-cloudflare-after-the-american-company-enabled-new-privacy-tools-last-month";
const CF_ECH = "https://developers.cloudflare.com/ssl/edge-certificates/ech/";
const RU_WHITELIST =
  "https://meduza.io/en/news/2026/08/05/kommersant-only-one-third-of-mobile-internet-traffic-in-central-russia-was-unrestricted-nearly-90-in-border-regions-went-through-whitelists";
const RU_YOUTUBE = "https://www.themoscowtimes.com/2026/02/12/whatsapp-accuses-russian-government-of-trying-to-fully-block-platform-a91928";
const OONI_RU_YOUTUBE =
  "https://api.ooni.io/api/v1/aggregation?probe_cc=RU&test_name=web_connectivity&domain=www.youtube.com&since=2026-08-01&until=2026-11-01";
const TILDA_RU = "https://tilda.cc/ru/answers/a/rkn-block/";
const RU_LOCALISATION = "https://b1.ru/en/insights/law-messenger/localization-of-personal-data-of-russian-citizens-6-march-2025/";
const GLOBALPING = "https://globalping.io/";
const GF_VERCEL = "https://en.greatfire.org/vercel.app";
const VERCEL_CN = "https://vercel.com/kb/guide/accessing-vercel-hosted-sites-from-mainland-china";
const GF_NETLIFY = "https://en.greatfire.org/netlify.app";
const GF_PAGES = "https://en.greatfire.org/pages.dev";
const GF_GITHUB = "https://en.greatfire.org/github.io";
const GF_GOOGLE = "https://en.greatfire.org/https/www.google.com";
const RECAPTCHA_FAQ = "https://developers.google.com/recaptcha/docs/faq";
const GF_GTM = "https://en.greatfire.org/https/www.googletagmanager.com";
const GF_GA4 = "https://en.greatfire.org/https/region1.google-analytics.com";
const GF_FONTS = "https://en.greatfire.org/fonts.googleapis.com";
const GF_YOUTUBE = "https://en.greatfire.org/https/www.youtube.com";
const JSDELIVR_ICP = "https://github.com/jsdelivr/jsdelivr/issues/18348";
const GF_JSDELIVR = "https://en.greatfire.org/https/cdn.jsdelivr.net";
const GF_STRIPE = "https://en.greatfire.org/https/js.stripe.com";
const CF_CHINA_FAQ = "https://developers.cloudflare.com/china-network/faq/";
const CF_CHINA = "https://developers.cloudflare.com/china-network/";
const CN_PIPL = "http://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm";
const VERCEL_HKG_OPENAI = "https://vercel.com/changelog/openai-will-not-support-the-hong-kong-region-hkg1-for-functions";
const OONI_LALIGA = "https://ooni.org/post/2026-laliga-collateral/";
const EU_LATOMBE = "https://curia.europa.eu/jcms/upload/docs/application/pdf/2025-09/cp250106en.pdf";
const EU_LATOMBE_APPEAL =
  "https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission";
const UK_DATA_BRIDGE = "https://www.gov.uk/government/publications/uk-us-data-bridge-supporting-documents";
const EDPB_TRANSFER = "https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052021-interplay-between-application-article-3_en";
const MUNICH_FONTS = "https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2022-N-612";

export const HOSTING_EN: Guide = {
  slug: "hosting",
  short: "Hosting and access",
  title: "Where to host and whether local users can open your site: blocking and throttling in each market, third-party resources that fail to load, CDN locations and data localisation",
  description:
    "Hosting and access problems for overseas sites, market by market: vercel.app is blocked in mainland China and GA quietly loses data there, Russia throttles sites on Cloudflare to 16KB, Vietnam's international undersea cables often break, Korea's network fees are high and its CDN locations few, and in Spain sites get caught in IP blocks during football matches; plus whether each CDN has locations in each market, and what the EU, Russia and Vietnam require about where data is stored.",
  intro:
    "Most overseas sites sit in a US region of Vercel, Cloudflare or AWS and open fine in the US, Japan and Europe, but a few markets need a separate look: mainland China blocks vercel.app and most Google services, Russia throttles sites on Cloudflare so that only 16KB loads, Vietnam's international undersea cables often break, and Korea's network fees mean few CDN locations. Below, market by market: whether the site opens, which third-party resources break, whether each CDN has locations there, and whether data has to be stored in the country.",
  checked: "2026-11-07",
  sections: [
    {
      id: "defaults",
      title: "First, the defaults of a few hosts and CDNs",
      lead: "Static pages are served from edge locations and are mostly fine; server-side rendering and APIs run in the functions' region, and the defaults are all in the eastern US.",
      items: [
        {
          text: "Cloudflare: which data centres serve your domain varies by customer and cannot be set per account; mainland China is not part of its network, and visitors there are served from locations outside the mainland. Its CEO said on Hacker News that when capacity is tight, free customers are the first to be moved to other locations, usually only for a short time.",
          sources: [
            { label: "Cloudflare docs (2026-10-14)", url: CF_ROUTING },
            { label: "Matthew Prince on HN (2025-08-27)", url: CF_HN },
          ],
        },
        {
          text: "Vercel functions default to iad1 (Washington, D.C.), and on the Hobby plan you can choose only one region; Netlify functions default to Ohio, only paid plans can change that, and in Asia-Pacific the only choices are Tokyo, Singapore and Sydney.",
          sources: [
            { label: "Vercel regions", url: VERCEL_REGIONS },
            { label: "Vercel function regions", url: VERCEL_FN_REGION },
            { label: "Netlify function configuration", url: NETLIFY_FN },
          ],
        },
        {
          text: "CloudFront's cheapest tier, Price Class 100, covers only the US, Canada, Mexico and Europe; Japan, Korea and Southeast Asia get local edge locations only with Price Class 200.",
          sources: [{ label: "CloudFront pricing", url: CLOUDFRONT_PRICE }],
        },
        {
          text: "Fastly's locations in Asia are Tokyo, Osaka, Seoul, Hong Kong and Singapore, with Jakarta coming soon; it has none in Vietnam, mainland China or Russia.",
          sources: [{ label: "Fastly network map", url: FASTLY_MAP }],
        },
      ],
    },
    {
      id: "us",
      title: "United States: the most locations; watch the Justice Department's data security rule",
      items: [
        {
          text: "Cloudflare has locations in about 47 US cities, and Vercel has 4 compute regions.",
          sources: [
            { label: "Cloudflare network", url: CF_NETWORK },
            { label: "Vercel regions", url: VERCEL_REGIONS },
          ],
        },
        {
          text: "The US Department of Justice's data security rule took effect on 8 April 2025: it restricts transactions involving bulk sensitive data on Americans between US persons and companies or individuals from \"countries of concern\" (including mainland China, Hong Kong, Macau and Russia). Collecting data directly from US users does not count as data brokerage, but if you sell B2B SaaS to US companies and could access their bulk sensitive data, they may ask you to prove that you cannot.",
          sources: [{ label: "US Department of Justice (updated 2026-10-08)", url: DOJ_DATA }],
        },
      ],
    },
    {
      id: "id",
      title: "Indonesia: edge locations in the country, and filtering varies by ISP",
      items: [
        {
          text: "Cloudflare has locations in 4 cities including Jakarta, and CloudFront has one in Jakarta; Vercel and Netlify have no Indonesian region, the nearest being Singapore.",
          sources: [
            { label: "Cloudflare network", url: CF_NETWORK },
            { label: "CloudFront locations", url: CLOUDFRONT_FEATURES },
          ],
        },
        {
          text: "Sites without a PSE registration get blocked: in June 2025 Komdigi blocked the Indonesian sites of eBay, KLM and others on these grounds. For the registration requirements, see the guide on pages and filings before launch.",
          sources: [{ label: "Hukumonline (2025-06-30)", url: ID_BLOCK_2025 }],
        },
        {
          text: "Filtering relies on a government list and DNS hijacking by ISPs, and each ISP does it differently: OONI measured reddit.com 15,000 times from August to October 2026; 216 measurements were confirmed blocked, and the vast majority were normal.",
          sources: [
            { label: "OONI report", url: OONI_ID },
            { label: "OONI data", url: OONI_ID_REDDIT },
          ],
        },
        {
          text: "Data may be kept abroad, provided the competent authorities can supervise it; transferring personal data abroad requires a destination country whose protection is no lower than Indonesia's, binding safeguards, or the person's consent.",
          sources: [{ label: "DLA Piper Indonesia (2026-02-13)", url: DLA_ID_TRANSFER }],
        },
      ],
    },
    {
      id: "vn",
      title: "Vietnam: international undersea cables often break; sites hosted in the country are unaffected",
      items: [
        {
          text: "According to Voice of Vietnam, two undersea cables, SJC2 and AAE-1, failed almost at the same time on 25 August 2026; with the ones not yet repaired, 4 of the 8 international cables had problems, and access to sites abroad slowed at peak times. Websites and services hosted in Vietnam were expected to be unaffected.",
          sources: [{ label: "Voice of Vietnam (2026-08-28)", url: VN_CABLES }],
        },
        {
          text: "Cloudflare has locations in Hanoi, Ho Chi Minh City and Da Nang, and CloudFront in Hanoi and Saigon; Fastly, Vercel and Netlify have no location or region in Vietnam.",
          sources: [
            { label: "Cloudflare network", url: CF_NETWORK },
            { label: "CloudFront locations", url: CLOUDFRONT_FEATURES },
          ],
        },
        {
          text: "Since January 2026, storing personal data collected in Vietnam on servers or clouds abroad also counts as a cross-border transfer, and a transfer impact assessment must be filed with the Ministry of Public Security within 60 days. Decree 53/2022 requires local storage only from foreign companies in 10 types of service, and only when they do not cooperate with law enforcement.",
          sources: [
            { label: "DLA Piper Vietnam (2026-02-15)", url: DLA_VN_TRANSFER },
            { label: "Tilleke & Gibbins (2022-08-19)", url: VN_DECREE_53 },
          ],
        },
      ],
    },
    {
      id: "jp",
      title: "Japan: well covered, and data can be stored abroad",
      items: [
        {
          text: "Cloudflare has locations in Tokyo, Osaka, Fukuoka and Naha; CloudFront and Fastly in Tokyo and Osaka; Vercel has two regions, Tokyo and Osaka. On CloudFront's Price Class 100, users in Japan do not get Japanese edge locations.",
          sources: [
            { label: "Cloudflare network", url: CF_NETWORK },
            { label: "CloudFront pricing", url: CLOUDFRONT_PRICE },
            { label: "Vercel regions", url: VERCEL_REGIONS },
          ],
        },
        {
          text: "The Personal Information Protection Commission: storing personal data on a server abroad that you manage yourself, or with a cloud provider that by contract does not handle the data, is not providing it to a third party in a foreign country and needs no separate consent; but you must understand that country's personal information rules, take security measures, and make this information available to users.",
          sources: [{ label: "Personal Information Protection Commission Q&A", url: PPC_OVERSEAS_SERVER }],
        },
      ],
    },
    {
      id: "kr",
      title: "South Korea: network fees are high, and serving from abroad is slow",
      items: [
        {
          text: "Since 2016 Korean network operators have settled traffic with each other on a sender-pays basis, and IP bandwidth in Seoul costs about 10 times as much as in Frankfurt or London; traffic with Korean operators is often exchanged abroad, and content hosted abroad adds latency. Twitch left Korea in February 2024 for this reason.",
          sources: [
            { label: "Internet Society (2022-05-11)", url: ISOC_KR },
            { label: "Twitch (2023-12-05)", url: TWITCH_KR },
          ],
        },
        {
          text: "Cloudflare has only one location in Korea, Seoul; CloudFront and Fastly are also in Seoul, Vercel has a Seoul region, and Netlify has none. We found no solid evidence on whether visitors to sites on the Free and Pro plans are served from Seoul.",
          sources: [
            { label: "Cloudflare network", url: CF_NETWORK },
            { label: "Vercel regions", url: VERCEL_REGIONS },
          ],
        },
        {
          text: "Google Maps has never had full walking and driving directions in Korea, and Korea only approved the export of map data, with conditions, in February 2026; if you embed a map, local users are more used to Naver Map or Kakao Map.",
          sources: [{ label: "CP24 (2026-02-27)", url: KR_GOOGLE_MAPS }],
        },
        {
          text: "We found no server localisation requirement; keeping data abroad to perform a contract with the user needs no separate consent, as long as the privacy policy states which country it goes to and to whom.",
          sources: [{ label: "Personal Information Protection Act, Art. 28-8 (English translation)", url: KR_PIPA_28_8 }],
        },
      ],
    },
    {
      id: "ru",
      title: "Russia: sites on Cloudflare load only 16KB",
      items: [
        {
          text: "Since 9 June 2025, Russia's main ISPs have throttled sites hosted on Cloudflare so that only the first 16KB of each resource loads, which in practice means most web pages do not open; outside reports say Hetzner, DigitalOcean and OVH are affected too. Cloudflare says it cannot restore access.",
          sources: [{ label: "Cloudflare blog (2025-06-26)", url: CF_RUSSIA }],
        },
        {
          text: "Since November 2024 Russia has blocked Cloudflare connections that use ECH; ECH is on by default on Cloudflare's Free plan, and only paid plans can turn it off.",
          sources: [
            { label: "Meduza (2024-11-08)", url: RU_ECH },
            { label: "Cloudflare ECH docs", url: CF_ECH },
          ],
        },
        {
          text: "Mobile networks also have a \"whitelist mode\" in which only sites on an approved list open: according to Kommersant, in July 2026 only about 30% of mobile sessions in central Russia were unrestricted, about half in Moscow went through whitelists, and nearly 90% in border regions.",
          sources: [{ label: "Meduza summary (2026-08-05)", url: RU_WHITELIST }],
        },
        {
          text: "In February 2026 YouTube was removed from Russia's national domain name system; OONI recorded anomalies in more than half of access attempts, and embedded videos basically do not play. Tilda, a Russian site builder, advises replacing Google Fonts with system fonts, GA with Yandex Metrica and Google Maps with Yandex Maps.",
          sources: [
            { label: "The Moscow Times (2026-02-12)", url: RU_YOUTUBE },
            { label: "OONI data", url: OONI_RU_YOUTUBE },
            { label: "Tilda help", url: TILDA_RU },
          ],
        },
        {
          text: "Since July 2025, databases abroad may not be used to store and process the personal data of Russian citizens when collecting it, and the old practice of \"store a copy in Russia first, then transfer it abroad\" may no longer be accepted. For the fines, see the guide on pages and filings before launch.",
          sources: [{ label: "B1 law firm (2025-03-06)", url: RU_LOCALISATION }],
        },
      ],
    },
    {
      id: "cn",
      title: "Mainland China: default domains are blocked, and most Google resources do not load",
      items: [
        {
          text: "On 17 September 2026 we used Globalping to measure connection times to port 443 from 8 probes in mainland China, Cloudflare's Free plan against GitHub Pages: medians of 1,054 ms against 167 ms on China Unicom, 348 against 103 on China Mobile, and 274 against 930 on China Telecom (on China Telecom, Cloudflare was actually faster). The sample is small, and only the connection handshake was measured.",
          sources: [{ label: "Globalping (our measurement)", url: GLOBALPING }],
        },
        {
          text: "vercel.app is blocked in mainland China, and none of the URLs GreatFire tested would open; Vercel itself says it has no servers or edge locations in mainland China and suggests using your own domain, without guaranteeing it will work. Many URLs on netlify.app, pages.dev and github.io are also blocked or interfered with.",
          sources: [
            { label: "GreatFire: vercel.app", url: GF_VERCEL },
            { label: "Vercel knowledge base (2026-09-11)", url: VERCEL_CN },
            { label: "GreatFire: netlify.app", url: GF_NETLIFY },
            { label: "GreatFire: pages.dev", url: GF_PAGES },
            { label: "GreatFire: github.io", url: GF_GITHUB },
          ],
        },
        {
          text: "www.google.com is blocked, so the default reCAPTCHA does not load; for this case Google says to use www.recaptcha.net instead. The GA script loads, but GA4's data collection endpoint is blocked, so GA shows less traffic from mainland China than there really is. Google Fonts can be reached; YouTube is blocked.",
          sources: [
            { label: "GreatFire: google.com", url: GF_GOOGLE },
            { label: "reCAPTCHA FAQ", url: RECAPTCHA_FAQ },
            { label: "GreatFire: googletagmanager.com", url: GF_GTM },
            { label: "GreatFire: GA4 collection endpoint", url: GF_GA4 },
            { label: "GreatFire: Google Fonts", url: GF_FONTS },
            { label: "GreatFire: YouTube", url: GF_YOUTUBE },
          ],
        },
        {
          text: "jsDelivr lost its mainland ICP filing in December 2021 and has since been served from locations \"near China\"; it can be reached now. Stripe's js.stripe.com can be reached. Cloudflare states officially that its Turnstile CAPTCHA does not support mainland China.",
          sources: [
            { label: "jsDelivr (2021-12-20)", url: JSDELIVR_ICP },
            { label: "GreatFire: jsDelivr", url: GF_JSDELIVR },
            { label: "GreatFire: Stripe", url: GF_STRIPE },
            { label: "Cloudflare China Network FAQ", url: CF_CHINA_FAQ },
          ],
        },
        {
          text: "Cloudflare's China Network is a separate subscription for Enterprise customers only; its locations are run by JD Cloud, and every domain needs an ICP filing or licence. A server in mainland China needs an ICP filing first; see the guide on choosing a domain.",
          sources: [{ label: "Cloudflare China Network", url: CF_CHINA }],
        },
        {
          text: "Putting Vercel functions in the Hong Kong region (hkg1) to be close to the mainland: since July 2024 OpenAI has blocked API requests from unsupported regions, and Vercel warned at the time that functions in the Hong Kong region would be affected.",
          sources: [{ label: "Vercel changelog (2024-06-27)", url: VERCEL_HKG_OPENAI }],
        },
        {
          text: "Under the Personal Information Protection Law, the only ones required to store personal information in China are operators of critical information infrastructure and handlers whose processing volume reaches the amount set by the Cyberspace Administration of China (Article 40); the law also applies to services provided from abroad to individuals in China.",
          sources: [{ label: "Personal Information Protection Law", url: CN_PIPL }],
        },
      ],
    },
    {
      id: "eu-uk",
      title: "EU and UK: access is fine, but keeping data in the US needs a transfer mechanism",
      items: [
        {
          text: "The exception is Spain: during LaLiga matches ISPs block pirate streams by IP, and the blocks also hit shared IPs at Cloudflare and others. Of the 9.2 million domains OONI tested from January to June 2026, 554,000 were blocked at some point, 90% of them on Cloudflare; blocking starts before kick-off and is lifted after the final whistle.",
          sources: [{ label: "OONI (2026-06-30)", url: OONI_LALIGA }],
        },
        {
          text: "The EU-US Data Privacy Framework (DPF) is still valid: on 3 September 2025 the EU General Court dismissed the action seeking its annulment, and the applicant appealed in October. Since October 2023 the UK's \"data bridge\" has allowed data to be sent to US organisations that have joined the UK Extension to the DPF.",
          sources: [
            { label: "EU Court of Justice press release (2025-09-03)", url: EU_LATOMBE },
            { label: "Appeal record (2025-10-31)", url: EU_LATOMBE_APPEAL },
            { label: "UK government (2023-09-21)", url: UK_DATA_BRIDGE },
          ],
        },
        {
          text: "A Chinese seller with no EU company: users handing you their data themselves is not a \"transfer\"; but you are subject to the GDPR, and putting that data on a US cloud does count as a transfer, which has to rely on the provider's DPF certification or standard contractual clauses.",
          sources: [{ label: "EDPB Guidelines 05/2021", url: EDPB_TRANSFER }],
        },
        {
          text: "A Munich court ruled in 2022 that a website that loaded Google Fonts dynamically without consent and passed visitors' IP addresses to Google acted unlawfully, and awarded €100 in damages. For a site aimed at Europe, hosting the fonts on your own server is safer.",
          sources: [{ label: "Munich Regional Court I (2022-01-20)", url: MUNICH_FONTS }],
        },
        {
          text: "Cloudflare has locations in 57 European cities; Vercel has 5 regions (Stockholm, Paris, Dublin, Frankfurt and London); CloudFront's cheapest price class already includes Europe.",
          sources: [
            { label: "Cloudflare network", url: CF_NETWORK },
            { label: "Vercel regions", url: VERCEL_REGIONS },
            { label: "CloudFront pricing", url: CLOUDFRONT_PRICE },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Using a platform's default domain for mainland China: vercel.app is blocked outright, and many netlify.app, pages.dev and github.io URLs suffer interference too; your own domain only gets blocked less, and Vercel says plainly that it makes no guarantee.",
      sources: [
        { label: "GreatFire: vercel.app", url: GF_VERCEL },
        { label: "Vercel knowledge base", url: VERCEL_CN },
      ],
    },
    {
      text: "Reading GA and concluding there is \"no traffic from China\": the script loads, but the collection endpoint is blocked and the data is quietly lost. Do not use the default reCAPTCHA or Turnstile on sign-up forms aimed at mainland China.",
      sources: [
        { label: "GreatFire: GA4 collection endpoint", url: GF_GA4 },
        { label: "reCAPTCHA FAQ", url: RECAPTCHA_FAQ },
      ],
    },
    {
      text: "Assuming Cloudflare is fast everywhere: Russia throttles it across the board to 16KB, Spain's IP blocks during football matches take down everyone on the same IP, and the Free plan is the first to be moved when capacity is tight. A site with many Russian- or Spanish-speaking users should have a backup entry point that does not go through Cloudflare.",
      sources: [
        { label: "Cloudflare blog", url: CF_RUSSIA },
        { label: "OONI", url: OONI_LALIGA },
      ],
    },
    {
      text: "Leaving functions in the default region: Vercel and Netlify both default to the eastern US; static pages served from the edge are fine, but server-side rendering and API calls cross the Pacific every time.",
      sources: [
        { label: "Vercel function regions", url: VERCEL_FN_REGION },
        { label: "Netlify function configuration", url: NETLIFY_FN },
      ],
    },
    {
      text: "Choosing CloudFront's cheapest tier, Price Class 100: users in Japan, Korea and Southeast Asia all get content from edge locations in Europe and North America.",
      sources: [{ label: "CloudFront pricing", url: CLOUDFRONT_PRICE }],
    },
    {
      text: "Having many users in Vietnam but serving them only from locations abroad: cable faults are routine, so use a CDN with locations in Vietnam (Cloudflare has 3 cities there).",
      sources: [{ label: "W.Media (2026-09-03)", url: VN_CABLES_WMEDIA }],
    },
  ],
  unknowns: [
    "Whether Cloudflare's Free and Pro plans are routed to locations outside Korea for visitors in Korea: there is no official statement, and we found no recent public measurement.",
    "The state of Russia's 16KB throttling in 2026, and whether CloudFront and Fastly are restricted the same way in Russia.",
    "Public latency data from each market to origin servers in the US and Singapore; we found no public measurement behind the idea that \"servers in Hong Kong or Singapore are the compromise for mainland China\".",
    "Progress in 2026 on the appeal over the EU-US Data Privacy Framework (C-703/25 P).",
    "The completion date of repairs to the cables that failed in Vietnam in August 2026.",
    "Whether Indonesia's Komdigi actually enforces against small foreign SaaS; whether Vietnam's transfer impact assessment is actually enforced on small foreign sellers with no Vietnamese entity.",
    "The original text of the US Department of Justice rule's bulk thresholds for each data category.",
  ],
  related: [
    { label: "Pages and filings before launch (data localisation and registration)", path: "/compliance" },
    { label: "Choosing a domain (ICP filing)", path: "/domains" },
    { label: "Webmaster consoles and getting indexed", path: "/indexing" },
  ],
};
