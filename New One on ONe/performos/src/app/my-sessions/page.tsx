import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate } from "@/lib/dates";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";
import { HeatMap } from "./heatmap";
import { TrendGraph } from "./trend-graph";
import { ReflectionDropdown } from "./reflection-dropdown";

export default async function MySessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const mondays = getLastNMondays(6);
  const mondayDates = mondays.map(toISODate);
  const sixWeeksAgo = mondayDates[mondayDates.length - 1];

  const { data: reflections } = await supabase
    .from("reflections")
    .select("*")
    .eq("team_member_id", user.id)
    .gte("week_of", sixWeeksAgo)
    .is("deleted_at", null)
    .order("week_of", { ascending: true });

  const safeReflections = reflections || [];
  const completedWeeks = new Set(safeReflections.map((r) => r.week_of));
  const availableMondays = mondays.filter(
    (m) => !completedWeeks.has(toISODate(m))
  );

  // Latest scores for quick stats
  const latest = safeReflections.length > 0 ? safeReflections[safeReflections.length - 1] : null;

  const SCORE_COLORS = [
    { from: "#4F6EF7", to: "#818CF8", glow: "#4F6EF733" },
    { from: "#8B5CF6", to: "#A78BFA", glow: "#8B5CF633" },
    { from: "#FBBF24", to: "#F59E0B", glow: "#FBBF2433" },
    { from: "#06D6A0", to: "#34D399", glow: "#06D6A033" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Track how your weeks are going over time.
          </p>
        </div>
        <ReflectionDropdown availableMondays={availableMondays} />
      </div>

      {/* Quick stats from latest reflection */}
      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {RATING_QUESTIONS.map((q, i) => {
            const val = latest[q.key] as number;
            const color = SCORE_COLORS[i];
            const pct = (val / 5) * 100;
            return (
              <div
                key={q.key}
                className="bg-white rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-all"
              >
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                  {q.label}
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span
                    className="text-3xl font-extrabold"
                    style={{ color: color.from }}
                  >
                    {val}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">/5</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
                      boxShadow: `0 0 8px ${color.glow}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {safeReflections.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[var(--card-shadow)] border border-[var(--border)]">
          <div className="w-16 h-16 rounded-2xl gradient-bg opacity-20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            No reflections yet
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Start your first weekly reflection using the button above.
            Pick a Monday and share how your week went.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-shadow">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              Six-week heatmap
            </h2>
            <HeatMap reflections={safeReflections} mondays={mondays} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-shadow">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              Trends over six weeks
            </h2>
            <TrendGraph reflections={safeReflections} mondays={mondays} />
          </div>
        </>
      )}
    </div>
  );
}
