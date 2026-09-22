import { cookies, headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { RAW_MOMENTS } from "@/data/moments";
import { defaultLocale, isValidLocale, Locale } from "@/i18n/config";

interface NeutralMomentPageProps {
  params: Promise<{
    slug: string;
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

export default async function NeutralMomentPage({
  params,
}: NeutralMomentPageProps) {
  const { slug } = await params;

  // 1. Check if moment exists and is published
  const rawMoment = RAW_MOMENTS.find((m) => m.slug === slug);
  if (!rawMoment || rawMoment.status !== "published") {
    notFound();
  }

  // 2. Detect preferred language:
  //    a) Previously chosen user language (cookie NEXT_LOCALE)
  //    b) Browser language (Accept-Language header with q-factors)
  //    c) Fallback: French (fr)
  let targetLocale: Locale = defaultLocale;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  if (cookieLocale && isValidLocale(cookieLocale)) {
    targetLocale = cookieLocale as Locale;
  } else {
    const headerList = await headers();
    targetLocale = getPreferredLanguage(headerList.get("accept-language"));
  }

  // 3. Perform temporary (307) redirect to preserve dynamic locale negotiation
  redirect(`/${targetLocale}/moments/${slug}`);
}
