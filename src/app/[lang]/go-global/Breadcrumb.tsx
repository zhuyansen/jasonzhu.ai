import Link from "@/components/Link";
import { GO_GLOBAL } from "@/lib/go-global";

const SITE_URL = "https://jasonzhu.ai";

/** 出海专题各页的面包屑（含 BreadcrumbList JSON-LD）：首页 / 出海专题 /（上一级）/ 当前页 */
export default function GoGlobalBreadcrumb({
  lang,
  here,
  path,
  parent,
}: {
  lang: string;
  here?: string;
  path?: string;
  parent?: { name: string; path: string };
}) {
  const isZh = lang !== "en";
  const items = [
    { name: isZh ? "首页" : "Home", href: `/${lang}` },
    { name: isZh ? "出海专题" : "Going global", href: `/${lang}${GO_GLOBAL}` },
    ...(parent ? [{ name: parent.name, href: `/${lang}${GO_GLOBAL}${parent.path}` }] : []),
    ...(here && path ? [{ name: here, href: `/${lang}${GO_GLOBAL}${path}` }] : []),
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `${SITE_URL}${item.href}` })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-400">
        <ol className="flex items-center gap-1 flex-wrap">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === items.length - 1 ? (
                <span className="text-gray-600">{item.name}</span>
              ) : (
                <Link href={item.href} className="hover:text-gray-600">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
