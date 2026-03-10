import { data, Form, Link } from "react-router";

import type { Route } from "./+types/history";
import { Card } from "~/components/ui/Card";
import {
  listRecentDailyEntries,
  type DailyEntryRow,
} from "~/lib/db/daily-entries.server";
import {
  listRecentWeeklyEntries,
  type WeeklyEntryRow,
} from "~/lib/db/weekly-entries.server";
import { formatDisplayDate } from "~/lib/utils/dates";
import { requireViewer } from "~/lib/viewer.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { responseHeaders, supabase, viewer } = await requireViewer({
    context,
    request,
  });
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim() ?? "";
  const scope = normalizeScope(url.searchParams.get("scope"));

  const [dailyEntries, weeklyEntries] = await Promise.all([
    listRecentDailyEntries(supabase, viewer.user.id),
    listRecentWeeklyEntries(supabase, viewer.user.id),
  ]);

  return data(
    {
      dailyEntries: scope === "weekly" ? [] : filterDailyEntries(dailyEntries, q),
      q,
      scope,
      status,
      weeklyEntries: scope === "daily" ? [] : filterWeeklyEntries(weeklyEntries, q),
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function History({ loaderData }: Route.ComponentProps) {
  return (
    <section className="page-grid">
      <Card>
        <p className="eyebrow">History</p>
        <h1>Recent entries</h1>
        <p className="muted">
          Browse daily and weekly rows here, then open a specific date to edit or delete it.
        </p>
        {loaderData.status ? <p className="banner banner-success">{getStatusMessage(loaderData.status)}</p> : null}
        <Form className="history-filter-bar" method="get">
          <input
            className="field-input"
            defaultValue={loaderData.q}
            name="q"
            placeholder="Search notes, reflection, or date"
            type="search"
          />
          <select className="field-input" defaultValue={loaderData.scope} name="scope">
            <option value="all">All entries</option>
            <option value="daily">Daily only</option>
            <option value="weekly">Weekly only</option>
          </select>
          <button className="button button-secondary" type="submit">
            Filter
          </button>
        </Form>
      </Card>

      <div className="stats-grid">
        <Card>
          <h2>Daily entries</h2>
          <div className="data-list">
            {loaderData.dailyEntries.length === 0 ? (
              <p className="muted">No daily entries saved yet.</p>
            ) : (
              loaderData.dailyEntries.map((entry) => (
                <Link
                  className="entry-row"
                  key={entry.id}
                  to={`/history/daily/${entry.entry_date}`}
                >
                  <span>{formatDisplayDate(entry.entry_date)}</span>
                  <span className="entry-meta">
                    Morning {entry.morning_mood ?? "-"} / Evening {entry.evening_mood ?? "-"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h2>Weekly reviews</h2>
          <div className="data-list">
            {loaderData.weeklyEntries.length === 0 ? (
              <p className="muted">No weekly reviews yet.</p>
            ) : (
              loaderData.weeklyEntries.map((entry) => (
                <Link
                  className="entry-row"
                  key={entry.id}
                  to={`/history/weekly/${entry.week_end_date}`}
                >
                  <span>{formatDisplayDate(entry.week_end_date)}</span>
                  <span className="entry-meta">
                    Training {entry.training_consistency ?? "-"} / Nutrition {entry.nutrition_consistency ?? "-"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

function getStatusMessage(status: string) {
  switch (status) {
    case "daily-deleted":
      return "Daily entry deleted.";
    case "weekly-deleted":
      return "Weekly review deleted.";
    default:
      return "Update complete.";
  }
}

function normalizeScope(value: string | null) {
  if (value === "daily" || value === "weekly") {
    return value;
  }

  return "all";
}

function filterDailyEntries(
  entries: DailyEntryRow[],
  query: string,
) {
  if (!query) {
    return entries.slice(0, 50);
  }

  const normalized = query.toLowerCase();

  return entries.filter((entry) => {
    const haystack = [
      entry.entry_date,
      entry.notes ?? "",
      String(entry.morning_mood ?? ""),
      String(entry.evening_mood ?? ""),
      String(entry.sleep_duration_hours ?? ""),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

function filterWeeklyEntries(
  entries: WeeklyEntryRow[],
  query: string,
) {
  if (!query) {
    return entries.slice(0, 50);
  }

  const normalized = query.toLowerCase();

  return entries.filter((entry) => {
    const haystack = [
      entry.week_end_date,
      entry.reflection ?? "",
      String(entry.training_consistency ?? ""),
      String(entry.social_connection ?? ""),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
