import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  return {
    title: lang === "zh" ? "使用条款" : "Terms of Service",
    description:
      lang === "zh"
        ? "JasonZhu.AI 使用条款 - 使用本网站前请阅读并了解相关条款。"
        : "JasonZhu.AI Terms of Service - Please read and understand these terms before using this website.",
    alternates: {
      canonical: `https://jasonzhu.ai/${lang}/terms`,
      languages: {
        zh: "https://jasonzhu.ai/zh/terms",
        en: "https://jasonzhu.ai/en/terms",
      },
    },
  };
}

export default async function TermsPage({
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
        {isZh ? "使用条款" : "Terms of Service"}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {isZh ? "最后更新：2026年4月14日" : "Last updated: April 14, 2026"}
      </p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "1. 服务说明" : "1. Service Description"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "JasonZhu.AI 是 Jason Zhu 的个人网站，提供 AI 相关的博客文章、工具推荐、行业快讯等内容服务，以及企业 AI 培训、MCN 合作、技术咨询等专业服务。"
              : "JasonZhu.AI is Jason Zhu's personal website, providing AI-related blog posts, tool recommendations, industry news, as well as professional services including enterprise AI training, MCN collaboration, and technical consulting."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "2. 内容版权" : "2. Content Copyright"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "本网站的原创内容（包括但不限于文章、图片、代码示例）版权归 Jason Zhu 所有。转载请注明出处并附上原文链接。部分内容引用自公开来源，已标注原作者和出处。"
              : "Original content on this website (including but not limited to articles, images, and code examples) is copyrighted by Jason Zhu. Please credit the source and include a link to the original when sharing. Some content references public sources with proper attribution."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "3. 免责声明" : "3. Disclaimer"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "本网站的内容仅供参考和学习目的。我们尽力确保信息的准确性，但不对内容的完整性、准确性或时效性做任何保证。AI 工具推荐和技术教程仅代表个人观点，使用前请自行判断。"
              : "Content on this website is for informational and educational purposes only. While we strive for accuracy, we make no guarantees regarding completeness, accuracy, or timeliness. AI tool recommendations and tutorials represent personal opinions — please use your own judgment."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "4. 外部链接" : "4. External Links"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "本网站包含指向第三方网站的链接。我们对这些外部网站的内容、隐私政策或可用性不承担任何责任。访问外部链接时请注意安全。"
              : "This website contains links to third-party websites. We are not responsible for the content, privacy policies, or availability of these external sites. Please exercise caution when visiting external links."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "5. 用户行为" : "5. User Conduct"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "使用本网站时，请遵守相关法律法规，不得发布违法、侵权或不当内容。评论区由 GitHub Discussions 提供支持，请遵守 GitHub 社区准则。"
              : "When using this website, please comply with applicable laws and regulations. Do not post illegal, infringing, or inappropriate content. Comments are powered by GitHub Discussions — please follow GitHub's community guidelines."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "6. 条款变更" : "6. Changes to Terms"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "我们保留随时修改这些条款的权利。修改后的条款将在本页面发布，继续使用本网站即表示您接受修改后的条款。"
              : "We reserve the right to modify these terms at any time. Updated terms will be posted on this page. Continued use of the website constitutes acceptance of the modified terms."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isZh ? "7. 联系我们" : "7. Contact Us"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZh
              ? "如对本条款有任何疑问，请通过以下方式联系我们："
              : "For any questions about these terms, please contact us via:"}
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
