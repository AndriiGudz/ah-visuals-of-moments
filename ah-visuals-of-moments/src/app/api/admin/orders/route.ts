import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { fetchOrders, createOrderWithReservation } from "@/lib/supabase/server";
import { OrderStatus } from "@/types/admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as OrderStatus | null;

    const orders = await fetchOrders(status ? { status } : undefined);
    return NextResponse.json({ orders });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при получении заказов" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { customer_name, customer_email, customer_phone, shipping_address, notes, items } = body;

    if (!customer_name || !customer_email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Заполните имя клиента, email и добавьте хотя бы один товар" },
        { status: 400 }
      );
    }

    const result = await createOrderWithReservation({
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      notes,
      items,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при создании заказа" },
      { status: 400 }
    );
  }
}
