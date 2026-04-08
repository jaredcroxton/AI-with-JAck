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
    <div className="flex items-center gap-2 flex-wrap">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isActive(tab.href)
              ? "gradient-bg text-white shadow-lg shadow-[var(--accent-blue)]/20"
              : "bg-white text-[var(--text-secondary)] border border-gray-200 hover:border-gray-300 hover:text-[var(--text-on-light)]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
