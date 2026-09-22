import { Locale, defaultLocale } from "./config";
import { fr } from "./dictionaries/fr";
import { en } from "./dictionaries/en";
import { uk } from "./dictionaries/uk";
import { ru } from "./dictionaries/ru";

const dictionaries = {
  fr,
  en,
  uk,
  ru,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
