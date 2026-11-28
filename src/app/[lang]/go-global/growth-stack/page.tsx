import type { Metadata } from "next";
import Link from "@/components/Link";
import { GO_GLOBAL } from "@/lib/go-global";
import { withSocialCards } from "@/lib/social";
import GoGlobalBreadcrumb from "../Breadcrumb";
import { ArsenalMatrix, ErhuGrowthData11 } from "../seo-sections";

const SITE_URL = "https://jasonzhu.ai";
const PATH = "/growth-stack";

// 出海全栈工具清单 + 二虎的 11 份数据（2026-11-21 从出海专题首页拆出来单独一页；首页留入口卡片，旧锚点 #go-global-arsenal-2026、#ai-growth-data-11 落在卡片上）
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  const lang = isZh ? "zh" : "en";
  return withSocialCards({
    title: isZh ? "出海全栈工具清单：6 个环节留什么、补什么、淘汰什么" : "The go-global tool stack: what to keep, add and retire",
    description: isZh
      ? "建站、收款、技术 SEO、外链和 GEO、数据，每个环节主力保留、新补位和淘汰的工具；以及让 AI 帮你做增长决策之前要先配齐的 11 份数据。"
      : "For building, payments, technical SEO, links and GEO, and data: the tools we keep, add and retire at each stage, plus the 11 data feeds to have before asking AI for growth decisions.",
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
      <GoGlobalBreadcrumb lang={l} here={isZh ? "全栈工具清单" : "Tool stack"} path={PATH} />
      <header className="mb-8">
        <p className="text-sm font-medium text-blue-600 mb-2">{isZh ? "出海专题 · 增长" : "Going global · Grow"}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{isZh ? "出海全栈工具清单" : "The go-global tool stack"}</h1>
        <p className="text-gray-600 leading-relaxed">
          {isZh
            ? "一年下来用过的工具、商业 API 和 SEO skill 横评放在一起做一次取舍：能按次付费的就不买月费，有误报的降级，缺的用自己写的脚本和官方免费通道补上。后半部分是二虎整理的 11 份数据：想让 AI 帮你做增长决策，先把这些数据配齐。"
            : "A year of tools, paid APIs and SEO skill benchmarks, sorted once: pay per call instead of monthly where we can, demote tools that report false passes, and fill gaps with our own scripts and free official channels. The second half is Erhu's list of 11 data feeds to have in place before asking AI for growth decisions."}
        </p>
      </header>
      <ArsenalMatrix l={l} isZh={isZh} />
      <ErhuGrowthData11 l={l} isZh={isZh} />
      <p className="mt-8 text-sm">
        <Link href={`/${l}${GO_GLOBAL}`} className="text-blue-600 hover:underline">
          {isZh ? "← 回到出海路线图" : "← Back to the going-global roadmap"}
        </Link>
      </p>
    </div>
  );
}
