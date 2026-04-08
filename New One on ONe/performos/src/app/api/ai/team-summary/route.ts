import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import OpenAI from "openai";
import { getLastNMondays, toISODate } from "@/lib/dates";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { managerId } = await request.json();
    if (!managerId) {
      return NextResponse.json({ error: "Missing managerId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get team members
    const { data: members } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("manager_id", managerId)
      .is("deleted_at", null);

    if (!members || members.length === 0) {
      return NextResponse.json({ summary: "No team members to analyse." });
    }

    const memberIds = members.map((m) => m.id);
    const mondays = getLastNMondays(6);
    const currentWeek = toISODate(mondays[0]);
    const mondayDates = mondays.map(toISODate);

    // Get all reflections
    const { data: reflections } = await supabase
      .from("reflections")
      .select("*")
      .in("team_member_id", memberIds)
      .in("week_of", mondayDates)
      .is("deleted_at", null)
      .order("week_of", { ascending: false });

    const allReflections = reflections || [];

    // Get active flags
    const { data: flags } = await supabase
      .from("risk_flags")
      .select("*, member:profiles!risk_flags_team_member_id_fkey(full_name)")
      .in("team_member_id", memberIds)
      .is("resolved_at", null)
      .is("deleted_at", null);

    const activeFlags = flags || [];

    // Build summary data per member
    const memberSummaries = members.map((member) => {
      const memberReflections = allReflections.filter(
        (r) => r.team_member_id === member.id
      );
      const currentReflection = memberReflections.find(
        (r) => r.week_of === currentWeek
      );
      const memberFlags = activeFlags.filter(
        (f) => f.team_member_id === member.id
      );

      const missedCurrentWeek = !currentReflection;

      let summary = `${member.full_name}: `;
      if (currentReflection) {
        summary += `Confidence ${currentReflection.energy_rating}/5, Motivation ${currentReflection.motivation_rating}/5, Support ${currentReflection.support_rating}/5, Overall ${currentReflection.overall_rating}/5. `;
        if (currentReflection.energy_comment)
          summary += `Confidence note: "${currentReflection.energy_comment}". `;
        if (currentReflection.motivation_comment)
          summary += `Motivation note: "${currentReflection.motivation_comment}". `;
        if (currentReflection.clarity_text)
          summary += `Needs from manager: "${currentReflection.clarity_text}". `;
        if (currentReflection.workload_text)
          summary += `Self-improvement: "${currentReflection.workload_text}". `;
        if (currentReflection.overall_comment)
          summary += `Overall note: "${currentReflection.overall_comment}". `;
        if (currentReflection.notes)
          summary += `Additional: "${currentReflection.notes}". `;
      } else {
        summary += "DID NOT SUBMIT a reflection this week. ";
      }

      if (memberFlags.length > 0) {
        summary += `ACTIVE FLAGS: ${memberFlags.map((f) => `${f.flag_type} (${f.severity})`).join(", ")}. `;
      }

      return summary;
    });

    // Members who missed
    const missedMembers = members.filter(
      (m) => !allReflections.some(
        (r) => r.team_member_id === m.id && r.week_of === currentWeek
      )
    );

    const prompt = `Here is this week's reflection data for the whole team:\n\n${memberSummaries.join("\n\n")}\n\n${missedMembers.length > 0 ? `Members who did not submit this week: ${missedMembers.map((m) => m.full_name).join(", ")}.\n\n` : ""}There are ${activeFlags.length} active risk flag(s) across the team.\n\nProvide:\n1. A team health summary for this week (three to four sentences)\n2. Identify any members in the red zone (scores of 1 or 2) and explain why they need attention\n3. Patterns across the team (common themes in support requests, motivation drivers, etc.)\n4. Two to three specific actions the manager should take this week\n5. Any members who missed their reflection and why that matters`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a team coaching analyst for PerformOS. You analyse the whole team's weekly reflections and give the manager a clear, actionable team health report.

Rules:
- Lead with the most important finding
- Be specific about which team members need attention and why
- Red zone means any score of 1 or 2
- Flag missed reflections as a concern
- Suggest specific conversation starters
- Use a warm but direct professional tone
- Never use em dashes
- Spell out numbers one to nine, use numerals for 10+
- Do not use the name "Sarah" in any examples`,
        },
        { role: "user", content: prompt },
      ],
    });

    return NextResponse.json({
      summary: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Team summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate team summary" },
      { status: 500 }
    );
  }
}
