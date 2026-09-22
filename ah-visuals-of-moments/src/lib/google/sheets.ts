import { google, sheets_v4 } from "googleapis";
import {
  fetchInventory,
  fetchOrders,
  fetchStockMovements,
  logGoogleOperation,
  adjustInventory,
  createProduct,
  createVariant,
  updateProduct,
  updateVariant,
  fetchCollections,
  fetchProducts,
} from "@/lib/supabase/server";
import { ImportPreviewItem, ImportPreviewResult, CollectionType } from "@/types/admin";

export function isGoogleConfigured(): boolean {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  return Boolean(
    email &&
    privateKey &&
    !email.includes("your-project-id") &&
    privateKey.includes("BEGIN PRIVATE KEY")
  );
}

export function getServiceAccountEmail(): string {
  return process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "ah-visuals-sheets@project.iam.gserviceaccount.com";
}

function getSheetsClient(): sheets_v4.Sheets | null {
  if (!isGoogleConfigured()) {
    return null;
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY!;

  // Handle both literal "\n" in env strings and raw multiline keys
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

// -----------------------------------------------------------------------------
// Sheet Helper Utilities
// -----------------------------------------------------------------------------

export async function verifySpreadsheetAccess(spreadsheetId: string): Promise<{
  accessible: boolean;
  title?: string;
  sheets?: string[];
  error?: string;
}> {
  const sheets = getSheetsClient();
  if (!sheets) {
    return {
      accessible: false,
      error: "Учетные данные Google Service Account не настроены в переменных окружения.",
    };
  }

  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    const title = res.data.properties?.title || "Без названия";
    const sheetNames = (res.data.sheets || [])
      .map((s) => s.properties?.title)
      .filter(Boolean) as string[];

    return {
      accessible: true,
      title,
      sheets: sheetNames,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      accessible: false,
      error: `Ошибка доступа к таблице: ${message}. Убедитесь, что таблица доступна на email: ${getServiceAccountEmail()}`,
    };
  }
}

async function ensureWorksheetExists(sheets: sheets_v4.Sheets, spreadsheetId: string, sheetTitle: string) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = meta.data.sheets?.some((s) => s.properties?.title === sheetTitle);

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: sheetTitle },
            },
          },
        ],
      },
    });
  }
}

// -----------------------------------------------------------------------------
// Import from Google Sheets (Preview & Execution)
// -----------------------------------------------------------------------------

type TargetField =
  | "product_code"
  | "sku"
  | "product"
  | "collection"
  | "collection_type"
  | "color"
  | "size"
  | "on_hand"
  | "price"
  | "active";

const FIELD_ALIASES: Record<TargetField, string[]> = {
  product_code: [
    "product code",
    "product_code",
    "код товара",
    "код продукта",
    "product id",
    "product_id",
  ],
  sku: [
    "sku",
    "артикул",
    "код варианта",
    "item code",
    "item_code",
  ],
  product: [
    "товар",
    "название",
    "название товара",
    "наименование",
    "продукт",
    "product",
    "product name",
    "product_name",
    "name",
    "title",
  ],
  collection: [
    "коллекция",
    "collection",
    "серия",
  ],
  collection_type: [
    "тип коллекции",
    "collection type",
    "collection_type",
    "тип серии",
    "тип",
  ],
  color: [
    "цвет",
    "color",
    "colour",
  ],
  size: [
    "размер",
    "size",
  ],
  on_hand: [
    "на складе (on hand)",
    "остаток (on hand)",
    "на складе",
    "остаток",
    "физический остаток",
    "факт",
    "на складе факт",
    "on hand",
    "on_hand",
    "stock",
    "qty",
    "quantity",
    "physical stock",
  ],
  price: [
    "цена (€)",
    "цена",
    "цена, €",
    "цена €",
    "цена (€/шт)",
    "price (€)",
    "price",
    "unit price",
    "unit_price",
    "стоимость",
    // Совместимость с тестовыми таблицами $
    "цена ($)",
    "цена ($/шт)",
    "цена, $",
    "цена $",
    "price ($)",
  ],
  active: [
    "активен",
    "активность",
    "статус",
    "active",
    "is_active",
    "enabled",
    "в продаже",
  ],
};

const IGNORED_ALIASES = [
  "зарезервировано",
  "резерв",
  "reserved",
  "доступно к продаже",
  "доступно",
  "available",
  "обновлено",
  "updated",
  "updated_at",
  "дата обновления",
];

