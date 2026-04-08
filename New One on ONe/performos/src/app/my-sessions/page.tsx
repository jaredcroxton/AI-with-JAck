import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate } from "@/lib/dates";
import { HeatMap } from "./heatmap";
import { TrendGraph } from "./trend-graph";
import { ReflectionDropdown } from "./reflection-dropdown";

export default async function MySessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=team_member");

  const mondays = getLastNMondays(6);
  const mondayDates = mondays.map(toISODate);

  const { data: reflections } = await supabase
    .from("reflections")
    .select("*")
    .eq("team_member_id", user.id)
    .in("week_of", mondayDates)
    .is("deleted_at", null)
    .order("week_of", { ascending: true });

  const safeReflections = reflections || [];

  // Find which Mondays already have reflections
  const completedWeeks = new Set(safeReflections.map((r) => r.week_of));

  // Available Mondays for new reflection (not yet submitted)
  const availableMondays = mondays.filter(
    (m) => !completedWeeks.has(toISODate(m))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-on-light)]">
            My reflections
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Track how your weeks are going over time.
          </p>
        </div>
        <ReflectionDropdown availableMondays={availableMondays} />
      </div>

      {safeReflections.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-2xl gradient-bg opacity-20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-2">
            No reflections yet
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Start your first weekly reflection using the dropdown above.
            Pick a Monday and share how your week went.
          </p>
        </div>
      ) : (
        <>
          {/* Heatmap Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-6">
              Six-week heatmap
            </h2>
            <HeatMap
              reflections={safeReflections}
              mondays={mondays}
            />
          </div>

          {/* Trend Graph Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-6">
              Trends over six weeks
            </h2>
            <TrendGraph
              reflections={safeReflections}
              mondays={mondays}
            />
          </div>
        </>
      )}
    </div>
  );
}
