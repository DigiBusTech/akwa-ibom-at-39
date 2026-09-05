import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient(): Promise<SupabaseClient<Database>> {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Outside of active Next.js request scope (e.g. testing or static build)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore?.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore?.set({ name, value, ...options });
          } catch {
            // Can be called from Server Component where cookies cannot be mutated
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore?.set({ name, value: "", ...options });
          } catch {
            // Can be called from Server Component where cookies cannot be mutated
          }
        },
      },
    }
  ) as unknown as SupabaseClient<Database>;
}

/**
 * Privileged Service Role Supabase Client
 * Use ONLY in secure server contexts (Server Actions / Route Handlers)
 * Never expose to client bundles.
 */
export function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey === "placeholder-service-role-key") {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Privileged administrative database operations will not succeed."
      );
    }
  }

  return createServerClient<Database>(
    supabaseUrl,
    serviceRoleKey || "placeholder-service-role-key",
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
    }
  ) as unknown as SupabaseClient<Database>;
}

