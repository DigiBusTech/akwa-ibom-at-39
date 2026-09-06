"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { DailyLetter } from "@/types/database";

const FALLBACK_DAILY_LETTERS: DailyLetter[] = [
  {
    id: "seed-day-1",
    day_number: 1,
    publish_date: "2026-09-01",
    title: "The Dawn of Promise: Remembering September 23, 1987",
    content: "Thirty-nine years ago, the dream of our founding fathers crystallized into reality. Akwa Ibom State was carved out of the former Cross River State, born from resilient prayer, visionary leadership, and an unshakeable belief that our people possess the destiny of greatness. As we step into this 39th anniversary season, let every citizen from the sandy shores of Ibeno to the rolling hills of Ini reflect on how far our faith, unity, and industrious spirit have carried us. We are not just a state; we are a beacon of peace, hospitality, and boundless opportunity.",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "seed-day-2",
    day_number: 2,
    publish_date: "2026-09-02",
    title: "The Soul of Our Soil: Honoring the Hands That Feed Us",
    content: "From the fertile cassava fields of Abak and the rich oil palm groves of Essien Udim to the flourishing fisheries along the Atlantic coast, the true wealth of Akwa Ibom has always resided in the dignity of our labor. Today, under the ARISE Agenda, agricultural transformation is placing food on every table and empowering our rural communities. Let us celebrate the farmers, traders, and artisans whose sweat nourishes our heritage every single morning.",
    created_at: "2026-09-02T00:00:00Z",
    updated_at: "2026-09-02T00:00:00Z",
  },
  {
    id: "seed-day-3",
    day_number: 3,
    publish_date: "2026-09-03",
    title: "A Tapestry of Culture: 31 LGAs, One Indivisible Family",
    content: "Whether we speak Ibibio, Annang, Oron, Obolo, or Ibeno, our heartbeat is identical. Our traditions, from the revered Ekpe masquerade to the warmth of our culinary mastery — Afang, Edikang Ikong, and Ekpang Nkukwo — are admired across the globe. Our cultural heritage is not a relic of the past; it is the living compass guiding our youth toward honor, discipline, and communal love.",
    created_at: "2026-09-03T00:00:00Z",
    updated_at: "2026-09-03T00:00:00Z",
  },
  {
    id: "seed-day-4",
    day_number: 4,
    publish_date: "2026-09-04",
    title: "The Global Diaspora: Ambassadors of the Land of Promise",
    content: "To our sons and daughters across the globe: distance cannot diminish your Akwa Ibom blood. Through your enterprise, intellectual contributions, and philanthropic remittances, you elevate our state on the world map. You remain an integral pillar of our celebration. Akwa Ibom is proud of you, and our doors are always open to welcome your ideas and investments back home.",
    created_at: "2026-09-04T00:00:00Z",
    updated_at: "2026-09-04T00:00:00Z",
  },
  {
    id: "seed-day-5",
    day_number: 5,
    publish_date: "2026-09-05",
    title: "The Horizon of Peace: Safeguarding Our Most Precious Asset",
    content: "In a rapidly changing world, Akwa Ibom stands out as an oasis of security, harmony, and political stability. Peace is not an accident; it is the deliberate collective covenant of every citizen, traditional institution, and religious leader. As we approach September 23rd, let us recommit to guarding this peace with vigilance, supporting one another, and fostering an environment where innovation thrives.",
    created_at: "2026-09-05T00:00:00Z",
    updated_at: "2026-09-05T00:00:00Z",
  },
  {
    id: "seed-day-6",
    day_number: 6,
    publish_date: "2026-09-06",
    title: "39 Shades of Gratitude: The Journey Continues",
    content: "Today, on this milestone countdown, we count our blessings as a people. We remember the past governors and leaders who laid foundational stones of infrastructure, education, and aviation. Today, the ARISE Agenda builds upon this enduring legacy, connecting rural development with urban excellence. Let every Akwa Ibomite wear our colors with pride, hold their head high, and boldly proclaim: We are Akwa Ibom, Land of Promise, and our best days are right ahead!",
    created_at: "2026-09-06T00:00:00Z",
    updated_at: "2026-09-06T00:00:00Z",
  },
];


/**
 * Public action: Fetches today's or the latest published letter.
 */
