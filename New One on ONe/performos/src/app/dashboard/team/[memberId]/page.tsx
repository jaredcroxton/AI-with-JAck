import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate, formatDate } from "@/lib/dates";
import { RATING_QUESTIONS, REFLECTION_QUESTIONS } from "@/lib/reflection-questions";
import Link from "next/link";
import { MemberHeatMap } from "./heatmap";
import { MemberBarChart } from "./bar-chart";
import { AISummary } from "./ai-summary";

export default async function TeamMemberPage(
  props: PageProps<"/dashboard/team/[memberId]">
) {
  const { memberId } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=manager");

  // Get team member profile
  const { data: member } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, manager_id")
    .eq("id", memberId)
    .single();

  if (!member || member.manager_id !== user.id) {
    redirect("/dashboard");
  }

  // Get last six weeks of reflections
  const mondays = getLastNMondays(6);
  const mondayDates = mondays.map(toISODate);

  const { data: reflections } = await supabase
    .from("reflections")
    .select("*")
    .eq("team_member_id", memberId)
    .in("week_of", mondayDates)
    .is("deleted_at", null)
    .order("week_of", { ascending: false });

  const safeReflections = reflections || [];

  // Get active risk flags
  const { data: flags } = await supabase
    .from("risk_flags")
    .select("*")
    .eq("team_member_id", memberId)
    .is("resolved_at", null)
    .is("deleted_at", null)
    .order("detected_at", { ascending: false });

  const activeFlags = flags || [];

  // Get open action items
  const { data: actions } = await supabase
    .from("action_items")
    .select("*")
    .eq("assigned_to", memberId)
    .neq("status", "completed")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const openActions = actions || [];

  const initials = member.full_name
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
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-on-light)] transition-colors mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Back to dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold text-lg">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-on-light)]">
              {member.full_name}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              {member.email}
            </p>
          </div>
        </div>
      </div>

      {/* Risk flags */}
      {activeFlags.length > 0 && (
        <div className="bg-[var(--amber)]/5 rounded-2xl p-6 border border-[var(--amber)]/20">
          <h2 className="text-sm font-semibold text-[var(--amber)] uppercase tracking-wider mb-3">
            Active risk flags
          </h2>
          <div className="space-y-3">
            {activeFlags.map((flag: Record<string, unknown>) => (
              <div
                key={flag.id as string}
                className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[var(--amber)]/10"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    flag.severity === "high_risk"
                      ? "bg-[var(--soft-red)]"
                      : "bg-[var(--amber)]"
                  }`}
                />
                <div>
                  <div className="text-sm font-semibold text-[var(--text-on-light)] capitalize">
                    {(flag.flag_type as string).replace(/_/g, " ")}
                    <span
                      className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                        flag.severity === "high_risk"
                          ? "bg-[var(--soft-red)]/10 text-[var(--soft-red)]"
                          : "bg-[var(--amber)]/10 text-[var(--amber)]"
                      }`}
                    >
                      {(flag.severity as string).replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {flag.evidence as string}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI coaching summary */}
      {safeReflections.length > 0 && (
        <AISummary
          memberName={member.full_name}
          memberId={member.id}
          reflections={safeReflections}
        />
      )}

      {safeReflections.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-2">
            No reflections yet
          </h2>
          <p className="text-[var(--text-secondary)]">
            {member.full_name} has not submitted any reflections in the last six
            weeks.
          </p>
        </div>
      ) : (
        <>
          {/* Heatmap */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-6">
              Six-week heatmap
            </h2>
            <MemberHeatMap reflections={safeReflections} mondays={mondays} />
          </div>

          {/* Bar charts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-6">
              Trends
            </h2>
            <MemberBarChart reflections={safeReflections} mondays={mondays} />
          </div>

          {/* Weekly detail cards */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-4">
              Weekly reflections
            </h2>
            <div className="space-y-4">
              {safeReflections.map((r: Record<string, unknown>) => (
                <div
                  key={r.id as string}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--text-on-light)]">
                      Week of{" "}
                      {formatDate(new Date((r.week_of as string) + "T00:00:00"))}
                    </h3>
                    <div className="flex items-center gap-2">
                      {RATING_QUESTIONS.map((q) => {
                        const val = r[q.key] as number;
                        return (
                          <div
                            key={q.key}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              val <= 2
                                ? "bg-red-50 text-[var(--soft-red)]"
                                : val <= 3
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-emerald-50 text-emerald-600"
                            }`}
                            title={q.label}
                          >
                            {q.label} {val}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Text responses */}
                  <div className="space-y-3">
                    {REFLECTION_QUESTIONS.map((q) => {
                      // Show comments for rating questions, main text for text questions
                      const commentKey = q.commentKey;
                      const comment = r[commentKey] as string | null;
                      const mainText =
                        q.type === "text"
                          ? (r[q.key] as string | null)
                          : null;

                      if (!comment && !mainText) return null;

                      return (
                        <div key={q.key} className="pl-4 border-l-2 border-gray-100">
                          <div className="text-xs font-medium text-[var(--text-secondary)] mb-0.5">
                            {q.label}
                          </div>
                          {mainText && (
                            <p className="text-sm text-[var(--text-on-light)]">
                              {mainText}
                            </p>
                          )}
                          {comment && (
                            <p className="text-sm text-[var(--text-secondary)]">
                              {comment}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {(r.notes as string | null) && (
                      <div className="pl-4 border-l-2 border-[var(--accent-teal)]/30">
                        <div className="text-xs font-medium text-[var(--accent-teal)] mb-0.5">
                          Additional notes
                        </div>
                        <p className="text-sm text-[var(--text-on-light)]">
                          {r.notes as string}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Open action items */}
      {openActions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-4">
            Open action items
          </h2>
          <div className="space-y-2">
            {openActions.map((item: Record<string, unknown>) => (
              <div
                key={item.id as string}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
              >
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    item.status === "in_progress"
                      ? "bg-[var(--accent-blue)]"
                      : "bg-gray-300"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--text-on-light)]">
                    {item.title as string}
                  </div>
                  {item.due_date && (
                    <div className="text-xs text-[var(--text-secondary)]">
                      Due{" "}
                      {formatDate(
                        new Date((item.due_date as string) + "T00:00:00")
                      )}
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.status === "in_progress"
                      ? "bg-blue-50 text-[var(--accent-blue)]"
                      : "bg-gray-100 text-[var(--text-secondary)]"
                  }`}
                >
                  {(item.status as string).replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
