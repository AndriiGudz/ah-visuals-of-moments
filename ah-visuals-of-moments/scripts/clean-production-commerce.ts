import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { getSupabaseAdmin } from "../src/lib/supabase/server";

const EXPECTED_PRODUCTION_COLLECTION = {
  slug: "summer-2019",
  name: "Summer 2019",
  type: "REGULAR",
};

const EXPECTED_PRODUCTION_PRODUCTS = ["MOM-001", "MOM-002", "MOM-003"];

const EXPECTED_TEST_COLLECTION_SLUGS = new Set([
  "zero-col-1789565975415",
  "zero-col-1789566055399",
  "zero-col-mu45gn0f-egrxq",
  "stage-b-col-mu45gn0f-egrxq",
  "zero-col-mu45pchb-7xmbr",
  "stage-b-col-mu45pchb-7xmbr",
]);

const EXPECTED_TEST_PRODUCT_CODES = new Set([
  "MOM-ZERO-5658",
  "MOM-ZERO-5667",
  "MOM-ZERO-MU45GN0F-EGRXQ",
  "MOM-STB-MU45GN0F-EGRXQ",
  "MOM-ZERO-MU45PCHB-7XMBR",
  "MOM-STB-MU45PCHB-7XMBR",
  "MOM-INACT-MU45PCHB-7XMBR",
]);

const TARGET_COLORS = [
  { code: "BLK", name: "Deep Black" },
  { code: "TPE", name: "Muted Taupe" },
  { code: "SND", name: "Warm Sand" },
  { code: "PLM", name: "Vintage Plum" },
];
const TARGET_SIZES = ["S", "M", "L", "XL"];

// Expected 48 SKU
const EXPECTED_48_SKUS = new Set<string>();
for (const code of EXPECTED_PRODUCTION_PRODUCTS) {
  for (const color of TARGET_COLORS) {
    for (const size of TARGET_SIZES) {
      EXPECTED_48_SKUS.add(`${code}-${color.code}-${size}`);
    }
  }
}

