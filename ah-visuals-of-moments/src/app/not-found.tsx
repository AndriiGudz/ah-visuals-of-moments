import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center space-y-6 max-w-md mx-auto">
      <div className="text-xs uppercase tracking-widest text-[#d4a373] font-mono">
        404 &bull; Page Not Found
      </div>
      <h1 className="text-3xl font-light text-[#f5f4f0]">
        Moment Not Available
      </h1>
      <p className="text-sm text-[#a1a1aa] leading-relaxed">
        The requested moment or page does not exist or has not been published yet.
      </p>
      <div className="pt-4">
        <Link
          href="/collection"
          className="inline-block bg-[#202024] border border-[#3f3f46] text-[#f5f4f0] hover:bg-[#f5f4f0] hover:text-[#0f0f11] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm"
        >
          Return to Collection
        </Link>
      </div>
    </div>
  );
}
