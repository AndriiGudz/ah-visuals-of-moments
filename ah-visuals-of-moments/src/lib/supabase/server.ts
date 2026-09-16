import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Product,
  ProductVariant,
  InventoryRecord,
  StockMovement,
  Order,
  OrderItem,
  OrderStatus,
  StockMovementType,
  GoogleLog,
  GoogleIntegration,
  Collection,
  CollectionType,
} from "@/types/admin";
import {
  CommerceProduct,
  CommerceVariant,
  CommerceInventory,
  CommerceCollection,
} from "@/types/commerce";

export type {
  CommerceProduct,
  CommerceVariant,
  CommerceInventory,
  CommerceCollection,
};

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("placeholder") &&
    !key.includes("placeholder") &&
    url.startsWith("https://")
  );
}

let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseAdminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      throw new Error(
        "Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required for admin client."
      );
    }

    supabaseAdminInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    });
  }

  return supabaseAdminInstance;
}

// -----------------------------------------------------------------------------
// In-Memory Fallback State (Active when Supabase credentials are not configured)
// Ensures full functionality, testing and preview without crashing.
// -----------------------------------------------------------------------------

interface MockState {
  collections: Collection[];
  products: Product[];
  variants: ProductVariant[];
  inventory: InventoryRecord[];
  movements: StockMovement[];
  orders: Order[];
  orderItems: OrderItem[];
  googleLogs: GoogleLog[];
  googleIntegrations: GoogleIntegration[];
}

// Initial mock data matching supabase/seed.sql
const mockState: MockState = {
  collections: [],
  products: [
    {
      id: "prod-001",
      product_code: "MOM-001",
      name: "Moment #01",
      slug: "moment-001",
      description: "Лимитированная унисекс-футболка AH Visuals of Moments с принтом заката над Киевом.",
      price: 85.0,
      collection_id: null,
      active: true,
      created_at: "2026-08-01T10:00:00.000Z",
      updated_at: "2026-08-01T10:00:00.000Z",
    },
    {
      id: "prod-002",
      product_code: "MOM-002",
      name: "Moment #02",
      slug: "moment-002",
      description: "Лимитированная унисекс-футболка AH Visuals of Moments с утренней атмосферой Подола.",
      price: 85.0,
      collection_id: null,
      active: true,
      created_at: "2026-08-02T10:00:00.000Z",
      updated_at: "2026-08-02T10:00:00.000Z",
    },
  ],
  variants: [
    { id: "var-001", product_id: "prod-001", sku: "AH-M01-BLK-S", color: "Black", size: "S", active: true, created_at: "2026-08-01T10:00:00.000Z", updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "var-002", product_id: "prod-001", sku: "AH-M01-BLK-M", color: "Black", size: "M", active: true, created_at: "2026-08-01T10:00:00.000Z", updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "var-003", product_id: "prod-001", sku: "AH-M01-BLK-L", color: "Black", size: "L", active: true, created_at: "2026-08-01T10:00:00.000Z", updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "var-004", product_id: "prod-001", sku: "AH-M01-WHT-S", color: "White", size: "S", active: true, created_at: "2026-08-01T10:00:00.000Z", updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "var-005", product_id: "prod-001", sku: "AH-M01-WHT-M", color: "White", size: "M", active: true, created_at: "2026-08-01T10:00:00.000Z", updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "var-006", product_id: "prod-002", sku: "AH-M02-BLK-M", color: "Black", size: "M", active: true, created_at: "2026-08-02T10:00:00.000Z", updated_at: "2026-08-02T10:00:00.000Z" },
    { id: "var-007", product_id: "prod-002", sku: "AH-M02-WHT-L", color: "White", size: "L", active: true, created_at: "2026-08-02T10:00:00.000Z", updated_at: "2026-08-02T10:00:00.000Z" },
  ],
  inventory: [
    { id: "inv-001", variant_id: "var-001", on_hand: 12, reserved: 0, available: 12, updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "inv-002", variant_id: "var-002", on_hand: 10, reserved: 0, available: 10, updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "inv-003", variant_id: "var-003", on_hand: 8, reserved: 0, available: 8, updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "inv-004", variant_id: "var-004", on_hand: 8, reserved: 0, available: 8, updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "inv-005", variant_id: "var-005", on_hand: 15, reserved: 0, available: 15, updated_at: "2026-08-01T10:00:00.000Z" },
    { id: "inv-006", variant_id: "var-006", on_hand: 14, reserved: 0, available: 14, updated_at: "2026-08-02T10:00:00.000Z" },
    { id: "inv-007", variant_id: "var-007", on_hand: 9, reserved: 0, available: 9, updated_at: "2026-08-02T10:00:00.000Z" },
  ],
  movements: [
    { id: "mov-001", variant_id: "var-001", type: "INITIAL_STOCK", quantity: 12, order_id: null, on_hand_before: 0, on_hand_after: 12, reserved_before: 0, reserved_after: 0, created_by: "SYSTEM", note: "Начальный ввод остатка", created_at: "2026-08-01T10:00:00.000Z" },
    { id: "mov-002", variant_id: "var-002", type: "INITIAL_STOCK", quantity: 10, order_id: null, on_hand_before: 0, on_hand_after: 10, reserved_before: 0, reserved_after: 0, created_by: "SYSTEM", note: "Начальный ввод остатка", created_at: "2026-08-01T10:00:00.000Z" },
  ],
  orders: [],
  orderItems: [],
  googleLogs: [],
  googleIntegrations: [],
};

