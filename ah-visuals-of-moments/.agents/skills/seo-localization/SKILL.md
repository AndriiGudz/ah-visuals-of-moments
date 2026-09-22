# SEO & Localization Skill — Aha Visuals of Moments

## Purpose

This skill defines the SEO, multilingual, story-page, image-search, entity, social-sharing, and AI-discovery requirements for the **Aha Visuals of Moments** website.

Use this skill whenever a task affects:

- page routing;
- public story / moment URLs;
- QR-code destination URLs;
- localized URLs;
- metadata;
- canonical URLs;
- hreflang;
- sitemap;
- robots;
- indexability;
- structured data;
- entity architecture;
- Open Graph and social previews;
- image SEO;
- story / gallery content architecture;
- internal linking;
- browser-language behavior;
- AI / LLM discovery;
- `llms.txt`;
- crawler access relevant to search and AI discovery;
- migration or renaming of public URLs.

Before making significant SEO or localization decisions, read the project's current:

- `PROJECT.md` or equivalent project documentation;
- `AGENTS.md`, if present;
- `.agents/PROJECT_STATUS.md`, if present;
- architecture / routing documentation;
- this SEO & Localization skill.

If the repository uses different filenames, use the equivalent source-of-truth documents.

When implementation depends on current Google Search, schema.org, structured-data, image-search, social-preview, or AI-crawler behavior, verify current authoritative documentation before changing production code.

---

# 1. Core SEO Principle

SEO, multilingual SEO, image discovery, entity optimization, social discovery, and AI-search optimization must **not** become separate competing content systems.

The foundation is one public, consistent, factual website that is useful to:

- human visitors;
- search engines;
- image-search systems;
- social-sharing systems;
- AI retrieval systems and agents.

The public website must remain the primary source of truth.

Do not create:

- hidden SEO-only pages;
- keyword-stuffed story variants;
- duplicate pages for QR codes;
- robot-only copies of public stories;
- fake localized pages;
- AI-only content that contradicts the visible website.

AI-specific discovery aids such as `llms.txt` may be added as navigation and summarization layers, but they must not become a second source of truth.

---

# 2. Project SEO Model

Aha Visuals of Moments is not to be treated like a generic local-service website.

Its SEO architecture should primarily support:

1. the public brand / project entity;
2. stable public landing pages;
3. discoverable story / moment pages where publication is intended;
4. strong image and social-preview handling;
5. correct multilingual relationships;
6. clean QR-to-web navigation;
7. clear entity and content relationships;
8. crawlable, indexable HTML;
9. stable public URLs;
10. factual AI discovery.

Do not import service-business assumptions from another project unless they are factually true for Aha Visuals of Moments.

In particular, do not assume:

- a Google Business Profile;
- a local service area;
- a storefront;
- a founder-focused personal entity;
- a service catalog;
- Germany-only commercial intent;
- public pricing;
- public contact details;
- local landing pages.

These may be added only when project facts explicitly support them.

---

# 3. Primary SEO Goals

Primary goals:

- technically correct crawlability and indexability;
- stable public story URLs;
- clear search intent for the main public pages;
- strong image discoverability where appropriate;
- useful social-sharing previews;
- technically correct multilingual SEO when multiple locales are public;
- clean canonical and hreflang relationships;
- strong brand / website / story entity clarity;
- no accidental indexing of private, draft, preview, or customer-only content;
- no duplicate indexing caused by QR parameters or alternate access paths;
- strong semantic relationship between stories, images, and the main brand;
- fast server-rendered or statically generated public HTML where practical;
- useful people-first content;
- factual AI / LLM discovery;
- safe URL migration behavior.

SEO must be built into routing and content architecture rather than added after launch.

---

# 4. Public vs. Private Content Is an SEO Decision

Every story, moment, gallery, customer page, preview, or generated page must have an explicit publication status.

Recommended conceptual states:

- `public-indexable`;
- `public-noindex`;
- `private/authenticated`;
- `draft/preview`;
- `archived`.

Do not assume that every QR destination should be indexed.

A page may be publicly reachable through a QR code while still intentionally using `noindex`.

Before changing indexability, determine:

- whether the owner wants the page discoverable from search;
- whether the content contains personal or customer-specific information;
- whether consent exists for public discovery;
- whether the page is intended only for people who possess the QR code;
- whether search indexing would change the expected privacy model.

SEO must never override privacy or publication intent.

---

# Multilingual Architecture

# 5. Supported Locales

Supported locales must be derived from the actual project configuration.

Do not copy locale assumptions from another project.

If multiple public locales exist, each localized version must have its own crawlable URL.

Do not implement public localization only through:

- client-side state;
- cookies;
- browser-language replacement on a single URL;
- JavaScript-only content switching.

