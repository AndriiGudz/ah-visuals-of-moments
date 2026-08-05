"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Dictionary } from "@/i18n/dictionaries/en";

interface ThemeSwitcherProps {
  dictionary: Dictionary["themeSwitcher"];
}

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function ThemeSwitcher({ dictionary }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div className="w-20 h-7 rounded-sm bg-[var(--bg-elevated)] animate-pulse" />
    );
  }

  return (
    <div
      aria-label={dictionary.ariaLabel}
      className="inline-flex items-center p-0.5 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`px-2 py-1 rounded-xs transition-colors focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-warm)] ${
          theme === "light"
            ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
        title={dictionary.light}
        aria-label={dictionary.light}
      >
        <span className="sr-only">{dictionary.light}</span>
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`px-2 py-1 rounded-xs transition-colors focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-warm)] ${
          theme === "dark"
            ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
        title={dictionary.dark}
        aria-label={dictionary.dark}
      >
        <span className="sr-only">{dictionary.dark}</span>
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`px-2 py-1 rounded-xs transition-colors focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-warm)] ${
          theme === "system"
            ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
        title={dictionary.system}
        aria-label={dictionary.system}
      >
        <span className="sr-only">{dictionary.system}</span>
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  );
}
