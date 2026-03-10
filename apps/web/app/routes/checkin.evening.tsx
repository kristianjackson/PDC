import { data, useNavigation } from "react-router";

import type { Route } from "./+types/checkin.evening";
import { EveningCheckinForm } from "~/components/forms/EveningCheckinForm";
import {
  getDailyEntryByDate,
  saveEveningEntry,
} from "~/lib/db/daily-entries.server";
import {
  getEveningFormValues,
  parseEveningCheckinFormData,
} from "~/lib/validation/daily";
import { getDateParamValue } from "~/lib/utils/dates";
import { requireViewer } from "~/lib/viewer.server";

type ActionData =
  | {
      errors: Record<string, string>;
      success?: never;
      values: ReturnType<typeof getEveningFormValues>;
    }
  | {
      errors?: never;
      success: string;
      values: ReturnType<typeof getEveningFormValues>;
    };

export async function loader({ context, request }: Route.LoaderArgs) {
  const { responseHeaders, supabase, viewer } = await requireViewer({
    context,
    request,
  });

  const selectedDate = getDateParamValue(new URL(request.url).searchParams.get("date"));
  const entry = await getDailyEntryByDate(supabase, viewer.user.id, selectedDate);

  return data(
    {
      selectedDate,
      values: getEveningFormValues(entry, selectedDate),
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
  const result = parseEveningCheckinFormData(formData);

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

  const entry = await saveEveningEntry(supabase, viewer.user.id, result.payload);

  return data<ActionData>(
    {
      success: `Evening check-in saved for ${entry.entry_date}.`,
      values: getEveningFormValues(entry, entry.entry_date),
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function EveningCheckin({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();

  return (
    <section className="page-narrow">
      <EveningCheckinForm
        errors={actionData?.errors}
        isSubmitting={navigation.state === "submitting"}
        successMessage={actionData?.success}
        values={actionData?.values ?? loaderData.values}
      />
    </section>
  );
}
