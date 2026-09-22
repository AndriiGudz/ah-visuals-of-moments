# AH Visuals of Moments — Content Model

## 1. Purpose

This document defines the content structure for the AH Visuals of Moments MVP.

The model must support:

- photography collections;
- individual photograph and T-shirt story pages;
- English and Russian localization;
- future Ukrainian, French, and German translations;
- permanent QR identifiers;
- changeable public slugs;
- original photographs and T-shirt mockups;
- geographic coordinates and external map links;
- future external purchase links;
- future migration from repository-based content to a CMS.

The MVP should remain simple, static, and easy to maintain in Git.

---

## 2. Core entities

The initial content model contains four primary entities:

1. `Collection`
2. `Story`
3. `StoryTranslation`
4. `ImageAsset`

A `Story` represents one unique photograph and one corresponding unisex T-shirt design.

One story may contain several T-shirt mockups in different colors, but all variants share:

- one permanent story ID;
- one public story page per language;
- one QR code;
- one location;
- one author story.

---

## 3. Supported locales

```ts
export const supportedLocales = [
  "en",
  "ru",
  "uk",
  "fr",
  "de",
] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "en";
```

### MVP locales

```ts
export const activeLocales = ["en", "ru"] as const;
```

### Rules

- English is the default and fallback locale.
- Russian is available in the MVP.
- Ukrainian, French, and German are reserved for later.
- Missing translations must fall back to English.
- Source texts may initially be written in Russian.
- Translations are stored before publication and are not generated dynamically during page visits.

---

## 4. Collection model

A collection groups stories by a shared period, mood, location, visual concept, or artistic theme.

```ts
export interface Collection {
  id: string;
  slug: string;
  status: ContentStatus;
  year?: number;
  coverImage: ImageAsset;
  storyIds: string[];
  translations: Partial<Record<Locale, CollectionTranslation>>;
  seo?: Partial<Record<Locale, SeoMetadata>>;
  createdAt: string;
  updatedAt: string;
}
```

### Collection translation

```ts
export interface CollectionTranslation {
  title: string;
  shortDescription?: string;
  description?: string;
}
```

### Initial example

```ts
export const summer2019Collection: Collection = {
  id: "summer-2019",
  slug: "summer-2019",
  status: "published",
  year: 2019,
  coverImage: {
    id: "summer-2019-cover",
    src: "/images/collections/summer-2019/cover.jpg",
    kind: "collection-cover",
    width: 1600,
    height: 1200,
    alt: {
      en: "Summer evening sky in Kyiv",
      ru: "Летнее вечернее небо в Киеве",
    },
  },
  storyIds: ["AH001"],
  translations: {
    en: {
      title: "Summer 2019",
      shortDescription: "A collection of quiet summer moments.",
    },
    ru: {
      title: "Лето 2019",
      shortDescription: "Коллекция тихих летних моментов.",
    },
  },
  createdAt: "2026-08-05T00:00:00.000Z",
  updatedAt: "2026-08-05T00:00:00.000Z",
};
```

---

## 5. Story model

A story is the main content entity.

It represents:

- one original photograph;
- one T-shirt design;
- one permanent QR code;
- one physical location;
- one personal story;
- several visual mockups.

```ts
export interface Story {
  id: StoryId;
  slug: string;
  collectionId: string;
  status: ContentStatus;
  dateLabel: string;
  year?: number;
  location: LocationData;
  mainImage: ImageAsset;
  gallery: ImageAsset[];
  mockups: ProductMockup[];
  translations: Partial<Record<Locale, StoryTranslation>>;
  seo?: Partial<Record<Locale, SeoMetadata>>;
  qr: QrData;
  externalPurchaseUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Permanent story ID

```ts
export type StoryId = `AH${number}`;
```

Examples:

```text
AH001
AH002
AH003
```

### ID rules

- The ID is permanent.
- The ID must never be reused.
- The ID must never change after publication.
- The ID is used in the QR route.
- The slug may change independently of the ID.

---

## 6. Story translation

```ts
export interface StoryTranslation {
  title: string;
  eyebrow?: string;
  excerpt?: string;
  story: string;
  locationLabel?: string;
  dateLabel?: string;
  mapLinkLabel?: string;
  qrLabel?: string;
}
```

### Field guidance

- `title` — artistic or working title of the story.
- `eyebrow` — optional small label, such as the collection name.
- `excerpt` — short summary for cards and SEO previews.
- `story` — full author text.
- `locationLabel` — localized display label, if needed.
- `dateLabel` — localized date text, if different from the shared value.
- `mapLinkLabel` — for example, `Open in maps`.
- `qrLabel` — for example, `View QR code`.

### Working titles

Artistic titles are preferred but not required at the start.

Until the photographer approves a final title, use a concise working title based on:

- location;
- year;
- time of day;
- visual subject;
- short description.

Example:

```text
Summer Evening in Kyiv
```

---

## 7. Location model

```ts
export interface LocationData {
  city: string;
  region?: string;
  country: string;
  countryCode: string;
  coordinates: Coordinates;
  mapUrl: string;
  visibility: "exact" | "approximate" | "hidden";
}
```

### Coordinates

```ts
export interface Coordinates {
  latitude: number;
  longitude: number;
}
```

### Example

```ts
const location: LocationData = {
  city: "Kyiv",
  country: "Ukraine",
  countryCode: "UA",
  coordinates: {
    latitude: 50.451974,
    longitude: 30.526393,
  },
  mapUrl: "https://www.google.com/maps?q=50.451974,30.526393",
  visibility: "exact",
};
```

### Rules

- Coordinates are stored as numbers.
- Public formatting may use six decimal places.
- `mapUrl` opens an external map service.
- `visibility` is included now to support possible future privacy requirements.
- The MVP may use `exact` for all initial stories.

---

## 8. Image asset model

```ts
export interface ImageAsset {
  id: string;
  src: string;
  kind: ImageKind;
  width: number;
  height: number;
  alt: Partial<Record<Locale, string>>;
  caption?: Partial<Record<Locale, string>>;
  blurDataUrl?: string;
  priority?: boolean;
}
```

### Image kinds

```ts
export type ImageKind =
  | "original-photo"
  | "collection-cover"
  | "story-gallery"
  | "tshirt-mockup"
  | "detail"
  | "logo";
