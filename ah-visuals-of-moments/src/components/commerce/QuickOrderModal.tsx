"use client";

import React, { useState, useEffect, useId } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Dictionary } from "@/i18n/dictionaries/en";
import { CommerceVariant } from "@/types/commerce";

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  price: number;
  selectedColorName: string;
  selectedVariant: CommerceVariant;
  dictionary: Dictionary["commerce"];
  onSuccessOrder?: () => void;
  onStockConflict?: () => void;
}

export function QuickOrderModal({
  isOpen,
  onClose,
  productName,
  price,
  selectedColorName,
  selectedVariant,
  dictionary,
  onSuccessOrder,
  onStockConflict,
}: QuickOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [hpField, setHpField] = useState(""); // Honeypot anti-spam

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    orderNumber: string;
  } | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  // Persistent client idempotency key generated per modal open
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  const nameInputId = useId();
  const emailInputId = useId();
  const phoneInputId = useId();
  const addressInputId = useId();
  const notesInputId = useId();

  useEffect(() => {
    if (isOpen) {
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setShippingAddress("");
      setNotes("");
      setHpField("");
      setError(null);
      setSuccessData(null);
      setConflictMessage(null);
      setLoading(false);

      // Generate unique idempotency key
      const key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setIdempotencyKey(key);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = customerName.trim();
    const trimmedEmail = customerEmail.trim();
    const trimmedPhone = customerPhone.trim();

    if (!trimmedName) {
      setError(dictionary.nameLabel + " is required");
      return;
    }

    if (!trimmedEmail && !trimmedPhone) {
      setError(dictionary.contactNotice);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: selectedVariant.id,
          sku: selectedVariant.sku,
          customer_name: trimmedName,
          customer_email: trimmedEmail || undefined,
          customer_phone: trimmedPhone || undefined,
          shipping_address: shippingAddress.trim() || undefined,
          notes: notes.trim() || undefined,
          idempotency_key: idempotencyKey,
          hp_field: hpField,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 || data.code === "OUT_OF_STOCK") {
          setConflictMessage(dictionary.soldOutConflict);
          onStockConflict?.();
          return;
        }
        throw new Error(data.error || "Не удалось оформить заказ");
      }

      setSuccessData({
        orderNumber: data.order_number,
      });
      onSuccessOrder?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Произошла ошибка при отправке");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm max-w-md w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header with Close button */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-light tracking-wide text-[var(--text-primary)]">
            {dictionary.quickOrderTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label={dictionary.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Success State */}
        {successData ? (
          <div className="space-y-6 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-light text-[var(--text-primary)]">
                {dictionary.orderAccepted}
              </h3>
              <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-sm font-mono text-sm text-[var(--accent-warm)]">
                {dictionary.orderNumber}: {successData.orderNumber}
              </div>
              <p className="text-xs text-[var(--text-secondary)] pt-2">
                {dictionary.orderConfirmationNotice}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-sm bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium text-xs tracking-wider uppercase transition-opacity hover:opacity-90 cursor-pointer"
            >
              {dictionary.close}
            </button>
          </div>
        ) : conflictMessage ? (
          /* 2. Stock Conflict State */
          <div className="space-y-6 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[var(--text-primary)]">
                {conflictMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-xs tracking-wider uppercase transition-colors cursor-pointer"
            >
              {dictionary.close}
            </button>
          </div>
        ) : (
          /* 3. Order Input Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Readonly Summary */}
            <div className="p-3.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-sm space-y-2 text-xs font-mono">
              <div className="flex justify-between items-baseline">
                <span className="text-[var(--text-primary)] font-medium">
                  {productName}
                </span>
                <span className="text-base text-[var(--text-primary)] font-light">
                  €{price}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--text-secondary)] text-[11px]">
                <span>
                  {dictionary.selectColor}:{" "}
                  <strong className="text-[var(--text-primary)] font-medium">
                    {selectedColorName}
                  </strong>
                </span>
                <span>
                  {dictionary.selectSize}:{" "}
                  <strong className="text-[var(--text-primary)] font-medium">
                    {selectedVariant.size}
                  </strong>
                </span>
                <span>
                  {dictionary.quantityLabel}:{" "}
                  <strong className="text-[var(--text-primary)] font-medium">
                    1
                  </strong>
                </span>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-sm text-xs text-rose-500 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor={nameInputId}
                  className="block font-mono text-[var(--text-secondary)] uppercase tracking-wider text-[11px]"
                >
                  {dictionary.nameLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={dictionary.namePlaceholder}
                  className="w-full px-3 py-2 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--text-primary)] transition-colors"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor={emailInputId}
                    className="block font-mono text-[var(--text-secondary)] uppercase tracking-wider text-[11px]"
                  >
                    {dictionary.emailLabel}
                  </label>
                  <input
                    id={emailInputId}
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder={dictionary.emailPlaceholder}
                    className="w-full px-3 py-2 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--text-primary)] transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={phoneInputId}
                    className="block font-mono text-[var(--text-secondary)] uppercase tracking-wider text-[11px]"
                  >
                    {dictionary.phoneLabel}
                  </label>
                  <input
                    id={phoneInputId}
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={dictionary.phonePlaceholder}
                    className="w-full px-3 py-2 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--text-primary)] transition-colors"
                  />
                </div>
              </div>

              <p className="text-[10px] text-[var(--text-muted)] italic">
                *{dictionary.contactNotice}
              </p>

              {/* Address (Optional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor={addressInputId}
                  className="block font-mono text-[var(--text-secondary)] uppercase tracking-wider text-[11px]"
                >
                  {dictionary.addressLabel}
                </label>
                <input
                  id={addressInputId}
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder={dictionary.addressPlaceholder}
                  className="w-full px-3 py-2 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--text-primary)] transition-colors"
                />
              </div>

              {/* Notes (Optional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor={notesInputId}
                  className="block font-mono text-[var(--text-secondary)] uppercase tracking-wider text-[11px]"
                >
                  {dictionary.notesLabel}
                </label>
                <textarea
                  id={notesInputId}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={dictionary.notesPlaceholder}
                  className="w-full px-3 py-2 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--text-primary)] transition-colors resize-none"
                />
              </div>

              {/* Honeypot hidden input for spam bots */}
              <input
                type="text"
                name="hp_field"
                value={hpField}
                onChange={(e) => setHpField(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Privacy disclaimer */}
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {dictionary.privacyNotice}
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-sm bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium text-xs tracking-wider uppercase transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? dictionary.submitting : dictionary.submitOrder}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
