import { Suspense } from "react";
import NotFoundContent, { NotFoundByPath } from "./NotFoundContent";

/**
 * 段内 notFound() 的兜底 UI。注意：根布局是动态段 [lang]，Next 对 notFound() 只能客户端渲染
 * 404（HTML body 为空，vercel/next.js#62228），所以真正的 404 走 app/global-not-found.tsx：
 * 未匹配 URL + dynamicParams=false 拒绝的未知参数都由它完整 SSR。这里几乎不会被命中，仅作保险。
 */
export default function NotFound() {
  return (
    <Suspense fallback={<NotFoundContent lang="zh" />}>
      <NotFoundByPath />
    </Suspense>
  );
}
