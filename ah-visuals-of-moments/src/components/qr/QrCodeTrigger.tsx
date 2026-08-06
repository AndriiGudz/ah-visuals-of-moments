"use client";

import React, { useState, useRef } from "react";
import { QrCodeModal } from "./QrCodeModal";

interface QrCodeTriggerProps {
  momentTitle: string;
  momentSlug: string;
  siteUrl: string;
  dictionary: {
    viewQr: string;
    modalTitle: string;
    modalDescription: string;
    encodedUrlLabel: string;
    downloadPng: string;
    downloadSvg: string;
    close: string;
    localhostWarningTitle: string;
    localhostWarning: string;
  };
}

export function QrCodeTrigger({
  momentTitle,
  momentSlug,
  siteUrl,
  dictionary,
}: QrCodeTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Build stable neutral URL encoded inside QR code: SITE_URL + /moments/[slug]
  const formattedSiteUrl = siteUrl.replace(/\/$/, "");
  const qrUrl = `${formattedSiteUrl}/moments/${momentSlug}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-highlight)] hover:border-[var(--text-primary)] text-[var(--text-primary)] text-xs font-mono uppercase tracking-wider rounded-sm transition-all focus-visible:outline-2 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-2 cursor-pointer shadow-xs"
      >
        <svg
          className="w-3.5 h-3.5 text-[var(--accent-warm)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
          />
        </svg>
        <span>{dictionary.viewQr}</span>
      </button>

      <QrCodeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        momentTitle={momentTitle}
        momentSlug={momentSlug}
        qrUrl={qrUrl}
        siteUrl={siteUrl}
        dictionary={dictionary}
        triggerRef={triggerRef}
      />
    </>
  );
}
