import Link from "next/link";
import Image from "next/image";
import { Moment } from "@/types/moment";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/dictionaries/en";
import { getLocalizedUrl } from "@/utils/url";

interface MomentCardProps {
  moment: Moment;
  locale: Locale;
  dictionary: Dictionary["momentCard"];
}

export default function MomentCard({
  moment,
  locale,
  dictionary,
}: MomentCardProps) {
  const momentUrl = getLocalizedUrl(`/moments/${moment.slug}`, locale);

  return (
    <article className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm overflow-hidden hover:border-[var(--border-highlight)] transition-all flex flex-col h-full">
      <Link
        href={momentUrl}
        className="block relative w-full aspect-[3/2] bg-[var(--bg-elevated)] overflow-hidden"
      >
        <Image
          src={moment.mainImage.src}
          alt={moment.mainImage.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <div className="text-xs uppercase tracking-wider text-[var(--accent-warm)] mb-2 font-mono">
          {moment.location.city}, {moment.location.country} &bull;{" "}
          {moment.dateLabel}
        </div>
        <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-warm)] transition-colors">
          <Link href={momentUrl}>{moment.title}</Link>
        </h3>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-6 flex-1 leading-relaxed">
          {moment.shortDescription}
        </p>
        <Link
          href={momentUrl}
          className="inline-flex items-center text-xs font-semibold tracking-wider text-[var(--text-primary)] uppercase hover:text-[var(--accent-warm)] transition-colors group-hover:translate-x-1 transition-transform"
        >
          {dictionary.viewStory}
        </Link>
      </div>
    </article>
  );
}
