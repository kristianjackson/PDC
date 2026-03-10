import { data, Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/history.daily.$date";
import { EveningCheckinForm } from "~/components/forms/EveningCheckinForm";
import { MorningCheckinForm } from "~/components/forms/MorningCheckinForm";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import {
  deleteDailyEntryByDate,
  getDailyEntryByDate,
  saveEveningEntry,
  saveMorningEntry,
} from "~/lib/db/daily-entries.server";
import { formatDisplayDate } from "~/lib/utils/dates";
import {
  getEveningFormValues,
  getMorningFormValues,
  parseEveningCheckinFormData,
  parseMorningCheckinFormData,
} from "~/lib/validation/daily";
import { requireViewer } from "~/lib/viewer.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { responseHeaders, supabase, viewer } = await requireViewer({
    context,
    request,
  });
  const date = paramsDateFromRequest(request);
  const entry = await getDailyEntryByDate(supabase, viewer.user.id, date);

  return data(
    {
      date,
      entry,
      eveningValues: getEveningFormValues(entry, date),
      morningValues: getMorningFormValues(entry, date),
    },
    {
      headers: responseHeaders,
    },
  );
}

type ActionData = {
  eveningErrors?: Record<string, string>;
  eveningSuccess?: string;
  eveningValues: ReturnType<typeof getEveningFormValues>;
  morningErrors?: Record<string, string>;
  morningSuccess?: string;
  morningValues: ReturnType<typeof getMorningFormValues>;
};

export async function action({ context, request }: Route.ActionArgs) {
  const { responseHeaders, supabase, viewer } = await requireViewer({
    context,
    request,
  });
  const date = paramsDateFromRequest(request);
  const existing = await getDailyEntryByDate(supabase, viewer.user.id, date);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "delete") {
    await deleteDailyEntryByDate(supabase, viewer.user.id, date);

    throw redirect("/history?status=daily-deleted", {
      headers: responseHeaders,
    });
  }

  if (intent === "save-morning") {
    const result = parseMorningCheckinFormData(formData);

    if (!result.success) {
      return data<ActionData>(
        {
          eveningValues: getEveningFormValues(existing, date),
          morningErrors: result.errors,
          morningValues: result.values,
        },
        {
          headers: responseHeaders,
          status: 400,
        },
      );
    }

    const entry = await saveMorningEntry(supabase, viewer.user.id, {
      ...result.payload,
      entryDate: date,
    });

    return data<ActionData>(
      {
        eveningValues: getEveningFormValues(entry, date),
        morningSuccess: `Morning details updated for ${entry.entry_date}.`,
        morningValues: getMorningFormValues(entry, date),
      },
      {
        headers: responseHeaders,
      },
    );
  }

  if (intent === "save-evening") {
    const result = parseEveningCheckinFormData(formData);

    if (!result.success) {
      return data<ActionData>(
        {
          eveningErrors: result.errors,
          eveningValues: result.values,
          morningValues: getMorningFormValues(existing, date),
        },
        {
          headers: responseHeaders,
          status: 400,
        },
      );
    }

    const entry = await saveEveningEntry(supabase, viewer.user.id, {
      ...result.payload,
      entryDate: date,
    });

    return data<ActionData>(
      {
        eveningSuccess: `Evening details updated for ${entry.entry_date}.`,
        eveningValues: getEveningFormValues(entry, date),
        morningValues: getMorningFormValues(entry, date),
      },
      {
        headers: responseHeaders,
      },
    );
  }

  return data<ActionData>(
    {
      eveningValues: getEveningFormValues(existing, date),
      morningValues: getMorningFormValues(existing, date),
    },
    {
      headers: responseHeaders,
      status: 400,
    },
  );
}

export default function DailyHistoryDetail({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <section className="page-narrow stack">
      <Card className="form-card">
        <p className="eyebrow">Daily entry</p>
        <h1>{formatDisplayDate(loaderData.date)}</h1>
        <p className="muted">
          Edit the morning and evening halves independently, or delete the entire daily row.
        </p>
        <div className="button-row">
          <Link className="button button-secondary" to="/history">
            Back to history
          </Link>
        </div>
      </Card>

      <MorningCheckinForm
        errors={actionData?.morningErrors}
        hiddenFields={[{ name: "intent", value: "save-morning" }]}
        isSubmitting={isSubmitting}
        lockDate={true}
        secondaryLink={{
          label: "Back to history",
          to: "/history",
        }}
        submitLabel="Update morning"
        successMessage={actionData?.morningSuccess}
        values={actionData?.morningValues ?? loaderData.morningValues}
      />

      <div id="evening-editor">
        <EveningCheckinForm
          errors={actionData?.eveningErrors}
          hiddenFields={[{ name: "intent", value: "save-evening" }]}
          isSubmitting={isSubmitting}
          lockDate={true}
          secondaryLink={{
            label: "Back to history",
            to: "/history",
          }}
          submitLabel="Update evening"
          successMessage={actionData?.eveningSuccess}
          values={actionData?.eveningValues ?? loaderData.eveningValues}
        />
      </div>

      <Card className="form-card">
        <p className="eyebrow">Danger zone</p>
        <h2>Delete this daily entry</h2>
        <p className="muted">
          This removes both the morning and evening data for {formatDisplayDate(loaderData.date)}.
        </p>
        <Form method="post">
          <input name="intent" type="hidden" value="delete" />
          <Button tone="danger" type="submit">
            Delete daily entry
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
