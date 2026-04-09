"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/team", label: "Team" },
  { href: "/dashboard/actions", label: "Actions" },
];

export function DashboardTabs() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            isActive(tab.href)
              ? "btn-primary text-white"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-light)]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
