import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate, formatDate } from "@/lib/dates";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";
import Link from "next/link";
import { ExecMemberCards } from "./member-cards";
import { ExecHeatMap } from "./exec-heatmap";

export default async function ExecManagerPage(
  props: PageProps<"/executive/manager/[managerId]">
) {
  const { managerId } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify executive role
  const { data: execProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (execProfile?.role !== "executive") redirect("/login");

  // Get manager profile
  const { data: manager } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", managerId)
    .eq("role", "manager")
    .single();

  if (!manager) redirect("/executive");

  // Get team members (names only, no emails for privacy)
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("manager_id", managerId)
    .is("deleted_at", null)
    .order("full_name");

  const teamMembers = members || [];
  const memberIds = teamMembers.map((m) => m.id);

  const mondays = getLastNMondays(6);
  const currentWeek = toISODate(mondays[0]);
  const mondayDates = mondays.map(toISODate);
  const sixWeeksAgo = mondayDates[mondayDates.length - 1];

  // Get reflections (scores only, no text fields)
  let reflections: Record<string, unknown>[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from("reflections")
      .select("id, team_member_id, week_of, energy_rating, motivation_rating, support_rating, overall_rating")
      .in("team_member_id", memberIds)
      .gte("week_of", sixWeeksAgo)
      .is("deleted_at", null)
      .order("week_of", { ascending: false });
    reflections = data || [];
  }

  // Get active flags (type and severity only, no evidence text)
  let riskFlags: Record<string, unknown>[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from("risk_flags")
      .select("id, team_member_id, flag_type, severity")
      .in("team_member_id", memberIds)
      .is("resolved_at", null)
      .is("deleted_at", null);
    riskFlags = data || [];
  }

  const teamSize = teamMembers.length;
  const currentWeekReflections = reflections.filter(
    (r) => r.week_of === currentWeek
  );
  const completionRate =
    teamSize > 0
      ? Math.round((currentWeekReflections.length / teamSize) * 100)
      : 0;

  // Build per-member data (scores only, no text)
  const memberData = teamMembers.map((member) => {
    const memberReflections = reflections.filter(
      (r) => r.team_member_id === member.id
    );
    const latestReflection = memberReflections[0] || null;
    const flagCount = riskFlags.filter(
      (f) => f.team_member_id === member.id
    ).length;
    const hasCurrentWeek = currentWeekReflections.some(
      (r) => r.team_member_id === member.id
    );

    // Scores per week for heatmap
    const weeklyScores = mondayDates.map((week) => {
      const r = memberReflections.find((ref) => ref.week_of === week);
      if (!r) return null;
      return {
        energy_rating: r.energy_rating as number,
        motivation_rating: r.motivation_rating as number,
        support_rating: r.support_rating as number,
        overall_rating: r.overall_rating as number,
      };
    });

    return {
      ...member,
      latestReflection,
      flagCount,
      hasCurrentWeek,
      weeklyScores,
    };
  });

  // Team averages per week
  const weeklyAverages = mondayDates.map((week) => {
    const weekReflections = reflections.filter((r) => r.week_of === week);
    if (weekReflections.length === 0) return null;

    const avg = (key: string) => {
      const vals = weekReflections.map((r) => r[key] as number);
      return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    };

    return {
      week,
      energy_rating: avg("energy_rating"),
      motivation_rating: avg("motivation_rating"),
      support_rating: avg("support_rating"),
      overall_rating: avg("overall_rating"),
    };
  });

  const initials = manager.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Back + header */}
      <div>
        <Link
          href="/executive"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to overview
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-[0_2px_12px_rgba(79,110,247,0.25)]">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {manager.full_name}'s team
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              {teamSize} team {teamSize === 1 ? "member" : "members"} · {completionRate}% completion this week
            </p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/10">
        <svg className="w-4 h-4 text-[var(--accent-blue)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <p className="text-xs text-[var(--accent-blue)] font-medium">
          Scores and trends only. Individual reflection notes and text responses are not visible at this level.
        </p>
      </div>

      {/* Team averages heatmap */}
      {weeklyAverages.some((w) => w !== null) && (
        <div className="bg-[var(--surface-raised)] rounded-2xl p-6 shadow-[var(--card-shadow)] border border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
            Team averages over six weeks
          </h2>
          <ExecHeatMap
            weeklyAverages={weeklyAverages}
            mondayDates={mondayDates}
          />
        </div>
      )}

      {/* Team member cards (scores only) */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Team members
        </h2>
        <ExecMemberCards memberData={memberData} />
      </div>
    </div>
  );
}
