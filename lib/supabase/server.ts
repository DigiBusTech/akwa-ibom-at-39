import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Check if valid, live Supabase credentials are configured in the server environment.
 * Prevents phantom HTTP connection attempts to placeholder URLs.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (
    url.includes("placeholder") ||
    url.includes("your-project") ||
    anonKey.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

/**
 * Standard Supabase client using anon key and active cookies.
 * Enforces a strict 5-second fetch timeout to prevent hanging server requests.
 */
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
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          return fetch(input, {
            ...init,
            signal: init?.signal || AbortSignal.timeout(5000),
          });
        },
      },
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
 * Never expose to client bundles. Enforces strict 5-second timeout.
 */
export function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const keyToUse = serviceRoleKey && !serviceRoleKey.includes("placeholder")
    ? serviceRoleKey
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createServerClient<Database>(
    supabaseUrl,
    keyToUse,
    {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          return fetch(input, {
            ...init,
            signal: init?.signal || AbortSignal.timeout(5000),
          });
        },
      },
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


