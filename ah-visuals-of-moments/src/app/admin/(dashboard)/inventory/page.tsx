"use client";

import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  PlusCircle,
  MinusCircle,
  RefreshCw,
  AlertCircle,
  X,
  Info,
} from "lucide-react";
import { InventoryRecord, StockMovementType } from "@/types/admin";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Adjustment Modal
  const [selectedItem, setSelectedItem] = useState<InventoryRecord | null>(null);
  const [adjType, setAdjType] = useState<StockMovementType>("RESTOCK");
  const [adjDelta, setAdjDelta] = useState<string>("10");
  const [adjNote, setAdjNote] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.inventory) setInventory(data.inventory);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const openAdjustmentModal = (item: InventoryRecord, defaultType: StockMovementType) => {
    setSelectedItem(item);
    setAdjType(defaultType);
    setAdjDelta(defaultType === "RESTOCK" ? "10" : "-1");
    setAdjNote(defaultType === "RESTOCK" ? "Поступление новой партии" : "Инвентаризация / списание");
    setError(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setError(null);
    setSaving(true);

    const delta = parseInt(adjDelta, 10);
    if (isNaN(delta) || delta === 0) {
      setError("Укажите корректную величину изменения (не 0)");
      setSaving(false);
      return;
    }

    // Client pre-check for on_hand < reserved
    const projectedOnHand = selectedItem.on_hand + delta;
    if (projectedOnHand < selectedItem.reserved) {
      setError(
        `Физический остаток (${projectedOnHand}) не может быть меньше активного резерва (${selectedItem.reserved}). Корректировка заблокирована.`
      );
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: selectedItem.variant_id,
          type: adjType,
          delta,
          note: adjNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения остатка");

      setSelectedItem(null);
      loadInventory();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  // Filter inventory
  const filtered = inventory.filter((item) => {
    const q = search.toLowerCase();
    const prodName = item.variant?.product?.name?.toLowerCase() || "";
    const sku = item.variant?.sku?.toLowerCase() || "";
    const color = item.variant?.color?.toLowerCase() || "";
    const size = item.variant?.size?.toLowerCase() || "";
    return prodName.includes(q) || sku.includes(q) || color.includes(q) || size.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Управление остатками" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Складской учёт (Inventory)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Модель остатков: Факт (on_hand) • Резерв (reserved) • Доступно (available = on_hand - reserved)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Поиск по SKU, названию, цвету..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3.5 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] w-64"
            />

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadInventory();
              }}
              disabled={loading}
              className="p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium hover:bg-[var(--bg-surface)] transition-colors"
              title="Обновить"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Warning / Architecture Callout */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs">
          <Info className="w-5 h-5 text-[var(--accent-warm)] shrink-0 mt-0.5" />
          <div className="text-[var(--text-secondary)] space-y-1">
            <p className="font-semibold text-[var(--text-primary)]">
              Правило безопасности остатков:
            </p>
            <p>
              Поле <strong className="text-amber-500">Зарезервировано (reserved)</strong> управляется исключительно системой заказов и не может редактироваться напрямую. Любое ручное изменение физического остатка фиксируется в журнале движений склада и блокируется, если новый остаток меньше активного резерва.
            </p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
          {filtered.length === 0 && !loading ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)]">
              Остатки не найдены.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-[var(--text-muted)]">
                    <th className="py-3 px-4 font-semibold">Товар</th>
                    <th className="py-3 px-4 font-semibold">Вариант</th>
                    <th className="py-3 px-4 font-semibold font-mono">SKU</th>
                    <th className="py-3 px-4 font-semibold text-right text-sky-500">Факт на складе</th>
                    <th className="py-3 px-4 font-semibold text-right text-amber-500">Зарезервировано</th>
                    <th className="py-3 px-4 font-semibold text-right text-emerald-500">Доступно к продаже</th>
                    <th className="py-3 px-4 font-semibold text-center">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filtered.map((item) => {
                    const prodName = item.variant?.product?.name || "Товар";
                    const isZeroAvailable = item.available <= 0;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-[var(--text-primary)]">
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.variant?.product?.product_code && (
                              <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent-warm)]">
                                {item.variant.product.product_code}
                              </span>
                            )}
                            <span className="font-bold">{prodName}</span>
                            {item.variant?.product?.collection && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                                  item.variant.product.collection.type === "LIMITED"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}
                              >
                                {item.variant.product.collection.name} • {item.variant.product.collection.type}
                              </span>
                            )}
                          </div>
                          {item.variant?.product?.price !== undefined && (
                            <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">
                              Цена: €{item.variant.product.price}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          <span className="inline-block px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] font-medium">
                            {item.variant?.color} / {item.variant?.size}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                          {item.variant?.sku}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-sky-500 text-sm">
                          {item.on_hand}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-amber-500 text-sm">
                          {item.reserved}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-sm">
                          <span
                            className={
                              isZeroAvailable
                                ? "text-rose-500"
                                : "text-emerald-500"
                            }
                          >
                            {item.available}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openAdjustmentModal(item, "RESTOCK")}
                              className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Поступление товара"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Поступление</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openAdjustmentModal(item, "MANUAL_ADJUSTMENT")}
                              className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Ручная корректировка"
                            >
                              <MinusCircle className="w-3.5 h-3.5" />
                              <span>Корректировка</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Manual Stock Adjustment */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Изменение остатка
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {selectedItem.variant?.product?.name} ({selectedItem.variant?.color} / {selectedItem.variant?.size})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current state badge */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[var(--bg-elevated)] text-center text-xs">
                <div>
                  <div className="text-[10px] text-[var(--text-muted)]">Факт (on_hand)</div>
                  <div className="font-bold text-sky-500 text-sm">{selectedItem.on_hand}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)]">Резерв</div>
                  <div className="font-bold text-amber-500 text-sm">{selectedItem.reserved}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)]">Доступно</div>
                  <div className="font-bold text-emerald-500 text-sm">{selectedItem.available}</div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Тип операции
                  </label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as StockMovementType)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                  >
                    <option value="RESTOCK">Поступление новой партии (RESTOCK)</option>
                    <option value="MANUAL_ADJUSTMENT">Корректировка / Списание (MANUAL_ADJUSTMENT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Величина изменения (дельта) *
                  </label>
                  <input
                    type="number"
                    required
                    value={adjDelta}
                    onChange={(e) => setAdjDelta(e.target.value)}
                    placeholder="+20 или -5"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] font-bold text-sm"
                  />
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 flex justify-between">
                    <span>Новый физический остаток:</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {selectedItem.on_hand + (parseInt(adjDelta, 10) || 0)} шт.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Причина / Комментарий к операции *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Например: Поступление партии №42 от поставщика"
                    value={adjNote}
                    onChange={(e) => setAdjNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Запись будет навсегда сохранена в журнале движений склада с автором Admin.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold shadow hover:opacity-90 transition-opacity"
                  >
                    {saving ? "Сохранение..." : "Сохранить остаток"}
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