export async function runProductionCommerceCleanup() {
  console.log("====================================================================");
  console.log(" AH Visuals of Moments: Production Commerce Cleanup (Stage B Reset)");
  console.log("====================================================================\n");

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase credentials are not configured in environment!");
  }

  // ---------------------------------------------------------------------------
  // 1. PRE-FLIGHT SNAPSHOT & FAIL-CLOSED VALIDATION
  // ---------------------------------------------------------------------------
  console.log("[1/5] Получение pre-flight snapshot базы данных Supabase...");

  const { data: rawCols, error: colErr } = await supabase.from("collections").select("*");
  if (colErr) throw new Error(`Ошибка чтения collections: ${colErr.message}`);

  const { data: rawProds, error: prodErr } = await supabase.from("products").select("*");
  if (prodErr) throw new Error(`Ошибка чтения products: ${prodErr.message}`);

  const { data: rawVars, error: varErr } = await supabase.from("product_variants").select("*");
  if (varErr) throw new Error(`Ошибка чтения product_variants: ${varErr.message}`);

  const { data: rawInv, error: invErr } = await supabase.from("inventory").select("*");
  if (invErr) throw new Error(`Ошибка чтения inventory: ${invErr.message}`);

  const { data: rawOrders, error: orderErr } = await supabase.from("orders").select("*");
  if (orderErr) throw new Error(`Ошибка чтения orders: ${orderErr.message}`);

  const { data: rawItems, error: itemsErr } = await supabase.from("order_items").select("*");
  if (itemsErr) throw new Error(`Ошибка чтения order_items: ${itemsErr.message}`);

  const { data: rawMovements, error: movErr } = await supabase.from("stock_movements").select("*");
  if (movErr) throw new Error(`Ошибка чтения stock_movements: ${movErr.message}`);

  const collections = rawCols || [];
  const products = rawProds || [];
  const variants = rawVars || [];
  const inventory = rawInv || [];
  const orders = rawOrders || [];
  const orderItems = rawItems || [];
  const movements = rawMovements || [];

  console.log("Pre-flight количества строк:");
  console.log(`  - collections: ${collections.length} (ожидается: 7)`);
  console.log(`  - products: ${products.length} (ожидается: 10)`);
  console.log(`  - product_variants: ${variants.length} (ожидается: 205)`);
  console.log(`  - inventory: ${inventory.length} (ожидается: 205)`);
  console.log(`  - orders: ${orders.length} (ожидается: 7)`);
  console.log(`  - order_items: ${orderItems.length} (ожидается: 7)`);
  console.log(`  - stock_movements: ${movements.length} (ожидается: 23)`);

  // Строгая проверка точных количеств
  if (
    collections.length !== 7 ||
    products.length !== 10 ||
    variants.length !== 205 ||
    inventory.length !== 205 ||
    orders.length !== 7 ||
    orderItems.length !== 7 ||
    movements.length !== 23
  ) {
    throw new Error(
      `FAIL-CLOSED ABORT: snapshot базы отличается от подтверждённого состояния Stage B!\n` +
      `Количества: cols=${collections.length}, prods=${products.length}, vars=${variants.length}, ` +
      `inv=${inventory.length}, orders=${orders.length}, items=${orderItems.length}, movs=${movements.length}. ` +
      `Операция отменена. Никакие данные не удалены.`
    );
  }

  // Проверка целевой коллекции Summer 2019
  const prodCollection = collections.find((c) => c.slug === EXPECTED_PRODUCTION_COLLECTION.slug);
  if (!prodCollection || prodCollection.type !== EXPECTED_PRODUCTION_COLLECTION.type || !prodCollection.active) {
    throw new Error(`FAIL-CLOSED ABORT: целевая коллекция Summer 2019 не найдена или имеет некорректные параметры!`);
  }

  // Проверка 6 тестовых коллекций
  const testCollections = collections.filter((c) => c.slug !== EXPECTED_PRODUCTION_COLLECTION.slug);
  if (testCollections.length !== 6) {
    throw new Error(`FAIL-CLOSED ABORT: ожидалось ровно 6 тестовых коллекций, найдено: ${testCollections.length}`);
  }
  for (const tc of testCollections) {
    if (!EXPECTED_TEST_COLLECTION_SLUGS.has(tc.slug)) {
      throw new Error(`FAIL-CLOSED ABORT: обнаружена неожиданная коллекция со slug='${tc.slug}' (id=${tc.id})!`);
    }
  }

  // Проверка 3 целевых продуктов
  const prodProducts = products.filter((p) => EXPECTED_PRODUCTION_PRODUCTS.includes(p.product_code));
  if (prodProducts.length !== 3) {
    throw new Error(`FAIL-CLOSED ABORT: ожидалось ровно 3 целевых продукта MOM-001..003, найдено: ${prodProducts.length}`);
  }
  for (const p of prodProducts) {
    if (Number(p.price) !== 50.0 || !p.active || p.collection_id !== prodCollection.id) {
      throw new Error(`FAIL-CLOSED ABORT: продукт ${p.product_code} имеет неожиданные атрибуты (цена=${p.price}, active=${p.active})`);
    }
  }

  // Проверка 7 тестовых продуктов
  const testProducts = products.filter((p) => !EXPECTED_PRODUCTION_PRODUCTS.includes(p.product_code));
  if (testProducts.length !== 7) {
    throw new Error(`FAIL-CLOSED ABORT: ожидалось ровно 7 тестовых продуктов, найдено: ${testProducts.length}`);
  }
  for (const tp of testProducts) {
    if (!EXPECTED_TEST_PRODUCT_CODES.has(tp.product_code)) {
      throw new Error(`FAIL-CLOSED ABORT: обнаружен неожиданный продукт с кодом '${tp.product_code}' (id=${tp.id})!`);
    }
  }

  // Проверка вариантов: ровно 48 целевых SKU
  const targetProdIds = new Set(prodProducts.map((p) => p.id));
  const targetVariants = variants.filter((v) => targetProdIds.has(v.product_id));
  if (targetVariants.length !== 48) {
    throw new Error(`FAIL-CLOSED ABORT: ожидалось ровно 48 вариантов для MOM-001..003, найдено: ${targetVariants.length}`);
  }
  for (const tv of targetVariants) {
    if (!EXPECTED_48_SKUS.has(tv.sku)) {
      throw new Error(`FAIL-CLOSED ABORT: обнаружен непредусмотренный целевой SKU: ${tv.sku}`);
    }
  }

  const testVariants = variants.filter((v) => !targetProdIds.has(v.product_id));
  if (testVariants.length !== 157) {
    throw new Error(`FAIL-CLOSED ABORT: ожидалось ровно 157 тестовых вариантов, найдено: ${testVariants.length}`);
  }

  console.log("✓ Pre-flight validation пройдена на 100%! Все 7 таблиц и структуры строго соответствуют ожидаемому состоянию.\n");

  // ---------------------------------------------------------------------------
  // 2. УДАЛЕНИЕ ОПЕРАЦИОННЫХ ТЕСТОВЫХ ДАННЫХ (order_items, orders, stock_movements)
  // ---------------------------------------------------------------------------
  console.log("[2/5] Удаление тестовых operational records...");

  // 2.1. order_items
  const itemIds = orderItems.map((item) => item.id);
  const { error: delItemsErr } = await supabase.from("order_items").delete().in("id", itemIds);
  if (delItemsErr) throw new Error(`Ошибка удаления order_items: ${delItemsErr.message}`);
  console.log(`✓ Удалено ${itemIds.length} строк order_items`);

  // 2.2. orders
  const orderIds = orders.map((o) => o.id);
  const { error: delOrdersErr } = await supabase.from("orders").delete().in("id", orderIds);
  if (delOrdersErr) throw new Error(`Ошибка удаления orders: ${delOrdersErr.message}`);
  console.log(`✓ Удалено ${orderIds.length} строк orders`);

  // 2.3. stock_movements
  const movIds = movements.map((m) => m.id);
  const { error: delMovErr } = await supabase.from("stock_movements").delete().in("id", movIds);
  if (delMovErr) throw new Error(`Ошибка удаления stock_movements: ${delMovErr.message}`);
  console.log(`✓ Удалено ${movIds.length} строк stock_movements`);

  // ---------------------------------------------------------------------------
  // 3. УДАЛЕНИЕ ТЕСТОВЫХ ПРОДУКТОВ И КОЛЛЕКЦИЙ
  // ---------------------------------------------------------------------------
  console.log("\n[3/5] Удаление тестовых товаров и тестовых коллекций по подтверждённым ID...");

  // 3.1. Удаление 7 тестовых продуктов (PostgreSQL ON DELETE CASCADE автоматически удалит их 157 вариантов и 157 inventory rows)
  const testProductIds = testProducts.map((p) => p.id);
  const { error: delProdsErr } = await supabase.from("products").delete().in("id", testProductIds);
  if (delProdsErr) throw new Error(`Ошибка удаления тестовых продуктов: ${delProdsErr.message}`);
  console.log(`✓ Удалено ${testProductIds.length} тестовых продуктов (вместе с их 157 вариантами и инвентарем)`);

  // 3.2. Удаление 6 тестовых коллекций
  const testCollectionIds = testCollections.map((c) => c.id);
  const { error: delColsErr } = await supabase.from("collections").delete().in("id", testCollectionIds);
  if (delColsErr) throw new Error(`Ошибка удаления тестовых коллекций: ${delColsErr.message}`);
  console.log(`✓ Удалено ${testCollectionIds.length} тестовых коллекций`);

  // ---------------------------------------------------------------------------
  // 4. ONE-OFF RESET ИНВЕНТАРЯ ДЛЯ 48 ЦЕЛЕВЫХ ВАРИАНТОВ (on_hand=0, reserved=0, available=0)
  // ---------------------------------------------------------------------------
  console.log("\n[4/5] Обнуление остатков для 48 production variants (без создания stock_movements)...");

  const targetVariantIds = targetVariants.map((v) => v.id);
  const { error: updInvErr } = await supabase
    .from("inventory")
    .update({
      on_hand: 0,
      reserved: 0,
      updated_at: new Date().toISOString(),
    })
    .in("variant_id", targetVariantIds);

  if (updInvErr) throw new Error(`Ошибка обновления inventory: ${updInvErr.message}`);
  console.log(`✓ Остатки 48 целевых вариантов успешно сброшены в on_hand=0, reserved=0 (available=0 computed)`);

  // ---------------------------------------------------------------------------
  // 5. POST-CLEANUP VERIFICATION & ASSERTIONS
  // ---------------------------------------------------------------------------
  console.log("\n[5/5] Финальная проверка post-cleanup состояния базы данных Supabase...");

  const { data: postCols, error: pColErr } = await supabase.from("collections").select("*");
  if (pColErr) throw new Error(pColErr.message);

  const { data: postProds, error: pProdErr } = await supabase.from("products").select("*");
  if (pProdErr) throw new Error(pProdErr.message);

  const { data: postVars, error: pVarErr } = await supabase.from("product_variants").select("*");
  if (pVarErr) throw new Error(pVarErr.message);

  const { data: postInv, error: pInvErr } = await supabase.from("inventory").select("*");
  if (pInvErr) throw new Error(pInvErr.message);

  const { data: postOrders, error: pOrdErr } = await supabase.from("orders").select("*");
  if (pOrdErr) throw new Error(pOrdErr.message);

  const { data: postItems, error: pItemErr } = await supabase.from("order_items").select("*");
  if (pItemErr) throw new Error(pItemErr.message);

  const { data: postMovs, error: pMovErr } = await supabase.from("stock_movements").select("*");
  if (pMovErr) throw new Error(pMovErr.message);

  console.log("Финальные количества в hosted Supabase:");
  console.log(`  - collections: ${postCols?.length} (ожидается: 1)`);
  console.log(`  - products: ${postProds?.length} (ожидается: 3)`);
  console.log(`  - product_variants: ${postVars?.length} (ожидается: 48)`);
  console.log(`  - inventory: ${postInv?.length} (ожидается: 48)`);
  console.log(`  - orders: ${postOrders?.length} (ожидается: 0)`);
  console.log(`  - order_items: ${postItems?.length} (ожидается: 0)`);
  console.log(`  - stock_movements: ${postMovs?.length} (ожидается: 0)`);

  // Assertions
  if (postCols?.length !== 1 || postCols[0].slug !== "summer-2019") {
    throw new Error(`Post-cleanup assertion failed: collections count=${postCols?.length}`);
  }
  if (postProds?.length !== 3) {
    throw new Error(`Post-cleanup assertion failed: products count=${postProds?.length}`);
  }
  const remainingProdCodes = new Set(postProds.map((p) => p.product_code));
  for (const c of EXPECTED_PRODUCTION_PRODUCTS) {
    if (!remainingProdCodes.has(c)) {
      throw new Error(`Post-cleanup assertion failed: целевой продукт ${c} отсутствует!`);
    }
  }
  if (postVars?.length !== 48) {
    throw new Error(`Post-cleanup assertion failed: product_variants count=${postVars?.length}`);
  }
  if (postInv?.length !== 48) {
    throw new Error(`Post-cleanup assertion failed: inventory count=${postInv?.length}`);
  }

  // Проверка что все 48 inventory строк строго on_hand=0, reserved=0, available=0
  for (const row of postInv || []) {
    if (row.on_hand !== 0 || row.reserved !== 0 || row.available !== 0) {
      throw new Error(
        `Post-cleanup assertion failed: запись инвентаря ${row.id} имеет ненулевые значения: ` +
        `on_hand=${row.on_hand}, reserved=${row.reserved}, available=${row.available}`
      );
    }
  }

  if (postOrders?.length !== 0) {
    throw new Error(`Post-cleanup assertion failed: orders count=${postOrders?.length}`);
  }
  if (postItems?.length !== 0) {
    throw new Error(`Post-cleanup assertion failed: order_items count=${postItems?.length}`);
  }
  if (postMovs?.length !== 0) {
    throw new Error(`Post-cleanup assertion failed: stock_movements count=${postMovs?.length}`);
  }

  console.log("\n====================================================================");
  console.log(" ПОЛНАЯ ЧИСТКА ЗАВЕРШЕНА УСПЕШНО! БАЗА В PRODUCTION-READY СОСТОЯНИИ");
  console.log("====================================================================");
}

if (require.main === module || process.argv[1]?.endsWith("clean-production-commerce.ts")) {
  runProductionCommerceCleanup().catch((err) => {
    console.error("\n❌ ОШИБКА CLEANUP СКРИПТА:", err);
    process.exit(1);
  });
}