// -----------------------------------------------------------------------------
// Unified Data Access Functions: Collections
// -----------------------------------------------------------------------------

export async function fetchCollections(filters?: { active?: boolean }): Promise<Collection[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    let query = supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.active !== undefined) {
      query = query.eq("active", filters.active);
    }

    const { data, error } = await query;
    if (!error && data) return data as Collection[];
  }

  let list = [...mockState.collections];
  if (filters?.active !== undefined) {
    list = list.filter((c) => c.active === filters.active);
  }
  return list;
}

export async function updateCollection(
  id: string,
  payload: Partial<Pick<Collection, "name" | "slug" | "type" | "active">>
): Promise<Collection> {
  const updateData: Partial<Collection> = {};

  if (payload.name !== undefined) {
    const name = payload.name.trim();
    if (!name) throw new Error("Название коллекции не может быть пустым");
    updateData.name = name;
  }

  if (payload.slug !== undefined) {
    const slug = payload.slug.trim().toLowerCase();
    if (!slug) throw new Error("Slug коллекции не может быть пустым");
    updateData.slug = slug;
  }

  if (payload.type !== undefined) {
    if (payload.type !== "REGULAR" && payload.type !== "LIMITED") {
      throw new Error(`Недопустимый тип коллекции: "${payload.type}". Разрешены только REGULAR или LIMITED`);
    }
    updateData.type = payload.type;
  }

  if (payload.active !== undefined) {
    updateData.active = Boolean(payload.active);
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("collections")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Collection;
  }

  const idx = mockState.collections.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Коллекция не найдена");

  if (updateData.slug && updateData.slug !== mockState.collections[idx].slug) {
    if (mockState.collections.some((c) => c.slug === updateData.slug && c.id !== id)) {
      throw new Error(`Коллекция со slug "${updateData.slug}" уже существует`);
    }
  }

  mockState.collections[idx] = {
    ...mockState.collections[idx],
    ...updateData,
    updated_at: new Date().toISOString(),
  };

  return mockState.collections[idx];
}

export async function createCollection(payload: {
  name: string;
  slug: string;
  type: CollectionType;
  active?: boolean;
}): Promise<Collection> {
  const name = payload.name.trim();
  const slug = payload.slug.trim().toLowerCase();
  const type = payload.type;

  if (!name) throw new Error("Название коллекции обязательно");
  if (!slug) throw new Error("Slug коллекции обязателен");
  if (type !== "REGULAR" && type !== "LIMITED") {
    throw new Error(`Недопустимый тип коллекции: "${type}". Разрешены только REGULAR или LIMITED`);
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("collections")
      .insert({
        name,
        slug,
        type,
        active: payload.active ?? true,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Collection;
  }

  if (mockState.collections.some((c) => c.slug === slug)) {
    throw new Error(`Коллекция со slug "${slug}" уже существует`);
  }

  const newCol: Collection = {
    id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    slug,
    type,
    active: payload.active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockState.collections.push(newCol);
  return newCol;
}

export async function findCollectionByNameOrSlug(query: string): Promise<Collection | null> {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .or(`slug.ilike.${q},name.ilike.${q}`)
      .limit(1)
      .maybeSingle();
    if (data) return data as Collection;
  }

  const found = mockState.collections.find(
    (c) => c.slug.toLowerCase() === q || c.name.toLowerCase() === q
  );
  return found || null;
}

// -----------------------------------------------------------------------------
// Unified Data Access Functions: Products
// -----------------------------------------------------------------------------

export async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*, collection:collections(*), variants:product_variants(*, inventory(*))")
      .order("created_at", { ascending: false });
    if (!error && data) return data as Product[];
  }

  // Fallback to in-memory state
  return mockState.products.map((p) => ({
    ...p,
    collection: mockState.collections.find((c) => c.id === p.collection_id),
    variants: mockState.variants
      .filter((v) => v.product_id === p.id)
      .map((v) => ({
        ...v,
        inventory: mockState.inventory.find((inv) => inv.variant_id === v.id),
      })),
  }));
}

