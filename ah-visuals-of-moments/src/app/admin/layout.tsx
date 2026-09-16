import React from "react";

export const metadata = {
  title: "Панель управления | AH Visuals of Moments",
  description: "Внутренняя административная система AH Visuals of Moments",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">{children}</div>;
}
