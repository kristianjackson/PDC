# Setup

## 1. Goal

Initialize a Cloudflare Workers + React Router + Supabase project that matches the repo conventions used in prior projects.

## 2. Expected Top-Level Layout

- `apps/web`
- `supabase`
- `scripts`
- `docs`

## 3. Immediate Setup Tasks

1. scaffold the web app under `apps/web`
2. configure TypeScript
3. configure Cloudflare Workers
4. configure environment variables
5. create Supabase migrations
6. add basic auth flow
7. create route skeleton
8. verify local dev, typecheck, and build

## 4. Environment Variables

Expected env vars:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` if needed for scripts only
- `OPENAI_API_KEY` later, not required for MVP startup

Also expose client-safe vars as needed in the web app.

## 5. Initial Database Work

Create migrations for:

- profiles
- daily_entries
- weekly_entries
- updated_at trigger
- indexes
- row level security
- policies

## 6. Initial Route Work

Create route skeleton for:

- dashboard
- auth
- morning check-in
- evening check-in
- weekly review
- history
- entry detail or edit routes
- settings placeholder

## 7. Initial UI Work

Build:

- app shell
- top navigation
- mobile navigation
- card component
- input wrappers
- slider field
- toggle field
- textarea field

## 8. MVP Order

Do not start with charts before forms exist.
Do not start with AI before forms and history exist.
Do not overbuild settings before core entry flows work.