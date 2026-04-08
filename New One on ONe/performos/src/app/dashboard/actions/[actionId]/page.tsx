import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/dates";
import Link from "next/link";
import { AddNoteForm } from "./add-note-form";
import { StatusUpdater } from "./status-updater";

export default async function ActionDetailPage(
  props: PageProps<"/dashboard/actions/[actionId]">
) {
  const { actionId } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=manager");

  // Get action item
  const { data: item } = await supabase
    .from("action_items")
    .select("*, assigned_profile:profiles!action_items_assigned_to_fkey(full_name, email)")
    .eq("id", actionId)
    .eq("created_by", user.id)
    .single();

  if (!item) redirect("/dashboard/actions");

  // Get linked risk flag if any
  let flag = null;
  if (item.flag_id) {
    const { data } = await supabase
      .from("risk_flags")
      .select("*")
      .eq("id", item.flag_id)
      .single();
    flag = data;
  }

  // Get all notes (audit trail) - ordered oldest first for chronological reading
  const { data: notes } = await supabase
    .from("action_item_notes")
    .select("*, author:profiles!action_item_notes_author_id_fkey(full_name)")
    .eq("action_item_id", actionId)
    .order("created_at", { ascending: true });

  const auditNotes = notes || [];

  const assignedProfile = item.assigned_profile as {
    full_name: string;
    email: string;
  };

  function statusStyle(status: string) {
    if (status === "open")
      return "bg-[var(--soft-red)]/10 text-[var(--soft-red)]";
    if (status === "in_progress")
      return "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]";
    return "bg-emerald-50 text-emerald-600";
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Back */}
      <Link
        href="/dashboard/actions"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-on-light)] transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        All action items
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-[var(--text-on-light)] leading-snug">
            {item.title}
          </h1>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyle(item.status)}`}
          >
            {item.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text-on-light)]">
              Team member:
            </span>
            {assignedProfile.full_name}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text-on-light)]">
              Created:
            </span>
            {formatDate(new Date(item.created_at))} at{" "}
            {new Date(item.created_at).toLocaleTimeString("en-AU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {item.description && (
            <div className="pt-2">
              <span className="font-medium text-[var(--text-on-light)]">
                Description:
              </span>
              <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
                {item.description}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <StatusUpdater actionId={item.id} currentStatus={item.status} />
        </div>
      </div>

      {/* Linked flag */}
      {flag && (
        <div
          className={`rounded-2xl p-5 border ${
            flag.severity === "high_risk"
              ? "bg-[var(--soft-red)]/5 border-[var(--soft-red)]/20"
              : "bg-[var(--amber)]/5 border-[var(--amber)]/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                flag.severity === "high_risk"
                  ? "bg-[var(--soft-red)]"
                  : "bg-[var(--amber)]"
              }`}
            />
            <span className="text-sm font-semibold text-[var(--text-on-light)] capitalize">
              {flag.flag_type.replace(/_/g, " ")}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                flag.severity === "high_risk"
                  ? "bg-[var(--soft-red)]/10 text-[var(--soft-red)]"
                  : "bg-[var(--amber)]/10 text-[var(--amber)]"
              }`}
            >
              {flag.severity.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {flag.evidence}
          </p>
          <div className="text-xs text-[var(--text-secondary)] mt-2">
            Detected {formatDate(new Date(flag.detected_at))} at{" "}
            {new Date(flag.detected_at).toLocaleTimeString("en-AU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      )}

      {/* Audit trail */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-6">
          Activity log
        </h2>

        {auditNotes.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            No notes yet. Document your actions below.
          </p>
        ) : (
          <div className="space-y-0 mb-6">
            {auditNotes.map((note, index) => {
              const author = note.author as { full_name: string };
              const createdAt = new Date(note.created_at);
              return (
                <div key={note.id} className="relative pl-6">
                  {/* Timeline line */}
                  {index < auditNotes.length - 1 && (
                    <div className="absolute left-[7px] top-6 bottom-0 w-px bg-gray-200" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-[var(--accent-teal)] bg-white" />

                  <div className="pb-6">
                    <div className="text-xs text-[var(--text-secondary)] mb-1">
                      <span className="font-medium text-[var(--text-on-light)]">
                        {author.full_name}
                      </span>
                      {" · "}
                      {formatDate(createdAt)} at{" "}
                      {createdAt.toLocaleTimeString("en-AU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-sm text-[var(--text-on-light)] leading-relaxed bg-gray-50 rounded-xl p-4">
                      {note.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add note form */}
        <AddNoteForm actionId={item.id} />
      </div>
    </div>
  );
}
