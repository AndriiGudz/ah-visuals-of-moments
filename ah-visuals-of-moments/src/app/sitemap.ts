import type { MetadataRoute } from "next";
import { getPublishedMoments } from "@/data/moments";
import { SITE_URL } from "@/config/site";
import { locales } from "@/i18n/config";
import { getAlternateLanguages } from "@/utils/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const publishedMoments = getPublishedMoments();

  const staticPaths = ["", "/collection", "/about", "/contact"];

  const staticEntries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    const alternatesLanguages = getAlternateLanguages(path);

    for (const locale of locales) {
      const url = `${SITE_URL}/${locale}${path}`;

      staticEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency:
          path === "" ? "weekly" : path === "/collection" ? "daily" : "monthly",
        priority: path === "" ? 1.0 : path === "/collection" ? 0.9 : 0.5,
        alternates: {
          languages: alternatesLanguages,
        },
      });
    }
  }

  const momentEntries: MetadataRoute.Sitemap = [];

  for (const moment of publishedMoments) {
    const momentNeutralPath = `/moments/${moment.slug}`;
    const alternatesLanguages = getAlternateLanguages(momentNeutralPath);

    for (const locale of locales) {
      const url = `${SITE_URL}/${locale}${momentNeutralPath}`;

      momentEntries.push({
        url,
        lastModified: new Date(moment.createdAt),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: alternatesLanguages,
        },
      });
    }
  }

  // Note: Neutral QR redirect route /moments/[slug] is deliberately excluded
  // to avoid duplicate content in search indexes.
  return [...staticEntries, ...momentEntries];
}
