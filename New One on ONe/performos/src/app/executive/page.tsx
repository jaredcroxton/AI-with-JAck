import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate, formatDate } from "@/lib/dates";
import { OrgAISummary } from "./org-ai-summary";

function scoreBg(avg: number): string {
  if (avg <= 2) return "bg-[var(--soft-red)]/10";
  if (avg <= 3) return "bg-[var(--amber)]/10";
  return "bg-emerald-50";
}

function scoreColor(avg: number): string {
  if (avg <= 2) return "text-[var(--soft-red)]";
  if (avg <= 3) return "text-[var(--amber)]";
  return "text-emerald-600";
}

function completionColor(rate: number): string {
  if (rate >= 80) return "text-emerald-600";
  if (rate >= 50) return "text-[var(--amber)]";
  return "text-[var(--soft-red)]";
}

export default async function ExecutivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get all managers
  const { data: managers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "manager")
    .is("deleted_at", null)
    .order("full_name");

  const allManagers = managers || [];

  const mondays = getLastNMondays(6);
  const currentWeek = toISODate(mondays[0]);
  const mondayDates = mondays.map(toISODate);

  // Build aggregated data per manager
  const managerData = await Promise.all(
    allManagers.map(async (manager) => {
      // Get team members for this manager
      const { data: members } = await supabase
        .from("profiles")
        .select("id")
        .eq("manager_id", manager.id)
        .is("deleted_at", null);

      const memberIds = (members || []).map((m) => m.id);
      const teamSize = memberIds.length;

      if (teamSize === 0) {
        return {
          ...manager,
          teamSize: 0,
          completionRate: 0,
          avgConfidence: 0,
          avgMotivation: 0,
          avgSupport: 0,
          avgOverall: 0,
          activeFlags: 0,
          currentWeekSubmissions: 0,
        };
      }

      // Get current week reflections
      const { data: reflections } = await supabase
        .from("reflections")
        .select("energy_rating, motivation_rating, support_rating, overall_rating, team_member_id, week_of")
        .in("team_member_id", memberIds)
        .eq("week_of", currentWeek)
        .is("deleted_at", null);

      const currentReflections = reflections || [];
      const completionRate = Math.round((currentReflections.length / teamSize) * 100);

      // Calculate averages
      const avg = (key: string) => {
        const vals = currentReflections.map((r) => r[key as keyof typeof r] as number).filter(Boolean);
        return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
      };

      // Get active flags
      const { count } = await supabase
        .from("risk_flags")
        .select("id", { count: "exact", head: true })
        .in("team_member_id", memberIds)
        .is("resolved_at", null)
        .is("deleted_at", null);

      return {
        ...manager,
        teamSize,
        completionRate,
        avgConfidence: avg("energy_rating"),
        avgMotivation: avg("motivation_rating"),
        avgSupport: avg("support_rating"),
        avgOverall: avg("overall_rating"),
        activeFlags: count || 0,
        currentWeekSubmissions: currentReflections.length,
      };
    })
  );

  // Org-wide totals
  const totalTeamMembers = managerData.reduce((a, m) => a + m.teamSize, 0);
  const totalSubmissions = managerData.reduce((a, m) => a + m.currentWeekSubmissions, 0);
  const totalFlags = managerData.reduce((a, m) => a + m.activeFlags, 0);
  const orgCompletionRate = totalTeamMembers > 0
    ? Math.round((totalSubmissions / totalTeamMembers) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Organisation overview
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Week of {formatDate(mondays[0])}. Aggregated data only.
        </p>
      </div>

      {/* Org-wide metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-shadow">
          <div className="text-sm font-medium text-[var(--text-secondary)] mb-1">Managers</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{allManagers.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-shadow">
          <div className="text-sm font-medium text-[var(--text-secondary)] mb-1">Total team members</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{totalTeamMembers}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-shadow">
          <div className="text-sm font-medium text-[var(--text-secondary)] mb-1">Org completion rate</div>
          <div className={`text-3xl font-bold ${completionColor(orgCompletionRate)}`}>
            {orgCompletionRate}%
          </div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">
            {totalSubmissions} of {totalTeamMembers} this week
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-shadow">
          <div className="text-sm font-medium text-[var(--text-secondary)] mb-1">Active risk flags</div>
          <div className={`text-3xl font-bold ${totalFlags > 0 ? "text-[var(--soft-red)]" : "text-emerald-600"}`}>
            {totalFlags}
          </div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">
            {totalFlags === 0 ? "No active flags" : "Across all teams"}
          </div>
        </div>
      </div>

      {/* AI org summary */}
      <OrgAISummary executiveId={user.id} />

      {/* Manager breakdown */}
      <div className="bg-white rounded-2xl shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] transition-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Team health by manager
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Aggregated scores only. No individual team member data.
          </p>
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--surface)] border-b border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          <div className="col-span-3">Manager</div>
          <div className="col-span-1 text-center">Team</div>
          <div className="col-span-1 text-center">Done</div>
          <div className="col-span-1 text-center">Conf.</div>
          <div className="col-span-1 text-center">Motiv.</div>
          <div className="col-span-1 text-center">Supp.</div>
          <div className="col-span-1 text-center">Overall</div>
          <div className="col-span-1 text-center">Flags</div>
          <div className="col-span-2 text-center">Status</div>
        </div>

        {/* Manager rows */}
        <div className="divide-y divide-[var(--border-light)]">
          {managerData.map((m) => {
            const avgAll =
              m.teamSize > 0
                ? Math.round(((m.avgConfidence + m.avgMotivation + m.avgSupport + m.avgOverall) / 4) * 10) / 10
                : 0;

            return (
              <div
                key={m.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center"
              >
                {/* Manager name */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {m.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {m.full_name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] md:hidden">
                      {m.teamSize} members, {m.completionRate}% complete
                    </div>
                  </div>
                </div>

                {/* Team size */}
                <div className="hidden md:flex col-span-1 justify-center">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {m.teamSize}
                  </span>
                </div>

                {/* Completion */}
                <div className="hidden md:flex col-span-1 justify-center">
                  <span className={`text-sm font-bold ${completionColor(m.completionRate)}`}>
                    {m.completionRate}%
                  </span>
                </div>

                {/* Score cells */}
                {[m.avgConfidence, m.avgMotivation, m.avgSupport, m.avgOverall].map(
                  (val, i) => (
                    <div key={i} className="hidden md:flex col-span-1 justify-center">
                      {val > 0 ? (
                        <span
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${scoreBg(val)} ${scoreColor(val)}`}
                        >
                          {val}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">-</span>
                      )}
                    </div>
                  )
                )}

                {/* Flags */}
                <div className="hidden md:flex col-span-1 justify-center">
                  {m.activeFlags > 0 ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--soft-red)]/10 text-[var(--soft-red)]">
                      {m.activeFlags}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                      Clear
                    </span>
                  )}
                </div>

                {/* Health bar */}
                <div className="hidden md:flex col-span-2 items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-bg transition-all"
                      style={{ width: `${avgAll > 0 ? (avgAll / 5) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold gradient-text w-8 text-right">
                    {avgAll > 0 ? avgAll : "-"}
                  </span>
                </div>

                {/* Mobile scores */}
                <div className="flex md:hidden items-center gap-2 flex-wrap">
                  {[
                    { label: "Conf.", val: m.avgConfidence },
                    { label: "Motiv.", val: m.avgMotivation },
                    { label: "Supp.", val: m.avgSupport },
                    { label: "Overall", val: m.avgOverall },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${item.val > 0 ? `${scoreBg(item.val)} ${scoreColor(item.val)}` : "bg-gray-50 text-gray-300"}`}
                    >
                      {item.label} {item.val > 0 ? item.val : "-"}
                    </div>
                  ))}
                  {m.activeFlags > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--soft-red)]/10 text-[var(--soft-red)]">
                      {m.activeFlags} flags
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Privacy footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            All scores are team averages. Individual team member data is not visible at this level.
          </div>
        </div>
      </div>
    </div>
  );
}
