import { Locale, locales } from "@/i18n/config";

export function getLocalizedUrl(pathname: string, locale: Locale): string {
  if (!pathname || pathname === "/") {
    return `/${locale}`;
  }

  // Remove trailing slashes (except root)
  const cleanPath = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  // Split path parts
  const segments = cleanPath.split("/").filter(Boolean);

  // Check if first segment is a supported locale
  if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  // Otherwise prepend locale
  return `/${locale}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}
