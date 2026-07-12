import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const locales = ["zh", "en"];
const defaultLocale = "zh";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip admin routes and auth callback（不走 i18n 前缀重写）
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth/")) {
    return refreshSupabaseSession(request, NextResponse.next({ request }));
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Pass the detected locale to the root layout via a request header
    const locale = locales.find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
    ) || defaultLocale;
    const response = NextResponse.next({ request });
    response.headers.set("x-locale", locale);
    return refreshSupabaseSession(request, response);
  }

  // Rewrite (not redirect) to default locale — avoids flash/flicker
  // pathname === "/" 时不能拼成 "/zh/"（带尾斜杠），内部 rewrite 不会像真实请求
  // 那样触发 trailingSlash 308 归一化，会直接 404
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set("x-locale", defaultLocale);
  return refreshSupabaseSession(request, response);
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
  // Only match page routes, skip all static files and API
  matcher: ["/((?!_next|api|favicon\\.ico|handbook\\.pdf|.*\\..*).*)"],
};
