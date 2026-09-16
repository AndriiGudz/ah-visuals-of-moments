import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  createVariant,
} from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const products = await fetchProducts();
    return NextResponse.json({ products });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при получении товаров" },
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

    // If request contains variant creation
    if (body.action === "create_variant") {
      const variant = await createVariant({
        product_id: body.product_id,
        sku: body.sku,
        color: body.color,
        size: body.size,
        initial_stock: body.initial_stock || 0,
      });
      return NextResponse.json({ variant });
    }

    // Default: create product
    const { product_code, name, slug, collection_id, description, price, active } = body;

    if (!product_code || !String(product_code).trim()) {
      return NextResponse.json(
        { error: "Поле 'Product Code' обязательно" },
        { status: 400 }
      );
    }

    if (!collection_id || !String(collection_id).trim()) {
      return NextResponse.json(
        { error: "Поле 'Коллекция' обязательно для создания нового товара" },
        { status: 400 }
      );
    }

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Поля 'Название' и 'Slug' обязательны" },
        { status: 400 }
      );
    }

    const product = await createProduct({
      product_code: String(product_code).trim(),
      name,
      slug,
      collection_id,
      description,
      price: Number(price) || 0,
      active: active ?? true,
    });

    return NextResponse.json({ product });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при сохранении" },
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Не указан ID товара" }, { status: 400 });
    }

    if (updates.product_code !== undefined) {
      return NextResponse.json(
        { error: "Поле product_code является неизменяемым (immutable) и не может быть обновлено" },
        { status: 400 }
      );
    }

    const updated = await updateProduct(id, updates);
    return NextResponse.json({ product: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка при обновлении" },
      { status: 500 }
    );
  }
}
