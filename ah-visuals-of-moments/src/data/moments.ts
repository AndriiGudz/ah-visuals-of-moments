import { Locale, defaultLocale } from "@/i18n/config";
import { RawMoment, Moment } from "@/types/moment";

export const RAW_MOMENTS: RawMoment[] = [
  {
    id: "AH001",
    slug: "moment-001",
    status: "published",
    createdAt: "2026-08-01T10:00:00.000Z",
    dateLabel: {
      en: "August 2026",
      ru: "Август 2026",
    },
    location: {
      city: {
        en: "Kyiv",
        ru: "Киев",
      },
      country: {
        en: "Ukraine",
        ru: "Украина",
      },
      countryCode: "UA",
      coordinates: {
        latitude: 50.4501,
        longitude: 30.5234,
      },
      mapUrl: "https://maps.google.com/?q=50.4501,30.5234",
      visibility: "exact",
    },
    mainImage: {
      id: "AH001-main",
      src: "data:image/svg+xml;charset=UTF-8,%3Csvg width='1200' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%231f1f22'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23a1a1aa'%3EMoment 001 — Photograph%3C/text%3E%3C/svg%3E",
      alt: {
        en: "Moment 001 Photograph",
        ru: "Снимок Момента 001",
      },
      width: 1200,
      height: 800,
    },
    mockups: [
      {
        id: "AH001-mockup-black",
        image: {
          id: "AH001-m1",
          src: "data:image/svg+xml;charset=UTF-8,%3Csvg width='800' height='1000' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%2318181b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23e4e4e7'%3EMoment 001 — T-Shirt Mockup (Black)%3C/text%3E%3C/svg%3E",
          alt: {
            en: "Moment 001 Black T-Shirt Mockup",
            ru: "Мокап чёрной футболки Момент 001",
          },
          width: 800,
          height: 1000,
        },
        color: {
          id: "black",
          name: {
            en: "Deep Black",
            ru: "Глубокий чёрный",
          },
          hex: "#18181b",
        },
      },
      {
        id: "AH001-mockup-ivory",
        image: {
          id: "AH001-m2",
          src: "data:image/svg+xml;charset=UTF-8,%3Csvg width='800' height='1000' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%233f3f46'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23fafafa'%3EMoment 001 — T-Shirt Mockup (Ivory)%3C/text%3E%3C/svg%3E",
          alt: {
            en: "Moment 001 Ivory T-Shirt Mockup",
            ru: "Мокап футболки цвета слоновой кости Момент 001",
          },
          width: 800,
          height: 1000,
        },
        color: {
          id: "ivory",
          name: {
            en: "Warm Ivory",
            ru: "Тёплая слоновая кость",
          },
          hex: "#f5f5f0",
        },
      },
    ],
    availableColors: [
      {
        id: "black",
        name: {
          en: "Deep Black",
          ru: "Глубокий чёрный",
        },
        hex: "#18181b",
      },
      {
        id: "ivory",
        name: {
          en: "Warm Ivory",
          ru: "Тёплая слоновая кость",
        },
        hex: "#f5f5f0",
      },
    ],
    availableSizes: ["S", "M", "L", "XL"],
    videoUrl: null,
    externalPurchaseUrl: null,
    qrPath: "/q/AH001",
    translations: {
      en: {
        title: "Moment 001",
        shortDescription:
          "A quiet summer evening sky over the historic city quarter.",
        story:
          "An ordinary evening walk turned into a lasting memory when the city sky unexpectedly illuminated in deep warm tones. The street below continued its normal pace, while above, time seemed to pause for a brief moment. This photograph captures that stillness.",
        seoTitle: "Moment 001 | AH Visuals of Moments",
        seoDescription:
          "A quiet summer evening sky over the historic city quarter.",
      },
      ru: {
        title: "Момент 001",
        shortDescription:
          "Тихое летнее вечернее небо над историческим кварталом города.",
        story:
          "Обычная вечерняя прогулка превратилась в особенный момент, когда небо над городом неожиданно окрасилось в глубокие тёплые тона. Улица внизу продолжала жить в обычном ритме, пока вверху время на миг остановилось. Эта фотография сохраняет ту тишину.",
        seoTitle: "Момент 001 | AH Visuals of Moments",
        seoDescription:
          "Тихое летнее вечернее небо над историческим кварталом города.",
      },
    },
  },
  {
    id: "AH002",
    slug: "moment-002",
    status: "published",
    createdAt: "2026-08-02T12:00:00.000Z",
    dateLabel: {
      en: "August 2026",
      ru: "Август 2026",
    },
    location: {
      city: {
        en: "Odesa",
        ru: "Одесса",
      },
      country: {
        en: "Ukraine",
        ru: "Украина",
      },
      countryCode: "UA",
      coordinates: {
        latitude: 46.4825,
        longitude: 30.7233,
      },
      mapUrl: "https://maps.google.com/?q=46.4825,30.7233",
      visibility: "exact",
    },
    mainImage: {
      id: "AH002-main",
      src: "data:image/svg+xml;charset=UTF-8,%3Csvg width='1200' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%2327272a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23d4d4d8'%3EMoment 002 — Photograph%3C/text%3E%3C/svg%3E",
      alt: {
        en: "Moment 002 Photograph",
        ru: "Снимок Момента 002",
      },
      width: 1200,
      height: 800,
    },
    mockups: [
      {
        id: "AH002-mockup-graphite",
        image: {
          id: "AH002-m1",
          src: "data:image/svg+xml;charset=UTF-8,%3Csvg width='800' height='1000' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%2327272a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23e4e4e7'%3EMoment 002 — T-Shirt Mockup (Graphite)%3C/text%3E%3C/svg%3E",
          alt: {
            en: "Moment 002 Graphite T-Shirt Mockup",
            ru: "Мокап графитовой футболки Момент 002",
          },
          width: 800,
          height: 1000,
        },
        color: {
          id: "graphite",
          name: {
            en: "Graphite",
            ru: "Графит",
          },
          hex: "#27272a",
        },
      },
    ],
    availableColors: [
      {
        id: "graphite",
        name: {
          en: "Graphite",
          ru: "Графит",
        },
        hex: "#27272a",
      },
    ],
    availableSizes: ["M", "L", "XL"],
    videoUrl: null,
    externalPurchaseUrl: null,
    qrPath: "/q/AH002",
    translations: {
      en: {
        title: "Moment 002",
        shortDescription: "Morning fog drifting across coastal rocks.",
        story:
          "Captured early at dawn when mist covered the shoreline. The contrast between soft fog and sharp rock textures formed a natural minimal frame.",
        seoTitle: "Moment 002 | AH Visuals of Moments",
        seoDescription: "Morning fog drifting across coastal rocks.",
      },
      ru: {
        title: "Момент 002",
        shortDescription: "Утренний туман над прибрежными скалами.",
        story:
          "Снято на рассвете, когда туман окутал береговую линию. Контраст между мягкой дымкой и рельефом скал создал естественный минималистичный кадр.",
        seoTitle: "Момент 002 | AH Visuals of Moments",
        seoDescription: "Утренний туман над прибрежными скалами.",
      },
    },
  },
  {
    id: "AH003",
    slug: "moment-003",
    status: "draft",
    createdAt: "2026-08-03T15:00:00.000Z",
    dateLabel: {
      en: "August 2026",
      ru: "Август 2026",
    },
    location: {
      city: {
        en: "Lviv",
        ru: "Львов",
      },
      country: {
        en: "Ukraine",
        ru: "Украина",
      },
      countryCode: "UA",
      coordinates: {
        latitude: 49.8397,
        longitude: 24.0297,
      },
      mapUrl: "https://maps.google.com/?q=49.8397,24.0297",
      visibility: "exact",
    },
    mainImage: {
      id: "AH003-main",
      src: "data:image/svg+xml;charset=UTF-8,%3Csvg width='1200' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%233f3f46'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23a1a1aa'%3EMoment 003 [DRAFT]%3C/text%3E%3C/svg%3E",
      alt: {
        en: "Moment 003 Photograph Draft",
        ru: "Черновик снимка Момента 003",
      },
      width: 1200,
      height: 800,
    },
    mockups: [],
    availableColors: [],
    availableSizes: [],
    videoUrl: null,
    externalPurchaseUrl: null,
    qrPath: "/q/AH003",
    translations: {
      en: {
        title: "Moment 003",
        shortDescription:
          "Draft story — geometric shadows in an old courtyard.",
        story:
          "A preliminary draft captured during mid-afternoon light in an archway. Currently under content review.",
        seoTitle: "Moment 003 [Draft]",
        seoDescription: "Draft story",
      },
      ru: {
        title: "Момент 003",
        shortDescription:
          "Черновик истории — геометрические тени во старом дворике.",
        story:
          "Предварительный черновик, снятый во второй половине дня под аркой. Находится на этапе редактирования.",
        seoTitle: "Момент 003 [Черновик]",
        seoDescription: "Черновик истории",
      },
    },
  },
];

