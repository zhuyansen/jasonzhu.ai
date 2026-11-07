// English version of ../domains.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Choosing a domain for an overseas site, market by market: only what search engines, registries and governments say,
// plus the public Spamhaus and Interisle reports. Prices are approximate, from registrar pages in November 2026.
const GOOGLE_INTL = "https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites";
const GOOGLE_NEW_TLD = "https://developers.google.com/search/blog/2015/07/googles-handling-of-new-top-level";
const SPAMHAUS = "https://www.spamhaus.org/resource-hub/domain-reputation/domain-reputation-update-april-september-2026/";
const INTERISLE = "https://interisle.net/insights/cybercrimesupplychain2026";
const JPRS_SPEC = "https://jprs.jp/about/jp-dom/spec/";
const JPRS_RULE = "https://jprs.jp/doc/rule/rule-wideusejp.html";
const KISA_RULE = "https://xn--3e0bx5euxnjje69i70af08bea817g.xn--3e0b707e/jsp/infoboard/law/domManRule.jsp";
const CNNIC_RULE = "https://www.cnnic.cn/n4/2022/0817/c93-335.html";
const PANDI_V9 = "https://pandi.id/public/files/2024/10/kebijakan-pendaftaran-nama-domain-versi-9-0-bilingual-new-1729151599.pdf";
const VNNIC_GUIDE = "https://vnnic.vn/vi/ten-mien-vn/danh-cho-chu-the/dang-ky-ten-mien/huong-dan-dang-ky-ten-mien";
const RU_LAW = "http://kremlin.ru/acts/bank/52785";
const RU_FAQ = "https://cctld.ru/help/faq/";
const YANDEX_REGION = "https://yandex.com/support/webmaster/en/site-geography/site-region.html";
const EURID = "https://eurid.eu/en/news/what-to-know-before-registering-a-eu-domain-name/";
const AFNIC = "https://www.afnic.fr/wp-media/uploads/2026/07/afnic-naming-policy-2026-07-06.pdf";
const DENIC_TERMS = "https://www.denic.de/en/domain-terms-and-conditions/";
const US_NEXUS = "https://www.about.us/documents/policies/usTLD_Nexus_Requirements_Policy.pdf";
const SEZNAM = "https://o-seznam.cz/napoveda/vyhledavani/optimalizace/";

