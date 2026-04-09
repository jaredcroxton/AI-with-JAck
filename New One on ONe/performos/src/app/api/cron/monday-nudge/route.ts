import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { getLastNMondays, toISODate } from "@/lib/dates";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function teamMemberEmailHtml(
  name: string,
  weekOf: string,
  lastScores: { confidence: number; motivation: number; support: number; overall: number } | null
): string {
  const scoreBar = (label: string, value: number, color: string) => `
    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748B;margin-bottom:4px;">
        <span>${label}</span><span style="color:${color};font-weight:700;">${value}/5</span>
      </div>
      <div style="background:#F1F5F9;border-radius:6px;height:8px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,${color},${color}cc);height:100%;width:${(value / 5) * 100}%;border-radius:6px;"></div>
      </div>
    </div>
  `;

  const lastWeekSection = lastScores
    ? `
      <div style="background:#F8FAFC;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="font-size:13px;font-weight:600;color:#64748B;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Your last week</p>
        ${scoreBar("Confidence", lastScores.confidence, "#4F6EF7")}
        ${scoreBar("Motivation", lastScores.motivation, "#8B5CF6")}
        ${scoreBar("Support", lastScores.support, "#FBBF24")}
        ${scoreBar("Overall", lastScores.overall, "#06D6A0")}
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
        <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#4F6EF7,#06D6A0);width:40px;height:40px;border-radius:10px;margin-bottom:12px;"></div>
            <h1 style="margin:0;font-size:20px;color:#0F172A;">Good morning, ${name.split(" ")[0]}</h1>
            <p style="margin:4px 0 0;font-size:14px;color:#64748B;">Your weekly reflection is ready.</p>
          </div>

          ${lastWeekSection}

          <a href="${APP_URL}/my-sessions/reflect?week=${weekOf}"
             style="display:block;text-align:center;background:linear-gradient(135deg,#4F6EF7,#06D6A0);color:white;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px;">
            Start this week's reflection
          </a>

          <p style="text-align:center;font-size:12px;color:#94A3B8;margin:16px 0 0;">
            Takes less than two minutes. Powered by PerformOS.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function managerEmailHtml(
  name: string,
  submitted: number,
  total: number,
  pendingNames: string[]
): string {
  const completionPct = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const color = completionPct >= 80 ? "#06D6A0" : completionPct >= 50 ? "#FBBF24" : "#EF4444";

  const pendingList = pendingNames.length > 0
    ? pendingNames.map((n) => `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #F1F5F9;">
        <div style="width:8px;height:8px;border-radius:50%;background:#FBBF24;"></div>
        <span style="font-size:14px;color:#0F172A;">${n}</span>
        <span style="font-size:12px;color:#94A3B8;margin-left:auto;">Pending</span>
      </div>`).join("")
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
        <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#4F6EF7,#06D6A0);width:40px;height:40px;border-radius:10px;margin-bottom:12px;"></div>
            <h1 style="margin:0;font-size:20px;color:#0F172A;">Good morning, ${name.split(" ")[0]}</h1>
            <p style="margin:4px 0 0;font-size:14px;color:#64748B;">Here is your team's check-in status.</p>
          </div>

          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;font-weight:800;color:${color};">${completionPct}%</div>
            <p style="font-size:14px;color:#64748B;margin:4px 0 0;">${submitted} of ${total} submitted this week</p>
          </div>

          ${pendingNames.length > 0 ? `
            <div style="background:#FFFBEB;border-radius:12px;padding:16px;margin-bottom:24px;">
              <p style="font-size:13px;font-weight:600;color:#92400E;margin:0 0 8px;">Still waiting on</p>
              ${pendingList}
            </div>
          ` : `
            <div style="background:#F0FDF4;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
              <p style="font-size:14px;font-weight:600;color:#059669;margin:0;">Full team check-in complete</p>
            </div>
          `}

          <a href="${APP_URL}/dashboard"
             style="display:block;text-align:center;background:linear-gradient(135deg,#4F6EF7,#06D6A0);color:white;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px;">
            View dashboard
          </a>

          <p style="text-align:center;font-size:12px;color:#94A3B8;margin:16px 0 0;">
            Powered by PerformOS.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const mondays = getLastNMondays(2);
    const currentWeek = toISODate(mondays[0]);
    const lastWeek = toISODate(mondays[1]);

    // Get all team members with their managers
    const { data: teamMembers } = await supabase
      .from("profiles")
      .select("id, email, full_name, manager_id, role")
      .eq("role", "team_member")
      .is("deleted_at", null);

    const members = teamMembers || [];

    // Get this week's reflections to know who already submitted
    const { data: thisWeekReflections } = await supabase
      .from("reflections")
      .select("team_member_id")
      .eq("week_of", currentWeek)
      .is("deleted_at", null);

    const submittedIds = new Set(
      (thisWeekReflections || []).map((r) => r.team_member_id)
    );

    // Get last week's reflections for the mini visual
    const { data: lastWeekReflections } = await supabase
      .from("reflections")
      .select("team_member_id, energy_rating, motivation_rating, support_rating, overall_rating")
      .eq("week_of", lastWeek)
      .is("deleted_at", null);

    const lastWeekMap = new Map(
      (lastWeekReflections || []).map((r) => [
        r.team_member_id,
        {
          confidence: r.energy_rating as number,
          motivation: r.motivation_rating as number,
          support: r.support_rating as number,
          overall: r.overall_rating as number,
        },
      ])
    );

    let teamMembersSent = 0;
    let managersSent = 0;

    // Send team member nudges (only to those who haven't submitted)
    for (const member of members) {
      if (submittedIds.has(member.id)) continue; // Already submitted

      const lastScores = lastWeekMap.get(member.id) || null;

      await resend.emails.send({
        from: "Pulse Check360 <onboarding@resend.dev>",
        to: member.email,
        subject: "Your weekly reflection is ready",
        html: teamMemberEmailHtml(member.full_name, currentWeek, lastScores),
      });

      teamMembersSent++;
    }

    // Send manager summaries
    const { data: managers } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("role", "manager")
      .is("deleted_at", null);

    for (const manager of managers || []) {
      const teamForManager = members.filter(
        (m) => m.manager_id === manager.id
      );
      const total = teamForManager.length;
      if (total === 0) continue;

      const submitted = teamForManager.filter((m) =>
        submittedIds.has(m.id)
      ).length;
      const pendingNames = teamForManager
        .filter((m) => !submittedIds.has(m.id))
        .map((m) => m.full_name);

      await resend.emails.send({
        from: "Pulse Check360 <onboarding@resend.dev>",
        to: manager.email,
        subject: `Team check-in: ${submitted} of ${total} submitted`,
        html: managerEmailHtml(manager.full_name, submitted, total, pendingNames),
      });

      managersSent++;
    }

    return NextResponse.json({
      success: true,
      teamMembersSent,
      managersSent,
      week: currentWeek,
    });
  } catch (error) {
    console.error("Monday nudge error:", error);
    return NextResponse.json({ error: "Failed to send nudges" }, { status: 500 });
  }
}
