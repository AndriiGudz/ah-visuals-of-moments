import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { fetchGoogleLogs } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const logs = await fetchGoogleLogs();
    return NextResponse.json({ logs });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при получении журнала операций" },
      { status: 500 }
    );
  }
}
