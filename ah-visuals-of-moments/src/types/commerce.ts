import { CollectionType } from "./admin";

export interface CommerceInventory {
  on_hand: number;
  reserved: number;
  available: number;
}

export interface CommerceVariant {
  id: string;
  sku: string;
  color: string;
  size: string;
  active: boolean;
  inventory: CommerceInventory | null;
}

export interface CommerceCollection {
  name: string;
  slug: string;
  type: CollectionType;
}

export interface CommerceProduct {
  id: string;
  product_code: string;
  price: number;
  active: boolean;
  collection: CommerceCollection | null;
  variants: CommerceVariant[];
}
