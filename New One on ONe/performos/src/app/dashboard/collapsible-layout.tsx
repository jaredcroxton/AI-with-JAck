"use client";

import { useState } from "react";
import Link from "next/link";
import { AccorLogo } from "../accor-logo";
import { SidebarNav } from "./sidebar-nav";

export function CollapsibleLayout({
  fullName,
  teamSize,
  children,
}: {
  fullName: string;
  teamSize: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="px-3 py-5 border-b border-[var(--border)]">
          <Link
            href="/dashboard"
            className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5 px-2"}`}
          >
            {collapsed ? (
              <div className="w-8 h-8 rounded-lg gradient-bg shrink-0" />
            ) : (
              <AccorLogo className="h-7 text-[var(--text-primary)]" />
            )}
          </Link>
        </div>

        {/* User info */}
        <div className="px-3 py-4 border-b border-[var(--border)]">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-[0_2px_8px_rgba(79,110,247,0.2)]">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {fullName}
                </div>
                <div className="text-xs text-[var(--text-secondary)] truncate">
                  Manager
                </div>
              </div>
            )}
          </div>

          {/* Team capacity bar */}
          {!collapsed && (
            <div className="mt-4 px-2 transition-opacity duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Team size
                </span>
                <span className="text-xs font-bold text-[var(--accent-teal)]">
                  {teamSize} members
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-full gradient-bg transition-all"
                  style={{ width: `${Math.min((teamSize / 15) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarNav collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* Powered by */}
        {!collapsed && (
          <div className="px-5 py-3 border-t border-[var(--border)] text-center">
            <p className="text-[10px] text-[var(--text-secondary)]">
              Powered by <span className="font-bold">Perform<span className="gradient-text">OS</span></span>
            </p>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