Each indexable localized page must be independently addressable by URL.

If the project currently has only one public language, do not create fake locale routes merely for SEO completeness.

---

# 6. Locale URL Strategy

Use one stable locale URL contract across the project.

Examples of acceptable models include:

```text
/                     default locale
/en/                  English
/de/                  German
```

or:

```text
/en/                  English
/de/                  German
```

The actual model must follow existing project architecture.

Do not change the default-locale strategy casually.

For story pages, preserve the same logical story identity across locales.

Example:

```text
/story/example/
/en/story/example/
/de/story/example/
```

or the equivalent approved route structure.

Do not create localized story URLs that point to non-equivalent content merely to complete hreflang sets.

---

# 7. Translation Quality

Translations must preserve:

- factual meaning;
- names;
- dates;
- locations;
- story context;
- emotional tone where relevant;
- captions;
- image meaning;
- relationship between people / places / moments;
- calls to action;
- privacy-sensitive details.

Do not publish:

- empty localized placeholders;
- mixed-language fragments;
- raw unreviewed machine translations;
- invented translated facts;
- fake pages solely for hreflang completeness.

For personal stories, translation quality is especially important because subtle meaning may be part of the product experience.

---

# 8. Browser Language Detection

Browser-language detection may improve UX but must not control indexability.

Requirements:

- every public locale remains directly accessible by URL;
- search engines do not depend on browser detection;
- users can switch language manually;
- no redirect loops;
- no hidden forced redirects that prevent direct access;
- QR destinations must resolve predictably.

Prefer a language suggestion over an unconditional redirect when possible.

If a QR code is intended to open a specific language version, encode the intended public URL directly rather than relying on browser detection.

---

# Canonical and Hreflang

# 9. Canonical URLs

Every indexable page must have one clear canonical URL.

Rules:

- localized pages normally canonicalize to themselves;
- do not canonicalize all languages to one locale;
- canonical URLs must use the production origin from centralized configuration;
- avoid hard-coded duplicate origins;
- query parameters must not create competing canonical pages;
- QR tracking parameters must not create alternate indexable copies;
- preview tokens must never become canonical URLs;
- temporary share URLs must not replace stable public URLs.

For a story page:

```text
https://<production-origin>/<approved-story-route>/
```

must be the canonical public identity unless a different route is explicitly approved.

---

# 10. QR Codes and Canonicalization

QR codes are an access mechanism, not a separate SEO content layer.

A QR code should normally point to:

- the stable canonical public page; or
- a stable redirect URL that resolves permanently or predictably to the canonical page.

Avoid QR destinations that depend on:

- temporary preview hosts;
- build-specific URLs;
- expiring tokens for public content;
- duplicate rendering routes;
- query-only content identity.

If QR tracking is needed, prefer a tracking parameter or redirect layer that still preserves one canonical story URL.

Example:

```text
/qr/abc123  ->  /story/wedding-anniversary/
```

The destination story page should remain canonical.

Do not add `/qr/...` URLs to the sitemap unless they are intentionally public content pages in their own right.

---

# 11. Hreflang

Where equivalent localized pages exist, provide correct reciprocal `hreflang` alternates.

Rules:

- use only real published equivalents;
- localized pages should normally self-canonicalize;
- hreflang must be reciprocal;
- do not generate hreflang for missing translations;
- use language / region tags only when they reflect actual content;
- use `x-default` only when there is a clearly defined default destination.

For story pages, hreflang should connect the same story across languages, not merely pages with similar themes.

---

# Metadata and Page Semantics

# 12. Metadata

Every meaningful public page should support appropriate:

- `<title>`;
- meta description;
- canonical;
- Open Graph title;
- Open Graph description;
- Open Graph image;
- Twitter/X card metadata where relevant;
- locale information;
- alternate locale information where relevant.

Metadata should be generated from structured page/story data where practical.

Do not duplicate SEO strings unnecessarily across unrelated components.

Do not use generic titles such as:

```text
Story
Gallery
Moment
Aha
```

when a more descriptive factual title is available.

Avoid keyword stuffing.

---

# 13. Story Metadata

Each indexable story / moment page should have metadata that identifies the page meaningfully without exposing information that should remain private.

Potential inputs:

- public story title;
- occasion / theme;
- public date or year where appropriate;
- public location where appropriate;
- short factual summary;
- brand name.

Avoid exposing in metadata:

- private names not meant for public search;
- private addresses;
- hidden event details;
- access tokens;
- internal customer identifiers.

Metadata must follow the same privacy rules as visible page content.

---

# 14. Heading Structure

Every public page should have a clear semantic hierarchy.

Requirements:

