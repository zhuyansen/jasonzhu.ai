import { NextRequest, NextResponse } from "next/server";

const locales = ["zh", "en"];
const defaultLocale = "zh";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip admin routes
  if (pathname.startsWith("/admin")) return NextResponse.next();

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Pass the detected locale to the root layout via a request header
    const locale = locales.find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
    ) || defaultLocale;
    const response = NextResponse.next();
    response.headers.set("x-locale", locale);
    return response;
  }

  // Rewrite (not redirect) to default locale — avoids flash/flicker
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set("x-locale", defaultLocale);
  return response;
}

export const config = {
  // Only match page routes, skip all static files and API
  matcher: ["/((?!_next|api|favicon\\.ico|handbook\\.pdf|.*\\..*).*)" ],
};
