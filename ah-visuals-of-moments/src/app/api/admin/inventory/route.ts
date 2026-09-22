import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { fetchInventory, adjustInventory } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const inventory = await fetchInventory();
    return NextResponse.json({ inventory });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при получении остатков" },
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
    const { variant_id, type, delta, note } = body;

    if (!variant_id || !type || delta === undefined || !note) {
      return NextResponse.json(
        { error: "Поля 'variant_id', 'type', 'delta' и 'note' обязательны" },
        { status: 400 }
      );
    }

    if (delta === 0) {
      return NextResponse.json(
        { error: "Величина изменения не может быть равна нулю" },
        { status: 400 }
      );
    }

    const result = await adjustInventory(variant_id, type, Number(delta), note, "Admin");
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при корректировке остатка" },
      { status: 400 }
    );
  }
}