- normally one meaningful `h1`;
- logical heading order;
- headings communicate content, not visual styling;
- story headings should help visitors understand the page;
- do not hide essential context only in images.

Example structure:

```text
H1: [Story / Moment title]
H2: The story
H2: Gallery
H2: Details / Memories / Highlights
H2: Related moments
```

The final structure must follow the actual content.

---

# Content Architecture

# 15. People-First Content

SEO content must primarily help people understand the experience, story, project, or brand.

Avoid:

- keyword stuffing;
- generic AI filler;
- repeated city / event keyword lists;
- duplicate story intros;
- artificial long-form text;
- hidden SEO-only sections;
- invented testimonials;
- invented event details;
- invented customer results.

Prefer:

- real story context;
- concise meaningful copy;
- factual captions;
- clear dates / locations where public;
- useful navigation;
- transparent explanation of the product / experience;
- relevant FAQs on main public pages;
- verified story facts;
- meaningful image descriptions.

---

# 16. Search Intent

The project should target search intent that matches what it actually offers.

Possible intent categories may include, where factually supported:

- digital memories;
- visual stories;
- photo stories;
- QR-linked memories;
- digital keepsakes;
- event memories;
- personalized visual experiences;
- interactive story pages;
- digital photo albums;
- visual storytelling.

Do not add these terms mechanically.

Before optimizing for a search intent:

1. confirm that the product actually supports it;
2. confirm that the public page answers that intent;
3. use natural wording;
4. avoid exact-match repetition.

---

# 17. Main Information Architecture

The exact navigation is project-specific, but the SEO model should normally distinguish:

```text
Home
  ↓
How it works / Product explanation
  ↓
Examples / Public stories
  ↓
About / Brand information
  ↓
Contact / CTA
```

Story relationships may include:

```text
Public story
  ↓
Related story / collection
  ↓
Main project / brand page
```

Use descriptive internal link text.

Do not create excessive links solely for SEO.

---

# 18. Story / Moment Pages

A meaningful public story page should, where facts and privacy allow, explain enough context to stand on its own.

Potential elements:

- clear title;
- concise story summary;
- visual gallery;
- captions;
- relevant date / place;
- context around the moment;
- relationship to a collection;
- brand attribution;
- relevant call to action;
- social preview image;
- structured data.

Do not require users or crawlers to infer the entire meaning from image filenames.

A story page intended for search indexing should contain enough unique visible text to avoid becoming a thin gallery shell.

This does not mean adding filler.

A concise but unique story description is preferable to generic SEO copy.

---

# 19. Thin and Duplicate Story Content

Story-driven products can accidentally produce large numbers of near-identical pages.

Avoid indexable pages that differ only by:

- customer name;
- one image;
- a short identifier;
- a QR code;
- a date;
- duplicated boilerplate.

When many pages are structurally similar, ensure indexable pages contain genuine unique value.

If a page is useful only as a private or QR destination and has little public search value, `noindex` may be more appropriate than adding filler text.

Never solve thin content by inventing story details.

---

# 20. Internal Linking

Internal linking should communicate real relationships.

Useful relationships may include:

```text
Home → How it works
Home → Public examples
Public example → Product explanation
Public example → Related collection
About → Contact
FAQ → Relevant explanatory page
```

Story pages do not all need to link to every other story.

Avoid automatically generating huge cross-link blocks solely to increase crawl depth.

---

# Image SEO

# 21. Images Are a First-Class SEO Asset

Because the project is visual, image SEO is a primary requirement.

Images should use:

- descriptive filenames where practical;
- accurate `alt` text for informative images;
- empty `alt=""` for decorative images;
- optimized formats;
- appropriate intrinsic dimensions;
- responsive `srcset` / sizing where supported;
- lazy loading below the fold where appropriate;
- eager / priority loading only for true critical images;
- stable aspect ratios to reduce layout shift.

Do not stuff keywords into filenames or alt text.

---

# 22. Alt Text

Alt text should describe the useful content or function of an image in context.

Good alt text is:

- concise;
- factual;
- context-aware;
- accessible;
- not repetitive.

Avoid:

- keyword lists;
- repeating the entire caption;
- phrases like `image of` unless context requires it;
- exposing private personal details;
- adding names that are not publicly approved.

Decorative visual elements should usually use empty alt text.

---

# 23. Image Captions

Where a caption adds real meaning, prefer visible captions over hiding all context in metadata.

Captions can help:

- people understand the story;
- accessibility;
- image retrieval;
- AI retrieval systems;
- social context.

Do not generate captions solely for ranking.

---

# 24. Image URLs and Stability

Important public images should use stable crawlable URLs.

Avoid relying exclusively on:

- expiring signed URLs;
- temporary CDN preview URLs;
- build-hash-only references that cannot be discovered consistently;
- authenticated image endpoints for public indexable pages.

