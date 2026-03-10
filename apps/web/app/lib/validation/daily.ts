import type { Database } from "~/types/database";

type DailyEntryRow = Database["public"]["Tables"]["daily_entries"]["Row"];

type MorningFieldName =
  | "entryDate"
  | "sleepDurationHours"
  | "sleepQuality"
  | "wakeEnergy"
  | "bodyWeight"
  | "morningMood";

type EveningFieldName =
  | "entryDate"
  | "eveningMood"
  | "stressLevel"
  | "productivityLevel"
  | "caffeineCount"
  | "alcoholCount"
  | "exerciseCompleted"
  | "steps"
  | "meditationCompleted"
  | "meaningfulSocialContact"
  | "conflictLevel"
  | "notes";

export type MorningCheckinValues = {
  bodyWeight: string;
  entryDate: string;
  morningMood: string;
  sleepDurationHours: string;
  sleepQuality: string;
  wakeEnergy: string;
};

export type EveningCheckinValues = {
  alcoholCount: string;
  caffeineCount: string;
  conflictLevel: string;
  entryDate: string;
  eveningMood: string;
  exerciseCompleted: boolean;
  meaningfulSocialContact: boolean;
  meditationCompleted: boolean;
  notes: string;
  productivityLevel: string;
  steps: string;
  stressLevel: string;
};

export type MorningCheckinPayload = {
  bodyWeight: number | null;
  entryDate: string;
  morningMood: number;
  sleepDurationHours: number;
  sleepQuality: number;
  wakeEnergy: number;
};

export type EveningCheckinPayload = {
  alcoholCount: number;
  caffeineCount: number;
  conflictLevel: number;
  entryDate: string;
  eveningMood: number;
  exerciseCompleted: boolean;
  meaningfulSocialContact: boolean;
  meditationCompleted: boolean;
  notes: string | null;
  productivityLevel: number;
  steps: number | null;
  stressLevel: number;
};

export type MorningValidationResult =
  | {
      payload: MorningCheckinPayload;
      success: true;
      values: MorningCheckinValues;
    }
  | {
      errors: Partial<Record<MorningFieldName, string>>;
      success: false;
      values: MorningCheckinValues;
    };

export type EveningValidationResult =
  | {
      payload: EveningCheckinPayload;
      success: true;
      values: EveningCheckinValues;
    }
  | {
      errors: Partial<Record<EveningFieldName, string>>;
      success: false;
      values: EveningCheckinValues;
    };

export function getMorningFormValues(
  entry: DailyEntryRow | null,
  selectedDate: string,
): MorningCheckinValues {
  return {
    bodyWeight: formatOptionalNumber(entry?.body_weight),
    entryDate: entry?.entry_date ?? selectedDate,
    morningMood: formatOptionalNumber(entry?.morning_mood),
    sleepDurationHours: formatOptionalNumber(entry?.sleep_duration_hours),
    sleepQuality: formatOptionalNumber(entry?.sleep_quality),
    wakeEnergy: formatOptionalNumber(entry?.wake_energy),
  };
}

export function getEveningFormValues(
  entry: DailyEntryRow | null,
  selectedDate: string,
): EveningCheckinValues {
  return {
    alcoholCount: formatInteger(entry?.alcohol_count ?? 0),
    caffeineCount: formatInteger(entry?.caffeine_count ?? 0),
    conflictLevel: formatOptionalNumber(entry?.conflict_level),
    entryDate: entry?.entry_date ?? selectedDate,
    eveningMood: formatOptionalNumber(entry?.evening_mood),
    exerciseCompleted: entry?.exercise_completed ?? false,
    meaningfulSocialContact: entry?.meaningful_social_contact ?? false,
    meditationCompleted: entry?.meditation_completed ?? false,
    notes: entry?.notes ?? "",
    productivityLevel: formatOptionalNumber(entry?.productivity_level),
    steps: formatOptionalNumber(entry?.steps),
    stressLevel: formatOptionalNumber(entry?.stress_level),
  };
}

