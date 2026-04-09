"use client";

import { useEffect, useState } from "react";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";

const SCORE_GRADIENTS = [
  { from: "#4F6EF7", to: "#818CF8", glow: "#4F6EF733" },
  { from: "#8B5CF6", to: "#A78BFA", glow: "#8B5CF633" },
  { from: "#FBBF24", to: "#F59E0B", glow: "#FBBF2433" },
  { from: "#06D6A0", to: "#34D399", glow: "#06D6A033" },
];

interface MemberData {
  id: string;
  full_name: string;
  latestReflection: Record<string, unknown> | null;
  flagCount: number;
  hasCurrentWeek: boolean;
}

export function ExecMemberCards({
  memberData,
}: {
  memberData: MemberData[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {memberData.map((member, mi) => {
        const initials = member.full_name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        const hasConcern = member.flagCount > 0;

        return (
          <div
            key={member.id}
            className={`bg-[var(--surface-raised)] rounded-2xl shadow-[var(--card-shadow)] border transition-all duration-500 ${
              hasConcern
                ? "border-[var(--soft-red)]/20"
                : "border-[var(--border)]"
            }`}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transitionDelay: `${mi * 100}ms`,
            }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_8px_rgba(79,110,247,0.2)]">
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {member.full_name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasConcern ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--soft-red)]/8 text-[var(--soft-red)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--soft-red)] animate-pulse" />
                    {member.flagCount} {member.flagCount === 1 ? "flag" : "flags"}
                  </span>
                ) : member.hasCurrentWeek ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/8 text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 6px rgba(16,185,129,0.4)" }} />
                    Submitted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--amber)]/8 text-[var(--amber)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
                    Pending
                  </span>
                )}
              </div>
            </div>

            {/* Score bars - scores only, no text */}
            <div className="px-5 pb-5">
              {member.latestReflection ? (
                <div className="flex items-center gap-3">
                  {RATING_QUESTIONS.map((q, qi) => {
                    const val = member.latestReflection![q.key] as number;
                    const grad = SCORE_GRADIENTS[qi];
                    return (
                      <div key={q.key} className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">
                            {q.label}
                          </span>
                          <span className="text-xs font-bold" style={{ color: grad.from }}>
                            {val}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: mounted ? `${(val / 5) * 100}%` : "0%",
                              background: `linear-gradient(90deg, ${grad.from}, ${grad.to})`,
                              boxShadow: `0 0 8px ${grad.glow}`,
                              transition: "width 0.8s ease-out",
                              transitionDelay: `${mi * 100 + qi * 80 + 200}ms`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-[var(--text-secondary)] bg-[var(--surface)] rounded-xl">
                  No reflections yet
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
