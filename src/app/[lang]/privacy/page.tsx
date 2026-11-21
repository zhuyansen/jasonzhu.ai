import type { Metadata } from "next";
import type { Locale } from "@/lib/dictionaries";
import { withSocialCards } from "@/lib/social";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  return withSocialCards({
    title: lang === "zh" ? "隐私政策" : "Privacy Policy",
    description:
      lang === "zh"
        ? "JasonZhu.AI 隐私政策 - 了解我们如何收集、使用和保护您的个人信息。"
        : "JasonZhu.AI Privacy Policy - Learn how we collect, use, and protect your personal information.",
    alternates: {
      canonical: `https://jasonzhu.ai/${lang}/privacy`,
      languages: {
        zh: "https://jasonzhu.ai/zh/privacy",
        en: "https://jasonzhu.ai/en/privacy",
        "x-default": "https://jasonzhu.ai/zh/privacy",
      },
    },
  }, rawLang);
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isZh ? "隐私政策" : "Privacy Policy"}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {isZh ? "最后更新：2026年11月21日" : "Last updated: November 21, 2026"}
      </p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "1. 信息收集" : "1. Information We Collect"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "当您使用 JasonZhu.AI 网站时，我们可能会收集以下信息："
              : "When you use JasonZhu.AI, we may collect the following information:"}
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
            <li>
              {isZh
                ? "邮箱地址（当您订阅 Newsletter 时）"
                : "Email address (when you subscribe to our newsletter)"}
            </li>
            <li>
              {isZh
                ? "访问数据：用 Vercel Analytics（不用 Cookie）、Google Analytics 4 和 Microsoft Clarity 统计访问来源、浏览的页面和站内操作；Clarity 会录下页面上的点击和滚动（会话录屏），表单输入会被遮挡"
                : "Visit data: we use Vercel Analytics (cookieless), Google Analytics 4 and Microsoft Clarity to see where visits come from, which pages are viewed and what is clicked; Clarity records clicks and scrolling on the page (session replays) with form input masked"}
            </li>
            <li>
              {isZh
                ? "评论内容（通过 GitHub Discussions / Giscus）"
                : "Comments (via GitHub Discussions / Giscus)"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "2. 信息使用" : "2. How We Use Information"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "我们收集的信息仅用于以下目的：发送 Newsletter 邮件、改善网站内容和用户体验、统计网站访问数据。我们不出售你的个人信息；访问数据由上面列出的统计服务（Google、Microsoft、Vercel）按各自的隐私政策处理。"
              : "We use collected information solely for: sending newsletter emails, improving website content and user experience, and analyzing website traffic. We do not sell your personal information; visit data is processed by the analytics providers listed above (Google, Microsoft, Vercel) under their own privacy policies."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "3. 数据存储" : "3. Data Storage"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "您的数据存储在 Supabase（PostgreSQL）数据库中，服务器位于安全的云环境中。我们采取合理的技术措施保护您的数据安全。"
              : "Your data is stored in Supabase (PostgreSQL) databases hosted in secure cloud environments. We take reasonable technical measures to protect your data."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "4. Cookie" : "4. Cookies"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "本网站用 localStorage 存储你的偏好（如点赞状态和统计同意的选择）。Google Analytics 和 Microsoft Clarity 会写统计 Cookie，用来区分新老访客和统计会话；本站不投广告，不使用广告 Cookie。来自欧洲经济区、英国和瑞士的访客，只有点了页面底部的「同意」才会写统计 Cookie，拒绝也能正常浏览；想改选择，清除本站的浏览器数据后会再次询问。"
              : "We use localStorage to keep your preferences (such as likes and your analytics consent choice). Google Analytics and Microsoft Clarity set analytics cookies to tell new visits from returning ones and to count sessions. We don't run ads and don't use advertising cookies. For visitors from the European Economic Area, the UK and Switzerland, analytics cookies are set only after you click Accept in the banner at the bottom of the page; declining doesn't affect browsing. To change your choice, clear this site's data in your browser and you'll be asked again."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "5. 您的权利" : "5. Your Rights"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "您可以随时要求我们删除您的个人数据。如需删除订阅信息或有其他隐私相关问题，请通过 X (@GoSailGlobal) 联系我们。"
              : "You can request deletion of your personal data at any time. For subscription removal or other privacy inquiries, please contact us via X (@GoSailGlobal)."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "6. 联系我们" : "6. Contact Us"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "如有任何隐私相关问题，请通过以下方式联系我们："
              : "For any privacy-related questions, please contact us via:"}
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
            <li>
              X:{" "}
              <a
                href="https://x.com/GoSailGlobal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @GoSailGlobal
              </a>
            </li>
            <li>
              {isZh ? "网站" : "Website"}:{" "}
              <a href="https://jasonzhu.ai" className="text-blue-600 hover:underline">
                jasonzhu.ai
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
