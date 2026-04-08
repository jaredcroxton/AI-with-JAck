"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AddNoteForm({ actionId }: { actionId: string }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("action_item_notes")
      .insert({
        action_item_id: actionId,
        author_id: user.id,
        content: content.trim(),
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setContent("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-[var(--text-on-light)] mb-2">
        Add a note
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        required
        className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-base text-[var(--text-on-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition resize-none"
        placeholder="Document what happened, what was discussed, and any next steps..."
      />
      <p className="text-xs text-[var(--text-secondary)] mt-2 mb-4">
        Notes are timestamped automatically and cannot be edited or deleted once saved.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-[var(--soft-red)] text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving || !content.trim()}
        className="px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save note"}
      </button>
    </form>
  );
}
