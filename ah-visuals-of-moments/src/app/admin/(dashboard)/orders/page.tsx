"use client";

import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Plus,
  RefreshCw,
  Truck,
  Check,
  AlertCircle,
  X,
  User,
  MapPin,
} from "lucide-react";
import {
  Order,
  OrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  InventoryRecord,
} from "@/types/admin";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected order details drawer/modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status change action modal
  const [statusAction, setStatusAction] = useState<{
    order: Order;
    targetStatus: OrderStatus;
    title: string;
    warning: string;
  } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Order modal
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [newCustName, setNewCustName] = useState("Max Mustermann");
  const [newCustEmail, setNewCustEmail] = useState("max.mustermann@example.com");
  const [newCustPhone, setNewCustPhone] = useState("+49 170 1234567");
  const [newCustAddress, setNewCustAddress] = useState("Friedrichstraße 42, 10117 Berlin");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [newOrderError, setNewOrderError] = useState<string | null>(null);
  const [newOrderLoading, setNewOrderLoading] = useState(false);

  const loadOrders = async () => {
    try {
      const url =
        statusFilter === "ALL"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.inventory) {
        setInventory(data.inventory);
        if (data.inventory.length > 0 && !selectedVariantId) {
          setSelectedVariantId(data.inventory[0].variant_id);
        }
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    loadOrders();
    loadInventory();
  }, [statusFilter]);

  const handleOpenStatusAction = (order: Order, targetStatus: OrderStatus) => {
    const title = `Сменить статус на "${ORDER_STATUS_LABELS[targetStatus]}"`;
    let warning = "";

    if (targetStatus === "SHIPPED") {
      const totalQty = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
      warning = `Внимание: перевод в статус "Отправлен" физически спишет ${totalQty} шт. со склада (on_hand -= ${totalQty}, reserved -= ${totalQty}). Это действие необратимо без создания возврата.`;
    } else if (targetStatus === "CANCELLED") {
      const reservedQty =
        order.items?.filter((i) => i.reserved).reduce((sum, i) => sum + i.quantity, 0) || 0;
      warning = `Отменить заказ ${order.order_number}? ${reservedQty} зарезервированных единиц товара будут освобождены и возвращены в доступный остаток склада.`;
    }

    setStatusAction({ order, targetStatus, title, warning });
    setActionNote("");
    setActionError(null);
  };

  const handleConfirmStatusAction = async () => {
    if (!statusAction) return;

    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/orders/${statusAction.order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusAction.targetStatus,
          note: actionNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка смены статуса");

      setStatusAction(null);
      if (selectedOrder && selectedOrder.id === statusAction.order.id) {
        setSelectedOrder({ ...selectedOrder, status: statusAction.targetStatus });
      }
      loadOrders();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewOrderError(null);
    setNewOrderLoading(true);

    const qty = parseInt(selectedQuantity, 10);
    if (!selectedVariantId || isNaN(qty) || qty <= 0) {
      setNewOrderError("Выберите товар и укажите корректное количество");
      setNewOrderLoading(false);
      return;
    }

    const invItem = inventory.find((i) => i.variant_id === selectedVariantId);
    const unitPrice = invItem?.variant?.product?.price || 85.0;

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: newCustName,
          customer_email: newCustEmail,
          customer_phone: newCustPhone,
          shipping_address: newCustAddress,
          notes: "Тестовый заказ через панель управления",
          items: [
            {
              variant_id: selectedVariantId,
              quantity: qty,
              unit_price: unitPrice,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка создания заказа");

      setIsNewOrderModalOpen(false);
      loadOrders();
      loadInventory();
    } catch (err: unknown) {
      setNewOrderError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setNewOrderLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Управление заказами" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Заказы клиентов
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Атомарное резервирование при создании • Контролируемое списание при отправке
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadOrders();
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
                setNewOrderError(null);
                setIsNewOrderModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold text-xs shadow-md hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Создать заказ</span>
            </button>
          </div>
        </div>

        {/* Status Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { key: "ALL", label: "Все заказы" },
            { key: "NEW", label: "Новые" },
            { key: "CONFIRMED", label: "Подтверждённые" },
            { key: "PROCESSING", label: "В обработке" },
            { key: "SHIPPED", label: "Отправленные" },
            { key: "COMPLETED", label: "Завершённые" },
            { key: "CANCELLED", label: "Отменённые" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                statusFilter === tab.key
                  ? "bg-[var(--accent-warm)] text-[var(--accent-foreground)] shadow-sm font-semibold"
                  : "bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
          {orders.length === 0 && !loading ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)]">
              Заказы не найдены.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-[var(--text-muted)]">
                    <th className="py-3 px-4 font-semibold">Номер заказа</th>
                    <th className="py-3 px-4 font-semibold">Дата</th>
                    <th className="py-3 px-4 font-semibold">Клиент</th>
                    <th className="py-3 px-4 font-semibold">Позиции</th>
                    <th className="py-3 px-4 font-semibold text-right">Сумма</th>
                    <th className="py-3 px-4 font-semibold">Статус заказа</th>
                    <th className="py-3 px-4 font-semibold">Статус резерва</th>
                    <th className="py-3 px-4 font-semibold text-center">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {orders.map((ord) => {
                    const hasActiveReservation = ord.items?.some((i) => i.reserved);
                    const totalQuantity =
                      ord.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-[var(--text-primary)]">
                          {ord.order_number}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">
                          {new Date(ord.created_at).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[var(--text-primary)]">
                            {ord.customer_name}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            {ord.customer_email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          <div className="text-xs font-medium text-[var(--text-primary)]">
                            {ord.items?.[0]?.variant?.product?.name || `${totalQuantity} шт.`}
                          </div>
                          {ord.items?.[0]?.variant?.sku && (
                            <div className="text-[11px] text-[var(--text-muted)] font-mono">
                              {ord.items[0].variant.sku} ({ord.items[0].variant.color} / {ord.items[0].variant.size})
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[var(--text-primary)]">
                          €{ord.total_amount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              ORDER_STATUS_COLORS[ord.status]
                            }`}
                          >
                            {ORDER_STATUS_LABELS[ord.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {hasActiveReservation ? (
                            <span className="text-amber-500 font-medium flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Зарезервировано</span>
                            </span>
                          ) : ord.status === "SHIPPED" || ord.status === "COMPLETED" ? (
                            <span className="text-indigo-500 font-medium flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5" />
                              <span>Списано со склада</span>
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-xs transition-colors"
                          >
                            Управление
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Drawer: Order Details & Status Workflow */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] w-full max-w-xl h-full flex flex-col p-6 overflow-y-auto shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold font-mono text-[var(--text-primary)]">
                      {selectedOrder.order_number}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        ORDER_STATUS_COLORS[selectedOrder.status]
                      }`}
                    >
                      {ORDER_STATUS_LABELS[selectedOrder.status]}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Создан: {new Date(selectedOrder.created_at).toLocaleString("ru-RU")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Actions Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Действия со статусом заказа
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedOrder.status === "NEW" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(selectedOrder, "CONFIRMED")}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs font-semibold transition-colors"
                      >
                        Подтвердить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(selectedOrder, "PROCESSING")}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 text-xs font-semibold transition-colors"
                      >
                        В обработку
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(selectedOrder, "SHIPPED")}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 text-xs font-semibold transition-colors"
                      >
                        Отправить (Списать со склада)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(selectedOrder, "CANCELLED")}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold transition-colors"
                      >
                        Отменить заказ
                      </button>
                    </>
                  )}

                  {(selectedOrder.status === "CONFIRMED" || selectedOrder.status === "PROCESSING") && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(selectedOrder, "SHIPPED")}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 text-xs font-semibold transition-colors"
                      >
                        Отправить (Списать со склада)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(selectedOrder, "CANCELLED")}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold transition-colors"
                      >
                        Отменить заказ
                      </button>
                    </>
                  )}

                  {selectedOrder.status === "SHIPPED" && (
                    <button
                      type="button"
                      onClick={() => handleOpenStatusAction(selectedOrder, "COMPLETED")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-xs font-semibold transition-colors"
                    >
                      Завершить заказ
                    </button>
                  )}

                  {(selectedOrder.status === "COMPLETED" || selectedOrder.status === "CANCELLED") && (
                    <span className="text-xs text-[var(--text-muted)] italic">
                      Финальный статус. Изменение невозможно.
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 rounded-xl bg-[var(--bg-elevated)] space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px]">
                  Данные клиента
                </span>
                <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                  <User className="w-4 h-4 text-[var(--accent-warm)]" />
                  <span>{selectedOrder.customer_name}</span>
                </div>
                <div className="text-[var(--text-secondary)] pl-6 space-y-0.5">
                  <div>Email: {selectedOrder.customer_email}</div>
                  {selectedOrder.customer_phone && <div>Тел: {selectedOrder.customer_phone}</div>}
                  {selectedOrder.shipping_address && (
                    <div className="flex items-start gap-1 pt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--text-muted)]" />
                      <span>{selectedOrder.shipping_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 text-xs">
                <span className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Состав заказа
                </span>
                <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">
                          {item.variant?.product?.name || "Товар"}
                        </div>
                        <div className="text-[var(--text-muted)] text-[11px] mt-0.5">
                          {item.variant?.color} / {item.variant?.size} • SKU: {item.variant?.sku}
                        </div>
                        <div className="text-[10px] mt-1">
                          {item.reserved ? (
                            <span className="text-amber-500 font-medium">✓ Зарезервировано: {item.quantity} шт.</span>
                          ) : (
                            <span className="text-indigo-500 font-medium">✓ Списано: {item.quantity} шт.</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[var(--text-primary)]">
                          €{item.total_price}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {item.quantity} × €{item.unit_price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 px-1 font-bold text-sm">
                  <span>Итого к оплате:</span>
                  <span className="text-lg text-[var(--accent-warm)]">€{selectedOrder.total_amount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Status Action Confirmation Dialog */}
        {statusAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {statusAction.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setStatusAction(null)}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {statusAction.warning && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{statusAction.warning}</p>
                </div>
              )}

              {actionError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                  {actionError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Примечание / Причина смены статуса (необязательно)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Например: Трек-номер отправления DHL..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setStatusAction(null)}
                    className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmStatusAction}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold shadow hover:opacity-90 transition-opacity"
                  >
                    {actionLoading ? "Обработка..." : "Подтвердить смену статуса"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create Order with Atomic Reservation */}
        {isNewOrderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Создать заказ</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Товар резервируется немедленно при сохранении заказа
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {newOrderError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{newOrderError}</span>
                </div>
              )}

              <form onSubmit={handleCreateOrderSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Имя клиента *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Email клиента *
                    </label>
                    <input
                      type="email"
                      required
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Телефон
                    </label>
                    <input
                      type="text"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      Адрес доставки
                    </label>
                    <input
                      type="text"
                      value={newCustAddress}
                      onChange={(e) => setNewCustAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                    />
                  </div>
                </div>

                <div className="border-t border-[var(--border-subtle)] pt-3 space-y-3">
                  <span className="font-bold text-[var(--text-secondary)]">Выбор товара для заказа</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                        Товар и вариант (Доступный остаток)
                      </label>
                      <select
                        value={selectedVariantId}
                        onChange={(e) => setSelectedVariantId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] font-mono text-[11px]"
                      >
                        {inventory.map((inv) => (
                          <option key={inv.variant_id} value={inv.variant_id}>
                            {inv.variant?.product?.name} ({inv.variant?.color}/{inv.variant?.size}) — Доступно: {inv.available} шт.
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                        Количество
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] font-bold text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setIsNewOrderModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={newOrderLoading}
                    className="px-5 py-2 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold shadow hover:opacity-90 transition-opacity"
                  >
                    {newOrderLoading ? "Резервирование..." : "Создать и зарезервировать"}
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
