import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=manager");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[var(--navy)] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-bg" />
              <span className="text-lg font-semibold text-[var(--text-on-dark)] tracking-tight">
                Perform<span className="gradient-text">OS</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1 ml-4">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-on-dark)] hover:bg-white/5 transition"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/team"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-on-dark)] hover:bg-white/5 transition"
              >
                Team
              </Link>
              <Link
                href="/dashboard/actions"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-on-dark)] hover:bg-white/5 transition"
              >
                Actions
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">
              {profile?.full_name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
