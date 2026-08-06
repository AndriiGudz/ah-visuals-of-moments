"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  momentTitle: string;
  momentSlug: string;
  qrUrl: string;
  siteUrl: string;
  dictionary: {
    modalTitle: string;
    modalDescription: string;
    encodedUrlLabel: string;
    downloadPng: string;
    downloadSvg: string;
    close: string;
    localhostWarningTitle: string;
    localhostWarning: string;
  };
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const emptySubscribe = () => () => {};

export function QrCodeModal({
  isOpen,
  onClose,
  momentTitle,
  momentSlug,
  qrUrl,
  siteUrl,
  dictionary,
  triggerRef,
}: QrCodeModalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [svgContent, setSvgContent] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isLocalhost =
    siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");

  // Generate SVG string whenever qrUrl changes
  useEffect(() => {
    if (!qrUrl) return;

    QRCode.toString(qrUrl, {
      type: "svg",
      margin: 4,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((svg) => {
        setSvgContent(svg);
      })
      .catch((err) => {
        console.error("Failed to generate SVG QR code:", err);
      });
  }, [qrUrl]);

  // Handle focus lock, body overflow, and Escape key
  useEffect(() => {
    if (!isOpen) return;

    // Capture ref value for safe cleanup
    const triggerElement = triggerRef.current;

    // Prevent body scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into modal
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap loop
      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      // Return focus to trigger button
      triggerElement?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isClient || !isOpen) return null;

  const handleDownloadPng = async () => {
    try {
      // High resolution PNG generation (2048x2048 px)
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 2048,
        margin: 4,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = `ah-visuals-${momentSlug}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Failed to generate PNG QR code:", error);
    }
  };

  const handleDownloadSvg = async () => {
    try {
      const rawSvg =
        svgContent ||
        (await QRCode.toString(qrUrl, {
          type: "svg",
          margin: 4,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        }));

      const blob = new Blob([rawSvg], { type: "image/svg+xml;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = `ah-visuals-${momentSlug}-qr.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download SVG QR code:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        aria-describedby="qr-modal-desc"
        className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-6 shadow-2xl space-y-6 text-[var(--text-primary)] overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--accent-warm)] block mb-1">
              AH Visuals of Moments
            </span>
            <h2
              id="qr-modal-title"
              className="text-xl font-medium tracking-wide text-[var(--text-primary)]"
            >
              {momentTitle}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={dictionary.close}
            className="p-1.5 rounded-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-2 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Subtitle / Description */}
        <p
          id="qr-modal-desc"
          className="text-xs text-[var(--text-secondary)] leading-relaxed"
        >
          {dictionary.modalDescription}
        </p>

        {/* Localhost Warning Notice */}
        {isLocalhost && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm text-xs space-y-1 text-amber-600 dark:text-amber-400">
            <span className="font-mono font-semibold uppercase tracking-wider block text-[11px]">
              ⚠️ {dictionary.localhostWarningTitle}
            </span>
            <p className="text-[11px] leading-normal font-light">
              {dictionary.localhostWarning}
            </p>
          </div>
        )}

        {/* QR Code Container (Always crisp black-on-white) */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-sm border border-[var(--border-subtle)] shadow-inner">
          {svgContent ? (
            <div
              className="w-48 h-48 sm:w-56 sm:h-56"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-xs font-mono text-zinc-400">
              Generating QR...
            </div>
          )}
        </div>

        {/* Encoded URL info */}
        <div className="space-y-1 text-center bg-[var(--bg-elevated)] p-3 rounded-sm border border-[var(--border-subtle)]">
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block tracking-wider">
            {dictionary.encodedUrlLabel}
          </span>
          <code className="text-xs font-mono text-[var(--accent-warm)] break-all select-all">
            {qrUrl}
          </code>
        </div>

        {/* Action Buttons: PNG & SVG Downloads */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] text-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-2"
          >
            {dictionary.downloadPng}
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--text-primary)] hover:opacity-90 text-xs font-semibold uppercase tracking-wider rounded-sm transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-2"
          >
            {dictionary.downloadSvg}
          </button>
        </div>

        {/* Footer Close Button */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-4 font-mono uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-2"
          >
            {dictionary.close}
          </button>
        </div>
      </div>
    </div>
  );
}
