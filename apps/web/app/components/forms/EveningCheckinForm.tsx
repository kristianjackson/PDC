import { Form, Link } from "react-router";

import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { InputField } from "~/components/ui/InputField";
import { SliderField } from "~/components/ui/SliderField";
import { TextAreaField } from "~/components/ui/TextAreaField";
import { ToggleField } from "~/components/ui/ToggleField";
import type { EveningCheckinValues } from "~/lib/validation/daily";

type EveningCheckinFormProps = {
  errors?: Partial<Record<keyof EveningCheckinValues, string>>;
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
  values: EveningCheckinValues;
};

export function EveningCheckinForm({
  errors,
  hiddenFields = [],
  isSubmitting = false,
  lockDate = false,
  secondaryLink = {
    label: "Back to morning",
    to: "/checkin/morning",
  },
  submitLabel = "Save evening check-in",
  successMessage,
  values,
}: EveningCheckinFormProps) {
  return (
    <Form className="stack" method="post">
      {hiddenFields.map((field) => (
        <input key={field.name} name={field.name} type="hidden" value={field.value} />
      ))}
      {successMessage ? <p className="banner banner-success">{successMessage}</p> : null}
      <Card className="form-card">
        <p className="eyebrow">Evening check-in</p>
        <h1>Close out the day</h1>
        <p className="muted">
          Save mood, stress, productivity, habits, and notes onto the same daily record
          keyed by date.
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
        <SliderField
          error={errors?.eveningMood}
          hint="How the day felt overall"
          label="Evening mood"
          name="eveningMood"
          value={values.eveningMood}
        />
        <SliderField
          error={errors?.stressLevel}
          hint="1 = very calm, 10 = overwhelmed"
          label="Stress level"
          name="stressLevel"
          value={values.stressLevel}
        />
        <SliderField
          error={errors?.productivityLevel}
          hint="How productive the day felt"
          label="Productivity level"
          name="productivityLevel"
          value={values.productivityLevel}
        />
        <div className="form-two-column">
          <InputField
            defaultValue={values.caffeineCount}
            error={errors?.caffeineCount}
            inputMode="numeric"
            label="Caffeine count"
            min="0"
            name="caffeineCount"
            step="1"
            type="number"
          />
          <InputField
            defaultValue={values.alcoholCount}
            error={errors?.alcoholCount}
            inputMode="numeric"
            label="Alcohol count"
            min="0"
            name="alcoholCount"
            step="1"
            type="number"
          />
        </div>
        <ToggleField
          checked={values.exerciseCompleted}
          description="Any intentional exercise counts"
          label="Exercise completed"
          name="exerciseCompleted"
        />
        <InputField
          defaultValue={values.steps}
          error={errors?.steps}
          hint="Optional"
          inputMode="numeric"
          label="Steps"
          min="0"
          name="steps"
          step="1"
          type="number"
        />
        <ToggleField
          checked={values.meditationCompleted}
          description="Mark true for any meditation session"
          label="Meditation completed"
          name="meditationCompleted"
        />
        <ToggleField
          checked={values.meaningfulSocialContact}
          description="Meaningful conversation or social connection"
          label="Meaningful social contact"
          name="meaningfulSocialContact"
        />
        <SliderField
          error={errors?.conflictLevel}
          hint="1 = none, 10 = severe"
          label="Conflict level"
          name="conflictLevel"
          value={values.conflictLevel}
        />
        <TextAreaField
          defaultValue={values.notes}
          error={errors?.notes}
          hint="Optional free-text notes for context"
          label="Notes"
          name="notes"
          rows={5}
        />
        <div className="button-row">
          <Button busy={isSubmitting} busyLabel="Saving evening check-in..." type="submit">
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
