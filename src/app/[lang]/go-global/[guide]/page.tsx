import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/Link";
import SubscribeForm from "@/components/SubscribeForm";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { GO_GLOBAL, groupPosts, postTitle } from "@/lib/go-global";
import { GUIDES, guideBySlug, type GuideItem, type GuideMine, type GuideSection } from "@/lib/go-global-guides";
import { withSocialCards } from "@/lib/social";
import GoGlobalBreadcrumb from "../Breadcrumb";

const SITE_URL = "https://jasonzhu.ai";
const OUT = { target: "_blank", rel: "noopener noreferrer" } as const;

// 指南页：内容在 src/lib/guides/*.ts，这里只负责排版。只有中文，en 页 canonical 指回 zh。
export const dynamicParams = false;

export async function generateStaticParams() {
  return GUIDES.flatMap((g) => [
    { lang: "zh", guide: g.slug },
    { lang: "en", guide: g.slug },
  ]);
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; guide: string }> }): Promise<Metadata> {
  const { lang: rawLang, guide: slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};
  return withSocialCards({
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/zh${GO_GLOBAL}/${guide.slug}` },
  }, rawLang);
}

function Sources({ item }: { item: GuideItem }) {
  if (!item.sources?.length) return null;
  return (
    <span className="ml-1 text-xs text-gray-400">
      {item.sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && "、"}
          <a href={s.url} {...OUT} className="text-blue-600 hover:underline">
            {s.label}
          </a>
        </span>
      ))}
    </span>
  );
}

function Items({ items }: { items: GuideItem[] }) {
  return (
    <ul className="space-y-2 text-sm text-gray-700 leading-relaxed list-disc pl-5">
      {items.map((item) => (
        <li key={item.text}>
          {item.text}
          <Sources item={item} />
        </li>
      ))}
    </ul>
  );
}

/** 站内链接在数据里写成 /blog/... 这样的路径，这里加上语言前缀 */
function MineLink({ link, lang }: { link: { label: string; url: string }; lang: Locale }) {
  if (link.url.startsWith("/")) {
    return (
      <Link href={`/${lang}${link.url}`} className="text-blue-600 hover:underline">
        {link.label} →
      </Link>
    );
  }
  return (
    <a href={link.url} {...OUT} className="text-blue-600 hover:underline">
      {link.label} →
    </a>
  );
}

function Mine({ mine, lang }: { mine: GuideMine; lang: Locale }) {
  return (
    <section className="mb-10 rounded-2xl bg-amber-50/60 border border-amber-100 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-1.5">{mine.title}</h2>
      {mine.lead && <p className="text-sm text-gray-600 mb-3 leading-relaxed">{mine.lead}</p>}
      <ul className="space-y-2 text-sm text-gray-700 leading-relaxed list-disc pl-5">
        {mine.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm flex flex-wrap gap-x-4 gap-y-1">
        {mine.links.map((l) => (
          <MineLink key={l.url} link={l} lang={lang} />
        ))}
      </p>
    </section>
  );
}

function Section({ section }: { section: GuideSection }) {
  return (
    <section id={section.id} className="mb-10 scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h2>
      {section.lead && <p className="text-sm text-gray-600 leading-relaxed mb-3">{section.lead}</p>}
      <Items items={section.items} />
    </section>
  );
}

function RelatedPosts({ slugs, lang }: { slugs?: string[]; lang: Locale }) {
  const posts = slugs ? groupPosts({ id: "guide", zh: "", en: "", slugs }) : [];
  if (!posts.length) return null;
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-gray-900 mb-2">相关文章</h2>
      <ul className="space-y-1.5 text-sm">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/${lang}/blog/${p.slug}`} className="text-blue-600 hover:underline">
              {postTitle(p, lang)}
            </Link>
            <span className="ml-2 text-xs text-gray-400">{p.date}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function GuidePage({ params }: { params: Promise<{ lang: string; guide: string }> }) {
  const { lang: rawLang, guide: slug } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const guide = guideBySlug(slug);
  if (!guide) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <GoGlobalBreadcrumb lang={lang} here={guide.short} path={`/${guide.slug}`} />
      <header className="mb-8">
        <p className="text-sm font-medium text-blue-600 mb-2">出海专题</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{guide.title}</h1>
        <p className="text-gray-600 leading-relaxed">{guide.intro}</p>
        <p className="mt-3 text-xs text-gray-400">
          按官方页面整理，核实于 {guide.checked}。规则会变，办事前以链接里的官方最新页面为准。
          {lang === "en" && " This guide is in Chinese."}
        </p>
      </header>
      {guide.mine && <Mine mine={guide.mine} lang={lang} />}
      {guide.warning && (
        <p className="mb-10 rounded-2xl border border-red-100 bg-red-50/60 p-4 text-sm text-gray-700 leading-relaxed">
          ⚠️ {guide.warning.text}
          <Sources item={guide.warning} />
        </p>
      )}
      {guide.sections.map((s) => (
        <Section key={s.id} section={s} />
      ))}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">新手最容易踩的坑</h2>
        <Items items={guide.pitfalls} />
      </section>
      {guide.unknowns.length > 0 && (
        <section className="mb-10 rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-2">官方没说清、我们也没查到的</h2>
          <ul className="space-y-1.5 text-sm text-gray-600 leading-relaxed list-disc pl-5">
            {guide.unknowns.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </section>
      )}
      <RelatedPosts slugs={guide.posts} lang={lang} />
      <p className="mb-8 text-sm">
        <Link href={`/${lang}${GO_GLOBAL}`} className="text-blue-600 hover:underline">
          ← 回到出海专题
        </Link>
      </p>
      <SubscribeForm source="go-global" lang={lang} dict={dict} />
    </div>
  );
}
