"use client";

import { RATING_QUESTIONS } from "@/lib/reflection-questions";
import { toISODate } from "@/lib/dates";

interface Reflection {
  week_of: string;
  energy_rating: number;
  motivation_rating: number;
  support_rating: number;
  overall_rating: number;
  [key: string]: unknown;
}

const SCORE_COLORS = [
  { from: "#4F6EF7", to: "#818CF8", glow: "#4F6EF7" },
  { from: "#8B5CF6", to: "#A78BFA", glow: "#8B5CF6" },
  { from: "#FBBF24", to: "#F59E0B", glow: "#FBBF24" },
  { from: "#06D6A0", to: "#34D399", glow: "#06D6A0" },
];

function cellStyle(value: number | null, qi: number) {
  if (value === null) return { bg: "bg-[var(--surface)]", text: "text-[var(--text-secondary)]", shadow: "none" };
  const color = SCORE_COLORS[qi];
  const intensity = value / 5;
  return {
    bg: "",
    text: "",
    shadow: `0 0 ${4 + intensity * 8}px ${color.glow}${Math.round(intensity * 40).toString(16).padStart(2, "0")}`,
    gradient: `linear-gradient(135deg, ${color.from}${Math.round(intensity * 35 + 10).toString(16).padStart(2, "0")}, ${color.to}${Math.round(intensity * 35 + 10).toString(16).padStart(2, "0")})`,
    textColor: value <= 2 ? "var(--soft-red)" : value <= 3 ? "var(--amber)" : color.from,
  };
}

export function HeatMap({
  reflections,
  mondays,
}: {
  reflections: Reflection[];
  mondays: Date[];
}) {
  const reflectionMap = new Map(
    reflections.map((r) => [r.week_of, r])
  );
  const sortedMondays = [...mondays].reverse();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4 min-w-[100px]">
              Metric
            </th>
            {sortedMondays.map((monday) => {
              const dateStr = toISODate(monday);
              const day = monday.getDate().toString().padStart(2, "0");
              const month = monday.toLocaleDateString("en-AU", { month: "short" });
              return (
                <th key={dateStr} className="text-center text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 px-1.5 min-w-[64px]">
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
                      background: `linear-gradient(135deg, ${SCORE_COLORS[qi].from}, ${SCORE_COLORS[qi].to})`,
                      boxShadow: `0 0 6px ${SCORE_COLORS[qi].glow}33`,
                    }}
                  />
                  {q.label}
                </div>
              </td>
              {sortedMondays.map((monday) => {
                const dateStr = toISODate(monday);
                const reflection = reflectionMap.get(dateStr);
                const value = reflection ? (reflection[q.key] as number) : null;
                const style = cellStyle(value, qi);

                return (
                  <td key={dateStr} className="py-1.5 px-1.5">
                    {value !== null ? (
                      <div
                        className="w-full h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
                        style={{
                          background: style.gradient,
                          boxShadow: style.shadow,
                          color: style.textColor,
                        }}
                      >
                        {value}
                      </div>
                    ) : (
                      <div className="w-full h-11 rounded-xl flex items-center justify-center text-sm text-[var(--text-secondary)]/40 bg-[var(--surface)]">
                        -
                      </div>
                    )}
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