If public images are hosted through an external image service, ensure search crawlers can access the rendered resources.

---

# 25. Image Privacy

Do not make an image search-discoverable merely because the parent page is technically public.

Before exposing personal images to search:

- confirm the publication model;
- confirm owner / client intent;
- consider whether `noindex` is required;
- consider whether the image itself should be publicly crawlable.

A public QR experience and a search-indexed public story are not automatically the same thing.

---

# Open Graph and Social Sharing

# 26. Social Preview Is a Core Product Surface

Every important public story should have a deliberate social preview.

Potential fields:

- `og:title`;
- `og:description`;
- `og:url`;
- `og:type`;
- `og:image`;
- image width / height where supported;
- locale;
- alternate locales.

The preview should represent the actual destination.

Do not expose private images or private names through Open Graph metadata if they should not appear on social platforms.

---

# 27. Open Graph Images

For story pages, prefer a deliberate crop-safe preview rather than blindly reusing the first gallery image.

Requirements:

- readable at small sizes;
- stable public URL;
- appropriate aspect ratio;
- no critical content near crop edges;
- limited text;
- visual consistency with the brand;
- no hidden personal information.

If a story is private or `noindex`, social-preview behavior still needs explicit consideration because messaging platforms may fetch metadata.

---

# Entity Architecture and Structured Data

# 28. Structured Data Principles

Structured data must reflect only real visible public facts.

It should improve entity clarity, not manipulate rankings.

Use centralized project data where practical.

Use stable `@id` values.

Avoid duplicate conflicting graph nodes across locales.

Do not add schema types because they sound beneficial for SEO.

---

# 29. Preferred Core Entity Model

The default conceptual model for Aha Visuals of Moments is:

```text
Organization or Brand
WebSite
WebPage
CreativeWork / Article — only where semantically appropriate
ImageObject — where useful
BreadcrumbList — where appropriate
```

The exact schema type must follow the actual project/business model.

Do not automatically copy:

```text
Person
Service
LocalBusiness
ProfessionalService
Product
Review
AggregateRating
```

from another project.

Use them only when factual content and current structured-data guidance support them.

---

# 30. Organization / Brand Entity

Use an `Organization` or `Brand` entity only when it accurately represents the public project identity.

Potential properties:

- `@id`;
- `name`;
- `url`;
- `logo`;
- `sameAs`;
- `description`;
- public contact data where approved.

Do not invent:

- company registration facts;
- founder data;
- telephone numbers;
- addresses;
- social profiles.

If the project is a product operated by another legal entity, model that relationship only when verified.

---

# 31. WebSite Entity

The website entity should normally include:

- `@type: WebSite`;
- stable `@id`;
- production `url`;
- project `name`;
- publisher / creator reference where factual.

Do not add `SearchAction` unless the website has a real internal search function represented accurately.

---

# 32. Story Page Entity

Every public page may use `WebPage`.

A story page may additionally use a more specific schema type only when the content genuinely matches it.

Possible candidates:

- `Article`;
- `CreativeWork`;
- `CollectionPage`;
- `ImageGallery`.

Choose semantics based on real content rather than perceived ranking benefit.

A story entity may reference:

- headline / name;
- description;
- primary image;
- date where public;
- creator / publisher;
- `isPartOf`;
- `inLanguage`;
- related images.

Do not expose hidden customer data through JSON-LD.

---

# 33. ImageObject

Important public images may be represented as `ImageObject` when it improves semantic clarity.

Possible properties:

- `contentUrl`;
- `url`;
- `caption`;
- `name`;
- `width`;
- `height`;
- `encodingFormat`;
- creator / copyright information where verified.

Do not fabricate licensing, copyright ownership, creator, or location metadata.

---

# 34. Structured Data by Page

Recommended direction:

### Home

- Organization or Brand, where verified;
- WebSite;
- WebPage.

### About / Project page

- Organization or Brand;
- WebPage;
- BreadcrumbList where appropriate.

### Public story page

- WebPage;
- CreativeWork / Article / ImageGallery only when appropriate;
- ImageObject where useful;
- BreadcrumbList where appropriate.

### Contact

- Organization / Brand reference where factual;
- WebPage;
- public contact data only when approved.

### Private / noindex story

Structured data should not turn a private page into a public-discovery surface.

Do not add rich schema merely to a page that intentionally should not be found through search.

---

# 35. Stable @id Values

Use production-origin stable IDs.

Examples:

```text
https://<production-origin>/#website
https://<production-origin>/#organization
https://<production-origin>/story/example/#webpage
https://<production-origin>/story/example/#story
```

Only create IDs for entities that actually exist in the graph.

Use the same core entity IDs across locales where they represent the same entity.

