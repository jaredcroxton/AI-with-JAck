# PerformOS One-on-One Platform - Task Plan

## North Star
Managers can run structured one-on-one performance conversations with team members and surface early psychological safety risks across their team, all within the PerformOS design system.

---

## Phase 1: Blueprint
- [x] Discovery questions answered
- [x] Data schema defined and confirmed in gemini.md
- [x] Research complete (GitHub repos, libraries, patterns)
- [x] Blueprint approved by user

## Phase 2: Link
- [x] Supabase project created and credentials verified
- [x] OpenAI API key verified
- [x] .env configured and tested
- [x] Auth handshake confirmed (Supabase Auth)
- [x] Database tables created and verified (6 tables + RLS + triggers)

## Phase 3: Architect
- [ ] Architecture SOPs written for all core flows
- [ ] Supabase schema migration scripts
- [ ] Auth layer (Manager / Team Member / Executive roles)
- [ ] One-on-one session CRUD
- [ ] Pre-meeting reflection flow
- [ ] Action items tracking
- [ ] AI summary generation (OpenAI)
- [ ] Risk flag detection (OpenAI)
- [ ] Coaching prompt generation (OpenAI)
- [ ] Team health dashboard aggregation
- [ ] Executive aggregated view (privacy boundary enforced)

## Phase 4: Stylize
- [ ] PerformOS design system tokens implemented
- [ ] Manager View: session runner, history, team health dashboard
- [ ] Team Member View: reflections, own history
- [ ] Executive View: aggregated health scores, risk patterns
- [ ] Dark/white alternating section layout
- [ ] Responsive and premium feel (Stripe/Linear level)
- [ ] Risk flag colour system (amber caution, soft red high risk)

## Phase 5: Trigger
- [ ] Deploy to production (Vercel or similar)
- [ ] Supabase production environment configured
- [ ] Cron or webhook triggers for AI processing
- [ ] Maintenance log finalised in gemini.md
