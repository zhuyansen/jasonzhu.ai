import type { Metadata } from "next";
import Link from "@/components/Link";
import SubscribeForm from "@/components/SubscribeForm";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import {
  BACKLINK_SOURCES,
  BEGINNER_EXTRAS,
  BEGINNER_VIDEOS,
  CLOUDFLARE_STACK,
  DATA_TOOLS,
  GO_GLOBAL,
  MY_PAYMENT_PICK,
  MY_POSTS,
  NEWBIE_FAQ,
  NEW_TERM_RADAR,
  POST_GROUPS,
  SEO_SKILLS,
  STACK,
  groupPosts,
  postTitle,
  type Pick,
} from "@/lib/go-global";
import { faqJsonLd } from "@/lib/faq";
import { getWeeklyIssues } from "@/lib/mdx";
import { GUARD_REPO } from "@/lib/payment-guard-types";
import GoGlobalBreadcrumb from "./Breadcrumb";
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

const OUT = { target: "_blank", rel: "noopener noreferrer" } as const;
// 每一步是一块浅灰底的面板，面板里的卡片是白底，分区一眼能看出来（用户 10-17 要求「界限分明」）
const PANEL = "mb-10 scroll-mt-24 rounded-3xl border border-gray-200 bg-gray-100/60 p-5 md:p-6";
const BOX = "rounded-2xl border border-gray-200 bg-white p-4";
const CARD = "block rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/40 transition-colors";

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
    <a href={href} {...OUT} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

type PostRef = { url: string; date: string; title: { zh: string; en: string } };

