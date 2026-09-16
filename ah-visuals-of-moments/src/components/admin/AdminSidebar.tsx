"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  History,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Обзор", href: "/admin", icon: LayoutDashboard },
  { name: "Товары", href: "/admin/products", icon: Package },
  { name: "Коллекции", href: "/admin/collections", icon: Layers },
  { name: "Остатки", href: "/admin/inventory", icon: Boxes },
  { name: "Заказы", href: "/admin/orders", icon: ShoppingCart },
  { name: "Движения склада", href: "/admin/movements", icon: History },
  { name: "Google Sheets", href: "/admin/google-sheets", icon: FileSpreadsheet },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  collapsed: externalCollapsed,
  onToggleCollapse: externalToggleCollapse,
}: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("ah_admin_sidebar_collapsed");
    if (saved === "true") {
      setInternalCollapsed(true);
    }
  }, []);

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const isControlled = externalCollapsed !== undefined;
  const collapsed = isControlled ? externalCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (externalToggleCollapse) {
      externalToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem("ah_admin_sidebar_collapsed", String(next));
        return next;
      });
    }
  };

  // Close mobile drawer when clicking a link
  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-50 p-3 rounded-full bg-[var(--accent-warm)] text-[var(--accent-foreground)] shadow-xl focus:outline-none"
        aria-label="Открыть меню"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 lg:static lg:z-auto lg:sticky lg:top-0 lg:h-screen lg:shrink-0 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
          {!collapsed ? (
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-[var(--accent-warm)] font-semibold">
                AH Visuals
              </span>
              <span className="text-sm font-medium tracking-tight text-[var(--text-primary)]">
                Admin System
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-[var(--accent-warm)] mx-auto">AH</span>
          )}

          {/* Collapse Button (Desktop) */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close Button (Mobile) */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          {!collapsed ? (
            <div className="flex flex-col gap-1">
              <span>Система: v0.2</span>
              <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Supabase Master
              </span>
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" title="Подключено" />
          )}
        </div>
      </aside>
    </>
  );
}