---

# 36. sameAs

Use `sameAs` only for verified pages or profiles representing the same entity.

Potential sources may include:

- official social profiles;
- official portfolio profiles;
- official business / project profiles;
- verified media profiles.

Do not use:

- random directories;
- scraped profiles;
- unverified pages;
- similar-name entities.

---

# 37. Prohibited Structured Data Claims

Do not fabricate:

- addresses;
- phone numbers;
- reviews;
- ratings;
- awards;
- customer counts;
- event attendance;
- image rights;
- creator credits;
- publication dates;
- locations;
- company registration details;
- prices;
- external profiles;
- relationships between people.

Structured data is not a place to make the page look “SEO-complete.”

---

# Public Stories and Privacy

# 38. Indexability Matrix

Every story type should have an explicit indexing rule.

Example:

| Story type | Crawl | Index | Sitemap | Social preview |
|---|---|---|---|---|
| Public showcase | Yes | Yes | Yes | Yes |
| Public QR-only | Yes | Usually No unless approved | Usually No | Case-by-case |
| Private authenticated | No public crawl | No | No | No |
| Draft / preview | No | No | No | No |
| Archived public | Case-by-case | Case-by-case | If indexable | Case-by-case |

This is a decision framework, not a hard-coded project fact.

The final status must follow product and privacy requirements.

---

# 39. noindex

Use `noindex` when a page is accessible but should not appear in search results.

Typical candidates may include:

- private-style QR pages;
- customer proofs;
- temporary previews;
- duplicate alternate render routes;
- incomplete stories;
- admin-like public previews.

Do not rely on `robots.txt` alone to remove an already known URL from search.

Do not put intentionally `noindex` pages in the XML sitemap.

---

# 40. Authentication and Secret URLs

A hard-to-guess URL is not authentication.

If content must be private, use actual access control.

SEO controls such as:

- `noindex`;
- `robots.txt`;
- canonical;

do not provide confidentiality.

Never expose private access tokens in:

- canonical URLs;
- sitemap;
- hreflang;
- structured data;
- Open Graph;
- `llms.txt`.

---

# Sitemap, Robots, and Indexability

# 41. Sitemap

Generate an XML sitemap for intended indexable public pages.

Requirements:

- use production URLs;
- include only canonical public pages;
- include localized equivalents where appropriate;
- include indexable public story pages;
- exclude private stories;
- exclude `noindex` pages;
- exclude preview routes;
- exclude admin/development routes;
- exclude QR redirect URLs unless intentionally indexable content;
- remain synchronized with routing and publication status.

If the number of public stories becomes large, use scalable sitemap generation.

---

# 42. Robots

Provide valid `robots.txt`.

Requirements:

- allow intended public crawling;
- reference sitemap where appropriate;
- prevent accidental indexing behavior in non-production environments;
- do not use robots as authentication;
- do not accidentally block CSS, JS, image resources, or metadata assets required for rendering;
- treat search crawlers and AI training crawlers as separate policy decisions.

Do not block a page in robots if the desired mechanism requires crawlers to see a `noindex` directive.

---

# 43. Staging and Preview Environments

Staging / preview environments must not compete with production search results.

Review:

- `noindex`;
- robots behavior;
- canonical origin;
- environment-specific metadata;
- sitemap generation;
- structured data;
- Open Graph URLs;
- image URLs.

Preview deployments must not emit themselves as canonical production pages.

Do not allow temporary hosting domains to become indexed public alternatives.

---

# 44. Production Origin

The production origin must be stored centrally.

Do not hard-code a domain from another project.

Until the production domain is explicitly confirmed in project configuration, use a centralized placeholder / environment configuration rather than inventing a canonical domain.

All SEO URL generation should derive from that production origin.

---

# URL Stability

# 45. URL Stability

Public story URLs are long-term interfaces.

This is especially important when URLs are printed into QR codes.

Avoid changing a public QR-linked URL without a migration plan.

If a public route changes:

- preserve the old QR destination;
- add an appropriate permanent redirect where safe;
- update canonical;
- update sitemap;
- update hreflang;
- update internal links;
- update structured-data URLs;
- update Open Graph URLs;
- update `llms.txt` if referenced;
- preserve story identity.

A printed QR code may remain in circulation for years.

Treat QR destination stability as a higher-than-normal compatibility requirement.

---

# 46. Slugs

Story slugs should be:

- stable;
- human-readable where appropriate;
- URL-safe;
- not overloaded with keywords;
- not based on private identifiers;
- not casually regenerated when titles change.

If a title changes, do not automatically change the public slug unless there is a strong reason.

Avoid exposing sequential internal database IDs when a public slug / opaque public ID is more appropriate.

---

# Performance and Rendering

