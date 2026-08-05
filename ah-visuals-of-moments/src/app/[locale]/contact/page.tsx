import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { SITE_URL } from "@/config/site";

interface ContactPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = getDictionary(locale as Locale);

  return {
    title: dict.contact.title,
    description: dict.contact.subtitle,
    alternates: {
      canonical: `${SITE_URL}/${locale}/contact`,
      languages: {
        en: `${SITE_URL}/en/contact`,
        ru: `${SITE_URL}/ru/contact`,
      },
    },
    openGraph: {
      title: `${dict.contact.title} | AH Visuals of Moments`,
      description: dict.contact.subtitle,
      url: `${SITE_URL}/${locale}/contact`,
      type: "website",
    },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dictionary = getDictionary(typedLocale);

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-10">
      <header className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-[var(--text-primary)]">
          {dictionary.contact.title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {dictionary.contact.subtitle}
        </p>
      </header>

      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 rounded-sm space-y-6">
        <div className="space-y-2">
          <h2 className="text-xs uppercase tracking-widest text-[var(--accent-warm)] font-mono">
            {dictionary.contact.inquiriesTitle}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {dictionary.contact.inquiriesText}
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] font-mono">
          {dictionary.contact.futureNotice}
        </div>
      </section>
    </div>
  );
}