function normalizeStr(val: string): string {
  return val.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchHeaderField(rawHeader: string): TargetField | "ignored" | "unknown" {
  const h = normalizeStr(rawHeader);
  if (!h) return "ignored";

  for (const ign of IGNORED_ALIASES) {
    if (h === ign || h.startsWith(ign)) {
      return "ignored";
    }
  }

  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [TargetField, string[]][]) {
    for (const alias of aliases) {
      if (h === alias) {
        return field;
      }
    }
  }

  // Дополнительная проверка без скобок и знаков валют
  const simplified = h.replace(/[\(\)\[\]\{\}\$\€]/g, "").replace(/\s+/g, " ").trim();
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [TargetField, string[]][]) {
    for (const alias of aliases) {
      const aliasSimp = alias.replace(/[\(\)\[\]\{\}\$\€]/g, "").replace(/\s+/g, " ").trim();
      if (simplified === aliasSimp) {
        return field;
      }
    }
  }

  return "unknown";
}

interface HeaderMapResult {
  indices: Partial<Record<TargetField, number>>;
  errors: string[];
}

function resolveHeaders(headerRow: (string | number | null | undefined)[]): HeaderMapResult {
  const indices: Partial<Record<TargetField, number>> = {};
  const duplicates: string[] = [];

  headerRow.forEach((colRaw, colIdx) => {
    const colName = String(colRaw ?? "").trim();
    if (!colName) return;

    const matched = matchHeaderField(colName);
    if (matched !== "ignored" && matched !== "unknown") {
      if (indices[matched] !== undefined) {
        duplicates.push(
          `Поле "${matched}" сопоставлено неоднозначно с несколькими колонками (колонка ${indices[matched]! + 1}: "${headerRow[indices[matched]!]}" и колонка ${colIdx + 1}: "${colName}")`
        );
      } else {
        indices[matched] = colIdx;
      }
    }
  });

  const errors: string[] = [...duplicates];

  // Обязательные поля для идентификации и импорта товара/варианта
  const requiredFields: TargetField[] = [
    "product_code",
    "sku",
    "product",
    "collection",
    "collection_type",
    "color",
    "size",
    "on_hand",
    "price",
  ];
  const missing = requiredFields.filter((f) => indices[f] === undefined);

  if (missing.length > 0) {
    const fieldNamesRu: Record<TargetField, string> = {
      product_code: "Product Code",
      sku: "SKU",
      product: "Товар",
      collection: "Коллекция",
      collection_type: "Тип коллекции",
      color: "Цвет",
      size: "Размер",
      on_hand: "На складе (On Hand)",
      price: "Цена (€)",
      active: "Активен",
    };
    errors.push(
      `Отсутствуют обязательные колонки: ${missing.map((f) => fieldNamesRu[f]).join(", ")}. Позиционное сопоставление отключено.`
    );
  }

  return { indices, errors };
}

function parseOnHand(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  if (s === "") return null;
  const val = parseInt(s, 10);
  if (isNaN(val) || val < 0) return null;
  return val;
}

function parsePrice(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).replace(/[\$\€\₴]/g, "").replace(",", ".").trim();
  if (s === "") return null;
  const val = parseFloat(s);
  if (isNaN(val) || val < 0) return null;
  return Math.round(val * 100) / 100;
}

function parseActive(raw: unknown): boolean {
  if (raw === undefined || raw === null) return true;
  const s = String(raw).trim().toLowerCase();
  if (!s) return true;
  if (["нет", "no", "false", "0", "inactive", "неактивен", "выкл"].includes(s)) return false;
  return true;
}

