import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLocale, Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { getPublishedMoments } from "@/data/moments";
import { getLocalizedUrl } from "@/utils/url";
import { SITE_URL, ROBOTS_METADATA } from "@/config/site";
import MomentGrid from "@/components/MomentGrid";

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = getDictionary(locale as Locale);

  return {
    title: dict.hero.title,
    description: dict.hero.description,
    robots: ROBOTS_METADATA,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        ru: `${SITE_URL}/ru`,
      },
    },
    openGraph: {
      title: dict.hero.title,
      description: dict.hero.description,
      url: `${SITE_URL}/${locale}`,
      type: "website",
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dictionary = getDictionary(typedLocale);
  const featuredMoments = getPublishedMoments(typedLocale);

  const collectionUrl = getLocalizedUrl("/collection", typedLocale);

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="text-center py-16 sm:py-24 border-b border-[var(--border-subtle)] space-y-6">
        <h1 className="text-4xl sm:text-6xl font-light tracking-wider uppercase text-[var(--text-primary)]">
          {dictionary.hero.title}
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--text-secondary)] font-light leading-relaxed">
          {dictionary.hero.description}
        </p>
        <div className="pt-4">
          <Link
            href={collectionUrl}
            className="inline-block bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[var(--accent-warm)] hover:text-[var(--accent-foreground)] px-8 py-3.5 text-sm font-semibold tracking-widest uppercase transition-colors rounded-sm shadow-xs"
          >
            {dictionary.hero.cta}
          </Link>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-3xl mx-auto text-center space-y-4 px-4">
        <h2 className="text-xs uppercase tracking-widest text-[var(--accent-warm)] font-mono">
          {dictionary.intro.badge}
        </h2>
        <p className="text-xl sm:text-2xl text-[var(--text-primary)] font-light leading-relaxed">
          {dictionary.intro.heading}
        </p>
      </section>

      {/* Featured Moments Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-xl font-medium tracking-wide text-[var(--text-primary)]">
            {dictionary.collection.featuredMoments}
          </h2>
          <Link
            href={collectionUrl}
            className="text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)] hover:text-[var(--accent-warm)] transition-colors"
          >
            {dictionary.collection.viewAll}
          </Link>
        </div>
        <MomentGrid
          moments={featuredMoments}
          locale={typedLocale}
          dictionary={dictionary.momentCard}
          emptyMessage={dictionary.collection.empty}
        />
      </section>
    </div>
  );
}