# 47. Crawlable HTML

Critical public SEO content should be available in rendered HTML without requiring unnecessary client-side interaction.

Prefer server rendering or static generation for:

- title / metadata;
- main story heading;
- summary;
- captions where public;
- internal links;
- structured data.

Do not hide critical story meaning behind JavaScript-only interactions.

---

# 48. Core Performance Priorities

For a visual project, performance requires special attention.

Prioritize:

- optimized image formats;
- responsive images;
- lazy loading below the fold;
- avoiding oversized original uploads in layout;
- reserving image dimensions;
- limiting unnecessary client JavaScript;
- preloading only true critical assets;
- caching static assets;
- avoiding layout shift;
- avoiding autoplay-heavy media where unnecessary.

Performance optimization must preserve image quality appropriate to the product.

---

# 49. Hero / LCP Image

The primary above-the-fold image may become the Largest Contentful Paint element.

Requirements:

- serve an appropriately sized asset;
- avoid lazy loading the actual LCP image;
- provide dimensions / aspect ratio;
- use responsive image delivery;
- avoid loading multiple competing high-resolution hero images;
- avoid unnecessary client-side image replacement after initial render.

---

# AI Search / LLM Discovery

# 50. AI Search Optimization Principle

AI-search optimization uses the same factual public foundation as traditional SEO.

Prefer:

- crawlable pages;
- explicit project identity;
- descriptive headings;
- factual story summaries;
- meaningful captions;
- stable URLs;
- structured entity relationships;
- concise FAQs where useful;
- authoritative public examples.

Do not create an alternate AI-only version of the project.

---

# 51. Content for Retrieval Systems

Public pages should be easy for retrieval systems to understand.

Prefer:

- explicit project name;
- clear explanation of what Aha Visuals of Moments is;
- clear story titles;
- concise factual summaries;
- descriptive image context;
- meaningful relationships between collection/story/brand;
- stable public links.

Avoid:

- vague marketing-only copy;
- unsupported superlatives;
- critical facts rendered only after client-side interaction;
- hidden context;
- contradictory descriptions across pages.

---

# 52. AI Factual Reference Page

A public factual reference page may be added later if it provides real human value.

Its purpose could be to summarize durable public facts such as:

- project name;
- what the product / experience is;
- who operates it, if public;
- how it works;
- supported languages;
- types of public experiences;
- contact / official links;
- selected public examples.

Rules:

- it must be a normal human-readable page;
- do not duplicate large amounts of existing copy;
- do not invent facts;
- use the same centralized source-of-truth data;
- do not turn it into doorway content;
- do not expose private story data.

The route must be explicitly approved before implementation if it is not already part of project architecture.

---

# 53. llms.txt

`/llms.txt` may be maintained as an experimental AI-discovery / navigation aid.

It should:

- identify Aha Visuals of Moments;
- explain the public site's authoritative subject area;
- link to important durable public pages;
- link only to public content;
- remain concise and factual;
- derive facts from the same source of truth as the website.

Potential links:

- Home;
- About / How it works;
- public examples;
- FAQ;
- Contact;
- factual project page if one exists.

Do not include:

- private story URLs;
- customer-only QR URLs;
- access tokens;
- draft pages;
- hidden marketing claims.

Do not treat `llms.txt` as:

- a sitemap replacement;
- robots replacement;
- canonical replacement;
- structured-data replacement;
- guaranteed ranking factor.

Verify the current emerging specification before significant implementation changes.

---

# 54. AI Crawler Access

Do not make AI crawler policy changes accidentally.

Review separately:

- normal search crawlers;
- AI search / retrieval crawlers;
- AI training crawlers.

A policy decision for training access must not accidentally block normal search visibility.

If AI search discovery is intended, verify that relevant retrieval crawlers are not unintentionally blocked.

---

# Social, Share, and QR Discovery

# 55. Share URLs

Share URLs should normally resolve to the canonical public story page.

Avoid generating a new indexable URL for each share action.

If tracking is required:

```text
/story/example/?utm_source=...
```

should still canonicalize to:

```text
/story/example/
```

Do not place tracking parameters in canonical or hreflang URLs.

---

# 56. Messaging App Preview Behavior

Messaging apps and social platforms may request page metadata independently of search engines.

For QR / share pages, verify that:

- title is appropriate;
- description is appropriate;
- preview image is safe to expose;
- private names are not unintentionally revealed;
- temporary preview hosts are not used;
- metadata resolves without client-side interaction where possible.

---

# 57. Public Examples

If the project uses public stories as examples, they should be explicitly identified as public showcase content.

Do not use a customer's private story as marketing / SEO content unless publication is approved.

Public example pages should have enough context to make sense independently.

---

# Accessibility and SEO

