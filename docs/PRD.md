# Life Telemetry
## Product Requirements Document

Version: 0.1  
Status: MVP Definition

---

## 1. Product Overview

Life Telemetry is a single-user personal analytics app for capturing daily and weekly life data, visualizing trends, and preparing that data for future AI analysis.

It is designed to help answer questions such as:

- How does sleep affect mood and productivity?
- What tends to happen before high-stress days?
- Does exercise improve mood or reduce conflict?
- Which weeks feel more stable, and why?

This is not a generic streak-based habit tracker. It is a low-friction personal telemetry system.

---

## 2. Goals

Primary goals:

1. make daily logging fast enough to sustain
2. capture emotionally and behaviorally meaningful data
3. show useful trends quickly
4. support future semantic analysis of notes
5. stay simple enough to maintain

---

## 3. Non-Goals for MVP

Not in MVP:

- multi-user support
- social or sharing features
- device integrations
- push notifications
- advanced statistics
- native mobile apps
- full AI insight generation
- complex permissions beyond what is needed for Supabase auth

---

## 4. Target User

Primary user:

A technically comfortable single user who wants to understand patterns in mood, stress, sleep, productivity, conflict, and general functioning over time.

---

## 5. Product Principles

- low-friction first
- useful over clever
- mobile-friendly by default
- history matters
- trend visibility matters
- AI-readiness without AI bloat
- strong data model
- single-user simplicity

---

## 6. Core User Flows

### 6.1 Morning Check-In

User records:

- date
- sleep duration
- sleep quality
- wake energy
- body weight (optional)
- morning mood

Target completion time: under 30 seconds

### 6.2 Evening Check-In

User records:

- overall mood
- stress
- productivity
- caffeine count
- alcohol count
- exercise completed
- steps (optional)
- meditation completed
- meaningful social contact
- conflict level
- free-text notes

Target completion time: under 60 seconds

### 6.3 Weekly Review

User records:

- week ending date
- training consistency
- nutrition consistency
- screen time estimate
- inbox or backlog pressure
- social connection
- relationship stability
- travel this week
- entertainment load
- weekly reflection

Target completion time: 2 to 3 minutes

### 6.4 History Review

User can:

- browse prior entries
- open a specific day or week
- edit entries
- delete entries

### 6.5 Dashboard Review

User sees:

- recent entries
- trend cards
- rolling averages
- simple comparisons
- quick visual signal of changes over time

---

## 7. Functional Requirements

### FR-1 Daily Entry Creation
System must support a daily record with both morning and evening fields.

### FR-2 Weekly Entry Creation
System must support weekly review records.

### FR-3 Dashboard
System must display:
- 7-day and 30-day summaries
- trend charts for sleep, mood, stress, productivity
- comparisons such as exercise vs mood and sleep vs mood

### FR-4 Entry Editing
System must allow editing and deleting past daily and weekly entries.

### FR-5 History
System must provide a history page for prior records.

### FR-6 Notes
System must store free-text notes on daily entries and free-text reflections on weekly entries.

### FR-7 Export
System should support at least a basic export path for user-owned data.

---

## 8. UX Requirements

The UX should be:

- clean
- fast
- low-friction
- obvious
- mobile-friendly

Required UX characteristics:

- dashboard as the landing page after sign-in
- clear navigation to morning and evening check-in
- defaults for current date
- sliders or segmented controls for 1-10 fields
- simple toggles for booleans
- text area for notes
- quick save with clear confirmation
- ability to revisit and edit past entries

---

## 9. MVP Data Fields

### Daily Entry

Identity:
- id
- user_id
- entry_date

Morning:
- sleep_duration_hours
- sleep_quality
- wake_energy
- body_weight
- morning_mood

Evening:
- evening_mood
- stress_level
- productivity_level
- caffeine_count
- alcohol_count
- exercise_completed
- steps
- meditation_completed
- meaningful_social_contact
- conflict_level
- notes

Metadata:
- created_at
- updated_at

### Weekly Entry

Identity:
- id
- user_id
- week_end_date

Metrics:
- training_consistency
- nutrition_consistency
- screen_time_estimate
- inbox_pressure
- social_connection
- relationship_stability
- travel_week
- entertainment_load
- reflection

Metadata:
- created_at
- updated_at

---

## 10. Future AI Features

Not MVP, but schema and docs should support later:

- embeddings for daily notes
- embeddings for weekly reflections
- semantic search over journal content
- AI-generated weekly and monthly summaries
- natural language querying over telemetry data
- pattern detection across notes and metrics

Examples:
- "show weeks with poor sleep and high conflict"
- "summarize the last 30 days emotionally"
- "what tends to correlate with my better days"

---

## 11. Success Criteria

MVP is successful if:

- daily logging feels sustainable
- weekly reviews are easy enough to complete
- dashboard provides useful visual feedback
- schema is stable enough to extend later
- app remains simple to operate and maintain

---

## 12. Build Priorities

1. schema and migrations
2. auth and app shell
3. morning check-in
4. evening check-in
5. weekly review
6. history and edit pages
7. dashboard analytics
8. export tooling
9. AI extension points later