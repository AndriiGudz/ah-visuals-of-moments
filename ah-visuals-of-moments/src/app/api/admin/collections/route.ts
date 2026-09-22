import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { fetchCollections, createCollection, updateCollection } from "@/lib/supabase/server";
import { CollectionType } from "@/types/admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const activeParam = req.nextUrl.searchParams.get("active");
    const filters =
      activeParam === "true"
        ? { active: true }
        : activeParam === "false"
        ? { active: false }
        : undefined;

    const collections = await fetchCollections(filters);
    return NextResponse.json({ collections });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при получении коллекций" },
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
    const { name, slug, type, active } = body;

    if (!name || !slug || !type) {
      return NextResponse.json(
        { error: "Поля 'Название', 'Slug' и 'Тип коллекции' (REGULAR/LIMITED) обязательны" },
        { status: 400 }
      );
    }

    const normType = String(type).toUpperCase() as CollectionType;
    if (normType !== "REGULAR" && normType !== "LIMITED") {
      return NextResponse.json(
        { error: "Тип коллекции должен быть REGULAR или LIMITED" },
        { status: 400 }
      );
    }

    const collection = await createCollection({
      name,
      slug,
      type: normType,
      active: active ?? true,
    });

    return NextResponse.json({ collection });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при создании коллекции" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, slug, type, active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID коллекции обязателен" }, { status: 400 });
    }

    let normType: CollectionType | undefined = undefined;
    if (type !== undefined) {
      normType = String(type).toUpperCase() as CollectionType;
      if (normType !== "REGULAR" && normType !== "LIMITED") {
        return NextResponse.json(
          { error: "Тип коллекции должен быть REGULAR или LIMITED" },
          { status: 400 }
        );
      }
    }

    const collection = await updateCollection(id, {
      name,
      slug,
      type: normType,
      active,
    });

    return NextResponse.json({ collection });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при обновлении коллекции" },
      { status: 500 }
    );
  }
}
