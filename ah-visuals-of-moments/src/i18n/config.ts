export const locales = ["fr", "en", "uk", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export interface LocaleConfig {
  route: Locale;
  label: string;
  shortLabel: string;
  hreflang: string;
  ogLocale: string;
}

export const LOCALES_CONFIG: Record<Locale, LocaleConfig> = {
  fr: {
    route: "fr",
    label: "Français",
    shortLabel: "FR",
    hreflang: "fr-FR",
    ogLocale: "fr_FR",
  },
  en: {
    route: "en",
    label: "English",
    shortLabel: "EN",
    hreflang: "en",
    ogLocale: "en_US",
  },
  uk: {
    route: "uk",
    label: "Українська",
    shortLabel: "UK",
    hreflang: "uk",
    ogLocale: "uk_UA",
  },
  ru: {
    route: "ru",
    label: "Русский",
    shortLabel: "RU",
    hreflang: "ru",
    ogLocale: "ru_RU",
  },
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
