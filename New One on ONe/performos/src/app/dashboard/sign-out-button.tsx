"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-on-dark)] transition-colors"
    >
      Sign out
    </button>
  );
}
