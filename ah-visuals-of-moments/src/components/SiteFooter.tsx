import Link from "next/link";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/dictionaries/en";
import { getLocalizedUrl } from "@/utils/url";
import Logo from "./Logo";
import ThemeSwitcher from "./ThemeSwitcher";

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Footer Row: Brand Block (Left) & Theme Switcher + Nav Menu Stack (Right) */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8 border-b border-[var(--border-subtle)]">
          {/* Centered Brand Block */}
          <div className="flex flex-col items-center text-center gap-1">
            <Logo locale={locale} centered />
            <span className="text-[10px] sm:text-xs font-light tracking-[0.25em] text-[var(--text-secondary)] uppercase">
              Visuals of Moments
            </span>
          </div>

          {/* Right Column: Theme Switcher on top, Navigation Links underneath */}
          <div className="flex flex-col items-center sm:items-end gap-4">
            <ThemeSwitcher dictionary={dictionary.themeSwitcher} />

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
          </div>
        </div>

        {/* Bottom Section: Copyright Notice (Left) & Design/Dev Credit (Right) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          {/* Left: Copyright */}
          <div>
            &copy; {new Date().getFullYear()} Alina Honcharuk.{" "}
            {dictionary.footer.rights}
          </div>

          {/* Right: Design & Development Credit */}
          <div>
            {dictionary.footer.createdBy}{" "}
            <a
              href="https://gudz-andrii.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-primary)] underline underline-offset-2 transition-colors"
            >
              Andrii Gudz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
