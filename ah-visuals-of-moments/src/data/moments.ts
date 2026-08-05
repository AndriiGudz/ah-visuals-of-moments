import { Moment } from "@/types/moment";

export const MOCK_MOMENTS: Moment[] = [
  {
    id: "AH001",
    slug: "moment-001",
    title: "Moment 001",
    shortDescription: "A quiet summer evening sky over the historic city quarter.",
    story:
      "An ordinary evening walk turned into a lasting memory when the city sky unexpectedly illuminated in deep warm tones. The street below continued its normal pace, while above, time seemed to pause for a brief moment. This photograph captures that stillness.",
    location: {
      city: "Kyiv",
      country: "Ukraine",
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
      alt: "Moment 001 Photograph",
      width: 1200,
      height: 800,
    },
    mockups: [
      {
        id: "AH001-mockup-black",
        image: {
          id: "AH001-m1",
          src: "data:image/svg+xml;charset=UTF-8,%3Csvg width='800' height='1000' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%2318181b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23e4e4e7'%3EMoment 001 — T-Shirt Mockup (Black)%3C/text%3E%3C/svg%3E",
          alt: "Moment 001 Black T-Shirt Mockup",
          width: 800,
          height: 1000,
        },
        color: {
          id: "black",
          name: "Deep Black",
          hex: "#18181b",
        },
      },
      {
        id: "AH001-mockup-ivory",
        image: {
          id: "AH001-m2",
          src: "data:image/svg+xml;charset=UTF-8,%3Csvg width='800' height='1000' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%233f3f46'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23fafafa'%3EMoment 001 — T-Shirt Mockup (Ivory)%3C/text%3E%3C/svg%3E",
          alt: "Moment 001 Ivory T-Shirt Mockup",
          width: 800,
          height: 1000,
        },
        color: {
          id: "ivory",
          name: "Warm Ivory",
          hex: "#f5f5f0",
        },
      },
    ],
    availableColors: [
      { id: "black", name: "Deep Black", hex: "#18181b" },
      { id: "ivory", name: "Warm Ivory", hex: "#f5f5f0" },
    ],
    availableSizes: ["S", "M", "L", "XL"],
    status: "published",
    createdAt: "2026-08-01T10:00:00.000Z",
    dateLabel: "August 2026",
    videoUrl: null,
    externalPurchaseUrl: null,
    qrPath: "/q/AH001",
  },
  {
    id: "AH002",
    slug: "moment-002",
    title: "Moment 002",
    shortDescription: "Morning fog drifting across coastal rocks.",
    story:
      "Captured early at dawn when mist covered the shoreline. The contrast between soft fog and sharp rock textures formed a natural minimal frame.",
    location: {
      city: "Odesa",
      country: "Ukraine",
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
      alt: "Moment 002 Photograph",
      width: 1200,
      height: 800,
    },
    mockups: [
      {
        id: "AH002-mockup-graphite",
        image: {
          id: "AH002-m1",
          src: "data:image/svg+xml;charset=UTF-8,%3Csvg width='800' height='1000' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%2327272a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23e4e4e7'%3EMoment 002 — T-Shirt Mockup (Graphite)%3C/text%3E%3C/svg%3E",
          alt: "Moment 002 Graphite T-Shirt Mockup",
          width: 800,
          height: 1000,
        },
        color: {
          id: "graphite",
          name: "Graphite",
          hex: "#27272a",
        },
      },
    ],
    availableColors: [{ id: "graphite", name: "Graphite", hex: "#27272a" }],
    availableSizes: ["M", "L", "XL"],
    status: "published",
    createdAt: "2026-08-02T12:00:00.000Z",
    dateLabel: "August 2026",
    videoUrl: null,
    externalPurchaseUrl: null,
    qrPath: "/q/AH002",
  },
  {
    id: "AH003",
    slug: "moment-003",
    title: "Moment 003",
    shortDescription: "Draft story — geometric shadows in an old courtyard.",
    story:
      "A preliminary draft captured during mid-afternoon light in an archway. Currently under content review.",
    location: {
      city: "Lviv",
      country: "Ukraine",
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
      alt: "Moment 003 Photograph Draft",
      width: 1200,
      height: 800,
    },
    mockups: [],
    availableColors: [],
    availableSizes: [],
    status: "draft",
    createdAt: "2026-08-03T15:00:00.000Z",
    dateLabel: "August 2026",
    videoUrl: null,
    externalPurchaseUrl: null,
    qrPath: "/q/AH003",
  },
];

export function getPublishedMoments(): Moment[] {
  return MOCK_MOMENTS.filter((moment) => moment.status === "published");
}

export function getMomentBySlug(slug: string): Moment | undefined {
  const moment = MOCK_MOMENTS.find((m) => m.slug === slug);
  if (!moment || moment.status !== "published") {
    return undefined;
  }
  return moment;
}

export function getAllMoments(): Moment[] {
  return MOCK_MOMENTS;
}