# 58. Accessibility Supports Discoverability

SEO implementation should not reduce accessibility.

Requirements include:

- semantic headings;
- meaningful alt text;
- keyboard-accessible controls;
- descriptive link labels;
- sufficient visible text for key concepts;
- captions / transcripts for media when appropriate;
- no essential meaning encoded only by color or animation.

Do not hide textual context merely to achieve a minimalist visual aesthetic.

---

# 59. Motion and Interactive Stories

Interactive visual effects may be central to the product, but essential content should remain understandable when:

- JavaScript is delayed;
- animation is disabled;
- reduced-motion preferences are active;
- a crawler does not execute every interaction.

Use progressive enhancement where practical.

---

# External Profiles and Brand Consistency

# 60. External Entity Consistency

Where official public profiles exist, keep core identity consistent:

- project name;
- logo;
- production URL;
- description;
- public contact information;
- social profile links.

Do not create fake external profiles or directory citations for SEO.

There is no requirement to create a Google Business Profile unless the actual business model justifies it.

---

# 61. Google Business Profile

Google Business Profile is **not a default SEO requirement** for Aha Visuals of Moments.

Only add GBP-specific rules if the project represents an eligible real-world business and the profile actually exists.

Do not copy local-business schema, service-area assumptions, opening hours, or location data from another project.

---

# 62. Local SEO

Local SEO is not a default priority unless the project intentionally targets a physical or regional commercial market.

If local intent becomes part of the business model later:

- define the real operating geography;
- verify address / service-area policy;
- align public site and external profile facts;
- avoid mass-generated city landing pages.

Until then, do not add location terms simply for ranking coverage.

---

# Content Safety and Factual Integrity

# 63. Personal Story Facts

Never invent:

- names;
- relationships;
- dates;
- locations;
- event details;
- quotes;
- memories;
- captions;
- customer statements.

If a fact is unavailable, omit it or mark it as needing confirmation in internal content workflows.

Do not guess personal context from images.

---

# 64. Testimonials and Reviews

Never fabricate:

- testimonials;
- reviews;
- star ratings;
- review counts;
- endorsements.

Do not add `Review` or `AggregateRating` structured data unless it is technically appropriate, public, and supported by real data.

---

# 65. Copyright and Media Ownership

Do not imply rights that have not been verified.

Do not populate structured data with invented:

- copyright owners;
- creators;
- licenses;
- usage rights.

Where rights information is available, represent it consistently.

---

# Technical Routing Requirements

# 66. Next.js / App Router Considerations

If the project continues to use Next.js App Router, SEO implementation should prefer framework-native metadata and routing mechanisms.

Review, where applicable:

- `metadata` / `generateMetadata`;
- canonical and alternate generation;
- sitemap route;
- robots route;
- static params for public stories;
- server vs. client component boundaries;
- image optimization;
- route caching / revalidation;
- status codes for missing or private stories.

Do not move SEO-critical metadata generation into client-only components.

If the stack changes, preserve the SEO principles rather than the framework-specific implementation.

---

# 67. Missing and Deleted Stories

A missing story must return an appropriate status.

Avoid soft 404 pages that return `200` for content that does not exist.

For permanently removed public stories:

- return `410` when intentionally gone and appropriate; or
- return `404`; or
- redirect only when there is a genuinely relevant replacement.

Do not redirect every missing story to the homepage.

For temporarily unavailable content, use the correct temporary behavior rather than creating a misleading permanent redirect.

---

# 68. Archived QR Destinations

Because physical QR codes may outlive content changes, deleted QR-linked stories require special handling.

Before removing a QR destination:

1. determine whether printed QR codes still exist;
2. determine whether the story must remain accessible;
3. consider an archive page or maintained redirect;
4. preserve privacy requirements;
5. avoid breaking the user experience unnecessarily.

A URL may need to remain functional even when it is no longer indexable.

---

# 69. Query Parameters

Query parameters must not create duplicate search pages.

Examples:

```text
?utm_source=
?utm_medium=
?share=
?ref=
```

should generally preserve the canonical clean URL.

Parameters that materially change public page content require explicit SEO review.

Do not include tracking parameters in sitemap URLs.

---

# 70. Pagination and Galleries

If galleries use pagination or infinite loading:

- ensure important public images remain discoverable;
- provide crawlable pagination or server-rendered access when needed;
- do not rely exclusively on user interaction to reveal all indexable content;
- avoid generating thousands of thin paginated pages without value.

If the gallery is primarily experiential and not intended for search, prioritize UX and privacy over aggressive indexation.

---

# Validation

# 71. Required Validation After Meaningful SEO Changes

After meaningful SEO, routing, localization, story-publication, schema, image, or AI-discovery changes, verify:

