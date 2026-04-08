import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import OpenAI from "openai";
import { getLastNMondays, toISODate } from "@/lib/dates";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { executiveId } = await request.json();
    if (!executiveId) {
      return NextResponse.json({ error: "Missing executiveId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get all managers
    const { data: managers } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "manager")
      .is("deleted_at", null);

    if (!managers || managers.length === 0) {
      return NextResponse.json({ analysis: null });
    }

    const mondays = getLastNMondays(6);
    const currentWeek = toISODate(mondays[0]);

    // Build per-manager aggregates
    const managerSummaries: string[] = [];

    for (const manager of managers) {
      const { data: members } = await supabase
        .from("profiles")
        .select("id")
        .eq("manager_id", manager.id)
        .is("deleted_at", null);

      const memberIds = (members || []).map((m) => m.id);
      const teamSize = memberIds.length;

      if (teamSize === 0) {
        managerSummaries.push(`${manager.full_name}: no team members.`);
        continue;
      }

      const { data: reflections } = await supabase
        .from("reflections")
        .select("energy_rating, motivation_rating, support_rating, overall_rating")
        .in("team_member_id", memberIds)
        .eq("week_of", currentWeek)
        .is("deleted_at", null);

      const refs = reflections || [];
      const completionRate = Math.round((refs.length / teamSize) * 100);

      const avg = (key: string) => {
        const vals = refs.map((r) => r[key as keyof typeof r] as number);
        return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "N/A";
      };

      const { count } = await supabase
        .from("risk_flags")
        .select("id", { count: "exact", head: true })
        .in("team_member_id", memberIds)
        .is("resolved_at", null)
        .is("deleted_at", null);

      managerSummaries.push(
        `${manager.full_name}: ${teamSize} team members, ${completionRate}% completion, ` +
        `avg confidence ${avg("energy_rating")}, motivation ${avg("motivation_rating")}, ` +
        `support ${avg("support_rating")}, overall ${avg("overall_rating")}. ` +
        `${count || 0} active risk flags.`
      );
    }

    const prompt = `Here is this week's aggregated data across all managers:\n\n${managerSummaries.join("\n\n")}\n\nReturn JSON:
{
  "org_pulse": <number 1-10 representing overall organisation health>,
  "org_pulse_label": "<short label>",
  "executive_summary": "<three to four sentence overview for the executive. Focus on patterns across managers, not individuals within teams.>",
  "manager_highlights": [
    { "name": "<manager name>", "status": "<green | amber | red>", "insight": "<one sentence about their team's aggregated health>" }
  ],
  "org_patterns": ["<pattern across the organisation>"],
  "recommendations": ["<strategic recommendation for the executive>"]
}

Rules:
- This is AGGREGATED data only. Never mention individual team member names.
- Focus on comparing managers' team health, not diving into individual scores.
- status: green = healthy (avg 4+), amber = mixed (avg 2.5-3.9), red = concern (avg below 2.5)
- Keep language executive-level: strategic, concise, actionable.
- Never use em dashes.
- Do not use the name "Sarah".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an executive advisor for Pulse Check360. Provide strategic, aggregated organisation health insights. Never expose individual team member data.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0].message.content;
    const analysis = content ? JSON.parse(content) : null;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Org summary error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
