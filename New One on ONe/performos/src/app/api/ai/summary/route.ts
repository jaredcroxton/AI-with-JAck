import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { memberName, reflections } = await request.json();

    if (!reflections || reflections.length === 0) {
      return NextResponse.json({ summary: null });
    }

    const reflectionSummary = reflections
      .map(
        (r: Record<string, unknown>) =>
          `Week of ${r.week_of}: Confidence ${r.energy_rating}/5, Motivation ${r.motivation_rating}/5, Support ${r.support_rating}/5, Overall ${r.overall_rating}/5. ` +
          (r.energy_comment ? `Confidence comment: "${r.energy_comment}". ` : "") +
          (r.motivation_comment ? `Motivation comment: "${r.motivation_comment}". ` : "") +
          (r.clarity_text ? `Manager support needed: "${r.clarity_text}". ` : "") +
          (r.support_comment ? `Support comment: "${r.support_comment}". ` : "") +
          (r.workload_text ? `Self-improvement: "${r.workload_text}". ` : "") +
          (r.overall_comment ? `Overall comment: "${r.overall_comment}". ` : "") +
          (r.notes ? `Additional notes: "${r.notes}".` : "")
      )
      .join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a coaching assistant for managers using PerformOS, a one-on-one performance platform. Analyse the team member's weekly reflections and provide actionable coaching insights.

Rules:
- Be concise and direct
- Focus on patterns and trends, not individual weeks
- Suggest specific conversation starters for the next one-on-one
- Flag any concerning patterns (declining scores, repeated requests for support)
- Use a warm, professional tone
- Never use em dashes
- Spell out numbers one to nine, use numerals for 10+
- Do not use the name "Sarah" in any examples`,
        },
        {
          role: "user",
          content: `Here are ${memberName}'s weekly reflections from the last six weeks:\n\n${reflectionSummary}\n\nProvide:\n1. A brief pattern summary (two to three sentences)\n2. Key areas to discuss in the next one-on-one (two to three bullet points)\n3. One coaching suggestion for the manager`,
        },
      ],
    });

    return NextResponse.json({
      summary: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
