# Life Telemetry

Personal life telemetry app for fast daily check-ins, weekly reviews, trend analysis, and future AI-assisted pattern detection.

This project intentionally follows the same architectural conventions as `tmagen`:

- Cloudflare Workers
- React Router
- Supabase
- root-level npm workflow
- `apps/web` for the application
- `supabase` for schema and migrations
- `scripts` for utilities
- `docs` for product and setup documentation

## MVP Scope

- Morning check-in
- Evening check-in
- Weekly review
- History view
- Analytics dashboard
- Simple export support
- AI-ready schema for future note embeddings and summaries

## Core Product Idea

This is not a generic habit tracker.

It is a personal analytics system intended to help answer questions like:

- How does sleep affect mood, stress, and productivity?
- What patterns show up before rough days?
- How do exercise, social contact, and conflict affect overall functioning?
- What trends appear week over week?

## Stack

- Cloudflare Workers
- React Router
- Supabase
- TypeScript

## Repository Layout

- `apps/web` - Cloudflare Workers + React Router app
- `supabase` - schema, migrations, seeds, RLS
- `scripts` - utility scripts
- `docs` - PRD, architecture, setup, roadmap, Codex prompts

## Start Here

1. Read `docs/prd.md`
2. Read `docs/architecture.md`
3. Read `docs/setup.md`
4. Read `docs/prompts/codex-bootstrap.md`

## Initial Build Order

1. Database schema and migrations
2. Route skeleton and app shell
3. Morning check-in
4. Evening check-in
5. Weekly review
6. History and edit flows
7. Dashboard and analytics
8. Export tooling
9. AI hooks later

## Development Rules

- Single-user first
- Mobile-friendly
- Low-friction forms
- Avoid overengineering
- Favor practical code over clever abstractions
- Keep the schema extensible for future AI analysis