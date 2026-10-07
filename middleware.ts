import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const locales = ["zh", "en"];
const defaultLocale = "zh";

// 只有会员相关路径才需要在 middleware 里刷新 Supabase session（多一次网络请求）。
// 博客/快讯/首页等公开内容页完全不碰 Supabase，避免拖慢全站每次导航。
function needsAuthRefresh(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth/") ||
    /\/(dashboard|login)(\/|$)/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authRefresh = needsAuthRefresh(pathname)
    ? (response: NextResponse) => refreshSupabaseSession(request, response)
    : (response: NextResponse) => response;

  // Skip admin routes and auth callback（不走 i18n 前缀重写）
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth/")) {
    return authRefresh(NextResponse.next({ request }));
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // 带语言前缀：只有会员中心 / 登录页会匹配到这里（见 matcher），刷新 session 即可
    return authRefresh(NextResponse.next({ request }));
  }

  // Rewrite (not redirect) to default locale — avoids flash/flicker
  // pathname === "/" 时不能拼成 "/zh/"（带尾斜杠），内部 rewrite 不会像真实请求
  // 那样触发 trailingSlash 308 归一化，会直接 404
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return authRefresh(NextResponse.rewrite(url));
}

/** 刷新 Supabase auth session cookie，让 Server Component 读到最新登录态 */
async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // 只在需要它的路径上运行（2026-10-07 起）：以前匹配全部页面，每次访问都多一次函数调用，
  // 叠加链接预加载和爬虫，把 Vercel 免费版额度用光、整站被停用。带 /zh、/en 前缀的公开页面这里什么都不用做。
  matcher: [
    "/", // 首页 → rewrite 到 /zh
    "/admin/:path*",
    "/auth/:path*",
    "/(zh|en)/dashboard/:path*", // 会员中心：刷新 Supabase session
    "/(zh|en)/login",
    // 不带语言前缀的旧链接（/blog/xxx）→ rewrite 到 /zh/...；跳过 /zh /en 开头、静态文件和 API
    "/((?!zh\\b|en\\b|_next|api|admin|auth|favicon\\.ico|handbook\\.pdf|.*\\..*).*)",
  ],
};
