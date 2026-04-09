"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";

// Animated counter hook
function useCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// Arc gauge for metric cards
function ArcGauge({
  value,
  max,
  color,
  glowColor,
  size = 56,
}: {
  value: number;
  max: number;
  color: string;
  glowColor: string;
  size?: number;
}) {
  const pct = max > 0 ? value / max : 0;
  const r = (size - 8) / 2;
  const circumference = Math.PI * r; // half circle
  const offset = circumference - pct * circumference;

  return (
    <svg width={size} height={size / 2 + 4} viewBox={`0 0 ${size} ${size / 2 + 4}`}>
      <path
        d={`M 4 ${size / 2} A ${r} ${r} 0 0 1 ${size - 4} ${size / 2}`}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d={`M 4 ${size / 2} A ${r} ${r} 0 0 1 ${size - 4} ${size / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          filter: `drop-shadow(0 0 6px ${glowColor})`,
          transition: "stroke-dashoffset 1s ease-out",
        }}
      />
    </svg>
  );
}

// Mini sparkline for team member cards
function Sparkline({ values, color }: { values: (number | null)[]; color: string }) {
  const filtered = values.filter((v): v is number => v !== null);
  if (filtered.length < 2) return null;

  const w = 60;
  const h = 24;
  const padding = 2;
  const step = (w - padding * 2) / (filtered.length - 1);

  const points = filtered.map((v, i) => ({
    x: padding + i * step,
    y: padding + (h - padding * 2) - ((v - 1) / 4) * (h - padding * 2),
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Trend: up, down, or flat
  const trend = filtered[filtered.length - 1] - filtered[filtered.length - 2];

  return (
    <div className="flex items-center gap-1.5">
      <svg width={w} height={h} className="shrink-0">
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={path + ` L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`}
          fill={`url(#spark-${color})`}
        />
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
      {trend !== 0 && (
        <span className={`text-[10px] font-bold ${trend > 0 ? "text-emerald-500" : "text-[var(--soft-red)]"}`}>
          {trend > 0 ? "+" : ""}{trend}
        </span>
      )}
    </div>
  );
}

const SCORE_GRADIENTS = [
  { from: "#4F6EF7", to: "#818CF8" },   // Confidence: blue to indigo
  { from: "#8B5CF6", to: "#A78BFA" },   // Motivation: purple shimmer
  { from: "#FBBF24", to: "#F59E0B" },   // Support: amber to gold
  { from: "#06D6A0", to: "#34D399" },   // Overall: teal to emerald
];

interface MemberData {
  id: string;
  full_name: string;
  email: string;
  latestReflection: Record<string, unknown> | undefined;
  flagCount: number;
  hasCurrentWeek: boolean;
  sparkline: (number | null)[];
}

export function DashboardClient({
  managerName,
  teamSize,
  completionRate,
  currentWeekSubmissions,
  openActions,
  flaggedCount,
  memberData,
}: {
  managerName: string;
  teamSize: number;
  completionRate: number;
  currentWeekSubmissions: number;
  openActions: number;
  flaggedCount: number;
  memberData: MemberData[];
}) {
  const animatedCompletion = useCounter(completionRate, 1200);
  const animatedTeam = useCounter(teamSize, 600);
  const animatedActions = useCounter(openActions, 600);
  const animatedFlags = useCounter(flaggedCount, 600);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div
        className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      >
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Welcome back, {managerName.split(" ")[0]}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Here is how your team is tracking this week.
        </p>
      </div>

      {/* Metric cards with arc gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Team members */}
        <div
          className={`bg-[var(--surface-raised)] rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Team members
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {animatedTeam}
          </div>
        </div>

        {/* Completion rate with arc gauge */}
        <div
          className={`bg-[var(--surface-raised)] rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-all duration-300 ${completionRate === 100 ? "ring-2 ring-[var(--accent-teal)]/30" : ""} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="flex items-start justify-between mb-1">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Completion
            </span>
            {completionRate === 100 && (
              <span className="text-[10px] font-bold text-[var(--accent-teal)] bg-[var(--accent-teal)]/10 px-2 py-0.5 rounded-full">
                Full team
              </span>
            )}
          </div>
          <div className="flex items-end gap-3">
            <span
              className={`text-3xl font-extrabold ${completionRate >= 80 ? "text-[var(--accent-teal)]" : completionRate >= 50 ? "text-[var(--amber)]" : "text-[var(--soft-red)]"}`}
            >
              {animatedCompletion}%
            </span>
            <ArcGauge
              value={currentWeekSubmissions}
              max={teamSize}
              color={completionRate >= 80 ? "#06D6A0" : completionRate >= 50 ? "#FBBF24" : "#EF4444"}
              glowColor={completionRate >= 80 ? "rgba(6,214,160,0.3)" : completionRate >= 50 ? "rgba(251,191,36,0.3)" : "rgba(239,68,68,0.3)"}
            />
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {currentWeekSubmissions} of {teamSize} this week
          </div>
        </div>

        {/* Open actions */}
        <div
          className={`bg-[var(--surface-raised)] rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Open actions
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-[var(--amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            {animatedActions}
          </div>
        </div>

        {/* Flagged members with breathing pulse when > 0 */}
        <div
          className={`bg-[var(--surface-raised)] rounded-2xl p-5 shadow-[var(--card-shadow)] border transition-all duration-300 ${
            flaggedCount > 0
              ? "border-[var(--soft-red)]/30 shadow-[0_0_20px_rgba(239,68,68,0.08)] animate-[pulse-glow_3s_ease-in-out_infinite]"
              : "border-[var(--border)] hover:shadow-[var(--card-shadow-lg)]"
          } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Flagged
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${flaggedCount > 0 ? "bg-gradient-to-br from-red-100 to-rose-100" : "bg-gradient-to-br from-emerald-100 to-teal-100"}`}>
              {flaggedCount > 0 ? (
                <svg className="w-4.5 h-4.5 text-[var(--soft-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              )}
            </div>
          </div>
          <div className={`text-3xl font-extrabold ${flaggedCount > 0 ? "text-[var(--soft-red)]" : "text-emerald-500"}`}>
            {animatedFlags}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {flaggedCount === 0 ? "All clear" : "Needs attention"}
          </div>
        </div>
      </div>

      {/* Team member cards */}
      {teamSize === 0 ? (
        <div className="bg-[var(--surface-raised)] rounded-2xl p-12 text-center shadow-[var(--card-shadow)] border border-[var(--border)]">
          <div className="w-16 h-16 rounded-2xl gradient-bg opacity-20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            No team members yet
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Team members will appear here once they sign up and are assigned to you.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Team overview
            </h2>
          </div>

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
                  className={`bg-[var(--surface-raised)] rounded-2xl shadow-[var(--card-shadow)] border hover:shadow-[var(--card-shadow-lg)] transition-all duration-300 group ${
                    hasConcern
                      ? "border-[var(--soft-red)]/20 hover:border-[var(--soft-red)]/40"
                      : "border-[var(--border)] hover:border-[var(--accent-blue)]/30"
                  } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${500 + mi * 100}ms` }}
                >
                  {/* Header */}
                  <div className="px-5 pt-5 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_8px_rgba(79,110,247,0.2)]">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                          {member.full_name}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Sparkline showing trend */}
                      <Sparkline
                        values={member.sparkline}
                        color={hasConcern ? "#EF4444" : "#06D6A0"}
                      />
                      {/* Status */}
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
                              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(val / 5) * 100}%`,
                                    background: `linear-gradient(90deg, ${grad.from}, ${grad.to})`,
                                    boxShadow: `0 0 8px ${grad.from}33`,
                                    transition: "width 0.8s ease-out",
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
                      {member.hasCurrentWeek ? "This week complete" : "Awaiting reflection"}
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
        </div>
      )}
    </div>
  );
}
