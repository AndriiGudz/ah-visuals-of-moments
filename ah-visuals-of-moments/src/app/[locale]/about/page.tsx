import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { SITE_URL } from "@/config/site";

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = getDictionary(locale as Locale);

  return {
    title: dict.about.title,
    description: dict.about.lead,
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages: {
        en: `${SITE_URL}/en/about`,
        ru: `${SITE_URL}/ru/about`,
      },
    },
    openGraph: {
      title: `${dict.about.title} | AH Visuals of Moments`,
      description: dict.about.lead,
      url: `${SITE_URL}/${locale}/about`,
      type: "website",
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dictionary = getDictionary(typedLocale);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-12">
      <header className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-[var(--text-primary)]">
          {dictionary.about.title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] font-mono uppercase tracking-wider">
          {dictionary.about.subtitle}
        </p>
      </header>

      <section className="space-y-6 text-[var(--text-primary)] leading-relaxed font-light">
        <p className="text-lg sm:text-xl text-[var(--accent-warm)] leading-relaxed">
          {dictionary.about.lead}
        </p>

        <div className="space-y-4 text-base text-[var(--text-secondary)] leading-relaxed">
          <p>{dictionary.about.p1}</p>
          <p>{dictionary.about.p2}</p>
        </div>
      </section>

      <section className="border-t border-[var(--border-subtle)] pt-8 space-y-4">
        <h2 className="text-xl font-medium text-[var(--text-primary)]">
          {dictionary.about.approachTitle}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">
          {dictionary.about.approachText}
        </p>
      </section>
    </div>
  );
}
