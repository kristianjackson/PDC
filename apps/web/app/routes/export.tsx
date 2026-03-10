import { redirect } from "react-router";

import type { Route } from "./+types/export";
import {
  listRecentDailyEntries,
  type DailyEntryRow,
} from "~/lib/db/daily-entries.server";
import {
  listRecentWeeklyEntries,
  type WeeklyEntryRow,
} from "~/lib/db/weekly-entries.server";
import { requireViewer } from "~/lib/viewer.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { responseHeaders, supabase, viewer } = await requireViewer({
    context,
    request,
  });
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const type = url.searchParams.get("type") ?? "all";

  if (!format) {
    throw redirect("/settings", {
      headers: responseHeaders,
    });
  }

  const [dailyEntries, weeklyEntries] = await Promise.all([
    type === "weekly" ? [] : listRecentDailyEntries(supabase, viewer.user.id),
    type === "daily" ? [] : listRecentWeeklyEntries(supabase, viewer.user.id),
  ]);

  const baseHeaders = new Headers(responseHeaders);
  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    baseHeaders.set("Content-Type", "application/json; charset=utf-8");
    baseHeaders.set(
      "Content-Disposition",
      `attachment; filename="life-telemetry-${timestamp}.json"`,
    );

    return new Response(
      JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          user: {
            email: viewer.user.email,
            id: viewer.user.id,
          },
          daily_entries: dailyEntries,
          weekly_entries: weeklyEntries,
        },
        null,
        2,
      ),
      {
        headers: baseHeaders,
      },
    );
  }

  if (format === "csv" && type === "daily") {
    baseHeaders.set("Content-Type", "text/csv; charset=utf-8");
    baseHeaders.set(
      "Content-Disposition",
      `attachment; filename="life-telemetry-daily-${timestamp}.csv"`,
    );

    return new Response(buildDailyCsv(dailyEntries), {
      headers: baseHeaders,
    });
  }

  if (format === "csv" && type === "weekly") {
    baseHeaders.set("Content-Type", "text/csv; charset=utf-8");
    baseHeaders.set(
      "Content-Disposition",
      `attachment; filename="life-telemetry-weekly-${timestamp}.csv"`,
    );

    return new Response(buildWeeklyCsv(weeklyEntries), {
      headers: baseHeaders,
    });
  }

  throw redirect("/settings");
}

function buildDailyCsv(entries: DailyEntryRow[]) {
  const headers = [
    "entry_date",
    "sleep_duration_hours",
    "sleep_quality",
    "wake_energy",
    "body_weight",
    "morning_mood",
    "evening_mood",
    "stress_level",
    "productivity_level",
    "caffeine_count",
    "alcohol_count",
    "exercise_completed",
    "steps",
    "meditation_completed",
    "meaningful_social_contact",
    "conflict_level",
    "notes",
    "created_at",
    "updated_at",
  ];

  const rows = entries.map((entry) => [
    entry.entry_date,
    entry.sleep_duration_hours,
    entry.sleep_quality,
    entry.wake_energy,
    entry.body_weight,
    entry.morning_mood,
    entry.evening_mood,
    entry.stress_level,
    entry.productivity_level,
    entry.caffeine_count,
    entry.alcohol_count,
    entry.exercise_completed,
    entry.steps,
    entry.meditation_completed,
    entry.meaningful_social_contact,
    entry.conflict_level,
    entry.notes,
    entry.created_at,
    entry.updated_at,
  ]);

  return toCsv(headers, rows);
}

function buildWeeklyCsv(entries: WeeklyEntryRow[]) {
  const headers = [
    "week_end_date",
    "training_consistency",
    "nutrition_consistency",
    "screen_time_estimate",
    "inbox_pressure",
    "social_connection",
    "relationship_stability",
    "travel_week",
    "entertainment_load",
    "reflection",
    "created_at",
    "updated_at",
  ];

  const rows = entries.map((entry) => [
    entry.week_end_date,
    entry.training_consistency,
    entry.nutrition_consistency,
    entry.screen_time_estimate,
    entry.inbox_pressure,
    entry.social_connection,
    entry.relationship_stability,
    entry.travel_week,
    entry.entertainment_load,
    entry.reflection,
    entry.created_at,
    entry.updated_at,
  ]);

  return toCsv(headers, rows);
}

function toCsv(headers: string[], rows: Array<Array<string | number | boolean | null>>) {
  return [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`)
        .join(","),
    )
    .join("\n");
}
