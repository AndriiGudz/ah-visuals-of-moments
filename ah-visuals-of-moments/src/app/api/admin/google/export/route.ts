import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import {
  exportInventoryToSheet,
  exportOrdersToSheet,
  exportMovementsToSheet,
  exportMonthlyReportToSheet,
} from "@/lib/google/sheets";

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { spreadsheet_id, resource_type, tab_title } = body;

    if (!spreadsheet_id || !resource_type) {
      return NextResponse.json(
        { error: "Поля 'spreadsheet_id' и 'resource_type' обязательны" },
        { status: 400 }
      );
    }

    let result: { success: boolean; rowsExported: number };

    switch (resource_type) {
      case "INVENTORY":
        result = await exportInventoryToSheet(spreadsheet_id, tab_title || "Остатки");
        break;
      case "ORDERS":
        result = await exportOrdersToSheet(spreadsheet_id, tab_title || "Заказы");
        break;
      case "STOCK_MOVEMENTS":
        result = await exportMovementsToSheet(spreadsheet_id, tab_title || "Движения склада");
        break;
      case "MONTHLY_REPORT":
        result = await exportMonthlyReportToSheet(spreadsheet_id, tab_title || "Отчет за период");
        break;
      default:
        return NextResponse.json(
          { error: `Неизвестный тип экспорта: ${resource_type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при экспорте" },
      { status: 500 }
    );
  }
}
