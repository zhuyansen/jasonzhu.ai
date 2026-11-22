import type { Metadata } from "next";
import Link from "@/components/Link";
import SubscribeForm from "@/components/SubscribeForm";
import TrackedLink from "@/components/TrackedLink";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import {
  ANALYTICS_BASICS,
  BACKLINK_SOURCES,
  BEGINNER_EXTRAS,
  BEGINNER_VIDEOS,
  CLOUDFLARE_STACK,
  DATA_TOOLS,
  DOMAIN_TLD,
  GEFEI_SITES_ENGINE,
  GEO_NEW_SITE,
  GO_GLOBAL,
  JESSE_SEO,
  KEYWORD_TOOLS,
  LEARN_SEO,
  MY_PAYMENT_PICK,
  MY_POSTS,
  NEWBIE_FAQ,
  NEW_TERM_RADAR,
  PAGE_TUNING,
  POST_GROUPS,
  SEO_SCHOOLS_MAP,
  SEO_SKILLS,
  SEO_TOOLS_DIRECTORY,
  STACK,
  groupPosts,
  postTitle,
  type ByPost,
  type Pick,
  type SharedPick,
} from "@/lib/go-global";
import { faqJsonLd } from "@/lib/faq";
import { getWeeklyIssues } from "@/lib/mdx";
import { GUARD_REPO } from "@/lib/payment-guard-types";
import GoGlobalBreadcrumb from "./Breadcrumb";
import { BOX, CARD, FromMyPost, OUT, PANEL, hl, type PostRef } from "./ui";
import Community from "./Community";
import { withSocialCards } from "@/lib/social";

const SITE_URL = "https://jasonzhu.ai";
const BACKLINK_GUARD = "https://github.com/zhuyansen/backlink-guard";

// 出海专题首页：一条路线——新手先看、建站、收钱（开户 / 选平台 / 体检）、增长（数据 / 技术 SEO / 外链）、每周看数据，
// 再加社群经验和站内的出海实操文章。
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  const lang = isZh ? "zh" : "en";
  return withSocialCards({
    title: isZh ? "出海专题：建站、收款、SEO 和外链，独立开发者出海路线图" : "Going global: a roadmap from domain to payments, SEO and backlinks",
    description: isZh
      ? "独立开发者出海一条路走完：域名、托管和数据库怎么选，个人还是公司、开哪家收款，数据查看、技术 SEO 和外链怎么做，再加每周的出海选品周报。"
      : "The whole road for an indie developer selling abroad: domain, hosting and database; an individual or a company and which payment platform; data, technical SEO and backlinks; and a weekly look at new sellers.",
    alternates: {
      canonical: `${SITE_URL}/${lang}${GO_GLOBAL}`,
      languages: { zh: `${SITE_URL}/zh${GO_GLOBAL}`, en: `${SITE_URL}/en${GO_GLOBAL}`, "x-default": `${SITE_URL}/zh${GO_GLOBAL}` },
    },
  }, rawLang);
}


function Step({ n, id, title, lead, children }: { n: number; id?: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} className={PANEL}>
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex-none">{n}</span>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed pb-4 mb-5 border-b border-gray-200">{lead}</p>
      {children}
    </section>
  );
}

