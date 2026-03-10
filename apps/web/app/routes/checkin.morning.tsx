import { data, useNavigation } from "react-router";

import type { Route } from "./+types/checkin.morning";
import { MorningCheckinForm } from "~/components/forms/MorningCheckinForm";
import {
  getDailyEntryByDate,
  saveMorningEntry,
} from "~/lib/db/daily-entries.server";
import {
  getMorningFormValues,
  parseMorningCheckinFormData,
} from "~/lib/validation/daily";
import { getDateParamValue } from "~/lib/utils/dates";
import { requireViewer } from "~/lib/viewer.server";

type ActionData =
  | {
      errors: Record<string, string>;
      success?: never;
      values: ReturnType<typeof getMorningFormValues>;
    }
  | {
      errors?: never;
      success: string;
      values: ReturnType<typeof getMorningFormValues>;
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
      values: getMorningFormValues(entry, selectedDate),
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
  const result = parseMorningCheckinFormData(formData);

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

  const entry = await saveMorningEntry(supabase, viewer.user.id, result.payload);

  return data<ActionData>(
    {
      success: `Morning check-in saved for ${entry.entry_date}.`,
      values: getMorningFormValues(entry, entry.entry_date),
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function MorningCheckin({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();

  return (
    <section className="page-narrow">
      <MorningCheckinForm
        errors={actionData?.errors}
        isSubmitting={navigation.state === "submitting"}
        successMessage={actionData?.success}
        values={actionData?.values ?? loaderData.values}
      />
    </section>
  );
}
