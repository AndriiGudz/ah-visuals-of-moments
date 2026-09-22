import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, Locale, isValidLocale } from "@/i18n/config";

const SESSION_COOKIE_NAME = "ah_admin_session";

/**
 * Parses the Accept-Language header according to q-weights and maps to supported locales.
 * Order of language matching:
 * fr* -> fr
 * en* -> en
 * uk* -> uk
 * ru* -> ru
 * any other / none -> fr (default/fallback)
 */
function getPreferredLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const entries = acceptLanguage.split(",").map((part) => {
    const [lang, qPart] = part.trim().split(";");
    let q = 1.0;
    if (qPart && qPart.trim().startsWith("q=")) {
      const parsedQ = parseFloat(qPart.trim().slice(2));
      if (!isNaN(parsedQ)) q = parsedQ;
    }
    return { lang: lang.toLowerCase().trim(), q };
  });

  entries.sort((a, b) => b.q - a.q);

  for (const entry of entries) {
    const primaryTag = entry.lang.split("-")[0];
    if (primaryTag === "fr") return "fr";
    if (primaryTag === "en") return "en";
    if (primaryTag === "uk") return "uk";
    if (primaryTag === "ru") return "ru";
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Administrative API security guard (/api/admin and /api/admin/*)
  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
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

    if (!sessionCookie && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (sessionCookie && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // 3. Ignore internal assets, static files, favicon, manifest, robots, sitemap
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // 4. Preserve neutral permanent QR code route (/moments and /moments/*)
  // Controlled temporary redirect logic is executed inside app/moments/[slug]/page.tsx
  if (pathname.startsWith("/moments/")) {
    return NextResponse.next();
  }

  // 5. Check if pathname already starts with a supported explicit locale
  const matchedLocale = locales.find(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  if (matchedLocale) {
    // Explicit localized URL has 100% priority.
    // Forward x-locale header to downstream layouts and components.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", matchedLocale);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 6. Language negotiation for root URL and unlocalized routes
  // Priority:
  // 1) NEXT_LOCALE cookie (manual user choice)
  // 2) Accept-Language header
  // 3) defaultLocale fallback ("fr")
  let targetLocale: Locale = defaultLocale;

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    targetLocale = cookieLocale as Locale;
  } else {
    targetLocale = getPreferredLanguage(request.headers.get("accept-language"));
  }

  const targetPath =
    pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  const redirectUrl = new URL(`/${targetLocale}${targetPath}`, request.url);

  // Use 307 Temporary Redirect so browsers and CDNs never permanently cache language targets
  return NextResponse.redirect(redirectUrl, 307);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)"],
};
