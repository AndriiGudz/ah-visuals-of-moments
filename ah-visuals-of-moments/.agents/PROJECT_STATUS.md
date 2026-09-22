# Project Status — AH Visuals of Moments

*Last updated: 2026-09-22 (Phase 1 SEO & QR Architecture Fix)*

## Phase 1 Implemented Changes

1. **Production Origin & Safety**:
   - Production origin established: `https://ah-visuals.com`.
   - In production (`NODE_ENV === "production"`), `NEXT_PUBLIC_SITE_URL` is strictly required and cannot be `localhost`. If missing or localhost, build fails immediately with a descriptive error.
   - Local development safely uses fallback `http://localhost:3000`.

2. **Permanent QR Route (`/q/[id]`)**:
   - Created `src/app/q/[id]/route.ts`.
   - Immutable QR ID contract: `AH001` (from `qrId`).
   - Server-side lookup via `getMomentByQrId(id)`.
   - Locale resolution order:
     1. `NEXT_LOCALE` cookie (manual preference);
     2. `Accept-Language` header;
     3. `defaultLocale` (`fr`).
   - Issues `307 Temporary Redirect` to canonical localized story URL `/${locale}/moments/${moment.slug}`.
   - Unknown QR ID (`/q/UNKNOWN`) returns HTTP 404 (no soft 404, no redirect to homepage).

3. **QR UI Generator**:
   - Updated `QrCodeTrigger.tsx` and `QrCodeModal.tsx` to encode `https://ah-visuals.com/q/[id]`.
   - Decoupled physical QR code generation from mutable story slugs.

4. **Separation of Lifecycle and Indexability**:
   - Added `isIndexable: boolean` to moment data model.
   - Search indexability formula: `ALLOW_INDEXING && status === "published" && isIndexable === true`.
   - Global `ALLOW_INDEXING=false` retains authoritative priority.
   - `archived` stories remain accessible at HTTP 200 via direct URL and `/q/[id]`, serve `<meta name="robots" content="noindex, follow">`, and are excluded from `sitemap.xml` and Collection showcase.

5. **Sitemap & Robots**:
   - `src/app/sitemap.ts` now uses `getIndexableMoments()`. Only `status === "published" && isIndexable === true` stories enter sitemap.
   - Per-story robots metadata in `moments/[slug]/page.tsx` correctly handles `isIndexable` and `archived`.

6. **Double Branding Bug Fix**:
   - Cleaned `seoTitle` in all locales in `src/data/moments.ts` (e.g. `Moment 001`, `Момент 001`), allowing the root template `%s | AH Visuals of Moments` to append branding exactly once.
   - Fixed Open Graph title in `moments/[slug]/page.tsx`.