1. production origin is correct.
2. no placeholder domain remains in production metadata.
3. every indexable page has a correct title.
4. every indexable page has a useful meta description where appropriate.
5. canonical URLs are self-consistent.
6. tracking parameters do not become canonical identities.
7. QR routes do not create duplicate indexable pages.
8. localized routes work as intended.
9. hreflang relationships are reciprocal where implemented.
10. hreflang exists only for real equivalent pages.
11. `x-default` matches the approved locale strategy.
12. sitemap contains only intended indexable public pages.
13. private / `noindex` stories are excluded from the sitemap.
14. preview / staging URLs are not indexable.
15. preview domains do not become canonical.
16. robots configuration is correct.
17. `noindex` pages are not blocked in a way that prevents crawlers from seeing the directive.
18. missing stories return appropriate HTTP status codes.
19. public story content is available without unnecessary client-only rendering.
20. Open Graph URLs use production URLs.
21. Open Graph images are public, stable, and safe to expose.
22. important images have correct dimensions and responsive behavior.
23. informative images use meaningful alt text.
24. decorative images do not contain misleading alt text.
25. structured data uses only verified facts.
26. stable entity `@id` values are used.
27. private data is absent from JSON-LD.
28. public story schema matches actual page semantics.
29. external `sameAs` links are verified.
30. no fake reviews / ratings are present.
31. no accidental LocalBusiness / service-area data was copied from another project.
32. QR-linked legacy routes continue to work when required.
33. URL changes include appropriate redirects.
34. Core Web Vitals risk from large images is reviewed.
35. LCP image behavior is appropriate.
36. `llms.txt`, if implemented, includes only public supported facts.
37. private story URLs are absent from `llms.txt`.
38. AI crawler policy is deliberate.
39. social previews do not leak private information.
40. project documentation is updated when a significant SEO decision is finalized.

---

# 72. Validation for Story Publication

Before changing a story from private / noindex to public indexable, verify:

- publication is intended;
- all text is approved;
- all images are approved for public discovery;
- metadata is safe;
- Open Graph image is safe;
- canonical is correct;
- sitemap inclusion is intended;
- hreflang equivalents are correct;
- schema contains no private fields;
- internal links expose the page intentionally.

Indexability is a publishing action.

Treat it accordingly.

---

# External Verification

# 73. Verify Current Requirements

SEO platform behavior changes.

Before implementation depends on current behavior from:

- Google Search;
- Google Images;
- Google structured-data documentation;
- Search Console;
- Bing Webmaster Tools;
- schema.org;
- sitemap standards;
- robots standards;
- Next.js SEO APIs;
- Open Graph consumers;
- AI crawler policies;
- `llms.txt` conventions;

verify current authoritative documentation rather than relying only on historical assumptions.

Prefer first-party / official sources for implementation-critical decisions.

---

# Scope Control

# 74. Scope

This skill defines SEO, localization, story indexing, image SEO, entity, social-preview, QR URL, and AI-discovery rules.

It does **not** automatically authorize:

- publishing private stories;
- changing a page from `noindex` to indexable;
- creating new locale versions;
- changing the production domain;
- changing public story URLs;
- changing printed QR destinations;
- exposing customer names;
- exposing personal images to search;
- adding external profiles;
- adding reviews or rating markup;
- creating local landing pages;
- creating a Google Business Profile;
- adding LocalBusiness schema;
- publishing a factual AI reference page at a new route;
- changing AI crawler policy;
- creating large-scale SEO content.

These require explicit task scope or project approval.

---

# 75. Migration Rules

When adapting code or SEO logic from another project:

Do not copy project-specific facts such as:

- domain;
- business name;
- service area;
- address;
- phone;
- Google Business Profile;
- founder identity;
- service catalog;
- locale defaults;
- canonical root;
- schema IDs.

Copy reusable principles, not foreign entity data.

Every project-specific value must come from Aha Visuals of Moments configuration or verified project documentation.

---

# Implementation Philosophy

# 76. Final Principle

The preferred implementation is:

**one project identity → one public factual source of truth → multiple consistent discovery surfaces.**

Those surfaces may include:

- the human-facing website;
- public story pages;
- localized pages;
- image search;
- structured data;
- Open Graph / social sharing;
- QR entry points;
- sitemap / robots;
- external authoritative profiles;
- `llms.txt`;
- AI-friendly factual public content.

They must reinforce each other rather than create competing versions of the project.

When in doubt:

1. preserve privacy and publication intent;
2. preserve factual accuracy;
3. preserve stable QR-linked URLs;
4. preserve canonical identity;
5. preserve user value;
6. preserve entity consistency;
7. avoid manipulative SEO shortcuts;
8. verify current platform requirements before implementing uncertain behavior.
