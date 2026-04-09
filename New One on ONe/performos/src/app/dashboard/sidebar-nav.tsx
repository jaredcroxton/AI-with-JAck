"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Users,
  Sparkles,
  CheckCircle2,
  PenLine,
  LogOut,
  ChevronsRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    Icon: Home,
    exact: true,
  },
  {
    href: "/dashboard/team",
    label: "Team",
    Icon: Users,
  },
  {
    href: "/dashboard/insights",
    label: "AI Insights",
    Icon: Sparkles,
    gradient: true,
  },
  {
    href: "/dashboard/actions",
    label: "Actions",
    Icon: CheckCircle2,
  },
  {
    href: "/dashboard/notes",
    label: "Notes",
    Icon: PenLine,
  },
];

export function SidebarNav({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 mb-3">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
              Menu
            </span>
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const isGradient = item.gradient;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`relative flex h-11 items-center rounded-xl transition-all duration-200 ${
                active
                  ? isGradient
                    ? "gradient-bg text-white shadow-[0_2px_12px_rgba(79,110,247,0.25)]"
                    : "bg-[var(--surface-hover)] text-[var(--text-primary)] shadow-sm border-l-2 border-[var(--accent-blue)]"
                  : isGradient
                    ? "text-[var(--accent-blue)] hover:bg-[var(--surface-hover)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              <div className="grid h-full w-12 shrink-0 place-content-center">
                <item.Icon className="h-[18px] w-[18px]" />
              </div>
              {!collapsed && (
                <span className="text-sm font-medium truncate transition-opacity duration-200">
                  {item.label}
                </span>
              )}
              {active && !isGradient && !collapsed && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full gradient-bg" />
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="px-3 mt-6 mb-3">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
              Account
            </span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          title={collapsed ? "Sign out" : undefined}
          className="flex h-11 w-full items-center rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-[var(--soft-red)] transition-all duration-200"
        >
          <div className="grid h-full w-12 shrink-0 place-content-center">
            <LogOut className="h-[18px] w-[18px]" />
          </div>
          {!collapsed && <span>Sign out</span>}
        </button>
      </nav>

      {/* Toggle collapse */}
      <button
        onClick={onToggle}
        className="absolute bottom-0 left-0 right-0 border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
      >
        <div className="flex items-center p-3">
          <div className="grid h-10 w-12 shrink-0 place-content-center">
            <ChevronsRight
              className={`h-4 w-4 text-[var(--text-secondary)] transition-transform duration-300 ${
                !collapsed ? "rotate-180" : ""
              }`}
            />
          </div>
          {!collapsed && (
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Collapse
            </span>
          )}
        </div>
      </button>
    </>
  );
}
