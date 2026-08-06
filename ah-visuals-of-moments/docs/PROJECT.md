# AH Visuals of Moments — Project Brief

## Project overview
AH Visuals of Moments is a lightweight photography-focused website connecting T-shirts with the stories behind the photographs printed on them.

Each photograph represents one unisex T-shirt design. A design may have several color mockups, but all variants share the same story page and permanent QR code.

The MVP is a catalogue and story platform, not an online shop.

## Core MVP goals
- Present the brand and the project concept.
- Show collections and individual story pages.
- Provide one permanent QR code per photograph.
- Support English and Russian.
- Detect browser language and fall back to English.
- Support light and dark themes.
- Load quickly on mobile devices.
- Provide strong SEO foundations.

## Included in MVP
- Landing-style home page.
- Collection pages.
- Individual story/product pages.
- Responsive image and mockup galleries.
- Permanent QR routes.
- QR preview and download.
- English and Russian localization.
- Language switcher.
- Light and dark themes.
- External map links.
- SEO metadata, sitemap and robots configuration.
- Repository-based structured content.

## Not included in MVP
- Shopping cart, checkout, payments or shipping.
- Order management or customer accounts.
- Prices, sizes or direct store links.
- Scan analytics.
- Full CMS or admin panel.
- Separate photographer profile page.

The data model should reserve an optional field for a future external purchase URL.

## Content model

### Collection
A collection groups photographs by period, location, mood or visual idea.

Initial working collection: **Summer 2019**.

### Story / design
Recommended fields:
- permanent `id`, for example `AH001`;
- changeable `slug`;
- `collectionId`;
- date label;
- location;
- coordinates;
- map URL;
- localized title, story and SEO fields;
- main photograph;
- T-shirt mockups;
- optional color metadata;
- optional external purchase URL;
- publication status.

## QR architecture
A QR code must not point directly to a changeable page slug.

Recommended format:

```text
https://example.com/q/AH001
```

The `/q/[id]` route should:
1. resolve the permanent photograph ID;
2. detect browser language;
3. check whether that translation exists;
4. redirect to the current localized story URL;
5. fall back to English.

Use a temporary redirect so the destination can change later without reprinting QR codes.

Preferred download format: SVG. Optional format: PNG.

## Localization
MVP languages:
- English — default and fallback;
- Russian.

Planned languages:
- Ukrainian;
- French;
- German.

Stories will initially be provided in Russian. Translations should be prepared and stored before publication, not generated dynamically on each visit.

## Technical direction
- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Vercel
- repository-based TypeScript, JSON or MDX content
- no database or CMS in MVP

Possible supporting packages:
- `next-intl`
- `next-themes`
- QR generation library
- Zod

## Initial route structure
```text
/[locale]
/[locale]/collections
/[locale]/collections/[slug]
/[locale]/stories/[slug]
/q/[id]
```

## Development principles
- Photography comes before interface decoration.
- Mobile experience is essential.
- Avoid generic SaaS styling.
- Use restrained motion.
- Avoid unnecessary dependencies.
- Optimize images and typography carefully.
- Preserve stable QR identifiers permanently.
