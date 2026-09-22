import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import {
  isGoogleConfigured,
  getServiceAccountEmail,
  verifySpreadsheetAccess,
} from "@/lib/google/sheets";
import {
  resolveDefaultSpreadsheet,
  setActiveGoogleSpreadsheet,
  fetchActiveGoogleIntegration,
} from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const spreadsheetId = searchParams.get("spreadsheetId");

  const configured = isGoogleConfigured();
  const serviceAccountEmail = getServiceAccountEmail();

  // Определение дефолтного spreadsheet по цепочке приоритетов: google_integrations -> ENV -> none
  const defaultSpreadsheet = await resolveDefaultSpreadsheet();
  const activeIntegration = await fetchActiveGoogleIntegration();

  let spreadsheetCheck = null;
  let isPrimary = false;

  if (spreadsheetId && spreadsheetId.trim()) {
    const cleanId = spreadsheetId.trim();
    spreadsheetCheck = await verifySpreadsheetAccess(cleanId);
    isPrimary = Boolean(activeIntegration?.sheet_id && activeIntegration.sheet_id === cleanId);
  }

  return NextResponse.json({
    configured,
    serviceAccountEmail,
    defaultSpreadsheetId: defaultSpreadsheet.defaultSpreadsheetId,
    defaultSpreadsheetSource: defaultSpreadsheet.source,
    defaultSpreadsheetTitle: defaultSpreadsheet.title || null,
    isPrimary,
    spreadsheetCheck,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { spreadsheetId, sheetTitle } = body;

    if (!spreadsheetId || typeof spreadsheetId !== "string" || !spreadsheetId.trim()) {
      return NextResponse.json({ error: "Spreadsheet ID обязателен" }, { status: 400 });
    }

    const cleanId = spreadsheetId.trim();

    // Проверяем доступность таблицы сервисному аккаунту
    const check = await verifySpreadsheetAccess(cleanId);
    if (!check.accessible) {
      return NextResponse.json(
        { error: check.error || "У сервисного аккаунта нет доступа к этой таблице" },
        { status: 400 }
      );
    }

    const title = sheetTitle || check.title || "Google Sheets Data";
    const integration = await setActiveGoogleSpreadsheet(cleanId, title);

    return NextResponse.json({
      success: true,
      message: `Таблица «${title}» успешно установлена как основная!`,
      integration,
      defaultSpreadsheetId: cleanId,
      defaultSpreadsheetSource: "database",
      defaultSpreadsheetTitle: title,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Ошибка назначения таблицы: ${msg}` }, { status: 500 });
  }
}