export async function previewProductsImport(
  spreadsheetId: string,
  sheetName: string = "Products",
  customRows?: (string | number)[][]
): Promise<ImportPreviewResult> {
  let rawRows: (string | number)[][] = [];

  if (customRows) {
    rawRows = customRows;
  } else {
    const sheets = getSheetsClient();
    if (sheets) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A1:Z1000`,
        });
        rawRows = (response.data.values || []) as (string | number)[][];
      } catch (err: unknown) {
        throw new Error(`Не удалось прочитать лист "${sheetName}": ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      // Demo rows matching export format when Google credentials are not set
      rawRows = [
        [
          "Product Code",
          "Товар",
          "Коллекция",
          "Тип коллекции",
          "Цвет",
          "Размер",
          "SKU",
          "На складе (On Hand)",
          "Зарезервировано",
          "Доступно к продаже",
          "Цена (€)",
          "Активен",
          "Обновлено",
        ],
        ["MOM-001", "Moment #01", "Main Collection", "REGULAR", "Black", "S", "AH-M01-BLK-S", "15", "0", "15", "85", "Да", "2026-09-15T12:00:00.000Z"],
        ["MOM-001", "Moment #01", "Main Collection", "REGULAR", "Black", "M", "AH-M01-BLK-M", "2", "3", "0", "85", "Да", "2026-09-15T12:00:00.000Z"], // Conflict: on_hand=2 < reserved=3
        ["MOM-003", "Moment #03", "Limited Drop", "LIMITED", "Black", "L", "AH-M03-BLK-L", "10", "0", "10", "95", "Да", "2026-09-15T12:00:00.000Z"], // New variant
        ["", "INVALID-ROW", "", "", "", "", "INVALID-SKU", "-10", "0", "0", "invalid-price", "Да", ""], // Validation error
      ];
    }
  }

  if (rawRows.length === 0) {
    return {
      source: `${spreadsheetId} / ${sheetName}`,
      total_rows: 0,
      new_count: 0,
      update_count: 0,
      error_count: 0,
      conflict_count: 0,
      items: [],
      can_import: false,
      header_error: "Таблица пуста. Не найдена строка заголовков.",
    };
  }

  // Header-based mapping resolution
  const headerRow = rawRows[0];
  const { indices, errors: headerErrors } = resolveHeaders(headerRow);

  if (headerErrors.length > 0) {
    return {
      source: `${spreadsheetId} / ${sheetName}`,
      total_rows: rawRows.length > 1 ? rawRows.length - 1 : 0,
      new_count: 0,
      update_count: 0,
      error_count: headerErrors.length,
      conflict_count: 0,
      items: [],
      can_import: false,
      header_error: headerErrors.join("; "),
    };
  }

  const dataRows = rawRows.slice(1);
  const currentInventory = await fetchInventory();
  const allCollections = await fetchCollections();
  const seenSkus = new Set<string>();
  const previewItems: ImportPreviewItem[] = [];

  for (const row of dataRows) {
    const productCode = String(row[indices.product_code!] ?? "").trim().toUpperCase();
    const sku = String(row[indices.sku!] ?? "").trim();
    const productName = String(row[indices.product!] ?? "").trim();
    const collectionName = String(row[indices.collection!] ?? "").trim();
    const collectionTypeRaw = String(row[indices.collection_type!] ?? "").trim().toUpperCase();
    const color = String(row[indices.color!] ?? "").trim();
    const size = String(row[indices.size!] ?? "").trim();

    const onHandParsed = parseOnHand(row[indices.on_hand!]);
    const priceParsed = parsePrice(row[indices.price!]);
    const activeParsed = indices.active !== undefined ? parseActive(row[indices.active!]) : true;

    // 1. Strict Product Code validation: product_code is the ONLY product identifier
    if (!productCode) {
      previewItems.push({
        sku: sku || "EMPTY_SKU",
        product_code: "",
        product_name: productName || "Не указано",
        collection_name: collectionName,
        collection_type: (collectionTypeRaw as CollectionType) || undefined,
        color,
        size,
        current_on_hand: 0,
        new_on_hand: onHandParsed ?? 0,
        current_reserved: 0,
        current_available: 0,
        new_available: onHandParsed ?? 0,
        current_price: 0,
        new_price: priceParsed ?? 0,
        price: priceParsed ?? 0,
        current_active: true,
        new_active: activeParsed,
        status: "ERROR",
        reason: "Отсутствует обязательный Product Code. Идентификация товара возможна исключительно по Product Code (восстановление из SKU запрещено).",
      });
      continue;
    }

    // 2. Check remaining empty required identification fields
    if (!sku || !productName || !color || !size || !collectionName || !collectionTypeRaw) {
      previewItems.push({
        sku: sku || "EMPTY_SKU",
        product_code: productCode,
        product_name: productName || "Не указано",
        collection_name: collectionName,
        collection_type: (collectionTypeRaw as CollectionType) || undefined,
        color,
        size,
        current_on_hand: 0,
        new_on_hand: onHandParsed ?? 0,
        current_reserved: 0,
        current_available: 0,
        new_available: onHandParsed ?? 0,
        current_price: 0,
        new_price: priceParsed ?? 0,
        price: priceParsed ?? 0,
        current_active: true,
        new_active: activeParsed,
        status: "ERROR",
        reason: "Обязательные поля (SKU, Товар, Коллекция, Тип коллекции, Цвет, Размер) не могут быть пустыми",
      });
      continue;
    }

    // 2. Check duplicate SKU inside sheet
    if (seenSkus.has(sku)) {
      previewItems.push({
        sku,
        product_code: productCode,
        product_name: productName,
        collection_name: collectionName,
        collection_type: (collectionTypeRaw as CollectionType) || undefined,
        color,
        size,
        current_on_hand: 0,
        new_on_hand: onHandParsed ?? 0,
        current_reserved: 0,
        current_available: 0,
        new_available: onHandParsed ?? 0,
        current_price: 0,
        new_price: priceParsed ?? 0,
        price: priceParsed ?? 0,
        current_active: true,
        new_active: activeParsed,
        status: "ERROR",
        reason: `Дубликат SKU "${sku}" в таблице импорта`,
      });
      continue;
    }
    seenSkus.add(sku);

    if (priceParsed === null) {
      previewItems.push({
        sku,
        product_code: productCode,
        product_name: productName,
        collection_name: collectionName,
        collection_type: (collectionTypeRaw as CollectionType) || undefined,
        color,
        size,
        current_on_hand: 0,
        new_on_hand: onHandParsed ?? 0,
        current_reserved: 0,
        current_available: 0,
        new_available: onHandParsed ?? 0,
        current_price: 0,
        new_price: 0,
        price: 0,
        current_active: true,
        new_active: activeParsed,
        status: "ERROR",
        reason: "Некорректная цена товара (должно быть положительное число в EUR)",
      });
      continue;
    }

    if (onHandParsed === null) {
      previewItems.push({
        sku,
        product_code: productCode,
        product_name: productName,
        collection_name: collectionName,
        collection_type: (collectionTypeRaw as CollectionType) || undefined,
        color,
        size,
        current_on_hand: 0,
        new_on_hand: 0,
        current_reserved: 0,
        current_available: 0,
        new_available: 0,
        current_price: 0,
        new_price: priceParsed,
        price: priceParsed,
        current_active: true,
        new_active: activeParsed,
        status: "ERROR",
        reason: "Физический остаток не может быть отрицательным или пустым",
      });
      continue;
    }

    // 3. Validate Collection against Supabase (Source of Truth)
    const foundCol = allCollections.find(
      (c) =>
        c.name.toLowerCase() === collectionName.toLowerCase() ||
        c.slug.toLowerCase() === collectionName.toLowerCase()
    );

    if (!foundCol) {
      previewItems.push({
        sku,
        product_code: productCode,
        product_name: productName,
        collection_name: collectionName,
        collection_type: (collectionTypeRaw as CollectionType) || undefined,
        color,
        size,
        current_on_hand: 0,
        new_on_hand: onHandParsed,
        current_reserved: 0,
        current_available: 0,
        new_available: onHandParsed,
        current_price: 0,
        new_price: priceParsed,
        price: priceParsed,
        current_active: true,
        new_active: activeParsed,
        status: "ERROR",
        reason: `Коллекция "${collectionName}" не найдена в системе. Создание неизвестных коллекций silently запрещено.`,
      });
      continue;
    }

    if (collectionTypeRaw !== "REGULAR" && collectionTypeRaw !== "LIMITED") {
      previewItems.push({
        sku,
        product_code: productCode,
        product_name: productName,
        collection_name: collectionName,
        collection_type: undefined,
        color,
        size,
        current_on_hand: 0,
        new_on_hand: onHandParsed,
        current_reserved: 0,
        current_available: 0,
        new_available: onHandParsed,
        current_price: 0,
        new_price: priceParsed,
        price: priceParsed,
        current_active: true,
        new_active: activeParsed,
        status: "ERROR",
        reason: `Недопустимый тип коллекции "${collectionTypeRaw}". Разрешены только REGULAR или LIMITED.`,
      });
      continue;
    }

    if (foundCol.type !== collectionTypeRaw) {
      previewItems.push({
        sku,
        product_code: productCode,
        product_name: productName,
        collection_name: foundCol.name,
        collection_type: collectionTypeRaw as CollectionType,
        color,
        size,
        current_on_hand: 0,
        new_on_hand: onHandParsed,
        current_reserved: 0,
        current_available: 0,
        new_available: onHandParsed,
        current_price: 0,
        new_price: priceParsed,
        price: priceParsed,
        current_active: true,
        new_active: activeParsed,
        status: "ERROR",
        reason: `Несовпадение типа коллекции: в базе данных коллекция "${foundCol.name}" имеет тип ${foundCol.type}, а в таблице указано ${collectionTypeRaw}. Импорт не может менять тип коллекции.`,
      });
      continue;
    }

    // 4. Match with Supabase inventory database
    const existingInv = currentInventory.find((i) => i.variant?.sku === sku);

    // If variant exists in database, verify it belongs to the same product_code
    if (
      existingInv &&
      existingInv.variant?.product?.product_code &&
      existingInv.variant.product.product_code.toUpperCase() !== productCode
    ) {
      previewItems.push({
        sku,
        product_code: productCode,
        product_name: productName,
        collection_name: foundCol.name,
        collection_type: foundCol.type,
        color,
        size,
        current_on_hand: existingInv.on_hand,
        new_on_hand: onHandParsed,
        current_reserved: existingInv.reserved,
        current_available: existingInv.available,
        new_available: onHandParsed - existingInv.reserved,
        current_price: existingInv.variant.product.price,
        new_price: priceParsed,
        price: priceParsed,
        current_active: existingInv.variant.active,
        new_active: activeParsed,
        status: "ERROR",
        reason: `Несовпадение товара: вариант со SKU "${sku}" уже привязан к товару с кодом "${existingInv.variant.product.product_code}", а в таблице указан "${productCode}".`,
      });
      continue;
    }

    if (!existingInv) {
      previewItems.push({
        sku,
        product_code: productCode,
        product_name: productName,
        collection_name: foundCol.name,
        collection_type: foundCol.type,
        color,
        size,
        current_on_hand: 0,
        new_on_hand: onHandParsed,
        current_reserved: 0,
        current_available: 0,
        new_available: onHandParsed,
        current_price: 0,
        new_price: priceParsed,
        price: priceParsed,
        current_active: true,
        new_active: activeParsed,
        status: "NEW",
      });
    } else {
      const currentOnHand = existingInv.on_hand;
      const currentReserved = existingInv.reserved; // From Supabase, NEVER from sheets
      const currentAvailable = existingInv.available;
      const currentPrice = existingInv.variant?.product?.price ?? 0;
      const currentActive = existingInv.variant?.active ?? true;
      const newAvailable = onHandParsed - currentReserved;

      // CRITICAL RULE: Physical on_hand cannot be set lower than active reservation
      if (onHandParsed < currentReserved) {
        previewItems.push({
          sku,
          product_code: productCode,
          product_name: productName,
          collection_name: foundCol.name,
          collection_type: foundCol.type,
          color,
          size,
          current_on_hand: currentOnHand,
          new_on_hand: onHandParsed,
          current_reserved: currentReserved,
          current_available: currentAvailable,
          new_available: newAvailable,
          current_price: currentPrice,
          new_price: priceParsed,
          price: priceParsed,
          current_active: currentActive,
          new_active: activeParsed,
          status: "CONFLICT",
          reason: `Импортируемый остаток (${onHandParsed}) меньше активного резерва (${currentReserved}). Импорт заблокирован для предотвращения оверселлинга.`,
        });
      } else {
        previewItems.push({
          sku,
          product_code: productCode,
          product_name: productName,
          collection_name: foundCol.name,
          collection_type: foundCol.type,
          color,
          size,
          current_on_hand: currentOnHand,
          new_on_hand: onHandParsed,
          current_reserved: currentReserved,
          current_available: currentAvailable,
          new_available: newAvailable,
          current_price: currentPrice,
          new_price: priceParsed,
          price: priceParsed,
          current_active: currentActive,
          new_active: activeParsed,
          status: "UPDATE",
        });
      }
    }
  }

  // 5. Group-level validation by product_code
  // All variant rows sharing the same product_code MUST agree on product_name, collection, collection_type, and price
  const codeGroups = new Map<string, ImportPreviewItem[]>();
  for (const item of previewItems) {
    if (item.product_code && item.product_code !== "EMPTY_CODE") {
      const list = codeGroups.get(item.product_code) || [];
      list.push(item);
      codeGroups.set(item.product_code, list);
    }
  }

  for (const [code, items] of codeGroups.entries()) {
    if (items.length <= 1) continue;

    const names = new Set(items.map((i) => i.product_name.trim().toLowerCase()));
    const collections = new Set(items.map((i) => (i.collection_name || "").trim().toLowerCase()));
    const types = new Set(items.map((i) => i.collection_type));
    const prices = new Set(items.map((i) => i.new_price));

    const mismatches: string[] = [];
    if (names.size > 1) mismatches.push("название товара");
    if (collections.size > 1) mismatches.push("коллекция");
    if (types.size > 1) mismatches.push("тип коллекции");
    if (prices.size > 1) mismatches.push("цена");

    if (mismatches.length > 0) {
      const reasonMsg = `Конфликт данных внутри Product Code "${code}": между строками вариантов обнаружены несовпадающие значения (${mismatches.join(", ")}). Поведение "last row wins" запрещено.`;
      for (const item of items) {
        item.status = "ERROR";
        item.reason = reasonMsg;
      }
    }
  }

  const newCount = previewItems.filter((i) => i.status === "NEW").length;
  const updateCount = previewItems.filter((i) => i.status === "UPDATE").length;
  const errorCount = previewItems.filter((i) => i.status === "ERROR").length;
  const conflictCount = previewItems.filter((i) => i.status === "CONFLICT").length;

  return {
    source: `${spreadsheetId} / ${sheetName}`,
    total_rows: dataRows.length,
    new_count: newCount,
    update_count: updateCount,
    error_count: errorCount,
    conflict_count: conflictCount,
    items: previewItems,
    can_import: previewItems.some((i) => i.status === "NEW" || i.status === "UPDATE"),
  };
}

