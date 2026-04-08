import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ExecutiveLayout({
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

  if (profile?.role !== "executive") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[var(--navy)] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/executive" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg" />
            <span className="text-lg font-semibold text-white tracking-tight">
              Perform<span className="gradient-text">OS</span>
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-md bg-white/10 text-xs font-medium text-white/60">
              Executive
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">{profile.full_name}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="button"
                className="text-sm text-white/40 hover:text-white transition-colors"
                onClick={async () => {
                  "use server";
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
