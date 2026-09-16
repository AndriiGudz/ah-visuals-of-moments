import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { getSupabaseAdmin, resolveDefaultSpreadsheet } from "../src/lib/supabase/server";
import { exportInventoryToSheet } from "../src/lib/google/sheets";

interface ExpectedProduct {
  code: string;
  name: string;
  slug: string;
  price: number;
}

const TARGET_COLLECTION = {
  name: "Summer 2019",
  slug: "summer-2019",
  type: "REGULAR" as const,
  active: true,
};

const TARGET_PRODUCTS: ExpectedProduct[] = [
  {
    code: "MOM-001",
    name: "Moment 001",
    slug: "moment-001",
    price: 50.0,
  },
  {
    code: "MOM-002",
    name: "Moment 002",
    slug: "moment-002",
    price: 50.0,
  },
  {
    code: "MOM-003",
    name: "Moment 003",
    slug: "moment-003",
    price: 50.0,
  },
];

const TARGET_COLORS = [
  { code: "BLK", name: "Deep Black" },
  { code: "TPE", name: "Muted Taupe" },
  { code: "SND", name: "Warm Sand" },
  { code: "PLM", name: "Vintage Plum" },
];

const TARGET_SIZES = ["S", "M", "L", "XL"];

export async function bootstrapCatalog() {
  console.log("=================================================");
  console.log(" AH Visuals of Moments: Bootstrap Реального Каталога");
  console.log("=================================================");

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase credentials are not configured");
  }

  // 1. Проверка состояния таблиц (Commerce Layer Safety Guard)
  console.log("\n[1/5] Проверка безопасности состояния таблиц Supabase...");

  const { data: existingCols, error: colErr } = await supabase
    .from("collections")
    .select("id, slug, name");
  if (colErr) throw new Error(`Ошибка чтения collections: ${colErr.message}`);

  const { data: existingProds, error: prodErr } = await supabase
    .from("products")
    .select("id, product_code, name, slug");
  if (prodErr) throw new Error(`Ошибка чтения products: ${prodErr.message}`);

  const { data: existingVars, error: varErr } = await supabase
    .from("product_variants")
    .select("id, sku, product_id");
  if (varErr) throw new Error(`Ошибка чтения product_variants: ${varErr.message}`);

  // Вычисляем допустимые SKU
  const allowedSkus = new Set<string>();
  for (const prod of TARGET_PRODUCTS) {
    for (const col of TARGET_COLORS) {
      for (const size of TARGET_SIZES) {
        allowedSkus.add(`${prod.code}-${col.code}-${size}`);
      }
    }
  }

  const allowedProductCodes = new Set(TARGET_PRODUCTS.map((p) => p.code));
  const allowedCollectionSlugs = new Set([TARGET_COLLECTION.slug]);

  // Проверка на неожиданные коллекции
  const unexpectedCols = (existingCols || []).filter(
    (c) => !allowedCollectionSlugs.has(c.slug)
  );
  // Проверка на неожиданные товары
  const unexpectedProds = (existingProds || []).filter(
    (p) => !allowedProductCodes.has(p.product_code)
  );
  // Проверка на неожиданные варианты
  const unexpectedVars = (existingVars || []).filter(
    (v) => !allowedSkus.has(v.sku)
  );

  if (
    unexpectedCols.length > 0 ||
    unexpectedProds.length > 0 ||
    unexpectedVars.length > 0
  ) {
    console.error("\nОШИБКА БЕЗОПАСНОСТИ BOOTSTRAP: обнаружены посторонние или тестовые данные в базе!");
    if (unexpectedCols.length > 0) {
      console.error("Неожиданные коллекции:", unexpectedCols);
    }
    if (unexpectedProds.length > 0) {
      console.error("Неожиданные товары:", unexpectedProds);
    }
    if (unexpectedVars.length > 0) {
      console.error(`Неожиданные варианты (${unexpectedVars.length} шт.):`, unexpectedVars.slice(0, 5));
    }
    console.error(
      "\nСкрипт bootstrap завершён без внесения изменений. Никакие данные не удалены."
    );
    console.error(
      "Пожалуйста, выполните очистку тестовых данных перед запуском bootstrap."
    );
    process.exit(1);
  }

  console.log("✓ Проверка безопасности пройдена: база чиста или содержит только целевые записи.");

  // 2. Создание или обновление Collection (Summer 2019)
  console.log("\n[2/5] Проверка / создание коллекции Summer 2019...");
  let collectionId: string;

  const foundCol = (existingCols || []).find(
    (c) => c.slug === TARGET_COLLECTION.slug
  );
  if (foundCol) {
    collectionId = foundCol.id;
    console.log(`✓ Коллекция '${TARGET_COLLECTION.name}' уже существует (ID: ${collectionId})`);
  } else {
    const { data: newCol, error: createColErr } = await supabase
      .from("collections")
      .insert({
        name: TARGET_COLLECTION.name,
        slug: TARGET_COLLECTION.slug,
        type: TARGET_COLLECTION.type,
        active: TARGET_COLLECTION.active,
      })
      .select("id")
      .single();

    if (createColErr || !newCol) {
      throw new Error(`Не удалось создать коллекцию: ${createColErr?.message}`);
    }
    collectionId = newCol.id;
    console.log(`✓ Коллекция '${TARGET_COLLECTION.name}' успешно создана (ID: ${collectionId})`);
  }

  // 3. Создание или обновление Products (MOM-001, MOM-002, MOM-003)
  console.log("\n[3/5] Создание / проверка 3 продуктов (50.00 EUR)...");
  const productMap = new Map<string, string>(); // code -> id

  for (const targetProd of TARGET_PRODUCTS) {
    const existing = (existingProds || []).find(
      (p) => p.product_code === targetProd.code
    );

    if (existing) {
      // Обновляем параметры, не трогая неизменяемый product_code
      const { error: updErr } = await supabase
        .from("products")
        .update({
          name: targetProd.name,
          slug: targetProd.slug,
          collection_id: collectionId,
          price: targetProd.price,
          active: true,
        })
        .eq("id", existing.id);

      if (updErr) {
        throw new Error(`Ошибка обновления товара ${targetProd.code}: ${updErr.message}`);
      }
      productMap.set(targetProd.code, existing.id);
      console.log(`✓ Товар ${targetProd.code} ('${targetProd.name}') обновлён (Цена: €${targetProd.price})`);
    } else {
      const { data: created, error: insertErr } = await supabase
        .from("products")
        .insert({
          product_code: targetProd.code,
          name: targetProd.name,
          slug: targetProd.slug,
          collection_id: collectionId,
          price: targetProd.price,
          active: true,
        })
        .select("id")
        .single();

      if (insertErr || !created) {
        throw new Error(`Ошибка создания товара ${targetProd.code}: ${insertErr?.message}`);
      }
      productMap.set(targetProd.code, created.id);
      console.log(`✓ Товар ${targetProd.code} ('${targetProd.name}') создан (Цена: €${targetProd.price})`);
    }
  }

  // 4. Создание 48 Variants и 48 нулевых Inventory records
  console.log("\n[4/5] Создание матрицы 48 вариантов (3x4x4) с нулевыми остатками...");
  let createdVarsCount = 0;
  let existingVarsCount = 0;

  for (const targetProd of TARGET_PRODUCTS) {
    const productId = productMap.get(targetProd.code)!;

    for (const color of TARGET_COLORS) {
      for (const size of TARGET_SIZES) {
        const sku = `${targetProd.code}-${color.code}-${size}`;

        // Проверяем, существует ли уже вариант
        const { data: existingVariant } = await supabase
          .from("product_variants")
          .select("id")
          .eq("sku", sku)
          .maybeSingle();

        let variantId: string;

        if (existingVariant) {
          variantId = existingVariant.id;
          existingVarsCount++;
        } else {
          const { data: newVar, error: varCreateErr } = await supabase
            .from("product_variants")
            .insert({
              product_id: productId,
              sku,
              color: color.name,
              size,
              active: true,
            })
            .select("id")
            .single();

          if (varCreateErr || !newVar) {
            throw new Error(`Ошибка создания варианта ${sku}: ${varCreateErr?.message}`);
          }
          variantId = newVar.id;
          createdVarsCount++;
        }

        // Проверяем или создаем нулевой inventory
        const { data: existingInv } = await supabase
          .from("inventory")
          .select("id")
          .eq("variant_id", variantId)
          .maybeSingle();

        if (!existingInv) {
          const { error: invErr } = await supabase.from("inventory").insert({
            variant_id: variantId,
            on_hand: 0,
            reserved: 0,
          });

          if (invErr) {
            throw new Error(`Ошибка создания inventory для ${sku}: ${invErr.message}`);
          }
        }
      }
    }
  }

  console.log(`✓ Матрица вариантов сформирована: создано новых=${createdVarsCount}, уже существовало=${existingVarsCount} (Всего: 48)`);
  console.log("✓ Для всех 48 вариантов подтверждено наличие записей inventory (on_hand=0, reserved=0, available=0)");

  // 5. Экспорт в Google Sheets
  console.log("\n[5/5] Экспорт актуального каталога и инвентаря в Google Sheets...");
  try {
    const { defaultSpreadsheetId } = await resolveDefaultSpreadsheet();
    const spreadsheetId = defaultSpreadsheetId || process.env.GOOGLE_DEFAULT_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error("Не удалось определить ID таблицы Google Sheets (GOOGLE_DEFAULT_SPREADSHEET_ID не задан)");
    }
    const tabTitle = "Остатки";
    const exportResult = await exportInventoryToSheet(spreadsheetId, tabTitle);
    console.log(`✓ Экспорт в Google Sheets успешно выполнен: выгружено ${exportResult.rowsExported} строк вариантов`);
    console.log(`  Таблица ID: ${spreadsheetId}`);
    console.log(`  Вкладка: ${tabTitle}`);
  } catch (sheetErr) {
    console.error("Ошибка при экспорте в Google Sheets:", sheetErr);
    throw sheetErr;
  }

  console.log("\n=================================================");
  console.log(" BOOTSTRAP КАТАЛОГА УСПЕШНО ЗАВЕРШЁН!");
  console.log("=================================================");
}

// Запуск при прямом вызове
if (require.main === module || process.argv[1]?.endsWith("bootstrap-catalog.ts")) {
  bootstrapCatalog().catch((err) => {
    console.error("Критическая ошибка bootstrap:", err);
    process.exit(1);
  });
}