export async function executeProductsImport(
  spreadsheetId: string,
  sheetName: string,
  items: ImportPreviewItem[],
  user: string = "Admin"
): Promise<{
  processed: number;
  created: number;
  updated: number;
  failed: number;
}> {
  let created = 0;
  let updated = 0;
  let failed = 0;

  const currentInventory = await fetchInventory();
  const allProducts = await fetchProducts();
  const allCollections = await fetchCollections();

  for (const item of items) {
    if (item.status === "ERROR" || item.status === "CONFLICT") {
      failed++;
      continue;
    }

    try {
      // 1. Identify product strictly by product_code (case-insensitive)
      const cleanCode = (item.product_code || "").trim().toUpperCase();
      if (!cleanCode) {
        failed++;
        continue;
      }

      let product = allProducts.find(
        (p) => p.product_code.trim().toUpperCase() === cleanCode
      );

      const targetPrice = item.new_price ?? item.price;

      if (!product) {
        // Find collection to bind
        const col = allCollections.find(
          (c) =>
            c.name.toLowerCase() === (item.collection_name || "").toLowerCase() ||
            c.slug.toLowerCase() === (item.collection_name || "").toLowerCase()
        );

        if (!col) {
          failed++;
          continue;
        }

        const slug = item.product_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        product = await createProduct({
          product_code: item.product_code,
          name: item.product_name,
          slug: `${slug || "product"}-${Date.now().toString().slice(-4)}`,
          collection_id: col.id,
          price: targetPrice,
          active: item.new_active !== undefined ? item.new_active : true,
        });
        allProducts.push(product);
      } else {
        // Product exists: update price if changed
        if (product.price !== targetPrice) {
          product = await updateProduct(product.id, { price: targetPrice });
        }
      }

      // 2. Identify variant by SKU
      const existingInv = currentInventory.find((i) => i.variant?.sku === item.sku);

      if (!existingInv) {
        // Create new variant
        await createVariant({
          product_id: product.id,
          sku: item.sku,
          color: item.color,
          size: item.size,
          initial_stock: item.new_on_hand,
        });
        created++;
      } else {
        // Variant exists: update physical on_hand via atomic delta
        // CRITICAL: Reserved is NEVER touched here!
        const delta = item.new_on_hand - existingInv.on_hand;
        if (delta !== 0) {
          await adjustInventory(
            existingInv.variant_id,
            delta > 0 ? "RESTOCK" : "MANUAL_ADJUSTMENT",
            delta,
            `Импорт из Google Sheets (${sheetName})`,
            user
          );
        }

        // Update variant active status if changed
        if (
          item.new_active !== undefined &&
          existingInv.variant_id &&
          existingInv.variant?.active !== item.new_active
        ) {
          await updateVariant(existingInv.variant_id, { active: item.new_active });
        }

        updated++;
      }
    } catch {
      failed++;
    }
  }

  // Record audit log
  await logGoogleOperation({
    operation_type: "IMPORT",
    resource_type: "PRODUCTS",
    status: failed === 0 ? "SUCCESS" : failed < items.length ? "PARTIAL" : "ERROR",
    source_destination: `${spreadsheetId} [${sheetName}]`,
    items_processed: items.length,
    items_created: created,
    items_updated: updated,
    items_failed: failed,
    details: { totalRows: items.length },
    performed_by: user,
  });

  return {
    processed: items.length,
    created,
    updated,
    failed,
  };
}

