import Link from "next/link";
import { getPublishedMoments } from "@/data/moments";
import MomentGrid from "@/components/MomentGrid";

export default function HomePage() {
  const featuredMoments = getPublishedMoments();

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="text-center py-16 sm:py-24 border-b border-[#27272a] space-y-6">
        <h1 className="text-4xl sm:text-6xl font-light tracking-wider uppercase text-[#f5f4f0]">
          AH Visuals of Moments
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#a1a1aa] font-light leading-relaxed">
          Connecting original photography, story locations, and physical unisex T-shirt designs into a single visual catalogue.
        </p>
        <div className="pt-4">
          <Link
            href="/collection"
            className="inline-block bg-[#f5f4f0] text-[#0f0f11] hover:bg-[#d4a373] hover:text-[#0f0f11] px-8 py-3.5 text-sm font-semibold tracking-widest uppercase transition-colors rounded-sm"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-3xl mx-auto text-center space-y-4 px-4">
        <h2 className="text-xs uppercase tracking-widest text-[#d4a373] font-mono">
          Project Concept
        </h2>
        <p className="text-xl sm:text-2xl text-[#f5f4f0] font-light leading-relaxed">
          Each photograph represents a specific moment in time and space. A story page captures the narrative, while a physical T-shirt carries the visual memory into daily life.
        </p>
      </section>

      {/* Featured Moments Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <h2 className="text-xl font-medium tracking-wide text-[#f5f4f0]">
            Featured Moments
          </h2>
          <Link
            href="/collection"
            className="text-xs font-semibold tracking-wider uppercase text-[#a1a1aa] hover:text-[#d4a373] transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
        <MomentGrid moments={featuredMoments} />
      </section>
    </div>
  );
}
