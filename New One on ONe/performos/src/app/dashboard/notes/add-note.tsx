"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AddNote() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    await supabase.from("manager_notes").insert({
      manager_id: user.id,
      content: content.trim(),
    });

    setContent("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)]"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition resize-none placeholder:text-[var(--text-secondary)]"
        placeholder="Write a note... observations, reminders, thoughts about your team"
      />
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-[var(--text-secondary)]">
          Saved with timestamp. Cannot be edited or deleted.
        </p>
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="btn-gradient px-5 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Add note"}
        </button>
      </div>
    </form>
  );
}
