"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Activity {
  title: string;
  description: string;
  time: string;
  category: string;
}

interface FlagCoaching {
  flag_type: string;
  member_name: string;
  what_to_do: string;
  what_to_say: string;
}

interface Coaching {
  weekly_focus: string;
  activities: Activity[];
  flag_coaching: FlagCoaching[];
  self_care_tip: string;
}

const CATEGORY_STYLES: Record<
  string,
  { bg: string; icon: string; label: string; color: string }
> = {
  communication: {
    bg: "bg-blue-50",
    color: "text-[var(--accent-blue)]",
    label: "Communication",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
  wellbeing: {
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    label: "Wellbeing",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z",
  },
  team_building: {
    bg: "bg-purple-50",
    color: "text-purple-600",
    label: "Team building",
    icon: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
  },
  flag_response: {
    bg: "bg-amber-50",
    color: "text-[var(--amber)]",
    label: "Flag response",
    icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
  },
};

export default function CoachingPage() {
  const [coaching, setCoaching] = useState<Coaching | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  async function generate() {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: userId }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCoaching(data.coaching);
    } catch {
      setError("Could not generate coaching tips. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-on-light)]">
          My coaching
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Simple activities to help you lead better this week.
        </p>
      </div>

      {!coaching && !loading && (
        <div className="bg-[var(--navy)] rounded-2xl p-10 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-on-dark)] mb-2">
            Get personalised coaching
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Based on your team's reflections and any active flags, we will
            generate simple activities you can do this week.
          </p>
          <button
            onClick={generate}
            disabled={loading || !userId}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition disabled:opacity-50"
          >
            Generate my coaching plan
          </button>
          {error && (
            <p className="text-sm text-[var(--soft-red)] mt-4">{error}</p>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-10 h-10 rounded-xl gradient-bg animate-pulse mx-auto mb-4" />
          <p className="text-sm text-[var(--text-secondary)]">
            Building your coaching plan...
          </p>
        </div>
      )}

      {coaching && (
        <>
          {/* Weekly focus */}
          <div className="bg-[var(--navy)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-[var(--text-on-dark)]">
                Your focus this week
              </h2>
              <button
                onClick={generate}
                disabled={loading}
                className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-on-dark)] bg-white/5 hover:bg-white/10 transition"
              >
                Refresh
              </button>
            </div>
            <p className="text-lg text-[var(--text-on-dark)] font-medium leading-relaxed">
              {coaching.weekly_focus}
            </p>
          </div>

          {/* Activities grid */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-4">
              Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaching.activities.map((activity, i) => {
                const style =
                  CATEGORY_STYLES[activity.category] ||
                  CATEGORY_STYLES.communication;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center`}
                        >
                          <svg
                            className={`w-4 h-4 ${style.color}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={style.icon}
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.color}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] bg-gray-100 px-2 py-1 rounded-full">
                        {activity.time}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-on-light)] mb-1">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flag coaching */}
          {coaching.flag_coaching.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-4">
                How to handle your flags
              </h2>
              <div className="space-y-4">
                {coaching.flag_coaching.map((fc, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--amber)]" />
                      <span className="text-sm font-semibold text-[var(--text-on-light)]">
                        {fc.member_name}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] capitalize">
                        {fc.flag_type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      {fc.what_to_do}
                    </p>
                    <div className="px-4 py-3 rounded-xl bg-blue-50">
                      <div className="text-xs font-medium text-[var(--accent-blue)] mb-1">
                        What to say
                      </div>
                      <p className="text-sm text-[var(--accent-blue)] font-medium">
                        "{fc.what_to_say}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Self-care */}
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-0.5">
                  Look after yourself too
                </div>
                <p className="text-sm text-emerald-700 font-medium">
                  {coaching.self_care_tip}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
