import { NextRequest, NextResponse } from "next/server";
import { getMomentByQrId } from "@/data/moments";
import { defaultLocale, isValidLocale, Locale } from "@/i18n/config";

interface QrRouteContext {
  params: Promise<{
    id: string;
  }>;
}

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

export async function GET(request: NextRequest, { params }: QrRouteContext) {
  const { id } = await params;

  // 1. Strictly look up moment by permanent qrId ("AH001")
  // Allows published and archived stories (archived ≠ deleted)
  const moment = getMomentByQrId(id);

  if (!moment) {
    return new NextResponse("Story Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  // 2. Resolve preferred locale:
  //    1) Stored user cookie (NEXT_LOCALE)
  //    2) Accept-Language header
  //    3) defaultLocale fallback ("fr")
  let targetLocale: Locale = defaultLocale;

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    targetLocale = cookieLocale as Locale;
  } else {
    targetLocale = getPreferredLanguage(request.headers.get("accept-language"));
  }

  // 3. Issue 307 Temporary Redirect to the canonical localized story URL
  const destinationUrl = new URL(
    `/${targetLocale}/moments/${moment.slug}`,
    request.url
  );

  return NextResponse.redirect(destinationUrl, 307);
}
