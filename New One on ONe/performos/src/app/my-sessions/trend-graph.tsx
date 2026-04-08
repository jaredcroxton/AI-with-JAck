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

const COLORS = [
  { bar: "#3B82F6", bg: "bg-blue-50", light: "#DBEAFE" },
  { bar: "#8B5CF6", bg: "bg-purple-50", light: "#EDE9FE" },
  { bar: "#F59E0B", bg: "bg-amber-50", light: "#FEF3C7" },
  { bar: "#10B981", bg: "bg-emerald-50", light: "#D1FAE5" },
];

function BarChart({
  values,
  color,
}: {
  values: (number | null)[];
  color: { bar: string; light: string };
}) {
  return (
    <div className="flex items-end gap-3 justify-between h-24">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          {v !== null && (
            <span
              className="text-xs font-bold"
              style={{ color: color.bar }}
            >
              {v}
            </span>
          )}
          <div className="w-full relative" style={{ height: "64px" }}>
            <div
              className="absolute bottom-0 w-full rounded-lg transition-all"
              style={{
                height: v !== null ? `${(v / 5) * 100}%` : "0%",
                backgroundColor: v !== null ? color.bar : color.light,
                opacity: v !== null ? 1 : 0.3,
                minHeight: v !== null ? "8px" : "4px",
              }}
            />
            {v === null && (
              <div
                className="absolute bottom-0 w-full rounded-lg"
                style={{
                  height: "4px",
                  backgroundColor: color.light,
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendBadge({ values }: { values: (number | null)[] }) {
  const nonNull = values.filter((v): v is number => v !== null);
  if (nonNull.length < 2) return null;

  const recent = nonNull[nonNull.length - 1];
  const previous = nonNull[nonNull.length - 2];
  const diff = recent - previous;

  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-[var(--text-secondary)]">
        Steady
      </span>
    );
  }

  const isUp = diff > 0;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        isUp
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
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

export function TrendGraph({
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
    <div className="space-y-4">
      {RATING_QUESTIONS.map((q, qi) => {
        const values = sortedMondays.map((monday) => {
          const r = reflectionMap.get(toISODate(monday));
          return r ? (r[q.key] as number) : null;
        });

        const latestValue = [...values].reverse().find((v) => v !== null);

        return (
          <div
            key={q.key}
            className={`rounded-2xl p-5 ${COLORS[qi].bg} border border-gray-100/50`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[qi].bar }}
                />
                <span className="text-sm font-semibold text-[var(--text-on-light)]">
                  {q.label}
                </span>
                <TrendBadge values={values} />
              </div>
              {latestValue !== null && (
                <span
                  className="text-2xl font-bold"
                  style={{ color: COLORS[qi].bar }}
                >
                  {latestValue}
                </span>
              )}
            </div>

            <BarChart values={values} color={COLORS[qi]} />

            {/* Week labels directly under each bar */}
            <div className="flex gap-3 justify-between mt-2">
              {sortedMondays.map((monday) => {
                const day = monday.getDate().toString().padStart(2, "0");
                const month = monday.toLocaleDateString("en-AU", {
                  month: "short",
                });
                return (
                  <span
                    key={toISODate(monday)}
                    className="flex-1 text-center text-[10px] text-[var(--text-secondary)]"
                  >
                    {day} {month}
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
