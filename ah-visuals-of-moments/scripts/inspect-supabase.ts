import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { getSupabaseAdmin } from "../src/lib/supabase/server";

async function inspect() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("Supabase не сконфигурирован");
    process.exit(1);
  }

  console.log("=== ИНСПЕКЦИЯ ТЕКУЩЕГО СОСТОЯНИЯ SUPABASE ===");

  // Collections
  const { data: cols, error: colErr } = await supabase.from("collections").select("*");
  if (colErr) console.error("Ошибка чтения collections:", colErr);
  console.log(`\n=== COLLECTIONS (${cols?.length}) ===`);
  cols?.forEach((c) => console.log(`  - [${c.type}] slug="${c.slug}", name="${c.name}", id=${c.id}`));

  // Products
  const { data: prods, error: prodErr } = await supabase.from("products").select("*");
  if (prodErr) console.error("Ошибка чтения products:", prodErr);
  console.log(`\n=== PRODUCTS (${prods?.length}) ===`);
  prods?.forEach((p) => console.log(`  - code="${p.product_code}", slug="${p.slug}", name="${p.name}", price=${p.price}, id=${p.id}`));

  // Product variants
  const { data: vars, error: varErr } = await supabase.from("product_variants").select("id, product_id, sku, color, size, active");
  if (varErr) console.error("Ошибка чтения product_variants:", varErr);
  console.log(`\n=== VARIANTS (${vars?.length}) ===`);

  // Inventory
  const { data: inv, error: invErr } = await supabase.from("inventory").select("*");
  if (invErr) console.error("Ошибка чтения inventory:", invErr);
  console.log(`\nInventory rows count: ${inv?.length}`);
  const nonZeroInv = inv?.filter((i) => i.on_hand !== 0 || i.reserved !== 0 || i.available !== 0);
  console.log(`  Non-zero inventory rows count: ${nonZeroInv?.length}`);
  nonZeroInv?.forEach((i) => console.log(`    - variant_id=${i.variant_id}, on_hand=${i.on_hand}, reserved=${i.reserved}, available=${i.available}`));

  // Orders
  const { data: orders, error: orderErr } = await supabase.from("orders").select("id, order_number, status, total_amount, created_at");
  if (orderErr) console.error("Ошибка чтения orders:", orderErr);
  console.log(`\nOrders count: ${orders?.length}`);
  orders?.forEach((o) => console.log(`  - order_number=${o.order_number}, status=${o.status}, total=${o.total_amount}`));

  // Order Items
  const { data: orderItems, error: itemsErr } = await supabase.from("order_items").select("id, order_id, variant_id, quantity");
  if (itemsErr) console.error("Ошибка чтения order_items:", itemsErr);
  console.log(`\nOrder Items count: ${orderItems?.length}`);

  // Stock Movements
  const { data: movements, error: movErr } = await supabase.from("stock_movements").select("id, type, quantity, order_id, created_at");
  if (movErr) console.error("Ошибка чтения stock_movements:", movErr);
  console.log(`\nStock Movements count: ${movements?.length}`);
  movements?.forEach((m) => console.log(`  - type=${m.type}, qty=${m.quantity}, order_id=${m.order_id}`));

  // Google Integrations
  const { data: gInteg } = await supabase.from("google_integrations").select("*");
  console.log(`\nGoogle Integrations count: ${gInteg?.length}`);
  gInteg?.forEach((g) => console.log(`  - id=${g.id}, type=${g.type}, sheet_id=${g.sheet_id}, status=${g.status}`));
}

inspect().catch(console.error);