// -----------------------------------------------------------------------------
// Export to Google Sheets (Worksheets creation and atomic data writing)
// -----------------------------------------------------------------------------

export async function exportInventoryToSheet(
  spreadsheetId: string,
  tabTitle: string = "Остатки"
): Promise<{ success: boolean; rowsExported: number; rows: (string | number)[][] }> {
  const inventory = await fetchInventory();
  const sheets = getSheetsClient();

  const rows: (string | number)[][] = [
    [
      "Product Code",
      "Товар",
      "Коллекция",
      "Тип коллекции",
      "Цвет",
      "Размер",
      "SKU",
      "На складе (On Hand)",
      "Зарезервировано",
      "Доступно к продаже",
      "Цена (€)",
      "Активен",
      "Обновлено",
    ],
  ];

  for (const item of inventory) {
    const onHand = typeof item.on_hand === "number" && !isNaN(item.on_hand) ? item.on_hand : Number(item.on_hand) || 0;
    const reserved = typeof item.reserved === "number" && !isNaN(item.reserved) ? item.reserved : Number(item.reserved) || 0;
    const rawAvailable = item.available ?? ((item.on_hand ?? 0) - (item.reserved ?? 0));
    const available = typeof rawAvailable === "number" && !isNaN(rawAvailable) ? rawAvailable : Number(rawAvailable) || 0;

    rows.push([
      item.variant?.product?.product_code || "",
      item.variant?.product?.name || "",
      item.variant?.product?.collection?.name || "Без коллекции",
      item.variant?.product?.collection?.type || "",
      item.variant?.color || "",
      item.variant?.size || "",
      item.variant?.sku || "",
      onHand,
      reserved,
      available,
      item.variant?.product?.price ?? 0,
      item.variant?.active ? "Да" : "Нет",
      item.updated_at,
    ]);
  }

  if (sheets && !spreadsheetId.startsWith("test-")) {
    await ensureWorksheetExists(sheets, spreadsheetId, tabTitle);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabTitle}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });
  }

  await logGoogleOperation({
    operation_type: "EXPORT",
    resource_type: "INVENTORY",
    status: "SUCCESS",
    source_destination: `${spreadsheetId} [${tabTitle}]`,
    items_processed: rows.length - 1,
    items_created: 0,
    items_updated: rows.length - 1,
    items_failed: 0,
    performed_by: "Admin",
  });

  return { success: true, rowsExported: rows.length - 1, rows };
}

