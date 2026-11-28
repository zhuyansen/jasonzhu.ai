import type { Metadata } from "next";
import Link from "@/components/Link";
import { GO_GLOBAL } from "@/lib/go-global";
import { withSocialCards } from "@/lib/social";
import GoGlobalBreadcrumb from "../Breadcrumb";
import { SeoSchoolsMap } from "../seo-sections";

const SITE_URL = "https://jasonzhu.ai";
const PATH = "/seo-geo-schools";

// 全球 SEO / GEO 六大流派地图（2026-11-21 从出海专题首页拆出来单独一页；首页留入口卡片，旧锚点 #seo-schools-map、#school-* 落在卡片上）
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  const lang = isZh ? "zh" : "en";
  return withSocialCards({
    title: isZh ? "全球 SEO / GEO 六大流派地图：谁在说什么，哪些能直接用" : "Six schools of SEO and GEO: who says what",
    description: isZh
      ? "海内外 SEO 和 GEO 实战派按站内还是站外、长期还是短期放进四象限：每一派的核心主张、能直接拿来用的做法，以及哪些说法要先核实。"
      : "SEO and GEO practitioners placed by on-site vs off-site and long-term vs short-term: each school's core claim, what you can borrow, and which claims to check first.",
    alternates: {
      canonical: `${SITE_URL}/${lang}${GO_GLOBAL}${PATH}`,
      languages: { zh: `${SITE_URL}/zh${GO_GLOBAL}${PATH}`, en: `${SITE_URL}/en${GO_GLOBAL}${PATH}`, "x-default": `${SITE_URL}/en${GO_GLOBAL}${PATH}` },
    },
  }, rawLang);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const l = rawLang === "en" ? "en" : "zh";
  const isZh = l === "zh";
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <GoGlobalBreadcrumb lang={l} here={isZh ? "SEO / GEO 流派地图" : "SEO & GEO schools"} path={PATH} />
      <header className="mb-8">
        <p className="text-sm font-medium text-blue-600 mb-2">{isZh ? "出海专题 · 增长" : "Going global · Grow"}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{isZh ? "全球 SEO / GEO 六大流派地图" : "Six schools of SEO and GEO"}</h1>
        <p className="text-gray-600 leading-relaxed">
          {isZh
            ? "每一派列出代表人物、核心主张、能直接拿来用的做法，以及要先拿官方文档和数据核实的地方。点名字能打开他们自己的文章或频道。"
            : "Each school lists its people, its core claim, what you can borrow, and what to check against official docs and data first. Names link to their own articles or channels."}
        </p>
      </header>
      <SeoSchoolsMap l={l} isZh={isZh} />
      <p className="mt-8 text-sm">
        <Link href={`/${l}${GO_GLOBAL}`} className="text-blue-600 hover:underline">
          {isZh ? "← 回到出海路线图" : "← Back to the going-global roadmap"}
        </Link>
      </p>
    </div>
  );
}
