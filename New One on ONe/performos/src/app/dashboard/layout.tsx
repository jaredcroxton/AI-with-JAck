import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
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

  // Get team size and completion for sidebar
  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id")
    .eq("manager_id", user.id)
    .is("deleted_at", null);

  const teamSize = teamMembers?.length || 0;

  return (
    <div className="min-h-screen bg-[var(--surface)] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[var(--border)] flex flex-col shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <AccorLogo className="h-7 text-[var(--primary)]" />
          </Link>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm">
              {profile?.full_name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "M"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {profile?.full_name}
              </div>
              <div className="text-xs text-[var(--text-secondary)] truncate">
                Manager
              </div>
            </div>
          </div>

          {/* Team capacity bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Team size
              </span>
              <span className="text-xs font-bold text-[var(--accent-teal)]">
                {teamSize} members
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
              <div
                className="h-full rounded-full gradient-bg transition-all"
                style={{ width: `${Math.min((teamSize / 15) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* Powered by footer */}
        <div className="mt-auto px-5 py-4 border-t border-[var(--border)] text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">
            Powered by <span className="font-bold">Perform<span className="gradient-text">OS</span></span>
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
