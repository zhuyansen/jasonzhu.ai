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

  if (pathnameHasLocale) return NextResponse.next();

  // Rewrite (not redirect) to default locale — avoids flash/flicker
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Only match page routes, skip all static files and API
  matcher: ["/((?!_next|api|favicon\\.ico|handbook\\.pdf|.*\\..*).*)" ],
};