export function resolveMoment(raw: RawMoment, locale: Locale): Moment {
  const trans = raw.translations[locale] || raw.translations[defaultLocale];
  const dateLabel = raw.dateLabel[locale] || raw.dateLabel[defaultLocale];
  const city = raw.location.city[locale] || raw.location.city[defaultLocale];
  const country =
    raw.location.country[locale] || raw.location.country[defaultLocale];

  return {
    id: raw.id,
    slug: raw.slug,
    title: trans.title,
    shortDescription: trans.shortDescription,
    story: trans.story,
    seoTitle: trans.seoTitle,
    seoDescription: trans.seoDescription,
    location: {
      city,
      country,
      countryCode: raw.location.countryCode,
      coordinates: raw.location.coordinates,
      mapUrl: raw.location.mapUrl,
      visibility: raw.location.visibility,
    },
    mainImage: {
      id: raw.mainImage.id,
      src: raw.mainImage.src,
      alt: raw.mainImage.alt[locale] || raw.mainImage.alt[defaultLocale],
      width: raw.mainImage.width,
      height: raw.mainImage.height,
    },
    mockups: raw.mockups.map((m) => ({
      id: m.id,
      image: {
        id: m.image.id,
        src: m.image.src,
        alt: m.image.alt[locale] || m.image.alt[defaultLocale],
        width: m.image.width,
        height: m.image.height,
      },
      color: m.color
        ? {
            id: m.color.id,
            name: m.color.name[locale] || m.color.name[defaultLocale],
            hex: m.color.hex,
          }
        : undefined,
    })),
    availableColors: raw.availableColors.map((c) => ({
      id: c.id,
      name: c.name[locale] || c.name[defaultLocale],
      hex: c.hex,
    })),
    availableSizes: raw.availableSizes,
    status: raw.status,
    createdAt: raw.createdAt,
    dateLabel,
    videoUrl: raw.videoUrl,
    externalPurchaseUrl: raw.externalPurchaseUrl,
    qrPath: raw.qrPath,
  };
}

export function getPublishedMoments(locale: Locale = defaultLocale): Moment[] {
  return RAW_MOMENTS.filter((m) => m.status === "published").map((m) =>
    resolveMoment(m, locale)
  );
}

export function getMomentBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Moment | undefined {
  const raw = RAW_MOMENTS.find((m) => m.slug === slug);
  if (!raw || raw.status !== "published") {
    return undefined;
  }
  return resolveMoment(raw, locale);
}

export function getAllMoments(locale: Locale = defaultLocale): Moment[] {
  return RAW_MOMENTS.map((m) => resolveMoment(m, locale));
}
