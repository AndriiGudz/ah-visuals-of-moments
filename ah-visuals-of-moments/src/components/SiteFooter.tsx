import Link from "next/link";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/dictionaries/en";
import { getLocalizedUrl } from "@/utils/url";

interface SiteFooterProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function SiteFooter({ locale, dictionary }: SiteFooterProps) {
  const collectionUrl = getLocalizedUrl("/collection", locale);
  const aboutUrl = getLocalizedUrl("/about", locale);
  const contactUrl = getLocalizedUrl("/contact", locale);

  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] py-12 mt-auto transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-sm font-semibold tracking-widest text-[var(--text-primary)] uppercase">
            AH Visuals of Moments
          </span>
          <p className="text-xs text-[var(--text-secondary)]">
            {dictionary.footer.brandSubtitle}
          </p>
        </div>

        <nav aria-label="Footer Navigation">
          <ul className="flex items-center space-x-6 text-xs text-[var(--text-secondary)]">
            <li>
              <Link
                href={collectionUrl}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                {dictionary.nav.collection}
              </Link>
            </li>
            <li>
              <Link
                href={aboutUrl}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                {dictionary.nav.about}
              </Link>
            </li>
            <li>
              <Link
                href={contactUrl}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                {dictionary.nav.contact}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} AH Visuals of Moments. {dictionary.footer.rights}
        </div>
      </div>
    </footer>
  );
}
