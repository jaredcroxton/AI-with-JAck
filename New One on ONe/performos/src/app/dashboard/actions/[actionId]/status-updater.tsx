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
    {
      value: "open",
      label: "Open",
      activeStyle: "bg-[var(--soft-red)]/15 text-[var(--soft-red)] border-[var(--soft-red)]/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]",
    },
    {
      value: "in_progress",
      label: "In progress",
      activeStyle: "bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] border-[var(--accent-blue)]/30 shadow-[0_0_8px_rgba(79,110,247,0.15)]",
    },
    {
      value: "completed",
      label: "Resolved",
      activeStyle: "gradient-bg text-white border-transparent shadow-[0_2px_12px_rgba(79,110,247,0.25),0_1px_4px_rgba(6,214,160,0.15)]",
    },
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
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
            currentStatus === s.value
              ? s.activeStyle
              : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--border)]"
          } disabled:cursor-default`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
