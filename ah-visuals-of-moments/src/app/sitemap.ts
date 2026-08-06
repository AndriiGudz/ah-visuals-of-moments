import type { MetadataRoute } from "next";
import { getPublishedMoments } from "@/data/moments";
import { SITE_URL } from "@/config/site";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const publishedMoments = getPublishedMoments("en");

  const staticPaths = ["", "/collection", "/about", "/contact"];

  const staticEntries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of locales) {
      const url = `${SITE_URL}/${locale}${path}`;
      const languages: Record<string, string> = {};
      for (const loc of locales) {
        languages[loc] = `${SITE_URL}/${loc}${path}`;
      }

      staticEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : path === "/collection" ? "daily" : "monthly",
        priority: path === "" ? 1.0 : path === "/collection" ? 0.9 : 0.5,
        alternates: {
          languages,
        },
      });
    }
  }

  const momentEntries: MetadataRoute.Sitemap = [];

  for (const moment of publishedMoments) {
    for (const locale of locales) {
      const url = `${SITE_URL}/${locale}/moments/${moment.slug}`;
      const languages: Record<string, string> = {};
      for (const loc of locales) {
        languages[loc] = `${SITE_URL}/${loc}/moments/${moment.slug}`;
      }

      momentEntries.push({
        url,
        lastModified: new Date(moment.createdAt),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages,
        },
      });
    }
  }

  return [...staticEntries, ...momentEntries];
}