export async function getCommerceProductByCode(
  productCode: string
): Promise<CommerceProduct | null> {
  const code = (productCode || "").trim().toUpperCase();
  if (!code) return null;

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          product_code,
          price,
          active,
          collection:collections(name, slug, type),
          variants:product_variants(
            id,
            sku,
            color,
            size,
            active,
            inventory(on_hand, reserved, available)
          )
        `)
        .eq("product_code", code)
        .maybeSingle();

      if (error) {
        console.error(`[Commerce] Ошибка чтения товара ${code} из Supabase:`, error.message);
        return null;
      }

      if (!data) return null;

      type RawVariantResponse = {
        id: string;
        sku: string;
        color: string;
        size: string;
        active: boolean;
        inventory?: { on_hand: number; reserved: number; available: number } | Array<{ on_hand: number; reserved: number; available: number }> | null;
      };

      const rawVariants = (Array.isArray(data.variants) ? data.variants : []) as unknown as RawVariantResponse[];
      const normalizedVariants: CommerceVariant[] = rawVariants.map((v) => {
        const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
        return {
          id: v.id,
          sku: v.sku,
          color: v.color,
          size: v.size,
          active: Boolean(v.active),
          inventory: inv
            ? {
                on_hand: Number(inv.on_hand) || 0,
                reserved: Number(inv.reserved) || 0,
                available: Number(inv.available) || 0,
              }
            : null,
        };
      });

      type RawCollectionResponse = {
        name: string;
        slug: string;
        type: CollectionType;
      };

      const col = (Array.isArray(data.collection) ? data.collection[0] : data.collection) as unknown as RawCollectionResponse | null;

      return {
        id: data.id,
        product_code: data.product_code,
        price: Number(data.price),
        active: Boolean(data.active),
        collection: col
          ? {
              name: col.name,
              slug: col.slug,
              type: col.type,
            }
          : null,
        variants: normalizedVariants,
      };
    } catch (err: unknown) {
      console.error(`[Commerce] Исключение при запросе товара ${code}:`, err);
      return null;
    }
  }

  // Fallback разрешён ТОЛЬКО в тестовом окружении
  if (process.env.NODE_ENV === "test") {
    const p = mockState.products.find((prod) => prod.product_code.toUpperCase() === code);
    if (!p) return null;
    const col = mockState.collections.find((c) => c.id === p.collection_id);
    const variants: CommerceVariant[] = mockState.variants
      .filter((v) => v.product_id === p.id)
      .map((v) => {
        const inv = mockState.inventory.find((i) => i.variant_id === v.id);
        return {
          id: v.id,
          sku: v.sku,
          color: v.color,
          size: v.size,
          active: v.active,
          inventory: inv
            ? {
                on_hand: inv.on_hand,
                reserved: inv.reserved,
                available: inv.available,
              }
            : null,
        };
      });

    return {
      id: p.id,
      product_code: p.product_code,
      price: p.price,
      active: p.active,
      collection: col ? { name: col.name, slug: col.slug, type: col.type } : null,
      variants,
    };
  }

  // В production / live при отсутствии Supabase возвращаем null (никаких моковых цен реальным пользователям)
  return null;
}

export async function createProduct(payload: {
  product_code: string;
  name: string;
  slug: string;
  collection_id?: string | null;
  description?: string;
  price: number;
  active?: boolean;
}): Promise<Product> {
  const productCode = (payload.product_code || "").trim().toUpperCase();
  if (!productCode) {
    throw new Error("Поле 'Product Code' обязательно для создания товара");
  }

  if (!payload.collection_id) {
    throw new Error("Для создания нового товара необходимо указать коллекцию");
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .insert({
        product_code: productCode,
        name: payload.name,
        slug: payload.slug,
        collection_id: payload.collection_id,
        description: payload.description || null,
        price: payload.price,
        active: payload.active ?? true,
      })
      .select("*, collection:collections(*)")
      .single();
    if (error) throw new Error(error.message);
    return data as Product;
  }

  // Check unique product_code in mockState
  if (mockState.products.some((p) => p.product_code.toUpperCase() === productCode)) {
    throw new Error(`Товар с кодом "${productCode}" уже существует`);
  }

  const col = mockState.collections.find((c) => c.id === payload.collection_id);
  const newProd: Product = {
    id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    product_code: productCode,
    name: payload.name,
    slug: payload.slug,
    collection_id: payload.collection_id,
    description: payload.description || null,
    price: payload.price,
    active: payload.active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection: col,
    variants: [],
  };
  mockState.products.unshift(newProd);
  return newProd;
}

export async function updateProduct(
  id: string,
  payload: Partial<Pick<Product, "name" | "description" | "price" | "active" | "collection_id">> & {
    product_code?: string;
  }
): Promise<Product> {
  if (payload.product_code !== undefined) {
    throw new Error("Поле product_code является неизменяемым (immutable) и не может быть обновлено");
  }

  const safePayload = { ...payload };
  delete safePayload.product_code;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .update({ ...safePayload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, collection:collections(*)")
      .single();
    if (error) throw new Error(error.message);
    return data as Product;
  }

  const idx = mockState.products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Товар не найден");

  const currentProd = mockState.products[idx];
  const updatedCollectionId =
    safePayload.collection_id !== undefined ? safePayload.collection_id : currentProd.collection_id;
  const col = mockState.collections.find((c) => c.id === updatedCollectionId);

  mockState.products[idx] = {
    ...currentProd,
    ...safePayload,
    collection_id: updatedCollectionId,
    collection: col,
    updated_at: new Date().toISOString(),
  };
  return mockState.products[idx];
}

export async function createVariant(payload: {
  product_id: string;
  sku: string;
  color: string;
  size: string;
  initial_stock?: number;
}): Promise<ProductVariant> {
  const supabase = getSupabaseAdmin();
  const initStock = payload.initial_stock || 0;

  if (supabase) {
    const { data: variant, error: varError } = await supabase
      .from("product_variants")
      .insert({
        product_id: payload.product_id,
        sku: payload.sku,
        color: payload.color,
        size: payload.size,
      })
      .select()
      .single();
    if (varError) throw new Error(varError.message);

    await supabase.from("inventory").insert({
      variant_id: variant.id,
      on_hand: initStock,
      reserved: 0,
    });

    if (initStock > 0) {
      await supabase.from("stock_movements").insert({
        variant_id: variant.id,
        type: "INITIAL_STOCK",
        quantity: initStock,
        on_hand_before: 0,
        on_hand_after: initStock,
        reserved_before: 0,
        reserved_after: 0,
        note: "Начальный ввод остатка",
      });
    }

    return variant as ProductVariant;
  }

  const newVariant: ProductVariant = {
    id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    product_id: payload.product_id,
    sku: payload.sku,
    color: payload.color,
    size: payload.size,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockState.variants.push(newVariant);

  const newInv: InventoryRecord = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    variant_id: newVariant.id,
    on_hand: initStock,
    reserved: 0,
    available: initStock,
    updated_at: new Date().toISOString(),
  };
  mockState.inventory.push(newInv);

  if (initStock > 0) {
    mockState.movements.unshift({
      id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      variant_id: newVariant.id,
      type: "INITIAL_STOCK",
      quantity: initStock,
      order_id: null,
      on_hand_before: 0,
      on_hand_after: initStock,
      reserved_before: 0,
      reserved_after: 0,
      created_by: "Admin",
      note: "Начальный ввод остатка",
      created_at: new Date().toISOString(),
    });
  }

  return newVariant;
}

export async function updateVariant(
  id: string,
  payload: Partial<Pick<ProductVariant, "sku" | "color" | "size" | "active">>
): Promise<ProductVariant> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("product_variants")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ProductVariant;
  }

  const idx = mockState.variants.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error("Вариант не найден");
  mockState.variants[idx] = {
    ...mockState.variants[idx],
    ...payload,
    updated_at: new Date().toISOString(),
  };
  return mockState.variants[idx];
}

export async function fetchInventory(): Promise<InventoryRecord[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("inventory")
      .select("*, variant:product_variants(*, product:products(*, collection:collections(*)))")
      .order("updated_at", { ascending: false });
    if (!error && data) return data as InventoryRecord[];
  }

  return mockState.inventory.map((inv) => {
    const v = mockState.variants.find((variant) => variant.id === inv.variant_id);
    const p = v ? mockState.products.find((prod) => prod.id === v.product_id) : undefined;
    const pWithCol = p
      ? {
          ...p,
          collection: mockState.collections.find((c) => c.id === p.collection_id),
        }
      : undefined;
    return {
      ...inv,
      available: inv.on_hand - inv.reserved,
      variant: v ? { ...v, product: pWithCol } : undefined,
    };
  });
}

export async function adjustInventory(
  variantId: string,
  type: StockMovementType,
  delta: number,
  note: string,
  user: string = "Admin"
): Promise<{ on_hand: number; reserved: number; available: number }> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.rpc("rpc_adjust_inventory", {
      p_variant_id: variantId,
      p_type: type,
      p_delta: delta,
      p_note: note,
      p_user: user,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  // Mock implementation of rpc_adjust_inventory
  const inv = mockState.inventory.find((i) => i.variant_id === variantId);
  if (!inv) throw new Error("Запись остатков не найдена");

  const newOnHand = inv.on_hand + delta;
  if (newOnHand < 0) {
    throw new Error(`Физический остаток не может быть отрицательным (расчётное: ${newOnHand})`);
  }
  if (newOnHand < inv.reserved) {
    throw new Error(`Физический остаток (${newOnHand}) не может быть меньше активного резерва (${inv.reserved})`);
  }

  const onHandBefore = inv.on_hand;
  inv.on_hand = newOnHand;
  inv.available = newOnHand - inv.reserved;
  inv.updated_at = new Date().toISOString();

  mockState.movements.unshift({
    id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    variant_id: variantId,
    type,
    quantity: delta,
    order_id: null,
    on_hand_before: onHandBefore,
    on_hand_after: newOnHand,
    reserved_before: inv.reserved,
    reserved_after: inv.reserved,
    created_by: user,
    note,
    created_at: new Date().toISOString(),
  });

  return { on_hand: inv.on_hand, reserved: inv.reserved, available: inv.available };
}

export async function fetchStockMovements(filters?: {
  variantId?: string;
  type?: string;
  orderId?: string;
}): Promise<StockMovement[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    let query = supabase
      .from("stock_movements")
      .select("*, variant:product_variants(*, product:products(*))")
      .order("created_at", { ascending: false });

    if (filters?.variantId) query = query.eq("variant_id", filters.variantId);
    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.orderId) query = query.ilike("order_id", `%${filters.orderId}%`);

    const { data, error } = await query;
    if (!error && data) return data as StockMovement[];
  }

  let list = mockState.movements.map((mov) => {
    const v = mockState.variants.find((variant) => variant.id === mov.variant_id);
    const p = v ? mockState.products.find((prod) => prod.id === v.product_id) : undefined;
    return {
      ...mov,
      variant: v ? { ...v, product: p } : undefined,
    };
  });

  if (filters?.variantId) list = list.filter((m) => m.variant_id === filters.variantId);
  if (filters?.type) list = list.filter((m) => m.type === filters.type);
  if (filters?.orderId) list = list.filter((m) => m.order_id?.toLowerCase().includes(filters.orderId!.toLowerCase()));

  return list;
}

export async function fetchOrders(filters?: { status?: OrderStatus }): Promise<Order[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    let query = supabase
      .from("orders")
      .select("*, items:order_items(*, variant:product_variants(*, product:products(*)))")
      .order("created_at", { ascending: false });

    if (filters?.status) query = query.eq("status", filters.status);
    const { data, error } = await query;
    if (!error && data) return data as Order[];
  }

  let list = mockState.orders.map((ord) => ({
    ...ord,
    items: mockState.orderItems
      .filter((item) => item.order_id === ord.id)
      .map((item) => {
        const v = mockState.variants.find((variant) => variant.id === item.variant_id);
        const p = v ? mockState.products.find((prod) => prod.id === v.product_id) : undefined;
        return {
          ...item,
          variant: v ? { ...v, product: p } : undefined,
        };
      }),
  }));

  if (filters?.status) list = list.filter((o) => o.status === filters.status);
  return list;
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*, variant:product_variants(*, product:products(*)))")
      .eq("id", id)
      .single();
    if (!error && data) return data as Order;
    return null;
  }

  const ord = mockState.orders.find((o) => o.id === id);
  if (!ord) return null;

  return {
    ...ord,
    items: mockState.orderItems
      .filter((item) => item.order_id === ord.id)
      .map((item) => {
        const v = mockState.variants.find((variant) => variant.id === item.variant_id);
        const p = v ? mockState.products.find((prod) => prod.id === v.product_id) : undefined;
        return {
          ...item,
          variant: v ? { ...v, product: p } : undefined,
        };
      }),
  };
}

export async function getAuthoritativeVariant(variantIdOrSku: string): Promise<{
  variant: ProductVariant;
  product: Product;
  inventory?: InventoryRecord;
} | null> {
  const target = (variantIdOrSku || "").trim();
  if (!target) return null;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);
    let query = supabase
      .from("product_variants")
      .select("*, product:products(*, collection:collections(*)), inventory(*)");

    if (isUuid) {
      query = query.eq("id", target);
    } else {
      query = query.eq("sku", target);
    }

    const { data, error } = await query.maybeSingle();
    if (!error && data && data.product) {
      const inv = Array.isArray(data.inventory) ? data.inventory[0] : data.inventory;
      return {
        variant: data as ProductVariant,
        product: data.product as Product,
        inventory: inv as InventoryRecord | undefined,
      };
    }
  }

  // Mock implementation
  const v = mockState.variants.find(
    (variant) => variant.id === target || variant.sku.toLowerCase() === target.toLowerCase()
  );
  if (!v) return null;

  const p = mockState.products.find((prod) => prod.id === v.product_id);
  if (!p) return null;

  const col = p.collection_id
    ? mockState.collections.find((c) => c.id === p.collection_id)
    : undefined;
  const inv = mockState.inventory.find((i) => i.variant_id === v.id);

  return {
    variant: { ...v, product: { ...p, collection: col } },
    product: { ...p, collection: col },
    inventory: inv
      ? {
          ...inv,
          available: inv.on_hand - inv.reserved,
        }
      : undefined,
  };
}

export async function createOrderWithReservation(payload: {
  order_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  notes?: string;
  idempotency_key?: string;
  items: Array<{ variant_id: string; quantity: number; unit_price?: number }>;
}): Promise<{ order_id: string; order_number: string; total_amount?: number; idempotent?: boolean }> {
  const orderNumber = payload.order_number || `AH-${Math.floor(1000 + Math.random() * 9000)}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.rpc("rpc_create_order_with_reservation", {
      p_order_number: orderNumber,
      p_customer_name: payload.customer_name,
      p_customer_email: payload.customer_email,
      p_customer_phone: payload.customer_phone || null,
      p_shipping_address: payload.shipping_address || null,
      p_total_amount: 0, // Authoritative total calculated inside DB transaction
      p_notes: payload.notes || null,
      p_items: payload.items,
      p_idempotency_key: payload.idempotency_key || null,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  // Persistent Idempotency Check in mock implementation
  if (payload.idempotency_key && payload.idempotency_key.trim()) {
    const cleanKey = payload.idempotency_key.trim();
    const existing = mockState.orders.find((o) => o.idempotency_key === cleanKey);
    if (existing) {
      return {
        order_id: existing.id,
        order_number: existing.order_number,
        total_amount: existing.total_amount,
        idempotent: true,
      };
    }
  }

  // Mock implementation of rpc_create_order_with_reservation with strict authoritative checks
  let calculatedTotal = 0;
  const validatedItems: Array<{
    variant_id: string;
    quantity: number;
    unit_price: number;
    variant_sku: string;
  }> = [];

  for (const item of payload.items) {
    if (item.quantity <= 0) {
      throw new Error(`Некорректное количество для позиции: ${item.quantity}`);
    }

    const v = mockState.variants.find((variant) => variant.id === item.variant_id);
    if (!v) {
      throw new Error(`Вариант товара ${item.variant_id} не найден`);
    }

    const p = mockState.products.find((prod) => prod.id === v.product_id);
    if (!p) {
      throw new Error("Товар не найден");
    }

    if (!p.active) {
      throw new Error(`Товар "${p.name}" не доступен для заказа (деактивирован)`);
    }

    if (!v.active) {
      throw new Error(`Вариант товара ${p.name} (SKU: ${v.sku}) не доступен для заказа (деактивирован)`);
    }

    const inv = mockState.inventory.find((i) => i.variant_id === item.variant_id);
    if (!inv) throw new Error("Запись остатков для позиции не найдена");
    const available = inv.on_hand - inv.reserved;
    if (available < item.quantity) {
      throw new Error(
        `Недостаточно доступного остатка для ${v?.sku || item.variant_id}. Доступно: ${available}, запрошено: ${item.quantity}`
      );
    }

    // Authoritative unit_price strictly from product in database
    const authoritativePrice = p.price;
    calculatedTotal += item.quantity * authoritativePrice;

    validatedItems.push({
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: authoritativePrice,
      variant_sku: v.sku,
    });
  }

  const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_name: payload.customer_name,
    customer_email: payload.customer_email,
    customer_phone: payload.customer_phone || null,
    shipping_address: payload.shipping_address || null,
    total_amount: calculatedTotal,
    status: "NEW",
    shipped_at: null,
    notes: payload.notes || null,
    idempotency_key: payload.idempotency_key?.trim() || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockState.orders.unshift(newOrder);

  for (const item of validatedItems) {
    const inv = mockState.inventory.find((i) => i.variant_id === item.variant_id)!;
    const reservedBefore = inv.reserved;
    inv.reserved += item.quantity;
    inv.available = inv.on_hand - inv.reserved;
    inv.updated_at = new Date().toISOString();

    mockState.orderItems.push({
      id: `item-${Date.now()}-${Math.random()}`,
      order_id: orderId,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      reserved: true,
      created_at: new Date().toISOString(),
    });

    mockState.movements.unshift({
      id: `mov-${Date.now()}-${Math.random()}`,
      variant_id: item.variant_id,
      type: "RESERVE",
      quantity: item.quantity,
      order_id: orderNumber,
      on_hand_before: inv.on_hand,
      on_hand_after: inv.on_hand,
      reserved_before: reservedBefore,
      reserved_after: inv.reserved,
      created_by: "SYSTEM",
      note: `Резервирование под заказ ${orderNumber}`,
      created_at: new Date().toISOString(),
    });
  }

  return {
    order_id: orderId,
    order_number: orderNumber,
    total_amount: calculatedTotal,
    idempotent: false,
  };
}

export async function updateOrderStatus(
  orderId: string,
  targetStatus: OrderStatus,
  note?: string,
  user: string = "Admin"
): Promise<{ order_id: string; status: OrderStatus }> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.rpc("rpc_update_order_status", {
      p_order_id: orderId,
      p_target_status: targetStatus,
      p_note: note || null,
      p_user: user,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  // Mock implementation of rpc_update_order_status
  const ord = mockState.orders.find((o) => o.id === orderId);
  if (!ord) throw new Error("Заказ не найден");
  if (ord.status === targetStatus) return { order_id: orderId, status: targetStatus };

  if (ord.status === "CANCELLED") {
    throw new Error(`Нельзя изменить статус отменённого заказа ${ord.order_number}`);
  }
  if (ord.status === "COMPLETED" && targetStatus !== "COMPLETED") {
    throw new Error(`Заказ ${ord.order_number} уже завершён`);
  }
  if (ord.status === "SHIPPED" && targetStatus === "CANCELLED") {
    throw new Error(
      `Нельзя отменить уже отправленный заказ ${ord.order_number}. Используйте процедуру возврата (RETURN)`
    );
  }

  const items = mockState.orderItems.filter((i) => i.order_id === orderId);

  // Transition to SHIPPED
  if (targetStatus === "SHIPPED" && ord.status !== "SHIPPED") {
    for (const item of items) {
      const inv = mockState.inventory.find((i) => i.variant_id === item.variant_id);
      if (inv) {
        const onHandBefore = inv.on_hand;
        const reservedBefore = inv.reserved;
        inv.on_hand -= item.quantity;
        inv.reserved -= item.quantity;
        inv.available = inv.on_hand - inv.reserved;
        inv.updated_at = new Date().toISOString();
        item.reserved = false;

        mockState.movements.unshift({
          id: `mov-${Date.now()}-${Math.random()}`,
          variant_id: item.variant_id,
          type: "SHIP",
          quantity: item.quantity,
          order_id: ord.order_number,
          on_hand_before: onHandBefore,
          on_hand_after: inv.on_hand,
          reserved_before: reservedBefore,
          reserved_after: inv.reserved,
          created_by: user,
          note: note || `Отправка заказа ${ord.order_number}`,
          created_at: new Date().toISOString(),
        });
      }
    }
    ord.shipped_at = new Date().toISOString();
  } else if (targetStatus === "CANCELLED") {
    // Transition to CANCELLED (release reserved stock)
    for (const item of items) {
      if (item.reserved) {
        const inv = mockState.inventory.find((i) => i.variant_id === item.variant_id);
        if (inv) {
          const reservedBefore = inv.reserved;
          inv.reserved -= item.quantity;
          inv.available = inv.on_hand - inv.reserved;
          inv.updated_at = new Date().toISOString();
          item.reserved = false;

          mockState.movements.unshift({
            id: `mov-${Date.now()}-${Math.random()}`,
            variant_id: item.variant_id,
            type: "RELEASE_RESERVATION",
            quantity: item.quantity,
            order_id: ord.order_number,
            on_hand_before: inv.on_hand,
            on_hand_after: inv.on_hand,
            reserved_before: reservedBefore,
            reserved_after: inv.reserved,
            created_by: user,
            note: note || `Отмена заказа ${ord.order_number}, возврат резерва`,
            created_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  ord.status = targetStatus;
  ord.updated_at = new Date().toISOString();
  return { order_id: orderId, status: targetStatus };
}

export async function logGoogleOperation(payload: {
  operation_type: "IMPORT" | "EXPORT";
  resource_type: "PRODUCTS" | "INVENTORY" | "ORDERS" | "STOCK_MOVEMENTS" | "MONTHLY_REPORT";
  status: "SUCCESS" | "ERROR" | "PARTIAL";
  source_destination: string;
  items_processed: number;
  items_created: number;
  items_updated: number;
  items_failed: number;
  details?: Record<string, unknown>;
  performed_by?: string;
}): Promise<GoogleLog> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("google_import_export_logs")
      .insert({
        ...payload,
        details: payload.details || null,
        performed_by: payload.performed_by || "Admin",
      })
      .select()
      .single();
    if (!error && data) return data as GoogleLog;
  }

  const newLog: GoogleLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...payload,
    details: payload.details || null,
    performed_by: payload.performed_by || "Admin",
    created_at: new Date().toISOString(),
  };
  mockState.googleLogs.unshift(newLog);
  return newLog;
}

export async function fetchGoogleLogs(): Promise<GoogleLog[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("google_import_export_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) return data as GoogleLog[];
  }

  return mockState.googleLogs;
}

export async function fetchActiveGoogleIntegration(): Promise<GoogleIntegration | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("google_integrations")
      .select("*")
      .eq("status", "ACTIVE")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) return data as GoogleIntegration;
  }

  const found = mockState.googleIntegrations.find((i) => i.status === "ACTIVE");
  return found || null;
}

export async function setActiveGoogleSpreadsheet(
  sheetId: string,
  sheetTitle?: string
): Promise<GoogleIntegration> {
  const cleanId = sheetId.trim();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const existing = await fetchActiveGoogleIntegration();
    if (existing) {
      const { data, error } = await supabase
        .from("google_integrations")
        .update({
          sheet_id: cleanId,
          sheet_title: sheetTitle || existing.sheet_title || null,
          status: "ACTIVE",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (!error && data) return data as GoogleIntegration;
    } else {
      const { data, error } = await supabase
        .from("google_integrations")
        .insert({
          type: "SERVICE_ACCOUNT",
          sheet_id: cleanId,
          sheet_title: sheetTitle || null,
          status: "ACTIVE",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (!error && data) return data as GoogleIntegration;
    }
  }

  let active = mockState.googleIntegrations.find((i) => i.status === "ACTIVE");
  if (active) {
    active.sheet_id = cleanId;
    if (sheetTitle) active.sheet_title = sheetTitle;
    active.updated_at = new Date().toISOString();
  } else {
    active = {
      id: `gi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "SERVICE_ACCOUNT",
      sheet_id: cleanId,
      sheet_title: sheetTitle || null,
      status: "ACTIVE",
      last_sync_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockState.googleIntegrations.push(active);
  }
  return active;
}

export async function resolveDefaultSpreadsheet(): Promise<{
  defaultSpreadsheetId: string;
  source: "database" | "env" | "none";
  title?: string;
}> {
  // 1. Приоритет 1: active/default integration в google_integrations (БД)
  try {
    const active = await fetchActiveGoogleIntegration();
    if (active?.sheet_id && active.sheet_id.trim() !== "") {
      return {
        defaultSpreadsheetId: active.sheet_id.trim(),
        source: "database",
        title: active.sheet_title || undefined,
      };
    }
  } catch {
    // В случае сбоя чтения переходим к ENV
  }

  // 2. Приоритет 2: GOOGLE_DEFAULT_SPREADSHEET_ID из server-side ENV
  const envDefault = process.env.GOOGLE_DEFAULT_SPREADSHEET_ID?.trim();
  if (envDefault) {
    return {
      defaultSpreadsheetId: envDefault,
      source: "env",
    };
  }

  // 3. Приоритет 3: пусто
  return {
    defaultSpreadsheetId: "",
    source: "none",
  };
}

