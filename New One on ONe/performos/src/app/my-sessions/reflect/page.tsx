"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  REFLECTION_QUESTIONS,
  RATING_QUESTIONS,
} from "@/lib/reflection-questions";
import { formatMondayLabel } from "@/lib/dates";

type Answers = Record<string, number | string | null>;

function RatingSelector({
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  value: number | null;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 justify-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-[72px] h-[72px] rounded-2xl text-2xl font-bold transition-all ${
              value === n
                ? "gradient-bg text-white shadow-lg shadow-[var(--accent-blue)]/20 scale-110"
                : "bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200 hover:scale-105"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-3 px-2">
        <span className="text-sm text-[var(--text-secondary)]">{lowLabel}</span>
        <span className="text-sm text-[var(--text-secondary)]">{highLabel}</span>
      </div>
    </div>
  );
}

function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center gap-2.5 justify-center mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 rounded-full transition-all ${
            i === current
              ? "w-10 gradient-bg"
              : i < current
                ? "w-2.5 bg-[var(--accent-teal)]"
                : "w-2.5 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function ReflectionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekOf = searchParams.get("week");

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    energy_rating: null,
    motivation_rating: null,
    clarity_text: null,
    support_rating: null,
    workload_text: null,
    overall_rating: null,
  });
  const [comments, setComments] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = REFLECTION_QUESTIONS.length + 1;
  const isNotesStep = step === REFLECTION_QUESTIONS.length;

  const currentQuestion =
    step < REFLECTION_QUESTIONS.length ? REFLECTION_QUESTIONS[step] : null;

  const canProceed = (() => {
    if (!currentQuestion) return true;
    const val = answers[currentQuestion.key];
    const comment = (comments[currentQuestion.commentKey] || "").trim();

    // Must have both the answer AND a comment
    if (!comment) return false;

    if (currentQuestion.type === "rating") return val !== null;
    return typeof val === "string" && val.trim().length > 0;
  })();

  const handleRating = useCallback(
    (value: number) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
    },
    [currentQuestion]
  );

  const handleText = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
    },
    [currentQuestion]
  );

  const handleComment = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      setComments((prev) => ({ ...prev, [currentQuestion.commentKey]: value }));
    },
    [currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  }, [canProceed, step, totalSteps]);

  async function handleSubmit() {
    if (!weekOf) return;
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/reflections/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        team_member_id: user.id,
        week_of: weekOf,
        energy_rating: answers.energy_rating,
        motivation_rating: answers.motivation_rating,
        clarity_text: (answers.clarity_text as string)?.trim() || null,
        support_rating: answers.support_rating,
        workload_text: (answers.workload_text as string)?.trim() || null,
        overall_rating: answers.overall_rating,
        energy_comment: comments.energy_comment?.trim() || null,
        motivation_comment: comments.motivation_comment?.trim() || null,
        clarity_comment: comments.clarity_comment?.trim() || null,
        support_comment: comments.support_comment?.trim() || null,
        workload_comment: comments.workload_comment?.trim() || null,
        overall_comment: comments.overall_comment?.trim() || null,
        notes: notes.trim() || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      if (res.status === 409) {
        setError("You have already submitted a reflection for this week.");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
      setSubmitting(false);
      return;
    }

    router.push("/my-sessions");
    router.refresh();
  }

  if (!weekOf) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">No week selected.</p>
      </div>
    );
  }

  const weekDate = new Date(weekOf + "T00:00:00");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent-teal)]/10 text-sm text-[var(--accent-teal)] font-medium mb-5">
            {formatMondayLabel(weekDate)}
          </div>
        </div>

        <ProgressDots total={totalSteps} current={step} />

        <div className="bg-white rounded-3xl p-10 sm:p-12 shadow-sm border border-gray-100">
          {currentQuestion && !isNotesStep ? (
            <div>
              <div className="text-center">
                <div className="text-sm font-medium text-[var(--accent-teal)] mb-3">
                  Question {step + 1} of {REFLECTION_QUESTIONS.length}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-on-light)] mb-10 leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>

              {currentQuestion.type === "rating" ? (
                <RatingSelector
                  value={answers[currentQuestion.key] as number | null}
                  onChange={handleRating}
                  lowLabel={currentQuestion.low}
                  highLabel={currentQuestion.high}
                />
              ) : (
                <textarea
                  value={(answers[currentQuestion.key] as string) || ""}
                  onChange={(e) => handleText(e.target.value)}
                  rows={4}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-base text-[var(--text-on-light)] text-left focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition resize-none"
                  placeholder={currentQuestion.placeholder}
                />
              )}

              {/* Comment box - required on every question */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {currentQuestion.commentPrompt}
                  <span className="text-[var(--soft-red)]"> *</span>
                </label>
                <textarea
                  value={comments[currentQuestion.commentKey] || ""}
                  onChange={(e) => handleComment(e.target.value)}
                  rows={3}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-base text-[var(--text-on-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition resize-none"
                  placeholder="Write your thoughts here..."
                />
              </div>

              <div className="mt-10 flex gap-4">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-4 rounded-2xl text-base font-semibold text-[var(--text-secondary)] bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`flex-1 py-4 rounded-2xl text-base font-semibold text-white transition ${
                    canProceed
                      ? "gradient-bg hover:opacity-90"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm font-medium text-[var(--accent-teal)] mb-3 text-center">
                Almost done
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-on-light)] mb-3 text-center leading-snug">
                Anything else on your mind?
              </h2>
              <p className="text-base text-[var(--text-secondary)] mb-8 text-center">
                Optional. Share anything you want your manager to know.
              </p>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-base text-[var(--text-on-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition resize-none"
                placeholder="What went well, what was tough, what would help next week..."
              />

              {/* Summary */}
              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Your responses
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {RATING_QUESTIONS.map((q) => (
                    <div
                      key={q.key}
                      className="text-center p-4 rounded-2xl bg-gray-50"
                    >
                      <div className="text-xs text-[var(--text-secondary)] mb-1">
                        {q.label}
                      </div>
                      <div className="text-2xl font-bold gradient-text">
                        {answers[q.key] as number}
                      </div>
                    </div>
                  ))}
                </div>
                {REFLECTION_QUESTIONS.map((q) => {
                  const comment = comments[q.commentKey];
                  const textAnswer =
                    q.type === "text" ? (answers[q.key] as string) : null;
                  if (!comment && !textAnswer) return null;
                  return (
                    <div key={q.key} className="p-4 rounded-2xl bg-gray-50">
                      <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">
                        {q.label}
                      </div>
                      {textAnswer && (
                        <div className="text-sm text-[var(--text-on-light)] mb-2">
                          {textAnswer}
                        </div>
                      )}
                      {comment && (
                        <div className="text-sm text-[var(--text-secondary)] italic">
                          {comment}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="mt-6 p-4 rounded-2xl bg-red-50 text-[var(--soft-red)] text-sm">
                  {error}
                </div>
              )}

              <div className="mt-10 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-4 rounded-2xl text-base font-semibold text-[var(--text-secondary)] bg-gray-100 hover:bg-gray-200 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-4 rounded-2xl text-base font-semibold text-white gradient-bg hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit reflection"}
                </button>
              </div>

              <p className="mt-6 text-sm text-[var(--text-secondary)] text-center">
                Once submitted, this reflection cannot be edited.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReflectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg gradient-bg animate-pulse" />
        </div>
      }
    >
      <ReflectionForm />
    </Suspense>
  );
}
