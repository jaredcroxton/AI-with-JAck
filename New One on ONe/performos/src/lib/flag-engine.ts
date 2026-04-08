/**
 * PerformOS Flag Detection Engine
 *
 * Eight rating-based rules (deterministic, no AI needed):
 * 1. Critical score: any rating of 1 → high_risk
 * 2. Low score: any rating of 2 → caution
 * 3. Sustained low: rating 1-2 for two+ consecutive weeks → high_risk
 * 4. Declining trend: same metric drops two+ weeks in a row → caution
 * 5. Multi-metric drop: three+ metrics drop in same week → high_risk
 * 6. Score divergence: one metric 1-2 while another 4-5 → caution
 * 7. Missing reflection: no submission for the week → caution
 * 8. Consecutive misses: no submission two+ weeks in a row → high_risk
 */

import { RATING_QUESTIONS } from "@/lib/reflection-questions";

const RATING_KEYS = RATING_QUESTIONS.map((q) => q.key);

interface Reflection {
  week_of: string;
  [key: string]: unknown;
}

interface DetectedFlag {
  flag_type: "disengagement" | "burnout" | "conflict" | "psychological_safety" | "flight_risk";
  severity: "caution" | "high_risk";
  evidence: string;
}

function getRating(r: Reflection, key: string): number | null {
  const v = r[key];
  return typeof v === "number" ? v : null;
}

/**
 * Run all eight deterministic rating rules against a new reflection
 * and the previous weeks of data.
 *
 * @param current - The just-submitted reflection
 * @param history - Previous reflections ordered newest first (not including current)
 */
export function detectRatingFlags(
  current: Reflection,
  history: Reflection[]
): DetectedFlag[] {
  const flags: DetectedFlag[] = [];
  const previous = history.length > 0 ? history[0] : null;
  const twoWeeksAgo = history.length > 1 ? history[1] : null;

  for (const key of RATING_KEYS) {
    const label = RATING_QUESTIONS.find((q) => q.key === key)?.label || key;
    const val = getRating(current, key);
    const prevVal = previous ? getRating(previous, key) : null;
    const twoVal = twoWeeksAgo ? getRating(twoWeeksAgo, key) : null;

    if (val === null) continue;

    // Rule 1: Critical score (rating of 1)
    if (val === 1) {
      flags.push({
        flag_type: "disengagement",
        severity: "high_risk",
        evidence: `${label} scored 1 out of 5 this week. This is a critical score that requires immediate attention.`,
      });
    }

    // Rule 2: Low score (rating of 2)
    if (val === 2) {
      flags.push({
        flag_type: "disengagement",
        severity: "caution",
        evidence: `${label} scored 2 out of 5 this week. This is below the healthy range.`,
      });
    }

    // Rule 3: Sustained low (1-2 for two+ consecutive weeks)
    if (val <= 2 && prevVal !== null && prevVal <= 2) {
      flags.push({
        flag_type: "burnout",
        severity: "high_risk",
        evidence: `${label} has been at ${prevVal} and ${val} for two consecutive weeks. This sustained low pattern may indicate burnout or deeper disengagement.`,
      });
    }

    // Rule 4: Declining trend (drops two+ weeks in a row)
    if (
      prevVal !== null &&
      twoVal !== null &&
      val < prevVal &&
      prevVal < twoVal
    ) {
      flags.push({
        flag_type: "disengagement",
        severity: "caution",
        evidence: `${label} has declined for three consecutive weeks: ${twoVal} → ${prevVal} → ${val}. This downward trend should be discussed.`,
      });
    }
  }

  // Rule 5: Multi-metric drop (three+ metrics drop in same week)
  if (previous) {
    let dropCount = 0;
    const droppedMetrics: string[] = [];
    for (const key of RATING_KEYS) {
      const val = getRating(current, key);
      const prevVal = getRating(previous, key);
      if (val !== null && prevVal !== null && val < prevVal) {
        dropCount++;
        droppedMetrics.push(
          RATING_QUESTIONS.find((q) => q.key === key)?.label || key
        );
      }
    }
    if (dropCount >= 3) {
      flags.push({
        flag_type: "burnout",
        severity: "high_risk",
        evidence: `${dropCount} metrics dropped this week compared to last week (${droppedMetrics.join(", ")}). A drop across multiple areas may signal burnout or a significant issue.`,
      });
    }
  }

  // Rule 6: Score divergence (one metric 1-2 while another 4-5)
  const currentRatings = RATING_KEYS.map((key) => ({
    key,
    label: RATING_QUESTIONS.find((q) => q.key === key)?.label || key,
    val: getRating(current, key),
  })).filter((r) => r.val !== null);

  const lowMetrics = currentRatings.filter((r) => r.val! <= 2);
  const highMetrics = currentRatings.filter((r) => r.val! >= 4);

  if (lowMetrics.length > 0 && highMetrics.length > 0) {
    flags.push({
      flag_type: "psychological_safety",
      severity: "caution",
      evidence: `Score divergence detected: ${lowMetrics.map((m) => `${m.label} (${m.val})`).join(", ")} vs ${highMetrics.map((m) => `${m.label} (${m.val})`).join(", ")}. This gap may point to a specific area that needs targeted support.`,
    });
  }

  // Deduplicate: keep the highest severity per flag_type
  const deduped = new Map<string, DetectedFlag>();
  for (const flag of flags) {
    const existing = deduped.get(flag.flag_type);
    if (
      !existing ||
      (existing.severity === "caution" && flag.severity === "high_risk")
    ) {
      deduped.set(flag.flag_type, flag);
    } else if (existing) {
      // Merge evidence
      existing.evidence += " " + flag.evidence;
    }
  }

  return Array.from(deduped.values());
}

/**
 * Detect missing reflection flags.
 * Call this separately (e.g. via cron or when manager views dashboard).
 */
export function detectMissingReflectionFlags(
  memberName: string,
  missedWeeks: string[]
): DetectedFlag[] {
  const flags: DetectedFlag[] = [];

  if (missedWeeks.length >= 2) {
    flags.push({
      flag_type: "disengagement",
      severity: "high_risk",
      evidence: `${memberName} has not submitted reflections for ${missedWeeks.length} consecutive weeks. Consecutive missed reflections may indicate disengagement or avoidance.`,
    });
  } else if (missedWeeks.length === 1) {
    flags.push({
      flag_type: "disengagement",
      severity: "caution",
      evidence: `${memberName} did not submit a reflection for the week of ${missedWeeks[0]}. A missed week should be followed up on.`,
    });
  }

  return flags;
}
