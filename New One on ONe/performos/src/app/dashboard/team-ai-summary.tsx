"use client";

import { useState } from "react";

export function TeamAISummary({ managerId }: { managerId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
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
      setSummary(data.summary);
    } catch {
      setError("Could not generate team analysis. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--navy)] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
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
          <h2 className="text-sm font-semibold text-[var(--text-on-dark)]">
            AI team analysis
          </h2>
        </div>
        {!summary && (
          <button
            onClick={generate}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Analysing team..." : "Generate team analysis"}
          </button>
        )}
        {summary && (
          <button
            onClick={generate}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-on-dark)] bg-white/5 hover:bg-white/10 transition disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--soft-red)]">{error}</p>
      )}

      {summary && (
        <div className="text-sm text-[var(--text-on-dark)]/90 leading-relaxed whitespace-pre-wrap">
          {summary}
        </div>
      )}

      {!summary && !loading && !error && (
        <p className="text-sm text-[var(--text-secondary)]">
          Generate an AI-powered team health analysis for the current week.
          Identifies red zones, patterns, and recommended actions.
        </p>
      )}
    </div>
  );
}
