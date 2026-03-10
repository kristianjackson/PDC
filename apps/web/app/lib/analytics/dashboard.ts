import type { DailyEntryRow } from "~/lib/db/daily-entries.server";
import type { WeeklyEntryRow } from "~/lib/db/weekly-entries.server";

export type DashboardAnalytics = {
  chartSeries: {
    mood14: number[];
    productivity14: number[];
    sleep14: number[];
    stress14: number[];
  };
  completion: {
    daysLoggedLast30: number;
    eveningCompletionRate: string;
    morningCompletionRate: string;
  };
  comparisons: {
    exerciseMood: string | null;
    noExerciseMood: string | null;
    recoverySleepMood: string | null;
    shortSleepMood: string | null;
  };
  recentAverages: {
    mood7: string | null;
    mood30: string | null;
    productivity7: string | null;
    sleep7: string | null;
    sleep30: string | null;
    stress7: string | null;
  };
  trends: {
    moodDelta: string | null;
    productivityDelta: string | null;
    stressDelta: string | null;
  };
  weeklySignals: {
    nutritionAverage: string | null;
    relationshipAverage: string | null;
    socialAverage: string | null;
    trainingAverage: string | null;
  };
};

export function computeDashboardAnalytics(
  dailyEntries: DailyEntryRow[],
  weeklyEntries: WeeklyEntryRow[],
): DashboardAnalytics {
  const recent7 = dailyEntries.slice(0, 7);
  const recent30 = dailyEntries.slice(0, 30);
  const prior7 = dailyEntries.slice(7, 14);
  const recent12Weeks = weeklyEntries.slice(0, 12);

  return {
    chartSeries: {
      mood14: series(dailyEntries, (entry) => entry.evening_mood, 14),
      productivity14: series(dailyEntries, (entry) => entry.productivity_level, 14),
      sleep14: series(dailyEntries, (entry) => entry.sleep_duration_hours, 14),
      stress14: series(dailyEntries, (entry) => entry.stress_level, 14),
    },
    completion: {
      daysLoggedLast30: recent30.length,
      eveningCompletionRate: completionRate(
        recent30,
        (entry) =>
          entry.evening_mood !== null &&
          entry.stress_level !== null &&
          entry.productivity_level !== null,
      ),
      morningCompletionRate: completionRate(
        recent30,
        (entry) =>
          entry.sleep_duration_hours !== null &&
          entry.sleep_quality !== null &&
          entry.wake_energy !== null &&
          entry.morning_mood !== null,
      ),
    },
    comparisons: {
      exerciseMood: average(
        recent30.filter((entry) => entry.exercise_completed),
        (entry) => entry.evening_mood,
      ),
      noExerciseMood: average(
        recent30.filter((entry) => !entry.exercise_completed),
        (entry) => entry.evening_mood,
      ),
      recoverySleepMood: average(
        recent30.filter((entry) => (entry.sleep_duration_hours ?? 0) >= 7),
        (entry) => entry.evening_mood,
      ),
      shortSleepMood: average(
        recent30.filter((entry) => (entry.sleep_duration_hours ?? 999) < 6),
        (entry) => entry.evening_mood,
      ),
    },
    recentAverages: {
      mood7: average(recent7, (entry) => entry.evening_mood),
      mood30: average(recent30, (entry) => entry.evening_mood),
      productivity7: average(recent7, (entry) => entry.productivity_level),
      sleep7: average(recent7, (entry) => entry.sleep_duration_hours),
      sleep30: average(recent30, (entry) => entry.sleep_duration_hours),
      stress7: average(recent7, (entry) => entry.stress_level),
    },
    trends: {
      moodDelta: delta(
        averageNumber(recent7, (entry) => entry.evening_mood),
        averageNumber(prior7, (entry) => entry.evening_mood),
      ),
      productivityDelta: delta(
        averageNumber(recent7, (entry) => entry.productivity_level),
        averageNumber(prior7, (entry) => entry.productivity_level),
      ),
      stressDelta: delta(
        averageNumber(recent7, (entry) => entry.stress_level),
        averageNumber(prior7, (entry) => entry.stress_level),
      ),
    },
    weeklySignals: {
      nutritionAverage: average(recent12Weeks, (entry) => entry.nutrition_consistency),
      relationshipAverage: average(recent12Weeks, (entry) => entry.relationship_stability),
      socialAverage: average(recent12Weeks, (entry) => entry.social_connection),
      trainingAverage: average(recent12Weeks, (entry) => entry.training_consistency),
    },
  };
}

function average<T>(
  values: T[],
  selector: (value: T) => number | null,
): string | null {
  const computed = averageNumber(values, selector);

  return computed === null ? null : computed.toFixed(1);
}

function averageNumber<T>(
  values: T[],
  selector: (value: T) => number | null,
): number | null {
  const filtered = values
    .map(selector)
    .filter((value): value is number => typeof value === "number");

  if (filtered.length === 0) {
    return null;
  }

  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function completionRate<T>(values: T[], selector: (value: T) => boolean) {
  if (values.length === 0) {
    return "0%";
  }

  const completed = values.filter(selector).length;

  return `${Math.round((completed / values.length) * 100)}%`;
}

function delta(current: number | null, previous: number | null) {
  if (current === null || previous === null) {
    return null;
  }

  const difference = current - previous;
  const sign = difference > 0 ? "+" : "";

  return `${sign}${difference.toFixed(1)}`;
}

function series<T>(
  values: T[],
  selector: (value: T) => number | null,
  limit: number,
) {
  return values
    .slice(0, limit)
    .map(selector)
    .filter((value): value is number => typeof value === "number")
    .reverse();
}
