import { Form, Link } from "react-router";

import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { InputField } from "~/components/ui/InputField";
import { SliderField } from "~/components/ui/SliderField";
import type { MorningCheckinValues } from "~/lib/validation/daily";

type MorningCheckinFormProps = {
  errors?: Partial<Record<keyof MorningCheckinValues, string>>;
  hiddenFields?: Array<{
    name: string;
    value: string;
  }>;
  isSubmitting?: boolean;
  lockDate?: boolean;
  secondaryLink?: {
    label: string;
    to: string;
  } | null;
  submitLabel?: string;
  successMessage?: string;
  values: MorningCheckinValues;
};

export function MorningCheckinForm({
  errors,
  hiddenFields = [],
  isSubmitting = false,
  lockDate = false,
  secondaryLink = {
    label: "Go to evening flow",
    to: "/checkin/evening",
  },
  submitLabel = "Save morning check-in",
  successMessage,
  values,
}: MorningCheckinFormProps) {
  return (
    <Form className="stack" method="post">
      {hiddenFields.map((field) => (
        <input key={field.name} name={field.name} type="hidden" value={field.value} />
      ))}
      {successMessage ? <p className="banner banner-success">{successMessage}</p> : null}
      <Card className="form-card">
        <p className="eyebrow">Morning check-in</p>
        <h1>Capture how the day starts</h1>
        <p className="muted">
          Save the morning half of today’s `daily_entries` row. You can come back tonight
          and finish the evening section without losing this data.
        </p>
      </Card>

      <Card className="form-card stack">
        <InputField
          defaultValue={values.entryDate}
          error={errors?.entryDate}
          label="Date"
          name="entryDate"
          readOnly={lockDate}
          type="date"
        />
        <InputField
          defaultValue={values.sleepDurationHours}
          error={errors?.sleepDurationHours}
          hint="Decimal hours are fine, for example 7.5"
          inputMode="decimal"
          label="Sleep duration (hours)"
          min="0"
          name="sleepDurationHours"
          placeholder="7.5"
          step="0.1"
          type="number"
        />
        <SliderField
          error={errors?.sleepQuality}
          hint="1 = terrible, 10 = excellent"
          label="Sleep quality"
          name="sleepQuality"
          value={values.sleepQuality}
        />
        <SliderField
          error={errors?.wakeEnergy}
          hint="How energized did you feel on waking?"
          label="Wake energy"
          name="wakeEnergy"
          value={values.wakeEnergy}
        />
        <InputField
          defaultValue={values.bodyWeight}
          error={errors?.bodyWeight}
          hint="Optional"
          inputMode="decimal"
          label="Body weight"
          min="0"
          name="bodyWeight"
          placeholder="185.2"
          step="0.1"
          type="number"
        />
        <SliderField
          error={errors?.morningMood}
          hint="Overall morning mood"
          label="Morning mood"
          name="morningMood"
          value={values.morningMood}
        />
        <div className="button-row">
          <Button busy={isSubmitting} busyLabel="Saving morning check-in..." type="submit">
            {submitLabel}
          </Button>
          {secondaryLink ? (
            <Link className="button button-secondary" to={secondaryLink.to}>
              {secondaryLink.label}
            </Link>
          ) : null}
        </div>
      </Card>
    </Form>
  );
}
