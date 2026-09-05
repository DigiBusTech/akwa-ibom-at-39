"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeUserName, sanitizeLga } from "@/lib/quiz-utils";
import { checkRateLimit } from "@/lib/ratelimit";
import type { BirthdayWish } from "@/types/database";
import sanitizeHtml from "sanitize-html";

export interface SubmitWishPayload {
  author_name: string;
  lga?: string | null;
  wish_text: string;
}

// Fallback seed wishes bridging Home and Diaspora
const FALLBACK_WISHES: BirthdayWish[] = [
  {
    id: "wish-1",
    author_name: "Emem Bassey",
    lga: "Uyo, Akwa Ibom",
    wish_text: "Happy 39th Anniversary to the Land of Promise! May our peace, unity, and rapid development continue to shine across the nation.",
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "wish-2",
    author_name: "Dr. Kufre Okon",
    lga: "Houston, USA (Diaspora)",
    wish_text: "From Texas to Uyo with boundless pride! 39 years of resilience, rich culture, and relentless progress. Proudly Akwa Ibomite!",
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "wish-3",
    author_name: "Aniefiok Ekpenyong",
    lga: "London, UK (Diaspora)",
    wish_text: "Distance cannot separate our love for our ancestral roots. Happy 39th Anniversary! Dakkada to higher heights!",
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "wish-4",
    author_name: "Idara Asuquo",
    lga: "Eket LGA",
    wish_text: "Celebrating 39 shades of gratitude! Akwa Ibom is indeed the cleanest, most hospitable and peaceful state in Africa.",
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "wish-5",
    author_name: "Ubong Udoh",
    lga: "Toronto, Canada (Diaspora)",
    wish_text: "From snowy Canada, my heart remains with the warm orange soils and lush green landscape of Akwa Ibom. Happy 39th!",
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: "wish-6",
    author_name: "Blessing Inyang",
    lga: "Ikot Ekpene LGA",
    wish_text: "The Raffia City rejoices! May God bless the ARISE agenda and all sons and daughters of Akwa Ibom worldwide.",
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

// In-memory submissions cache for local dev / offline mode
const localWishesStore: BirthdayWish[] = [...FALLBACK_WISHES];

function isPlaceholderConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return (
    !url ||
    !key ||
    url.includes("placeholder") ||
    key.includes("placeholder") ||
    url.includes("your-project")
  );
}

export async function fetchBirthdayWishes(): Promise<BirthdayWish[]> {
  if (!isPlaceholderConfig()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("birthday_wishes")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("Could not fetch wishes from Supabase, using store:", err);
    }
  }

  return localWishesStore;
}

export async function submitBirthdayWish(payload: SubmitWishPayload): Promise<{ success: boolean; message: string }> {
  // Rate limiting check: 5 wishes per 10 minutes per IP/session
  const rateKey = `wish_submit_${payload.author_name.slice(0, 10)}`;
  const rate = await checkRateLimit(rateKey, 5, 600_000);
  if (!rate.success) {
    throw new Error("Rate limit exceeded. Please wait a few minutes before submitting another wish.");
  }

  const sanitizedAuthor = sanitizeUserName(payload.author_name);
  const sanitizedLocation = sanitizeLga(payload.lga);

  if (!payload.wish_text || typeof payload.wish_text !== "string") {
    throw new Error("Wish message is required.");
  }

  const cleanedWish = sanitizeHtml(payload.wish_text, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  if (cleanedWish.length < 5) {
    throw new Error("Wish must be at least 5 characters long.");
  }

  const newWish: BirthdayWish = {
    id: crypto.randomUUID(),
    author_name: sanitizedAuthor,
    lga: sanitizedLocation || "Proud Akwa Ibomite",
    wish_text: cleanedWish,
    is_approved: true,
    created_at: new Date().toISOString(),
  };

  if (!isPlaceholderConfig()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("birthday_wishes").insert({
        author_name: sanitizedAuthor,
        lga: sanitizedLocation,
        wish_text: cleanedWish,
        is_approved: true,
      });

      if (!error) {
        revalidatePath("/");
        return { success: true, message: "Your birthday wish has been published!" };
      }
    } catch (err) {
      console.warn("Supabase wish insert failed, adding to memory store:", err);
    }
  }

  // Prepend to local memory store
  localWishesStore.unshift(newWish);
  revalidatePath("/");
  return { success: true, message: "Your birthday wish has been published!" };
}

export async function fetchAllWishesForAdmin(): Promise<BirthdayWish[]> {
  if (!isPlaceholderConfig()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("birthday_wishes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn("Could not fetch admin wishes from Supabase:", err);
    }
  }

  return localWishesStore;
}

export async function toggleWishApproval(wishId: string, currentStatus: boolean): Promise<boolean> {
  const newStatus = !currentStatus;

  // Update in local memory store
  const item = localWishesStore.find((w) => w.id === wishId);
  if (item) {
    item.is_approved = newStatus;
  }

  if (!isPlaceholderConfig()) {
    try {
      const supabase = await createClient();
      await supabase
        .from("birthday_wishes")
        .update({ is_approved: newStatus })
        .eq("id", wishId);
    } catch (err) {
      console.warn("Failed to toggle wish approval in Supabase:", err);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return newStatus;
}

