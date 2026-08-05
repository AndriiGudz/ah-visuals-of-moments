import Link from "next/link";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/dictionaries/en";
import { getLocalizedUrl } from "@/utils/url";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

interface SiteHeaderProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  const collectionUrl = getLocalizedUrl("/collection", locale);
  const aboutUrl = getLocalizedUrl("/about", locale);
  const contactUrl = getLocalizedUrl("/contact", locale);

  return (
    <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-28 sm:h-32 flex items-center justify-between gap-4 py-3">
        {/* Square Graphic Logo */}
        <Logo locale={locale} />

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-4 sm:space-x-8">
          <nav aria-label="Main Navigation" className="hidden md:block">
            <ul className="flex items-center space-x-6 sm:space-x-8 text-sm font-medium tracking-wide">
              <li>
                <Link
                  href={collectionUrl}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2"
                >
                  {dictionary.nav.collection}
                </Link>
              </li>
              <li>
                <Link
                  href={aboutUrl}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2"
                >
                  {dictionary.nav.about}
                </Link>
              </li>
              <li>
                <Link
                  href={contactUrl}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2"
                >
                  {dictionary.nav.contact}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Language & Theme Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <LanguageSwitcher
              currentLocale={locale}
              dictionary={dictionary.languageSwitcher}
            />
            <ThemeSwitcher dictionary={dictionary.themeSwitcher} />
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 px-4">
        <ul className="flex items-center justify-around text-xs font-medium tracking-wide">
          <li>
            <Link
              href={collectionUrl}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {dictionary.nav.collection}
            </Link>
          </li>
          <li>
            <Link
              href={aboutUrl}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {dictionary.nav.about}
            </Link>
          </li>
          <li>
            <Link
              href={contactUrl}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {dictionary.nav.contact}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
