"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Package,
  Boxes,
  ShoppingCart,
  History,
  FileSpreadsheet,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { Product, InventoryRecord, Order, StockMovement, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, MOVEMENT_TYPE_LABELS } from "@/types/admin";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const loadData = async () => {
    try {
      const [pRes, iRes, oRes, mRes] = await Promise.all([
        fetch("/api/admin/products").then((r) => r.json()),
        fetch("/api/admin/inventory").then((r) => r.json()),
        fetch("/api/admin/orders").then((r) => r.json()),
        fetch("/api/admin/movements").then((r) => r.json()),
      ]);

      if (pRes.products) setProducts(pRes.products);
      if (iRes.inventory) setInventory(iRes.inventory);
      if (oRes.orders) setOrders(oRes.orders);
      if (mRes.movements) setMovements(mRes.movements);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregated metrics
  const totalProducts = products.length;
  const activeVariants = inventory.filter((i) => i.variant?.active).length;
  const totalOnHand = inventory.reduce((sum, i) => sum + i.on_hand, 0);
  const totalReserved = inventory.reduce((sum, i) => sum + i.reserved, 0);
  const totalAvailable = inventory.reduce((sum, i) => sum + (i.on_hand - i.reserved), 0);
  const newOrdersCount = orders.filter((o) => o.status === "NEW").length;

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Обзор системы" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-8">
        {/* Top bar with refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Сводная аналитика
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Единый источник истины: Supabase PostgreSQL • Контролируемый Google Sheets Layer
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Обновить данные</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col">
            <span className="text-xs text-[var(--text-secondary)] font-medium">Товаров</span>
            <span className="text-2xl font-bold mt-2 text-[var(--text-primary)]">{totalProducts}</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-1">В каталоге</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col">
            <span className="text-xs text-[var(--text-secondary)] font-medium">Вариантов</span>
            <span className="text-2xl font-bold mt-2 text-[var(--text-primary)]">{activeVariants}</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-1">Цвет / размер</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col">
            <span className="text-xs text-[var(--text-secondary)] font-medium">На складе (Факт)</span>
            <span className="text-2xl font-bold mt-2 text-sky-500">{totalOnHand}</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-1">on_hand</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col">
            <span className="text-xs text-[var(--text-secondary)] font-medium">Зарезервировано</span>
            <span className="text-2xl font-bold mt-2 text-amber-500">{totalReserved}</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-1">Под активные заказы</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col">
            <span className="text-xs text-[var(--text-secondary)] font-medium">Доступно к продаже</span>
            <span className="text-2xl font-bold mt-2 text-emerald-500">{totalAvailable}</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-1">Факт - Резерв</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col">
            <span className="text-xs text-[var(--text-secondary)] font-medium">Новых заказов</span>
            <span className="text-2xl font-bold mt-2 text-[var(--accent-warm)]">{newOrdersCount}</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-1">Требуют обработки</span>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-warm)] transition-colors group flex items-start justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--accent-warm)]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Товары и варианты</h3>
                <p className="text-xs text-[var(--text-secondary)]">Управление коллекциями</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-warm)] transition-colors" />
          </Link>

          <Link
            href="/admin/inventory"
            className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-warm)] transition-colors group flex items-start justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] text-emerald-500">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Остатки на складе</h3>
                <p className="text-xs text-[var(--text-secondary)]">Факт, резерв, корректировки</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors" />
          </Link>

          <Link
            href="/admin/orders"
            className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-warm)] transition-colors group flex items-start justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] text-sky-500">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Заказы клиентов</h3>
                <p className="text-xs text-[var(--text-secondary)]">Статусы и списания</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-sky-500 transition-colors" />
          </Link>

          <Link
            href="/admin/google-sheets"
            className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-warm)] transition-colors group flex items-start justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] text-amber-500">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Google Sheets</h3>
                <p className="text-xs text-[var(--text-secondary)]">Импорт с Preview и экспорт</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-amber-500 transition-colors" />
          </Link>
        </div>

        {/* Dual Column: Recent Orders & Stock Movements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[var(--accent-warm)]" />
                <span>Последние заказы</span>
              </h3>
              <Link
                href="/admin/orders"
                className="text-xs text-[var(--accent-warm)] hover:underline font-medium"
              >
                Все заказы →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                Заказов пока нет
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        <span>{order.order_number}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            ORDER_STATUS_COLORS[order.status]
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <div className="text-[var(--text-secondary)] mt-0.5">
                        {order.customer_name} • {order.items?.length || 0} поз.
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--text-primary)]">€{order.total_amount}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {new Date(order.created_at).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Movements */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-500" />
                <span>Последние движения склада</span>
              </h3>
              <Link
                href="/admin/movements"
                className="text-xs text-[var(--accent-warm)] hover:underline font-medium"
              >
                Вся история →
              </Link>
            </div>

            {movements.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                История движений пуста
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {movements.slice(0, 5).map((mov) => (
                  <div key={mov.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">
                        {mov.variant?.product?.name || "Товар"} ({mov.variant?.color} / {mov.variant?.size})
                      </div>
                      <div className="text-[var(--text-secondary)] text-[11px] mt-0.5 flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-500">
                          {MOVEMENT_TYPE_LABELS[mov.type]}
                        </span>
                        {mov.order_id && <span>• Заказ: {mov.order_id}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--text-primary)]">
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} шт.
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {new Date(mov.created_at).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
