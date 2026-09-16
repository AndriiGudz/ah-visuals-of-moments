// ==============================================================================
// AH Visuals of Moments: Admin & Database Domain Types
// ==============================================================================

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CONFIRMED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  PROCESSING: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  SHIPPED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

export type StockMovementType =
  | "INITIAL_STOCK"
  | "RESTOCK"
  | "RESERVE"
  | "RELEASE_RESERVATION"
  | "SHIP"
  | "MANUAL_ADJUSTMENT"
  | "RETURN";

export const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  INITIAL_STOCK: "Начальный остаток",
  RESTOCK: "Поступление товара",
  RESERVE: "Резервирование под заказ",
  RELEASE_RESERVATION: "Освобождение резерва",
  SHIP: "Списание при отправке",
  MANUAL_ADJUSTMENT: "Корректировка остатка",
  RETURN: "Возврат товара",
};

export type CollectionType = "REGULAR" | "LIMITED";

export const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
  REGULAR: "Пополняемая (Regular)",
  LIMITED: "Лимитированная (Limited)",
};

export interface Collection {
  id: string;
  name: string;
  slug: string;
  type: CollectionType;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  product_code: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  collection_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  collection?: Collection;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  color: string;
  size: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
  inventory?: InventoryRecord;
}

export interface InventoryRecord {
  id: string;
  variant_id: string;
  on_hand: number;
  reserved: number;
  available: number;
  updated_at: string;
  variant?: ProductVariant;
}

export interface StockMovement {
  id: string;
  variant_id: string;
  type: StockMovementType;
  quantity: number;
  order_id: string | null;
  on_hand_before: number | null;
  on_hand_after: number | null;
  reserved_before: number | null;
  reserved_after: number | null;
  created_by: string | null;
  note: string | null;
  created_at: string;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  total_amount: number;
  status: OrderStatus;
  shipped_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  reserved: boolean;
  created_at: string;
  variant?: ProductVariant;
}

export interface GoogleIntegration {
  id: string;
  type: "SERVICE_ACCOUNT" | "OAUTH";
  sheet_id: string | null;
  sheet_title: string | null;
  status: string;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoogleLog {
  id: string;
  operation_type: "IMPORT" | "EXPORT";
  resource_type: "PRODUCTS" | "INVENTORY" | "ORDERS" | "STOCK_MOVEMENTS" | "MONTHLY_REPORT";
  status: "SUCCESS" | "ERROR" | "PARTIAL";
  source_destination: string;
  items_processed: number;
  items_created: number;
  items_updated: number;
  items_failed: number;
  details: Record<string, unknown> | null;
  performed_by: string | null;
  created_at: string;
}

export interface ImportPreviewItem {
  sku: string;
  product_code: string;
  product_name: string;
  collection_name?: string;
  collection_type?: CollectionType;
  color: string;
  size: string;
  // Stock diff
  current_on_hand: number;
  new_on_hand: number;
  current_reserved: number;
  current_available: number;
  new_available: number;
  // Price diff
  current_price: number;
  new_price: number;
  price: number; // backward-compatibility alias for new_price
  // Active diff
  current_active: boolean;
  new_active: boolean;
  // Status
  status: "NEW" | "UPDATE" | "CONFLICT" | "ERROR";
  reason?: string;
}

export interface ImportPreviewResult {
  source: string;
  total_rows: number;
  new_count: number;
  update_count: number;
  error_count: number;
  conflict_count: number;
  items: ImportPreviewItem[];
  can_import: boolean;
  header_error?: string;
}
