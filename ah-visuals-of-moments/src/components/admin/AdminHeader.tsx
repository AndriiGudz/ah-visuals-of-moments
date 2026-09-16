"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sun, Moon, LogOut, ExternalLink } from "lucide-react";

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {/* Public Site Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] transition-colors"
        >
          <span>На сайт</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-colors"
          title={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-colors"
          title="Выйти из админки"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Выйти</span>
        </button>
      </div>
    </header>
  );
}
