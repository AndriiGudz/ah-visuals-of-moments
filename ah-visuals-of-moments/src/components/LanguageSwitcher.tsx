"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, locales } from "@/i18n/config";
import { getLocalizedUrl } from "@/utils/url";
import { Dictionary } from "@/i18n/dictionaries/en";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  dictionary: Dictionary["languageSwitcher"];
}

export default function LanguageSwitcher({
  currentLocale,
  dictionary,
}: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={dictionary.ariaLabel}
      className="inline-flex items-center p-0.5 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono"
    >
      {locales.map((loc) => {
        const isActive = loc === currentLocale;
        const targetUrl = getLocalizedUrl(pathname, loc);

        return (
          <Link
            key={loc}
            href={targetUrl}
            className={`px-2 py-1 rounded-xs transition-colors focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-warm)] uppercase ${
              isActive
                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {loc}
          </Link>
        );
      })}
    </nav>
  );
}
