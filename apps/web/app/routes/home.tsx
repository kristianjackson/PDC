import { data, Link } from "react-router";

import { SparklineCard } from "~/components/charts/SparklineCard";
import type { Route } from "./+types/home";
import { Card } from "~/components/ui/Card";
import { computeDashboardAnalytics } from "~/lib/analytics/dashboard";
import { listRecentDailyEntries } from "~/lib/db/daily-entries.server";
import { listRecentWeeklyEntries } from "~/lib/db/weekly-entries.server";
import { formatDisplayDate } from "~/lib/utils/dates";
import { getViewer } from "~/lib/viewer.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { responseHeaders, supabase, viewer } = await getViewer({
    env: context.cloudflare.env,
    request,
  });

  if (!viewer) {
    return data(
      {
        dailyEntries: [],
        analytics: null,
        viewer,
        weeklyEntries: [],
      },
      {
        headers: responseHeaders,
      },
    );
  }

  const [dailyEntries, weeklyEntries] = await Promise.all([
    listRecentDailyEntries(supabase, viewer.user.id, 60),
    listRecentWeeklyEntries(supabase, viewer.user.id, 12),
  ]);

  return data(
    {
      analytics: computeDashboardAnalytics(dailyEntries, weeklyEntries),
      dailyEntries,
      viewer,
      weeklyEntries,
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  if (!loaderData.viewer) {
    return (
      <section className="page-grid">
        <Card className="hero-card">
          <p className="eyebrow">Single-user MVP</p>
          <h1>Log your day in under a minute.</h1>
          <p className="lead">
            Morning sleep and mood, evening stress and productivity, then weekly review
            and history once the core logging loop is solid.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/auth">
              Sign in
            </Link>
            <Link className="button button-secondary" to="/checkin/morning">
              Preview routes
            </Link>
          </div>
        </Card>

        <div className="stats-grid">
          <Card>
            <p className="eyebrow">Morning</p>
            <h2>Sleep, energy, mood</h2>
            <p className="muted">
              Fast form with sane defaults and a single row per date.
            </p>
          </Card>
          <Card>
            <p className="eyebrow">Evening</p>
            <h2>Stress, productivity, notes</h2>
            <p className="muted">
              Built for fast save and later edits without hunting through screens.
            </p>
          </Card>
          <Card>
            <p className="eyebrow">Next</p>
            <h2>Weekly review, history, export</h2>
            <p className="muted">
              The scaffold now covers the core entry flows, editing, and export path.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="page-grid">
      <Card className="hero-card">
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome back, {loaderData.viewer.user.displayName}.</h1>
        <p className="lead">
          Morning, evening, and weekly review flows are wired to Supabase. The dashboard
          now derives completion, comparison, and trend cards from your saved entries.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/checkin/morning">
            Morning check-in
          </Link>
          <Link className="button button-secondary" to="/checkin/evening">
            Evening check-in
          </Link>
          <Link className="button button-secondary" to="/weekly">
            Weekly review
          </Link>
        </div>
      </Card>

      <div className="stats-grid">
        <SparklineCard
          points={loaderData.analytics?.chartSeries.sleep14 ?? []}
          subtitle="Average sleep duration over the last week of logged days."
          title="7-day sleep"
          value={`${loaderData.analytics?.recentAverages.sleep7 ?? "0.0"} hours`}
        />
        <SparklineCard
          accent="amber"
          points={loaderData.analytics?.chartSeries.mood14 ?? []}
          subtitle="Recent evening mood average from completed daily rows."
          title="7-day mood"
          value={`${loaderData.analytics?.recentAverages.mood7 ?? "0.0"} / 10`}
        />
        <SparklineCard
          accent="rose"
          points={loaderData.analytics?.chartSeries.stress14 ?? []}
          subtitle="Stress average across your latest week of daily logs."
          title="7-day stress"
          value={`${loaderData.analytics?.recentAverages.stress7 ?? "0.0"} / 10`}
        />
        <SparklineCard
          points={loaderData.analytics?.chartSeries.productivity14 ?? []}
          subtitle="Productivity trend anchor for the same recent seven-entry window."
          title="7-day productivity"
          value={`${loaderData.analytics?.recentAverages.productivity7 ?? "0.0"} / 10`}
        />
      </div>

      <div className="stats-grid">
        <Card>
          <p className="eyebrow">30-day completion</p>
          <h2>{loaderData.analytics?.completion.daysLoggedLast30 ?? 0} days logged</h2>
          <p className="muted">
            Morning complete: {loaderData.analytics?.completion.morningCompletionRate ?? "0%"}.
            Evening complete: {loaderData.analytics?.completion.eveningCompletionRate ?? "0%"}.
          </p>
        </Card>

        <Card>
          <p className="eyebrow">Exercise vs no exercise</p>
          <h2>
            {loaderData.analytics?.comparisons.exerciseMood ?? "-"} /{" "}
            {loaderData.analytics?.comparisons.noExerciseMood ?? "-"}
          </h2>
          <p className="muted">Average evening mood on exercise days versus non-exercise days.</p>
        </Card>

        <Card>
          <p className="eyebrow">Sleep comparison</p>
          <h2>
            {loaderData.analytics?.comparisons.recoverySleepMood ?? "-"} /{" "}
            {loaderData.analytics?.comparisons.shortSleepMood ?? "-"}
          </h2>
          <p className="muted">Average evening mood after 7+ hours of sleep versus under 6.</p>
        </Card>

        <Card>
          <p className="eyebrow">7-day delta</p>
          <h2>
            Mood {loaderData.analytics?.trends.moodDelta ?? "-"} / Stress{" "}
            {loaderData.analytics?.trends.stressDelta ?? "-"}
          </h2>
          <p className="muted">
            Difference between the current 7-entry window and the prior 7-entry window.
          </p>
        </Card>
      </div>

      <div className="stats-grid">
        <Card>
          <p className="eyebrow">12-week signal</p>
          <h2>{loaderData.analytics?.weeklySignals.trainingAverage ?? "-"} training</h2>
          <p className="muted">
            Nutrition {loaderData.analytics?.weeklySignals.nutritionAverage ?? "-"}, social{" "}
            {loaderData.analytics?.weeklySignals.socialAverage ?? "-"}, relationship{" "}
            {loaderData.analytics?.weeklySignals.relationshipAverage ?? "-"}.
          </p>
        </Card>

        <Card>
          <p className="eyebrow">30-day averages</p>
          <h2>
            Mood {loaderData.analytics?.recentAverages.mood30 ?? "-"} / Sleep{" "}
            {loaderData.analytics?.recentAverages.sleep30 ?? "-"}
          </h2>
          <p className="muted">Longer baseline for mood and sleep over the latest 30 logged days.</p>
        </Card>

        <Card>
          <p className="eyebrow">Export ready</p>
          <h2>JSON and CSV</h2>
          <p className="muted">
            Export routes are wired under settings so the data remains user-owned from the start.
          </p>
        </Card>
      </div>

      <div className="stats-grid">
        <Card>
          <p className="eyebrow">Recent daily entries</p>
          <div className="data-list">
            {loaderData.dailyEntries.length === 0 ? (
              <p className="muted">No daily entries yet.</p>
            ) : (
              loaderData.dailyEntries.slice(0, 7).map((entry) => (
                <Link
                  className="entry-row"
                  key={entry.id}
                  to={`/history/daily/${entry.entry_date}`}
                >
                  <span>{formatDisplayDate(entry.entry_date)}</span>
                  <span className="entry-meta">
                    Mood {entry.evening_mood ?? "-"} / Sleep {entry.sleep_duration_hours ?? "-"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="eyebrow">Recent weekly reviews</p>
          <div className="data-list">
            {loaderData.weeklyEntries.length === 0 ? (
              <p className="muted">No weekly reviews yet.</p>
            ) : (
              loaderData.weeklyEntries.slice(0, 6).map((entry) => (
                <Link
                  className="entry-row"
                  key={entry.id}
                  to={`/history/weekly/${entry.week_end_date}`}
                >
                  <span>{formatDisplayDate(entry.week_end_date)}</span>
                  <span className="entry-meta">
                    Training {entry.training_consistency ?? "-"} / Social {entry.social_connection ?? "-"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="eyebrow">Jump back in</p>
          <h2>Edit history or export</h2>
          <p className="muted">
            Use history to correct prior entries and settings to export the current dataset.
          </p>
          <div className="button-row">
            <Link className="button button-secondary" to="/history">
              Open history
            </Link>
            <Link className="button button-secondary" to="/settings">
              Open settings
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
