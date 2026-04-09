import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate, formatDate } from "@/lib/dates";
import { OrgAISummary } from "./org-ai-summary";
import { ExecClient } from "./exec-client";

export default async function ExecutivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: managers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "manager")
    .is("deleted_at", null)
    .order("full_name");

  const allManagers = managers || [];
  const mondays = getLastNMondays(6);
  const currentWeek = toISODate(mondays[0]);

  const managerData = await Promise.all(
    allManagers.map(async (manager) => {
      const { data: members } = await supabase
        .from("profiles")
        .select("id")
        .eq("manager_id", manager.id)
        .is("deleted_at", null);

      const memberIds = (members || []).map((m) => m.id);
      const teamSize = memberIds.length;

      if (teamSize === 0) {
        return { ...manager, teamSize: 0, completionRate: 0, avgOverall: 0, activeFlags: 0, currentWeekSubmissions: 0 };
      }

      const { data: reflections } = await supabase
        .from("reflections")
        .select("overall_rating, team_member_id")
        .in("team_member_id", memberIds)
        .eq("week_of", currentWeek)
        .is("deleted_at", null);

      const refs = reflections || [];
      const completionRate = Math.round((refs.length / teamSize) * 100);
      const avgOverall = refs.length > 0
        ? Math.round((refs.reduce((a, r) => a + (r.overall_rating as number), 0) / refs.length) * 10) / 10
        : 0;

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
        avgOverall,
        activeFlags: count || 0,
        currentWeekSubmissions: refs.length,
      };
    })
  );

  const totalTeamMembers = managerData.reduce((a, m) => a + m.teamSize, 0);
  const totalSubmissions = managerData.reduce((a, m) => a + m.currentWeekSubmissions, 0);
  const totalFlags = managerData.reduce((a, m) => a + m.activeFlags, 0);
  const orgCompletionRate = totalTeamMembers > 0
    ? Math.round((totalSubmissions / totalTeamMembers) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <ExecClient
        managerCount={allManagers.length}
        totalTeamMembers={totalTeamMembers}
        orgCompletionRate={orgCompletionRate}
        totalSubmissions={totalSubmissions}
        totalFlags={totalFlags}
        managerData={managerData}
        weekLabel={formatDate(mondays[0])}
        executiveId={user.id}
      />

      <OrgAISummary executiveId={user.id} />
    </div>
  );
}
