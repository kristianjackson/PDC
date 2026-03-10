# Agent Instructions

This repository should follow the same broad architectural style and directory conventions as the `tmagen` project.

## Required Stack

- Cloudflare Workers
- React Router
- Supabase
- TypeScript

## Required Repository Conventions

- app code in `apps/web`
- database assets in `supabase`
- docs in `docs`
- scripts in `scripts`
- root-level npm scripts for local workflow

## Hard Rules

- Do not convert this repo to Next.js
- Do not introduce Vercel
- Do not redesign the directory structure unless there is a hard blocker
- Do not build multi-user features for MVP
- Do not add enterprise abstractions
- Do not start with AI features before the core logging experience works

## Product Priorities

1. database schema
2. route skeleton
3. morning check-in
4. evening check-in
5. weekly review
6. history and editing
7. dashboard analytics
8. export support
9. AI-ready extension points

## Coding Preferences

- Use TypeScript
- Keep code readable
- Keep files small and modular
- Validate inputs
- Handle empty states
- Handle errors cleanly
- Prefer practical implementations over abstraction-heavy patterns

## UX Priorities

- dashboard-first
- minimal clicks
- mobile-friendly
- fast form completion
- sensible defaults
- easy editing of prior entries

## Working Style

Before major implementation:
1. show the file plan
2. show assumptions
3. implement in reviewable chunks

When finished with a phase:
- summarize completed files
- summarize remaining work