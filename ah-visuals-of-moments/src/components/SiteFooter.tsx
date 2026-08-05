import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-[#27272a] bg-[#0f0f11] py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-sm font-semibold tracking-widest text-[#f5f4f0] uppercase">
            AH Visuals of Moments
          </span>
          <p className="text-xs text-[#a1a1aa]">
            Stories behind photographs and physical moments.
          </p>
        </div>
        <nav aria-label="Footer Navigation">
          <ul className="flex items-center space-x-6 text-xs text-[#a1a1aa]">
            <li>
              <Link href="/collection" className="hover:text-[#f5f4f0] transition-colors">
                Collection
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[#f5f4f0] transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#f5f4f0] transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-xs text-[#71717a]">
          &copy; {new Date().getFullYear()} AH Visuals of Moments. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
