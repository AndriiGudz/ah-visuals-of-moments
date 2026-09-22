"use client";

import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Package,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Product, Collection } from "@/types/admin";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Product form
  const [prodCode, setProdCode] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodCollectionId, setProdCollectionId] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("85");
  const [prodActive, setProdActive] = useState(true);

  // Variant form
  const [varColor, setVarColor] = useState("");
  const [varSize, setVarSize] = useState("M");
  const [varSku, setVarSku] = useState("");
  const [varInitStock, setVarInitStock] = useState("10");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const res = await fetch("/api/admin/collections?active=true");
      const data = await res.json();
      if (data.collections) {
        setCollections(data.collections);
        if (data.collections.length > 0 && !prodCollectionId) {
          setProdCollectionId(data.collections[0].id);
        }
      }
    } catch {
      // Handle error
    }
  };

  useEffect(() => {
    loadProducts();
    loadCollections();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_code: prodCode.trim().toUpperCase(),
          name: prodName,
          slug: prodSlug,
          collection_id: prodCollectionId,
          description: prodDesc,
          price: parseFloat(prodPrice),
          active: prodActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения");

      setIsProductModalOpen(false);
      setProdCode("");
      setProdName("");
      setProdSlug("");
      setProdDesc("");
      loadProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_variant",
          product_id: selectedProductId,
          sku: varSku,
          color: varColor,
          size: varSize,
          initial_stock: parseInt(varInitStock, 10) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка создания варианта");

      setIsVariantModalOpen(false);
      setVarSku("");
      setVarColor("");
      loadProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, active: !currentStatus }),
      });
      loadProducts();
    } catch {
      // Ignored
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Управление товарами" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Каталог товаров и варианты
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Создание товаров, управление цветами, размерами, SKU и ценами
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadProducts();
              }}
              disabled={loading}
              className="p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium hover:bg-[var(--bg-surface)] transition-colors"
              title="Обновить"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold text-xs shadow-md hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Создать товар</span>
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
          {products.length === 0 && !loading ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)]">
              Товары ещё не созданы. Нажмите «Создать товар» выше.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {products.map((p) => {
                const isExpanded = expandedId === p.id;
                const variantsCount = p.variants?.length || 0;

                return (
                  <div key={p.id} className="transition-colors">
                    <div className="p-4 sm:px-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--accent-warm)] shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent-warm)]">
                              {p.product_code}
                            </span>
                            <span className="font-bold text-sm text-[var(--text-primary)] truncate">
                              {p.name}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] font-mono">
                              /{p.slug}
                            </span>
                            {p.collection ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  p.collection.type === "LIMITED"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}
                              >
                                {p.collection.name} • {p.collection.type}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)] italic">
                                Без коллекции
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                p.active
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                              }`}
                            >
                              {p.active ? "В продаже" : "Скрыт"}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                            {p.description || "Без описания"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-bold text-[var(--text-primary)]">
                            €{p.price}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            Вариантов: {variantsCount}
                          </div>
                        </div>

                        {/* Toggle active button */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p.id, p.active)}
                          className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                            p.active
                              ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                              : "border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/10"
                          }`}
                        >
                          {p.active ? "Отключить" : "Включить"}
                        </button>

                        {/* Expand / Collapse Variants */}
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : p.id)}
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                          title="Показать варианты"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Variants Panel */}
                    {isExpanded && (
                      <div className="bg-[var(--bg-elevated)]/50 p-4 sm:px-8 border-t border-[var(--border-subtle)] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                            Варианты товара ({variantsCount})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setError(null);
                              setIsVariantModalOpen(true);
                            }}
                            className="text-xs font-semibold text-[var(--accent-warm)] hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Добавить вариант</span>
                          </button>
                        </div>

                        {variantsCount === 0 ? (
                          <div className="text-xs text-[var(--text-muted)] py-2">
                            У этого товара ещё нет вариантов (цветов и размеров).
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                                  <th className="py-2 pr-4">SKU</th>
                                  <th className="py-2 px-4">Цвет</th>
                                  <th className="py-2 px-4">Размер</th>
                                  <th className="py-2 px-4">На складе</th>
                                  <th className="py-2 px-4">Резерв</th>
                                  <th className="py-2 pl-4">Доступно</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border-subtle)]">
                                {p.variants?.map((v) => (
                                  <tr key={v.id} className="text-[var(--text-secondary)]">
                                    <td className="py-2 pr-4 font-mono font-medium text-[var(--text-primary)]">
                                      {v.sku}
                                    </td>
                                    <td className="py-2 px-4">{v.color}</td>
                                    <td className="py-2 px-4 font-semibold">{v.size}</td>
                                    <td className="py-2 px-4 text-sky-500 font-semibold">
                                      {v.inventory?.on_hand ?? 0}
                                    </td>
                                    <td className="py-2 px-4 text-amber-500 font-semibold">
                                      {v.inventory?.reserved ?? 0}
                                    </td>
                                    <td className="py-2 pl-4 text-emerald-500 font-bold">
                                      {v.inventory?.available ?? 0}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal: Create Product */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Создать новый товар</h3>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Product Code * (Immutable)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MOM-003 или LTD-001"
                      value={prodCode}
                      onChange={(e) => setProdCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] font-mono uppercase font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Коллекция *
                    </label>
                    <select
                      required
                      value={prodCollectionId}
                      onChange={(e) => setProdCollectionId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                    >
                      <option value="" disabled>
                        {collections.length === 0 ? "Сначала создайте коллекцию" : "Выберите коллекцию"}
                      </option>
                      {collections.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name} ({col.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Название товара *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Moment #03 - Kyiv Evening"
                    value={prodName}
                    onChange={(e) => {
                      setProdName(e.target.value);
                      if (!prodSlug) {
                        setProdSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                        );
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Slug (URL) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="moment-003"
                      value={prodSlug}
                      onChange={(e) => setProdSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Базовая цена (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Описание
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Описание лимитированной футболки..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="prodActiveCheckbox"
                    checked={prodActive}
                    onChange={(e) => setProdActive(e.target.checked)}
                    className="rounded border-[var(--border-subtle)]"
                  />
                  <label htmlFor="prodActiveCheckbox" className="text-[var(--text-primary)] font-medium">
                    Сразу включить продажу товара
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold shadow hover:opacity-90 transition-opacity"
                  >
                    {saving ? "Сохранение..." : "Создать товар"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Variant */}
        {isVariantModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Добавить вариант</h3>
                <button
                  type="button"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateVariant} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Уникальный артикул (SKU) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="AH-M03-BLK-M"
                    value={varSku}
                    onChange={(e) => setVarSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Цвет *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Black, White, Beige..."
                      value={varColor}
                      onChange={(e) => setVarColor(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Размер *
                    </label>
                    <select
                      value={varSize}
                      onChange={(e) => setVarSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Начальный остаток на складе (on_hand)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={varInitStock}
                    onChange={(e) => setVarInitStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Будет зафиксировано движение склада INITIAL_STOCK
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setIsVariantModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold shadow hover:opacity-90 transition-opacity"
                  >
                    {saving ? "Добавление..." : "Добавить вариант"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
