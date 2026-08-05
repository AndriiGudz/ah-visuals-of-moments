import { Moment } from "@/types/moment";
import MomentCard from "./MomentCard";

interface MomentGridProps {
  moments: Moment[];
}

export default function MomentGrid({ moments }: MomentGridProps) {
  if (moments.length === 0) {
    return (
      <div className="py-12 text-center text-[#a1a1aa] border border-dashed border-[#27272a] rounded-sm">
        No moments available at this time.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {moments.map((moment) => (
        <MomentCard key={moment.id} moment={moment} />
      ))}
    </div>
  );
}
