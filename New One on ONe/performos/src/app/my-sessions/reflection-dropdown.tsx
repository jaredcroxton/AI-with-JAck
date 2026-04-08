"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatMondayLabel, toISODate } from "@/lib/dates";

export function ReflectionDropdown({
  availableMondays,
}: {
  availableMondays: Date[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (availableMondays.length === 0) {
    return (
      <div className="px-4 py-2.5 rounded-xl bg-gray-100 text-sm text-[var(--text-secondary)]">
        All recent weeks completed
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm gradient-bg hover:opacity-90 transition"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        New reflection
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-3 py-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            Select a Monday
          </div>
          {availableMondays.map((monday) => (
            <button
              key={toISODate(monday)}
              onClick={() => {
                setOpen(false);
                router.push(
                  `/my-sessions/reflect?week=${toISODate(monday)}`
                );
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-[var(--text-on-light)] hover:bg-gray-50 transition-colors"
            >
              {formatMondayLabel(monday)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
