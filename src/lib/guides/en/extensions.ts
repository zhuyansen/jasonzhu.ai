// English version of ../extensions.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Going global without a website: how to publish browser extensions, apps, MCP servers and GPTs. The hands-on part comes from Jason's
// Reply Filter for X (on the Chrome Web Store since 2026-09); each store's rules are in sections, every point with an official source.
export const EXTENSIONS_EN: Guide = {
  slug: "extensions",
  short: "Extensions and app stores",
  title: "Selling extensions and apps worldwide: lessons from building a Chrome extension, and how to publish on each app store",
  description:
    "You don't need a website to sell overseas. The mistakes I made taking a Chrome extension from code to the store, plus the publishing rules for the Chrome Web Store, Edge, Firefox, the App Store, Google Play, MCP directories and the GPT Store, based on official pages.",
  intro:
    "Your product doesn't have to be a website. Browser extensions, mobile apps, MCP servers and GPTs each have their own stores, and the rules differ. First my experience building an extension, then each store's official rules.",
  checked: "2026-10-17",
  mine: {
    title: "What I learned building Reply Filter for X",
    lead: "Reply Filter for X is an extension I published on the Chrome Web Store in September 2026. It collapses low-quality replies on X, and the code is open source.",
    points: [
      "Never put your model API key in the extension, since anyone can unpack extension code. I use a Cloudflare Worker as a relay: the key lives only in the Worker, and the extension only calls the Worker.",
      "Filtering with local rules first and only sending the unclear cases to the model cuts costs a lot. On top of that I set a free daily quota per IP and a global daily spending cap. Users can also enter their own key on the settings page and connect directly.",
      "Cloudflare KV's free tier only allows 1,000 writes a day, and the counters hit that fast. After moving the counters to Durable Objects, that limit went away.",
      "What burns quota is the number of requests, not the number of replies: the client sends a batch once it has 20 replies or after 1.5 seconds of idle time.",
      "In a Manifest V3 background script, multiple files share one global scope. Wrap shared code in functions, or duplicate variable names will throw errors right away.",
      "After the extension updates, pages that are already open keep running the old script, and any chrome.* call throws \"Extension context invalidated\". Detect this, quietly disable the old script, and ask the user to refresh the page.",
      "Fewer permissions means a smoother review: this extension only requests storage and two domains.",
      "The store requires your privacy policy link to stay reachable. Once a code change accidentally deleted our privacy page and the link returned a 500, so now I test it before every release.",
      "You don't have to open the dashboard for every release: the Chrome Web Store has an official publish API. After authorizing once with OAuth, scripts can handle both upload and publish. Keeping the Google Cloud consent screen in testing mode and adding yourself as a test user is enough. Note that the old V1 API is only supported until October 15, 2026, so switch to V2.",
    ],
    links: [
      { label: "Chrome Web Store listing", url: "https://chromewebstore.google.com/detail/reply-filter-for-x/ncffadgnbgcfadoaiaglgkbacjepccff" },
      { label: "Source code on GitHub", url: "https://github.com/zhuyansen/x-reply-filter" },
    ],
  },
  sections: [
    {
      id: "chrome",
      title: "Chrome Web Store",
      items: [
        {
          text: "Registration costs a one-time fee, which the official blog puts at $5. China is on the list of countries and regions where you can register. Your account email can't be changed after registration.",
          sources: [
            { label: "Registration guide", url: "https://developer.chrome.com/docs/webstore/register" },
            { label: "Chromium Blog, 2020", url: "https://blog.chromium.org/2020/03/new-developer-dashboard-and.html" },
          ],
        },
        {
          text: "Before you publish, your Google account must have 2-Step Verification turned on, and new accounts also need to verify their contact email.",
          sources: [
            { label: "2-Step Verification", url: "https://developer.chrome.com/docs/webstore/program-policies/two-step-verification" },
            { label: "Account setup", url: "https://developer.chrome.com/docs/webstore/set-up-account" },
          ],
        },
        {
          text: "New publishers can publish at most 2 extensions by default. Once you hit the limit, you can request an increase in the dashboard (since August 2026).",
          sources: [{ label: "Chrome for Developers blog", url: "https://developer.chrome.com/blog/cws-review-updates-2026" }],
        },
        {
          text: "Most reviews take a few days but can take weeks, and you can contact support if one has been pending for over 3 weeks. Being a new developer, sensitive permissions, broad host permissions and large code changes all slow review down. Obfuscated code is banned outright.",
          sources: [{ label: "Review process", url: "https://developer.chrome.com/docs/webstore/review-process" }],
        },
        {
          text: "An extension must have a single purpose that's narrow and easy to understand. Request only the narrowest permissions you need, and justify each one in the dashboard's Privacy tab.",
          sources: [
            { label: "Quality guidelines", url: "https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines" },
            { label: "Permissions policy", url: "https://developer.chrome.com/docs/webstore/program-policies/permissions" },
          ],
        },
        {
          text: "If you handle any user data, you must provide a privacy policy link, and the data use disclosures in the dashboard must match the privacy policy.",
          sources: [
            { label: "Privacy policy requirements", url: "https://developer.chrome.com/docs/webstore/program-policies/privacy" },
            { label: "Privacy tab", url: "https://developer.chrome.com/docs/webstore/cws-dashboard-privacy" },
          ],
        },
        {
          text: "The store can't take payments: its payments feature was shut down in February 2021. To charge, you have to integrate payments yourself, verify licenses yourself, state a clear refund policy and make clear that you are the seller. Extensions with purchase features must also provide a physical address.",
          sources: [
            { label: "Payments deprecation (official archive)", url: "https://github.com/GoogleChrome/developer.chrome.com/blob/main/site/en/docs/webstore/cws-payments-deprecation/index.md" },
            { label: "Accepting payment policy", url: "https://developer.chrome.com/docs/webstore/program-policies/accepting-payment" },
          ],
        },
        {
          text: "Every developer has to declare whether they are a \"trader\" under EU rules. If yes, your legal name, phone number and address are shown publicly. If no, EU users see a notice that consumer protection laws don't apply.",
          sources: [{ label: "Trader disclosure", url: "https://developer.chrome.com/docs/webstore/program-policies/trader-disclosure" }],
        },
      ],
    },
    {
      id: "edge-firefox",
      title: "Edge and Firefox",
      items: [
        {
          text: "Registering for Edge is free, with individual and company accounts. Review takes up to 7 business days, and you also have to describe the purpose, permission justifications, remote code and data use.",
          sources: [
            { label: "Register", url: "https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account" },
            { label: "Submit", url: "https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension" },
          ],
        },
        {
          text: "Release versions of Firefox only install extensions signed by Mozilla, and signing usually finishes within 24 hours. AMO hosts extensions for free but has no built-in payments; Mozilla suggests a third-party payment service (such as ExtensionPay) or a donation link.",
          sources: [
            { label: "Signing and distribution", url: "https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/" },
            { label: "Make money from extensions", url: "https://extensionworkshop.com/documentation/publish/make-money-from-browser-extensions/" },
          ],
        },
        {
          text: "AMO bans obfuscated code, and minified or transpiled code requires a separate source code submission. Since November 3, 2025, new extensions must declare in the manifest what data they collect.",
          sources: [
            { label: "Add-on policies", url: "https://extensionworkshop.com/documentation/publish/add-on-policies/" },
            { label: "Data collection consent", url: "https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/" },
          ],
        },
      ],
    },
    {
      id: "app-store",
      title: "Apple App Store",
      items: [
        {
          text: "The Developer Program costs $99 a year. Individual accounts show your legal name on the store. Organization accounts need someone with legal authority to sign contracts, a D-U-N-S number (free to request, up to about 7 business days) and a working website.",
          sources: [
            { label: "Enrollment", url: "https://developer.apple.com/programs/enroll/" },
            { label: "D-U-N-S", url: "https://developer.apple.com/support/D-U-N-S/" },
          ],
        },
        {
          text: "Small Business Program: if your proceeds were no more than $1 million in both the previous and current year, the commission is 15%. Commissions on the mainland China storefront dropped from March 15, 2026: the standard rate went from 30% to 25%, and the Small Business Program rate and subscription renewals after the first year went from 15% to 12%.",
          sources: [
            { label: "Small Business Program", url: "https://developer.apple.com/app-store/small-business-program/" },
            { label: "Commission announcement", url: "https://developer.apple.com/news/?id=dadukodv" },
          ],
        },
        {
          text: "To be listed on the mainland China storefront, an app needs an ICP filing number. If it's missing or the details don't match, the app is unavailable in mainland China. If you only sell outside China, you can uncheck mainland China under App Availability, and watch the option at the bottom of the list that automatically makes the app available in new countries and regions.",
          sources: [
            { label: "MIIT notice on app filing", url: "https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/art/2023/art_920db564162e4312916a01bed6540ad8.html" },
            { label: "Apple on ICP filing", url: "https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/" },
            { label: "Manage availability", url: "https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store" },
          ],
        },
        {
          text: "Under State Council Decree No. 810, starting July 2025 Apple reports information on Chinese developers who distribute apps on the App Store to the State Taxation Administration every quarter. For individuals that means the name and number on their ID card, transaction count, total revenue and refunds. The page doesn't say this only applies to the China storefront.",
          sources: [{ label: "Apple on Decree No. 810", url: "https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-information-for-state-council-decree-no-810/" }],
        },
        {
          text: "Typically half of reviews finish within 24 hours and 90% within 48 hours. If your app has login, give the reviewer a demo account. If it supports creating an account, users must be able to delete their account inside the app.",
          sources: [
            { label: "App Review", url: "https://developer.apple.com/distribute/app-review/" },
            { label: "App Review Guidelines", url: "https://developer.apple.com/app-store/review/guidelines/" },
          ],
        },
        {
          text: "Since February 17, 2025, apps without trader status information are removed from the App Store in the EU.",
          sources: [{ label: "Apple announcement", url: "https://developer.apple.com/news/?id=einwn76m" }],
        },
      ],
    },
    {
      id: "google-play",
      title: "Google Play",
      items: [
        {
          text: "The one-time registration fee is $25, paid by credit or debit card; prepaid cards aren't accepted. Developers in mainland China can register both a developer account and a merchant account. Payouts arrive as USD wire transfers sent from the US, once you reach $100.",
          sources: [
            { label: "Registration", url: "https://support.google.com/googleplay/android-developer/answer/6112435?hl=en" },
            { label: "Supported locations", url: "https://support.google.com/googleplay/android-developer/answer/9306917?hl=en" },
            { label: "Payment methods", url: "https://support.google.com/googleplay/android-developer/answer/7161440?hl=en" },
          ],
        },
        {
          text: "Personal accounts created after November 13, 2023 must run a closed test first: at least 12 testers opted in for at least 14 days in a row before you can apply for production access. New personal accounts also have to prove they own an Android device using the Play Console mobile app.",
          sources: [
            { label: "Testing requirements", url: "https://support.google.com/googleplay/android-developer/answer/14151465?hl=en" },
            { label: "Registration", url: "https://support.google.com/googleplay/android-developer/answer/6112435?hl=en" },
          ],
        },
        {
          text: "Personal accounts publicly show your legal name, country and developer email, and once you start earning money, your full address too. Organization accounts need a D-U-N-S number.",
          sources: [{ label: "Account types", url: "https://support.google.com/googleplay/android-developer/answer/13628312?hl=en" }],
        },
        {
          text: "Digital goods sold inside an app must use Google Play billing. In most markets, after enrolling in the 15% tier, you pay 15% on the first $1 million each year and 30% above that, and auto-renewing subscriptions are always 15%. In the US, the European Economic Area, the UK (from June 30, 2026), and Australia and Japan (from September 30), this changes to 10% on the first $1 million plus a 5% billing fee.",
          sources: [
            { label: "Payments policy", url: "https://support.google.com/googleplay/android-developer/answer/10281818?hl=en" },
            { label: "Service fees", url: "https://support.google.com/googleplay/android-developer/answer/112622?hl=en" },
          ],
        },
      ],
    },
    {
      id: "mcp",
      title: "MCP servers",
      items: [
        {
          text: "The official MCP Registry is still in preview and only stores metadata. Publish your code to npm, PyPI, Docker Hub or similar first, then use mcp-publisher to generate server.json, verify your identity (names published with a GitHub account must start with io.github.username/, or you can verify your own domain) and publish.",
          sources: [
            { label: "About the Registry", url: "https://modelcontextprotocol.io/registry/about" },
            { label: "Publishing quickstart", url: "https://modelcontextprotocol.io/registry/quickstart" },
          ],
        },
        {
          text: "The Registry is mainly meant for downstream marketplaces and aggregators to pull from regularly, and metadata is basically immutable once published.",
          sources: [{ label: "Registry aggregators", url: "https://modelcontextprotocol.io/registry/registry-aggregators" }],
        },
        {
          text: "To get into Claude's connector directory, submit at claude.ai/directory/manage, which requires a paid Pro plan or higher. The server must be a remote HTTPS server, and anything that needs login must use OAuth 2.0. Every tool needs a title and an annotation saying whether it's read-only or modifies data, and you also need a privacy policy, a support contact and a test account for reviewers.",
          sources: [
            { label: "Submission page", url: "https://claude.com/docs/directory/publish" },
            { label: "Submission requirements", url: "https://claude.com/docs/connectors/building/submission" },
          ],
        },
        {
          text: "Anthropic's supported countries and regions don't include mainland China, and also exclude companies controlled by entities from unsupported regions.",
          sources: [{ label: "Supported regions", url: "https://www.anthropic.com/supported-countries" }],
        },
      ],
    },
    {
      id: "gpts",
      title: "GPTs and ChatGPT plugins",
      items: [
        {
          text: "Custom GPTs will be retired on December 11, 2026, and OpenAI recommends migrating to plugins. Personal accounts can no longer create or publish new GPTs.",
          sources: [
            { label: "Retirement FAQ", url: "https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq" },
            { label: "Sharing and publishing", url: "https://help.openai.com/en/articles/8798878-sharing-and-publishing-gpts" },
          ],
        },
        {
          text: "Public listings now go through the ChatGPT and Codex plugin directory: you need identity verification and domain verification, and you submit test cases and a demo video. Plugins can currently only sell physical goods, not subscriptions or credits.",
          sources: [
            { label: "Submission", url: "https://developers.openai.com/plugins/deploy/submission" },
            { label: "Plugin guidelines", url: "https://developers.openai.com/plugins/plugin-guidelines" },
          ],
        },
        {
          text: "OpenAI's supported countries and regions don't include mainland China or Hong Kong, and identity verification requires an ID issued in a supported region.",
          sources: [
            { label: "Supported regions", url: "https://developers.openai.com/api/docs/supported-countries" },
            { label: "Organization verification", url: "https://help.openai.com/en/articles/10910291-api-organization-verification" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "New Chrome accounts can only publish 2 extensions, so don't start by launching several extensions to grab keywords.",
      sources: [{ label: "Chrome for Developers blog", url: "https://developer.chrome.com/blog/cws-review-updates-2026" }],
    },
    {
      text: "The common reasons Chrome, Edge and Firefox reject or slow down reviews: asking for too many permissions, loading remote code, and obfuscated code.",
      sources: [{ label: "Chrome review process", url: "https://developer.chrome.com/docs/webstore/review-process" }],
    },
    {
      text: "Line up testers early for the 12-person, 14-day closed test on Google Play personal accounts. An account that hasn't submitted an app within a year of creation gets closed, and the registration fee isn't refunded.",
      sources: [{ label: "Account closure rules", url: "https://support.google.com/googleplay/android-developer/answer/11605267?hl=en" }],
    },
    {
      text: "The country in your Google Play payments profile can't be changed once set.",
      sources: [{ label: "Payments profile", url: "https://support.google.com/paymentscenter/answer/9037880?hl=en" }],
    },
    {
      text: "If you publish Chrome extensions automatically through the API: the V1 API is only supported until October 15, 2026, so switch to V2.",
      sources: [{ label: "V1 docs", url: "https://developer.chrome.com/docs/webstore/api/v1" }],
    },
    {
      text: "The name in your MCP Registry server.json must match the mcpName in your package, or publishing fails with a permission error.",
      sources: [{ label: "Publishing quickstart", url: "https://modelcontextprotocol.io/registry/quickstart" }],
    },
    {
      text: "Don't build new GPTs. They're being retired on December 11.",
      sources: [{ label: "Retirement FAQ", url: "https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq" }],
    },
  ],
  unknowns: [
    "The exact Chrome registration fee: current docs only say \"a one-time registration fee\", and the $5 figure comes from a 2020 official blog post.",
    "Whether mainland developers who only publish outside China need an app filing: the MIIT notice only covers apps \"providing internet information services within China\" and doesn't address this case directly.",
    "Google doesn't say how bank fees and currency conversion work for Google Play's USD wire transfers.",
    "Neither Anthropic nor the MCP project has said how long Claude connector directory reviews take or when the MCP Registry leaves preview.",
    "Neither the MCP project nor Anthropic names any third-party MCP directory (such as Smithery, Glama or mcp.so).",
  ],
  posts: ["manus-x-tweet-data-analysis-plugin"],
};
