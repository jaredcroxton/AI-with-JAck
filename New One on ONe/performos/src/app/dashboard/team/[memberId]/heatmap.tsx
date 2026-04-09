"use client";

import { useEffect, useState } from "react";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";

interface Reflection {
  week_of: string;
  [key: string]: unknown;
}

function cellStyle(value: number | null): {
  background: string;
  color: string;
  boxShadow: string;
} {
  if (value === null) {
    return { background: "var(--surface)", color: "rgba(148,163,184,0.5)", boxShadow: "none" };
  }
  const map: Record<number, { background: string; color: string; boxShadow: string }> = {
    1: { background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.18))", color: "#EF4444", boxShadow: "inset 0 0 12px rgba(239,68,68,0.15), 0 1px 3px rgba(239,68,68,0.08)" },
    2: { background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.18))", color: "#D97706", boxShadow: "inset 0 0 12px rgba(251,191,36,0.15), 0 1px 3px rgba(251,191,36,0.08)" },
    3: { background: "linear-gradient(135deg, rgba(250,204,21,0.10), rgba(234,179,8,0.15))", color: "#B45309", boxShadow: "inset 0 0 8px rgba(250,204,21,0.1), 0 1px 2px rgba(234,179,8,0.06)" },
    4: { background: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(6,214,160,0.18))", color: "#059669", boxShadow: "inset 0 0 12px rgba(52,211,153,0.15), 0 1px 3px rgba(52,211,153,0.08)" },
    5: { background: "linear-gradient(135deg, rgba(6,214,160,0.15), rgba(16,185,129,0.22))", color: "#047857", boxShadow: "inset 0 0 14px rgba(6,214,160,0.18), 0 1px 4px rgba(6,214,160,0.1)" },
  };
  return map[value] || { background: "var(--surface)", color: "rgba(148,163,184,0.5)", boxShadow: "none" };
}

function formatWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("en-AU", { month: "short" });
  return `${day} ${month}`;
}

export function MemberHeatMap({
  reflections,
  mondayStrings,
}: {
  reflections: Reflection[];
  mondayStrings: string[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const reflectionMap = new Map(reflections.map((r) => [r.week_of, r]));
  const sortedWeeks = [...mondayStrings].reverse();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-sm font-semibold text-[var(--text-secondary)] pb-3 pr-4 min-w-[120px]">
              Question
            </th>
            {sortedWeeks.map((week) => (
              <th key={week} className="text-center text-xs font-medium text-[var(--text-secondary)] pb-3 px-2 min-w-[72px]">
                {formatWeekLabel(week)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RATING_QUESTIONS.map((q, qi) => (
            <tr key={q.key}>
              <td className="text-sm font-semibold text-[var(--text-primary)] py-2 pr-4">
                {q.label}
              </td>
              {sortedWeeks.map((week, ci) => {
                const reflection = reflectionMap.get(week);
                const value = reflection ? (reflection[q.key] as number) : null;
                const style = cellStyle(value);
                const delay = qi * 80 + ci * 60;

                return (
                  <td key={week} className="py-2 px-2">
                    <div
                      className="w-full h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500"
                      style={{
                        background: style.background,
                        color: style.color,
                        boxShadow: style.boxShadow,
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "scale(1)" : "scale(0.85)",
                        transitionDelay: `${delay}ms`,
                      }}
                    >
                      {value !== null ? value : "-"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
