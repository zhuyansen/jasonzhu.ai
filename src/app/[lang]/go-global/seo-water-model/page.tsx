import type { Metadata } from "next";
import Link from "@/components/Link";
import { GO_GLOBAL } from "@/lib/go-global";
import { withSocialCards } from "@/lib/social";
import GoGlobalBreadcrumb from "../Breadcrumb";
import { SeoSystem } from "../seo-sections";

const SITE_URL = "https://jasonzhu.ai";
const PATH = "/seo-water-model";

// SEO 水系模型（2026-11-21 从出海专题首页拆出来单独一页；首页留入口卡片，旧锚点 #seo-water-model-v8 落在卡片上）
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  const lang = isZh ? "zh" : "en";
  return withSocialCards({
    title: isZh ? "SEO 水系模型：14 个构件、6 层水表和 6 道放水闸门" : "The SEO water-system model: 14 components, 6 meters, 6 gates",
    description: isZh
      ? "把 SEO 当一套水系来搭：需求、外链和 AI 引用进水，品牌实体蓄水，技术和内链输水，结果页出水，再回头看数据。v8 的每条规则都来自踩过的坑，v9 的新说法单列待验证。"
      : "SEO built as a water system: demand, links and AI citations flow in, the brand entity stores it, technical work and internal links carry it, the result page lets it out, and the data says what to fix next. Every v8 rule comes from a mistake we made.",
    alternates: {
      canonical: `${SITE_URL}/${lang}${GO_GLOBAL}${PATH}`,
      languages: { zh: `${SITE_URL}/zh${GO_GLOBAL}${PATH}`, en: `${SITE_URL}/en${GO_GLOBAL}${PATH}`, "x-default": `${SITE_URL}/zh${GO_GLOBAL}${PATH}` },
    },
  }, rawLang);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const l = rawLang === "en" ? "en" : "zh";
  const isZh = l === "zh";
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <GoGlobalBreadcrumb lang={l} here={isZh ? "SEO 水系模型" : "SEO water-system model"} path={PATH} />
      <header className="mb-8">
        <p className="text-sm font-medium text-blue-600 mb-2">{isZh ? "出海专题 · 增长" : "Going global · Grow"}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{isZh ? "SEO 水系模型" : "The SEO water-system model"}</h1>
        <p className="text-gray-600 leading-relaxed">
          {isZh
            ? "做任何站都能用的 SEO 框架：14 个构件按水流顺序排好，每个构件写清规则和看哪个数。力气先花在最难、最不能交给 AI 的进水口上，不是最省事的批量造页。"
            : "An SEO framework for any site: 14 components in the order water flows, each with its rules and the one number to watch. Effort goes first to the hardest inflows that AI cannot do for you, not to the easiest work of spinning up pages."}
        </p>
      </header>
      <SeoSystem l={l} isZh={isZh} />
      <p className="mt-8 text-sm">
        <Link href={`/${l}${GO_GLOBAL}`} className="text-blue-600 hover:underline">
          {isZh ? "← 回到出海路线图" : "← Back to the going-global roadmap"}
        </Link>
      </p>
    </div>
  );
}
