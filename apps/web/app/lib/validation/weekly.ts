import type { Database } from "~/types/database";

type WeeklyEntryRow = Database["public"]["Tables"]["weekly_entries"]["Row"];

type WeeklyFieldName =
  | "weekEndDate"
  | "trainingConsistency"
  | "nutritionConsistency"
  | "screenTimeEstimate"
  | "inboxPressure"
  | "socialConnection"
  | "relationshipStability"
  | "travelWeek"
  | "entertainmentLoad"
  | "reflection";

export type WeeklyReviewValues = {
  entertainmentLoad: string;
  inboxPressure: string;
  nutritionConsistency: string;
  reflection: string;
  relationshipStability: string;
  screenTimeEstimate: string;
  socialConnection: string;
  trainingConsistency: string;
  travelWeek: boolean;
  weekEndDate: string;
};

export type WeeklyReviewPayload = {
  entertainmentLoad: number;
  inboxPressure: number;
  nutritionConsistency: number;
  reflection: string | null;
  relationshipStability: number;
  screenTimeEstimate: number;
  socialConnection: number;
  trainingConsistency: number;
  travelWeek: boolean;
  weekEndDate: string;
};

export type WeeklyValidationResult =
  | {
      payload: WeeklyReviewPayload;
      success: true;
      values: WeeklyReviewValues;
    }
  | {
      errors: Partial<Record<WeeklyFieldName, string>>;
      success: false;
      values: WeeklyReviewValues;
    };

export function getWeeklyReviewFormValues(
  entry: WeeklyEntryRow | null,
  selectedDate: string,
): WeeklyReviewValues {
  return {
    entertainmentLoad: formatOptionalNumber(entry?.entertainment_load),
    inboxPressure: formatOptionalNumber(entry?.inbox_pressure),
    nutritionConsistency: formatOptionalNumber(entry?.nutrition_consistency),
    reflection: entry?.reflection ?? "",
    relationshipStability: formatOptionalNumber(entry?.relationship_stability),
    screenTimeEstimate: formatOptionalNumber(entry?.screen_time_estimate),
    socialConnection: formatOptionalNumber(entry?.social_connection),
    trainingConsistency: formatOptionalNumber(entry?.training_consistency),
    travelWeek: entry?.travel_week ?? false,
    weekEndDate: entry?.week_end_date ?? selectedDate,
  };
}

export function parseWeeklyReviewFormData(formData: FormData): WeeklyValidationResult {
  const values: WeeklyReviewValues = {
    entertainmentLoad: getString(formData, "entertainmentLoad"),
    inboxPressure: getString(formData, "inboxPressure"),
    nutritionConsistency: getString(formData, "nutritionConsistency"),
    reflection: getString(formData, "reflection"),
    relationshipStability: getString(formData, "relationshipStability"),
    screenTimeEstimate: getString(formData, "screenTimeEstimate"),
    socialConnection: getString(formData, "socialConnection"),
    trainingConsistency: getString(formData, "trainingConsistency"),
    travelWeek: formData.get("travelWeek") === "true",
    weekEndDate: getString(formData, "weekEndDate"),
  };

  const errors: Partial<Record<WeeklyFieldName, string>> = {};
  const weekEndDate = parseDate(values.weekEndDate);
  const trainingConsistency = parseInteger(values.trainingConsistency, {
    errors,
    field: "trainingConsistency",
    label: "Training consistency",
    max: 10,
    min: 1,
  });
  const nutritionConsistency = parseInteger(values.nutritionConsistency, {
    errors,
    field: "nutritionConsistency",
    label: "Nutrition consistency",
    max: 10,
    min: 1,
  });
  const screenTimeEstimate = parseInteger(values.screenTimeEstimate, {
    errors,
    field: "screenTimeEstimate",
    label: "Screen time estimate",
    max: 10,
    min: 0,
  });
  const inboxPressure = parseInteger(values.inboxPressure, {
    errors,
    field: "inboxPressure",
    label: "Inbox pressure",
    max: 10,
    min: 1,
  });
  const socialConnection = parseInteger(values.socialConnection, {
    errors,
    field: "socialConnection",
    label: "Social connection",
    max: 10,
    min: 1,
  });
  const relationshipStability = parseInteger(values.relationshipStability, {
    errors,
    field: "relationshipStability",
    label: "Relationship stability",
    max: 10,
    min: 1,
  });
  const entertainmentLoad = parseInteger(values.entertainmentLoad, {
    errors,
    field: "entertainmentLoad",
    label: "Entertainment load",
    max: 10,
    min: 0,
  });

  if (!weekEndDate) {
    errors.weekEndDate = "Use a valid week-ending date.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      success: false,
      values,
    };
  }

  return {
    payload: {
      entertainmentLoad,
      inboxPressure,
      nutritionConsistency,
      reflection: normalizeOptionalText(values.reflection),
      relationshipStability,
      screenTimeEstimate,
      socialConnection,
      trainingConsistency,
      travelWeek: values.travelWeek,
      weekEndDate: weekEndDate!,
    },
    success: true,
    values,
  };
}

function formatOptionalNumber(value: number | null | undefined) {
  return typeof value === "number" ? String(value) : "";
}

function getString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalText(value: string) {
  return value.trim().length > 0 ? value.trim() : null;
}

function parseDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function parseInteger<TField extends string>(
  value: string,
  options: {
    errors: Partial<Record<TField, string>>;
    field: TField;
    label: string;
    max: number;
    min: number;
  },
) {
  if (value.length === 0) {
    options.errors[options.field] = `${options.label} is required.`;

    return 0;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < options.min || parsed > options.max) {
    options.errors[options.field] = `${options.label} must be between ${options.min} and ${options.max}.`;
  }

  return parsed;
}
