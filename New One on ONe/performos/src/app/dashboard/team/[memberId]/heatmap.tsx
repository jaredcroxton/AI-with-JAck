"use client";

import { RATING_QUESTIONS } from "@/lib/reflection-questions";
import { toISODate } from "@/lib/dates";

interface Reflection {
  week_of: string;
  [key: string]: unknown;
}

function ratingBg(value: number | null): string {
  if (value === null) return "bg-gray-50";
  const map: Record<number, string> = {
    1: "bg-[var(--soft-red)]/15",
    2: "bg-[var(--amber)]/15",
    3: "bg-yellow-400/15",
    4: "bg-emerald-400/15",
    5: "bg-emerald-500/20",
  };
  return map[value] || "bg-gray-50";
}

function ratingText(value: number | null): string {
  if (value === null) return "text-gray-300";
  const map: Record<number, string> = {
    1: "text-[var(--soft-red)]",
    2: "text-amber-600",
    3: "text-amber-600",
    4: "text-emerald-600",
    5: "text-emerald-700",
  };
  return map[value] || "text-gray-400";
}

export function MemberHeatMap({
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
            <th className="text-left text-sm font-medium text-[var(--text-secondary)] pb-3 pr-4 min-w-[120px]">
              Question
            </th>
            {sortedMondays.map((monday) => {
              const dateStr = toISODate(monday);
              const day = monday.getDate().toString().padStart(2, "0");
              const month = monday.toLocaleDateString("en-AU", {
                month: "short",
              });
              return (
                <th
                  key={dateStr}
                  className="text-center text-xs font-medium text-[var(--text-secondary)] pb-3 px-2 min-w-[72px]"
                >
                  {day} {month}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {RATING_QUESTIONS.map((q) => (
            <tr key={q.key}>
              <td className="text-sm font-medium text-[var(--text-on-light)] py-2 pr-4">
                {q.label}
              </td>
              {sortedMondays.map((monday) => {
                const dateStr = toISODate(monday);
                const reflection = reflectionMap.get(dateStr);
                const value = reflection
                  ? (reflection[q.key] as number)
                  : null;
                return (
                  <td key={dateStr} className="py-2 px-2">
                    <div
                      className={`w-full h-12 rounded-xl flex items-center justify-center text-sm font-semibold ${ratingBg(value)} ${ratingText(value)}`}
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
