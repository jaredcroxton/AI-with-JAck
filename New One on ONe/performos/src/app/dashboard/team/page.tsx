import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate } from "@/lib/dates";
import { RATING_QUESTIONS } from "@/lib/reflection-questions";
import Link from "next/link";

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

  const memberData = members.map((member) => {
    const memberReflections = reflections.filter(
      (r) => r.team_member_id === member.id
    );
    const latestReflection = memberReflections[0] || null;
    const flagCount = riskFlags.filter(
      (f) => f.team_member_id === member.id
    ).length;
    const totalReflections = memberReflections.length;

    return { ...member, latestReflection, flagCount, totalReflections };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-on-light)]">Team</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {members.length} team {members.length === 1 ? "member" : "members"}
        </p>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-2xl gradient-bg opacity-20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-2">
            No team members yet
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Team members will appear here once they sign up and are assigned to you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memberData.map((member) => (
            <Link
              key={member.id}
              href={`/dashboard/team/${member.id}`}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm">
                  {member.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-on-light)]">
                      {member.full_name}
                    </span>
                    {member.flagCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--amber)]/15 text-[var(--amber)]">
                        {member.flagCount} {member.flagCount === 1 ? "flag" : "flags"}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {member.totalReflections} of six reflections submitted
                  </div>
                </div>
              </div>

              {member.latestReflection ? (
                <div className="flex items-center gap-2">
                  {RATING_QUESTIONS.map((q) => {
                    const val = member.latestReflection![q.key] as number;
                    return (
                      <div
                        key={q.key}
                        className="flex-1 text-center"
                      >
                        <div className="text-[10px] text-[var(--text-secondary)] mb-1">
                          {q.label}
                        </div>
                        <div
                          className={`py-1.5 rounded-lg text-sm font-bold ${ratingBg(val)} ${ratingColor(val)}`}
                        >
                          {val}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-[var(--text-secondary)] text-center py-2 bg-gray-50 rounded-lg">
                  No reflections yet
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
