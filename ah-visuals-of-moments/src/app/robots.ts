import type { MetadataRoute } from "next";
import { SITE_URL, ALLOW_INDEXING } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
