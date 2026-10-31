// English version of ../channels.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Acquisition channels beyond SEO: only each platform's own rules (help centers, community guidelines, official docs), no gaming tactics.
const PH = "https://www.producthunt.com/launch";
const SHOW_HN = "https://news.ycombinator.com/showhn.html";
const X_AUTOMATION = "https://help.x.com/en/rules-and-policies/x-automation";
const GMAIL = "https://support.google.com/mail/answer/81126";

export const CHANNELS_EN: Guide = {
  slug: "channels",
  short: "Growth beyond SEO",
  title: "Growth channels beyond SEO: the official rules for Product Hunt, HN, Reddit, X, directories, email, affiliates and ads",
  description:
    "Besides SEO, how can an indie developer selling overseas get their first users? The official rules for Product Hunt, Hacker News, Reddit, X, AI tool directories, email newsletters, affiliate programs and paid ads, plus the mistakes newcomers make most often.",
  intro:
    "SEO is slow to build, so in the first few months after launch you usually need other channels to get your first users. Every platform has clear rules. Break them and you might get downranked, or banned outright. Below is only what each platform itself says.",
  checked: "2026-10-17",
  sections: [
    {
      id: "product-hunt",
      title: "Product Hunt",
      lead: "Best for software and AI tools people can use right away. Waitlists, directories, templates and courses usually don't make the homepage.",
      items: [
        {
          text: "It's free. You can only post from a personal account, anyone can submit, and you don't need a hunter. New accounts have to wait 1 week before they can launch a product.",
          sources: [
            { label: "How Product Hunt works", url: `${PH}/how-product-hunt-works` },
            { label: "Before you launch", url: `${PH}/before-launch` },
          ],
        },
        {
          text: "You can schedule up to 1 month ahead. Product Hunt recommends launching at 12:01 a.m. Pacific Time to get the full 24 hours.",
          sources: [{ label: "Preparing for launch", url: `${PH}/preparing-for-launch` }],
        },
        {
          text: "You can't ask for upvotes directly, only invite people to check it out and leave feedback. Begging for votes, using bots, rewarding upvotes and mass DMs all break the rules and can lead to downranking, removal or a ban.",
          sources: [
            { label: "Sharing your launch", url: `${PH}/sharing-your-launch` },
            { label: "Community guidelines", url: "https://help.producthunt.com/en/articles/3615694-community-guidelines" },
          ],
        },
        {
          text: "The Product Hunt team decides what gets featured on the homepage, based on usefulness, novelty, craft and creativity. Posts that aren't featured still appear in the full list. The only paid option is ad placement; you can't pay to get featured.",
          sources: [
            { label: "Featuring guidelines", url: "https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines" },
            { label: "Advertising", url: "https://www.producthunt.com/sponsor" },
          ],
        },
      ],
    },
    {
      id: "hacker-news",
      title: "Show HN on Hacker News",
      lead: "Best for developer tools, open source projects and demos people can try online.",
      items: [
        {
          text: "It has to be something people can actually try, ideally without signing up. Blog posts, lists, landing pages and signup pages don't count as Show HN.",
          sources: [{ label: "Show HN rules", url: SHOW_HN }],
        },
        {
          text: "It has to be your own work, and you should be around to answer questions in the thread. Don't ask friends to upvote or comment.",
          sources: [{ label: "Show HN rules", url: SHOW_HN }],
        },
        {
          text: "Don't use HN mainly for promotion, and don't post AI-generated or AI-edited text in submissions or comments.",
          sources: [{ label: "HN guidelines", url: "https://news.ycombinator.com/newsguidelines.html" }],
        },
        {
          text: "Vote soliciting can get the post, your account or even your whole site penalized or banned. Don't delete and repost.",
          sources: [{ label: "HN FAQ", url: "https://news.ycombinator.com/newsfaq.html" }],
        },
      ],
    },
    {
      id: "reddit",
      title: "Reddit",
      lead: "Best for tools that solve a specific problem for a niche community, as long as you've been active there for a long time.",
      items: [
        {
          text: "Sitewide rules: follow each subreddit's own rules, only take part in communities you genuinely care about, and don't spam. If most of what you post links to your own site, post less often, or buy ads instead.",
          sources: [
            { label: "Reddit Rules", url: "https://redditinc.com/policies/reddit-rules" },
            { label: "Reddit on spam", url: "https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam" },
          ],
        },
        {
          text: "The common rule of thumb is that at most 1 in 10 of your submissions should be your own content. Don't hint at wanting upvotes, and don't ask for votes by DM.",
          sources: [{ label: "Reddiquette", url: "https://support.reddithelp.com/hc/en-us/articles/205926439-Reddiquette" }],
        },
        {
          text: "Posts with a commercial relationship can use the Brand Affiliate tag. Making any legally required disclosure is the poster's responsibility.",
          sources: [{ label: "Brand affiliate tag", url: "https://support.reddithelp.com/hc/en-us/articles/23972085214484-What-s-a-brand-affiliate-tag" }],
        },
        {
          text: "Opening a Reddit Ads account is free. Ads are reviewed before they go live, usually within 48 business hours. An ad account's country and currency can't be changed once set.",
          sources: [
            { label: "Create an ads account", url: "https://business.reddithelp.com/s/article/Create-and-manage-your-Reddit-Ads-account" },
            { label: "Set up a campaign", url: "https://business.reddithelp.com/s/article/Set-up-a-Reddit-Ads-Campaign" },
          ],
        },
      ],
    },
    {
      id: "x",
      title: "X (Twitter)",
      lead: "Best for building in public, and for products you can show off in a short video or GIF.",
      items: [
        {
          text: "Automation that doesn't go through the official API (for example, scripts driving the website) is banned and can get you permanently suspended. You also can't post duplicate or near-identical content on one or more accounts.",
          sources: [{ label: "X automation rules", url: X_AUTOMATION }],
        },
        {
          text: "Auto-replying based only on keyword searches is banned. AI reply bots need written approval from X first.",
          sources: [{ label: "X automation rules", url: X_AUTOMATION }],
        },
        {
          text: "Banned: buying or selling accounts, engagement swaps, paying for likes or followers, hijacking trending topics to drive traffic, and sending lots of unsolicited replies or DMs.",
          sources: [{ label: "Authenticity policy", url: "https://help.x.com/en/rules-and-policies/authenticity" }],
        },
        {
          text: "Affiliate links, discount codes that earn you a commission, and free products you received all count as paid partnerships, so turn on the Paid Partnership label when you post.",
          sources: [{ label: "Paid partnerships policy", url: "https://help.x.com/en/rules-and-policies/paid-partnerships-policy" }],
        },
      ],
    },
    {
      id: "directories",
      title: "AI tool directories",
      lead: "Best for consumer AI apps, to get early exposure and get your brand name indexed.",
      items: [
        {
          text: "There's An AI For That: a basic listing is a one-time $49 and goes live in 1 to 2 days on average. The only free route is a monthly call for submissions on X.",
          sources: [{ label: "Submission page", url: "https://theresanaiforthat.com/launch/" }],
        },
        {
          text: "Toolify: a one-time $99, live within 48 hours. The page says it doesn't guarantee sales or traffic.",
          sources: [{ label: "Submission page", url: "https://www.toolify.ai/submit" }],
        },
        {
          text: "Futurepedia's old submission page now returns a 404. What you can find now is a $497 verified listing.",
          sources: [{ label: "Verified listing", url: "https://www.futurepedia.io/enhanced" }],
        },
        {
          text: "Don't treat a paid listing as buying backlinks: Google's spam policies count paying for links as link spam, and paid links should carry rel=\"sponsored\" or nofollow.",
          sources: [{ label: "Google spam policies", url: "https://developers.google.com/search/docs/essentials/spam-policies" }],
        },
      ],
    },
    {
      id: "email",
      title: "Email newsletters",
      lead: "Works for any SaaS, especially products with a free tool or trial that collects email addresses.",
      items: [
        {
          text: "Since February 2024, Gmail requires every sender to have SPF or DKIM, forward and reverse DNS, and TLS, with a spam rate below 0.3%.",
          sources: [{ label: "Gmail sender guidelines", url: GMAIL }],
        },
        {
          text: "Sending roughly 5,000 or more messages a day to personal Gmail accounts makes you a bulk sender: you need SPF, DKIM and DMARC (DMARC at p=none is enough), marketing emails need one-click unsubscribe, and the recommended spam rate is below 0.1%. Yahoo and Microsoft have similar requirements.",
          sources: [
            { label: "Gmail", url: GMAIL },
            { label: "Yahoo", url: "https://senders.yahooinc.com/best-practices/" },
            { label: "Microsoft", url: "https://support.microsoft.com/en-us/outlook/fix-ndr-error-550-5-7-515-in-outlook-com" },
          ],
        },
        {
          text: "Recipients should opt in and confirm their address. Don't buy lists.",
          sources: [{ label: "Gmail sender guidelines", url: GMAIL }],
        },
        {
          text: "Marketing email to US recipients falls under CAN-SPAM: include a physical mailing address (a PO box is fine), honor unsubscribes within 10 business days, and expect fines of up to $53,088 per violating email.",
          sources: [{ label: "FTC compliance guide", url: "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business" }],
        },
        {
          text: "Before your first issue (based on the requirements above): send from your own domain, set up SPF, DKIM and DMARC, add one-click unsubscribe, include a mailing address, send only to confirmed subscribers, and connect Google Postmaster Tools to watch your spam rate.",
        },
      ],
    },
    {
      id: "affiliate",
      title: "Affiliate programs",
      lead: "Best for products with subscription revenue, high margins, and users who gather around creators and communities.",
      items: [
        {
          text: "Lemon Squeezy has built-in affiliates. Orders from affiliates cost an extra 3%, and commissions are held for 30 days before payout. Mainland China isn't among its supported payout countries.",
          sources: [
            { label: "Fees", url: "https://docs.lemonsqueezy.com/help/affiliates-for-merchants/fees" },
            { label: "Payouts", url: "https://docs.lemonsqueezy.com/help/affiliates-for-merchants/payouts" },
            { label: "Supported countries", url: "https://docs.lemonsqueezy.com/help/getting-started/supported-countries" },
          ],
        },
        {
          text: "Creem has a built-in affiliate hub. Commission can be set anywhere from 0 to 100%, affiliates must verify their identity first, and payouts go out on the 1st and 15th of each month.",
          sources: [{ label: "Creem docs", url: "https://docs.creem.io/features/affiliate-program" }],
        },
        {
          text: "Dodo Payments has no built-in affiliates; it officially integrates with Affonso, Dub Partners and Rekomi. Polar's docs only have an integration guide for Affonso.",
          sources: [
            { label: "Dodo docs", url: "https://docs.dodopayments.com/features/affiliates" },
            { label: "Polar docs", url: "https://polar.sh/docs/features/integrations/affonso" },
          ],
        },
        {
          text: "With a third-party tool, first check it works with your payment platform: Rewardful starts at $49 a month and only supports the old Paddle Classic. Tolt starts at $69 a month and supports Stripe and Paddle. PromoteKit starts at $29 a month and only supports Stripe.",
          sources: [
            { label: "Rewardful", url: "https://www.rewardful.com/pricing" },
            { label: "Rewardful and Paddle", url: "https://www.rewardful.com/paddle" },
            { label: "Tolt", url: "https://tolt.com/pricing" },
            { label: "PromoteKit", url: "https://www.promotekit.com/pricing" },
          ],
        },
      ],
    },
    {
      id: "ads",
      title: "Paid ads",
      lead: "Best for products that have already proven people will pay, with a price high enough to cover acquisition cost.",
      items: [
        {
          text: "Every Google Ads advertiser eventually has to complete verification, and accounts that miss the deadline get paused. Individuals in China must submit a government-issued photo ID, and all details must exactly match the payment profile.",
          sources: [
            { label: "Advertiser verification", url: "https://support.google.com/adspolicy/answer/9703665" },
            { label: "Verification deadlines", url: "https://support.google.com/adspolicy/answer/15588490" },
            { label: "Requirements for China", url: "https://support.google.com/adspolicy/answer/9872280?hl=en&co=GENIE.CountryCode%3DCN" },
          ],
        },
        {
          text: "Meta: you need a Facebook Page and a valid payment method before you can run ads. Ads targeting the EU must name the advertiser and the payer.",
          sources: [
            { label: "Ad accounts", url: "https://www.facebook.com/business/help/407323696966570" },
            { label: "EU requirements", url: "https://www.facebook.com/business/help/721913190475838" },
          ],
        },
        {
          text: "Ad bidding runs on conversions: first star your key events in GA4, then link Google Ads and create conversions from them. Key events only apply to data from after you mark them.",
          sources: [
            { label: "GA4 key events", url: "https://support.google.com/analytics/answer/13128484" },
            { label: "Create conversions from key events", url: "https://support.google.com/analytics/answer/13965727" },
          ],
        },
        {
          text: "For ads in the European Economic Area, the UK and Switzerland, you must get user consent and implement Consent Mode v2. Consent Mode doesn't include a consent banner itself; pair it with your own banner or a certified consent management platform.",
          sources: [
            { label: "Consent requirement", url: "https://support.google.com/google-ads/answer/16142339" },
            { label: "Consent Mode v2", url: "https://support.google.com/google-ads/answer/13695607" },
            { label: "Consent banners", url: "https://support.google.com/google-ads/answer/10000067" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Posting \"please upvote me\" in group chats, or running upvote giveaways: both Product Hunt and Hacker News explicitly ban this.",
      sources: [
        { label: "Product Hunt", url: `${PH}/sharing-your-launch` },
        { label: "Show HN", url: SHOW_HN },
      ],
    },
    {
      text: "A new account posting the same product link in several subreddits is exactly the spam example Reddit itself gives. Read each subreddit's sidebar rules before posting.",
      sources: [{ label: "Reddit on spam", url: "https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam" }],
    },
    {
      text: "Using browser scripts to mass-post, or auto-replying to keywords to push your product: X bans this and may suspend you permanently.",
      sources: [{ label: "X automation rules", url: X_AUTOMATION }],
    },
    {
      text: "Bulk sending from a domain without SPF, DKIM and DMARC, or cold emailing an imported, purchased list.",
      sources: [{ label: "Gmail sender guidelines", url: GMAIL }],
    },
    {
      text: "Picking an affiliate tool that doesn't work with your payment platform, or forgetting the extra fees on affiliate orders (for example, Lemon Squeezy's extra 3%).",
      sources: [{ label: "Rewardful and Paddle", url: "https://www.rewardful.com/paddle" }],
    },
    {
      text: "Starting ads before setting up key events and conversions, or running ads in Europe without Consent Mode v2.",
      sources: [{ label: "Consent Mode v2", url: "https://support.google.com/google-ads/answer/13695607" }],
    },
  ],
  unknowns: [
    "How Product Hunt scores the homepage and what its ads cost aren't public, and neither is how many points it takes to reach the Hacker News Show page.",
    "Reddit hasn't said what the minimum Reddit Ads budget is, or whether Reddit Ads and Reddit Pro are open to mainland China entities.",
    "I couldn't find an official page saying whether mainland China advertisers must open Google Ads and Meta accounts through an agency.",
    "Neither Stripe nor Creem says whether Stripe Managed Payments has affiliate features or whether Creem charges extra on affiliate orders.",
    "I didn't check the original EU rules on consent for marketing email (GDPR and ePrivacy) this time.",
  ],
};
