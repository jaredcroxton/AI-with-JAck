"use client";

import { useEffect, useState } from "react";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";

const SCORE_COLORS = [
  { from: "#4F6EF7", glow: "#4F6EF7" },
  { from: "#8B5CF6", glow: "#8B5CF6" },
  { from: "#FBBF24", glow: "#FBBF24" },
  { from: "#06D6A0", glow: "#06D6A0" },
];

interface WeeklyAverage {
  week: string;
  energy_rating: number;
  motivation_rating: number;
  support_rating: number;
  overall_rating: number;
}


function cellStyle(value: number | null) {
  if (value === null) {
    return { background: "var(--surface)", color: "rgba(148,163,184,0.5)", boxShadow: "none" };
  }
  if (value <= 2) {
    return {
      background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.18))",
      color: "#EF4444",
      boxShadow: "inset 0 0 12px rgba(239,68,68,0.15)",
    };
  }
  if (value <= 3) {
    return {
      background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.18))",
      color: "#D97706",
      boxShadow: "inset 0 0 10px rgba(251,191,36,0.12)",
    };
  }
  return {
    background: "linear-gradient(135deg, rgba(6,214,160,0.12), rgba(52,211,153,0.18))",
    color: "#059669",
    boxShadow: "inset 0 0 12px rgba(6,214,160,0.15)",
  };
}

export function ExecHeatMap({
  weeklyAverages,
  mondayDates,
}: {
  weeklyAverages: (WeeklyAverage | null)[];
  mondayDates: string[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4 min-w-[100px]">
              Metric
            </th>
            {mondayDates.map((week) => {
              const d = new Date(week + "T00:00:00");
              const day = d.getDate().toString().padStart(2, "0");
              const month = d.toLocaleDateString("en-AU", { month: "short" });
              return (
                <th key={week} className="text-center text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 px-1.5 min-w-[64px]">
                  {day} {month}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {RATING_QUESTIONS.map((q, qi) => (
            <tr key={q.key}>
              <td className="text-sm font-semibold text-[var(--text-primary)] py-1.5 pr-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${SCORE_COLORS[qi].from}, ${SCORE_COLORS[qi].glow})`,
                      boxShadow: `0 0 6px ${SCORE_COLORS[qi].glow}33`,
                    }}
                  />
                  {q.label}
                </div>
              </td>
              {weeklyAverages.map((avg, ci) => {
                const value = avg ? (avg[q.key as keyof Omit<WeeklyAverage, "week">] as number) : null;
                const style = cellStyle(value);
                const delay = qi * 80 + ci * 60;

                return (
                  <td key={mondayDates[ci]} className="py-1.5 px-1.5">
                    <div
                      className="w-full h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500"
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