export async function exportOrdersToSheet(
  spreadsheetId: string,
  tabTitle: string = "Заказы"
): Promise<{ success: boolean; rowsExported: number }> {
  const orders = await fetchOrders();
  const sheets = getSheetsClient();

  const rows: (string | number)[][] = [
    [
      "Номер заказа",
      "Дата создания",
      "Клиент",
      "Email",
      "Телефон",
      "Адрес доставки",
      "Товар",
      "SKU",
      "Цвет",
      "Размер",
      "Кол-во",
      "Цена за ед.",
      "Сумма заказа",
      "Статус",
      "Дата отправки",
      "Примечания",
    ],
  ];

  for (const order of orders) {
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        rows.push([
          order.order_number,
          order.created_at,
          order.customer_name,
          order.customer_email,
          order.customer_phone || "",
          order.shipping_address || "",
          item.variant?.product?.name || "",
          item.variant?.sku || "",
          item.variant?.color || "",
          item.variant?.size || "",
          item.quantity,
          item.unit_price,
          order.total_amount,
          order.status,
          order.shipped_at || "",
          order.notes || "",
        ]);
      }
    } else {
      rows.push([
        order.order_number,
        order.created_at,
        order.customer_name,
        order.customer_email,
        order.customer_phone || "",
        order.shipping_address || "",
        "",
        "",
        "",
        "",
        0,
        0,
        order.total_amount,
        order.status,
        order.shipped_at || "",
        order.notes || "",
      ]);
    }
  }

  if (sheets && !spreadsheetId.startsWith("test-")) {
    await ensureWorksheetExists(sheets, spreadsheetId, tabTitle);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabTitle}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });
  }

  await logGoogleOperation({
    operation_type: "EXPORT",
    resource_type: "ORDERS",
    status: "SUCCESS",
    source_destination: `${spreadsheetId} [${tabTitle}]`,
    items_processed: rows.length - 1,
    items_created: 0,
    items_updated: rows.length - 1,
    items_failed: 0,
    performed_by: "Admin",
  });

  return { success: true, rowsExported: rows.length - 1 };
}

