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

    const { data: members } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("manager_id", managerId)
      .is("deleted_at", null);

    if (!members || members.length === 0) {
      return NextResponse.json({ analysis: null });
    }

    const memberIds = members.map((m) => m.id);
    const mondays = getLastNMondays(6);
    const currentWeek = toISODate(mondays[0]);
    const mondayDates = mondays.map(toISODate);

    const { data: reflections } = await supabase
      .from("reflections")
      .select("*")
      .in("team_member_id", memberIds)
      .in("week_of", mondayDates)
      .is("deleted_at", null)
      .order("week_of", { ascending: false });

    const allReflections = reflections || [];

    const { data: flags } = await supabase
      .from("risk_flags")
      .select("*, member:profiles!risk_flags_team_member_id_fkey(full_name)")
      .in("team_member_id", memberIds)
      .is("resolved_at", null)
      .is("deleted_at", null);

    const activeFlags = flags || [];

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

    const missedMembers = members.filter(
      (m) =>
        !allReflections.some(
          (r) => r.team_member_id === m.id && r.week_of === currentWeek
        )
    );

    const prompt = `Here is this week's reflection data for the whole team:\n\n${memberSummaries.join("\n\n")}\n\n${missedMembers.length > 0 ? `Members who did not submit this week: ${missedMembers.map((m) => m.full_name).join(", ")}.\n\n` : ""}There are ${activeFlags.length} active risk flag(s) across the team.

Return a JSON object with this exact structure:
{
  "pulse_score": <number 1-10 representing overall team health this week>,
  "pulse_label": "<one to three word label like 'Needs attention' or 'Strong week' or 'Mixed signals'>",
  "health_summary": "<two to three sentence overview of team health this week>",
  "bright_spots": [
    { "name": "<team member name>", "highlight": "<one sentence on what is going well for them>" }
  ],
  "red_zone": [
    { "name": "<team member name>", "concern": "<one sentence on what needs attention>", "conversation_starter": "<a specific question the manager can ask them>" }
  ],
  "patterns": ["<pattern 1>", "<pattern 2>"],
  "actions": ["<specific action 1>", "<specific action 2>", "<specific action 3>"],
  "missed_reflections": ["<name of member who missed>"]
}

Rules:
- pulse_score: 1-3 is concerning, 4-6 is mixed, 7-10 is healthy
- bright_spots: include anyone with scores of 4 or 5 across the board, or showing improvement, or positive language in their comments. Always try to find at least one bright spot.
- red_zone: include anyone with scores of 1 or 2, declining trends, or concerning text signals
- patterns: common themes you see across the team
- actions: specific things the manager should do this week
- missed_reflections: names of anyone who did not submit
- Never use em dashes
- Do not use the name "Sarah"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a team coaching analyst for Pulse Check360. Return structured JSON analysis of team health. Be warm but direct. Always find bright spots alongside concerns.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0].message.content;
    const analysis = content ? JSON.parse(content) : null;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Team summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate team summary" },
      { status: 500 }
    );
  }
}
