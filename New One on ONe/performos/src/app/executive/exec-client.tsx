"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

function ArcGauge({ value, max, color, glowColor }: { value: number; max: number; color: string; glowColor: string }) {
  const pct = max > 0 ? value / max : 0;
  const r = 24;
  const circumference = Math.PI * r;
  const offset = circumference - pct * circumference;
  return (
    <svg width={56} height={32} viewBox="0 0 56 32">
      <path d={`M 4 28 A ${r} ${r} 0 0 1 52 28`} fill="none" stroke="#E2E8F0" strokeWidth={5} strokeLinecap="round" />
      <path d={`M 4 28 A ${r} ${r} 0 0 1 52 28`} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ filter: `drop-shadow(0 0 6px ${glowColor})`, transition: "stroke-dashoffset 1s ease-out" }} />
    </svg>
  );
}

interface ManagerData {
  id: string;
  full_name: string;
  email: string;
  teamSize: number;
  completionRate: number;
  avgOverall: number;
  activeFlags: number;
}

export function ExecClient({
  managerCount,
  totalTeamMembers,
  orgCompletionRate,
  totalSubmissions,
  totalFlags,
  managerData,
  weekLabel,
  executiveId,
}: {
  managerCount: number;
  totalTeamMembers: number;
  orgCompletionRate: number;
  totalSubmissions: number;
  totalFlags: number;
  managerData: ManagerData[];
  weekLabel: string;
  executiveId: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const animManagers = useCounter(managerCount, 600);
  const animMembers = useCounter(totalTeamMembers, 600);
  const animCompletion = useCounter(orgCompletionRate, 1200);
  const animFlags = useCounter(totalFlags, 600);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Organisation overview
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Week of {weekLabel}. Aggregated data only.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Managers */}
        <div className={`bg-white rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "100ms" }}>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Managers</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">{animManagers}</div>
        </div>

        {/* Total team members */}
        <div className={`bg-white rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "200ms" }}>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Team members</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">{animMembers}</div>
        </div>

        {/* Org completion with arc gauge */}
        <div className={`bg-white rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-all duration-300 ${orgCompletionRate === 100 ? "ring-2 ring-[var(--accent-teal)]/30" : ""} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "300ms" }}>
          <div className="flex items-start justify-between mb-1">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Completion</span>
            {orgCompletionRate === 100 && (
              <span className="text-[10px] font-bold text-[var(--accent-teal)] bg-[var(--accent-teal)]/10 px-2 py-0.5 rounded-full">All in</span>
            )}
          </div>
          <div className="flex items-end gap-3">
            <span className={`text-3xl font-extrabold ${orgCompletionRate >= 80 ? "text-[var(--accent-teal)]" : orgCompletionRate >= 50 ? "text-[var(--amber)]" : "text-[var(--soft-red)]"}`}>
              {animCompletion}%
            </span>
            <ArcGauge
              value={totalSubmissions} max={totalTeamMembers}
              color={orgCompletionRate >= 80 ? "#06D6A0" : orgCompletionRate >= 50 ? "#FBBF24" : "#EF4444"}
              glowColor={orgCompletionRate >= 80 ? "rgba(6,214,160,0.3)" : orgCompletionRate >= 50 ? "rgba(251,191,36,0.3)" : "rgba(239,68,68,0.3)"}
            />
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">{totalSubmissions} of {totalTeamMembers} this week</div>
        </div>

        {/* Flagged - breathing pulse */}
        <div className={`bg-white rounded-2xl p-5 shadow-[var(--card-shadow)] border transition-all duration-300 ${
          totalFlags > 0
            ? "border-[var(--soft-red)]/30 animate-breathe-red"
            : "border-[var(--border)] hover:shadow-[var(--card-shadow-lg)]"
        } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "400ms" }}>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Flagged</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${totalFlags > 0 ? "bg-gradient-to-br from-red-100 to-rose-100" : "bg-gradient-to-br from-emerald-100 to-teal-100"}`}>
              {totalFlags > 0 ? (
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
          <div className={`text-3xl font-extrabold ${totalFlags > 0 ? "text-[var(--soft-red)]" : "text-emerald-500"}`}>{animFlags}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">{totalFlags === 0 ? "All clear" : "Across all teams"}</div>
        </div>
      </div>

      {/* Manager cards grid */}
      <div>
        <div className={`flex items-center justify-between mb-5 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`} style={{ transitionDelay: "450ms" }}>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Team health by manager</h2>
          <p className="text-xs text-[var(--text-secondary)]">Click to drill in. Aggregated only.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {managerData.map((m, mi) => {
            const initials = m.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            const hasConcern = m.activeFlags > 0;
            const healthPct = m.avgOverall > 0 ? (m.avgOverall / 5) * 100 : 0;
            const healthColor = m.avgOverall >= 4 ? "#06D6A0" : m.avgOverall >= 3 ? "#FBBF24" : m.avgOverall > 0 ? "#EF4444" : "#E2E8F0";

            return (
              <Link
                key={m.id}
                href={`/executive/manager/${m.id}`}
                className={`bg-white rounded-2xl shadow-[var(--card-shadow)] border hover:shadow-[var(--card-shadow-lg)] transition-all duration-300 group ${
                  hasConcern ? "border-[var(--soft-red)]/20 hover:border-[var(--soft-red)]/40" : "border-[var(--border)] hover:border-[var(--accent-blue)]/30"
                }`}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  transitionDelay: `${500 + mi * 100}ms`,
                }}
              >
                {/* Header */}
                <div className="px-5 pt-5 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_8px_rgba(79,110,247,0.2)]">
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                        {m.full_name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {m.teamSize} team {m.teamSize === 1 ? "member" : "members"}
                      </div>
                    </div>
                  </div>
                  {hasConcern ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--soft-red)]/8 text-[var(--soft-red)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--soft-red)] animate-pulse" />
                      {m.activeFlags} {m.activeFlags === 1 ? "flag" : "flags"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/8 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 6px rgba(16,185,129,0.4)" }} />
                      Clear
                    </span>
                  )}
                </div>

                {/* Stats bar */}
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-4">
                    {/* Completion */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Completion</span>
                        <span className={`text-xs font-bold ${m.completionRate >= 80 ? "text-[var(--accent-teal)]" : m.completionRate >= 50 ? "text-[var(--amber)]" : "text-[var(--soft-red)]"}`}>
                          {m.completionRate}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: mounted ? `${m.completionRate}%` : "0%",
                          background: m.completionRate >= 80 ? "linear-gradient(90deg, #06D6A0, #34D399)" : m.completionRate >= 50 ? "linear-gradient(90deg, #FBBF24, #F59E0B)" : "linear-gradient(90deg, #EF4444, #F87171)",
                          boxShadow: m.completionRate >= 80 ? "0 0 8px rgba(6,214,160,0.3)" : "none",
                          transition: "width 0.8s ease-out",
                          transitionDelay: `${500 + mi * 100 + 200}ms`,
                        }} />
                      </div>
                    </div>

                    {/* Overall health */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Health</span>
                        <span className="text-xs font-bold" style={{ color: healthColor }}>
                          {m.avgOverall > 0 ? m.avgOverall : "-"}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: mounted ? `${healthPct}%` : "0%",
                          background: `linear-gradient(90deg, ${healthColor}, ${healthColor}cc)`,
                          boxShadow: `0 0 8px ${healthColor}33`,
                          transition: "width 0.8s ease-out",
                          transitionDelay: `${500 + mi * 100 + 300}ms`,
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-[var(--border-light)] flex items-center justify-between">
                  <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <span className="text-xs font-semibold text-[var(--accent-blue)] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 flex items-center gap-1">
                    View team
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
    </div>
  );
}