export async function exportMovementsToSheet(
  spreadsheetId: string,
  tabTitle: string = "Движения склада"
): Promise<{ success: boolean; rowsExported: number }> {
  const movements = await fetchStockMovements();
  const sheets = getSheetsClient();

  const rows: (string | number)[][] = [
    [
      "Дата / Время",
      "Товар",
      "SKU",
      "Цвет",
      "Размер",
      "Тип операции",
      "Количество",
      "На складе ДО",
      "На складе ПОСЛЕ",
      "Резерв ДО",
      "Резерв ПОСЛЕ",
      "Номер заказа",
      "Автор",
      "Примечание",
    ],
  ];

  for (const mov of movements) {
    rows.push([
      mov.created_at,
      mov.variant?.product?.name || "",
      mov.variant?.sku || "",
      mov.variant?.color || "",
      mov.variant?.size || "",
      mov.type,
      mov.quantity,
      mov.on_hand_before ?? "",
      mov.on_hand_after ?? "",
      mov.reserved_before ?? "",
      mov.reserved_after ?? "",
      mov.order_id || "",
      mov.created_by || "",
      mov.note || "",
    ]);
  }

  if (sheets) {
    await ensureWorksheetExists(sheets, spreadsheetId, tabTitle);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabTitle}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });
  }

  await logGoogleOperation({
    operation_type: "EXPORT",
    resource_type: "STOCK_MOVEMENTS",
    status: "SUCCESS",
    source_destination: `${spreadsheetId} [${tabTitle}]`,
    items_processed: rows.length - 1,
    items_created: 0,
    items_updated: rows.length - 1,
    items_failed: 0,
    performed_by: "Admin",
  });

  return { success: true, rowsExported: rows.length - 1 };
}

