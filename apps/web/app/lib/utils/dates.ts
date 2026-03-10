const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const APP_TIME_ZONE = "America/New_York";

export function getTodayDateValue() {
  return formatDateValue(new Date());
}

export function getCurrentWeekEndDateValue() {
  return getWeekEndDateValue(new Date());
}

export function getDateParamValue(value: string | null) {
  if (value && DATE_PATTERN.test(value)) {
    return value;
  }

  return getTodayDateValue();
}

export function getWeekEndDateParamValue(value: string | null) {
  if (value && DATE_PATTERN.test(value)) {
    return value;
  }

  return getCurrentWeekEndDateValue();
}

export function isDateValue(value: string) {
  return DATE_PATTERN.test(value);
}

export function formatDisplayDate(value: string) {
  if (!DATE_PATTERN.test(value)) {
    return value;
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

function formatDateValue(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

function getWeekEndDateValue(date: Date) {
  const normalized = new Date(`${formatDateValue(date)}T12:00:00.000Z`);
  const dayOfWeek = normalized.getUTCDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;

  normalized.setUTCDate(normalized.getUTCDate() + daysUntilSunday);

  return formatDateValue(normalized);
}
