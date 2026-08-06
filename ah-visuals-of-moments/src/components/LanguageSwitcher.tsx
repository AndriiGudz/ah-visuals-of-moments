"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={dictionary.ariaLabel}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-highlight)] text-xs font-mono text-[var(--text-primary)] transition-colors focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-warm)] cursor-pointer"
      >
        {/* Globe Icon */}
        <svg
          className="w-4 h-4 text-[var(--accent-warm)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M3.6 9h16.8M3.6 15h16.8"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18"
          />
        </svg>

        <span className="uppercase font-semibold tracking-wider">
          {currentLocale}
        </span>

        {/* Chevron Arrow */}
        <svg
          className={`w-3 h-3 text-[var(--text-secondary)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl z-50 py-1 focus:outline-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] border-b border-[var(--border-subtle)] mb-1">
            {dictionary.ariaLabel}
          </div>
          {locales.map((loc) => {
            const isActive = loc === currentLocale;
            const targetUrl = getLocalizedUrl(pathname, loc);
            const label = dictionary[loc] || loc.toUpperCase();

            return (
              <Link
                key={loc}
                href={targetUrl}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? "bg-[var(--bg-elevated)] text-[var(--accent-warm)] font-medium"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase px-1 py-0.5 rounded-xs bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    {loc}
                  </span>
                  <span>{label}</span>
                </div>
                {isActive && (
                  <svg
                    className="w-3.5 h-3.5 text-[var(--accent-warm)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
