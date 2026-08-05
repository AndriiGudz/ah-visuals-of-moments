import Link from "next/link";
import Image from "next/image";
import { Moment } from "@/types/moment";

interface MomentCardProps {
  moment: Moment;
}

export default function MomentCard({ moment }: MomentCardProps) {
  return (
    <article className="group bg-[#17171a] border border-[#27272a] rounded-sm overflow-hidden hover:border-[#3f3f46] transition-all flex flex-col h-full">
      <Link href={`/moments/${moment.slug}`} className="block relative w-full aspect-[3/2] bg-[#202024] overflow-hidden">
        <Image
          src={moment.mainImage.src}
          alt={moment.mainImage.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <div className="text-xs uppercase tracking-wider text-[#d4a373] mb-2 font-mono">
          {moment.location.city}, {moment.location.country} &bull; {moment.dateLabel}
        </div>
        <h3 className="text-xl font-medium text-[#f5f4f0] mb-3 group-hover:text-[#d4a373] transition-colors">
          <Link href={`/moments/${moment.slug}`}>{moment.title}</Link>
        </h3>
        <p className="text-sm text-[#a1a1aa] line-clamp-3 mb-6 flex-1 leading-relaxed">
          {moment.shortDescription}
        </p>
        <Link
          href={`/moments/${moment.slug}`}
          className="inline-flex items-center text-xs font-semibold tracking-wider text-[#f5f4f0] uppercase hover:text-[#d4a373] transition-colors group-hover:translate-x-1 transition-transform"
        >
          View Story &rarr;
        </Link>
      </div>
    </article>
  );
}
