import { data, Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/history.weekly.$date";
import { WeeklyReviewForm } from "~/components/forms/WeeklyReviewForm";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import {
  deleteWeeklyEntryByDate,
  getWeeklyEntryByDate,
  saveWeeklyEntry,
} from "~/lib/db/weekly-entries.server";
import { formatDisplayDate } from "~/lib/utils/dates";
import {
  getWeeklyReviewFormValues,
  parseWeeklyReviewFormData,
} from "~/lib/validation/weekly";
import { requireViewer } from "~/lib/viewer.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { responseHeaders, supabase, viewer } = await requireViewer({
    context,
    request,
  });
  const date = paramsDateFromRequest(request);
  const entry = await getWeeklyEntryByDate(supabase, viewer.user.id, date);

  return data(
    {
      date,
      entry,
      values: getWeeklyReviewFormValues(entry, date),
    },
    {
      headers: responseHeaders,
    },
  );
}

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

export async function action({ context, request }: Route.ActionArgs) {
  const { responseHeaders, supabase, viewer } = await requireViewer({
    context,
    request,
  });
  const date = paramsDateFromRequest(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "delete") {
    await deleteWeeklyEntryByDate(supabase, viewer.user.id, date);

    throw redirect("/history?status=weekly-deleted", {
      headers: responseHeaders,
    });
  }

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

  const entry = await saveWeeklyEntry(supabase, viewer.user.id, {
    ...result.payload,
    weekEndDate: date,
  });

  return data<ActionData>(
    {
      success: `Weekly review updated for ${entry.week_end_date}.`,
      values: getWeeklyReviewFormValues(entry, date),
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function WeeklyHistoryDetail({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();

  return (
    <section className="page-narrow stack">
      <Card className="form-card">
        <p className="eyebrow">Weekly review</p>
        <h1>Week ending {formatDisplayDate(loaderData.date)}</h1>
        <p className="muted">
          Edit the weekly record in place or delete it entirely if the week should be reset.
        </p>
        <div className="button-row">
          <Link className="button button-secondary" to="/history">
            Back to history
          </Link>
        </div>
      </Card>

      <WeeklyReviewForm
        errors={actionData?.errors}
        hiddenFields={[{ name: "intent", value: "save-weekly" }]}
        isSubmitting={navigation.state === "submitting"}
        lockDate={true}
        submitLabel="Update weekly review"
        successMessage={actionData?.success}
        values={actionData?.values ?? loaderData.values}
      />

      <Card className="form-card">
        <p className="eyebrow">Danger zone</p>
        <h2>Delete this weekly review</h2>
        <p className="muted">
          This removes the saved weekly reflection and metrics for this date.
        </p>
        <Form method="post">
          <input name="intent" type="hidden" value="delete" />
          <Button tone="danger" type="submit">
            Delete weekly review
          </Button>
        </Form>
      </Card>
    </section>
  );
}

function paramsDateFromRequest(request: Request) {
  const segments = new URL(request.url).pathname.split("/");

  return segments.at(-1) ?? "";
}
