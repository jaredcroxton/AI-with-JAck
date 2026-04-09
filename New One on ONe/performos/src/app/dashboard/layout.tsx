import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CollapsibleLayout } from "./collapsible-layout";
import { AccorLogo } from "../accor-logo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id")
    .eq("manager_id", user.id)
    .is("deleted_at", null);

  const teamSize = teamMembers?.length || 0;

  return (
    <CollapsibleLayout
      fullName={profile?.full_name || "Manager"}
      teamSize={teamSize}
    >
      {children}
    </CollapsibleLayout>
  );
}
