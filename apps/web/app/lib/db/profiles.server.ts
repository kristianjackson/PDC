import type { User } from "@supabase/supabase-js";

import type { AppSupabaseClient } from "~/lib/supabase/server";
import type { Database } from "~/types/database";

export async function ensureProfile(
  supabase: AppSupabaseClient,
  user: User,
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
    },
    {
      onConflict: "id",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw error;
  }
}