export function parseMorningCheckinFormData(formData: FormData): MorningValidationResult {
  const values: MorningCheckinValues = {
    bodyWeight: getString(formData, "bodyWeight"),
    entryDate: getString(formData, "entryDate"),
    morningMood: getString(formData, "morningMood"),
    sleepDurationHours: getString(formData, "sleepDurationHours"),
    sleepQuality: getString(formData, "sleepQuality"),
    wakeEnergy: getString(formData, "wakeEnergy"),
  };

  const errors: Partial<Record<MorningFieldName, string>> = {};

  const entryDate = parseDate(values.entryDate);
  const sleepDurationHours = parseNumber(values.sleepDurationHours, {
    field: "sleepDurationHours",
    errors,
    label: "Sleep duration",
    max: 24,
    min: 0,
  });
  const sleepQuality = parseInteger(values.sleepQuality, {
    field: "sleepQuality",
    errors,
    label: "Sleep quality",
    max: 10,
    min: 1,
  });
  const wakeEnergy = parseInteger(values.wakeEnergy, {
    field: "wakeEnergy",
    errors,
    label: "Wake energy",
    max: 10,
    min: 1,
  });
  const morningMood = parseInteger(values.morningMood, {
    field: "morningMood",
    errors,
    label: "Morning mood",
    max: 10,
    min: 1,
  });
  const bodyWeight = parseOptionalNumber(values.bodyWeight, {
    field: "bodyWeight",
    errors,
    label: "Body weight",
    max: 1000,
    min: 0,
  });

  if (!entryDate) {
    errors.entryDate = "Use a valid date.";
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
      bodyWeight,
      entryDate: entryDate!,
      morningMood,
      sleepDurationHours,
      sleepQuality,
      wakeEnergy,
    },
    success: true,
    values,
  };
}

export function parseEveningCheckinFormData(formData: FormData): EveningValidationResult {
  const values: EveningCheckinValues = {
    alcoholCount: getString(formData, "alcoholCount"),
    caffeineCount: getString(formData, "caffeineCount"),
    conflictLevel: getString(formData, "conflictLevel"),
    entryDate: getString(formData, "entryDate"),
    eveningMood: getString(formData, "eveningMood"),
    exerciseCompleted: getBoolean(formData, "exerciseCompleted"),
    meaningfulSocialContact: getBoolean(formData, "meaningfulSocialContact"),
    meditationCompleted: getBoolean(formData, "meditationCompleted"),
    notes: getString(formData, "notes"),
    productivityLevel: getString(formData, "productivityLevel"),
    steps: getString(formData, "steps"),
    stressLevel: getString(formData, "stressLevel"),
  };

  const errors: Partial<Record<EveningFieldName, string>> = {};

  const entryDate = parseDate(values.entryDate);
  const eveningMood = parseInteger(values.eveningMood, {
    field: "eveningMood",
    errors,
    label: "Evening mood",
    max: 10,
    min: 1,
  });
  const stressLevel = parseInteger(values.stressLevel, {
    field: "stressLevel",
    errors,
    label: "Stress level",
    max: 10,
    min: 1,
  });
  const productivityLevel = parseInteger(values.productivityLevel, {
    field: "productivityLevel",
    errors,
    label: "Productivity level",
    max: 10,
    min: 1,
  });
  const caffeineCount = parseInteger(values.caffeineCount, {
    field: "caffeineCount",
    errors,
    label: "Caffeine count",
    max: 20,
    min: 0,
  });
  const alcoholCount = parseInteger(values.alcoholCount, {
    field: "alcoholCount",
    errors,
    label: "Alcohol count",
    max: 20,
    min: 0,
  });
  const conflictLevel = parseInteger(values.conflictLevel, {
    field: "conflictLevel",
    errors,
    label: "Conflict level",
    max: 10,
    min: 1,
  });
  const steps = parseOptionalInteger(values.steps, {
    field: "steps",
    errors,
    label: "Steps",
    max: 100000,
    min: 0,
  });

  if (!entryDate) {
    errors.entryDate = "Use a valid date.";
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
      alcoholCount,
      caffeineCount,
      conflictLevel,
      entryDate: entryDate!,
      eveningMood,
      exerciseCompleted: values.exerciseCompleted,
      meaningfulSocialContact: values.meaningfulSocialContact,
      meditationCompleted: values.meditationCompleted,
      notes: normalizeOptionalText(values.notes),
      productivityLevel,
      steps,
      stressLevel,
    },
    success: true,
    values,
  };
}

function formatInteger(value: number) {
  return String(value);
}

function formatOptionalNumber(value: number | null | undefined) {
  return typeof value === "number" ? String(value) : "";
}

function getBoolean(formData: FormData, name: string) {
  return formData.get(name) === "true";
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

function parseOptionalInteger<TField extends string>(
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
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < options.min || parsed > options.max) {
    options.errors[options.field] = `${options.label} must be between ${options.min} and ${options.max}.`;
  }

  return parsed;
}

function parseNumber<TField extends string>(
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

  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < options.min || parsed > options.max) {
    options.errors[options.field] = `${options.label} must be between ${options.min} and ${options.max}.`;
  }

  return parsed;
}

function parseOptionalNumber<TField extends string>(
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
    return null;
  }

  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < options.min || parsed > options.max) {
    options.errors[options.field] = `${options.label} must be between ${options.min} and ${options.max}.`;
  }

  return parsed;
}
