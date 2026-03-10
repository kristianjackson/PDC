import { Form } from "react-router";

import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { InputField } from "~/components/ui/InputField";
import { SliderField } from "~/components/ui/SliderField";
import { TextAreaField } from "~/components/ui/TextAreaField";
import { ToggleField } from "~/components/ui/ToggleField";
import type { WeeklyReviewValues } from "~/lib/validation/weekly";

type WeeklyReviewFormProps = {
  errors?: Partial<Record<keyof WeeklyReviewValues, string>>;
  hiddenFields?: Array<{
    name: string;
    value: string;
  }>;
  isSubmitting?: boolean;
  lockDate?: boolean;
  submitLabel?: string;
  successMessage?: string;
  values: WeeklyReviewValues;
};

export function WeeklyReviewForm({
  errors,
  hiddenFields = [],
  isSubmitting = false,
  lockDate = false,
  submitLabel = "Save weekly review",
  successMessage,
  values,
}: WeeklyReviewFormProps) {
  return (
    <Form className="stack" method="post">
      {hiddenFields.map((field) => (
        <input key={field.name} name={field.name} type="hidden" value={field.value} />
      ))}
      {successMessage ? <p className="banner banner-success">{successMessage}</p> : null}
      <Card className="form-card">
        <p className="eyebrow">Weekly review</p>
        <h1>Capture the week in one pass</h1>
        <p className="muted">
          This is the higher-friction review step: training, nutrition, backlog pressure,
          social stability, and a short reflection.
        </p>
      </Card>

      <Card className="form-card stack">
        <InputField
          defaultValue={values.weekEndDate}
          error={errors?.weekEndDate}
          label="Week ending"
          name="weekEndDate"
          readOnly={lockDate}
          type="date"
        />
        <SliderField
          error={errors?.trainingConsistency}
          hint="How consistent was your training?"
          label="Training consistency"
          name="trainingConsistency"
          value={values.trainingConsistency}
        />
        <SliderField
          error={errors?.nutritionConsistency}
          hint="How close did nutrition stay to plan?"
          label="Nutrition consistency"
          name="nutritionConsistency"
          value={values.nutritionConsistency}
        />
        <SliderField
          error={errors?.screenTimeEstimate}
          hint="0 = minimal, 10 = extremely high"
          label="Screen time estimate"
          min={0}
          name="screenTimeEstimate"
          value={values.screenTimeEstimate}
        />
        <SliderField
          error={errors?.inboxPressure}
          hint="How heavy did backlog pressure feel?"
          label="Inbox pressure"
          name="inboxPressure"
          value={values.inboxPressure}
        />
        <SliderField
          error={errors?.socialConnection}
          hint="Quality of social connection this week"
          label="Social connection"
          name="socialConnection"
          value={values.socialConnection}
        />
        <SliderField
          error={errors?.relationshipStability}
          hint="Overall relationship stability"
          label="Relationship stability"
          name="relationshipStability"
          value={values.relationshipStability}
        />
        <ToggleField
          checked={values.travelWeek}
          description="Mark true if travel meaningfully shaped the week"
          label="Travel this week"
          name="travelWeek"
        />
        <SliderField
          error={errors?.entertainmentLoad}
          hint="0 = almost none, 10 = very high"
          label="Entertainment load"
          min={0}
          name="entertainmentLoad"
          value={values.entertainmentLoad}
        />
        <TextAreaField
          defaultValue={values.reflection}
          error={errors?.reflection}
          hint="A brief summary of what mattered most this week"
          label="Reflection"
          name="reflection"
          rows={6}
        />
        <div className="button-row">
          <Button busy={isSubmitting} busyLabel="Saving weekly review..." type="submit">
            {submitLabel}
          </Button>
        </div>
      </Card>
    </Form>
  );
}
