import { Moment } from "@/types/moment";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/dictionaries/en";
import MomentCard from "./MomentCard";

interface MomentGridProps {
  moments: Moment[];
  locale: Locale;
  dictionary: Dictionary["momentCard"];
  emptyMessage: string;
}

export default function MomentGrid({
  moments,
  locale,
  dictionary,
  emptyMessage,
}: MomentGridProps) {
  if (moments.length === 0) {
    return (
      <div className="py-12 text-center text-[var(--text-secondary)] border border-dashed border-[var(--border-subtle)] rounded-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {moments.map((moment) => (
        <MomentCard
          key={moment.id}
          moment={moment}
          locale={locale}
          dictionary={dictionary}
        />
      ))}
    </div>
  );
}
