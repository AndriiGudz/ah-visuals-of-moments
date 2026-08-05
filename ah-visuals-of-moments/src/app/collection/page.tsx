import type { Metadata } from "next";
import { getPublishedMoments } from "@/data/moments";
import MomentGrid from "@/components/MomentGrid";

export const metadata: Metadata = {
  title: "Collection",
  description: "Browse all published visual stories and T-shirt mockups.",
};

export default function CollectionPage() {
  const publishedMoments = getPublishedMoments();

  return (
    <div className="space-y-10 py-6">
      <header className="border-b border-[#27272a] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-[#f5f4f0]">
          Collection
        </h1>
        <p className="text-sm text-[#a1a1aa] max-w-xl">
          Explore all published photograph stories, location coordinates, and unisex T-shirt designs.
        </p>
      </header>

      <section>
        <MomentGrid moments={publishedMoments} />
      </section>
    </div>
  );
}
