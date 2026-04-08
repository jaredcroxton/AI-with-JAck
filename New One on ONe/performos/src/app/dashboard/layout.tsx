import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import { DashboardTabs } from "./dashboard-tabs";

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
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg" />
            <span className="text-lg font-semibold text-[var(--text-on-dark)] tracking-tight">
              Perform<span className="gradient-text">OS</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">
              {profile?.full_name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <DashboardTabs />
      </div>
      <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
