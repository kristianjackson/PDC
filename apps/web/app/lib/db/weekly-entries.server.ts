import type { AppSupabaseClient } from "~/lib/supabase/server";
import type { WeeklyReviewPayload } from "~/lib/validation/weekly";
import type { Database } from "~/types/database";

export type WeeklyEntryRow = Database["public"]["Tables"]["weekly_entries"]["Row"];
type WeeklyEntryInsert = Database["public"]["Tables"]["weekly_entries"]["Insert"];
type WeeklyEntryUpdate = Database["public"]["Tables"]["weekly_entries"]["Update"];

export async function getWeeklyEntryByDate(
  supabase: AppSupabaseClient,
  userId: string,
  weekEndDate: string,
): Promise<WeeklyEntryRow | null> {
  const { data, error } = await supabase
    .from("weekly_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("week_end_date", weekEndDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as WeeklyEntryRow | null;
}

export async function listRecentWeeklyEntries(
  supabase: AppSupabaseClient,
  userId: string,
  limit?: number,
): Promise<WeeklyEntryRow[]> {
  let query = supabase
    .from("weekly_entries")
    .select("*")
    .eq("user_id", userId)
    .order("week_end_date", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as WeeklyEntryRow[];
}

export async function saveWeeklyEntry(
  supabase: AppSupabaseClient,
  userId: string,
  payload: WeeklyReviewPayload,
): Promise<WeeklyEntryRow> {
  const existing = await getWeeklyEntryByDate(supabase, userId, payload.weekEndDate);

  if (!existing) {
    const insertPayload: WeeklyEntryInsert = {
      entertainment_load: payload.entertainmentLoad,
      inbox_pressure: payload.inboxPressure,
      nutrition_consistency: payload.nutritionConsistency,
      reflection: payload.reflection,
      relationship_stability: payload.relationshipStability,
      screen_time_estimate: payload.screenTimeEstimate,
      social_connection: payload.socialConnection,
      training_consistency: payload.trainingConsistency,
      travel_week: payload.travelWeek,
      user_id: userId,
      week_end_date: payload.weekEndDate,
    };

    return await insertWeeklyEntry(supabase, insertPayload);
  }

  const updatePayload: WeeklyEntryUpdate = {
    entertainment_load: payload.entertainmentLoad,
    inbox_pressure: payload.inboxPressure,
    nutrition_consistency: payload.nutritionConsistency,
    reflection: payload.reflection,
    relationship_stability: payload.relationshipStability,
    screen_time_estimate: payload.screenTimeEstimate,
    social_connection: payload.socialConnection,
    training_consistency: payload.trainingConsistency,
    travel_week: payload.travelWeek,
  };

  return await updateWeeklyEntry(supabase, existing.id, updatePayload);
}

export async function deleteWeeklyEntryByDate(
  supabase: AppSupabaseClient,
  userId: string,
  weekEndDate: string,
) {
  const { error } = await supabase
    .from("weekly_entries")
    .delete()
    .eq("user_id", userId)
    .eq("week_end_date", weekEndDate);

  if (error) {
    throw error;
  }
}

async function insertWeeklyEntry(
  supabase: AppSupabaseClient,
  payload: WeeklyEntryInsert,
): Promise<WeeklyEntryRow> {
  const { data, error } = await supabase
    .from("weekly_entries")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as WeeklyEntryRow;
}

async function updateWeeklyEntry(
  supabase: AppSupabaseClient,
  entryId: string,
  payload: WeeklyEntryUpdate,
): Promise<WeeklyEntryRow> {
  const { data, error } = await supabase
    .from("weekly_entries")
    .update(payload)
    .eq("id", entryId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as WeeklyEntryRow;
}
