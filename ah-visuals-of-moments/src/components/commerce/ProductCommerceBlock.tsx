"use client";

import React, { useState, useMemo } from "react";
import { CommerceProduct, CommerceVariant } from "@/types/commerce";
import { Dictionary } from "@/i18n/dictionaries/en";

interface VisualColor {
  id: string;
  name: string;
  hex: string;
}

interface ProductCommerceBlockProps {
  commerce: CommerceProduct | null;
  visualColors: VisualColor[];
  dictionary: Dictionary["commerce"];
}

export function ProductCommerceBlock({
  commerce,
  visualColors,
  dictionary,
}: ProductCommerceBlockProps) {
  // Сценарий 1: Supabase недоступен или товар не найден в базе commerce layer
  if (!commerce) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-sm space-y-2">
        <p className="text-xs text-[var(--text-secondary)]">
          {dictionary.tempUnavailable}
        </p>
      </div>
    );
  }

  // Сценарий 2: Товар деактивирован в Supabase (product.active = false)
  if (!commerce.active) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-light text-[var(--text-primary)]">
            €{commerce.price}
          </span>
          {commerce.collection?.type === "LIMITED" && (
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-sm border border-[var(--accent-warm)] text-[var(--accent-warm)] bg-[var(--accent-warm)]/10">
              {dictionary.limitedBadge}
            </span>
          )}
        </div>
        <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-sm">
          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
            {dictionary.currentlyUnavailable}
          </p>
        </div>
      </div>
    );
  }

  // Сценарий 3: Товар активен — отображаем цену, выбор цвета и размера с проверкой остатков
  return (
    <ActiveCommerceBlock
      commerce={commerce}
      visualColors={visualColors}
      dictionary={dictionary}
    />
  );
}

