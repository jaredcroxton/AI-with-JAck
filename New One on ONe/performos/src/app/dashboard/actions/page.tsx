import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/dates";
import Link from "next/link";

export default async function ActionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=manager");

  // Get all action items created by this manager
  const { data: actionItems } = await supabase
    .from("action_items")
    .select("*, assigned_profile:profiles!action_items_assigned_to_fkey(full_name)")
    .eq("created_by", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const items = actionItems || [];
  const openItems = items.filter((i) => i.status !== "completed");
  const resolvedItems = items.filter((i) => i.status === "completed");

  function statusStyle(status: string) {
    if (status === "open")
      return "bg-[var(--soft-red)]/10 text-[var(--soft-red)]";
    if (status === "in_progress")
      return "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]";
    return "bg-emerald-50 text-emerald-600";
  }

  function severityDot(item: Record<string, unknown>) {
    if (!item.flag_id) return null;
    return (
      <div className="w-2 h-2 rounded-full bg-[var(--amber)] shrink-0 mt-1.5" />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-on-light)]">
          Action items
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {openItems.length} open, {resolvedItems.length} resolved
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-2xl gradient-bg opacity-20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-on-light)] mb-2">
            No action items
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Action items are automatically created when risk flags are detected
            from team reflections. You can also create them manually.
          </p>
        </div>
      ) : (
        <>
          {/* Open items */}
          {openItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Open
              </h2>
              {openItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/actions/${item.id}`}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {severityDot(item)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[var(--text-on-light)]">
                        {item.title}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {(item.assigned_profile as { full_name: string })?.full_name} · Created{" "}
                      {formatDate(new Date(item.created_at))}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyle(item.status)}`}
                  >
                    {item.status.replace(/_/g, " ")}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-300 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          )}

          {/* Resolved items */}
          {resolvedItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Resolved
              </h2>
              {resolvedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/actions/${item.id}`}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow opacity-70"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-on-light)] mb-1">
                      {item.title}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {(item.assigned_profile as { full_name: string })?.full_name} · Created{" "}
                      {formatDate(new Date(item.created_at))}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyle(item.status)}`}
                  >
                    completed
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-300 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
