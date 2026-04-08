import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate, formatDate } from "@/lib/dates";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";
import Link from "next/link";

function MetricCard({
  label,
  value,
  subtitle,
  accent,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="text-sm font-medium text-[var(--text-secondary)] mb-1">
        {label}
      </div>
      <div
        className="text-3xl font-bold"
        style={{ color: accent || "var(--text-on-light)" }}
      >
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-[var(--text-secondary)] mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}

function ratingColor(value: number): string {
  if (value <= 2) return "text-[var(--soft-red)]";
  if (value <= 3) return "text-[var(--amber)]";
  return "text-emerald-600";
}

function ratingBg(value: number): string {
  if (value <= 2) return "bg-red-50";
  if (value <= 3) return "bg-amber-50";
  return "bg-emerald-50";
}

function severityBadge(flagCount: number) {
  if (flagCount === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--amber)]/15 text-[var(--amber)]">
      {flagCount} {flagCount === 1 ? "flag" : "flags"}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=manager");

  // Get all team members for this manager
  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("manager_id", user.id)
    .is("deleted_at", null)
    .order("full_name");

  const members = teamMembers || [];

  // Get this week and last six weeks of Mondays
  const mondays = getLastNMondays(6);
  const currentWeek = toISODate(mondays[0]);
  const mondayDates = mondays.map(toISODate);

  // Get all reflections for team members in the last six weeks
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

  // Get active risk flags
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

  // Get open action items
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

  // Compute metrics
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

  // Build per-member latest reflection + flags
  const memberData = members.map((member) => {
    const latestReflection = reflections.find(
      (r) => r.team_member_id === member.id
    );
    const memberFlags = riskFlags.filter(
      (f) => f.team_member_id === member.id
    );
    const hasCurrentWeek = currentWeekReflections.some(
      (r) => r.team_member_id === member.id
    );

    return {
      ...member,
      latestReflection,
      flagCount: memberFlags.length,
      hasCurrentWeek,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-on-light)]">
          Team dashboard
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Week of {formatDate(mondays[0])}
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Team members"
          value={teamSize}
          subtitle={teamSize === 0 ? "No team members yet" : undefined}
        />
        <MetricCard
          label="Completion rate"
          value={`${completionRate}%`}
          subtitle={`${currentWeekReflections.length} of ${teamSize} this week`}
          accent={
            completionRate >= 80
              ? "#10B981"
              : completionRate >= 50
                ? "#F59E0B"
                : "#DC2626"
          }
        />
        <MetricCard
          label="Open action items"
          value={actionItems.length}
        />
        <MetricCard
          label="Flagged members"
          value={flaggedMemberIds.size}
          accent={flaggedMemberIds.size > 0 ? "#DC2626" : "#10B981"}
          subtitle={flaggedMemberIds.size === 0 ? "No active flags" : undefined}
        />
      </div>

      {/* Team members list */}
      {teamSize === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-2xl gradient-bg opacity-20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-2">
            No team members yet
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Team members will appear here once they sign up and are assigned to
            you. Share the sign-up link with your team to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[var(--text-on-light)]">
              Team overview
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {memberData.map((member) => (
              <Link
                key={member.id}
                href={`/dashboard/team/${member.id}`}
                className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {member.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>

                {/* Name and status */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-on-light)]">
                      {member.full_name}
                    </span>
                    {severityBadge(member.flagCount)}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {member.hasCurrentWeek
                      ? "Reflection submitted this week"
                      : "No reflection this week"}
                  </div>
                </div>

                {/* Latest ratings */}
                {member.latestReflection ? (
                  <div className="hidden sm:flex items-center gap-2">
                    {RATING_QUESTIONS.map((q) => {
                      const val = member.latestReflection![
                        q.key
                      ] as number;
                      return (
                        <div
                          key={q.key}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${ratingBg(val)} ${ratingColor(val)}`}
                          title={q.label}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    {RATING_QUESTIONS.map((q) => (
                      <div
                        key={q.key}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm text-gray-300 bg-gray-50"
                      >
                        -
                      </div>
                    ))}
                  </div>
                )}

                {/* Arrow */}
                <svg
                  className="w-5 h-5 text-gray-300 ml-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Link>
            ))}
          </div>

          {/* Rating legend */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
              <span className="font-medium">Scores:</span>
              {RATING_QUESTIONS.map((q) => (
                <span key={q.key}>{q.label}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
