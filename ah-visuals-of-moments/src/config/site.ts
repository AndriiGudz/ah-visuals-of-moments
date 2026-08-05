/**
 * Site configuration for AH Visuals of Moments.
 *
 * SITE_URL is used to build canonical URLs, sitemaps, and Open Graph metadata.
 * In production, set NEXT_PUBLIC_SITE_URL in your environment variables.
 * Fallback is set to http://localhost:3000 for local development.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const SITE_NAME = "AH Visuals of Moments";

export const SITE_DESCRIPTION =
  "Connecting photographs, authentic stories, physical locations, and unisex T-shirts in one minimalist gallery.";
