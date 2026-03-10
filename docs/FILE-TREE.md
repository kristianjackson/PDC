# Proposed File Tree

```text
life-telemetry/
├─ apps/
│  └─ web/
│     ├─ app/
│     │  ├─ root.tsx
│     │  ├─ entry.client.tsx
│     │  ├─ entry.server.tsx
│     │  ├─ env.ts
│     │  ├─ routes/
│     │  │  ├─ _index.tsx
│     │  │  ├─ auth.tsx
│     │  │  ├─ checkin.morning.tsx
│     │  │  ├─ checkin.evening.tsx
│     │  │  ├─ weekly.tsx
│     │  │  ├─ history.tsx
│     │  │  ├─ history.daily.$date.tsx
│     │  │  ├─ history.weekly.$date.tsx
│     │  │  └─ settings.tsx
│     │  ├─ components/
│     │  │  ├─ charts/
│     │  │  │  ├─ MoodTrendChart.tsx
│     │  │  │  ├─ StressTrendChart.tsx
│     │  │  │  ├─ SleepTrendChart.tsx
│     │  │  │  └─ ComparisonCard.tsx
│     │  │  ├─ forms/
│     │  │  │  ├─ MorningCheckinForm.tsx
│     │  │  │  ├─ EveningCheckinForm.tsx
│     │  │  │  └─ WeeklyReviewForm.tsx
│     │  │  ├─ layout/
│     │  │  │  ├─ AppShell.tsx
│     │  │  │  ├─ TopNav.tsx
│     │  │  │  └─ MobileNav.tsx
│     │  │  └─ ui/
│     │  │     ├─ Button.tsx
│     │  │     ├─ Card.tsx
│     │  │     ├─ Input.tsx
│     │  │     ├─ NumberField.tsx
│     │  │     ├─ SliderField.tsx
│     │  │     ├─ ToggleField.tsx
│     │  │     └─ TextArea.tsx
│     │  ├─ lib/
│     │  │  ├─ supabase.ts
│     │  │  ├─ auth.ts
│     │  │  ├─ analytics/
│     │  │  │  ├─ daily.ts
│     │  │  │  ├─ weekly.ts
│     │  │  │  └─ comparisons.ts
│     │  │  ├─ db/
│     │  │  │  ├─ daily-entries.ts
│     │  │  │  ├─ weekly-entries.ts
│     │  │  │  └─ profiles.ts
│     │  │  ├─ validation/
│     │  │  │  ├─ daily.ts
│     │  │  │  └─ weekly.ts
│     │  │  └─ utils/
│     │  │     ├─ dates.ts
│     │  │     ├─ formatting.ts
│     │  │     └─ numbers.ts
│     │  ├─ styles/
│     │  │  └─ app.css
│     │  └─ types/
│     │     ├─ daily.ts
│     │     ├─ weekly.ts
│     │     ├─ analytics.ts
│     │     └─ database.ts
├─ supabase/
│  ├─ migrations/
│  │  ├─ 001_core_tables.sql
│  │  ├─ 002_indexes.sql
│  │  ├─ 003_rls.sql
│  │  └─ 004_views.sql
│  ├─ seeds/
│  │  └─ demo_data.sql
│  └─ README.md
├─ scripts/
│  ├─ seed-demo-data.ts
│  ├─ export-entries.ts
│  └─ smoke-web.ts
├─ docs/
│  ├─ prd.md
│  ├─ architecture.md
│  ├─ setup.md
│  ├─ roadmap.md
│  ├─ file-tree.md
│  └─ prompts/
│     ├─ codex-bootstrap.md
│     └─ codex-build-order.md
├─ .github/
│  └─ workflows/
│     ├─ ci.yml
│     └─ deploy.yml
├─ .env.example
├─ AGENTS.md
├─ README.md
├─ package.json
└─ package-lock.json