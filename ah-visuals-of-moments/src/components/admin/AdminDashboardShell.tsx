"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("ah_admin_sidebar_collapsed");
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("ah_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      {/* Sidebar navigation */}
      <AdminSidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      {/* Main Content Area: flex-1 автоматически заполняет всё оставшееся пространство при любой ширине меню */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        {children}
      </div>
    </div>
  );
}
