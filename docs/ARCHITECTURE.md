# Architecture

## 1. Overview

Life Telemetry follows the same broad repository and stack pattern used successfully in prior projects.

### Runtime and app layer
- Cloudflare Workers
- React Router
- TypeScript

### Data layer
- Supabase Auth
- Supabase Postgres

### Optional later layer
- OpenAI-powered note analysis
- embeddings
- semantic search
- AI summaries

---

## 2. System Shape

User Browser
-> React Router app in `apps/web`
-> server/client logic running on Cloudflare Workers
-> Supabase Auth + Postgres
-> analytics and history rendered in app

Later:
daily notes / weekly reflections
-> embedding pipeline
-> semantic retrieval / AI summarization

---

## 3. Repository Layout

This repository should use:

- `apps/web` for app code
- `supabase` for migrations, seeds, SQL views, and RLS
- `scripts` for utilities and export scripts
- `docs` for setup, product, architecture, and Codex prompts

---

## 4. Core Technical Decisions

### Why this stack
This project should reuse proven conventions instead of inventing a new stack.

### Why single-user first
This is a personal telemetry system. Multi-user abstraction would add complexity without immediate value.

### Why AI is deferred
The product lives or dies on data capture and dashboard usefulness. AI comes later.

### Why structured + free text
Structured metrics support trends and comparisons.
Free-text notes support future semantic analysis.

---

## 5. Route Model

Expected route set:

- `/` dashboard
- `/auth`
- `/checkin/morning`
- `/checkin/evening`
- `/weekly`
- `/history`
- `/history/daily/:date`
- `/history/weekly/:date`
- `/settings`

---

## 6. Data Model Summary

Core tables:

- `profiles`
- `daily_entries`
- `weekly_entries`

Optional later tables:
- `entry_tags`
- `daily_entry_embeddings`
- `weekly_entry_embeddings`
- `ai_summaries`

---

## 7. Analytics Model

MVP analytics should be computed simply in app code or SQL views.

Examples:

- 7-day average mood
- 30-day average stress
- average mood when exercise = true
- average mood when exercise = false
- average next-day mood for sleep > 7 hours
- average next-day mood for sleep < 6 hours

Do not introduce heavyweight analytics infrastructure for MVP.

---

## 8. Security

- Supabase Auth
- row-level security enabled
- tables scoped to authenticated user
- no public write access

---

## 9. Extension Points

Future extensions should fit the same shape:

- wearable imports
- event tagging
- conflict incident tagging
- AI weekly summaries
- semantic note search
- data export and import