export const DOMAINS_EN: Guide = {
  slug: "domains",
  short: "Choosing a domain",
  title: "Choosing a domain for an overseas site: .com or a country ending, and who may register in each market",
  description:
    "Domain choices market by market: how Google treats country endings and the country endings it reads as generic (.ai, .io), who may register in the US, Indonesia, Vietnam, Japan, South Korea, Russia, China, Europe and the UK, what each asks for and roughly costs, and what cheap new endings do to indexing and email.",
  intro:
    "Decide which country you sell to before you pick the domain. One .com with subfolders covers most markets. A country ending is a strong local signal, but Japan and South Korea want a local address, Russia has required identity checks through its government portal since September 2026, and .eu and .fr are for European parties only. Below is what search engines and each registry say, market by market.",
  checked: "2026-11-07",
  sections: [
    {
      id: "structure",
      title: "First the structure: one ending per country, or one .com for the world",
      lead: "Google lists four URL structures, each with trade-offs.",
      items: [
        {
          text: "A country ending (example.de) is a strong country signal and the server can be anywhere. It is also expensive, the name you want may be taken, each country needs its own setup, some countries limit who may register, and one domain can target only one country.",
          sources: [{ label: "Google multi-regional sites", url: GOOGLE_INTL }],
        },
        {
          text: "A subdomain (de.example.com) is easy to set up, but users can't tell whether de means a language or a country. A subfolder (example.com/de/) is the easiest to run on one host, but the URL doesn't show the region. URL parameters (?loc=de) are explicitly not recommended by Google.",
          sources: [{ label: "Google multi-regional sites", url: GOOGLE_INTL }],
        },
        {
          text: "Whichever you choose, mark each language and country version with hreflang. Search Console's International Targeting report was retired in September 2022, so you can no longer assign a country to a .com by hand.",
          sources: [
            { label: "Google multi-regional sites", url: GOOGLE_INTL },
            { label: "International Targeting retired", url: "https://support.google.com/webmasters/answer/12474899" },
          ],
        },
        {
          text: "Google treats the server's country only as a hint and ignores geo tags such as geo.position. Its crawlers mostly fetch from the US, so don't redirect visitors to another language version by IP.",
          sources: [{ label: "Google multi-regional sites", url: GOOGLE_INTL }],
        },
        {
          text: "From the community: the ending is close to neutral for rankings and mostly affects trust and click habits; country endings get a boost in local results.",
          sources: [{ label: "Niko's post (2025-10-03)", url: "https://x.com/guishou_56/status/1973971390220153221" }],
        },
      ],
    },
    {
      id: "generic-cctld",
      title: "Country endings that work as generic ones: .ai, .io, .co, .me, .tv",
      lead: "Google gives these no country targeting, so they work like a .com. Each still belongs to a country or territory, with its own risks.",
      items: [
        {
          text: "Country endings Google treats as generic: .ad .ai .as .bz .cc .cd .co .dj .fm .io .la .me .ms .nu .sc .sr .su .tv .tk .ws (the list can change). A .ai or .io domain won't make you rank only in Anguilla or the British Indian Ocean Territory.",
          sources: [{ label: "Google multi-regional sites", url: GOOGLE_INTL }],
        },
        {
          text: "Google also treats .eu, .asia, new endings such as .app, .dev, .shop, .top and .xyz, and city endings such as .london and .berlin as generic. A keyword in the ending neither helps nor hurts.",
          sources: [
            { label: "Google multi-regional sites", url: GOOGLE_INTL },
            { label: "Google on new endings (2015)", url: GOOGLE_NEW_TLD },
          ],
        },
        {
          text: ".app and .dev are on the browsers' HSTS preload list, so the site must use HTTPS.",
          sources: [
            { label: ".app", url: "https://get.app/" },
            { label: ".dev", url: "https://get.dev/" },
          ],
        },
        {
          text: ".io: the UK and Mauritius signed the Chagos sovereignty treaty on 2025-05-22, and it had still not taken effect by October 2026. ICANN says that if the IO country code is ever removed, .io gets a five-year transition that can be extended in some cases; the registry has said it will keep supporting .io.",
          sources: [
            { label: "UK Parliament bill", url: "https://bills.parliament.uk/bills/4004" },
            { label: "Al Jazeera (2026-10-02)", url: "https://www.aljazeera.com/news/2026/10/2/uk-mauritius-chagos-sovereignty-deal-stalls-amid-fears-of-further-delays" },
            { label: "ICANN", url: "https://www.icann.org/en/blogs/details/the-chagos-archipelago-and-the-io-domain-14-11-2024-en" },
            { label: "The Register", url: "https://www.theregister.com/2024/10/10/io_domain_uk_mauritius/" },
          ],
        },
        {
          text: ".ai: run by the Government of Anguilla, whose official FAQ says it may suspend, cancel or transfer a domain, for example in cases of abuse. Registration and renewal are for at least two years; Porkbun lists $82.70 a year.",
          sources: [
            { label: ".ai FAQ", url: "https://www.nic.ai/faq" },
            { label: "Porkbun price", url: "https://porkbun.com/tld/ai" },
          ],
        },
        {
          text: ".co: run by Colombia and open to anyone. In Spamhaus's April–September 2026 ranking of abused country endings it is sixth, up 221% on the previous period.",
          sources: [
            { label: "IANA", url: "https://www.iana.org/domains/root/db/co.html" },
            { label: "Spamhaus", url: SPAMHAUS },
          ],
        },
      ],
    },
    {
      id: "cheap-tlds",
      title: "Cheap new endings: no ranking penalty, but indexing, email and links suffer",
      lead: "Google's documentation names no ending that ranks worse, but Google's John Mueller has repeatedly warned against endings overrun by spam.",
      items: [
        {
          text: "Spamhaus, April–September 2026, by number of domains listed as malicious or suspicious: .com first (724,000), .top second (628,000, up 132%), .cn third (465,000), .shop seventh, .xyz eighth, .icu ninth. As a share of each ending, 9.03% of .icu and 4.99% of .top are listed; Spamhaus treats anything above 5% as a warning sign.",
          sources: [{ label: "Spamhaus", url: SPAMHAUS }],
        },
        {
          text: "Interisle's 2026 report: .top is second for criminal domains (3.6 million) and .cn third. New gTLDs are 15% of all registrations but 43% of criminal domains.",
          sources: [{ label: "Interisle", url: INTERISLE }],
        },
        {
          text: "Mueller said in September 2025 that he avoids free, cheap endings with poor abuse handling: such domains may be crawled and indexed more slowly, have email trouble, and get links from the whole ending rejected in bulk.",
          sources: [
            { label: "Domain Name Wire (2025-09-08)", url: "https://domainnamewire.com/2025/09/08/google-reiterates-spammy-top-level-domain-advice/" },
            { label: "Search Engine Roundtable (2023)", url: "https://www.seroundtable.com/google-seo-cheap-tlds-spam-35498.html" },
          ],
        },
        {
          text: "Email: the widely used SpamAssassin rules add points to sender addresses on .top, .xyz, .icu, .online and similar endings, and 2 more points for links to them in the body. A Microsoft 365 admin can block mail from a whole ending with one rule.",
          sources: [
            { label: "SpamAssassin rules", url: "https://github.com/apache/spamassassin/blob/trunk/rulesrc/sandbox/pds/20_ntld.cf" },
            { label: "Microsoft 365", url: "https://learn.microsoft.com/en-us/defender-office-365/tenant-allow-block-list-email-spoof-configure" },
          ],
        },
      ],
    },
    {
      id: "us",
      title: "United States: .com first",
      lead: ".com has no eligibility rules. .us needs a tie to the US and can't hide the registrant.",
      items: [
        {
          text: "Anyone, person or company, can register .com and .net. The .com wholesale price rose from $10.26 to $10.97 on 2026-11-01; under the agreement renewed in 2024, it may rise up to 7% in four of the following six years.",
          sources: [
            { label: "Verisign", url: "https://www.verisign.com/resources/become-a-registrar/" },
            { label: "Verisign earnings release", url: "https://www.sec.gov/Archives/edgar/data/0001014473/000101447326000019/q12026earningsrelease.htm" },
            { label: "NTIA", url: "https://www.ntia.gov/blog/2024/com-cooperative-agreement-ensuring-internet-stability-and-security" },
          ],
        },
        {
          text: ".us requires one of three ties: a US citizen or a person whose main home is in the US, an entity formed in the US, or a foreign entity with a real presence in the US. Registrations that fail are frozen for 30 days, then cancelled without refund if not fixed.",
          sources: [{ label: ".us nexus policy", url: US_NEXUS }],
        },
        {
          text: "A US company formed by a foreigner (a single-member LLC, say) falls under the second category by the policy's wording, which sets no rule on the owners' nationality. The registry has not ruled on this case specifically.",
          sources: [{ label: ".us nexus policy", url: US_NEXUS }],
        },
        {
          text: ".us forbids privacy and proxy registration, so anyone can look up the registrant's name and address.",
          sources: [{ label: ".us privacy policy", url: "https://about.us/policies/us-privacy-services-policy" }],
        },
      ],
    },
    {
      id: "id-vn",
      title: "Indonesia and Vietnam: a .com is enough, and the local endings are open to you",
      lead: "Google has more than 90% of searches in both. Foreigners can register .id and .vn, but not .co.id.",
      items: [
        {
          text: ".id: the September 2024 rules of PANDI, Indonesia's registry, open it to individuals, foreigners and legal entities, and accept a passport from any country as ID. Every domain needs a verified email.",
          sources: [{ label: "PANDI policy v9.0", url: PANDI_V9 }],
        },
        {
          text: ".co.id is only for entities operating in Indonesia and needs an Indonesian business number (NIB). Some registrars offer a trustee, but a PANDI proposal from May 2025 would give foreign entities six months to comply or lose renewals.",
          sources: [
            { label: "PANDI policy v9.0", url: PANDI_V9 },
            { label: "PANDI 2025 proposal", url: "https://pandi.id/public/files/2025/5/rumusan-usulan-pengembangan-kebijakan-layanan-proxy-nama-domain-hasil-rapat-pleno-fms-1746966280.pdf" },
            { label: "Gandi", url: "https://www.gandi.net/en/tlds/id" },
          ],
        },
        {
          text: "Indonesian prices for reference: Rumahweb charges Rp219,000 a year for .id and Rp300,000 for .co.id.",
          sources: [{ label: "Rumahweb", url: "https://www.rumahweb.com/domain-murah/" }],
        },
        {
          text: ".vn: individuals and organisations inside or outside Vietnam can register; those with an address abroad can use a foreign registrar. Decree 147, in force since 2024-12-25, asks for an ID card or passport number; a domain whose details are wrong or whose holder can't be identified is suspended, and can be withdrawn if not fixed within 30 days.",
          sources: [
            { label: "VNNIC", url: VNNIC_GUIDE },
            { label: "Decree 147", url: "https://www.vnnic.vn/index.php/vi/van-ban-so-lieu/van-ban-qppl/nghi-dinh-so-1472024nd-cp-ngay-09112024-ve-quan-ly-cung-cap-su-dung" },
            { label: "Suspension rules", url: "https://tapchicongthuong.vn/4-truong-hop-tam-ngung-hoat-dong-cua-ten-mien---vn--tu-ngay-25-12-2024-129687.htm" },
          ],
        },
        {
          text: "Official .vn fees: a 100,000₫ registration fee in the first year plus 350,000₫ a year. Foreign registrars cost far more: 101domain charges about $169 for the first year and asks for ID documents again at renewal.",
          sources: [
            { label: "Fee schedule", url: "https://luatvietan.vn/quy-dinh-ve-phi-le-phi-su-dung-ten-mien-theo-thong-tu-10-2025-tt-btc.html" },
            { label: "101domain", url: "https://www.101domain.com/vn.htm" },
          ],
        },
        {
          text: "Cốc Cốc, Vietnam's local search engine, crawls Vietnamese-language sites and .vn domains first. It has no webmaster console, only a form to submit URLs.",
          sources: [{ label: "Cốc Cốc", url: "https://coccoc.com/search/console/get-your-website-on-coc-coc-search" }],
        },
      ],
    },
    {
      id: "japan",
      title: "Japan: .jp needs a Japanese address; without one, use .com",
      items: [
        {
          text: "The rules of JPRS, Japan's registry, require the registrant itself to have an address or place of business in Japan. JPRS may ask for registration certificates; if eligibility can't be confirmed and its letters come back undelivered, the registration ends.",
          sources: [
            { label: "JPRS rules", url: JPRS_RULE },
            { label: "JPRS overview", url: JPRS_SPEC },
          ],
        },
        {
          text: ".co.jp is only for companies registered in Japan (including foreign companies registered there), normally one per company.",
          sources: [{ label: "JPRS overview", url: JPRS_SPEC }],
        },
        {
          text: "Some registrars offer a trustee, but neither JPRS's rules nor its FAQ mention one. 101domain's .co.jp trustee can't manage DNS and only forwards to a URL, so you can't build a site on it.",
          sources: [
            { label: "JPRS rules", url: JPRS_RULE },
            { label: "101domain", url: "https://www.101domain.com/co_jp.htm" },
          ],
        },
        {
          text: "Japanese prices for reference: Muumuu Domain charges ¥990 for the first year of a .jp and ¥3,344 to renew.",
          sources: [{ label: "Muumuu Domain", url: "https://muumuu-domain.com/domain/price" }],
        },
        {
          text: "Yahoo! JAPAN announced in 2010 that its results would come from Google. Many desktop users in Japan search with Bing; see the search engine guide.",
          sources: [{ label: "2010 report", url: "https://internet.watch.impress.co.jp/docs/news/383638.html" }],
        },
      ],
    },
    {
      id: "korea",
      title: "South Korea: .kr needs a Korean address",
      items: [
        {
          text: "The rules of KISA, Korea's internet agency, require both the applicant and the registrant to have an address in Korea. .co.kr is open to companies and individuals.",
          sources: [{ label: "KISA rules", url: KISA_RULE }],
        },
        {
          text: "Registrants abroad can only go through a registrar's trustee: GoDaddy offers one at no extra cost, and 101domain and others do too. KISA's rules don't mention trustees.",
          sources: [{ label: "GoDaddy", url: "https://www.godaddy.com/en/help/about-kr-domains-19996" }],
        },
        {
          text: "ai.kr, io.kr, it.kr and me.kr, open since March 2025, are also only for people with a Korean address, at about ₩20,000 a year.",
          sources: [{ label: "KISA", url: "https://www.kisa.or.kr/402/form?postSeq=2468&page=1" }],
        },
        {
          text: "Naver recommends endings users know, giving .com, .net, .co.kr, .kr and .io as examples, and your own domain rather than a subdomain from your host.",
          sources: [{ label: "Naver Search Advisor", url: "https://searchadvisor.naver.com/guide/seo-advanced-url" }],
        },
        {
          text: "Korean prices for reference: 101domain charges $52.49 for the first year of a .kr and $47.49 for a .co.kr.",
          sources: [{ label: "101domain", url: "https://www.101domain.com/co_kr.htm" }],
        },
      ],
    },
    {
      id: "russia",
      title: "Russia: since September 2026, .ru needs identity checks through a Russian government account",
      lead: "A foreigner without Russian residency or a Russian entity can now hardly register or renew a .ru. For Russian users, a .com with Yandex's region setting is the practical route.",
      items: [
        {
          text: "Federal Law 569-FZ: from 2026-09-01, registering .ru, .рф or .su requires identification through Russia's government services portal (Gosuslugi), and only Russian legal entities on an official list may act as registrars.",
          sources: [
            { label: "Law text", url: RU_LAW },
            { label: "Registry notice", url: "https://cctld.ru/media/news/kc/40971/" },
          ],
        },
        {
          text: "A foreign individual needs a Russian residence or work permit and a confirmed government account; a foreign company needs a branch or representative office in Russia. Without these, the registry's options are to hand the domain to a person or organisation in Russia, or to use another ending.",
          sources: [{ label: "Registry FAQ", url: RU_FAQ }],
        },
        {
          text: "Existing domains: since September, renewing or changing registrar requires identification first. Without it a domain works until the end of its current term, then stops resolving and is deleted after the grace period. The transition for unidentified holders runs at most until 2027-01-18.",
          sources: [
            { label: "Registry FAQ", url: RU_FAQ },
            { label: "Tproger (2026-09-01)", url: "https://tproger.ru/news/vstupil-v-silu-zakon-ob-identifikacii-vladelcev-domenov-ru-r" },
          ],
        },
        {
          text: "Reg.ru and RU-CENTER now offer trustee holding for non-residents, with a Russian company as the nominal holder; reported prices are 10,500 rubles for the first year and 14,500 rubles a year to renew.",
          sources: [
            { label: "ComNews", url: "https://www.comnews.ru/content/247495/2026-09-22/2026-w39/1010/zona-rf-vyshla-lidery-tempam-identifikacii-administratorov-cherez-gosuslugi" },
            { label: "Name.am", url: "https://name.am/articles/ru-domains-discontinued" },
          ],
        },
        {
          text: "In December 2025 a registrar took moscowtimes.ru and other domains offline at the request of Russia's communications regulator, without a court order.",
          sources: [{ label: "The Moscow Times", url: "https://www.themoscowtimes.com/2025/12/17/roskomnadzor-seizes-domains-including-moscowtimesru-without-court-order-a91464" }],
        },
        {
          text: "Yandex doesn't assign a region to a .com site on its own: set Russia or a city in Yandex Webmaster (with a link to your contact page; manual review takes days to weeks), or use Yandex Business. Yandex supports hreflang.",
          sources: [
            { label: "Yandex site region", url: YANDEX_REGION },
            { label: "Yandex hreflang", url: "https://yandex.com/support/webmaster/en/yandex-indexing/locale-pages.md" },
          ],
        },
      ],
    },
    {
      id: "china",
      title: "China: foreigners can register .cn; hosting in mainland China needs an ICP filing first",
      items: [
        {
          text: "CNNIC's rules let individuals, companies and other organisations register .cn, with no requirement to be in China. Every .cn needs real-name verification; foreign organisations submit their home-country business registration.",
          sources: [
            { label: "CNNIC rules", url: CNNIC_RULE },
            { label: "Alibaba Cloud verification", url: "https://www.alibabacloud.com/help/en/dws/user-guide/real-name-verification-for-cn-domain-names" },
          ],
        },
        {
          text: "Since 2022 an unverified .cn can't be registered, renewed or transferred, and may have its DNS suspended.",
          sources: [
            { label: "Gandi notice", url: "https://news.gandi.net/?p=98120" },
            { label: "Alibaba Cloud", url: "https://help.aliyun.com/knowledge_detail/35810.html" },
          ],
        },
        {
          text: "A site on a server in mainland China needs an ICP filing before it may operate, and a company filing needs an entity registered in mainland China. The filing is needed only when the domain points to a mainland server.",
          sources: [
            { label: "MIIT rules", url: "https://www.miit.gov.cn/gyhxxhb/jgsj/cyzcyfgs/bmgz/xxtxl/art/2024/art_84a0cfa0ebd049bbbe751dca9a008e56.html" },
            { label: "Alibaba Cloud ICP", url: "https://www.alibabacloud.com/en/icp" },
          ],
        },
        {
          text: "Baidu's official word from 2017: Chinese-language sites should not use servers abroad, and such sites have display problems in Baidu's results. We found nothing newer.",
          sources: [
            { label: "Baidu notice", url: "https://ziyuan.baidu.com/wiki/1586" },
            { label: "Baidu guidance", url: "https://ziyuan.baidu.com/college/articleinfo?id=1585" },
          ],
        },
      ],
    },
    {
      id: "europe",
      title: "Europe and the UK: .eu and .fr are for European parties; anyone can register .uk and .de",
      items: [
        {
          text: ".eu is for citizens of the EU, Iceland, Liechtenstein and Norway wherever they live, residents of those countries, and organisations established there. Since Brexit a UK company needs an EU or EEA entity to qualify; about 48,000 .eu domains of UK registrants were withdrawn in 2022.",
          sources: [
            { label: "EURid", url: EURID },
            { label: "EURid Brexit notice", url: "https://eurid.eu/en/news/the-brexit-related-domain-names-are-released-today/" },
          ],
        },
        {
          text: ".fr requires living in the EU, Iceland, Liechtenstein, Norway or Switzerland, or, for organisations, being registered or mainly operating there.",
          sources: [{ label: "AFNIC naming policy", url: AFNIC }],
        },
        {
          text: "Anyone can register .uk and .co.uk, with no UK address required. The registry, Nominet, checks names and addresses against third-party data and may suspend a domain it can't verify.",
          sources: [
            { label: "Nominet rules", url: "https://media.nominet.uk/wp-content/uploads/2018/05/22141819/dotUK-Rules-of-Registration.pdf" },
            { label: "Nominet data checks", url: "https://registrars.nominet.uk/uk-namespace/data-quality-policy/how-does-nominet-validate-data/" },
          ],
        },
        {
          text: ".de needs no German address to register. A holder living outside Germany must, once the registry DENIC asks, name an authorised recipient in Germany within two weeks, or the contract may be terminated.",
          sources: [{ label: "DENIC terms", url: DENIC_TERMS }],
        },
        {
          text: "Anyone can register .cz. Holders outside the EU must give a contact address in the EU when asked, and the holder's phone number is becoming mandatory during 2026. Czech search engine Seznam treats all endings alike; for Czech users .cz is the likely pick.",
          sources: [
            { label: "CZ.NIC contact checks", url: "https://fred.nic.cz/documentation/html/Features/General/ContactVerification.html" },
            { label: "Lupa.cz", url: "https://www.lupa.cz/aktuality/pri-registraci-domeny-s-koncovkou-cz-bude-nyni-nutne-uvest-telefonni-cislo/" },
            { label: "Seznam", url: SEZNAM },
          ],
        },
        {
          text: "Public registration data: since 2025-12-06 .de shows the name, address, email and phone of holders that are organisations, not of individuals. .eu, .uk and .fr hide individual registrants by default.",
          sources: [
            { label: "DENIC", url: "https://blog.denic.de/en/new-legislation-what-is-changing-for-users-of-denics-whois-lookup/" },
            { label: "EURid", url: "https://eurid.eu/en/gdpr/" },
            { label: "Nominet", url: "https://registrars.nominet.uk/uk-namespace/registration-and-domain-management/query-tools/whois/whois-basic-instructions/" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Expecting .ai, .io or .co to help you rank in one country: Google treats them as generic.",
      sources: [{ label: "Google multi-regional sites", url: GOOGLE_INTL }],
    },
    {
      text: "Putting the main site on a cheap ending such as .top or .xyz and sending email from the same domain: spam rules add points for both the sender address and the links in the body.",
      sources: [{ label: "SpamAssassin rules", url: "https://github.com/apache/spamassassin/blob/trunk/rulesrc/sandbox/pds/20_ntld.cf" }],
    },
    {
      text: "Registering .us and expecting the details to stay private: .us forbids privacy services.",
      sources: [{ label: ".us privacy policy", url: "https://about.us/policies/us-privacy-services-policy" }],
    },
    {
      text: "Registering .eu or .fr with a UK company: it doesn't qualify and the domain gets suspended and withdrawn.",
      sources: [
        { label: "EURid", url: EURID },
        { label: "AFNIC", url: AFNIC },
      ],
    },
    {
      text: "Holding a Japanese or Korean domain through a registrar's trustee: the registrar is the registrant on paper, which the registries' rules don't provide for, and a .co.jp trustee can't even manage DNS.",
      sources: [{ label: "101domain .co.jp", url: "https://www.101domain.com/co_jp.htm" }],
    },
    {
      text: "Forgetting that renewing a .ru after September 2026 needs identification: the domain stops resolving at expiry and can be taken by someone else after the grace period.",
      sources: [{ label: "Registry FAQ", url: RU_FAQ }],
    },
    {
      text: "Redirecting visitors to a language version by IP: Google's crawlers mostly fetch from the US, so other versions may never be indexed.",
      sources: [{ label: "Google multi-regional sites", url: GOOGLE_INTL }],
    },
  ],
  unknowns: [
    "Whether Yandex assigns .ru and .рф sites to Russia automatically; its help pages don't say.",
    "Whether Bing Webmaster Tools still has a country setting in 2026 (we only found the API docs), and Bing's latest word on hreflang (the newest we found is from 2020).",
    "Baidu has said nothing new since 2017 about ICP filing and indexing, or about .cn versus .com.",
    "Whether Naver indexes a .com hosted abroad normally; its guides don't say.",
    "Whether JPRS in Japan and KISA in Korea accept registrar trustees; their rules don't mention them.",
    "Whether Yahoo! JAPAN still uses Google's results; we found only the 2010 announcement.",
    "Whether PANDI's May 2025 trustee proposal in Indonesia has taken effect.",
    "Whether Russia will require identification again every year, and how the rules apply after 2027-01-18.",
    "Whether a US company owned by foreigners can register .us; the registry has not ruled on it.",
  ],
  related: [
    { label: "Which search engine to please first", path: "/search-engines" },
    { label: "Webmaster consoles and getting indexed", path: "/indexing" },
    { label: "Individual or company: opening accounts", path: "/open-account" },
    { label: "A China, UK and US company: who does what", path: "/company-roles" },
  ],
};
