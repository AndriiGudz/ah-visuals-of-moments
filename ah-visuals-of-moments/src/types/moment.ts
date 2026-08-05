import { Locale } from "@/i18n/config";

export type ContentStatus = "draft" | "review" | "published" | "archived";

export type TShirtSize = "S" | "M" | "L" | "XL" | "XXL";

export interface TShirtColor {
  id: string;
  name: Record<Locale, string>;
  hex: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  city: Record<Locale, string>;
  country: Record<Locale, string>;
  countryCode: string;
  coordinates: Coordinates;
  mapUrl: string;
  visibility: "exact" | "approximate" | "hidden";
}

export interface ImageAsset {
  id: string;
  src: string;
  alt: Record<Locale, string>;
  width?: number;
  height?: number;
}

export interface ProductMockup {
  id: string;
  image: ImageAsset;
  color?: TShirtColor;
}

export interface MomentTranslation {
  title: string;
  shortDescription: string;
  story: string;
  seoTitle?: string;
  seoDescription?: string;
  dateLabel?: string;
}

export interface RawMoment {
  id: string;
  slug: string;
  status: ContentStatus;
  createdAt: string;
  dateLabel: Record<Locale, string>;
  location: LocationData;
  mainImage: ImageAsset;
  mockups: ProductMockup[];
  availableColors: TShirtColor[];
  availableSizes: TShirtSize[];
  videoUrl: string | null;
  externalPurchaseUrl: string | null;
  qrPath: string;
  translations: Record<Locale, MomentTranslation>;
}

export interface Moment {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  story: string;
  seoTitle?: string;
  seoDescription?: string;
  location: {
    city: string;
    country: string;
    countryCode: string;
    coordinates: Coordinates;
    mapUrl: string;
    visibility: "exact" | "approximate" | "hidden";
  };
  mainImage: {
    id: string;
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  mockups: Array<{
    id: string;
    image: {
      id: string;
      src: string;
      alt: string;
      width?: number;
      height?: number;
    };
    color?: {
      id: string;
      name: string;
      hex: string;
    };
  }>;
  availableColors: Array<{
    id: string;
    name: string;
    hex: string;
  }>;
  availableSizes: TShirtSize[];
  status: ContentStatus;
  createdAt: string;
  dateLabel: string;
  videoUrl: string | null;
  externalPurchaseUrl: string | null;
  qrPath: string;
}
