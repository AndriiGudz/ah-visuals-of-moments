import {
  fetchInventory,
  createOrderWithReservation,
  updateOrderStatus,
  adjustInventory,
  fetchStockMovements,
  resolveDefaultSpreadsheet,
  setActiveGoogleSpreadsheet,
  createProduct,
  updateProduct,
  createVariant,
  createCollection,
  updateCollection,
  fetchCollections,
  fetchProducts,
} from "../src/lib/supabase/server";
import {
  previewProductsImport,
  executeProductsImport,
  exportInventoryToSheet,
} from "../src/lib/google/sheets";

async function runTests() {
  console.log("=== НАЧАЛО ТЕСТИРОВАНИЯ БИЗНЕС-ЛОГИКИ ===");

  // 1. Проверка начального состояния
  const initialInventory = await fetchInventory();
  const targetVar = initialInventory.find((i) => i.variant?.sku === "AH-M01-BLK-M");
  if (!targetVar) {
    throw new Error("Не найден тестовый вариант AH-M01-BLK-M");
  }

  console.log(
    `1. Начальное состояние (${targetVar.variant?.sku}): on_hand=${targetVar.on_hand}, reserved=${targetVar.reserved}, available=${targetVar.available}`
  );
  if (targetVar.on_hand !== 10 || targetVar.reserved !== 0 || targetVar.available !== 10) {
    throw new Error(`Ожидалось 10/0/10, получено: ${targetVar.on_hand}/${targetVar.reserved}/${targetVar.available}`);
  }

  // 2. Резервирование 3 шт. (Создание заказа на 3 шт.)
  console.log("2. Создание заказа на 3 единицы...");
  const orderRes = await createOrderWithReservation({
    order_number: "AH-TEST-001",
    customer_name: "Тестовый Покупатель",
    customer_email: "test@example.com",
    items: [{ variant_id: targetVar.variant_id, quantity: 3, unit_price: 85 }],
  });
  console.log(`Заказ создан: ${orderRes.order_number}`);

  const invAfterReserve = (await fetchInventory()).find((i) => i.variant_id === targetVar.variant_id)!;
  console.log(
    `Состояние после резерва 3 шт.: on_hand=${invAfterReserve.on_hand}, reserved=${invAfterReserve.reserved}, available=${invAfterReserve.available}`
  );
  if (invAfterReserve.on_hand !== 10 || invAfterReserve.reserved !== 3 || invAfterReserve.available !== 7) {
    throw new Error(`Ожидалось 10/3/7, получено: ${invAfterReserve.on_hand}/${invAfterReserve.reserved}/${invAfterReserve.available}`);
  }

  // 3. Проверка защиты от Overselling
  console.log("3. Проверка защиты от оверселлинга (попытка зарезервировать 8 шт. при доступных 7)...");
  let oversellingBlocked = false;
  try {
    await createOrderWithReservation({
      order_number: "AH-TEST-OVERSELL",
      customer_name: "Нелегитимный заказ",
      customer_email: "bad@example.com",
      items: [{ variant_id: targetVar.variant_id, quantity: 8, unit_price: 85 }],
    });
  } catch (err: unknown) {
    oversellingBlocked = true;
    console.log(`✓ Оверселлинг успешно заблокирован: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!oversellingBlocked) {
    throw new Error("ОШИБКА: Оверселлинг не был заблокирован!");
  }

  // 4. Отправка заказа (SHIPPED)
  console.log("4. Создание второго заказа на 2 шт. и перевод в статус SHIPPED...");
  const order2 = await createOrderWithReservation({
    order_number: "AH-TEST-002",
    customer_name: "Второй Покупатель",
    customer_email: "test2@example.com",
    items: [{ variant_id: targetVar.variant_id, quantity: 2, unit_price: 85 }],
  });

  const invBeforeShip = (await fetchInventory()).find((i) => i.variant_id === targetVar.variant_id)!;
  console.log(`Перед отправкой: on_hand=${invBeforeShip.on_hand}, reserved=${invBeforeShip.reserved}, available=${invBeforeShip.available}`);

  await updateOrderStatus(order2.order_id, "SHIPPED", "Отгрузка курьеру");

  const invAfterShip = (await fetchInventory()).find((i) => i.variant_id === targetVar.variant_id)!;
  console.log(
    `После отправки 2 шт. (SHIPPED): on_hand=${invAfterShip.on_hand}, reserved=${invAfterShip.reserved}, available=${invAfterShip.available}`
  );
  if (invAfterShip.on_hand !== 8 || invAfterShip.reserved !== 3) {
    throw new Error(`Ожидалось on_hand=8, reserved=3, получено: ${invAfterShip.on_hand}/${invAfterShip.reserved}`);
  }
  console.log("✓ Списание со склада при SHIPPED выполнено корректно (on_hand и reserved уменьшены на 2)");

  // 5. Отмена заказа 1 (3 шт.)
  console.log("5. Отмена заказа 1 (3 шт.) со статусом CANCELLED...");
  await updateOrderStatus(orderRes.order_id, "CANCELLED", "Отмена по запросу клиента");
  const invAfterCancel = (await fetchInventory()).find((i) => i.variant_id === targetVar.variant_id)!;
  console.log(
    `После отмены заказа (CANCELLED): on_hand=${invAfterCancel.on_hand}, reserved=${invAfterCancel.reserved}, available=${invAfterCancel.available}`
  );
  if (invAfterCancel.on_hand !== 8 || invAfterCancel.reserved !== 0 || invAfterCancel.available !== 8) {
    throw new Error(`Ожидалось 8/0/8, получено: ${invAfterCancel.on_hand}/${invAfterCancel.reserved}/${invAfterCancel.available}`);
  }
  console.log("✓ Освобождение резерва при CANCELLED выполнено корректно (on_hand неизменен, reserved сброшен)");

  // 6. Ручная корректировка остатка ниже резерва
  console.log("6. Проверка блокировки on_hand < reserved при ручной корректировке...");
  await createOrderWithReservation({
    order_number: "AH-TEST-003",
    customer_name: "Клиент Резерва",
    customer_email: "res@example.com",
    items: [{ variant_id: targetVar.variant_id, quantity: 2, unit_price: 85 }],
  });

  let adjustBlocked = false;
  try {
    await adjustInventory(targetVar.variant_id, "MANUAL_ADJUSTMENT", -7, "Попытка списать ниже резерва");
  } catch (err: unknown) {
    adjustBlocked = true;
    console.log(`✓ Списание ниже резерва успешно отклонено: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!adjustBlocked) {
    throw new Error("ОШИБКА: Ручная корректировка ниже резерва не была заблокирована!");
  }

  // 7. Аудит логов
  const movements = await fetchStockMovements();
  console.log(`8. Всего записей в журнале движений склада: ${movements.length}`);
  const hasReserve = movements.some((m) => m.type === "RESERVE");
  const hasShip = movements.some((m) => m.type === "SHIP");
  const hasRelease = movements.some((m) => m.type === "RELEASE_RESERVATION");
  if (!hasReserve || !hasShip || !hasRelease) {
    throw new Error("В аудит-логе отсутствуют необходимые типы движений склада!");
  }
  console.log("✓ В аудит-логе присутствуют все обязательные типы движений: RESERVE, SHIP, RELEASE_RESERVATION");

  // 8. Проверка Google Spreadsheet ID цепочки
  console.log("9. Проверка цепочки приоритетов default Google Spreadsheet ID...");
  const emptyRes = await resolveDefaultSpreadsheet();
  console.log(`✓ Пустое состояние корректно возвращает source='${emptyRes.source}'`);

  process.env.GOOGLE_DEFAULT_SPREADSHEET_ID = "env-default-sheet-id-123";
  const envRes = await resolveDefaultSpreadsheet();
  if (envRes.defaultSpreadsheetId !== "env-default-sheet-id-123" || envRes.source !== "env") {
    throw new Error(`Ожидался ENV spreadsheet, получено: ${envRes.source} / ${envRes.defaultSpreadsheetId}`);
  }
  console.log("✓ GOOGLE_DEFAULT_SPREADSHEET_ID из ENV успешно используется как fallback");

  await setActiveGoogleSpreadsheet("db-primary-sheet-id-456", "Основная таблица склада");
  const dbRes = await resolveDefaultSpreadsheet();
  if (dbRes.defaultSpreadsheetId !== "db-primary-sheet-id-456" || dbRes.source !== "database") {
    throw new Error(`Ожидался DATABASE spreadsheet, получено: ${dbRes.source} / ${dbRes.defaultSpreadsheetId}`);
  }
  console.log("✓ Приоритет google_integrations (БД) над ENV подтверждён");

  // ==============================================================================
  // НОВЫЕ ТЕСТЫ: Collections, Immutable Product Code, EUR Currency & Import Rules
  // ==============================================================================
  console.log("\n=== ТЕСТИРОВАНИЕ СУЩНОСТИ COLLECTIONS И IMMUTABLE PRODUCT CODE ===");

  // 9.1. Создание коллекций и валидация REGULAR / LIMITED
  console.log("9.1. Создание коллекций и проверка валидации типов...");
  const colRegular = await createCollection({
    name: "Core Moments",
    slug: "core-moments",
    type: "REGULAR",
  });
  console.log(`✓ Создана REGULAR коллекция: ${colRegular.name} (${colRegular.id})`);

  const colLimited = await createCollection({
    name: "Summer Drop 2026",
    slug: "summer-drop-2026",
    type: "LIMITED",
  });
  console.log(`✓ Создана LIMITED коллекция: ${colLimited.name} (${colLimited.id})`);

  let invalidColTypeBlocked = false;
  try {
    await createCollection({
      name: "Bad Collection",
      slug: "bad-col",
      type: "INVALID_TYPE" as unknown as "REGULAR",
    });
  } catch (err: unknown) {
    invalidColTypeBlocked = true;
    console.log(`✓ Недопустимый тип коллекции отклонен: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!invalidColTypeBlocked) {
    throw new Error("ОШИБКА: Недопустимый тип коллекции не был отклонен!");
  }

  // 9.2. Создание товара: обязательность product_code и collection_id
  console.log("\n9.2. Проверка обязательности product_code и collection_id при создании товара...");
  let missingCodeBlocked = false;
  try {
    await createProduct({
      product_code: "",
      name: "Product Without Code",
      slug: "no-code",
      collection_id: colRegular.id,
      price: 90,
    });
  } catch {
    missingCodeBlocked = true;
  }
  if (!missingCodeBlocked) {
    throw new Error("ОШИБКА: Создание товара без product_code должно быть заблокировано!");
  }
  console.log("✓ Создание товара без product_code успешно заблокировано");

  let missingColBlocked = false;
  try {
    await createProduct({
      product_code: "MOM-NO-COL",
      name: "Product Without Col",
      slug: "no-col",
      collection_id: null as unknown as string,
      price: 90,
    });
  } catch {
    missingColBlocked = true;
  }
  if (!missingColBlocked) {
    throw new Error("ОШИБКА: Создание товара без collection_id должно быть заблокировано!");
  }
  console.log("✓ Создание товара без collection_id успешно заблокировано");

  // 9.3. Уникальность product_code
  console.log("\n9.3. Проверка уникальности product_code...");
  const validProduct = await createProduct({
    product_code: "MOM-100",
    name: "Unique Product 100",
    slug: "unique-product-100",
    collection_id: colRegular.id,
    price: 85,
  });
  console.log(`✓ Товар успешно создан с кодом: ${validProduct.product_code}`);

  let duplicateCodeBlocked = false;
  try {
    await createProduct({
      product_code: "mom-100", // Case-insensitive дубликат в нижнем регистре!
      name: "Duplicate Code Product Lowercase",
      slug: "dup-prod-100",
      collection_id: colLimited.id,
      price: 85,
    });
  } catch (err: unknown) {
    duplicateCodeBlocked = true;
    console.log(`✓ Case-insensitive дубликат product_code ("mom-100" vs "MOM-100") успешно отклонен: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!duplicateCodeBlocked) {
    throw new Error("ОШИБКА: Case-insensitive дубликат product_code не был отклонен!");
  }

  // 9.4. Неизменяемость product_code (Immutable)
  console.log("\n9.4. Проверка неизменяемости (immutable) product_code...");
  let immutableBlocked = false;
  try {
    await updateProduct(validProduct.id, {
      product_code: "MOM-CHANGED",
    });
  } catch (err: unknown) {
    immutableBlocked = true;
    console.log(`✓ Попытка модификации product_code успешно заблокирована: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!immutableBlocked) {
    throw new Error("ОШИБКА: product_code был изменен в обход immutability!");
  }

  // 9.5. Связь Product -> Collection в fetchProducts и fetchInventory
  console.log("\n9.5. Проверка подтягивания связей Product -> Collection...");
  const allProds = await fetchProducts();
  const fetchedProd = allProds.find((p) => p.id === validProduct.id);
  if (!fetchedProd || !fetchedProd.collection || fetchedProd.collection.slug !== "core-moments") {
    throw new Error(`Связь с коллекцией не найдена: ${JSON.stringify(fetchedProd?.collection)}`);
  }
  console.log(`✓ Связь с коллекцией успешно получена: ${fetchedProd.collection.name} (${fetchedProd.collection.type})`);

  // ==============================================================================
  // 10. Round-Trip Google Sheets с Collection, Product Code и ценой в EUR
  // ==============================================================================
  console.log("\n10. Регрессионный тест Round-Trip Google Sheets (Product Code, Collection, EUR)...");

  // Создаем товар и вариант для round-trip
  const rtProd = await createProduct({
    product_code: "MOM-RT-01",
    name: "Moment Test RT EUR",
    slug: `moment-test-rt-eur-${Date.now()}`,
    collection_id: colLimited.id,
    price: 85,
    active: true,
  });

  const rtVar = await createVariant({
    product_id: rtProd.id,
    sku: "SKU-RT-EUR-01",
    color: "Black",
    size: "M",
    initial_stock: 10,
  });

  // Экспорт
  const exp1 = await exportInventoryToSheet("test-sheet-rt", "Остатки");
  const headerRow = exp1.rows[0];
  const itemRow = exp1.rows.find((r) => r[6] === "SKU-RT-EUR-01"); // SKU находится в колонке 6
  if (!itemRow) {
    throw new Error("Товар SKU-RT-EUR-01 не найден в выгруженном листе Остатки");
  }

  console.log("✓ Заголовки листа экспорта:", headerRow.join(" | "));
  console.log("✓ Данные строки экспорта:", itemRow.join(" | "));

  // Проверяем наличие колонок в экспорте
  const prodCodeIdx = headerRow.indexOf("Product Code");
  const colNameIdx = headerRow.indexOf("Коллекция");
  const colTypeIdx = headerRow.indexOf("Тип коллекции");
  const priceEurIdx = headerRow.indexOf("Цена (€)");
  const onHandIdx = headerRow.indexOf("На складе (On Hand)");

  if (prodCodeIdx === -1 || colNameIdx === -1 || colTypeIdx === -1 || priceEurIdx === -1) {
    throw new Error("Отсутствуют обязательные новые колонки в экспорте Google Sheets!");
  }

  if (
    itemRow[prodCodeIdx] !== "MOM-RT-01" ||
    itemRow[colNameIdx] !== "Summer Drop 2026" ||
    itemRow[colTypeIdx] !== "LIMITED" ||
    itemRow[priceEurIdx] !== 85
  ) {
    throw new Error(`Некорректные значения в экспорте: Code=${itemRow[prodCodeIdx]}, Col=${itemRow[colNameIdx]}, Type=${itemRow[colTypeIdx]}, Price=${itemRow[priceEurIdx]}`);
  }
  console.log("✓ Экспорт сформирован корректно: Product Code=MOM-RT-01, Коллекция=Summer Drop 2026 (LIMITED), Цена (€)=85");

  // Пользователь меняет On Hand: 10 -> 14
  const modifiedRow = [...itemRow];
  modifiedRow[onHandIdx] = 14;

  const previewRT = await previewProductsImport("test-sheet-rt", "Остатки", [headerRow, modifiedRow]);
  if (previewRT.error_count > 0 || previewRT.conflict_count > 0 || !previewRT.can_import) {
    throw new Error(`Ошибка предпросмотра: ${previewRT.header_error || "Ошибки валидации"}`);
  }

  const pItem = previewRT.items.find((i) => i.sku === "SKU-RT-EUR-01")!;
  console.log(`✓ Preview получил: Code=${pItem.product_code}, Col=${pItem.collection_name} (${pItem.collection_type}), Price=${pItem.new_price} EUR, On Hand: ${pItem.current_on_hand} -> ${pItem.new_on_hand}`);

  if (pItem.product_code !== "MOM-RT-01" || pItem.new_price !== 85 || pItem.new_on_hand !== 14) {
    throw new Error(`Искажение данных при парсинге: ${JSON.stringify(pItem)}`);
  }

  // Применяем импорт
  const execRT = await executeProductsImport("test-sheet-rt", "Остатки", previewRT.items);
  if (execRT.updated === 0 || execRT.failed > 0) {
    throw new Error(`Ошибка применения импорта: updated=${execRT.updated}, failed=${execRT.failed}`);
  }

  const invRTAfter = (await fetchInventory()).find((i) => i.variant_id === rtVar.id)!;
  if (invRTAfter.on_hand !== 14 || invRTAfter.variant?.product?.price !== 85) {
    throw new Error(`После импорта в базе некорректный остаток или цена: on_hand=${invRTAfter.on_hand}, price=${invRTAfter.variant?.product?.price}`);
  }
  console.log("✓ После импорта: on_hand=14, price=85 EUR. Данные успешно сохранены в базе.");

  // ==============================================================================
  // 11. Специальные проверки Google Sheets (Supabase Source of Truth & Group-level)
  // ==============================================================================
  console.log("\n11. Проверка специальных правил валидации Google Sheets...");

  // 11.1. Запрет создания неизвестной коллекции silently
  console.log("11.1. Проверка блокировки неизвестной коллекции (silent creation запрещено)...");
  const rowUnknownCol = [...itemRow];
  rowUnknownCol[colNameIdx] = "NonExistent Collection";
  const prevUnknown = await previewProductsImport("test-unknown-col", "Sheet1", [headerRow, rowUnknownCol]);
  const unknownItem = prevUnknown.items[0];
  if (unknownItem.status !== "ERROR" || !unknownItem.reason?.includes("не найдена")) {
    throw new Error(`Неизвестная коллекция не была отклонена со статусом ERROR! status=${unknownItem.status}`);
  }
  console.log(`✓ Неизвестная коллекция успешно отклонена: "${unknownItem.reason}"`);

  // 11.2. Несовпадение типа коллекции с базой (Supabase - Source of Truth)
  console.log("11.2. Проверка несовпадения типа коллекции с данными Supabase...");
  const rowMismatchType = [...itemRow];
  // В базе Summer Drop 2026 имеет тип LIMITED. Попробуем передать REGULAR
  rowMismatchType[colTypeIdx] = "REGULAR";
  const prevMismatchType = await previewProductsImport("test-mismatch-type", "Sheet1", [headerRow, rowMismatchType]);
  const mismatchItem = prevMismatchType.items[0];
  if (mismatchItem.status !== "ERROR" || !mismatchItem.reason?.includes("Несовпадение типа коллекции")) {
    throw new Error(`Несовпадение типа коллекции не вызвало ошибку: status=${mismatchItem.status}, reason=${mismatchItem.reason}`);
  }
  console.log(`✓ Несовпадение типа коллекции успешно заблокировано: "${mismatchItem.reason}"`);

  // 11.3. Group-level validation по product_code (Конфликт параметров вариантов одного товара)
  console.log("11.3. Проверка Group-level валидации по product_code (конфликтующие цены у вариантов одного товара)...");
  const rowVar1 = [
    "MOM-GRP-TEST", "Group Product", "Core Moments", "REGULAR", "Black", "S", "SKU-GRP-01", "10", "0", "10", "85", "Да", ""
  ];
  const rowVar2 = [
    "MOM-GRP-TEST", "Group Product", "Core Moments", "REGULAR", "Black", "M", "SKU-GRP-02", "10", "0", "10", "95", "Да", "" // Цена 95 вместо 85!
  ];

  const prevGroupConflict = await previewProductsImport("test-group-conflict", "Sheet1", [headerRow, rowVar1, rowVar2]);
  if (prevGroupConflict.error_count !== 2) {
    throw new Error(`Ожидалось блокирование всех строк группы при конфликте (error_count=2), получено: ${prevGroupConflict.error_count}`);
  }
  for (const item of prevGroupConflict.items) {
    if (item.status !== "ERROR" || !item.reason?.includes("Конфликт данных внутри Product Code")) {
      throw new Error(`Строка группы не получила правильный статус ERROR: ${JSON.stringify(item)}`);
    }
  }
  console.log("✓ Конфликт цен внутри одного Product Code заблокировал все строки группы (поведение 'last row wins' предотвращено)");

  // 11.4. Проверка создания нового товара и варианта через Google Sheets при согласовании
  console.log("\n11.4. Проверка создания нового товара через валидный Google Sheets импорт...");
  const rowNewProd1 = [
    "MOM-NEW-01", "New Cool Tee", "Core Moments", "REGULAR", "White", "S", "SKU-NEW-WHT-S", "15", "0", "15", "79.50", "Да", ""
  ];
  const rowNewProd2 = [
    "MOM-NEW-01", "New Cool Tee", "Core Moments", "REGULAR", "White", "M", "SKU-NEW-WHT-M", "20", "0", "20", "79.50", "Да", ""
  ];

  const prevNewValid = await previewProductsImport("test-new-prod", "Sheet1", [headerRow, rowNewProd1, rowNewProd2]);
  if (prevNewValid.new_count !== 2 || prevNewValid.error_count > 0 || !prevNewValid.can_import) {
    throw new Error(`Валидные новые варианты не прошли preview: errors=${prevNewValid.error_count}, header_error=${prevNewValid.header_error}`);
  }
  console.log("✓ Preview согласованных вариантов нового товара успешно принят (status=NEW для обеих строк)");

  const execNew = await executeProductsImport("test-new-prod", "Sheet1", prevNewValid.items);
  if (execNew.created !== 2 || execNew.failed > 0) {
    throw new Error(`Ошибка создания новых товаров: created=${execNew.created}, failed=${execNew.failed}`);
  }

  // Проверяем, что товар действительно появился в базе и привязан к коллекции
  const allProdsAfterNew = await fetchProducts();
  const createdNewProd = allProdsAfterNew.find((p) => p.product_code === "MOM-NEW-01");
  if (!createdNewProd || createdNewProd.price !== 79.5 || createdNewProd.collection?.slug !== "core-moments") {
    throw new Error(`Товар MOM-NEW-01 некорректно создан в базе: ${JSON.stringify(createdNewProd)}`);
  }
  console.log(`✓ Товар MOM-NEW-01 успешно создан в базе: цена=${createdNewProd.price} EUR, коллекция=${createdNewProd.collection.name}`);

  // 11.5. Проверка строгого требования Product Code при импорте (без fallback на SKU)
  console.log("\n11.5. Проверка строгого требования Product Code (отсутствие Product Code вызывает ERROR, fallback на SKU запрещен)...");
  const rowMissingCode = [
    "", "Missing Code Product", "Core Moments", "REGULAR", "Black", "S", "AH-M01-BLK-S", "10", "0", "10", "85", "Да", ""
  ];
  const prevMissingCode = await previewProductsImport("test-missing-code", "Sheet1", [headerRow, rowMissingCode]);
  const missingCodeItem = prevMissingCode.items[0];
  if (missingCodeItem.status !== "ERROR" || !missingCodeItem.reason?.includes("Отсутствует обязательный Product Code")) {
    throw new Error(`Строка без Product Code не получила статус ERROR: status=${missingCodeItem.status}, reason=${missingCodeItem.reason}`);
  }
  console.log(`✓ Строка без Product Code корректно заблокирована: "${missingCodeItem.reason}"`);

  // 12. Тестирование updateCollection и фильтрации активных/неактивных коллекций
  console.log("\n12. Тестирование updateCollection и фильтрации активных коллекций...");
  const updatedCol = await updateCollection(colRegular.id, {
    name: "Core Moments Updated",
    type: "LIMITED",
    active: false,
  });
  if (updatedCol.name !== "Core Moments Updated" || updatedCol.type !== "LIMITED" || updatedCol.active !== false) {
    throw new Error(`Ошибка обновления коллекции: ${JSON.stringify(updatedCol)}`);
  }
  console.log(`✓ Коллекция успешно обновлена: name=${updatedCol.name}, type=${updatedCol.type}, active=${updatedCol.active}`);

  const activeOnlyCollections = await fetchCollections({ active: true });
  if (activeOnlyCollections.some((c) => c.id === colRegular.id)) {
    throw new Error("Неактивная коллекция попала в выборку active: true!");
  }
  console.log(`✓ Фильтрация active: true корректно исключила деактивированную коллекцию`);

  const allCollectionsList = await fetchCollections();
  if (!allCollectionsList.some((c) => c.id === colRegular.id)) {
    throw new Error("Деактивированная коллекция пропала из общего списка fetchCollections()!");
  }
  console.log(`✓ Общий список fetchCollections() по-прежнему содержит все коллекции (${allCollectionsList.length})`);

  console.log("\n=== ВСЕ ТЕСТЫ БИЗНЕС-ЛОГИКИ УСПЕШНО ПРОЙДЕНЫ! ===");
}

runTests().catch((err) => {
  console.error("ОШИБКА В ТЕСТАХ:", err);
  process.exit(1);
});
