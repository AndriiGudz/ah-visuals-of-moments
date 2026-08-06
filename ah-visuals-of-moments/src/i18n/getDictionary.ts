import { Locale, defaultLocale } from "./config";
import { en } from "./dictionaries/en";
import { ru } from "./dictionaries/ru";

const dictionaries = {
  en,
  ru,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
