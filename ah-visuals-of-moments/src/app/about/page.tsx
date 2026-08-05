import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About AH Visuals of Moments project and the philosophy behind photography T-shirts.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-12">
      <header className="border-b border-[#27272a] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-[#f5f4f0]">
          About the Project
        </h1>
        <p className="text-sm text-[#a1a1aa] font-mono uppercase tracking-wider">
          AH Visuals of Moments
        </p>
      </header>

      <section className="space-y-6 text-[#f5f4f0] leading-relaxed font-light">
        <p className="text-lg sm:text-xl text-[#d4a373] leading-relaxed">
          AH Visuals of Moments is a photography-focused project connecting individual photographs with physical unisex T-shirts and the stories behind them.
        </p>

        <div className="space-y-4 text-base text-[#a1a1aa] leading-relaxed">
          <p>
            Every photograph in the collection represents a real, documented moment in time and space, captured at a specific location. Each photograph corresponds to one T-shirt design.
          </p>
          <p>
            Rather than treating apparel as fast fashion, AH Visuals of Moments pairs each piece with a dedicated story page and a permanent QR code, allowing the wearer and viewer to discover the geographic context, date, and personal narrative behind the image.
          </p>
        </div>
      </section>

      <section className="border-t border-[#27272a] pt-8 space-y-4">
        <h2 className="text-xl font-medium text-[#f5f4f0]">
          The Photography & Approach
        </h2>
        <p className="text-sm text-[#a1a1aa] leading-relaxed font-light">
          The visual direction emphasizes natural composition, sincere observational narrative, and calm, modern aesthetics. The digital platform serves as a minimalist gallery cataloguing these moments.
        </p>
      </section>
    </div>
  );
}
