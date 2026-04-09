import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate } from "@/lib/dates";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";
import Link from "next/link";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
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

  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("manager_id", user.id)
    .is("deleted_at", null)
    .order("full_name");

  const members = teamMembers || [];
  const mondays = getLastNMondays(6);
  const currentWeek = toISODate(mondays[0]);
  const mondayDates = mondays.map(toISODate);
  const memberIds = members.map((m) => m.id);

  let reflections: Record<string, unknown>[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from("reflections")
      .select("*")
      .in("team_member_id", memberIds)
      .in("week_of", mondayDates)
      .is("deleted_at", null)
      .order("week_of", { ascending: false });
    reflections = data || [];
  }

  let riskFlags: Record<string, unknown>[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from("risk_flags")
      .select("*")
      .in("team_member_id", memberIds)
      .is("resolved_at", null)
      .is("deleted_at", null);
    riskFlags = data || [];
  }

  let actionItems: Record<string, unknown>[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from("action_items")
      .select("*")
      .in("assigned_to", memberIds)
      .neq("status", "completed")
      .is("deleted_at", null);
    actionItems = data || [];
  }

  const teamSize = members.length;
  const currentWeekReflections = reflections.filter(
    (r) => r.week_of === currentWeek
  );
  const completionRate =
    teamSize > 0
      ? Math.round((currentWeekReflections.length / teamSize) * 100)
      : 0;

  const flaggedMemberIds = new Set(
    riskFlags.map((f) => f.team_member_id as string)
  );

  // Build sparkline data: last 4 weeks overall_rating per member
  const memberData = members.map((member) => {
    const memberReflections = reflections
      .filter((r) => r.team_member_id === member.id)
      .sort((a, b) => (a.week_of as string).localeCompare(b.week_of as string));

    const latestReflection = reflections.find(
      (r) => r.team_member_id === member.id
    );
    const memberFlags = riskFlags.filter(
      (f) => f.team_member_id === member.id
    );
    const hasCurrentWeek = currentWeekReflections.some(
      (r) => r.team_member_id === member.id
    );

    // Last 4 overall ratings for sparkline
    const sparkline = memberReflections
      .slice(-4)
      .map((r) => (r.overall_rating as number) || null);

    return {
      ...member,
      latestReflection,
      flagCount: memberFlags.length,
      hasCurrentWeek,
      sparkline,
    };
  });

  return (
    <DashboardClient
      managerName={profile?.full_name || "Manager"}
      teamSize={teamSize}
      completionRate={completionRate}
      currentWeekSubmissions={currentWeekReflections.length}
      openActions={actionItems.length}
      flaggedCount={flaggedMemberIds.size}
      memberData={memberData}
    />
  );
}
