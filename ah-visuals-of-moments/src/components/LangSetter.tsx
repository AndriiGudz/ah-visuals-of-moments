"use client";

import { useEffect } from "react";
import { Locale } from "@/i18n/config";

export default function LangSetter({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
