if (process.env.RUN_HOSTED_INTEGRATION_TESTS === "true") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { loadEnvConfig } = require("@next/env");
  loadEnvConfig(process.cwd());
} else {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;
  (process.env as Record<string, string | undefined>).NODE_ENV = "test";
}

import {
  getCommerceProductByCode,
  getSupabaseAdmin,
  createCollection,
  createProduct,
} from "../src/lib/supabase/server";

async function runStorefrontCommerceTests() {
  console.log("=== ТЕСТИРОВАНИЕ СЕРВЕРНОГО СЛОЯ READ-ONLY STOREFRONT (STAGE A) ===");

  // 1. Проверка чтения реального товара MOM-001
  console.log("\n1. Проверка получения commerce data для MOM-001...");
  const p1 = await getCommerceProductByCode("MOM-001");
  if (!p1) {
    throw new Error("Товар MOM-001 не найден через getCommerceProductByCode!");
  }

  console.log(`✓ Товар найден: Code=${p1.product_code}, Price=€${p1.price}, Active=${p1.active}`);
  console.log(`✓ Коллекция: ${p1.collection?.name} (${p1.collection?.type})`);
  console.log(`✓ Количество вариантов: ${p1.variants.length}`);

  if (p1.product_code !== "MOM-001") {
    throw new Error(`Ожидался product_code MOM-001, получено: ${p1.product_code}`);
  }
  if (p1.price !== 50) {
    throw new Error(`Ожидалась цена 50 EUR, получено: ${p1.price}`);
  }
  if (!p1.collection || p1.collection.slug !== "summer-2019" || p1.collection.type !== "REGULAR") {
    throw new Error(`Некорректная коллекция: ${JSON.stringify(p1.collection)}`);
  }
  if (p1.variants.length !== 16) {
    throw new Error(`Ожидалось 16 вариантов, получено: ${p1.variants.length}`);
  }

  // Проверка начального нулевого остатка
  const allZero = p1.variants.every((v) => (v.inventory?.available ?? 0) === 0);
  if (!allZero) {
    throw new Error("Начальные остатки должны быть нулевыми (available === 0)!");
  }
  console.log("✓ Подтверждено: все 16 вариантов имеют нулевой остаток (available=0, sold out)");

  // 2. Проверка нечувствительности к регистру и пробелам
  console.log("\n2. Проверка case-insensitive поиска (mom-002)...");
  const p2 = await getCommerceProductByCode(" mom-002 ");
  if (!p2 || p2.product_code !== "MOM-002" || p2.variants.length !== 16) {
    throw new Error(`Поиск mom-002 не вернул ожидаемые данные: ${p2?.product_code}`);
  }
  console.log("✓ Case-insensitive вызов ' mom-002 ' успешно вернул MOM-002");

  // 3. Проверка MOM-003
  console.log("\n3. Проверка MOM-003...");
  const p3 = await getCommerceProductByCode("MOM-003");
  if (!p3 || p3.product_code !== "MOM-003" || p3.variants.length !== 16) {
    throw new Error(`Поиск MOM-003 не вернул ожидаемые данные: ${p3?.product_code}`);
  }
  console.log("✓ MOM-003 успешно возвращён с 16 вариантами");

  // 4. Проверка несуществующего товара (должен вернуть null без падения)
  console.log("\n4. Проверка обработки отсутствующего товара...");
  const pMissing = await getCommerceProductByCode("MOM-UNKNOWN-999");
  if (pMissing !== null) {
    throw new Error("Ожидался null для несуществующего товара!");
  }
  console.log("✓ Несуществующий товар вернул null без исключения");

  // 5. Тестирование динамического обновления цен и остатков (no-store validation)
  console.log("\n5. Проверка динамического отражения изменений в Supabase (no-store)...");
  const supabase = getSupabaseAdmin();

  if (supabase) {
    // Временно изменяем цену MOM-001 на 52.00 и проверяем, что getCommerceProductByCode сразу видит 52.00
    await supabase.from("products").update({ price: 52.0 }).eq("product_code", "MOM-001");
    const p1UpdatedPrice = await getCommerceProductByCode("MOM-001");
    if (p1UpdatedPrice?.price !== 52) {
      throw new Error(`Ожидалась цена 52 EUR после обновления в БД, получено: ${p1UpdatedPrice?.price}`);
    }
    console.log("✓ Изменение цены в Supabase (50 -> 52 EUR) немедленно отобразилось через getCommerceProductByCode (no-store)");

    // Возвращаем обратно 50.00
    await supabase.from("products").update({ price: 50.0 }).eq("product_code", "MOM-001");
    const p1Restored = await getCommerceProductByCode("MOM-001");
    if (p1Restored?.price !== 50) {
      throw new Error("Не удалось восстановить цену 50 EUR");
    }
    console.log("✓ Цена успешно возвращена на 50 EUR");

    // Временно меняем остаток для MOM-001-BLK-M с 0 на 7 шт.
    const targetVar = p1.variants.find((v) => v.sku === "MOM-001-BLK-M")!;
    await supabase.from("inventory").update({ on_hand: 7 }).eq("variant_id", targetVar.id);
    const p1UpdatedStock = await getCommerceProductByCode("MOM-001");
    const updatedVar = p1UpdatedStock?.variants.find((v) => v.sku === "MOM-001-BLK-M");
    if (updatedVar?.inventory?.available !== 7) {
      throw new Error(`Ожидался available=7 после обновления остатка, получено: ${updatedVar?.inventory?.available}`);
    }
    console.log("✓ Изменение остатка в Supabase (0 -> 7 шт.) немедленно отобразилось в inventory.available (no-store)");

    // Возвращаем остаток обратно в 0
    await supabase.from("inventory").update({ on_hand: 0 }).eq("variant_id", targetVar.id);
    const p1ZeroStock = await getCommerceProductByCode("MOM-001");
    const restoredVar = p1ZeroStock?.variants.find((v) => v.sku === "MOM-001-BLK-M");
    if (restoredVar?.inventory?.available !== 0) {
      throw new Error("Не удалось сбросить остаток обратно в 0");
    }
    console.log("✓ Остаток успешно возвращён в 0");

    // Проверка product.active = false
    await supabase.from("products").update({ active: false }).eq("product_code", "MOM-001");
    const p1Inactive = await getCommerceProductByCode("MOM-001");
    if (p1Inactive?.active !== false) {
      throw new Error("Ожидался active=false");
    }
    console.log("✓ product.active = false корректно возвращается сервером");

    // Возвращаем active = true
    await supabase.from("products").update({ active: true }).eq("product_code", "MOM-001");
    const p1Active = await getCommerceProductByCode("MOM-001");
    if (p1Active?.active !== true) {
      throw new Error("Не удалось восстановить active=true");
    }
    console.log("✓ product.active успешно восстановлен в true");
  }

  // 6. Проверка LIMITED коллекции
  console.log("\n6. Проверка отображения типа LIMITED коллекции...");
  const colLimited = await createCollection({
    name: "Limited Test Drop",
    slug: `ltd-test-${Date.now()}`,
    type: "LIMITED",
  });
  const prodLimited = await createProduct({
    product_code: `MOM-LTD-${Date.now().toString().slice(-4)}`,
    name: "Limited Shirt",
    slug: `ltd-shirt-${Date.now()}`,
    collection_id: colLimited.id,
    price: 65,
  });

  const pLimited = await getCommerceProductByCode(prodLimited.product_code);
  if (pLimited?.collection?.type !== "LIMITED") {
    throw new Error(`Ожидался type LIMITED, получено: ${pLimited?.collection?.type}`);
  }
  console.log(`✓ Коллекция LIMITED успешно прочитана: type=${pLimited.collection.type}`);

  // Очистка временного товара LIMITED
  if (supabase) {
    await supabase.from("products").delete().eq("id", prodLimited.id);
    await supabase.from("collections").delete().eq("id", colLimited.id);
  }

  console.log("\n=== ВСЕ ТЕСТЫ СТОРА STOREFRONT COMMERCE УСПЕШНО ПРОЙДЕНЫ! ===");
}

runStorefrontCommerceTests().catch((err) => {
  console.error("Ошибка тестов storefront-commerce:", err);
  process.exit(1);
});