function PickList({ title, picks, lang, source }: { title: string; picks: Pick[]; lang: "zh" | "en"; source?: PostRef }) {
  return (
    <div className={BOX}>
      <p className="text-sm font-semibold text-gray-900 mb-2">{title}</p>
      <ul className="space-y-1.5 text-sm text-gray-700">
        {picks.map((p) => (
          <li key={p.name}>
            <a
              href={p.url}
              target="_blank"
              rel={p.referral ? "sponsored noopener noreferrer" : "noopener noreferrer"}
              className="font-medium text-blue-600 hover:underline"
            >
              {p.name}
            </a>
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

function FromMyPost({ post, lang }: { post: PostRef; lang: "zh" | "en" }) {
  return (
    <p className="mt-3 text-xs text-gray-400">
      {lang === "zh" ? "出自我的帖子" : "From my post"}{" "}
      <a href={post.url} {...OUT} className="text-blue-600 hover:underline">
        「{post.title[lang]}」
      </a>{" "}
      {post.date}
    </p>
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
          ? `刚开始做出海，先看这几样：${c.host}（YouTube「${c.name}」）回答读者提问的两期 AMA（第一期还有一位搭档一起答），一个从零做出并上线 AI 应用的教程，和一份工具清单。`
          : `Start with these: two AMA episodes in which ${c.host} (YouTube channel "${c.name}") answers readers' questions, joined by a co-host in the first, a tutorial that builds and launches an AI app from zero, and a tool list. In Chinese.`}{" "}
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

// 增长这一步的总框架：Jason 的「SEO 水系模型」v4（2026-07-24 的帖子）。只转述框架；帖子里付费客座那条不写进页面（10-06 已停买 dofollow 外链）。
function SeoSystem({ l, isZh }: { l: "zh" | "en"; isZh: boolean }) {
  return (
    <div className={`${BOX} mb-3`}>
      <p className="text-sm font-semibold text-gray-900 mb-1">{isZh ? "SEO 系统：水系模型 v4" : "The SEO system: a water model, v4"}</p>
      <p className="text-sm text-gray-600 leading-relaxed">
        {isZh
          ? "把 SEO 当成一套水系来搭。进水口有三个：传统的外链权威（免费目录只管收录、不传权重，别堆量），被 AI 引用（被提及比被链接更重要），Toolify、Product Hunt 这类平台的收录。效果也要分层看：GSC 和 GA 里的点击只是冰山一角，我实测 AI 引用量是 AI 点击量的 9 倍，被引用却没被点击的那部分，用 Bing 的 AI Performance 和 Clarity 的引用报告补上，都免费。"
          : "Build SEO as a water system with three inflows: classic link authority (free directories get you indexed but pass no weight, so do not pile them up), citations by AI (being mentioned matters more than being linked), and listings on platforms such as Toolify and Product Hunt. Measure in layers too: clicks in GSC and GA are the tip of the iceberg. I counted nine AI citations for every AI click, and the free Bing AI Performance and Clarity citation reports show the citations that never become clicks."}
      </p>
      <FromMyPost post={MY_POSTS.seoSystem} lang={l} />
    </div>
  );
}

function Backlinks({ lang, l, isZh }: { lang: string; l: "zh" | "en"; isZh: boolean }) {
  return (
    <div className="grid gap-3 md:grid-cols-3 mt-4">
      <div className={BOX}>
        <p className="text-sm font-semibold text-gray-900 mb-1">{isZh ? "找新词：new-term-radar" : "New terms: new-term-radar"}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {isZh
            ? "每天从 X、Hugging Face、GitHub 和竞品的 sitemap 里抓刚冒出来的新模型、新产品名，赶在关键词工具收录之前，再排出值得做的关键词。开源，命令行、Agent Skill 和 MCP 都能用，要一个 AIsa 的 key。"
            : "Every day it catches the names of new models and products on X, Hugging Face, GitHub and competitors' sitemaps, before keyword tools list them, and ranks the keywords worth a page. Open source, from the command line, an Agent Skill or MCP; it needs an AIsa key."}
        </p>
        <a href={NEW_TERM_RADAR} {...OUT} className="text-sm text-blue-600 hover:underline">
          GitHub →
        </a>
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
        <p className="text-sm font-semibold text-gray-900 mb-1">{isZh ? "外链检测：backlink-guard" : "Backlink check: backlink-guard"}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {isZh
            ? "提交外链之前先查这个站值不值得发：卖链接的、站群、被 Google 降权的站直接跳过，结论附证据。开源，命令行和 Claude Code 都能用。"
            : "Check a site before you submit to it: link sellers, site networks and sites Google demoted are skipped, with the evidence. Open source, from the command line or Claude Code."}
        </p>
        <p className="text-sm flex flex-wrap gap-x-4 gap-y-1">
          <a href={BACKLINK_GUARD} {...OUT} className="text-blue-600 hover:underline">
            GitHub →
          </a>
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
                  <a href={f.link.href} {...OUT} className="text-blue-600 hover:underline">
                    {isZh ? f.link.zh : f.link.en}
                  </a>
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
        <div className="mt-3">
          <Card
            href={`/${lang}${GO_GLOBAL}/extensions`}
            title={isZh ? "不做网站：插件、App 和 MCP 怎么上架" : "Not a website: shipping extensions, apps and MCP (in Chinese)"}
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
              title={isZh ? "香港公司每年要做什么" : "A Hong Kong company, year by year (in Chinese)"}
              body={isZh ? "周年申报、商业登记、审计报税、公司秘书，一张时间表和每年的最低成本。" : "Annual return, business registration, audit and profits tax, a company secretary, with a calendar and the minimum yearly cost."}
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
          <span className="font-medium">{isZh ? "我的推荐：" : "My pick: "}</span>
          {MY_PAYMENT_PICK[l]}
          <FromMyPost post={MY_POSTS.stack} lang={l} />
        </div>
        <div className="mt-6 pt-5 border-t border-gray-200">
          <p className="mb-3 text-sm font-semibold text-gray-900">{isZh ? "收到钱以后" : "After the money arrives (in Chinese)"}</p>
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
            ? "抢在别人之前找到新词，看清自己和竞品的数据，用 skill 把技术 SEO 查一遍，外链少而精。"
            : "Find new terms before others do, read your own and your competitors' data, run a technical SEO check with a skill, and keep backlinks few and good."
        }
      >
        <SeoSystem l={l} isZh={isZh} />
        <div className="grid gap-3 md:grid-cols-2">
          <PickList title={isZh ? "数据查看" : "Data"} picks={DATA_TOOLS} lang={l} source={MY_POSTS.growth} />
          <PickList title={isZh ? "技术 SEO skill" : "Technical SEO skills"} picks={SEO_SKILLS} lang={l} source={MY_POSTS.growth} />
        </div>
        <Backlinks lang={lang} l={l} isZh={isZh} />
        <div className="mt-3">
          <Card
            href={`/${lang}${GO_GLOBAL}/channels`}
            title={isZh ? "SEO 以外的获客渠道" : "Channels beyond SEO (in Chinese)"}
            body={
              isZh
                ? "Product Hunt、Hacker News、Reddit、X、AI 工具目录站、邮件订阅、联盟分佣和付费广告：每个平台的官方规则和新手最容易踩的坑。"
                : "Product Hunt, Hacker News, Reddit, X, AI tool directories, email, affiliates and paid ads: each platform's own rules and the usual beginner mistakes."
            }
          />
        </div>
        <PostLinks slugs={["two-seo-audit-skills-comparison", "sitin-going-global-research-tools"]} lang={lang} />
      </Step>

      <Step
        n={4}
        title={isZh ? "每周看数据：出海选品周报" : "Every week: the new-seller weekly (in Chinese)"}
        lead={
          isZh
            ? "每周一更新：7 家收款平台上新挂出收款链接的网站，大家在卖什么，什么起量了，哪些需求还没人做。"
            : "Every Monday: the sites that started taking payments on seven platforms, what they sell, what is taking off, and which demand nobody serves yet."
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