export async function exportMonthlyReportToSheet(
  spreadsheetId: string,
  periodName: string = "Отчет за период"
): Promise<{ success: boolean; rowsExported: number }> {
  const inventory = await fetchInventory();
  const movements = await fetchStockMovements();
  const sheets = getSheetsClient();

  const rows: (string | number)[][] = [
    [
      "SKU",
      "Товар",
      "Цвет",
      "Размер",
      "Текущий остаток On Hand",
      "Зарезервировано",
      "Доступно к продаже",
      "Всего поступлений (RESTOCK)",
      "Всего списано (SHIP)",
      "Корректировок",
    ],
  ];

  for (const item of inventory) {
    const varMovements = movements.filter((m) => m.variant_id === item.variant_id);
    const restocked = varMovements
      .filter((m) => m.type === "RESTOCK" || m.type === "INITIAL_STOCK")
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const shipped = varMovements
      .filter((m) => m.type === "SHIP")
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const adjustments = varMovements
      .filter((m) => m.type === "MANUAL_ADJUSTMENT")
      .reduce((sum, m) => sum + m.quantity, 0);

    const onHand = typeof item.on_hand === "number" && !isNaN(item.on_hand) ? item.on_hand : Number(item.on_hand) || 0;
    const reserved = typeof item.reserved === "number" && !isNaN(item.reserved) ? item.reserved : Number(item.reserved) || 0;
    const rawAvailable = item.available ?? ((item.on_hand ?? 0) - (item.reserved ?? 0));
    const available = typeof rawAvailable === "number" && !isNaN(rawAvailable) ? rawAvailable : Number(rawAvailable) || 0;

    rows.push([
      item.variant?.sku || "",
      item.variant?.product?.name || "",
      item.variant?.color || "",
      item.variant?.size || "",
      onHand,
      reserved,
      available,
      restocked,
      shipped,
      adjustments,
    ]);
  }

  if (sheets && !spreadsheetId.startsWith("test-")) {
    await ensureWorksheetExists(sheets, spreadsheetId, periodName);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${periodName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });
  }

  await logGoogleOperation({
    operation_type: "EXPORT",
    resource_type: "MONTHLY_REPORT",
    status: "SUCCESS",
    source_destination: `${spreadsheetId} [${periodName}]`,
    items_processed: rows.length - 1,
    items_created: 0,
    items_updated: rows.length - 1,
    items_failed: 0,
    performed_by: "Admin",
  });

  return { success: true, rowsExported: rows.length - 1 };
}
