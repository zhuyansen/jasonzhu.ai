import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * 全站统一用这个 Link，默认不预加载（prefetch={false}），点击时才加载目标页。
 *
 * 2026-10-07 事故：next/link 默认预加载视口内每个链接，每个页面的导航 / 页脚 + 提示词库每张卡片都会发请求，
 * 加上爬虫，Vercel 免费版的 Edge Requests 一个月用到 440 万次（额度 100 万），整站被停用（402 DEPLOYMENT_DISABLED）。
 * 确实需要预加载的个别链接可以显式写 prefetch。
 */
export default function Link({ prefetch = false, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...props} />;
}
