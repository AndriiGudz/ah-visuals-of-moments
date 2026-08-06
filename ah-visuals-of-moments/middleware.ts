import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, Locale } from "@/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore internal assets, static files, favicon, public images, and brand images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check if pathname already starts with a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale || pathname.startsWith("/moments/")) {
    return NextResponse.next();
  }

  // Detect preferred locale from cookie or Accept-Language header
  let targetLocale: Locale = defaultLocale;

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    targetLocale = cookieLocale as Locale;
  } else {
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) {
      if (acceptLanguage.toLowerCase().includes("ru")) {
        targetLocale = "ru";
      }
    }
  }

  // Build redirect URL
  const targetPath = pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  const redirectUrl = new URL(`/${targetLocale}${targetPath}`, request.url);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.).*)"],
};
