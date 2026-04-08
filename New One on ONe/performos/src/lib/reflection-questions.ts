export type QuestionType = "rating" | "text";

interface RatingQuestion {
  key: string;
  commentKey: string;
  label: string;
  question: string;
  type: "rating";
  low: string;
  high: string;
  commentPrompt: string;
}

interface TextQuestion {
  key: string;
  commentKey: string;
  label: string;
  question: string;
  type: "text";
  placeholder: string;
  commentPrompt: string;
}

export type ReflectionQuestion = RatingQuestion | TextQuestion;

export const REFLECTION_QUESTIONS: ReflectionQuestion[] = [
  {
    key: "energy_rating",
    commentKey: "energy_comment",
    label: "Confidence",
    question: "How confident are you going to achieve your targets this week?",
    type: "rating",
    low: "Not confident",
    high: "Very confident",
    commentPrompt: "Talk me through your thoughts",
  },
  {
    key: "motivation_rating",
    commentKey: "motivation_comment",
    label: "Motivation",
    question: "How motivated were you this week?",
    type: "rating",
    low: "Disengaged",
    high: "Driven",
    commentPrompt: "Explain what's driving this score",
  },
  {
    key: "clarity_text",
    commentKey: "clarity_comment",
    label: "Manager support",
    question: "What support do you require from your manager to achieve the target?",
    type: "text",
    placeholder: "Describe any support, resources, or guidance that would help...",
    commentPrompt: "How will this help you hit your target?",
  },
  {
    key: "support_rating",
    commentKey: "support_comment",
    label: "Support",
    question: "How supported did you feel?",
    type: "rating",
    low: "On my own",
    high: "Fully supported",
    commentPrompt: "Explain your reasoning",
  },
  {
    key: "workload_text",
    commentKey: "workload_comment",
    label: "Self-improvement",
    question: "What is within your control to improve your current results?",
    type: "text",
    placeholder: "Think about habits, focus areas, or actions you can take...",
    commentPrompt: "What will you commit to this week?",
  },
  {
    key: "overall_rating",
    commentKey: "overall_comment",
    label: "Overall",
    question: "How would you rate your overall week?",
    type: "rating",
    low: "Tough",
    high: "Great",
    commentPrompt: "Talk me through your reasoning",
  },
];

export const RATING_QUESTIONS = REFLECTION_QUESTIONS.filter(
  (q): q is RatingQuestion => q.type === "rating"
);

export const TEXT_QUESTIONS = REFLECTION_QUESTIONS.filter(
  (q): q is TextQuestion => q.type === "text"
);

export type RatingKey = "energy_rating" | "motivation_rating" | "support_rating" | "overall_rating";
export type TextKey = "clarity_text" | "workload_text";
