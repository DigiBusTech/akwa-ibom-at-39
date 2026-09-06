import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";

// Static asset pattern to bypass tracking and rate limiting
const STATIC_ASSET_REGEX = /\.(svg|png|jpg|jpeg|gif|webp|ico|json|js|css|map|txt|xml|woff|woff2)$/i;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. API and Quiz Submission Rate Limiting
  if (pathname.startsWith("/api/") || pathname.startsWith("/quiz/submit")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const key = `req_${ip}_${pathname}`;
    const res = await checkRateLimit(key, 30, 60_000);

    if (!res.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please wait a moment before trying again.",
          retryAfter: res.reset,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(res.reset),
          },
        }
      );
    }
  }

  const response = NextResponse.next();

  // 2. Telemetry Capture for Web Pages
  // Skip internal next routes, static files, service worker, api
  const isInternal =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/workbox") ||
    STATIC_ASSET_REGEX.test(pathname);

  if (!isInternal && request.method === "GET") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const countryCode = (
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      "NG"
    ).toUpperCase();

    // 1. Device Identifier Cookie (Persistent for 1 Year across all sessions)
    let deviceId =
      request.cookies.get("ak39_did")?.value ||
      request.cookies.get("ak39_sid")?.value;
    const isNewDevice = !deviceId;

    if (!deviceId) {
      deviceId = `dev_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
      response.cookies.set("ak39_did", deviceId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 full year persistence
        sameSite: "lax",
        httpOnly: true,
      });
      // Maintain legacy session ref for backward-compat
      response.cookies.set("ak39_sid", deviceId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: true,
      });
    }

    // 2. Client-side Navigation Debouncing (Edge Cookie Based)
    // Prevents database exhaustion from rapid reloads or spamming (50k+ visitors/min safe)
    const lastRoute = request.cookies.get("ak39_lr")?.value;
    const lastTimeStr = request.cookies.get("ak39_lt")?.value;
    const nowMs = Date.now();
    const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
    const isSameRoute = lastRoute === pathname;
    const elapsedSec = (nowMs - lastTime) / 1000;

    // Throttle if same route refreshed within 15 seconds, or any navigation within 1.5 seconds
    const shouldThrottle = !isNewDevice && (isSameRoute ? elapsedSec < 15 : elapsedSec < 1.5);

    if (!shouldThrottle) {
      response.cookies.set("ak39_lr", pathname, {
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: "lax",
      });
      response.cookies.set("ak39_lt", String(nowMs), {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
      });

      // Silently record to Supabase in background (Non-blocking)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        // High performance atomic RPC procedure to update route & append to journey history
        fetch(`${supabaseUrl}/rest/v1/rpc/record_traffic_visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            p_device_id: deviceId,
            p_ip_address: ip,
            p_country_code: countryCode,
            p_page_route: pathname,
          }),
        })
          .then(async (res) => {
            // Fallback direct upsert if RPC has not yet been executed in target database
            if (!res.ok) {
              await fetch(`${supabaseUrl}/rest/v1/site_traffic?on_conflict=device_id`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                  Prefer: "resolution=merge-duplicates",
                },
                body: JSON.stringify({
                  device_id: deviceId,
                  ip_address: ip,
                  country_code: countryCode,
                  page_route: pathname,
                  visited_at: new Date().toISOString(),
                  session_id: deviceId,
                }),
              });
            }
          })
          .catch((err) => {
            // Silent catch to prevent any user interruption
            console.warn("Telemetry log failed:", err?.message || err);
          });
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

