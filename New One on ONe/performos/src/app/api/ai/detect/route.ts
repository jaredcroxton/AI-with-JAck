import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectRatingFlags } from "@/lib/flag-engine";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TEXT_SIGNALS_PROMPT = `You are a risk detection system for PerformOS, a workplace one-on-one platform. Analyse the team member's reflection text for the following signals:

1. FLIGHT RISK: mentions of leaving, looking elsewhere, "considering my options", "not sure how long", resignation hints
2. BURNOUT: exhaustion, overwhelm, "can't keep up", working weekends, "running on empty", sleep issues from work stress
3. CONFLICT: tension with colleagues, feeling undermined, "toxic", "not getting along", interpersonal issues
4. PSYCHOLOGICAL SAFETY: fear of speaking up, "walking on eggshells", "don't feel safe", afraid of consequences, not feeling heard
5. MANAGER DISCONNECT: not being heard, lack of trust, micromanagement, "no point raising it", repeated ignored requests
6. REPEATED SUPPORT REQUESTS: the same or very similar support request appearing across multiple weeks

For each signal detected, return a JSON array of objects with:
- flag_type: one of "flight_risk", "burnout", "conflict", "psychological_safety", "disengagement"
- severity: "caution" or "high_risk"
- evidence: a one to two sentence explanation of what you detected and why it matters

If no signals are detected, return an empty array: []

Rules:
- Only flag genuine signals, not minor frustrations
- Use "high_risk" only for clear, concerning language
- Use "caution" for early warning signs
- Never fabricate signals that are not in the text
- Return ONLY valid JSON, no other text`;

async function detectTextFlags(
  currentReflection: Record<string, unknown>,
  previousReflections: Record<string, unknown>[]
): Promise<
  { flag_type: string; severity: string; evidence: string }[]
> {
  const allTexts: string[] = [];

  // Gather all text from current reflection
  const textFields = [
    "energy_comment",
    "motivation_comment",
    "clarity_text",
    "clarity_comment",
    "support_comment",
    "workload_text",
    "workload_comment",
    "overall_comment",
    "notes",
  ];

  allTexts.push("CURRENT WEEK:");
  for (const field of textFields) {
    const val = currentReflection[field] as string | null;
    if (val) allTexts.push(`${field}: "${val}"`);
  }

  // Include previous weeks for pattern detection (repeated requests)
  for (const prev of previousReflections.slice(0, 3)) {
    allTexts.push(`\nPREVIOUS WEEK (${prev.week_of}):`);
    for (const field of textFields) {
      const val = prev[field] as string | null;
      if (val) allTexts.push(`${field}: "${val}"`);
    }
  }

  const combinedText = allTexts.join("\n");
  if (combinedText.replace(/CURRENT WEEK:|PREVIOUS WEEK.*:/g, "").trim().length < 10) {
    return [];
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TEXT_SIGNALS_PROMPT },
        {
          role: "user",
          content: `Analyse this reflection data:\n\n${combinedText}\n\nReturn JSON with key "flags" containing the array.`,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    return parsed.flags || [];
  } catch (error) {
    console.error("Text flag detection error:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { teamMemberId, weekOf } = await request.json();

    if (!teamMemberId || !weekOf) {
      return NextResponse.json(
        { error: "Missing teamMemberId or weekOf" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get current reflection
    const { data: current } = await supabase
      .from("reflections")
      .select("*")
      .eq("team_member_id", teamMemberId)
      .eq("week_of", weekOf)
      .is("deleted_at", null)
      .single();

    if (!current) {
      return NextResponse.json({ error: "Reflection not found" }, { status: 404 });
    }

    // Get previous reflections (up to five weeks)
    const { data: history } = await supabase
      .from("reflections")
      .select("*")
      .eq("team_member_id", teamMemberId)
      .lt("week_of", weekOf)
      .is("deleted_at", null)
      .order("week_of", { ascending: false })
      .limit(5);

    const previousReflections = history || [];

    // Get team member's manager
    const { data: profile } = await supabase
      .from("profiles")
      .select("manager_id, full_name")
      .eq("id", teamMemberId)
      .single();

    if (!profile?.manager_id) {
      return NextResponse.json({ flags: [], message: "No manager assigned" });
    }

    // Run deterministic rating rules
    const ratingFlags = detectRatingFlags(current, previousReflections);

    // Run AI text analysis
    const textFlags = await detectTextFlags(current, previousReflections);

    // Combine all flags
    const allFlags = [
      ...ratingFlags,
      ...textFlags.map((f) => ({
        flag_type: f.flag_type as "disengagement" | "burnout" | "conflict" | "psychological_safety" | "flight_risk",
        severity: f.severity as "caution" | "high_risk",
        evidence: f.evidence,
      })),
    ];

    if (allFlags.length === 0) {
      return NextResponse.json({ flags: [], message: "No flags detected" });
    }

    // Create flags and auto-generate action items
    const createdFlags = [];

    for (const flag of allFlags) {
      // Insert risk flag
      const { data: newFlag, error: flagErr } = await supabase
        .from("risk_flags")
        .insert({
          team_member_id: teamMemberId,
          session_id: null,
          flag_type: flag.flag_type,
          severity: flag.severity,
          evidence: flag.evidence,
          detected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (flagErr) {
        console.error("Flag insert error:", flagErr);
        continue;
      }

      // Auto-generate action item linked to this flag
      const flagLabel = flag.flag_type.replace(/_/g, " ");
      const severityLabel = flag.severity === "high_risk" ? "High risk" : "Caution";

      const { error: actionErr } = await supabase.from("action_items").insert({
        session_id: null,
        assigned_to: teamMemberId,
        created_by: profile.manager_id,
        flag_id: newFlag.id,
        title: `${severityLabel}: ${flagLabel} detected for ${profile.full_name}`,
        description: flag.evidence,
        status: "open",
      });

      if (actionErr) {
        console.error("Action item insert error:", actionErr);
      }

      createdFlags.push(newFlag);
    }

    return NextResponse.json({
      flags: createdFlags,
      message: `${createdFlags.length} flag(s) created with action items`,
    });
  } catch (error) {
    console.error("Detection error:", error);
    return NextResponse.json(
      { error: "Detection failed" },
      { status: 500 }
    );
  }
}
