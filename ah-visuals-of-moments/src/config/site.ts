/**
 * Site configuration for AH Visuals of Moments.
 *
 * SITE_URL is used to build canonical URLs, sitemaps, and Open Graph metadata.
 * In production, set NEXT_PUBLIC_SITE_URL in your environment variables.
 * Fallback is set to http://localhost:3000 for local development.
 */
function resolveSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (!envUrl) {
      throw new Error(
        "[Production Safety] NEXT_PUBLIC_SITE_URL environment variable is strictly required in production (expected: https://ah-visuals.com)."
      );
    }
    if (envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
      throw new Error(
        `[Production Safety] NEXT_PUBLIC_SITE_URL cannot be localhost in production environment: "${envUrl}". Expected: https://ah-visuals.com.`
      );
    }
    return envUrl.replace(/\/$/, "");
  }

  return (envUrl || "http://localhost:3000").replace(/\/$/, "");
}

export const SITE_URL = resolveSiteUrl();

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
