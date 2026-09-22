import { RAW_MOMENTS, getMomentByQrId, getMomentBySlug, getPublishedMoments, getIndexableMoments } from "../src/data/moments";

console.log("=================================================================");
console.log("=== PHASE 1 SEO & QR ARCHITECTURE UNIT & LOGIC TESTS ===");
console.log("=================================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`✓ ${message}`);
    passedTests++;
  } else {
    console.error(`✗ FAILED: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Strict QR Identifier Contract Test
console.log("--- 1. Тестирование строгого контракта QR Identifier (AH001) ---");
const moment1ByQr = getMomentByQrId("AH001");
assert(!!moment1ByQr && moment1ByQr.slug === "moment-001", "getMomentByQrId('AH001') возвращает Moment 001");

const moment2ByQr = getMomentByQrId("AH002");
assert(!!moment2ByQr && moment2ByQr.slug === "moment-002", "getMomentByQrId('AH002') возвращает Moment 002");

const moment3ByQr = getMomentByQrId("AH003");
assert(!!moment3ByQr && moment3ByQr.slug === "moment-003", "getMomentByQrId('AH003') возвращает Moment 003");

const unknownQr = getMomentByQrId("UNKNOWN");
assert(unknownQr === undefined, "getMomentByQrId('UNKNOWN') возвращает undefined (неизвестный QR)");

const slugAsQr = getMomentByQrId("moment-001");
assert(slugAsQr === undefined, "getMomentByQrId('moment-001') возвращает undefined: slug не является валидным QR ID");

const productCodeAsQr = getMomentByQrId("MOM-001");
assert(productCodeAsQr === undefined, "getMomentByQrId('MOM-001') возвращает undefined: productCode не является валидным QR ID");

// 2. Double Branding Cleanliness Test
console.log("\n--- 2. Проверка устранения Double Branding в seoTitle ---");
for (const raw of RAW_MOMENTS) {
  for (const [loc, tr] of Object.entries(raw.translations)) {
    const hasBrandSuffix = tr.seoTitle?.includes("AH Visuals") || tr.seoTitle?.includes("|");
    assert(!hasBrandSuffix, `${raw.id} [${loc}] seoTitle ("${tr.seoTitle}") очищен от суффикса бренда`);
  }
}

// 3. Separation of Lifecycle and Indexability Test
console.log("\n--- 3. Тестирование разделения жизненного цикла и индексируемости ---");
const initialIndexable = getIndexableMoments();
const initialPublished = getPublishedMoments();
assert(initialIndexable.length === 3, "Изначально ровно 3 индексируемых момента в sitemap");
assert(initialPublished.length === 3, "Изначально ровно 3 момента на витрине");

// Тест: симуляция archived момента
console.log("\n--- 4. Тестирование поведения archived момента ---");
const targetMoment = RAW_MOMENTS.find((m) => m.id === "AH001")!;
const originalStatus = targetMoment.status;
const originalIndexable = targetMoment.isIndexable;
const originalSlug = targetMoment.slug;

try {
  // Переводим момент в статус archived
  targetMoment.status = "archived";
  targetMoment.isIndexable = false;

  const archivedBySlug = getMomentBySlug(originalSlug);
  assert(!!archivedBySlug, "Archived story доступна по прямому slug (archived ≠ deleted)");

  const archivedByQr = getMomentByQrId("AH001");
  assert(!!archivedByQr && archivedByQr.id === "AH001", "Archived story доступна по QR ID (/q/AH001)");

  const publishedWithArchived = getPublishedMoments();
  assert(
    !publishedWithArchived.some((m) => m.id === "AH001"),
    "Archived story ИСКЛЮЧЕНА из каталога витрины (getPublishedMoments)"
  );

  const indexableWithArchived = getIndexableMoments();
  assert(
    !indexableWithArchived.some((m) => m.id === "AH001"),
    "Archived story ИСКЛЮЧЕНА из sitemap (getIndexableMoments)"
  );
} finally {
  // Восстанавливаем статус
  targetMoment.status = originalStatus;
  targetMoment.isIndexable = originalIndexable;
}

// Тест: симуляция public-noindex момента
console.log("\n--- 5. Тестирование поведения public-noindex момента ---");
try {
  targetMoment.status = "published";
  targetMoment.isIndexable = false;

  const noindexBySlug = getMomentBySlug(originalSlug);
  assert(!!noindexBySlug, "Noindex story доступна по прямому slug");

  const noindexByQr = getMomentByQrId("AH001");
  assert(!!noindexByQr, "Noindex story доступна по QR ID");

  const publishedWithNoindex = getPublishedMoments();
  assert(
    publishedWithNoindex.some((m) => m.id === "AH001"),
    "Noindex story ВКЛЮЧЕНА в каталог витрины (getPublishedMoments)"
  );

  const indexableWithNoindex = getIndexableMoments();
  assert(
    !indexableWithNoindex.some((m) => m.id === "AH001"),
    "Noindex story ИСКЛЮЧЕНА из sitemap (isIndexable: false)"
  );
} finally {
  targetMoment.status = originalStatus;
  targetMoment.isIndexable = originalIndexable;
}

// Тест: независимость QR от смены slug
console.log("\n--- 6. Тестирование независимости QR от смены human-readable slug ---");
try {
  targetMoment.slug = "new-migrated-slug-kyiv-evening";

  const resolvedByQrAfterSlugChange = getMomentByQrId("AH001");
  assert(
    !!resolvedByQrAfterSlugChange && resolvedByQrAfterSlugChange.slug === "new-migrated-slug-kyiv-evening",
    "QR ID 'AH001' успешно находит момент после изменения слага и указывает на новый слаг"
  );
} finally {
  targetMoment.slug = originalSlug;
}

console.log(`\n=================================================================`);
console.log(`=== ИТОГ: ${passedTests} из ${totalTests} тестов успешно пройдено! ===`);
console.log(`=================================================================\n`);
