"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { PlatformSettings } from "@/types/database";

// In-memory fallback if Supabase is unconfigured or table is pending migration
let fallbackSettings: PlatformSettings = {
  id: 1,
  confetti_start_time: null,
  confetti_end_time: null,
  updated_at: new Date().toISOString(),
};

/**
 * Fetch platform celebration & confetti settings.
 * Safe for server components, route handlers, and client queries.
 */
export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  if (!isSupabaseConfigured()) {
    return fallbackSettings;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      if (error && error.code !== "PGRST116") {
        console.warn("Notice: could not query platform_settings from Supabase:", error.message);
      }
      return fallbackSettings;
    }

    // Cache the latest valid data into fallback
    fallbackSettings = data as PlatformSettings;
    return data as PlatformSettings;
  } catch (err) {
    console.warn("fetchPlatformSettings error:", err);
    return fallbackSettings;
  }
}

export interface UpdateCelebrationSettingsInput {
  confetti_start_time: string | null;
  confetti_end_time: string | null;
}

/**
 * Update celebration confetti start and end schedule.
 * Can be called from the Admin dashboard.
 */
export async function updateCelebrationSettings(
  input: UpdateCelebrationSettingsInput
): Promise<{ success: boolean; error?: string; settings?: PlatformSettings }> {
  const startTime = input.confetti_start_time ? new Date(input.confetti_start_time).toISOString() : null;
  const endTime = input.confetti_end_time ? new Date(input.confetti_end_time).toISOString() : null;

  if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
    return {
      success: false,
      error: "End time must be after the start time.",
    };
  }

  const updatedRow: PlatformSettings = {
    id: 1,
    confetti_start_time: startTime,
    confetti_end_time: endTime,
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    fallbackSettings = updatedRow;
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, settings: fallbackSettings };
  }

  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("platform_settings")
      .upsert(
        {
          id: 1,
          confetti_start_time: startTime,
          confetti_end_time: endTime,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Failed to update platform_settings in Supabase:", error);
      // Still update in-memory fallback to avoid blocking the user interface
      fallbackSettings = updatedRow;
      return { success: false, error: error.message };
    }

    fallbackSettings = data as PlatformSettings;
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, settings: data as PlatformSettings };
  } catch (err: any) {
    console.error("updateCelebrationSettings error:", err);
    return { success: false, error: err?.message || "Failed to update settings." };
  }
}