export async function fetchTodayDailyLetter(): Promise<DailyLetter> {
  const todayStr = new Date().toISOString().split("T")[0];

  if (!isSupabaseConfigured()) {
    const exact = FALLBACK_DAILY_LETTERS.find((l) => l.publish_date === todayStr);
    if (exact) return exact;
    return FALLBACK_DAILY_LETTERS[FALLBACK_DAILY_LETTERS.length - 1];
  }

  try {
    const supabase = await createClient();

    const { data: exactLetter } = await supabase
      .from("daily_letters")
      .select("*")
      .eq("publish_date", todayStr)
      .maybeSingle();

    if (exactLetter) return exactLetter as DailyLetter;

    const { data: recentLetter } = await supabase
      .from("daily_letters")
      .select("*")
      .lte("publish_date", todayStr)
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentLetter) return recentLetter as DailyLetter;

    const { data: latestAny } = await supabase
      .from("daily_letters")
      .select("*")
      .order("day_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestAny) return latestAny as DailyLetter;

    return FALLBACK_DAILY_LETTERS[FALLBACK_DAILY_LETTERS.length - 1];
  } catch (err) {
    console.error("Error fetching today's daily letter:", err);
    return FALLBACK_DAILY_LETTERS[FALLBACK_DAILY_LETTERS.length - 1];
  }
}

/**
 * Admin action: Returns all daily letters ordered by day_number ascending.
 */
export async function fetchAllDailyLettersAdmin(): Promise<DailyLetter[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_DAILY_LETTERS;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("daily_letters")
      .select("*")
      .order("day_number", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_DAILY_LETTERS;
    }

    return data as DailyLetter[];
  } catch (err) {
    console.error("Error in fetchAllDailyLettersAdmin:", err);
    return FALLBACK_DAILY_LETTERS;
  }
}

export interface CreateDailyLetterInput {
  day_number: number;
  publish_date: string;
  title: string;
  content: string;
}

export async function createDailyLetter(
  input: CreateDailyLetterInput
): Promise<{ success: boolean; error?: string; letter?: DailyLetter }> {
  if (!input.title?.trim()) return { success: false, error: "Title is required." };
  if (!input.content?.trim()) return { success: false, error: "Content is required." };
  if (!input.day_number || input.day_number < 1) return { success: false, error: "Valid day number is required." };
  if (!input.publish_date) return { success: false, error: "Publish date is required." };

  if (!isSupabaseConfigured()) {
    const newLetter: DailyLetter = {
      id: `local-${Date.now()}`,
      day_number: Number(input.day_number),
      publish_date: input.publish_date,
      title: input.title.trim(),
      content: input.content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    FALLBACK_DAILY_LETTERS.push(newLetter);
    return { success: true, letter: newLetter };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("daily_letters")
      .insert({
        day_number: Number(input.day_number),
        publish_date: input.publish_date,
        title: input.title.trim(),
        content: input.content.trim(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `Day number ${input.day_number} already exists.` };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/dp");

    return { success: true, letter: data as DailyLetter };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create." };
  }
}

export async function updateDailyLetter(
  id: string,
  input: CreateDailyLetterInput
): Promise<{ success: boolean; error?: string }> {
  if (!input.title?.trim()) return { success: false, error: "Title is required." };
  if (!input.content?.trim()) return { success: false, error: "Content is required." };
  if (!input.day_number || input.day_number < 1) return { success: false, error: "Valid day number is required." };

  if (!isSupabaseConfigured()) {
    const idx = FALLBACK_DAILY_LETTERS.findIndex((l) => l.id === id);
    if (idx !== -1) {
      FALLBACK_DAILY_LETTERS[idx] = {
        ...FALLBACK_DAILY_LETTERS[idx],
        day_number: Number(input.day_number),
        publish_date: input.publish_date,
        title: input.title.trim(),
        content: input.content.trim(),
        updated_at: new Date().toISOString(),
      };
    }
    return { success: true };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("daily_letters")
      .update({
        day_number: Number(input.day_number),
        publish_date: input.publish_date,
        title: input.title.trim(),
        content: input.content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/dp");

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update." };
  }
}

export async function deleteDailyLetter(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const idx = FALLBACK_DAILY_LETTERS.findIndex((l) => l.id === id);
    if (idx !== -1) FALLBACK_DAILY_LETTERS.splice(idx, 1);
    return { success: true };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("daily_letters").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/dp");

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete." };
  }
}

