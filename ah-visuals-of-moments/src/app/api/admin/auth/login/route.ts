import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, verifyAdminPassword } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Неверный пароль администратора" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    await createSessionCookie(response);
    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Внутренняя ошибка сервера";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
