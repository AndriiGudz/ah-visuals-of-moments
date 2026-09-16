import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { executeProductsImport } from "@/lib/google/sheets";
import { ImportPreviewItem } from "@/types/admin";

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { spreadsheet_id, sheet_name, items } = body;

    if (!spreadsheet_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Не переданы данные для импорта" },
        { status: 400 }
      );
    }

    const result = await executeProductsImport(
      spreadsheet_id,
      sheet_name || "Products",
      items as ImportPreviewItem[],
      "Admin"
    );

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при выполнении импорта" },
      { status: 400 }
    );
  }
}
