Read this repository as a Cloudflare Workers + React Router + Supabase project.

Use the same architectural style and directory conventions as the `tmagen` project:
- app code in `apps/web`
- database assets in `supabase`
- docs in `docs`
- scripts in `scripts`
- root-level npm scripts for dev, build, and typecheck

Do not convert this project to Next.js.
Do not introduce Vercel.
Do not redesign the repo structure unless there is a hard blocker.

Build a single-user personal life telemetry app with:
- morning check-in
- evening check-in
- weekly review
- history
- analytics dashboard
- future AI-ready note support

Implementation priorities:
1. schema and migrations
2. route skeleton and app shell
3. morning check-in flow
4. evening check-in flow
5. weekly review flow
6. history and edit flows
7. dashboard and trend charts
8. export support
9. AI hooks later

Rules:
- use TypeScript
- keep the UI mobile-friendly and low-friction
- prefer practical code over abstraction-heavy patterns
- match the existing style used in prior projects where reasonable
- show the file plan before major code generation
- implement in small, reviewable chunks
- summarize completed work at the end of each phase

Start now with:
- proposed file tree
- migration plan
- route plan
- component plan
- initial scaffold