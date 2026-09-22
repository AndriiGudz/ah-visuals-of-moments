import { NextRequest, NextResponse } from "next/server";
import {
  getAuthoritativeVariant,
  createOrderWithReservation,
} from "@/lib/supabase/server";
import { sendTelegramOrderNotification } from "@/lib/notifications/telegram";

// Best-effort in-memory sliding window rate limiter
const ipRequestHistory = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestHistory.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestHistory.set(ip, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  ipRequestHistory.set(ip, validTimestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting (best-effort)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Слишком много запросов. Пожалуйста, подождите минуту." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Некорректный формат запроса" },
        { status: 400 }
      );
    }

    // 2. Anti-spam Honeypot protection
    if (body.hp_field && String(body.hp_field).trim() !== "") {
      // Bot detected: silent reject
      return NextResponse.json(
        { error: "Некорректный запрос" },
        { status: 400 }
      );
    }

    // 3. Schema & Length Validations
    const variantTarget = String(body.variant_id || body.sku || "").trim();
    const customerName = String(body.customer_name || "").trim();
    const customerEmail = body.customer_email ? String(body.customer_email).trim() : "";
    const customerPhone = body.customer_phone ? String(body.customer_phone).trim() : "";
    const shippingAddress = body.shipping_address ? String(body.shipping_address).trim() : "";
    const notes = body.notes ? String(body.notes).trim() : "";
    const idempotencyKey = body.idempotency_key ? String(body.idempotency_key).trim() : "";

    if (!variantTarget) {
      return NextResponse.json(
        { error: "Не указан вариант товара" },
        { status: 400 }
      );
    }

    if (!customerName || customerName.length < 2 || customerName.length > 100) {
      return NextResponse.json(
        { error: "Укажите имя (от 2 до 100 символов)" },
        { status: 400 }
      );
    }

    if (!customerEmail && !customerPhone) {
      return NextResponse.json(
        { error: "Необходимо указать хотя бы один контакт: Email или Телефон" },
        { status: 400 }
      );
    }

    if (customerEmail) {
      if (customerEmail.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        return NextResponse.json(
          { error: "Некорректный формат Email" },
          { status: 400 }
        );
      }
    }

    if (customerPhone) {
      if (customerPhone.length > 50 || !/^[+0-9\s()\-]{6,50}$/.test(customerPhone)) {
        return NextResponse.json(
          { error: "Некорректный формат номера телефона" },
          { status: 400 }
        );
      }
    }

    if (shippingAddress.length > 300) {
      return NextResponse.json(
        { error: "Адрес доставки не должен превышать 300 символов" },
        { status: 400 }
      );
    }

    if (notes.length > 500) {
      return NextResponse.json(
        { error: "Примечание к заказу не должно превышать 500 символов" },
        { status: 400 }
      );
    }

    // 4. Authoritative Variant & Product verification (Server-side Source of Truth)
    const targetInfo = await getAuthoritativeVariant(variantTarget);
    if (!targetInfo) {
      return NextResponse.json(
        { error: "Выбранный вариант товара не найден" },
        { status: 404 }
      );
    }

    const { variant, product, inventory } = targetInfo;

    if (!product.active) {
      return NextResponse.json(
        { code: "PRODUCT_INACTIVE", error: "Данный товар временно недоступен для заказа" },
        { status: 400 }
      );
    }

    if (!variant.active) {
      return NextResponse.json(
        { code: "VARIANT_INACTIVE", error: "Данный цвет или размер временно недоступен для заказа" },
        { status: 400 }
      );
    }

    const availableStock = inventory?.available ?? 0;
    if (availableStock < 1) {
      return NextResponse.json(
        {
          code: "OUT_OF_STOCK",
          error: "Этот вариант только что закончился. Выберите другой размер или цвет.",
        },
        { status: 409 }
      );
    }

    // 5. Atomic Reservation via authoritative RPC / server helper
    // Stage B: quantity is hardcoded to 1, unit_price taken directly from product.price in DB
    const result = await createOrderWithReservation({
      customer_name: customerName,
      customer_email: customerEmail || "no-email@provided.local",
      customer_phone: customerPhone || undefined,
      shipping_address: shippingAddress || undefined,
      notes: notes || undefined,
      idempotency_key: idempotencyKey || undefined,
      items: [
        {
          variant_id: variant.id,
          quantity: 1,
          unit_price: product.price, // Will be re-verified inside DB transaction
        },
      ],
    });

    // Privacy-compliant logging
    console.log(`[Orders] Заказ ${result.order_number} (${result.order_id}) зафиксирован (idempotent: ${!!result.idempotent})`);

    // 6. Asynchronous Telegram Notification (Secondary side-effect, never fails order)
    if (!result.idempotent) {
      sendTelegramOrderNotification({
        orderNumber: result.order_number,
        productName: product.name,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        quantity: 1,
        price: result.total_amount ?? product.price,
        customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        shippingAddress: shippingAddress || null,
        notes: notes || null,
      }).catch((err) => {
        console.error("[Telegram] Ошибка при фоновой отправке уведомления:", err);
      });
    }

    return NextResponse.json({
      success: true,
      order_id: result.order_id,
      order_number: result.order_number,
      total_amount: result.total_amount ?? product.price,
      idempotent: !!result.idempotent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Conflict / Overselling detection from PostgreSQL or mock
    if (message.includes("Недостаточно доступного остатка") || message.includes("available")) {
      return NextResponse.json(
        {
          code: "OUT_OF_STOCK",
          error: "Этот вариант только что закончился. Выберите другой размер или цвет.",
        },
        { status: 409 }
      );
    }

    if (message.includes("не доступен для заказа") || message.includes("деактивирован")) {
      return NextResponse.json(
        {
          code: "INACTIVE",
          error: "Данный товар или вариант недоступен для заказа",
        },
        { status: 400 }
      );
    }

    console.error("[Orders] Ошибка обработки заказа:", message);
    return NextResponse.json(
      { error: "Произошла ошибка при создании заказа. Пожалуйста, попробуйте позже." },
      { status: 500 }
    );
  }
}
