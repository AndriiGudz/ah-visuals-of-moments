import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getMomentBySlug, getPublishedMoments } from "@/data/moments";

interface StoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const moments = getPublishedMoments();
  return moments.map((m) => ({
    slug: m.slug,
  }));
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const moment = getMomentBySlug(slug);

  if (!moment) {
    return {
      title: "Moment Not Found",
    };
  }

  return {
    title: moment.title,
    description: moment.shortDescription,
    openGraph: {
      title: `${moment.title} | AH Visuals of Moments`,
      description: moment.shortDescription,
      type: "article",
    },
  };
}

export default async function MomentStoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const moment = getMomentBySlug(slug);

  if (!moment) {
    notFound();
  }

  return (
    <article className="py-6 space-y-12 max-w-4xl mx-auto">
      {/* Story Header */}
      <header className="space-y-4 border-b border-[#27272a] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#d4a373] uppercase tracking-wider">
          <span>
            {moment.location.city}, {moment.location.country} ({moment.location.coordinates.latitude}, {moment.location.coordinates.longitude})
          </span>
          <span>{moment.dateLabel}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-[#f5f4f0] tracking-wide">
          {moment.title}
        </h1>
        <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
          {moment.shortDescription}
        </p>
        {moment.location.mapUrl && (
          <div>
            <a
              href={moment.location.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] hover:text-[#f5f4f0] underline underline-offset-4 transition-colors"
            >
              Open in Maps &rarr;
            </a>
          </div>
        )}
      </header>

      {/* Main Photograph */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-[#a1a1aa] font-mono">
          Original Photograph
        </h2>
        <div className="relative w-full aspect-[3/2] bg-[#17171a] rounded-sm overflow-hidden border border-[#27272a]">
          <Image
            src={moment.mainImage.src}
            alt={moment.mainImage.alt}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      </section>

      {/* Story Text */}
      <section className="space-y-4 py-4">
        <h2 className="text-xs uppercase tracking-widest text-[#d4a373] font-mono">
          Story behind the photograph
        </h2>
        <div className="text-base sm:text-lg text-[#f5f4f0] leading-relaxed space-y-4 font-light whitespace-pre-line">
          {moment.story}
        </div>
      </section>

      {/* T-Shirt Mockups */}
      <section className="space-y-6 pt-6 border-t border-[#27272a]">
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-[#f5f4f0]">
            Physical T-Shirt Design
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            Unisex T-shirt carrying this photographed moment.
          </p>
        </div>

        {moment.mockups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {moment.mockups.map((mockup) => (
              <div
                key={mockup.id}
                className="bg-[#17171a] border border-[#27272a] rounded-sm overflow-hidden p-4 space-y-3"
              >
                <div className="relative aspect-[4/5] bg-[#202024] rounded-sm overflow-hidden">
                  <Image
                    src={mockup.image.src}
                    alt={mockup.image.alt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {mockup.color && (
                  <div className="flex items-center space-x-2 text-xs text-[#a1a1aa]">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-[#3f3f46] inline-block"
                      style={{ backgroundColor: mockup.color.hex }}
                    />
                    <span>{mockup.color.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-[#a1a1aa] border border-dashed border-[#27272a] rounded-sm">
            Mockups coming soon.
          </div>
        )}

        {/* Colors & Sizes metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#17171a] border border-[#27272a] p-6 rounded-sm">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#a1a1aa] font-mono mb-2">
              Available Colors
            </h3>
            {moment.availableColors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {moment.availableColors.map((color) => (
                  <span
                    key={color.id}
                    className="inline-flex items-center gap-2 text-xs bg-[#202024] border border-[#27272a] px-3 py-1.5 rounded-sm text-[#f5f4f0]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-[#3f3f46]"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-[#71717a]">To be announced</span>
            )}
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#a1a1aa] font-mono mb-2">
              Available Sizes
            </h3>
            {moment.availableSizes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {moment.availableSizes.map((size) => (
                  <span
                    key={size}
                    className="text-xs bg-[#202024] border border-[#27272a] px-3 py-1.5 rounded-sm text-[#f5f4f0] font-mono"
                  >
                    {size}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-[#71717a]">To be announced</span>
            )}
          </div>
        </div>
      </section>

      {/* Reserved Future Extensions Section (QR, Video, External Store) */}
      <section className="border border-dashed border-[#3f3f46] p-6 rounded-sm bg-[#17171a]/50 space-y-4">
        <div className="text-xs uppercase tracking-widest text-[#d4a373] font-mono">
          [ Future Integrations Placeholder ]
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#a1a1aa]">
          <div className="bg-[#202024] p-4 rounded-sm border border-[#27272a] space-y-1">
            <span className="font-semibold text-[#f5f4f0] block">Permanent QR Code</span>
            <p>Route: <code className="text-[#d4a373] font-mono">{moment.qrPath}</code></p>
            <p className="text-[10px] text-[#71717a]">Resolution and downloadable SVG/PNG will be available in future phase.</p>
          </div>

          <div className="bg-[#202024] p-4 rounded-sm border border-[#27272a] space-y-1">
            <span className="font-semibold text-[#f5f4f0] block">Story Video</span>
            <p>Status: {moment.videoUrl ? moment.videoUrl : "Not attached"}</p>
            <p className="text-[10px] text-[#71717a]">Video player integration reserved.</p>
          </div>

          <div className="bg-[#202024] p-4 rounded-sm border border-[#27272a] space-y-1">
            <span className="font-semibold text-[#f5f4f0] block">External Merchant Link</span>
            <p>Status: {moment.externalPurchaseUrl ? moment.externalPurchaseUrl : "Not available"}</p>
            <p className="text-[10px] text-[#71717a]">No direct purchase or store integration in MVP.</p>
          </div>
        </div>
      </section>
    </article>
  );
}
