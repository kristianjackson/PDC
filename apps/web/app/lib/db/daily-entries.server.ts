import type { AppSupabaseClient } from "~/lib/supabase/server";
import type {
  EveningCheckinPayload,
  MorningCheckinPayload,
} from "~/lib/validation/daily";
import type { Database } from "~/types/database";

export type DailyEntryRow = Database["public"]["Tables"]["daily_entries"]["Row"];

type DailyEntryInsert = Database["public"]["Tables"]["daily_entries"]["Insert"];
type DailyEntryUpdate = Database["public"]["Tables"]["daily_entries"]["Update"];

export async function getDailyEntryByDate(
  supabase: AppSupabaseClient,
  userId: string,
  entryDate: string,
): Promise<DailyEntryRow | null> {
  const { data, error } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", entryDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DailyEntryRow | null;
}

export async function listRecentDailyEntries(
  supabase: AppSupabaseClient,
  userId: string,
  limit?: number,
): Promise<DailyEntryRow[]> {
  let query = supabase
    .from("daily_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as DailyEntryRow[];
}

export async function deleteDailyEntryByDate(
  supabase: AppSupabaseClient,
  userId: string,
  entryDate: string,
) {
  const { error } = await supabase
    .from("daily_entries")
    .delete()
    .eq("user_id", userId)
    .eq("entry_date", entryDate);

  if (error) {
    throw error;
  }
}

export async function saveMorningEntry(
  supabase: AppSupabaseClient,
  userId: string,
  payload: MorningCheckinPayload,
): Promise<DailyEntryRow> {
  const existing = await getDailyEntryByDate(supabase, userId, payload.entryDate);

  if (!existing) {
    const insertPayload: DailyEntryInsert = {
      body_weight: payload.bodyWeight,
      entry_date: payload.entryDate,
      morning_mood: payload.morningMood,
      sleep_duration_hours: payload.sleepDurationHours,
      sleep_quality: payload.sleepQuality,
      user_id: userId,
      wake_energy: payload.wakeEnergy,
    };

    return await insertDailyEntry(supabase, insertPayload);
  }

  const updatePayload: DailyEntryUpdate = {
    body_weight: payload.bodyWeight,
    morning_mood: payload.morningMood,
    sleep_duration_hours: payload.sleepDurationHours,
    sleep_quality: payload.sleepQuality,
    wake_energy: payload.wakeEnergy,
  };

  return await updateDailyEntry(supabase, existing.id, updatePayload);
}

export async function saveEveningEntry(
  supabase: AppSupabaseClient,
  userId: string,
  payload: EveningCheckinPayload,
): Promise<DailyEntryRow> {
  const existing = await getDailyEntryByDate(supabase, userId, payload.entryDate);

  if (!existing) {
    const insertPayload: DailyEntryInsert = {
      alcohol_count: payload.alcoholCount,
      caffeine_count: payload.caffeineCount,
      conflict_level: payload.conflictLevel,
      entry_date: payload.entryDate,
      evening_mood: payload.eveningMood,
      exercise_completed: payload.exerciseCompleted,
      meaningful_social_contact: payload.meaningfulSocialContact,
      meditation_completed: payload.meditationCompleted,
      notes: payload.notes,
      productivity_level: payload.productivityLevel,
      steps: payload.steps,
      stress_level: payload.stressLevel,
      user_id: userId,
    };

    return await insertDailyEntry(supabase, insertPayload);
  }

  const updatePayload: DailyEntryUpdate = {
    alcohol_count: payload.alcoholCount,
    caffeine_count: payload.caffeineCount,
    conflict_level: payload.conflictLevel,
    evening_mood: payload.eveningMood,
    exercise_completed: payload.exerciseCompleted,
    meaningful_social_contact: payload.meaningfulSocialContact,
    meditation_completed: payload.meditationCompleted,
    notes: payload.notes,
    productivity_level: payload.productivityLevel,
    steps: payload.steps,
    stress_level: payload.stressLevel,
  };

  return await updateDailyEntry(supabase, existing.id, updatePayload);
}

async function insertDailyEntry(
  supabase: AppSupabaseClient,
  payload: DailyEntryInsert,
): Promise<DailyEntryRow> {
  const { data, error } = await supabase
    .from("daily_entries")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as DailyEntryRow;
}

async function updateDailyEntry(
  supabase: AppSupabaseClient,
  entryId: string,
  payload: DailyEntryUpdate,
): Promise<DailyEntryRow> {
  const { data, error } = await supabase
    .from("daily_entries")
    .update(payload)
    .eq("id", entryId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as DailyEntryRow;
}
