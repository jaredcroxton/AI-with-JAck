import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import { AccorLogo } from "../accor-logo";

export default async function MySessionsLayout({
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
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <nav className="bg-white border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/my-sessions" className="flex items-center gap-2.5">
            <AccorLogo className="h-7 text-[var(--primary)]" />
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
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
