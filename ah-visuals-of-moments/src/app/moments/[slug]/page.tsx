import { cookies, headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { RAW_MOMENTS } from "@/data/moments";
import { defaultLocale, isValidLocale, Locale } from "@/i18n/config";

interface NeutralMomentPageProps {
  params: Promise<{
    slug: string;
  }>;
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
  //    b) Browser language (Accept-Language header)
  //    c) Fallback: English (en)
  let targetLocale: Locale = defaultLocale;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  if (cookieLocale && isValidLocale(cookieLocale)) {
    targetLocale = cookieLocale as Locale;
  } else {
    const headerList = await headers();
    const acceptLanguage = headerList.get("accept-language");
    if (acceptLanguage && acceptLanguage.toLowerCase().includes("ru")) {
      targetLocale = "ru";
    }
  }

  // 3. Redirect to localized route without creating redirect loop
  redirect(`/${targetLocale}/moments/${slug}`);
}
