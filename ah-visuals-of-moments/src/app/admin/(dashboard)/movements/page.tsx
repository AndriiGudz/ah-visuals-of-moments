"use client";

import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  StockMovement,
  StockMovementType,
  MOVEMENT_TYPE_LABELS,
} from "@/types/admin";

const MOVEMENT_TYPE_BADGES: Record<StockMovementType, string> = {
  INITIAL_STOCK: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  RESTOCK: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  RESERVE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  RELEASE_RESERVATION: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  SHIP: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  MANUAL_ADJUSTMENT: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  RETURN: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

export default function AdminMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [orderFilter, setOrderFilter] = useState<string>("");

  const loadMovements = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (orderFilter.trim()) params.set("orderId", orderFilter.trim());

      const res = await fetch(`/api/admin/movements?${params.toString()}`);
      const data = await res.json();
      if (data.movements) setMovements(data.movements);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMovements();
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="История движений склада" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Журнал аудита склада (Stock Movements)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Непрерывная фиксация каждого поступления, резерва, списания и корректировки
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadMovements();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium hover:bg-[var(--bg-surface)] transition-colors"
            title="Обновить журнал"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Обновить</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <span className="font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Тип операции:</span>
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
            >
              <option value="ALL">Все типы операций</option>
              <option value="INITIAL_STOCK">Начальный ввод остатка</option>
              <option value="RESTOCK">Поступление товара</option>
              <option value="RESERVE">Резервирование под заказ</option>
              <option value="RELEASE_RESERVATION">Освобождение резерва</option>
              <option value="SHIP">Списание при отправке</option>
              <option value="MANUAL_ADJUSTMENT">Корректировка остатка</option>
              <option value="RETURN">Возврат товара</option>
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Номер заказа (например: AH-0041)..."
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] font-semibold transition-colors"
            >
              Найти
            </button>
          </form>
        </div>

        {/* Movements Table */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
          {movements.length === 0 && !loading ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)]">
              Записи движений не найдены.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-[var(--text-muted)]">
                    <th className="py-3 px-4 font-semibold">Дата и время</th>
                    <th className="py-3 px-4 font-semibold">Товар и вариант</th>
                    <th className="py-3 px-4 font-semibold font-mono">SKU</th>
                    <th className="py-3 px-4 font-semibold">Тип операции</th>
                    <th className="py-3 px-4 font-semibold text-right">Количество</th>
                    <th className="py-3 px-4 font-semibold text-center">Факт ДО → ПОСЛЕ</th>
                    <th className="py-3 px-4 font-semibold text-center">Резерв ДО → ПОСЛЕ</th>
                    <th className="py-3 px-4 font-semibold">Заказ</th>
                    <th className="py-3 px-4 font-semibold">Примечание</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {movements.map((mov) => {
                    const prodName = mov.variant?.product?.name || "Товар";
                    const isPositive = mov.quantity > 0;

                    return (
                      <tr
                        key={mov.id}
                        className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap">
                          {new Date(mov.created_at).toLocaleString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[var(--text-primary)]">
                            {prodName}
                          </span>
                          <span className="text-[var(--text-secondary)] ml-1.5 font-medium">
                            ({mov.variant?.color} / {mov.variant?.size})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                          {mov.variant?.sku}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              MOVEMENT_TYPE_BADGES[mov.type]
                            }`}
                          >
                            {MOVEMENT_TYPE_LABELS[mov.type]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                          <span
                            className={
                              mov.type === "SHIP"
                                ? "text-indigo-500"
                                : isPositive
                                ? "text-emerald-500"
                                : "text-rose-500"
                            }
                          >
                            {isPositive ? `+${mov.quantity}` : mov.quantity} шт.
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px]">
                          {mov.on_hand_before !== null && mov.on_hand_after !== null ? (
                            <span className="text-sky-500">
                              {mov.on_hand_before} → {mov.on_hand_after}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px]">
                          {mov.reserved_before !== null && mov.reserved_after !== null ? (
                            <span className="text-amber-500">
                              {mov.reserved_before} → {mov.reserved_after}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-[var(--text-primary)] whitespace-nowrap">
                          {mov.order_id || "—"}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)] max-w-xs truncate" title={mov.note || ""}>
                          {mov.note || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
