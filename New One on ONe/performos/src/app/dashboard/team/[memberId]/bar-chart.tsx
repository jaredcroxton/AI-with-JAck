"use client";

import { useEffect, useState } from "react";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";

interface Reflection {
  week_of: string;
  [key: string]: unknown;
}

const COLORS = [
  { from: "#4F6EF7", to: "#818CF8", glow: "#4F6EF733", bg: "bg-blue-50" },
  { from: "#8B5CF6", to: "#A78BFA", glow: "#8B5CF633", bg: "bg-purple-50" },
  { from: "#FBBF24", to: "#F59E0B", glow: "#FBBF2433", bg: "bg-amber-50" },
  { from: "#06D6A0", to: "#34D399", glow: "#06D6A033", bg: "bg-emerald-50" },
];

function TrendBadge({ values }: { values: (number | null)[] }) {
  const nonNull = values.filter((v): v is number => v !== null);
  if (nonNull.length < 2) return null;

  const recent = nonNull[nonNull.length - 1];
  const previous = nonNull[nonNull.length - 2];
  const diff = recent - previous;

  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-[var(--text-secondary)]"
        style={{ background: "rgba(100, 116, 139, 0.08)" }}
      >
        Steady
      </span>
    );
  }

  const isUp = diff > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isUp ? "text-emerald-700" : "text-amber-700"
      }`}
      style={{
        background: isUp ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
        boxShadow: isUp
          ? "0 0 10px rgba(16, 185, 129, 0.15)"
          : "0 0 10px rgba(245, 158, 11, 0.15)",
      }}
    >
      {isUp ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      )}
      {isUp ? "+" : ""}
      {diff} from last week
    </span>
  );
}

function formatWeekLabel(dateStr: string): { day: string; month: string } {
  const d = new Date(dateStr + "T12:00:00");
  return {
    day: d.getDate().toString().padStart(2, "0"),
    month: d.toLocaleDateString("en-AU", { month: "short" }),
  };
}

export function MemberBarChart({
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

  const reflectionMap = new Map(
    reflections.map((r) => [r.week_of, r])
  );
  const sortedWeeks = [...mondayStrings].reverse();

  return (
    <div className="space-y-4">
      {RATING_QUESTIONS.map((q, qi) => {
        const values = sortedWeeks.map((week) => {
          const r = reflectionMap.get(week);
          return r ? (r[q.key] as number) : null;
        });

        const latestValue = [...values].reverse().find((v) => v !== null);
        const grad = COLORS[qi];

        return (
          <div
            key={q.key}
            className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--surface-raised)] transition-all duration-500"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transitionDelay: `${qi * 120}ms`,
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                    boxShadow: `0 0 8px ${grad.glow}`,
                  }}
                />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {q.label}
                </span>
                <TrendBadge values={values} />
              </div>
              {latestValue !== null && latestValue !== undefined && (
                <span
                  className="text-2xl font-extrabold"
                  style={{
                    background: `linear-gradient(90deg, ${grad.from}, ${grad.to})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {latestValue}
                </span>
              )}
            </div>
            <div className="flex items-end gap-3 justify-between h-24">
              {values.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  {v !== null && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: grad.from }}
                    >
                      {v}
                    </span>
                  )}
                  <div className="w-full relative" style={{ height: "64px" }}>
                    <div
                      className="absolute bottom-0 w-full rounded-lg"
                      style={{
                        height: mounted && v !== null ? `${(v / 5) * 100}%` : "0%",
                        background:
                          v !== null
                            ? `linear-gradient(180deg, ${grad.from}, ${grad.to})`
                            : `${grad.from}15`,
                        boxShadow:
                          v !== null
                            ? `0 0 12px ${grad.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`
                            : "none",
                        opacity: v !== null ? 1 : 0.3,
                        minHeight: v !== null && mounted ? "8px" : "4px",
                        transition: "height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transitionDelay: `${qi * 120 + i * 80 + 200}ms`,
                      }}
                    />
                    {v === null && (
                      <div
                        className="absolute bottom-0 w-full rounded-lg"
                        style={{
                          height: "4px",
                          background: `${grad.from}15`,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-between mt-2">
              {sortedWeeks.map((week) => {
                const label = formatWeekLabel(week);
                return (
                  <span
                    key={week}
                    className="flex-1 text-center text-[10px] text-[var(--text-secondary)] font-medium"
                  >
                    {label.day} {label.month}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
