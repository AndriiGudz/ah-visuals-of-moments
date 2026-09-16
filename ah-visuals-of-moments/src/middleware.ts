import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, Locale } from "@/i18n/config";

const SESSION_COOKIE_NAME = "ah_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Administrative API security guard (/api/admin and /api/admin/*)
  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    // Allow public login endpoint
    if (pathname === "/api/admin/auth/login") {
      return NextResponse.next();
    }
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Требуется авторизация администратора" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 2. Administrative UI routes isolation and access control (/admin and /admin/*)
  // Completely bypass locale detection, rewrite and redirect!
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLoginPage = pathname === "/admin/login";
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    // If attempting to access admin page without session cookie, redirect to /admin/login
    if (!sessionCookie && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If already logged in and visiting login page, redirect to /admin
    if (sessionCookie && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // 3. Ignore internal assets, static files, favicon, public images, and brand images
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

  // 4. Check if pathname already starts with a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale || pathname.startsWith("/moments/")) {
    return NextResponse.next();
  }

  // 5. Detect preferred locale from cookie or Accept-Language header
  let targetLocale: Locale = defaultLocale;

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    targetLocale = cookieLocale as Locale;
  } else {
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage && acceptLanguage.toLowerCase().includes("ru")) {
      targetLocale = "ru";
    }
  }

  // Build redirect URL for public routes
  const targetPath = pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  const redirectUrl = new URL(`/${targetLocale}${targetPath}`, request.url);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.).*)"],
};
