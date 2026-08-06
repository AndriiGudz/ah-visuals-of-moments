/**
 * Site configuration for AH Visuals of Moments.
 *
 * SITE_URL is used to build canonical URLs, sitemaps, and Open Graph metadata.
 * In production, set NEXT_PUBLIC_SITE_URL in your environment variables.
 * Fallback is set to http://localhost:3000 for local development.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const ALLOW_INDEXING =
  process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const ROBOTS_METADATA = ALLOW_INDEXING
  ? {
      index: true,
      follow: true,
    }
  : {
      index: false,
      follow: false,
      nocache: true,
    };

export const SITE_NAME = "AH Visuals of Moments";

export const SITE_DESCRIPTION =
  "Connecting photographs, authentic stories, physical locations, and unisex T-shirts in one minimalist gallery.";
