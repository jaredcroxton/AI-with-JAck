"use client";

import { useState } from "react";

export function AISummary({
  memberName,
  memberId,
  reflections,
}: {
  memberName: string;
  memberId: string;
  reflections: Record<string, unknown>[];
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateSummary() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberName, reflections }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();
      setSummary(data.summary);
    } catch {
      setError("Could not generate coaching insights. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-6 border border-[var(--border)]"
      style={{
        background: "linear-gradient(135deg, #EEF2FF 0%, #EFF6FF 40%, #F0FDFA 100%)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #4F6EF7 0%, #06D6A0 60%, #34D399 100%)",
              boxShadow: "0 2px 10px rgba(79, 110, 247, 0.25)",
            }}
          >
            <svg
              className="w-4.5 h-4.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              AI coaching insights
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Powered by reflection analysis
            </p>
          </div>
        </div>
        {!summary && (
          <button
            onClick={generateSummary}
            disabled={loading}
            className="btn-gradient px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analysing...
              </span>
            ) : (
              "Generate insights"
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl p-3 bg-red-50 border border-red-100">
          <p className="text-sm text-[var(--soft-red)]">{error}</p>
        </div>
      )}

      {summary && (
        <div className="rounded-xl p-4 bg-white/60 border border-[var(--border)]">
          <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}

      {!summary && !loading && !error && (
        <div className="rounded-xl p-4 bg-white/40 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)]">
            Generate AI-powered coaching insights based on {memberName}&apos;s
            reflection patterns over the last six weeks.
          </p>
        </div>
      )}
    </div>
  );
}
