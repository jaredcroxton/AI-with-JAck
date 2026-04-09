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

  function statusPill(status: string) {
    if (status === "open") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--soft-red)]/10 text-[var(--soft-red)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--soft-red)] led-red" />
          open
        </span>
      );
    }
    if (status === "in_progress") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] led-blue" />
          in progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 led-green" />
        completed
      </span>
    );
  }

  function leftBorderClass(item: Record<string, unknown>) {
    if (item.flag_id) return "border-l-[3px] border-l-[var(--soft-red)]";
    if (item.status === "in_progress") return "border-l-[3px] border-l-[var(--accent-blue)]";
    return "";
  }

  return (
    <div className="space-y-8">
      {/* Header with animated counters */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--text-on-light)]">
          Action items
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span
              className="animate-counter-pop inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--soft-red)]/10 text-[var(--soft-red)] text-xs font-bold"
              style={{ animationDelay: "0.1s" }}
            >
              {openItems.length}
            </span>
            open
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span
              className="animate-counter-pop inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold"
              style={{ animationDelay: "0.25s" }}
            >
              {resolvedItems.length}
            </span>
            resolved
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[var(--card-shadow)] border border-[var(--border)] stagger-item" style={{ animationDelay: "0.1s" }}>
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
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider stagger-item" style={{ animationDelay: "0.05s" }}>
                Open
              </h2>
              {openItems.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/dashboard/actions/${item.id}`}
                  className={`stagger-item flex items-start gap-4 bg-white rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] ${leftBorderClass(item)} hover:shadow-[var(--card-shadow-lg)] hover:border-[var(--accent-blue)]/30 transition-all duration-200`}
                  style={{ animationDelay: `${0.08 + index * 0.06}s` }}
                >
                  {item.flag_id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--amber)] shrink-0 mt-1.5 led-red" />
                  )}
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
                  {statusPill(item.status)}
                  <svg
                    className="w-5 h-5 text-gray-300 shrink-0 transition-transform group-hover:translate-x-0.5"
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
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider stagger-item" style={{ animationDelay: `${0.08 + openItems.length * 0.06 + 0.05}s` }}>
                Resolved
              </h2>
              {resolvedItems.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/dashboard/actions/${item.id}`}
                  className="stagger-item flex items-start gap-4 bg-white rounded-2xl p-5 shadow-[var(--card-shadow)] border border-[var(--border)] hover:shadow-[var(--card-shadow-lg)] hover:border-[var(--accent-teal)]/30 transition-all duration-200 opacity-70"
                  style={{ animationDelay: `${0.08 + openItems.length * 0.06 + 0.1 + index * 0.06}s` }}
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
                  {statusPill(item.status)}
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
