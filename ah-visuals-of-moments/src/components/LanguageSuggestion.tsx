"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, locales, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { getLocalizedUrl, setLocaleCookie } from "@/utils/url";

interface LanguageSuggestionProps {
  currentLocale: Locale;
}

const STORAGE_KEY = "ah_lang_suggestion_dismissed";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function LanguageSuggestion({ currentLocale }: LanguageSuggestionProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [suggestedLocale, setSuggestedLocale] = useState<Locale | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    try {
      // 1. If user has already made an explicit manual choice (NEXT_LOCALE cookie exists),
      // manual preference has higher priority than browser language. Never suggest browser language.
      const userLocaleCookie = getCookie("NEXT_LOCALE");
      if (userLocaleCookie && isValidLocale(userLocaleCookie)) {
        return;
      }

      // 2. Check if user already dismissed the suggestion in this session
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (dismissed === "true") {
        return;
      }

      // 3. Detect browser language
      const navLang =
        typeof navigator !== "undefined"
          ? (navigator.language || (navigator.languages && navigator.languages[0]))?.toLowerCase()
          : "";

      if (!navLang) return;

      let detected: Locale | null = null;
      if (navLang.startsWith("uk")) detected = "uk";
      else if (navLang.startsWith("en")) detected = "en";
      else if (navLang.startsWith("ru")) detected = "ru";
      else if (navLang.startsWith("fr")) detected = "fr";

      // 4. Only show suggestion if detected language is supported and differs from current page locale
      if (detected && detected !== currentLocale && locales.includes(detected)) {
        setSuggestedLocale(detected);
        setIsDismissed(false);
      }
    } catch {
      // Graceful fallback for SSR or restricted browser environments
    }
  }, [currentLocale]);

  if (isDismissed || !suggestedLocale) {
    return null;
  }

  const targetDict = getDictionary(suggestedLocale);
  const suggestion = targetDict.languageSuggestion;
  const targetUrl = getLocalizedUrl(pathname, suggestedLocale);

  const handleSwitch = () => {
    setLocaleCookie(suggestedLocale);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setIsDismissed(true);
    router.push(targetUrl);
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setIsDismissed(true);
  };

  return (
    <aside
      aria-label="Language suggestion"
      className="fixed bottom-4 right-4 z-40 max-w-sm rounded-sm bg-[var(--bg-surface)]/95 border border-[var(--border-subtle)] shadow-lg backdrop-blur-xs p-3 text-xs text-[var(--text-primary)] animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-light leading-snug">{suggestion.message}</p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={suggestion.dismissAria}
          className="shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-xs focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-warm)] cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mt-2.5 flex justify-end">
        <button
          type="button"
          onClick={handleSwitch}
          className="px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] text-[var(--accent-warm)] font-medium rounded-xs text-[11px] tracking-wide transition-colors cursor-pointer"
        >
          {suggestion.action}
        </button>
      </div>
    </aside>
  );
}
