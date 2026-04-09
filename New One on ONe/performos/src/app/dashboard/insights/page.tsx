import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeamAISummary } from "../team-ai-summary";

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          <span className="gradient-text">AI</span> Insights
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          AI-powered team analysis, bright spots, and risk patterns.
        </p>
      </div>
      <div className="stagger-item" style={{ animationDelay: "0.1s" }}>
        <TeamAISummary managerId={user.id} />
      </div>
    </div>
  );
}
