import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { updateOrderStatus } from "@/lib/supabase/server";
import { OrderStatus } from "@/types/admin";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, note } = body;

    if (!status) {
      return NextResponse.json({ error: "Не указан статус" }, { status: 400 });
    }

    const result = await updateOrderStatus(id, status as OrderStatus, note, "Admin");
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при смене статуса заказа" },
      { status: 400 }
    );
  }
}
