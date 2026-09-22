import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { fetchStockMovements } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get("variantId") || undefined;
    const type = searchParams.get("type") || undefined;
    const orderId = searchParams.get("orderId") || undefined;

    const movements = await fetchStockMovements({ variantId, type, orderId });
    return NextResponse.json({ movements });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при получении движений склада" },
      { status: 500 }
    );
  }
}
