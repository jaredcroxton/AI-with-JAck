"use client";

import { useState } from "react";

interface ManagerHighlight {
  name: string;
  status: "green" | "amber" | "red";
  insight: string;
}

interface OrgAnalysis {
  org_pulse: number;
  org_pulse_label: string;
  executive_summary: string;
  manager_highlights: ManagerHighlight[];
  org_patterns: string[];
  recommendations: string[];
}

const STATUS_STYLES = {
  green: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", label: "Healthy" },
  amber: { bg: "bg-amber-50", text: "text-[var(--amber)]", dot: "bg-[var(--amber)]", label: "Mixed" },
  red: { bg: "bg-red-50", text: "text-[var(--soft-red)]", dot: "bg-[var(--soft-red)]", label: "Concern" },
};

export function OrgAISummary({ executiveId }: { executiveId: string }) {
  const [analysis, setAnalysis] = useState<OrgAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/org-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executiveId }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setError("Could not generate organisation analysis. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Not yet generated
  if (!analysis && !loading && !error) {
    return (
      <div className="bg-[var(--navy)] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI organisation analysis</h2>
              <p className="text-sm text-white/50">Patterns and insights across all managers.</p>
            </div>
          </div>
          <button onClick={generate} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition">
            Generate analysis
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[var(--navy)] rounded-2xl p-12 shadow-sm flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl gradient-bg animate-pulse mb-4" />
        <p className="text-sm text-white/60">Analysing organisation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--navy)] rounded-2xl p-8 shadow-sm">
        <p className="text-sm text-[var(--soft-red)] mb-3">{error}</p>
        <button onClick={generate} className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition">
          Try again
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  // Pulse ring
  const pct = (analysis.org_pulse / 10) * 100;
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Pulse + summary */}
      <div className="bg-[var(--navy)] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white">AI organisation analysis</h2>
          <button onClick={generate} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Refreshing..." : "Refresh analysis"}
          </button>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-40 h-40">
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[var(--accent-blue)]/20 via-[var(--accent-teal)]/10 to-[var(--accent-green)]/20 blur-xl" />
              <svg className="relative w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeOpacity={0.08} strokeWidth="6" />
                <defs>
                  <linearGradient id="orgPulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-blue)" />
                    <stop offset="50%" stopColor="var(--accent-teal)" />
                    <stop offset="100%" stopColor="var(--accent-green)" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="none" strokeWidth="6" strokeLinecap="round" stroke="url(#orgPulseGradient)" strokeDasharray={circumference} strokeDashoffset={offset} style={{ filter: "drop-shadow(0 0 6px rgba(20, 184, 166, 0.4))" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold gradient-text">{analysis.org_pulse}</span>
                <span className="text-sm font-medium text-white/40">/10</span>
              </div>
            </div>
            <span className="mt-3 text-base font-bold gradient-text">{analysis.org_pulse_label}</span>
            <span className="text-xs font-medium text-white/50 tracking-wide uppercase">Org pulse</span>
          </div>

          <p className="text-base text-white leading-relaxed">{analysis.executive_summary}</p>
        </div>
      </div>

      {/* Manager highlights + Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manager highlights */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-[var(--text-on-light)] mb-4">Manager health status</h3>
          <div className="space-y-3">
            {analysis.manager_highlights.map((mh, i) => {
              const style = STATUS_STYLES[mh.status] || STATUS_STYLES.amber;
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${style.bg}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-on-light)]">{mh.name}</span>
                      <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{mh.insight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Patterns + Recommendations */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-[var(--text-on-light)] mb-3">Organisation patterns</h3>
            <div className="space-y-2">
              {analysis.org_patterns.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                  <p className="text-sm text-[var(--text-on-light)]">{p}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-[var(--text-on-light)] mb-3">Strategic recommendations</h3>
            <div className="space-y-2">
              {analysis.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[var(--text-on-light)]">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
