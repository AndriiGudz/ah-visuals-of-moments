import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { defaultLocale } from "@/i18n/config";

export default function RootNotFound() {
  const dictionary = getDictionary(defaultLocale);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg text-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 sm:p-12 rounded-sm shadow-xl space-y-6 overflow-hidden">
        {/* Ambient warm glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[var(--accent-warm)]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Animated 404 Header */}
        <div className="space-y-1">
          <div className="text-7xl sm:text-9xl font-extralight tracking-widest text-[var(--text-primary)] select-none opacity-85 animate-pulse font-mono">
            404
          </div>
          <div className="text-[11px] uppercase tracking-widest text-[var(--accent-warm)] font-mono font-semibold">
            {dictionary.notFound.badge}
          </div>
        </div>

        {/* Title and Body */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-light text-[var(--text-primary)] tracking-wide">
            {dictionary.notFound.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto font-light">
            {dictionary.notFound.description}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/en/collection"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--text-primary)] hover:opacity-90 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-opacity rounded-sm shadow-xs focus-visible:outline-2 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-2"
          >
            {dictionary.notFound.button}
          </Link>
          <Link
            href="/en"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-highlight)] hover:border-[var(--text-primary)] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm shadow-xs focus-visible:outline-2 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-2"
          >
            {dictionary.notFound.homeButton}
          </Link>
        </div>
      </div>
    </div>
  );
}
