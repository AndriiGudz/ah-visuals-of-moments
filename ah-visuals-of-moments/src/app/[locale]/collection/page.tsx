import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { getPublishedMoments } from "@/data/moments";
import { SITE_URL, ROBOTS_METADATA } from "@/config/site";
import MomentGrid from "@/components/MomentGrid";

interface CollectionPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = getDictionary(locale as Locale);

  return {
    title: dict.collection.title,
    description: dict.collection.description,
    robots: ROBOTS_METADATA,
    alternates: {
      canonical: `${SITE_URL}/${locale}/collection`,
      languages: {
        en: `${SITE_URL}/en/collection`,
        ru: `${SITE_URL}/ru/collection`,
      },
    },
    openGraph: {
      title: `${dict.collection.title} | AH Visuals of Moments`,
      description: dict.collection.description,
      url: `${SITE_URL}/${locale}/collection`,
      type: "website",
    },
  };
}

export default async function CollectionPage({
  params,
}: CollectionPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dictionary = getDictionary(typedLocale);
  const publishedMoments = getPublishedMoments(typedLocale);

  return (
    <div className="space-y-10 py-6">
      <header className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-[var(--text-primary)]">
          {dictionary.collection.title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl">
          {dictionary.collection.description}
        </p>
      </header>

      <section>
        <MomentGrid
          moments={publishedMoments}
          locale={typedLocale}
          dictionary={dictionary.momentCard}
          emptyMessage={dictionary.collection.empty}
        />
      </section>
    </div>
  );
}
