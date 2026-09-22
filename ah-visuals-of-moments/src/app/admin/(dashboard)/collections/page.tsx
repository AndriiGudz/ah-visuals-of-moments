"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Layers,
  Plus,
  Edit2,
  X,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Collection, CollectionType, Product } from "@/types/admin";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state: all, active, inactive
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formType, setFormType] = useState<CollectionType>("REGULAR");
  const [formActive, setFormActive] = useState(true);

  // Confirmation dialog for type change
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [colRes, prodRes] = await Promise.all([
        fetch("/api/admin/collections"), // Returns all (active + inactive)
        fetch("/api/admin/products"),
      ]);

      const colData = await colRes.json();
      const prodData = await prodRes.json();

      if (colData.collections) setCollections(colData.collections);
      if (prodData.products) setProducts(prodData.products);
    } catch {
      setError("Не удалось загрузить коллекции");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map collection_id -> count of bound products
  const productCountByCollection = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.collection_id) {
        counts[p.collection_id] = (counts[p.collection_id] || 0) + 1;
      }
    }
    return counts;
  }, [products]);

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormName("");
    setFormSlug("");
    setFormType("REGULAR");
    setFormActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingCollection(col);
    setFormName(col.name);
    setFormSlug(col.slug);
    setFormType(col.type);
    setFormActive(col.active);
    setError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If editing and type is changed -> prompt confirmation with affected products count
    if (editingCollection && editingCollection.type !== formType) {
      setIsConfirmOpen(true);
      return;
    }

    saveCollection();
  };

  const saveCollection = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim().toLowerCase(),
        type: formType,
        active: formActive,
      };

      let res: Response;
      if (editingCollection) {
        res = await fetch("/api/admin/collections", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCollection.id,
            ...payload,
          }),
        });
      } else {
        res = await fetch("/api/admin/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при сохранении коллекции");

      setIsConfirmOpen(false);
      setIsModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setSaving(false);
    }
  };

  const filteredCollections = collections.filter((c) => {
    if (statusFilter === "ACTIVE") return c.active;
    if (statusFilter === "INACTIVE") return !c.active;
    return true;
  });

  const affectedProductsCount = editingCollection
    ? productCountByCollection[editingCollection.id] || 0
    : 0;

  return (
    <div>
      <AdminHeader title="Управление коллекциями" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Коллекции
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Управление коллекциями каталога (REGULAR / LIMITED) и их статусом активности
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-all bg-[var(--bg-elevated)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Обновить
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] hover:opacity-90 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Новая коллекция
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters & stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Статус:</span>
            <div className="flex rounded-lg border border-[var(--border-subtle)] p-0.5 bg-[var(--bg-elevated)]">
              {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setStatusFilter(filterKey)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    statusFilter === filterKey
                      ? "bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {filterKey === "ALL" && `Все (${collections.length})`}
                  {filterKey === "ACTIVE" && `Активные (${collections.filter((c) => c.active).length})`}
                  {filterKey === "INACTIVE" && `Неактивные (${collections.filter((c) => !c.active).length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-[var(--text-secondary)]">
            Показано коллекций: <span className="font-semibold text-[var(--text-primary)]">{filteredCollections.length}</span>
          </div>
        </div>

        {/* Collections Table */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-sm text-[var(--text-secondary)] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent-warm)]" />
              Загрузка коллекций...
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--text-secondary)]">
              Коллекции не найдены
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Название коллекции</th>
                    <th className="py-3 px-4">Slug (URL)</th>
                    <th className="py-3 px-4">Тип</th>
                    <th className="py-3 px-4 text-center">Связанных товаров</th>
                    <th className="py-3 px-4 text-center">Статус</th>
                    <th className="py-3 px-4">Обновлено</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredCollections.map((col) => {
                    const count = productCountByCollection[col.id] || 0;
                    return (
                      <tr
                        key={col.id}
                        className="hover:bg-[var(--bg-elevated)]/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[var(--text-secondary)]" />
                            <span>{col.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                          {col.slug}
                        </td>
                        <td className="py-3.5 px-4">
                          {col.type === "LIMITED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              LIMITED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-500/10 text-neutral-700 dark:text-neutral-300 border border-neutral-500/20">
                              REGULAR
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] ${
                              count > 0
                                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                                : "text-[var(--text-muted)]"
                            }`}
                          >
                            {count}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {col.active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Активна
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[var(--text-muted)] font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              Неактивна
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                          {new Date(col.updated_at).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openEditModal(col)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] bg-[var(--bg-elevated)] transition-all"
                          >
                            <Edit2 className="w-3 h-3" />
                            Изменить
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
      </div>

      {/* Modal: Create or Edit Collection */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-5 text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-base">
                <Layers className="w-5 h-5 text-[var(--accent-warm)]" />
                <h3>{editingCollection ? "Редактировать коллекцию" : "Новая коллекция"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  Название коллекции *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Core Moments"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCollection && !formSlug) {
                      setFormSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] placeholder-[var(--text-muted)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  Slug (URL идентификатор) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="core-moments"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] font-mono placeholder-[var(--text-muted)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  Тип выпуска *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("REGULAR")}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                      formType === "REGULAR"
                        ? "bg-[var(--bg-elevated)] border-[var(--border-highlight)] text-[var(--text-primary)] font-bold shadow-sm"
                        : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)] hover:bg-[var(--bg-elevated)]/50"
                    }`}
                  >
                    REGULAR (Базовая)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("LIMITED")}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                      formType === "LIMITED"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                        : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)] hover:bg-[var(--bg-elevated)]/50"
                    }`}
                  >
                    LIMITED (Ограниченная)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="col-active-checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-subtle)] accent-[var(--accent-warm)]"
                />
                <label
                  htmlFor="col-active-checkbox"
                  className="font-medium text-[var(--text-primary)] cursor-pointer"
                >
                  Коллекция активна (доступна для выбора при создании товаров)
                </label>
              </div>

              {editingCollection && !formActive && affectedProductsCount > 0 && (
                <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px]">
                  Примечание: деактивация коллекции не отвяжет {affectedProductsCount} привязанных товаров, но скроет коллекцию из списка для новых товаров.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-colors font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-bold hover:opacity-90 transition-opacity shadow-md flex items-center gap-1.5"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingCollection ? "Сохранить изменения" : "Создать коллекцию"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Changing type REGULAR <-> LIMITED */}
      {isConfirmOpen && editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 text-[var(--text-primary)]">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                Подтверждение изменения типа коллекции
              </h3>
            </div>

            <div className="space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              <p>
                Вы собираетесь изменить тип коллекции{" "}
                <span className="font-bold text-[var(--text-primary)]">«{editingCollection.name}»</span>:
              </p>
              <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center gap-3 font-semibold text-xs">
                <span className="text-[var(--text-secondary)]">{editingCollection.type}</span>
                <span>→</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{formType}</span>
              </div>
              <p className="pt-1">
                Это изменение затронет{" "}
                <span className="font-bold text-[var(--text-primary)]">
                  {affectedProductsCount}{" "}
                  {affectedProductsCount === 1
                    ? "связанный товар"
                    : affectedProductsCount >= 2 && affectedProductsCount <= 4
                    ? "связанных товара"
                    : "связанных товаров"}
                </span>
                .
              </p>
              <p>
                Все связанные товары будут относиться к коллекции типа{" "}
                <span className="font-bold text-[var(--text-primary)]">{formType}</span> в каталоге и отчётах.
              </p>
              <p className="pt-1 font-medium text-[var(--text-primary)]">
                Подтвердить изменение?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)] text-xs">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={saveCollection}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
              >
                {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Да, изменить тип
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
