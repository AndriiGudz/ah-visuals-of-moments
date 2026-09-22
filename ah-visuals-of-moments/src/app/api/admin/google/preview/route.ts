import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { previewProductsImport } from "@/lib/google/sheets";

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { spreadsheet_id, sheet_name } = body;

    if (!spreadsheet_id) {
      return NextResponse.json(
        { error: "Не указан ID таблицы Google Sheets (spreadsheetId)" },
        { status: 400 }
      );
    }

    const preview = await previewProductsImport(spreadsheet_id, sheet_name || "Products");
    return NextResponse.json({ preview });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при формировании предпросмотра" },
      { status: 400 }
    );
  }
}
