import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Check if real, valid Supabase credentials are configured in the browser environment.
 * Prevents phantom WebSocket connection attempts to placeholder URLs.
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (
    supabaseUrl.includes("placeholder") ||
    supabaseUrl.includes("your-project") ||
    supabaseAnonKey.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ Supabase URL or Anon Key is missing or using placeholders in .env.local. Please configure real credentials to connect to your Supabase project."
      );
    }
  }

  return createBrowserClient<Database>(
    supabaseUrl || "https://placeholder-project.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
  );
}

