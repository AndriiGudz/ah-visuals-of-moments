import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { locales, isValidLocale, Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { getMomentBySlug, getPublishedMoments } from "@/data/moments";
import { SITE_URL, ROBOTS_METADATA } from "@/config/site";
import { QrCodeTrigger } from "@/components/qr/QrCodeTrigger";

interface StoryPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const publishedMoments = getPublishedMoments("en");
  const params: Array<{ locale: string; slug: string }> = [];

  for (const locale of locales) {
    for (const moment of publishedMoments) {
      params.push({
        locale,
        slug: moment.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};

  const typedLocale = locale as Locale;
  const moment = getMomentBySlug(slug, typedLocale);

  if (!moment) {
    return {
      title: "Moment Not Found",
      robots: ROBOTS_METADATA,
    };
  }

  const title = moment.seoTitle || moment.title;
  const description = moment.seoDescription || moment.shortDescription;

  return {
    title,
    description,
    robots: ROBOTS_METADATA,
    alternates: {
      canonical: `${SITE_URL}/${typedLocale}/moments/${slug}`,
      languages: {
        en: `${SITE_URL}/en/moments/${slug}`,
        ru: `${SITE_URL}/ru/moments/${slug}`,
      },
    },
    openGraph: {
      title: `${title} | AH Visuals of Moments`,
      description,
      url: `${SITE_URL}/${typedLocale}/moments/${slug}`,
      type: "article",
      images: [
        {
          url: moment.heroImage?.src || moment.mainImage.src,
          alt: moment.heroImage?.alt || moment.mainImage.alt,
        },
      ],
    },
  };
}

export default async function MomentStoryPage({ params }: StoryPageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dictionary = getDictionary(typedLocale);
  const moment = getMomentBySlug(slug, typedLocale);

  if (!moment) {
    notFound();
  }

  const heroImage = moment.heroImage || moment.mainImage;

  return (
    <article className="py-6 space-y-12 max-w-4xl mx-auto">
      {/* Story Header */}
      <header className="space-y-4 border-b border-[var(--border-subtle)] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[var(--accent-warm)] uppercase tracking-wider">
          <span>
            {moment.location.city}, {moment.location.country} (
            {moment.location.coordinates.latitude},{" "}
            {moment.location.coordinates.longitude})
          </span>
          <span>{moment.dateLabel}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-[var(--text-primary)] tracking-wide">
          {moment.title}
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
          {moment.shortDescription}
        </p>
        {moment.location.mapUrl && (
          <div>
            <a
              href={moment.location.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-4 transition-colors"
            >
              {dictionary.story.openInMaps}
            </a>
          </div>
        )}
      </header>

      {/* Main Photograph / Hero Image */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-mono">
          {dictionary.story.originalPhoto}
        </h2>
        <div className="relative w-full aspect-[4/3] bg-[var(--bg-surface)] rounded-sm overflow-hidden border border-[var(--border-subtle)]">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Story Text */}
      <section className="space-y-4 py-4">
        <h2 className="text-xs uppercase tracking-widest text-[var(--accent-warm)] font-mono">
          {dictionary.story.storyBehind}
        </h2>
        <div className="text-base sm:text-lg text-[var(--text-primary)] leading-relaxed space-y-4 font-light">
          {moment.story.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Additional Gallery Section */}
      {moment.gallery && moment.gallery.length > 0 && (
        <section className="space-y-4 py-4 border-t border-[var(--border-subtle)]">
          <h2 className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-mono">
            {dictionary.story.gallery}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moment.gallery.map((img) => (
              <div
                key={img.id}
                className="relative aspect-[4/3] bg-[var(--bg-surface)] rounded-sm overflow-hidden border border-[var(--border-subtle)]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 448px"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* T-Shirt Mockups / Physical Design */}
      <section className="space-y-6 pt-6 border-t border-[var(--border-subtle)]">
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-[var(--text-primary)]">
            {dictionary.story.physicalDesign}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {dictionary.story.unisexSubtitle}
          </p>
        </div>

        {moment.mockups.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {moment.mockups.map((mockup) => (
              <div
                key={mockup.id}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm overflow-hidden p-4 space-y-3"
              >
                <div className="relative aspect-[5/4] bg-[var(--bg-elevated)] rounded-sm overflow-hidden">
                  <Image
                    src={mockup.image.src}
                    alt={mockup.image.alt}
                    fill
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover"
                  />
                </div>
                {mockup.color && (
                  <div className="flex items-center space-x-2 text-xs text-[var(--text-secondary)]">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-[var(--border-highlight)] inline-block shadow-xs"
                      style={{ backgroundColor: mockup.color.hex }}
                    />
                    <span>{mockup.color.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-[var(--text-secondary)] border border-dashed border-[var(--border-subtle)] rounded-sm">
            {dictionary.story.mockupsComingSoon}
          </div>
        )}

        {/* Colors & Sizes metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-sm">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-mono mb-2">
              {dictionary.story.availableColors}
            </h3>
            {moment.availableColors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {moment.availableColors.map((color) => (
                  <span
                    key={color.id}
                    className="inline-flex items-center gap-2 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-sm text-[var(--text-primary)]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-[var(--border-highlight)]"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-[var(--text-muted)]">
                {dictionary.story.toBeAnnounced}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-mono mb-2">
              {dictionary.story.availableSizes}
            </h3>
            {moment.availableSizes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {moment.availableSizes.map((size) => (
                  <span
                    key={size}
                    className="text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-sm text-[var(--text-primary)] font-mono"
                  >
                    {size}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-[var(--text-muted)]">
                {dictionary.story.toBeAnnounced}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Reserved Future Extensions Section */}
      <section className="border border-dashed border-[var(--border-highlight)] p-6 rounded-sm bg-[var(--bg-surface)]/50 space-y-4">
        <div className="text-xs uppercase tracking-widest text-[var(--accent-warm)] font-mono">
          {dictionary.story.futureIntegrations}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--text-secondary)]">
          <div className="bg-[var(--bg-elevated)] p-4 rounded-sm border border-[var(--border-subtle)] space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-semibold text-[var(--text-primary)] block">
                {dictionary.story.permanentQr}
              </span>
              <p className="text-xs text-[var(--text-secondary)]">
                Route:{" "}
                <code className="text-[var(--accent-warm)] font-mono">
                  /moments/{moment.slug}
                </code>
              </p>
            </div>
            <div>
              <QrCodeTrigger
                momentTitle={moment.title}
                momentSlug={moment.slug}
                siteUrl={SITE_URL}
                dictionary={dictionary.qr}
              />
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] p-4 rounded-sm border border-[var(--border-subtle)] space-y-1">
            <span className="font-semibold text-[var(--text-primary)] block">
              {dictionary.story.storyVideo}
            </span>
            <p>
              Status:{" "}
              {moment.videoUrl ? moment.videoUrl : dictionary.story.notAttached}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {dictionary.story.videoDesc}
            </p>
          </div>

          <div className="bg-[var(--bg-elevated)] p-4 rounded-sm border border-[var(--border-subtle)] space-y-1">
            <span className="font-semibold text-[var(--text-primary)] block">
              {dictionary.story.externalMerchantLink}
            </span>
            <p>
              Status:{" "}
              {moment.externalPurchaseUrl
                ? moment.externalPurchaseUrl
                : dictionary.story.notAvailable}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {dictionary.story.merchantDesc}
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
