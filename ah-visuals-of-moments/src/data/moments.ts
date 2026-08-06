import { Locale, defaultLocale } from "@/i18n/config";
import { RawMoment, Moment } from "@/types/moment";

export const RAW_MOMENTS: RawMoment[] = [
  {
    id: "AH001",
    slug: "moment-001",
    status: "published",
    createdAt: "2026-08-01T10:00:00.000Z",
    dateLabel: {
      en: "Summer 2019",
      ru: "Лето 2019",
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
        latitude: 50.451974,
        longitude: 30.526393,
      },
      mapUrl: "https://maps.google.com/?q=50.451974,30.526393",
      visibility: "exact",
    },
    mainImage: {
      id: "AH001-main",
      src: "/moments/moment-001/moment-001-2.webp",
      alt: {
        en: "AH Visuals of Moments unisex T-shirt featuring Moment 001 photograph print on models",
        ru: "Унисекс-футболка AH Visuals of Moments с принтом Момента 001 на моделях",
      },
      width: 1280,
      height: 1017,
    },
    heroImage: {
      id: "AH001-hero",
      src: "/moments/moment-001/moment-001-2.webp",
      alt: {
        en: "Lookbook presentation of Moment 001 T-shirt featuring sunset photograph taken in Kyiv",
        ru: "Презентация футболки Момент 001 с закатной фотографией Киева на моделях",
      },
      width: 1280,
      height: 1017,
    },
    cardImage: {
      id: "AH001-card",
      src: "/moments/moment-001/moment-001-2.webp",
      alt: {
        en: "Moment 001 T-shirt design presentation",
        ru: "Презентация дизайна футболки Момент 001",
      },
      width: 1280,
      height: 1017,
    },
    gallery: [
      {
        id: "AH001-gallery-1",
        src: "/moments/moment-001/moment-001-2.webp",
        alt: {
          en: "Front and back view of Moment 001 unisex T-shirt on models",
          ru: "Вид спереди и сзади унисекс-футболки Момент 001 на моделях",
        },
        width: 1280,
        height: 1017,
      },
      {
        id: "AH001-gallery-2",
        src: "/moments/moment-001/moment-001-1.webp",
        alt: {
          en: "Color variants overview for Moment 001 T-shirt",
          ru: "Обзор цветовых вариантов футболки Момент 001",
        },
        width: 1280,
        height: 1024,
      },
    ],
    mockups: [
      {
        id: "AH001-mockup-lineup",
        image: {
          id: "AH001-mockup-1",
          src: "/moments/moment-001/moment-001-1.webp",
          alt: {
            en: "Four T-shirt color variants (black, taupe, sand, vintage plum) with front logo and back sunset photo print",
            ru: "Четыре цветовых варианта футболки (чёрный, графитово-бежевый, песчаный, сливовый) с логотипом и принтом заката",
          },
          width: 1280,
          height: 1024,
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
        hex: "#1c1c1e",
      },
      {
        id: "taupe",
        name: {
          en: "Muted Taupe",
          ru: "Графитово-бежевый",
        },
        hex: "#5a544f",
      },
      {
        id: "sand",
        name: {
          en: "Warm Sand",
          ru: "Песчаный",
        },
        hex: "#9e8869",
      },
      {
        id: "plum",
        name: {
          en: "Vintage Plum",
          ru: "Винный",
        },
        hex: "#583f4b",
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
          "An ordinary evening became a lasting memory when the sky over Kyiv illuminated in pink, purple, and gold.",
        story:
          "I was walking home after work. It was an ordinary evening, no different from hundreds of others. I walked down familiar streets, lost in my thoughts, barely paying attention to what was happening around me. But at some point, I looked up and saw the sky.\n\nIt was incredible. Pink, purple, and golden shades seemed to stop the entire city for a few minutes. Cars kept driving, people hurried home, while I simply took out my phone and captured this shot.\n\nBack then, I didn't know that years later this photograph would become a part of my story. Sometimes the most beautiful moments happen right when you least expect them.",
        seoTitle: "Moment 001 | AH Visuals of Moments",
        seoDescription:
          "Discover the story behind a summer evening photograph taken in Kyiv in 2019 and the unisex T-shirt created from that moment.",
      },
      ru: {
        title: "Момент 001",
        shortDescription:
          "Обычный вечер стал частью истории, когда небо над Киевом окрасилось в розовые, фиолетовые и золотые оттенки.",
        story:
          "Я возвращалась домой после работы. Это был обычный вечер, ничем не отличавшийся от сотен других. Я шла по знакомым улицам, думала о своём и почти не обращала внимания на то, что происходит вокруг. Но в какой-то момент подняла глаза и увидела небо.\n\nОно было невероятным. Розовые, фиолетовые и золотые оттенки словно на несколько минут остановили весь город. Машины продолжали ехать, люди спешили домой, а я просто достала телефон и сделала этот снимок.\n\nТогда я ещё не знала, что спустя годы эта фотография станет частью моей истории. Иногда самые красивые моменты случаются именно тогда, когда ты меньше всего этого ожидаешь.",
        seoTitle: "Момент 001 | AH Visuals of Moments",
        seoDescription:
          "История фотографии летнего вечернего неба, сделанной в Киеве в 2019 году, и созданной на её основе унисекс-футболки.",
      },
    },
  },
  {
    id: "AH002",
    slug: "moment-002",
    status: "published",
    createdAt: "2026-08-02T12:00:00.000Z",
    dateLabel: {
      en: "Summer 2019",
      ru: "Лето 2019",
    },
    location: {
      city: {
        en: "Vyshhorod",
        ru: "Вышгород",
      },
      country: {
        en: "Ukraine",
        ru: "Украина",
      },
      countryCode: "UA",
      coordinates: {
        latitude: 50.58565,
        longitude: 30.486364,
      },
      mapUrl: "https://maps.google.com/?q=50.585650,30.486364",
      visibility: "exact",
    },
    mainImage: {
      id: "AH002-main",
      src: "/moments/moment-002/moment-002-2.webp",
      alt: {
        en: "AH Visuals of Moments unisex T-shirt featuring Moment 002 photograph print on models",
        ru: "Унисекс-футболка AH Visuals of Moments с принтом Момента 002 на моделях",
      },
      width: 1280,
      height: 1018,
    },
    heroImage: {
      id: "AH002-hero",
      src: "/moments/moment-002/moment-002-2.webp",
      alt: {
        en: "Lookbook presentation of Moment 002 T-shirt featuring evening photograph taken in Vyshhorod",
        ru: "Презентация футболки Момент 002 с вечерней фотографией Вышгорода на моделях",
      },
      width: 1280,
      height: 1018,
    },
    cardImage: {
      id: "AH002-card",
      src: "/moments/moment-002/moment-002-2.webp",
      alt: {
        en: "Moment 002 T-shirt design presentation",
        ru: "Презентация дизайна футболки Момент 002",
      },
      width: 1280,
      height: 1018,
    },
    gallery: [
      {
        id: "AH002-gallery-1",
        src: "/moments/moment-002/moment-002-2.webp",
        alt: {
          en: "Front and back view of Moment 002 unisex T-shirt on models",
          ru: "Вид спереди и сзади унисекс-футболки Момент 002 на моделях",
        },
        width: 1280,
        height: 1018,
      },
      {
        id: "AH002-gallery-2",
        src: "/moments/moment-002/moment-002-1.webp",
        alt: {
          en: "Color variants overview for Moment 002 T-shirt",
          ru: "Обзор цветовых вариантов футболки Момент 002",
        },
        width: 1280,
        height: 1024,
      },
    ],
    mockups: [
      {
        id: "AH002-mockup-lineup",
        image: {
          id: "AH002-mockup-1",
          src: "/moments/moment-002/moment-002-1.webp",
          alt: {
            en: "Four T-shirt color variants with front logo and back evening photo print",
            ru: "Четыре цветовых варианта футболки с логотипом и принтом заката",
          },
          width: 1280,
          height: 1024,
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
        hex: "#1c1c1e",
      },
      {
        id: "taupe",
        name: {
          en: "Muted Taupe",
          ru: "Графитово-бежевый",
        },
        hex: "#5a544f",
      },
      {
        id: "sand",
        name: {
          en: "Warm Sand",
          ru: "Песчаный",
        },
        hex: "#9e8869",
      },
      {
        id: "plum",
        name: {
          en: "Vintage Plum",
          ru: "Винный",
        },
        hex: "#583f4b",
      },
    ],
    availableSizes: ["S", "M", "L", "XL"],
    videoUrl: null,
    externalPurchaseUrl: null,
    qrPath: "/q/AH002",
    translations: {
      en: {
        title: "Moment 002",
        shortDescription:
          "An ordinary wait turned into a lasting memory when a warm summer evening in Vyshhorod painted the sky in pink and gold.",
        story:
          "It was a warm summer evening in Vyshhorod. I was sitting outside the house waiting for a friend. All I needed to do was ring the intercom for him to come down, but instead, I simply paused for a few minutes.\n\nThere was hardly anyone on the quiet street. Everything around felt serene. Just the soft evening air, the last rays of the sun, and the sky gradually turning pink and gold. I realized that this moment would only last a few minutes, so I pulled out my phone and took this photograph.\n\nWhen I look at it now, I remember not only that beautiful sunset, but also the deep calm of that evening. Sometimes it takes nothing extraordinary for a moment to become a cherished memory. Perhaps it is these quiet evenings that stay with us the longest.",
        seoTitle: "Moment 002 | AH Visuals of Moments",
        seoDescription:
          "Discover the story behind a summer evening photograph taken in Vyshhorod in 2019 and the T-shirt created from that moment.",
      },
      ru: {
        title: "Момент 002",
        shortDescription:
          "Обычное ожидание превратилось в воспоминание, когда тёплый летний вечер в Вышгороде окрасил небо в розовые и золотые тона.",
        story:
          "Это был тёплый летний вечер в Вышгороде. Я сидела возле дома и ждала друга. Нужно было просто позвонить в домофон, чтобы он спустился, но вместо этого я на несколько минут просто остановилась.\n\nНа тихой улице почти никого не было. Всё вокруг было спокойно. Только лёгкий вечерний воздух, последние лучи солнца и небо, которое постепенно окрашивалось в розовые и золотые оттенки. Я поняла, что этот момент продлится всего несколько минут. Поэтому достала телефон и сделала эту фотографию.\n\nКогда смотрю на неё сейчас, вспоминаю не только этот красивый закат, но и то спокойствие, которое было в тот вечер. Иногда не нужно ничего особенного, чтобы момент стал дорогим воспоминанием. Наверное, именно такие вечера остаются с нами дольше всего.",
        seoTitle: "Момент 002 | AH Visuals of Moments",
        seoDescription:
          "История фотографии летнего вечера в Вышгороде, сделанной в 2019 году, и созданной на её основе унисекс-футболки.",
      },
    },
  },
  {
    id: "AH003",
    slug: "moment-003",
    status: "published",
    createdAt: "2026-08-03T15:00:00.000Z",
    dateLabel: {
      en: "Summer 2019",
      ru: "Лето 2019",
    },
    location: {
      city: {
        en: "Vyshhorod (Chaika Embankment)",
        ru: "Вышгород (набережная «Чайка»)",
      },
      country: {
        en: "Ukraine",
        ru: "Украина",
      },
      countryCode: "UA",
      coordinates: {
        latitude: 50.590618,
        longitude: 30.505032,
      },
      mapUrl: "https://maps.google.com/?q=50.590618,30.505032",
      visibility: "exact",
    },
    mainImage: {
      id: "AH003-main",
      src: "/moments/moment-003/moment-003-2.webp",
      alt: {
        en: "AH Visuals of Moments unisex T-shirt featuring Moment 003 photograph print on models",
        ru: "Унисекс-футболка AH Visuals of Moments с принтом Момента 003 на моделях",
      },
      width: 1280,
      height: 1022,
    },
    heroImage: {
      id: "AH003-hero",
      src: "/moments/moment-003/moment-003-2.webp",
      alt: {
        en: "Lookbook presentation of Moment 003 T-shirt featuring sunset photograph taken at Chaika Embankment",
        ru: "Презентация футболки Момент 003 с закатом на набережной «Чайка» на моделях",
      },
      width: 1280,
      height: 1022,
    },
    cardImage: {
      id: "AH003-card",
      src: "/moments/moment-003/moment-003-2.webp",
      alt: {
        en: "Moment 003 T-shirt design presentation",
        ru: "Презентация дизайна футболки Момент 003",
      },
      width: 1280,
      height: 1022,
    },
    gallery: [
      {
        id: "AH003-gallery-1",
        src: "/moments/moment-003/moment-003-2.webp",
        alt: {
          en: "Front and back view of Moment 003 unisex T-shirt on models",
          ru: "Вид спереди и сзади унисекс-футболки Момент 003 на моделях",
        },
        width: 1280,
        height: 1022,
      },
      {
        id: "AH003-gallery-2",
        src: "/moments/moment-003/moment-003-1.webp",
        alt: {
          en: "Color variants overview for Moment 003 T-shirt",
          ru: "Обзор цветовых вариантов футболки Момент 003",
        },
        width: 1280,
        height: 1024,
      },
    ],
    mockups: [
      {
        id: "AH003-mockup-lineup",
        image: {
          id: "AH003-mockup-1",
          src: "/moments/moment-003/moment-003-1.webp",
          alt: {
            en: "Four T-shirt color variants with front logo and back sunset photo print",
            ru: "Четыре цветовых варианта футболки с логотипом и принтом заката",
          },
          width: 1280,
          height: 1024,
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
        hex: "#1c1c1e",
      },
      {
        id: "taupe",
        name: {
          en: "Muted Taupe",
          ru: "Графитово-бежевый",
        },
        hex: "#5a544f",
      },
      {
        id: "sand",
        name: {
          en: "Warm Sand",
          ru: "Песчаный",
        },
        hex: "#9e8869",
      },
      {
        id: "plum",
        name: {
          en: "Vintage Plum",
          ru: "Винный",
        },
        hex: "#583f4b",
      },
    ],
    availableSizes: ["S", "M", "L", "XL"],
    videoUrl: null,
    externalPurchaseUrl: null,
    qrPath: "/q/AH003",
    translations: {
      en: {
        title: "Moment 003",
        shortDescription:
          "Sunset over the Dnipro River at Chaika Embankment — a place to return for peace and reflection.",
        story:
          "This place has always been special to me. Chaika Embankment in Vyshhorod is a place where I returned again and again to watch the sunset. Not because every evening was different, but because no two sunsets here were ever the same.\n\nI could simply sit by the water, watching the sun slowly sink below the horizon while the Dnipro reflected its final rays of light. In those moments, time felt like it stood still.\n\nI tried to capture this beauty through the camera lens many times. No photograph can fully express what my eyes saw, but each one holds the feeling I experienced at that exact moment. That is why this shot became a part of my collection. To some, it is just a beautiful sunset. To me, it is a place I always wanted to return to.",
        seoTitle: "Moment 003 | AH Visuals of Moments",
        seoDescription:
          "Discover the story behind a sunset photograph taken at Chaika Embankment in Vyshhorod and the T-shirt created from that moment.",
      },
      ru: {
        title: "Момент 003",
        shortDescription:
          "Закат над Днепром на набережной «Чайка» — место, куда всегда хочется возвращаться за умиротворением.",
        story:
          "Это место всегда было для меня особенным. Набережная «Чайка» в Вышгороде — место, куда я снова и снова приходила встречать закат. Не потому что каждый вечер был разным, а потому что одинаковых закатов здесь никогда не существовало.\n\nЯ могла просто сидеть у воды, смотреть, как солнце медленно опускается за горизонт, а Днепр отражает последние лучи света. В такие моменты казалось, что время останавливается.\n\nЯ много раз пыталась передать эту красоту через объектив камеры. Ни одна фотография не способна полностью показать то, что видели мои глаза, но каждая из них хранит чувство, которое я испытывала в тот момент. Именно поэтому этот снимок стал частью моей коллекции. Для кого-то это просто красивый закат. Для меня — место, куда всегда хотелось возвращаться.",
        seoTitle: "Момент 003 | AH Visuals of Moments",
        seoDescription:
          "История фотографии заката на набережной «Чайка» в Вышгороде и созданной на её основе унисекс-футболки.",
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
    heroImage: raw.heroImage
      ? {
          id: raw.heroImage.id,
          src: raw.heroImage.src,
          alt: raw.heroImage.alt[locale] || raw.heroImage.alt[defaultLocale],
          width: raw.heroImage.width,
          height: raw.heroImage.height,
        }
      : undefined,
    cardImage: raw.cardImage
      ? {
          id: raw.cardImage.id,
          src: raw.cardImage.src,
          alt: raw.cardImage.alt[locale] || raw.cardImage.alt[defaultLocale],
          width: raw.cardImage.width,
          height: raw.cardImage.height,
        }
      : undefined,
    gallery: raw.gallery
      ? raw.gallery.map((img) => ({
          id: img.id,
          src: img.src,
          alt: img.alt[locale] || img.alt[defaultLocale],
          width: img.width,
          height: img.height,
        }))
      : undefined,
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
