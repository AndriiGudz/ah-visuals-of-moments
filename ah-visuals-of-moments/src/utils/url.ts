import { Locale, locales } from "@/i18n/config";
import { SITE_URL } from "@/config/site";

/**
 * Returns a localized URL by switching or prepending the target locale.
 * Preserves nested path segments and query strings if present.
 */
export function getLocalizedUrl(pathname: string, locale: Locale): string {
  if (!pathname || pathname === "/") {
    return `/${locale}`;
  }

  // Preserve query string if attached to pathname
  const [pathOnly, search] = pathname.split("?");
  const querySuffix = search ? `?${search}` : "";

  // Remove trailing slashes (except root)
  const cleanPath =
    pathOnly.length > 1 && pathOnly.endsWith("/")
      ? pathOnly.slice(0, -1)
      : pathOnly;

  // Split path parts
  const segments = cleanPath.split("/").filter(Boolean);

  // Check if first segment is a supported locale
  if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    segments[0] = locale;
    return `/${segments.join("/")}${querySuffix}`;
  }

  // Otherwise prepend locale
  return `/${locale}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}${querySuffix}`;
}

/**
 * Strips any leading locale segment from a pathname to get the neutral sub-path.
 * Example: "/fr/about" -> "/about", "/en" -> ""
 */
export function getNeutralPath(pathname: string): string {
  if (!pathname || pathname === "/") return "";
  const [pathOnly] = pathname.split("?");
  const clean = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const segments = clean.split("/").filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join("/")}` : "";
}

/**
 * Generates the official SEO alternates map for hreflang markup and sitemaps.
 * Strict rules:
 * - "fr-FR" -> /fr/...
 * - "en" -> /en/...
 * - "uk" -> /uk/...
 * - "ru" -> /ru/...
 * - "x-default" -> /fr/...
 */
export function getAlternateLanguages(neutralPath: string = ""): Record<string, string> {
  const clean = neutralPath
    ? neutralPath.startsWith("/")
      ? neutralPath
      : `/${neutralPath}`
    : "";

  return {
    "fr-FR": `${SITE_URL}/fr${clean}`,
    en: `${SITE_URL}/en${clean}`,
    uk: `${SITE_URL}/uk${clean}`,
    ru: `${SITE_URL}/ru${clean}`,
    "x-default": `${SITE_URL}/fr${clean}`,
  };
}

/**
 * Sets the persistent NEXT_LOCALE cookie in the browser.
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document !== "undefined") {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }
}
