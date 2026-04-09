"use client";

import { useState } from "react";

interface Analysis {
  pulse_score: number;
  pulse_label: string;
  health_summary: string;
  bright_spots: { name: string; highlight: string }[];
  red_zone: { name: string; concern: string; conversation_starter: string }[];
  patterns: string[];
  actions: string[];
  missed_reflections: string[];
}

function PulseScore({ score, label }: { score: number; label: string }) {
  const pct = (score / 10) * 100;
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center shrink-0">
      <div className="relative w-40 h-40">
        {/* Glow effect */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[var(--accent-blue)]/10 via-[var(--accent-teal)]/5 to-[var(--accent-green)]/10 blur-xl" />
        <svg className="relative w-40 h-40 -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#CBD5E1" strokeWidth="6" />
          {/* Gradient ring */}
          <defs>
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-blue)" />
              <stop offset="50%" stopColor="var(--accent-teal)" />
              <stop offset="100%" stopColor="var(--accent-green)" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="44" fill="none"
            strokeWidth="6" strokeLinecap="round"
            stroke="url(#pulseGradient)"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: "drop-shadow(0 0 6px rgba(20, 184, 166, 0.4))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold gradient-text">{score}</span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">/10</span>
        </div>
      </div>
      <span className="mt-3 text-base font-bold gradient-text">{label}</span>
      <span className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase">Team pulse</span>
    </div>
  );
}

export function TeamAISummary({ managerId }: { managerId: string }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/team-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setError("Could not generate team analysis. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Initial state - not yet generated
  if (!analysis && !loading && !error) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-teal-50 rounded-2xl p-8 border border-indigo-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                AI team analysis
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Pulse score, bright spots, and red zones across your team.
              </p>
            </div>
          </div>
          <button
            onClick={generate}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Generate analysis
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-teal-50 rounded-2xl p-12 border border-indigo-100/50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl gradient-bg animate-pulse mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">Analysing your team...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-teal-50 rounded-2xl p-8 border border-indigo-100/50">
        <p className="text-sm text-[var(--soft-red)] mb-3">{error}</p>
        <button onClick={generate} className="btn-primary px-4 py-2 text-sm">
          Try again
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-4">
      {/* Pulse score + summary */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-teal-50 rounded-2xl p-8 border border-indigo-100/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-[var(--text-primary)]">AI team analysis</h2>
          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh analysis"}
          </button>
        </div>

        <div className="flex items-center gap-10">
          <PulseScore score={analysis.pulse_score} label={analysis.pulse_label} />
          <p className="text-base text-[var(--text-primary)] leading-relaxed">
            {analysis.health_summary}
          </p>
        </div>
      </div>

      {/* Bright spots + Red zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--surface-raised)] rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Bright spots</h3>
          </div>
          {analysis.bright_spots.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No standout performers this week.</p>
          ) : (
            <div className="space-y-3">
              {analysis.bright_spots.map((spot, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0">
                    {spot.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{spot.name}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{spot.highlight}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[var(--surface-raised)] rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--soft-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Needs attention</h3>
          </div>
          {analysis.red_zone.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No team members in the red zone this week.</p>
          ) : (
            <div className="space-y-4">
              {analysis.red_zone.map((member, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-xs font-bold text-[var(--soft-red)] shrink-0">
                      {member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{member.name}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{member.concern}</div>
                    </div>
                  </div>
                  <div className="ml-11 px-3 py-2 rounded-lg bg-blue-50 text-sm text-[var(--accent-blue)]">
                    Try asking: &ldquo;{member.conversation_starter}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          )}

          {analysis.missed_reflections.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <div className="text-xs font-medium text-[var(--amber)] uppercase tracking-wider mb-2">Missed reflections</div>
              <div className="flex flex-wrap gap-2">
                {analysis.missed_reflections.map((name, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--amber)]/10 text-[var(--amber)]">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patterns + Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--surface-raised)] rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Patterns this week</h3>
          </div>
          <div className="space-y-2">
            {analysis.patterns.map((pattern, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm text-[var(--text-primary)]">{pattern}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface-raised)] rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Your actions this week</h3>
          </div>
          <div className="space-y-2">
            {analysis.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)]">
                <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-[var(--text-primary)]">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
