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

    const memberIds = (members || []).map((m) => m.id);

    const mondays = getLastNMondays(6);
    const currentWeek = toISODate(mondays[0]);
    const mondayDates = mondays.map(toISODate);
    const sixWeeksAgo = mondayDates[mondayDates.length - 1];

    let reflections: Record<string, unknown>[] = [];
    if (memberIds.length > 0) {
      const { data } = await supabase
        .from("reflections")
        .select("*")
        .in("team_member_id", memberIds)
        .gte("week_of", sixWeeksAgo)
        .is("deleted_at", null)
        .order("week_of", { ascending: false });
      reflections = data || [];
    }

    let activeFlags: Record<string, unknown>[] = [];
    if (memberIds.length > 0) {
      const { data } = await supabase
        .from("risk_flags")
        .select("*, member:profiles!risk_flags_team_member_id_fkey(full_name)")
        .in("team_member_id", memberIds)
        .is("resolved_at", null)
        .is("deleted_at", null);
      activeFlags = data || [];
    }

    const flagSummary = activeFlags.length > 0
      ? `Active flags: ${activeFlags.map((f) => `${(f.member as { full_name: string }).full_name}: ${f.flag_type} (${f.severity})`).join(", ")}`
      : "No active flags.";

    const teamSize = members?.length || 0;
    const currentWeekCount = reflections.filter((r) => r.week_of === currentWeek).length;

    const prompt = `You are coaching a manager who has ${teamSize} team members. ${currentWeekCount} submitted reflections this week. ${flagSummary}

Generate practical, simple self-coaching content for this manager. Return JSON:
{
  "weekly_focus": "<one sentence: the single most important thing for the manager to focus on this week based on their team's data>",
  "activities": [
    {
      "title": "<short activity title, max five words>",
      "description": "<one to two sentences explaining what to do, written simply>",
      "time": "<how long it takes, e.g. 'two minutes', 'five minutes'>",
      "category": "<one of: communication, wellbeing, team_building, flag_response>"
    }
  ],
  "flag_coaching": [
    {
      "flag_type": "<the flag type>",
      "member_name": "<who it relates to>",
      "what_to_do": "<one to two simple sentences on how to handle this specific flag>",
      "what_to_say": "<a specific sentence or question the manager can use in conversation>"
    }
  ],
  "self_care_tip": "<one sentence reminder for the manager to look after themselves too>"
}

Rules:
- Activities must be dead simple. A busy manager should read it and immediately know what to do.
- Include three to five activities covering a mix of categories.
- If there are active flags, include flag_coaching for each one. If no flags, return empty array.
- Keep language warm, direct, and jargon-free.
- Never use em dashes.
- Do not use the name "Sarah".
- Spell out numbers one to nine, use numerals for 10+.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a manager wellbeing and coaching advisor for Pulse Check360. Generate simple, practical coaching activities. Think of yourself as a supportive coach who makes things easy.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0].message.content;
    const coaching = content ? JSON.parse(content) : null;

    return NextResponse.json({ coaching });
  } catch (error) {
    console.error("Coaching error:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching" },
      { status: 500 }
    );
  }
}
