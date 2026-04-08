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
) {
  const textFields = [
    "energy_comment", "motivation_comment", "clarity_text",
    "clarity_comment", "support_comment", "workload_text",
    "workload_comment", "overall_comment", "notes",
  ];

  const allTexts: string[] = ["CURRENT WEEK:"];
  for (const field of textFields) {
    const val = currentReflection[field] as string | null;
    if (val) allTexts.push(`${field}: "${val}"`);
  }

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
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // Insert the reflection
    const { data: reflection, error: insertError } = await supabase
      .from("reflections")
      .insert({
        team_member_id: body.team_member_id,
        week_of: body.week_of,
        energy_rating: body.energy_rating,
        motivation_rating: body.motivation_rating,
        clarity_text: body.clarity_text,
        support_rating: body.support_rating,
        workload_text: body.workload_text,
        overall_rating: body.overall_rating,
        energy_comment: body.energy_comment,
        motivation_comment: body.motivation_comment,
        clarity_comment: body.clarity_comment,
        support_comment: body.support_comment,
        workload_comment: body.workload_comment,
        overall_comment: body.overall_comment,
        notes: body.notes,
      })
      .select()
      .single();

    if (insertError) {
      const status = insertError.code === "23505" ? 409 : 500;
      return NextResponse.json({ error: insertError.message }, { status });
    }

    // Get previous reflections for context
    const { data: history } = await supabase
      .from("reflections")
      .select("*")
      .eq("team_member_id", body.team_member_id)
      .lt("week_of", body.week_of)
      .is("deleted_at", null)
      .order("week_of", { ascending: false })
      .limit(5);

    const previousReflections = history || [];

    // Get team member's manager
    const { data: profile } = await supabase
      .from("profiles")
      .select("manager_id, full_name")
      .eq("id", body.team_member_id)
      .single();

    if (!profile?.manager_id) {
      return NextResponse.json({ success: true, flags: 0 });
    }

    // Run deterministic rating rules
    const ratingFlags = detectRatingFlags(reflection, previousReflections);

    // Run AI text analysis
    const textFlags = await detectTextFlags(reflection, previousReflections);

    const allFlags = [
      ...ratingFlags,
      ...textFlags.map((f: { flag_type: string; severity: string; evidence: string }) => ({
        flag_type: f.flag_type,
        severity: f.severity,
        evidence: f.evidence,
      })),
    ];

    // Create flags and auto-generate action items
    let flagCount = 0;
    for (const flag of allFlags) {
      const { data: newFlag, error: flagErr } = await supabase
        .from("risk_flags")
        .insert({
          team_member_id: body.team_member_id,
          flag_type: flag.flag_type,
          severity: flag.severity,
          evidence: flag.evidence,
          detected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (flagErr) continue;

      const flagLabel = flag.flag_type.replace(/_/g, " ");
      const severityLabel = flag.severity === "high_risk" ? "High risk" : "Caution";

      await supabase.from("action_items").insert({
        assigned_to: body.team_member_id,
        created_by: profile.manager_id,
        flag_id: newFlag.id,
        title: `${severityLabel}: ${flagLabel} detected for ${profile.full_name}`,
        description: flag.evidence,
        status: "open",
      });

      flagCount++;
    }

    return NextResponse.json({ success: true, flags: flagCount });
  } catch (error) {
    console.error("Reflection submit error:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
