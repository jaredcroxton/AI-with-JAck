import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLastNMondays, toISODate } from "@/lib/dates";
import { MemberDetailClient } from "./member-detail-client";

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

  return (
    <MemberDetailClient
      member={member}
      reflections={safeReflections}
      activeFlags={activeFlags}
      openActions={openActions}
      mondayStrings={mondayDates}
    />
  );
}