function Card({ href, title, body, external }: { href: string; title: string; body: string; external?: boolean }) {
  const cls = CARD;
  const inner = (
    <>
      <p className="font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
    </>
  );
  return external ? (
    <TrackedLink href={href} {...OUT} className={cls}>
      {inner}
    </TrackedLink>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

function PickList({ title, picks, lang, source }: { title: string; picks: Pick[]; lang: "zh" | "en"; source?: PostRef }) {
  return (
    <div className={BOX}>
      <p className="text-sm font-semibold text-gray-900 mb-2">{title}</p>
      <ul className="space-y-1.5 text-sm text-gray-700">
        {picks.map((p) => (
          <li key={p.name}>
            <TrackedLink
              href={p.url}
              event={p.referral ? "referral_click" : undefined}
              params={p.referral ? { partner: p.name.toLowerCase() } : undefined}
              target="_blank"
              rel={p.referral ? "sponsored noopener noreferrer" : "noopener noreferrer"}
              className="font-medium text-blue-600 hover:underline"
            >
              {p.name}
            </TrackedLink>
            {p.referral && <span className="ml-1 text-xs text-gray-400">{lang === "zh" ? "（推荐链接）" : "(referral link)"}</span>}
            <span className="text-gray-500">
              {" · "}
              {p.what[lang]}
              {p.why ? (lang === "zh" ? `：${p.why.zh}` : `: ${p.why.en}`) : ""}
            </span>
          </li>
        ))}
      </ul>
      {source && <FromMyPost post={source} lang={lang} />}
    </div>
  );
}

/** 别人的帖子：作者「标题」日期 */
function ByLine({ post, lang }: { post: ByPost; lang: "zh" | "en" }) {
  return (
    <p className="mt-3 text-xs text-gray-400">
      {post.by}{" "}
      <a href={post.url} {...OUT} className="text-blue-600 hover:underline">
        「{post.title[lang]}」
      </a>{" "}
      {post.date}
    </p>
  );
}

function SharedPickList({ title, picks, lang, source, tip }: { title: string; picks: SharedPick[]; lang: "zh" | "en"; source?: ByPost; tip?: { zh: string; en: string } }) {
  return (
    <div className={BOX}>
      <p className="text-sm font-semibold text-gray-900 mb-2">{title}</p>
      <ul className="space-y-1.5 text-sm text-gray-700">
        {picks.map((p) => (
          <li key={p.name}>
            <TrackedLink href={p.url} {...OUT} className="font-medium text-blue-600 hover:underline">
              {p.name}
            </TrackedLink>
            <span className="text-gray-500">
              {" · "}
              {p.what[lang]}
              {p.why ? (lang === "zh" ? `：${p.why.zh}` : `: ${p.why.en}`) : ""}
            </span>
            {p.post && (
              <a href={p.post} {...OUT} className="ml-1 text-xs text-gray-400 hover:underline">
                {lang === "zh" ? `（${p.by} ${p.date}）` : `(${p.by}, ${p.date})`}
              </a>
            )}
          </li>
        ))}
      </ul>
      {tip && <p className="mt-2 text-xs text-gray-500 leading-relaxed">{tip[lang]}</p>}
      {source && <ByLine post={source} lang={lang} />}
    </div>
  );
}

function PointsBox({ title, points, lang, source }: { title: string; points: string[]; lang: "zh" | "en"; source: ByPost }) {
  return (
    <div className={`mt-3 ${BOX}`}>
      <p className="text-sm font-semibold text-gray-900 mb-2">{title}</p>
      <ul className="space-y-1.5 text-sm text-gray-700 leading-relaxed list-disc pl-5">
        {points.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <ByLine post={source} lang={lang} />
    </div>
  );
}

function GeoNewSite({ l, isZh }: { l: "zh" | "en"; isZh: boolean }) {
  return (
    <div className={`${BOX} mb-3`}>
      <p className="text-sm font-semibold text-gray-900 mb-2">{isZh ? "GEO：新站先做什么" : "GEO: what a new site does first"}</p>
      <ol className="space-y-1.5 text-sm text-gray-700 leading-relaxed list-decimal pl-5">
        {GEO_NEW_SITE.geo[l].map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ol>
      <p className="mt-3 mb-1.5 text-sm font-medium text-gray-900">{isZh ? "新站怎么定页面的先后" : "Ordering the pages of a new site"}</p>
      <ul className="space-y-1.5 text-sm text-gray-700 leading-relaxed list-disc pl-5">
        {GEO_NEW_SITE.priority[l].map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <ByLine post={GEO_NEW_SITE.source} lang={l} />
      <p className="text-xs text-gray-400">{isZh ? "「定页面先后」一段出自他的新文章（帖子配图）。" : "The page-ordering part is from his new article (the image in the post)."}</p>
      <p className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 leading-relaxed">
        {GEO_NEW_SITE.official[l]}{" "}
        <a href={hl(GEO_NEW_SITE.official.guide, l)} {...OUT} className="text-blue-600 hover:underline">
          {isZh ? "官方指南" : "The guide"}
        </a>
        <span className="text-gray-300"> · </span>
        <a href={hl(GEO_NEW_SITE.official.report, l)} {...OUT} className="text-blue-600 hover:underline">
          {isZh ? "效果报告说明" : "About the report"}
        </a>
      </p>
    </div>
  );
}

// 没学过 SEO 先补课：左边 Google 官方文档的阅读顺序，右边哥飞列的学习顺序（用户 10-17 发来）
function LearnSeo({ l, isZh }: { l: "zh" | "en"; isZh: boolean }) {
  const g = LEARN_SEO.gefei;
  return (
    <div className={`${BOX} mb-3`}>
      <p className="text-sm font-semibold text-gray-900 mb-3">{isZh ? "没学过 SEO？先按这两条路线补课" : "New to SEO? Two ways to learn it"}</p>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500 mb-1.5">
            <a href={hl(LEARN_SEO.google.home, l)} {...OUT} className="font-medium text-blue-600 hover:underline">
              {isZh ? "Google 搜索中心文档" : "Google Search Central docs"}
            </a>
            {isZh ? "：Google 自己写的规则，有中文版，按这个顺序读：" : ": the rules from Google itself, read in this order:"}
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
            {LEARN_SEO.google.reads.map((r) => (
              <li key={r.url}>
                <a href={hl(r.url, l)} {...OUT} className="font-medium text-blue-600 hover:underline">
                  {r.title[l]}
                </a>
                <span className="text-gray-500">{isZh ? `：${r.why.zh}` : `: ${r.why.en}`}</span>
                <span className="ml-1 text-xs text-gray-400 whitespace-nowrap">{isZh ? `${r.updated} 更新` : `updated ${r.updated}`}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
            <p className="text-sm font-medium text-gray-900 mb-0.5">{isZh ? "Jesse 的「佛系 SEO」" : "Jesse's low-effort SEO"}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{JESSE_SEO[l]}</p>
            <ByLine post={JESSE_SEO.source} lang={l} />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1.5">{isZh ? "哥飞列的学习顺序：" : "The order 哥飞 suggests (in Chinese):"}</p>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
            {g.steps.map((s) => (
              <li key={s.en}>
                {s[l]}{" "}
                {s.links.map((x, i) => (
                  <span key={x.url}>
                    {i > 0 && <span className="text-gray-300"> · </span>}
                    <a href={l === "en" && x.en ? x.en.url : x.url} {...OUT} className="text-blue-600 hover:underline">
                      {l === "en" && x.en ? x.en.label : x.label}
                    </a>
                  </span>
                ))}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-sm">
            <a href={g.all} {...OUT} className="text-blue-600 hover:underline">
              {isZh ? "教程栏目的其他文章也都值得看 →" : "The rest of his tutorials →"}
            </a>
          </p>
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-gray-700 leading-relaxed">
            {LEARN_SEO.commentRule[l]}{" "}
            <a href={hl(LEARN_SEO.commentRule.url, l)} {...OUT} className="text-blue-600 hover:underline">
              {isZh ? "政策原文" : "The policy"}
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-400 leading-relaxed">{g.note[l]}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-900 mb-2">
          {isZh
            ? "进阶必读：JOKER「降低机器 6 种不确定性」总纲与海外 6 本 SEO / GEO 前沿专著核心提炼"
            : "Advanced Reading: JOKER's 6 Uncertainty Reductions & 6 Frontier SEO / GEO Books"}
        </p>
        <div className="grid gap-2.5 md:grid-cols-2">
          {LEARN_SEO.advancedBooks.map((b) => (
            <div key={b.url} className="rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-xs leading-relaxed">
              <div className="flex flex-wrap items-baseline justify-between gap-1 mb-0.5">
                <a href={b.url} {...OUT} className="font-semibold text-blue-600 hover:underline">
                  {b.title[l]}
                </a>
                <span className="text-[11px] text-gray-400">{b.author}</span>
              </div>
              <p className="text-gray-600">{b.takeaway[l]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageTuning({ l, isZh }: { l: "zh" | "en"; isZh: boolean }) {
  const t = PAGE_TUNING;
  return (
    <div className={`mt-3 ${BOX}`}>
      <p className="text-sm font-semibold text-gray-900 mb-1">
        {isZh ? "页面优化：用 GSC 气泡图挑该改的词和页面" : "Page tuning: pick the queries and pages to fix with a bubble chart"}
      </p>
      <p className="text-sm text-gray-600 leading-relaxed">
        {t.setup[l]}{" "}
        <a href={hl(t.doc.template, l)} {...OUT} className="text-blue-600 hover:underline">
          {isZh ? "官方示例图表" : "Google's sample chart"}
        </a>
      </p>
      <div className="grid gap-2 sm:grid-cols-2 mt-3">
        {t.quadrants.map((q, i) => (
          <div key={q.name.en} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-900 mb-0.5">
              {"①②③④"[i]} {q.name[l]}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{q.act[l]}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{t.next[l]}</p>
      <ul className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-sm text-gray-700 leading-relaxed">
        {t.more.map((m) => (
          <li key={m.url}>
            <a href={hl(m.url, l)} {...OUT} className="font-medium text-blue-600 hover:underline">
              {m.title[l]}
            </a>
            <span className="text-gray-500">
              {isZh ? `（Google，${m.updated} 更新）：` : ` (Google, updated ${m.updated}): `}
              {m.note[l]}
            </span>
            {m.template && (
              <a href={hl(m.template, l)} {...OUT} className="ml-1 text-blue-600 hover:underline">
                {isZh ? "模板" : "Template"}
              </a>
            )}
          </li>
        ))}
      </ul>
      <ByLine post={t.source} lang={l} />
      <p className="text-xs text-gray-400">
        {isZh ? "四个象限的做法出自 Google 官方教程" : "The quadrant advice is from Google's guide"}{" "}
        <a href={hl(t.doc.url, l)} {...OUT} className="text-blue-600 hover:underline">
          {isZh ? "「利用 Search Console 气泡图改进 SEO 效果」" : '"Using a Search Console bubble chart to improve SEO"'}
        </a>
        {isZh ? `（${t.doc.updated} 更新）。` : ` (updated ${t.doc.updated}).`}
      </p>
    </div>
  );
}

function PostLinks({ slugs, lang }: { slugs: string[]; lang: string }) {
  const posts = groupPosts({ id: "inline", zh: "", en: "", slugs });
  if (!posts.length) return null;
  return (
    <div className="mt-5 pt-4 border-t border-gray-200">
      <p className="mb-2 text-xs font-medium text-gray-500">{lang === "zh" ? "相关文章" : "Related posts"}</p>
      <ul className="space-y-1.5">
        {posts.map((post) => (
          <li key={post.slug} className="text-sm">
            <Link href={`/${lang}/blog/${post.slug}`} className="text-gray-700 hover:text-blue-600 hover:underline">
              {postTitle(post, lang)}
            </Link>
            <span className="ml-2 text-xs text-gray-400">{post.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 秒数 → mm:ss 或 h:mm:ss */
function clock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const sec = String(seconds % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${String(m).padStart(2, "0")}:${sec}`;
}

function Beginners({ isZh }: { isZh: boolean }) {
  const c = BEGINNER_VIDEOS.channel;
  return (
    <section className="mb-10 rounded-3xl bg-amber-50/60 border border-amber-200 p-5 md:p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1.5">{isZh ? "新手先看" : "New to this? Start here"}</h2>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {isZh
          ? `刚开始做出海，先看这几样：${c.host}（YouTube「${c.name}」）回答读者提问的两期 AMA（第一期还有一位搭档一起答），一个从零做出并上线 AI 应用的教程，和两份工具清单。`
          : `Start with these: two AMA episodes in which ${c.host} (YouTube channel "${c.name}") answers readers' questions, joined by a co-host in the first, a tutorial that builds and launches an AI app from zero, and two tool lists. In Chinese.`}{" "}
        <a href={c.url} {...OUT} className="text-blue-600 hover:underline">
          {isZh ? "频道主页" : "Channel"}
        </a>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {BEGINNER_VIDEOS.videos.map((v) => (
          <div key={v.id}>
            <a
              href={`https://www.youtube.com/watch?v=${v.id}`}
              {...OUT}
              className="flex items-center gap-3 rounded-xl bg-white border border-amber-100 p-4 hover:border-amber-300 transition-colors"
            >
              <span aria-hidden="true" className="flex-none inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white text-sm">
                ▶
              </span>
              <span>
                <span className="block font-semibold text-gray-900">{v.title}</span>
                <span className="block text-xs text-gray-500">
                  {v.duration} · {v.date}
                </span>
              </span>
            </a>
            {v.points.length > 0 && (
              <details className="mt-2 rounded-xl bg-white/70 border border-amber-100 px-4 py-3 text-sm">
                <summary className="cursor-pointer text-blue-600">
                  {isZh ? `看要点（${v.points.length} 条，点时间跳到那一段）` : `Key points (${v.points.length}; click a time to jump there)`}
                </summary>
                <ul className="mt-2 space-y-2">
                  {v.points.map((pt) => (
                    <li key={pt.t} className="leading-relaxed text-gray-700">
                      <a href={`https://www.youtube.com/watch?v=${v.id}&t=${pt.t}s`} {...OUT} className="mr-1.5 font-mono text-xs text-blue-600 hover:underline">
                        {clock(pt.t)}
                      </a>
                      {isZh ? pt.zh : pt.en}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500">{isZh ? BEGINNER_VIDEOS.timing.zh : BEGINNER_VIDEOS.timing.en}</p>
      <div className="grid gap-3 sm:grid-cols-2 mt-3">
        {BEGINNER_EXTRAS.map((x) => (
          <div key={x.url} className="rounded-xl bg-white border border-amber-100 p-4">
            <a href={x.url} {...OUT} className="block font-semibold text-gray-900 hover:text-blue-600">
              {"stages" in x && "▶ "}
              {isZh ? x.title.zh : x.title.en}
            </a>
            <span className="block text-xs text-gray-500 mb-1.5">
              {x.by}
              {"duration" in x && ` · ${x.duration}`} · {x.date}
            </span>
            <span className="block text-sm text-gray-600 leading-relaxed">{isZh ? x.note.zh : x.note.en}</span>
            {"stages" in x && x.stages && (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-blue-600">{isZh ? "按章节看（18 节）" : "By chapter (18)"}</summary>
                <div className="mt-2 space-y-2">
                  {x.stages.map((stage) => (
                    <p key={stage.en} className="leading-relaxed">
                      <span className="font-medium text-gray-800">
                        {isZh ? stage.zh : stage.en}
                        {isZh ? "：" : ": "}
                      </span>
                      {stage.chapters.map(([t, zh, en], i) => (
                        <span key={t}>
                          {i > 0 && <span className="text-gray-300"> · </span>}
                          <a href={`${x.url}&t=${t}s`} {...OUT} className="text-gray-600 hover:text-blue-600 hover:underline">
                            {isZh ? zh : en}
                          </a>
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Backlinks({ lang, l, isZh }: { lang: string; l: "zh" | "en"; isZh: boolean }) {
  return (
    <div className="grid gap-3 md:grid-cols-3 mt-4">
      <div className={BOX}>
        <p className="text-sm font-semibold text-gray-900 mb-1">{isZh ? "找新词：new-term-radar v0.7.0" : "New terms: new-term-radar v0.7.0"}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {isZh
            ? "每天扫描 10 路早筛信号（X 实验室/博主、HF、GitHub 爆发项目、90 天内起量新域名、GSC 3d vs 60d 新词、TrustMRR 真实收入榜、Reddit/Freelancer 求工具帖、8 家收款平台新卖家、9 路新发产品源、AdSense 同站长矩阵 + 投流新词 + 用户差评痛点），并用 14 天后 Google Trends 自动复盘各信号命中率（已砍掉 0 命中的竞品 Sitemap diff）。开源，支持 CLI、Agent Skill 与 MCP。"
            : "Scans 10 early-signal channels daily (X labs, HF, GitHub breakouts, <90d rising domains, GSC 3d vs 60d new queries, TrustMRR verified revenue, Reddit/Freelancer tool requests, 8-gateway new sellers, 9 launch feeds, AdSense publisher-ID reverse lookup + Ads new advertisers + 1–3★ user pain points) and auto-verifies signal hit rates against 14-day Google Trends (retired 0-hit competitor sitemap diff). Open source via CLI, Agent Skill & MCP."}
        </p>
        <TrackedLink href={NEW_TERM_RADAR} {...OUT} className="text-sm text-blue-600 hover:underline">
          GitHub →
        </TrackedLink>
        <FromMyPost post={MY_POSTS.radar} lang={l} />
      </div>
      <div className={BOX}>
        <p className="text-sm font-semibold text-gray-900 mb-1">{isZh ? "外链清单：一个月 DR 从 0 到 15" : "Backlink sources: DR 0 to 15 in a month"}</p>
        <p className="text-xs text-gray-500 mb-2">{isZh ? "外链不能贪多，这几个渠道就够：" : "Do not chase volume; these were enough:"}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          {BACKLINK_SOURCES.map((s) => (
            <li key={s.en}>{s[l]}</li>
          ))}
        </ul>
        <FromMyPost post={MY_POSTS.backlinks} lang={l} />
      </div>
      <div className={BOX}>
        <p className="text-sm font-semibold text-gray-900 mb-1">{isZh ? "外链与引用闭环：backlink-guard v0.12.0" : "Backlink & citation guard: backlink-guard v0.12.0"}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {isZh
            ? "12 个 CLI/MCP 命令：提交前查站群/卖链/降权（vet）、查 AI 爬虫能不能读到一个站（ai-access）、按搜索访客找高优目录（find）、扒竞品上线前 90 天首发渠道（competitors --early）、挽回带外链的 404 死链（lost 含 301 建议）、查被 AI Overview 引用的页面（cited）及 5 引擎 AI 引用排名（asked --rank）。"
            : "12 CLI/MCP commands: vet link sellers/PBNs/demoted sites before submitting, check whether AI crawlers can read a site (ai-access), find directories by real search visitors, uncover competitors' first-90-day launch channels (competitors --early), recover backlinked 404s with 301 targets (lost), and probe AI Overview & 5-engine citations (cited / asked --rank)."}
        </p>
        <p className="text-sm flex flex-wrap gap-x-4 gap-y-1">
          <TrackedLink href={BACKLINK_GUARD} {...OUT} className="text-blue-600 hover:underline">
            GitHub →
          </TrackedLink>
          <Link href={`/${lang}/backlink-spam-list`} className="text-blue-600 hover:underline">
            {isZh ? "垃圾外链来源库 →" : "Backlink spam list →"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Weekly({ lang, isZh }: { lang: string; isZh: boolean }) {
  const issues = getWeeklyIssues().slice(0, 3);
  return (
    <>
      <ol className="space-y-3">
        {issues.map((issue) => (
          <li key={issue.slug}>
            <Link
              href={`/${lang}/blog/${issue.slug}`}
              className={CARD}
            >
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mr-2">
                {isZh ? `第 ${issue.issue} 期` : `Issue ${issue.issue}`}
              </span>
              <span className="text-sm text-gray-400">{issue.date}</span>
              <p className="mt-1.5 font-semibold text-gray-900 leading-snug">{issue.title}</p>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm">
        <Link href={`/${lang}${GO_GLOBAL}/weekly`} className="text-blue-600 hover:underline">
          {isZh ? "全部周报 →" : "All issues →"}
        </Link>
      </p>
    </>
  );
}

function Faq({ lang, isZh }: { lang: string; isZh: boolean }) {
  const titles = Object.fromEntries(BEGINNER_VIDEOS.videos.map((v) => [v.id, v.title]));
  return (
    <section id="faq" className={PANEL}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{isZh ? "新手常见问题" : "Beginner questions"}</h2>
      <div className="space-y-5">
        {NEWBIE_FAQ.map((f) => (
          <div key={f.q.en}>
            <h3 className="font-semibold text-gray-900 mb-1">{isZh ? f.q.zh : f.q.en}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{isZh ? f.a.zh : f.a.en}</p>
            {f.link && (
              <p className="mt-1 text-sm">
                {f.link.href.startsWith("http") ? (
                  <TrackedLink href={f.link.href} {...OUT} className="text-blue-600 hover:underline">
                    {isZh ? f.link.zh : f.link.en}
                  </TrackedLink>
                ) : (
                  <Link href={`/${lang}${f.link.href}`} className="text-blue-600 hover:underline">
                    {isZh ? f.link.zh : f.link.en}
                  </Link>
                )}
              </p>
            )}
            {f.from && (
              <p className="mt-1 text-xs text-gray-400">
                {isZh ? `来自 ${BEGINNER_VIDEOS.channel.host} 的 ` : `From ${BEGINNER_VIDEOS.channel.host}'s `}
                <a href={`https://www.youtube.com/watch?v=${f.from.video}&t=${f.from.t}s`} {...OUT} className="text-blue-600 hover:underline">
                  {titles[f.from.video]} {clock(f.from.t)}
                </a>
                {isZh ? "（2024 年录制）" : " (recorded in 2024)"}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Guides({ lang, isZh }: { lang: string; isZh: boolean }) {
  return (
    <section className={PANEL}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{isZh ? "出海实操文章" : "Hands-on guides"}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {POST_GROUPS.map((group) => {
          const posts = groupPosts(group);
          if (!posts.length) return null;
          return (
            <div key={group.id}>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{isZh ? group.zh : group.en}</h3>
              <ul className="space-y-2">
                {posts.map((post) => (
                  <li key={post.slug} className="text-sm leading-snug">
                    <Link href={`/${lang}/blog/${post.slug}`} className="text-gray-700 hover:text-blue-600 hover:underline">
                      {postTitle(post, lang)}
                    </Link>
                    <span className="ml-2 text-xs text-gray-400 whitespace-nowrap">{post.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function GoGlobalPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const l = lang === "en" ? "en" : "zh";
  const isZh = lang === "zh";
  const dict = await getDictionary(lang);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(NEWBIE_FAQ.map((f) => ({ question: isZh ? f.q.zh : f.q.en, answer: isZh ? f.a.zh : f.a.en })))),
        }}
      />
      <GoGlobalBreadcrumb lang={lang} />
      <header className="mb-10">
        <p className="text-sm font-medium text-blue-600 mb-2">{isZh ? "出海专题" : "Going global"}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {isZh ? "独立开发者出海路线图：建站、收钱、增长" : "An indie developer's road abroad: build, get paid, grow"}
        </h1>
        <p className="text-gray-600 leading-relaxed">
          {isZh
            ? "从买域名到收到第一笔海外的钱，再到做 SEO 和外链，按顺序整理成四步。每一步都是我自己在用的工具和踩过的坑；收款部分按各平台的官方文档整理，每周再数一遍新卖家都在卖什么。"
            : "From buying a domain to the first payment from abroad, then SEO and backlinks, in four steps. Each step is what I use and what went wrong; the payment part follows each platform's own pages, and every week I count what new sellers sell."}
        </p>
      </header>

      <Beginners isZh={isZh} />

      <Step
        n={1}
        id="build"
        title={isZh ? "建站：域名、托管、数据库" : "Build: domain, hosting, database"}
        lead={isZh ? "起步几乎不花钱：三样都有免费额度，起量后再升级。" : "Starting costs almost nothing: all three have free tiers; upgrade once traffic comes."}
      >
        <PickList title={isZh ? "我在用的" : "What I use"} picks={STACK} lang={l} source={MY_POSTS.stack} />
        <PointsBox title={isZh ? "域名后缀怎么选" : "Choosing the domain ending"} points={DOMAIN_TLD.points[l]} lang={l} source={DOMAIN_TLD.source} />
        <div className="mt-3">
          <p className="mb-3 text-sm font-semibold text-gray-900">
            {isZh ? "按目标市场：域名、服务器、语言、合规" : "By target market: domain, hosting, language, compliance"}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Card
              href={`/${lang}${GO_GLOBAL}/domains`}
              title={isZh ? "按市场选域名：.com 还是国家后缀，谁能注册" : "Domains by market: .com or a country ending, and who may register"}
              body={
                isZh
                  ? "Google 怎么看 .ai、.io 和国家后缀；美国、印尼、越南、日本、韩国、俄罗斯、中国、欧洲的后缀谁能注册、要什么材料；便宜后缀在收录和邮件上的风险。"
                  : "How Google treats .ai, .io and country endings; who may register in the US, Indonesia, Vietnam, Japan, Korea, Russia, China and Europe, and what they ask for; what cheap endings do to indexing and email."
              }
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/hosting`}
              title={isZh ? "服务器放哪、当地用户能不能打开" : "Where to host, and whether it loads"}
              body={
                isZh
                  ? "vercel.app 在大陆被封、GA 在大陆悄悄丢数据，俄罗斯对 Cloudflare 上的网站限速到 16KB，越南海缆常断；各家 CDN 在当地有没有节点，数据要不要存在境内。"
                  : "vercel.app is blocked in mainland China and GA quietly loses data there, Russia throttles Cloudflare sites to 16 KB, Vietnam's cables keep breaking; which CDNs have local nodes, and where data must stay."
              }
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/localization`}
              title={isZh ? "语言和本地化细节" : "Language and localisation details"}
              body={
                isZh
                  ? "Google 认哪些 hreflang、机器翻译页面的风险、日语韩语德语怎么称呼用户、台湾和香港的繁体用词，以及俄罗斯、法国、印尼对语言的硬性要求。"
                  : "Which hreflang codes Google accepts, the risk of machine-translated pages, how to address users in Japanese, Korean and German, Taiwan and Hong Kong wording, and the language laws of Russia, France and Indonesia."
              }
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/compliance`}
              title={isZh ? "上线前必备的合规页面" : "Pages and filings before launch"}
              body={
                isZh
                  ? "隐私政策和 cookie、日本特商法表记、德国 Impressum、欧盟和英国代表、印尼 PSE 登记、俄罗斯数据本地化，以及欧盟的 14 天撤回和撤回按钮。"
                  : "Privacy policy and cookies, Japan's commercial transactions notice, Germany's Impressum, EU and UK representatives, Indonesia's PSE registration, Russian data localisation, and the EU's 14-day withdrawal and withdrawal button."
              }
            />
          </div>
        </div>
        <div className={`mt-3 ${BOX}`}>
          <p className="text-sm font-semibold text-gray-900 mb-1">{isZh ? "另一种做法：全放 Cloudflare" : "Another way: everything on Cloudflare"}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{CLOUDFLARE_STACK.pieces[l]}</p>
          <p className="mt-2 text-xs text-gray-400">
            {CLOUDFLARE_STACK.by}{" "}
            <a href={CLOUDFLARE_STACK.url} {...OUT} className="text-blue-600 hover:underline">
              {isZh ? "「AI + Cloudflare = 你需要的全部」" : '"AI + Cloudflare is all you need"'}
            </a>{" "}
            {CLOUDFLARE_STACK.date}
          </p>
        </div>
        <div className={`mt-3 ${BOX}`}>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {isZh
              ? "不懂代码 / 48 小时抢新词上站：哥飞 GeFeiSites 建站引擎"
              : "No-code / 48-hour new-term utility sites: Gefei's GeFeiSites Engine"}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{GEFEI_SITES_ENGINE[l]}</p>
          <p className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
            <a href={GEFEI_SITES_ENGINE.url} {...OUT} className="text-blue-600 font-medium hover:underline">
              {isZh ? "GeFeiSites 建站引擎 & Showcase →" : "GeFeiSites Engine & Showcase →"}
            </a>
            <span className="text-gray-300">·</span>
            <a href={GEFEI_SITES_ENGINE.agentUrl} {...OUT} className="text-blue-600 hover:underline">
              {isZh ? "哥飞 SEO Agent →" : "Gefei SEO Agent →"}
            </a>
          </p>
        </div>
        <div className="mt-3">
          <Card
            href={`/${lang}${GO_GLOBAL}/extensions`}
            title={isZh ? "不做网站：插件、App 和 MCP 怎么上架" : "Not a website: shipping extensions, apps and MCP"}
            body={
              isZh
                ? "我做 Chrome 插件从开发到上架踩过的坑，加上 Chrome、Edge、Firefox、App Store、Google Play、MCP 和 GPT 各家的官方规则。"
                : "What building and shipping a Chrome extension taught me, plus the official rules of Chrome, Edge, Firefox, the App Store, Google Play, MCP and GPTs."
            }
          />
        </div>
        <PostLinks slugs={["going-global-email-receiving-cloudflare-routing", "going-global-email-sending-with-resend"]} lang={lang} />
      </Step>

      <Step
        n={2}
        title={isZh ? "收钱：个人还是公司、开哪家、过审核" : "Get paid: individual or company, which platform, passing review"}
        lead={isZh ? "没注册公司也能收海外的钱。先定身份，再选平台，提交审核前体检网站。" : "No company is needed to start. Decide who holds the account, pick the platform, then check the site before you apply."}
      >
        <div className="grid gap-3 md:grid-cols-3 md:items-start">
          {/* 香港公司年审挂在开户指南下面（用户 10-17 要求），所以和它放在同一栏 */}
          <div className="space-y-3">
            <Card
              href={`/${lang}${GO_GLOBAL}/open-account`}
              title={isZh ? "个人还是公司，怎么开户" : "Individual or company, and opening the account"}
              body={
                isZh
                  ? "大陆个人和香港、美国、英国公司分别能开哪几家，开户每一步要准备什么，注册公司要花多少。"
                  : "Which platforms an individual in China or a Hong Kong, US or UK company can open, what each step asks for, and what a company costs to register."
              }
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/hk-company`}
              title={isZh ? "香港公司每年要做什么" : "A Hong Kong company, year by year"}
              body={isZh ? "周年申报、商业登记、审计报税、公司秘书，一张时间表和每年的最低成本。" : "Annual return, business registration, audit and profits tax, a company secretary, with a calendar and the minimum yearly cost."}
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/company-roles`}
              title={isZh ? "国内、英国、美国三家公司怎么分工" : "A China, UK and US company: who does what"}
              body={
                isZh
                  ? "做 App 时国内版和海外版各挂哪家，美国客户的钱用谁收，三家每年各要报什么，国内公司给英国公司做开发怎么收服务费。"
                  : "Which company publishes the China app and the overseas one, which takes US payments, what each files every year, and how the China company bills the UK one for development."
              }
            />
          </div>
          <Card
            href={`/${lang}${GO_GLOBAL}/payments`}
            title={isZh ? "收款平台选择器" : "Payment platform picker"}
            body={isZh ? "点两下：谁来收钱、卖什么，直接出排名、到手金额和开户步骤。" : "Two clicks give the ranking, what a sale leaves you and the steps to open."}
          />
          <Card
            href={GUARD_REPO}
            external
            title={isZh ? "上线前体检网站：payment-guard" : "Check the site first: payment-guard"}
            body={isZh ? "按各家公开的审核清单逐条查网站，开源，命令行和 Claude Code 都能用。" : "Checks the site line by line against each platform's published list; open source, from the command line or Claude Code."}
          />
        </div>
        <div className={`mt-3 ${BOX} text-sm text-gray-700`}>
          <p className="leading-relaxed">
            <span className="font-medium">{isZh ? "我的推荐：" : "My pick: "}</span>
            {MY_PAYMENT_PICK[l]}
          </p>
          <FromMyPost post={MY_POSTS.stack} lang={l} />
          <div className="mt-3 pt-3 border-t border-gray-200 leading-relaxed">
            <span className="font-medium text-teal-800">
              {isZh ? "双通道实战（Waffo + Dodo Payments）：" : "Dual-gateway setup (Waffo + Dodo Payments): "}
            </span>
            {isZh
              ? "刘小排 2026-11 实测线上同时接 Waffo + Dodo Payments 防单点风控，并谈下 Dodo 专属费率（3.8%~3.9%+$0.40，免国际卡费和订阅费，前 $200 免手续费；卖 $20 跨国订阅仅扣 $1.18，低于香港 Stripe 的 ~$1.79 和 Lemon Squeezy 的 $2.08），原生支持微信支付与 AI 积分计费。"
              : "Liu Xiaopai's Nov 2026 setup runs Waffo + Dodo Payments in parallel for failover, with a negotiated Dodo partner rate (3.8%–3.9%+$0.40, 0% international/subscription fee, first $200 fee-free—taking just $1.18 on a $20 subscription vs ~$1.79 on HK Stripe or $2.08 on Lemon Squeezy), native WeChat Pay, and built-in AI credits billing."}{" "}
            <Link href={`/${lang}/blog/dodo-payments-waffo-ai-saas-fee-comparison`} className="text-blue-600 font-medium hover:underline">
              {isZh ? "看 $20 订阅真实扣费对比 →" : "See the $20 fee breakdown →"}
            </Link>
            {" · "}
            <a href="https://mp.weixin.qq.com/s/uTtP5zv_exiHa52qSa07BA" {...OUT} className="text-blue-600 hover:underline">
              {isZh ? "微信原文" : "WeChat source"}
            </a>
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-gray-200">
          <p className="mb-3 text-sm font-semibold text-gray-900">
            {isZh ? "按市场：买家怎么付钱、要交的税、流量怎么变现" : "By market: how buyers pay, the tax due, earning from traffic"}
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <Card
              href={`/${lang}${GO_GLOBAL}/local-payments`}
              title={isZh ? "各市场的买家怎么付钱" : "How buyers pay, by market"}
              body={
                isZh
                  ? "印尼用电子钱包和 QRIS，荷兰用 iDEAL，韩国走本土卡网络，俄罗斯基本收不了：Stripe、Paddle、Lemon Squeezy、PayPal 各能收哪些、能不能做订阅。"
                  : "E-wallets and QRIS in Indonesia, iDEAL in the Netherlands, domestic card networks in Korea, Russia mostly closed: what Stripe, Paddle, Lemon Squeezy and PayPal can take, and which support subscriptions."
              }
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/digital-tax`}
              title={isZh ? "卖数字产品要交的税" : "Tax on selling digital products"}
              body={
                isZh
                  ? "欧盟和英国从第一笔就要交，日本、韩国、印尼、越南、俄罗斯给境外卖家的规定，美国各州的销售税，以及代收平台替你交了哪些。"
                  : "The EU and UK tax the first sale; the rules for foreign sellers in Japan, Korea, Indonesia, Vietnam and Russia; US state sales tax; and what payment platforms pay for you."
              }
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/ads-affiliate`}
              title={isZh ? "广告和联盟变现" : "Ads and affiliate income"}
              body={
                isZh
                  ? "AdSense 在各市场的限制和中国站长的收款方式，亚马逊、A8.net、Kakao AdFit、Yandex 广告网络收不收境外站长，欧洲流量的同意管理要求。"
                  : "AdSense limits by market and payouts for publishers in China; whether Amazon, A8.net, Kakao AdFit and the Yandex network take foreign publishers; consent rules for European traffic."
              }
            />
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-gray-200">
          <p className="mb-3 text-sm font-semibold text-gray-900">{isZh ? "收到钱以后" : "After the money arrives"}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Card
              href={`/${lang}${GO_GLOBAL}/cash-out`}
              title={isZh ? "出金和报税" : "Cashing out and tax"}
              body={
                isZh
                  ? "我的出金方案，加上每年 5 万美元的结汇额度、境外所得要不要报个税、CRS 会交换什么。"
                  : "My cash-out routes, the yearly FX quota, tax on income from abroad and what CRS exchanges."
              }
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/payment-risk`}
              title={isZh ? "上线以后的风控" : "Payment risk after launch"}
              body={isZh ? "盗刷和卡测试、拒付率、冻结和保证金，各家收款平台的官方规定。" : "Card testing, dispute rates, reserves and frozen payouts, by each platform's rules."}
            />
          </div>
        </div>
      </Step>

      <Step
        n={3}
        title={isZh ? "增长：数据、技术 SEO、外链" : "Grow: data, technical SEO, backlinks"}
        lead={
          isZh
            ? "先按市场定好讨好哪个搜索引擎。没学过 SEO 先补课。然后搭好 SEO 系统、分清必做页面和增长页面，抢在别人之前找新词，看清自己和竞品的数据，用气泡图挑出该改的页面，用 skill 把技术 SEO 查一遍，外链少而精。"
            : "First decide, market by market, which search engine to please. If SEO is new to you, learn it first. Then set up the SEO system and split must-have pages from growth pages, find new terms before others do, read your own and your competitors' data, pick the pages to fix with a bubble chart, run a technical SEO check with a skill, and keep backlinks few and good."
        }
      >
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-gray-900">
            {isZh ? "先按市场：讨好哪个搜索引擎，怎么被收录，被哪些 AI 引用" : "First, by market: which search engine, getting indexed, and which AI cites you"}
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <Card
              href={`/${lang}${GO_GLOBAL}/search-engines`}
              title={isZh ? "先讨好哪个搜索引擎" : "Which search engine first"}
              body={
                isZh
                  ? "美国在 Google 之外还有约 14% 走 Bing 的索引，日本电脑端一半以上用 Bing，韩国先做 Naver，俄罗斯看 Yandex，中国看百度。"
                  : "Beyond Google, about 14% of US search runs on Bing's index; over half of desktop search in Japan is Bing; Korea means Naver, Russia Yandex, China Baidu."
              }
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/indexing`}
              title={isZh ? "站长后台和收录提交" : "Webmaster consoles and indexing"}
              body={
                isZh
                  ? "Google、Bing、Yandex、Naver、百度、Seznam 怎么注册和验证，每天能交多少，IndexNow 覆盖哪几家，各家新出的 AI 引用报告。"
                  : "Signing up and verifying on Google, Bing, Yandex, Naver, Baidu and Seznam, daily submission limits, which engines IndexNow reaches, and the new AI citation reports."
              }
            />
            <Card
              href={`/${lang}${GO_GLOBAL}/ai-assistants`}
              title={isZh ? "各市场的 AI 助手" : "AI assistants by market"}
              body={
                isZh
                  ? "每个市场用哪个 AI、它联网时从哪个索引取资料，robots.txt 里训练用和搜索用的爬虫怎么分开放行。"
                  : "Which AI each market uses, which index it searches, and how to set training and search crawlers separately in robots.txt."
              }
            />
          </div>
        </div>
        <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-white to-emerald-50/70 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {isZh ? "第 1 课互动通关小游戏 · 免费网站医院" : "Course 1 Interactive Game · Free AI Clinic"}
                </span>
                <span className="text-xs font-medium text-emerald-700">
                  {isZh ? "100 分制 · 7 大关卡 · 26 项真实 HTTP 体检" : "100-Pt Rubric · 7 Levels · 26 Live Checks"}
                </span>
              </div>
              <p className="text-base font-bold text-gray-900">
                {isZh
                  ? "🏥 AI 网站急诊室：测测你的网站能不能被 ChatGPT、Claude 和 Google AI 搜到并调用"
                  : "🏥 AI Website Clinic: Can ChatGPT, Claude & Google AI Find, Read, and Call Your Site?"}
              </p>
              <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                {isZh
                  ? "输入域名 3 秒出诊断报告（A~F 等级）：逐关检查 robots.txt、Content-Signal、无 JS 直出可读性、Sitemap、JSON-LD、商业信任、/llms.txt 与 WebMCP，并一键生成喂给 Cursor / Claude Code 的修复药方 Prompt。"
                  : "Enter your domain for a live 0–100 score (Grade A–F) across 7 levels, plus one-click Cursor & Claude Code repair prompts."}
              </p>
            </div>
            <Link
              href={`/${lang}${GO_GLOBAL}/ai-readiness`}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap flex-none"
            >
              {isZh ? "免费挂号闯关 →" : "Run Free Diagnosis →"}
            </Link>
          </div>
        </div>
        <LearnSeo l={l} isZh={isZh} />
        {/* 流派地图、水系模型、工具清单 2026-11-21 起各自一页；卡片保留旧锚点 id，旧链接点进来落在入口上 */}
        <div className="mb-3">
          <p className="mb-3 text-sm font-semibold text-gray-900">
            {isZh ? "SEO 和 GEO 的三份长资料（各自单独一页）" : "Three long reads on SEO and GEO (one page each)"}
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div id="seo-water-model-v8" className="scroll-mt-24">
              <Card
                href={`/${lang}${GO_GLOBAL}/seo-water-model`}
                title={isZh ? "SEO 水系模型：14 个构件按水流排好" : "The SEO water-system model"}
                body={
                  isZh
                    ? "需求、外链和 AI 引用是进水，品牌实体蓄水，技术和内链输水，结果页出水，再回头看数据。v8 的每条规则都来自踩过的坑，新说法单列在待验证里。"
                    : "Demand, links and AI citations flow in, the brand entity stores it, technical work and internal links carry it, the result page lets it out, and the data says what to fix next. Every v8 rule comes from a mistake we made; newer ideas wait in a pending list."
                }
              />
            </div>
            <div id="seo-schools-map" className="scroll-mt-24">
              {SEO_SCHOOLS_MAP.schools.map((s) => (
                <span key={s.id} id={`school-${s.id}`} className="block scroll-mt-24" aria-hidden="true" />
              ))}
              <Card
                href={`/${lang}${GO_GLOBAL}/seo-geo-schools`}
                title={isZh ? "全球 SEO / GEO 六大流派地图" : "Six schools of SEO and GEO"}
                body={
                  isZh
                    ? `${SEO_SCHOOLS_MAP.schools.reduce((n, s) => n + s.people.length, 0)} 位海内外实战派，按站内还是站外、长期还是短期放进四象限：每一派的核心主张、能直接拿来用的做法，以及哪些说法要先核实。`
                    : `${SEO_SCHOOLS_MAP.schools.reduce((n, s) => n + s.people.length, 0)} practitioners placed by on-site vs off-site and long-term vs short-term: each school's core claim, what you can borrow, and which claims to check first.`
                }
              />
            </div>
            <div id="go-global-arsenal-2026" className="scroll-mt-24">
              <span id="ai-growth-data-11" className="block scroll-mt-24" aria-hidden="true" />
              <Card
                href={`/${lang}${GO_GLOBAL}/growth-stack`}
                title={isZh ? "出海全栈工具清单" : "The go-global tool stack"}
                body={
                  isZh
                    ? "6 个环节里主力保留、新补位和淘汰的工具，以及让 AI 帮你做增长决策之前要先配齐的 11 份数据（二虎）。"
                    : "What we keep, add and retire across six stages, plus the 11 data feeds to have in place before asking AI for growth decisions (Erhu)."
                }
              />
            </div>
          </div>
        </div>
        <GeoNewSite l={l} isZh={isZh} />
        <div className="grid gap-3 md:grid-cols-2">
          <PickList title={isZh ? "数据查看" : "Data"} picks={DATA_TOOLS} lang={l} source={MY_POSTS.growth} />
          <PickList title={isZh ? "技术 SEO skill" : "Technical SEO skills"} picks={SEO_SKILLS} lang={l} source={MY_POSTS.growth} />
          <SharedPickList title={isZh ? "SEO 关键词" : "SEO keywords"} picks={KEYWORD_TOOLS} lang={l} />
          <SharedPickList
            title={isZh ? "上线先装的统计" : "Analytics to install at launch"}
            picks={ANALYTICS_BASICS.picks}
            lang={l}
            source={ANALYTICS_BASICS.source}
            tip={ANALYTICS_BASICS.tip}
          />
        </div>
        <div className={`mt-3 ${BOX} text-sm text-gray-700`}>
          <span className="font-medium">{isZh ? "想看全部 SEO skill 与 16 项植错沙盒实测：" : "Every SEO skill & our 16-planted-bug benchmark: "}</span>
          {isZh
            ? "我维护的开源合集，已收 293 个 SEO skill、SEO 数据 MCP 和 GEO 工具，并建了一个埋有 16 处真实 SEO 故障（HTTP 头 noindex、hreflang 指向 404、robots.txt 封锁目录内死链、错误 canonical 等）的 9 页测试站逐一实测——6/13 的工具会出现虚假「PASS」误报，3/13 因死守 robots.txt 漏查被拦截目录。唯一 16/16 全检出且 0 误报的是 aaron-marketing-skills，紧随其后是 squirrelscan（15/16，本地 310+ 规则）与 marketingskills（15/16）。"
            : "the open-source directory I maintain: 293 security-graded SEO skills, SEO data MCP servers and GEO tools, benchmarked against a 9-page test shop with 16 planted bugs (HTTP-header noindex, hreflang→404, broken links behind robots.txt, wrong canonical). 6 of 13 tools hallucinated false 'PASS' claims; only aaron-marketing-skills found 16/16 with 0 false claims, followed by squirrelscan (15/16) and marketingskills (15/16)."}
          <a href={SEO_TOOLS_DIRECTORY.hub} {...OUT} className="ml-1 text-blue-600 font-medium hover:underline">
            {isZh ? "293 个工具榜与 16 项植错横评（每 8 小时更新）→" : "293-Tool Directory & 16-Bug Benchmark →"}
          </a>
          <span className="mx-1 text-gray-400">·</span>
          <TrackedLink href={SEO_TOOLS_DIRECTORY.repo} {...OUT} className="text-blue-600 hover:underline">
            GitHub
          </TrackedLink>
        </div>
        <PageTuning l={l} isZh={isZh} />
        <Backlinks lang={lang} l={l} isZh={isZh} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Card
            href={`/${lang}${GO_GLOBAL}/channels`}
            title={isZh ? "SEO 以外的获客渠道" : "Channels beyond SEO"}
            body={
              isZh
                ? "Product Hunt、Hacker News、Reddit、X、AI 工具目录站、邮件订阅、联盟分佣和付费广告：每个平台的官方规则和新手最容易踩的坑。"
                : "Product Hunt, Hacker News, Reddit, X, AI tool directories, email, affiliates and paid ads: each platform's own rules and the usual beginner mistakes."
            }
          />
          <Card
            href={`/${lang}${GO_GLOBAL}/local-channels`}
            title={isZh ? "各市场的本地推广渠道" : "Local channels by market"}
            body={
              isZh
                ? "日本的 X 和 Qiita、韩国的 KakaoTalk 和 GeekNews、越南的 Zalo、俄罗斯的 VK 和 Habr、中国的公众号和 V2EX：用户量、官方号要不要当地执照、能不能发推广。"
                : "X and Qiita in Japan, KakaoTalk and GeekNews in Korea, Zalo in Vietnam, VK and Habr in Russia, WeChat and V2EX in China: audience size, whether official accounts need a local licence, and what you may promote."
            }
          />
        </div>
        <PostLinks slugs={["two-seo-audit-skills-comparison", "sitin-going-global-research-tools"]} lang={lang} />
      </Step>

      <Step
        n={4}
        title={isZh ? "每周看数据：出海选品周报" : "Every week: the new-seller weekly"}
        lead={
          isZh
            ? "每周一更新：8 家收款平台（Stripe、Lemon Squeezy、Paddle、Polar、Gumroad、Creem、Dodo Payments、Waffo）上新挂出收款链接的网站，大家在卖什么，谁加了第二家收款做双通道防封，哪些需求还没人做。"
            : "Every Monday: the sites that started taking payments across 8 gateways (Stripe, Lemon Squeezy, Paddle, Polar, Gumroad, Creem, Dodo Payments, Waffo), what they sell, who added a 2nd failover gateway, and which demand nobody serves yet."
        }
      >
        <Weekly lang={lang} isZh={isZh} />
      </Step>

      <Faq lang={lang} isZh={isZh} />

      <div className="mb-10">
        <Community lang={lang} tips={false} />
        <p className="mt-2 text-sm">
          <Link href={`/${lang}${GO_GLOBAL}/payments#community`} className="text-blue-600 hover:underline">
            {isZh ? "社群总结的 7 条选型要点 →" : "The community's seven rules of thumb →"}
          </Link>
        </p>
      </div>

      <Guides lang={lang} isZh={isZh} />

      <SubscribeForm source="go-global" lang={lang} dict={dict} />
    </div>
  );
}
