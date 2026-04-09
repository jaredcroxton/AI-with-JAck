"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RATING_QUESTIONS, REFLECTION_QUESTIONS } from "@/lib/reflection-questions";
import { formatDate } from "@/lib/dates";
import { MemberHeatMap } from "./heatmap";
import { MemberBarChart } from "./bar-chart";
import { AISummary } from "./ai-summary";

const SCORE_GRADIENTS: Record<number, { from: string; to: string; glow: string }> = {
  0: { from: "#4F6EF7", to: "#818CF8", glow: "#4F6EF733" },
  1: { from: "#8B5CF6", to: "#A78BFA", glow: "#8B5CF633" },
  2: { from: "#FBBF24", to: "#F59E0B", glow: "#FBBF2433" },
  3: { from: "#06D6A0", to: "#34D399", glow: "#06D6A033" },
};

interface MemberDetailProps {
  member: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    manager_id: string;
  };
  reflections: Record<string, unknown>[];
  activeFlags: Record<string, unknown>[];
  openActions: Record<string, unknown>[];
  mondayStrings: string[];
}

export function MemberDetailClient({
  member,
  reflections,
  activeFlags,
  openActions,
  mondayStrings,
}: MemberDetailProps) {
  // Reconstruct Date objects from ISO strings
  const mondays = mondayStrings.map((s) => new Date(s + "T00:00:00"));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = member.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Back + header with slide-in animation */}
      <div
        className={`transition-all duration-600 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
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
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Back to dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: "linear-gradient(135deg, #4F6EF7 0%, #06D6A0 60%, #34D399 100%)",
              boxShadow: "0 4px 16px rgba(79, 110, 247, 0.25)",
            }}
          >
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {member.full_name}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              {member.email}
            </p>
          </div>
        </div>
      </div>

      {/* Risk flags with breathing pulse animation */}
      {activeFlags.length > 0 && (
        <div
          className={`rounded-2xl p-6 border transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: "150ms",
            background: "linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(251,191,36,0.04) 100%)",
            borderColor: "rgba(239,68,68,0.15)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <h2 className="text-sm font-bold text-[var(--soft-red)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full bg-[var(--soft-red)]"
              style={{
                boxShadow: "0 0 8px rgba(239,68,68,0.4)",
                animation: "pulse-glow 3s ease-in-out infinite",
              }}
            />
            Active risk flags
          </h2>
          <div className="space-y-3">
            {activeFlags.map((flag: Record<string, unknown>, fi: number) => (
              <div
                key={flag.id as string}
                className={`flex items-start gap-3 bg-white rounded-xl p-4 border transition-all duration-500 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}
                style={{
                  transitionDelay: `${200 + fi * 80}ms`,
                  borderColor:
                    flag.severity === "high_risk"
                      ? "rgba(239,68,68,0.15)"
                      : "rgba(251,191,36,0.15)",
                  boxShadow:
                    flag.severity === "high_risk"
                      ? "0 0 16px rgba(239,68,68,0.06)"
                      : "0 0 12px rgba(251,191,36,0.06)",
                  animation:
                    flag.severity === "high_risk"
                      ? "pulse-glow 4s ease-in-out infinite"
                      : undefined,
                }}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    flag.severity === "high_risk"
                      ? "bg-[var(--soft-red)]"
                      : "bg-[var(--amber)]"
                  }`}
                  style={{
                    boxShadow:
                      flag.severity === "high_risk"
                        ? "0 0 8px rgba(239,68,68,0.4)"
                        : "0 0 6px rgba(251,191,36,0.4)",
                  }}
                />
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                    {(flag.flag_type as string).replace(/_/g, " ")}
                    <span
                      className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          flag.severity === "high_risk"
                            ? "rgba(239,68,68,0.08)"
                            : "rgba(251,191,36,0.08)",
                        color:
                          flag.severity === "high_risk"
                            ? "var(--soft-red)"
                            : "var(--amber)",
                      }}
                    >
                      {(flag.severity as string).replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {flag.evidence as string}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI coaching summary */}
      {reflections.length > 0 && (
        <div
          className={`transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "250ms" }}
        >
          <AISummary
            memberName={member.full_name}
            memberId={member.id}
            reflections={reflections}
          />
        </div>
      )}

      {reflections.length === 0 ? (
        <div
          className={`bg-white rounded-2xl p-12 text-center shadow-[var(--card-shadow)] border border-[var(--border)] transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            No reflections yet
          </h2>
          <p className="text-[var(--text-secondary)]">
            {member.full_name} has not submitted any reflections in the last six
            weeks.
          </p>
        </div>
      ) : (
        <>
          {/* Heatmap */}
          <div
            className={`bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              Six-week heatmap
            </h2>
            <MemberHeatMap reflections={reflections} mondays={mondays} />
          </div>

          {/* Bar charts */}
          <div
            className={`bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              Trends
            </h2>
            <MemberBarChart reflections={reflections} mondays={mondays} />
          </div>

          {/* Weekly detail cards with stagger */}
          <div>
            <h2
              className={`text-lg font-bold text-[var(--text-primary)] mb-4 transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              Weekly reflections
            </h2>
            <div className="space-y-4">
              {reflections.map((r: Record<string, unknown>, ri: number) => (
                <div
                  key={r.id as string}
                  className={`bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-all duration-500 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${550 + ri * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Week of{" "}
                      {formatDate(new Date((r.week_of as string) + "T00:00:00"))}
                    </h3>
                    <div className="flex items-center gap-2">
                      {RATING_QUESTIONS.map((q, qi) => {
                        const val = r[q.key] as number;
                        const grad = SCORE_GRADIENTS[qi] || SCORE_GRADIENTS[0];
                        return (
                          <div
                            key={q.key}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                            title={q.label}
                            style={{
                              background: `linear-gradient(90deg, ${grad.from}, ${grad.to})`,
                              boxShadow: `0 1px 6px ${grad.glow}`,
                            }}
                          >
                            {q.label} {val}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Text responses */}
                  <div className="space-y-3">
                    {REFLECTION_QUESTIONS.map((q) => {
                      const commentKey = q.commentKey;
                      const comment = r[commentKey] as string | null;
                      const mainText =
                        q.type === "text"
                          ? (r[q.key] as string | null)
                          : null;

                      if (!comment && !mainText) return null;

                      return (
                        <div
                          key={q.key}
                          className="pl-4 border-l-2 border-[var(--border)]"
                        >
                          <div className="text-xs font-semibold text-[var(--text-secondary)] mb-0.5">
                            {q.label}
                          </div>
                          {mainText && (
                            <p className="text-sm text-[var(--text-primary)]">
                              {mainText}
                            </p>
                          )}
                          {comment && (
                            <p className="text-sm text-[var(--text-secondary)]">
                              {comment}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {(r.notes as string | null) && (
                      <div
                        className="pl-4 border-l-2"
                        style={{ borderColor: "rgba(6, 214, 160, 0.3)" }}
                      >
                        <div className="text-xs font-semibold text-[var(--accent-teal)] mb-0.5">
                          Additional notes
                        </div>
                        <p className="text-sm text-[var(--text-primary)]">
                          {r.notes as string}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Open action items */}
      {openActions.length > 0 && (
        <div
          className={`bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: `${550 + reflections.length * 100 + 100}ms` }}
        >
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Open action items
          </h2>
          <div className="space-y-2">
            {openActions.map((item: Record<string, unknown>, ai: number) => (
              <div
                key={item.id as string}
                className={`flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:shadow-[var(--card-shadow)] transition-all duration-300 ${
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[-8px]"
                }`}
                style={{ transitionDelay: `${600 + reflections.length * 100 + ai * 60}ms` }}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    item.status === "in_progress"
                      ? "bg-[var(--accent-blue)]"
                      : "bg-gray-300"
                  }`}
                  style={{
                    boxShadow:
                      item.status === "in_progress"
                        ? "0 0 6px rgba(79, 110, 247, 0.4)"
                        : "none",
                  }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {item.title as string}
                  </div>
                  {item.due_date && (
                    <div className="text-xs text-[var(--text-secondary)]">
                      Due{" "}
                      {formatDate(
                        new Date((item.due_date as string) + "T00:00:00")
                      )}
                    </div>
                  )}
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background:
                      item.status === "in_progress"
                        ? "rgba(79, 110, 247, 0.08)"
                        : "rgba(100, 116, 139, 0.08)",
                    color:
                      item.status === "in_progress"
                        ? "var(--accent-blue)"
                        : "var(--text-secondary)",
                  }}
                >
                  {(item.status as string).replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
