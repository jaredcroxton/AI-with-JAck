"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";

const SCORE_GRADIENTS = [
  { from: "#4F6EF7", to: "#818CF8", glow: "#4F6EF733" },
  { from: "#8B5CF6", to: "#A78BFA", glow: "#8B5CF633" },
  { from: "#FBBF24", to: "#F59E0B", glow: "#FBBF2433" },
  { from: "#06D6A0", to: "#34D399", glow: "#06D6A033" },
];

// Mini sparkline for member cards
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;

  const w = 56;
  const h = 22;
  const pad = 2;
  const step = (w - pad * 2) / (values.length - 1);

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = values.map((v, i) => ({
    x: pad + i * step,
    y: pad + (h - pad * 2) - ((v - minVal) / range) * (h - pad * 2),
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = path + ` L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

  return (
    <svg width={w} height={h} className="shrink-0">
      <defs>
        <linearGradient id={`spark-fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-fill-${color.replace("#", "")})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2.5}
        fill="white"
        stroke={color}
        strokeWidth={1.5}
      />
    </svg>
  );
}

interface MemberGridData {
  id: string;
  full_name: string;
  email: string;
  latestReflection: Record<string, unknown> | null;
  flagCount: number;
  totalReflections: number;
  sparkline: number[];
}

export function TeamGridClient({ memberData }: { memberData: MemberGridData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (memberData.length === 0) {
    return (
      <div
        className={`bg-[var(--surface-raised)] rounded-2xl p-12 text-center shadow-[var(--card-shadow)] border border-[var(--border)] transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="w-16 h-16 rounded-2xl gradient-bg opacity-20 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          No team members yet
        </h2>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          Team members will appear here once they sign up and are assigned to you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {memberData.map((member, mi) => {
        const initials = member.full_name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        const hasConcern = member.flagCount > 0;

        return (
          <Link
            key={member.id}
            href={`/dashboard/team/${member.id}`}
            className={`bg-[var(--surface-raised)] rounded-2xl shadow-[var(--card-shadow)] border hover:shadow-[var(--card-shadow-xl)] transition-all duration-300 group ${
              hasConcern
                ? "border-[var(--soft-red)]/20 hover:border-[var(--soft-red)]/40"
                : "border-[var(--border)] hover:border-[var(--accent-blue)]/30"
            } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: `${mi * 100}ms` }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #4F6EF7 0%, #06D6A0 60%, #34D399 100%)",
                    boxShadow: "0 2px 10px rgba(79, 110, 247, 0.25)",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                    {member.full_name}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {member.totalReflections} of 6 reflections
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Sparkline */}
                {member.sparkline.length >= 2 && (
                  <Sparkline
                    values={member.sparkline}
                    color={hasConcern ? "#EF4444" : "#06D6A0"}
                  />
                )}
                {/* Status badge with LED glow */}
                {hasConcern ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--soft-red)]/8 text-[var(--soft-red)]">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[var(--soft-red)]"
                      style={{
                        boxShadow: "0 0 6px rgba(239, 68, 68, 0.5)",
                        animation: "pulse-glow 3s ease-in-out infinite",
                      }}
                    />
                    {member.flagCount} {member.flagCount === 1 ? "flag" : "flags"}
                  </span>
                ) : member.latestReflection ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/8 text-emerald-600">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                      style={{ boxShadow: "0 0 6px rgba(16, 185, 129, 0.5)" }}
                    />
                    Submitted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--amber)]/8 text-[var(--amber)]">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]"
                      style={{ boxShadow: "0 0 4px rgba(251, 191, 36, 0.4)" }}
                    />
                    Pending
                  </span>
                )}
              </div>
            </div>

            {/* Score bars with gradient fills */}
            <div className="px-5 pb-4">
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
                          <span
                            className="text-xs font-bold"
                            style={{ color: grad.from }}
                          >
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
                              transitionDelay: `${mi * 100 + qi * 60 + 200}ms`,
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

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[var(--border-light)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">
                {member.latestReflection ? "Latest submitted" : "Awaiting reflection"}
              </span>
              <span className="text-xs font-semibold text-[var(--accent-blue)] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 flex items-center gap-1">
                View details
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
