"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/dictionaries/en";
import { getLocalizedUrl } from "@/utils/url";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

interface SiteHeaderProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const collectionUrl = getLocalizedUrl("/collection", locale);
  const aboutUrl = getLocalizedUrl("/about", locale);
  const contactUrl = getLocalizedUrl("/contact", locale);

  // Close mobile menu on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-28 md:h-32 flex items-center justify-between gap-4 py-2">
        {/* Square Graphic Logo */}
        <Logo locale={locale} />

        {/* Desktop Navigation & Language Controls */}
        <div className="hidden md:flex items-center space-x-8">
          <nav aria-label="Main Navigation">
            <ul className="flex items-center space-x-8 text-sm font-medium tracking-wide">
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

          {/* Desktop Language Switcher */}
          <div className="flex items-center">
            <LanguageSwitcher
              currentLocale={locale}
              dictionary={dictionary.languageSwitcher}
            />
          </div>
        </div>

        {/* Mobile Hamburger (Sandwich Bar) Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="p-2.5 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-warm)] transition-colors focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-warm)] cursor-pointer"
          >
            {isMobileMenuOpen ? (
              /* Close (X) Icon */
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              /* Sandwich Bar (Hamburger) Icon */
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Slide-down) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
            {/* Mobile Nav Links */}
            <nav aria-label="Mobile Navigation">
              <ul className="flex flex-col space-y-4 text-base font-medium tracking-wider uppercase">
                <li className="border-b border-[var(--border-subtle)]/50 pb-3">
                  <Link
                    href={collectionUrl}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[var(--text-primary)] hover:text-[var(--accent-warm)] transition-colors"
                  >
                    {dictionary.nav.collection}
                  </Link>
                </li>
                <li className="border-b border-[var(--border-subtle)]/50 pb-3">
                  <Link
                    href={aboutUrl}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[var(--text-primary)] hover:text-[var(--accent-warm)] transition-colors"
                  >
                    {dictionary.nav.about}
                  </Link>
                </li>
                <li className="border-b border-[var(--border-subtle)]/50 pb-3">
                  <Link
                    href={contactUrl}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[var(--text-primary)] hover:text-[var(--accent-warm)] transition-colors"
                  >
                    {dictionary.nav.contact}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Mobile Language Switcher Row */}
            <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]">
              <span className="text-xs uppercase font-mono tracking-widest text-[var(--text-secondary)]">
                {dictionary.languageSwitcher.ariaLabel}
              </span>
              <LanguageSwitcher
                currentLocale={locale}
                dictionary={dictionary.languageSwitcher}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