```

### Rules

- The original photograph must remain visually distinct from product mockups.
- Do not apply filters that alter the photograph.
- Store width and height to prevent layout shifts.
- Every public image must have meaningful alt text.
- `priority` should only be used for important above-the-fold images.
- Images should be optimized for responsive delivery.

---

## 9. Product mockup model

```ts
export interface ProductMockup {
  id: string;
  image: ImageAsset;
  color?: ProductColor;
  order: number;
}
```

### Optional color metadata

```ts
export interface ProductColor {
  name?: Partial<Record<Locale, string>>;
  internalName?: string;
  hex?: string;
}
```

### MVP rules

- Exact color names are optional.
- Mockup images may be displayed without a visible color label.
- Product sizes are not stored or displayed in the MVP.
- All color variants share the same story and QR code.

---

## 10. QR model

```ts
export interface QrData {
  qrId: string; // Permanent immutable identifier (e.g. "AH001")
  path: string; // Permanent route, e.g. "/q/AH001"
  downloadFileName: string;
  enabled: boolean;
}
```

### Example

```ts
const qr: QrData = {
  qrId: "AH001",
  path: "/q/AH001",
  downloadFileName: "AH001-summer-evening-kyiv",
  enabled: true,
};
```

### QR rules

- Production domain: `https://ah-visuals.com`.
- QR codes must point to the permanent route `https://ah-visuals.com/q/[qrId]`.
- QR codes must not point directly to `/[locale]/moments/[slug]` or `/moments/[slug]`.
- The `/q/[qrId]` route strictly looks up the story by its immutable `qrId` (`AH001`).
- The route detects the preferred browser language (cookie `NEXT_LOCALE` → `Accept-Language` → `defaultLocale`).
- The route issues a `307 Temporary Redirect` to the canonical story page.
- Unknown QR IDs return HTTP 404 (no soft 404, no redirect to home).
- SVG is the preferred downloadable format.
- PNG (2048x2048 px) is provided as an additional format.

---

## 11. SEO & Indexability model

```ts
export interface SeoMetadata {
  title: string; // Clean story title (brand suffix applied via template)
  description: string;
  image?: string;
  isIndexable: boolean; // Explicit search indexability control
}
```

### Rules

- Story indexability is determined jointly: `ALLOW_INDEXING && status === "published" && isIndexable === true`.
- If `isIndexable === false` or `status === "archived"`: page returns `HTTP 200` with `<meta name="robots" content="noindex, follow">`.
- Only stories with `status === "published" && isIndexable === true` are included in `sitemap.xml`.
- Each published story should have localized page title, meta description, Open Graph, canonical URL, and alternate hreflang links.

---

## 12. Content status & Lifecycle

```ts
export type ContentStatus =
  | "draft"
  | "review"
  | "published"
  | "archived";
```

### Meaning & Lifecycle Matrix

| Status | isIndexable | Direct URL | /q/[qrId] | Sitemap | Collection Grid | Robots |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `draft` | false | 404 | 404 | No | No | N/A |
| `review` | false | 404 | 404 | No | No | N/A |
| `published` | true | 200 | 307 → 200 | **Yes** | **Yes** | index, follow |
| `published` | false | 200 | 307 → 200 | No | **Yes** | noindex, follow |
| `archived` | false | 200 | 307 → 200 | No | No | noindex, follow |

### Important rule

`archived` ≠ `deleted`.
An archived story with an already printed QR code must remain accessible at `HTTP 200` via its direct URL and `/q/[qrId]`, but is excluded from public search indexation (`noindex, follow`), sitemaps, and the public Collection showcase.

---

## 13. Example story

