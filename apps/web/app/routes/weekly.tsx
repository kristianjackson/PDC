import { data, Link, useNavigation } from "react-router";

import type { Route } from "./+types/weekly";
import { WeeklyReviewForm } from "~/components/forms/WeeklyReviewForm";
import { Card } from "~/components/ui/Card";
import {
  getWeeklyEntryByDate,
  listRecentWeeklyEntries,
  saveWeeklyEntry,
} from "~/lib/db/weekly-entries.server";
import {
  getCurrentWeekEndDateValue,
  getWeekEndDateParamValue,
  formatDisplayDate,
} from "~/lib/utils/dates";
import {
  getWeeklyReviewFormValues,
  parseWeeklyReviewFormData,
} from "~/lib/validation/weekly";
import { requireViewer } from "~/lib/viewer.server";

type ActionData =
  | {
      errors: Record<string, string>;
      success?: never;
      values: ReturnType<typeof getWeeklyReviewFormValues>;
    }
  | {
      errors?: never;
      success: string;
      values: ReturnType<typeof getWeeklyReviewFormValues>;
    };

export async function loader({ context, request }: Route.LoaderArgs) {
  const { responseHeaders, supabase, viewer } = await requireViewer({
    context,
    request,
  });
  const selectedDate = getWeekEndDateParamValue(new URL(request.url).searchParams.get("date"));
  const [entry, weeklyEntries] = await Promise.all([
    getWeeklyEntryByDate(supabase, viewer.user.id, selectedDate),
    listRecentWeeklyEntries(supabase, viewer.user.id, 8),
  ]);

  return data(
    {
      selectedDate,
      values: getWeeklyReviewFormValues(entry, selectedDate),
      weeklyEntries,
    },
    {
      headers: responseHeaders,
    },
  );
}

export async function action({ context, request }: Route.ActionArgs) {
  const { responseHeaders, supabase, viewer } = await requireViewer({
    context,
    request,
  });
  const formData = await request.formData();
  const result = parseWeeklyReviewFormData(formData);

  if (!result.success) {
    return data<ActionData>(
      {
        errors: result.errors,
        values: result.values,
      },
      {
        headers: responseHeaders,
        status: 400,
      },
    );
  }

  const entry = await saveWeeklyEntry(supabase, viewer.user.id, result.payload);

  return data<ActionData>(
    {
      success: `Weekly review saved for ${entry.week_end_date}.`,
      values: getWeeklyReviewFormValues(entry, entry.week_end_date),
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function Weekly({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();

  return (
    <section className="page-grid">
      <WeeklyReviewForm
        errors={actionData?.errors}
        isSubmitting={navigation.state === "submitting"}
        successMessage={actionData?.success}
        values={actionData?.values ?? loaderData.values}
      />

      <Card>
        <p className="eyebrow">Recent weekly entries</p>
        <div className="data-list">
          {loaderData.weeklyEntries.length === 0 ? (
            <p className="muted">No weekly reviews saved yet.</p>
          ) : (
            loaderData.weeklyEntries.map((entry) => (
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
        <div className="button-row">
          <Link
            className="button button-secondary"
            to={`/weekly?date=${getCurrentWeekEndDateValue()}`}
          >
            Jump to current week
          </Link>
        </div>
      </Card>
    </section>
  );
}
