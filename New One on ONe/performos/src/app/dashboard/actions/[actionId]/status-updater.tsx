"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function StatusUpdater({
  actionId,
  currentStatus,
}: {
  actionId: string;
  currentStatus: string;
}) {
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    const supabase = createClient();

    await supabase
      .from("action_items")
      .update({ status: newStatus })
      .eq("id", actionId);

    // If resolving, also resolve the linked flag
    if (newStatus === "completed") {
      const { data: item } = await supabase
        .from("action_items")
        .select("flag_id")
        .eq("id", actionId)
        .single();

      if (item?.flag_id) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        await supabase
          .from("risk_flags")
          .update({
            resolved_at: new Date().toISOString(),
            resolved_by: user?.id,
          })
          .eq("id", item.flag_id);
      }
    }

    setUpdating(false);
    router.refresh();
  }

  const statuses = [
    { value: "open", label: "Open", style: "bg-[var(--soft-red)]/10 text-[var(--soft-red)] border-[var(--soft-red)]/20" },
    { value: "in_progress", label: "In progress", style: "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/20" },
    { value: "completed", label: "Resolved", style: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--text-secondary)] mr-2">
        Status:
      </span>
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() => updateStatus(s.value)}
          disabled={updating || currentStatus === s.value}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            currentStatus === s.value
              ? `${s.style} border-current`
              : "bg-gray-50 text-[var(--text-secondary)] border-gray-200 hover:bg-gray-100"
          } disabled:opacity-50`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