function ActiveCommerceBlock({
  commerce,
  visualColors,
  dictionary,
}: {
  commerce: CommerceProduct;
  visualColors: VisualColor[];
  dictionary: Dictionary["commerce"];
}) {
  // 1. Извлекаем уникальные цвета из вариантов Supabase и сопоставляем с визуальными метаданными
  const colorOptions = useMemo(() => {
    const map = new Map<string, { dbColor: string; visual: VisualColor; hasAvailableStock: boolean }>();

    for (const v of commerce.variants) {
      if (!map.has(v.color)) {
        // Поиск сопоставления с visualColors
        const lowerColor = v.color.toLowerCase();
        let matched = visualColors.find(
          (vc) =>
            vc.name.toLowerCase() === lowerColor ||
            vc.id.toLowerCase() === lowerColor ||
            lowerColor.includes(vc.id.toLowerCase())
        );

        if (!matched) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[Commerce] Не найден визуальный конфиг для цвета: "${v.color}"`);
          }
          matched = {
            id: v.color.toLowerCase().replace(/\s+/g, "-"),
            name: v.color,
            hex: "#666666",
          };
        }

        map.set(v.color, {
          dbColor: v.color,
          visual: matched,
          hasAvailableStock: false,
        });
      }

      // Проверяем наличие хотя бы одного доступного размера
      const isVariantInStock = v.active && (v.inventory?.available ?? 0) > 0;
      if (isVariantInStock) {
        map.get(v.color)!.hasAvailableStock = true;
      }
    }

    return Array.from(map.values());
  }, [commerce.variants, visualColors]);

  // 2. Проверяем, есть ли хотя бы один доступный вариант во всем товаре
  const hasAnyStock = useMemo(() => {
    return commerce.variants.some((v) => v.active && (v.inventory?.available ?? 0) > 0);
  }, [commerce.variants]);

  // 3. Выбор начального цвета (первый с наличием, либо первый в списке)
  const initialColor = useMemo(() => {
    const withStock = colorOptions.find((c) => c.hasAvailableStock);
    return withStock ? withStock.dbColor : colorOptions[0]?.dbColor || "";
  }, [colorOptions]);

  const [selectedColor, setSelectedColor] = useState<string>(initialColor);

  // 4. Получаем варианты для выбранного цвета
  const sizeVariantsForColor = useMemo(() => {
    return commerce.variants.filter((v) => v.color === selectedColor);
  }, [commerce.variants, selectedColor]);

  // 5. Выбор размера: не выбираем автоматически недоступный размер
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    const firstAvailable = sizeVariantsForColor.find(
      (v) => v.active && (v.inventory?.available ?? 0) > 0
    );
    return firstAvailable ? firstAvailable.size : null;
  });

  // При смене цвета сбрасываем или обновляем выбранный размер
  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    const variantsForNew = commerce.variants.filter((v) => v.color === newColor);
    const currentSizeAvailable = variantsForNew.find(
      (v) => v.size === selectedSize && v.active && (v.inventory?.available ?? 0) > 0
    );
    if (!currentSizeAvailable) {
      const firstAvail = variantsForNew.find(
        (v) => v.active && (v.inventory?.available ?? 0) > 0
      );
      setSelectedSize(firstAvail ? firstAvail.size : null);
    }
  };

  const selectedVariant = useMemo(() => {
    if (!selectedSize) return null;
    return sizeVariantsForColor.find((v) => v.size === selectedSize) || null;
  }, [sizeVariantsForColor, selectedSize]);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-sm space-y-6">
      {/* Верхняя строка: Цена и Бейдж коллекции */}
      <div className="flex items-baseline justify-between border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-mono block">
            {dictionary.priceLabel}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
              €{commerce.price}
            </span>
          </div>
        </div>

        {commerce.collection?.type === "LIMITED" ? (
          <span className="text-[11px] uppercase font-mono tracking-widest px-3 py-1 rounded-sm border border-[var(--accent-warm)] text-[var(--accent-warm)] bg-[var(--accent-warm)]/10">
            {dictionary.limitedBadge}
          </span>
        ) : commerce.collection?.type === "REGULAR" ? (
          <span className="text-[11px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-sm border border-[var(--border-subtle)] text-[var(--text-secondary)] bg-[var(--bg-elevated)]">
            {dictionary.regularBadge}
          </span>
        ) : null}
      </div>

      {/* Уведомление, если весь товар полностью распродан */}
      {!hasAnyStock && (
        <div className="p-3 bg-[var(--bg-elevated)] border border-dashed border-[var(--border-subtle)] rounded-sm">
          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neutral-400 inline-block" />
            {dictionary.allSoldOut}
          </p>
        </div>
      )}

      {/* Выбор цвета */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--text-secondary)] uppercase tracking-wider">
            {dictionary.selectColor}
          </span>
          <span className="text-[var(--text-primary)] font-medium">
            {colorOptions.find((c) => c.dbColor === selectedColor)?.visual.name || selectedColor}
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {colorOptions.map(({ dbColor, visual, hasAvailableStock }) => {
            const isSelected = dbColor === selectedColor;
            return (
              <button
                key={dbColor}
                type="button"
                onClick={() => handleColorChange(dbColor)}
                className={`inline-flex items-center gap-2 text-xs px-3.5 py-2 rounded-sm border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[var(--text-primary)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-highlight)] text-[var(--text-secondary)]"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-[var(--border-highlight)] inline-block shadow-2xs"
                  style={{ backgroundColor: visual.hex }}
                />
                <span>{visual.name}</span>
                {!hasAvailableStock && (
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    ({dictionary.outOfStock})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Выбор размера */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--text-secondary)] uppercase tracking-wider">
            {dictionary.selectSize}
          </span>
          {selectedVariant && (
            <span className="text-[11px] text-[var(--accent-warm)]">
              {(selectedVariant.inventory?.available ?? 0) > 0
                ? `${dictionary.inStock}: ${selectedVariant.inventory?.available}`
                : dictionary.outOfStock}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {sizeVariantsForColor.map((variant: CommerceVariant) => {
            const available = variant.inventory?.available ?? 0;
            const isAvailable = variant.active && available > 0;
            const isSelected = selectedSize === variant.size;

            return (
              <button
                key={variant.id}
                type="button"
                disabled={!isAvailable}
                onClick={() => isAvailable && setSelectedSize(variant.size)}
                title={isAvailable ? `${variant.size} - ${dictionary.inStock}` : `${variant.size} - ${dictionary.outOfStock}`}
                className={`min-w-12 h-10 px-3 text-xs font-mono rounded-sm border transition-all flex items-center justify-center ${
                  !isAvailable
                    ? "opacity-35 cursor-not-allowed border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] line-through"
                    : isSelected
                    ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold shadow-xs cursor-pointer"
                    : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--text-primary)] cursor-pointer"
                }`}
              >
                {variant.size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
