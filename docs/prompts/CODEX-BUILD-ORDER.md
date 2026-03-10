# Codex Build Order

## Phase 1 - Plan
Output:
- final file tree
- migration files to add
- routes to add
- shared components to add
- assumptions

## Phase 2 - Scaffold
Create:
- root package files if needed
- `apps/web` scaffold
- route skeleton
- shared layout
- env template
- placeholder pages

## Phase 3 - Database
Create:
- `supabase/migrations/001_core_tables.sql`
- `supabase/migrations/002_indexes.sql`
- `supabase/migrations/003_rls.sql`
- `supabase/migrations/004_views.sql`
- optional `supabase/seeds/demo_data.sql`

## Phase 4 - Forms
Create:
- morning check-in form
- evening check-in form
- weekly review form
- validation logic
- save and edit flows

## Phase 5 - History
Create:
- history list pages
- detail/edit pages
- delete flows

## Phase 6 - Dashboard
Create:
- summary cards
- trend charts
- simple comparison cards
- recent entries cards

## Phase 7 - Export
Create:
- export utility
- docs for export

## Phase 8 - Cleanup
Create:
- README updates
- setup docs
- roadmap updates
- smoke test script if practical