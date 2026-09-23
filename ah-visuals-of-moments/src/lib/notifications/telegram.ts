// ==============================================================================
// AH Visuals of Moments: Telegram Notification Service (Stage B)
// Server-only notification channel for site owner / admin
// ==============================================================================

export interface TelegramOrderNotificationPayload {
  orderNumber: string;
  productName: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  notes?: string | null;
}

export async function sendTelegramOrderNotification(
  payload: TelegramOrderNotificationPayload
): Promise<{ sent: boolean; reason?: string; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const rawChatId = process.env.TELEGRAM_CHAT_ID;

  const chatIds = (rawChatId || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!botToken || chatIds.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Telegram] Уведомление пропущено: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены в ENV");
    }
    return { sent: false, reason: "NOT_CONFIGURED" };
  }

  const lines: string[] = [
    `🔔 *Новый заказ ${escapeMarkdown(payload.orderNumber)}*`,
    ``,
    `*Товар:* ${escapeMarkdown(payload.productName)}`,
    `*SKU:* \`${escapeMarkdown(payload.sku)}\``,
    `*Вариант:* ${escapeMarkdown(payload.color)} / ${escapeMarkdown(payload.size)}`,
    `*Количество:* ${payload.quantity} шт\\.`,
    `*Цена:* €${payload.price}`,
    ``,
    `*Клиент:* ${escapeMarkdown(payload.customerName)}`,
  ];

  if (payload.customerEmail) {
    lines.push(`*Email:* ${escapeMarkdown(payload.customerEmail)}`);
  }
  if (payload.customerPhone) {
    lines.push(`*Телефон:* ${escapeMarkdown(payload.customerPhone)}`);
  }
  if (payload.shippingAddress) {
    lines.push(`*Адрес:* ${escapeMarkdown(payload.shippingAddress)}`);
  }
  if (payload.notes) {
    lines.push(`*Комментарий:* ${escapeMarkdown(payload.notes)}`);
  }

  const text = lines.join("\n");

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const sendPromises = chatIds.map(async (chatId) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "MarkdownV2",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`[Chat ${chatId}] HTTP ${response.status}: ${errorText}`);
      }
    });

    const results = await Promise.allSettled(sendPromises);

    const errors: string[] = [];
    let successCount = 0;

    for (const result of results) {
      if (result.status === "fulfilled") {
        successCount++;
      } else {
        const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
        errors.push(msg);
        console.error(`[Telegram] Ошибка отправки уведомления: ${msg}`);
      }
    }

    if (successCount === 0) {
      return { sent: false, error: errors.join(" | ") };
    }

    return {
      sent: true,
      error: errors.length > 0 ? errors.join(" | ") : undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Telegram] Сетевой сбой при отправке уведомления:", msg);
    return { sent: false, error: msg };
  }
}

/**
 * Escapes characters reserved in Telegram MarkdownV2
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}
