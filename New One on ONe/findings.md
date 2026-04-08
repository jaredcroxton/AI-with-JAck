# PerformOS - Findings & Research

## Discovery Answers (08 April 2026)

### Integrations
- Supabase: database, auth, real-time
- OpenAI API: conversation summaries, risk pattern detection, coaching prompts
- API keys: needed for both services

### Source of Truth
- Supabase only. No CSV uploads or external DB.
- Three core data sets: session records, team member profiles, risk/flag history
- All data entered through the app by managers and team members

### Delivery
- Web dashboard with three role-based views (Manager, Team Member, Executive)
- Executive view is aggregated only (privacy boundary)

### Behavioural Rules
- Soft delete only
- No "Sarah" in any demo, persona, or seed data
- NSE = units only, no $ sign
- No em dashes
- PerformOS capitalisation (P/O/S)
- Spell out one to nine, numerals 10+
- Dates: DD Month YYYY
- Risk flags: amber (caution), soft red (high risk), never bright red
- Executive dashboard: aggregated data only, never individual responses
- Two clear entry points on home screen (Manager / Team Member)
- No setup wizards or onboarding flows on landing
- App must feel safe and trustworthy (sensitive human data)

---

## Research Findings (08 April 2026)

### Useful Repos and Templates
- **shadcn/ui + next-saas-starter** (mickasmt): Next.js 14 App Router + Supabase Auth + Tailwind. Good skeleton for SaaS with role-based access.
- **tremor.so**: React dashboard component library (Tailwind-based), pairs well with Next.js App Router for metrics dashboards.
- **supabase/supabase/examples**: Contains Next.js + Supabase starter apps with auth and RLS baked in.
- **calcom/cal.com**: Open-source scheduling platform (Next.js), worth studying for meeting/booking UX patterns.

### Supabase RLS Patterns for Multi-Role Access
- Store `role` enum on profiles table, reference in policies via `auth.uid()`
- Create a `get_my_role()` SQL function with `SECURITY DEFINER` to avoid repeated joins
- Apply separate INSERT/UPDATE/DELETE policies per role (not one broad policy)
- Never trust client-side role claims; always use `auth.uid()` in policies
- Executive policy for team_health_scores: only SELECT where role = 'executive'

### OpenAI Patterns
- **Model:** `gpt-4o` for summarisation. `gpt-4o-mini` for high-volume risk pre-screening.
- **Summarisation:** System prompt with structured JSON output: key_topics, action_items, sentiment_score, follow_ups. Few-shot examples in prompt.
- **Risk detection:** Separate classification call with rubric defining signals (disengagement language, resignation hints, conflict markers, repeated blockers). Return risk_level enum with evidence quotes. Temperature 0 for deterministic output.
- **Chain:** raw notes -> summarise -> risk classify (two calls, or one structured output call with both sections).

### Design References (Navy/White Alternating)
- **Linear.app**: Dark navy hero, alternating light/dark feature sections. Target aesthetic.
- **Stripe Dashboard**: Alternating #0a2540 (navy) and #ffffff sections.
- Tailwind approach: `bg-[#0B1220]` / `bg-white` alternating sections with CSS variables.
- **shadcn/ui** theming with Radix Themes provides navy-first dark palette out of the box.
- Component library decision: **shadcn/ui** for cards, forms, tables + **tremor** for dashboard charts/metrics.
