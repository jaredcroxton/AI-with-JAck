import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/dates";
import { AddNote } from "./add-note";

export default async function NotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: notes } = await supabase
    .from("manager_notes")
    .select("*")
    .eq("manager_id", user.id)
    .order("created_at", { ascending: false });

  const allNotes = notes || [];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notes</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Your personal running log. Notes are timestamped and cannot be edited.
        </p>
      </div>

      {/* Add note form */}
      <div className="stagger-item" style={{ animationDelay: "0.05s" }}>
        <AddNote />
      </div>

      {/* Notes timeline */}
      {allNotes.length === 0 ? (
        <div className="stagger-item bg-white rounded-2xl p-10 text-center shadow-[var(--card-shadow)] border border-[var(--border)]" style={{ animationDelay: "0.12s" }}>
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-blue)]/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            No notes yet. Add your first note above.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {allNotes.map((note, index) => {
            const createdAt = new Date(note.created_at);
            return (
              <div
                key={note.id}
                className="stagger-item relative pl-8"
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
                {/* Timeline line */}
                {index < allNotes.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-0 w-px bg-[var(--border)]" />
                )}
                {/* Timeline dot - gradient */}
                <div className="absolute left-0 top-2 w-[23px] h-[23px] rounded-full gradient-bg shadow-[0_0_8px_rgba(79,110,247,0.3)]" />

                <div className="pb-6">
                  <div className="bg-white rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] hover:border-[var(--accent-blue)]/20 transition-all duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {formatDate(createdAt)}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        at{" "}
                        {createdAt.toLocaleTimeString("en-AU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
