import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="w-full border-b border-[#27272a] bg-[#0f0f11]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-medium tracking-widest text-[#f5f4f0] hover:text-[#d4a373] transition-colors uppercase"
        >
          AH Visuals of Moments
        </Link>
        <nav aria-label="Main Navigation">
          <ul className="flex items-center space-x-6 sm:space-x-8 text-sm font-medium tracking-wide">
            <li>
              <Link
                href="/collection"
                className="text-[#a1a1aa] hover:text-[#f5f4f0] transition-colors"
              >
                Collection
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-[#a1a1aa] hover:text-[#f5f4f0] transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-[#a1a1aa] hover:text-[#f5f4f0] transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
