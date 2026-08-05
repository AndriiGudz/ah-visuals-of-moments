export type ContentStatus = "draft" | "review" | "published" | "archived";

export type TShirtSize = "S" | "M" | "L" | "XL" | "XXL";

export interface TShirtColor {
  id: string;
  name: string;
  hex: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  city: string;
  country: string;
  countryCode: string;
  coordinates: Coordinates;
  mapUrl: string;
  visibility: "exact" | "approximate" | "hidden";
}

export interface ImageAsset {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductMockup {
  id: string;
  image: ImageAsset;
  color?: TShirtColor;
}

export interface Moment {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  story: string;
  location: LocationData;
  mainImage: ImageAsset;
  mockups: ProductMockup[];
  availableColors: TShirtColor[];
  availableSizes: TShirtSize[];
  status: ContentStatus;
  createdAt: string;
  dateLabel: string;
  videoUrl: string | null;
  externalPurchaseUrl: string | null;
  qrPath: string;
}
