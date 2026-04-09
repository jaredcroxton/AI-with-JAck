import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate } from "@/lib/dates";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";
import { TeamGridClient } from "./team-grid-client";

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=manager");

  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("manager_id", user.id)
    .is("deleted_at", null)
    .order("full_name");

  const members = teamMembers || [];
  const memberIds = members.map((m) => m.id);

  const mondays = getLastNMondays(6);
  const mondayDates = mondays.map(toISODate);
  const sixWeeksAgo = mondayDates[mondayDates.length - 1];

  let reflections: Record<string, unknown>[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from("reflections")
      .select("*")
      .in("team_member_id", memberIds)
      .gte("week_of", sixWeeksAgo)
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

  const memberData = members.map((member) => {
    const memberReflections = reflections.filter(
      (r) => r.team_member_id === member.id
    );
    const latestReflection = memberReflections[0] || null;
    const flagCount = riskFlags.filter(
      (f) => f.team_member_id === member.id
    ).length;
    const totalReflections = memberReflections.length;

    // Build sparkline from overall_score across weeks (oldest to newest)
    const sortedMondays = [...mondays].reverse();
    const sparkline: number[] = [];
    for (const monday of sortedMondays) {
      const r = memberReflections.find(
        (ref) => ref.week_of === toISODate(monday)
      );
      if (r) {
        const overallKey = RATING_QUESTIONS[RATING_QUESTIONS.length - 1]?.key;
        const val = overallKey ? (r[overallKey] as number) : null;
        if (val !== null && val !== undefined) sparkline.push(val);
      }
    }

    return { ...member, latestReflection, flagCount, totalReflections, sparkline };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Team</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {members.length} team {members.length === 1 ? "member" : "members"}
        </p>
      </div>

      <TeamGridClient memberData={memberData} />
    </div>
  );
}