```ts
export const summerEveningKyiv: Story = {
  id: "AH001",
  slug: "summer-evening-kyiv",
  collectionId: "summer-2019",
  status: "published",
  dateLabel: "Summer 2019",
  year: 2019,

  location: {
    city: "Kyiv",
    country: "Ukraine",
    countryCode: "UA",
    coordinates: {
      latitude: 50.451974,
      longitude: 30.526393,
    },
    mapUrl: "https://www.google.com/maps?q=50.451974,30.526393",
    visibility: "exact",
  },

  mainImage: {
    id: "AH001-original",
    src: "/images/stories/AH001/original.jpg",
    kind: "original-photo",
    width: 1600,
    height: 1200,
    alt: {
      en: "Pink, purple and golden evening sky above Kyiv",
      ru: "Розовое, фиолетовое и золотое вечернее небо над Киевом",
    },
    priority: true,
  },

  gallery: [],

  mockups: [
    {
      id: "AH001-mockup-black",
      image: {
        id: "AH001-mockup-black-image",
        src: "/images/stories/AH001/mockup-black.jpg",
        kind: "tshirt-mockup",
        width: 1400,
        height: 1600,
        alt: {
          en: "Black unisex T-shirt with the Summer 2019 photograph",
          ru: "Чёрная унисекс-футболка с фотографией из серии «Лето 2019»",
        },
      },
      color: {
        internalName: "black",
        name: {
          en: "Black",
          ru: "Чёрный",
        },
        hex: "#111111",
      },
      order: 1,
    },
  ],

  translations: {
    en: {
      title: "Summer Evening in Kyiv",
      excerpt:
        "An ordinary evening became a lasting memory when the city sky turned pink, purple and gold.",
      story:
        "I was returning home after work. It was an ordinary evening, no different from hundreds of others. I was walking familiar streets, lost in my thoughts, barely noticing what was happening around me. Then I looked up and saw the sky. Pink, purple and golden shades seemed to stop the entire city for a few minutes. Cars kept moving and people hurried home while I took out my phone and captured the moment. I did not yet know that years later this photograph would become part of my story. Sometimes the most beautiful moments happen when you least expect them.",
      mapLinkLabel: "Open in maps",
      qrLabel: "View QR code",
    },

    ru: {
      title: "Летний вечер в Киеве",
      excerpt:
        "Обычный вечер стал частью истории, когда небо над городом окрасилось в розовые, фиолетовые и золотые оттенки.",
      story:
        "Я возвращалась домой после работы. Это был обычный вечер, ничем не отличавшийся от сотен других. Я шла по знакомым улицам, думала о своём и почти не обращала внимания на то, что происходило вокруг. Но в какой-то момент подняла глаза и увидела небо. Оно было невероятным. Розовые, фиолетовые и золотые оттенки словно на несколько минут остановили весь город. Машины продолжали ехать, люди спешили домой, а я просто достала телефон и сделала этот снимок. Тогда я ещё не знала, что спустя годы эта фотография станет частью моей истории. Иногда самые красивые моменты случаются именно тогда, когда меньше всего их ожидаешь.",
      mapLinkLabel: "Открыть на карте",
      qrLabel: "Посмотреть QR-код",
    },
  },

  seo: {
    en: {
      title: "Summer Evening in Kyiv | AH Visuals of Moments",
      description:
        "Discover the story behind a summer evening photograph taken in Kyiv in 2019 and the T-shirt created from that moment.",
      image: "/images/stories/AH001/original.jpg",
    },
    ru: {
      title: "Летний вечер в Киеве | AH Visuals of Moments",
      description:
        "История фотографии летнего вечернего неба, сделанной в Киеве в 2019 году, и созданной на её основе футболки.",
      image: "/images/stories/AH001/original.jpg",
    },
  },

  qr: {
    path: "/q/AH001",
    downloadFileName: "AH001-summer-evening-kyiv",
    enabled: true,
  },

  externalPurchaseUrl: null,
  createdAt: "2026-08-05T00:00:00.000Z",
  updatedAt: "2026-08-05T00:00:00.000Z",
};
```

---

## 14. Recommended repository structure

```text
content/
├── collections/
│   └── summer-2019.ts
├── stories/
│   └── AH001.ts
├── index.ts
└── schema.ts

public/
└── images/
    ├── brand/
    ├── collections/
    │   └── summer-2019/
    └── stories/
        └── AH001/
            ├── original.jpg
            ├── mockup-black.jpg
            ├── mockup-beige.jpg
            ├── mockup-light-brown.jpg
            └── mockup-khaki.jpg
```

---

## 15. Validation rules

The content layer should validate at build time that:

- every story ID is unique;
- every collection ID is unique;
- every slug is unique within its locale route;
- every story references an existing collection;
- every published story has an English translation;
- every published story has a main image;
- every image has width, height, and English alt text;
- every QR path matches the permanent story ID;
- coordinates are valid;
- every published collection references existing stories;
- no archived story with a permanent QR code becomes inaccessible.

Zod may be used to enforce these rules.

---

## 16. Migration readiness

The content model is designed so it can later be moved to a CMS or database without changing the public page structure.

Potential future additions:

- photographer-managed admin panel;
- scan analytics;
- external sales links;
- exact product color names;
- product availability;
- video clips;
- technical camera metadata;
- approximate or hidden locations;
- multiple product types per photograph;
- additional story authors;
- scheduled publication.

These additions are outside the current MVP.
