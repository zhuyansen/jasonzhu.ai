import { notFound } from "next/navigation";

/**
 * 兜底路由：所有没匹配到具体页面的 /zh/xxx、/en/xxx 都落到这里，
 * 调用 notFound() 渲染 [lang]/not-found.tsx（带站点 Header/Footer）。
 * 没有它，未知 URL 会跳过 [lang] 布局，显示 Next 默认的英文 404 白板。
 */
export function generateStaticParams() {
  return [];
}

export default function CatchAll() {
  notFound();
}
