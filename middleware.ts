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

    // Session Management & Throttling
    let sessionId = request.cookies.get("ak39_sid")?.value;
    const isNewSession = !sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      response.cookies.set("ak39_sid", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: "lax",
        httpOnly: true,
      });
    }

    // Check throttle cookie: throttle per session/route for 15 minutes to save database writes
    const throttleKey = `ak39_tr_${pathname.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const isThrottled = Boolean(request.cookies.get(throttleKey)?.value);

    if (!isThrottled || isNewSession) {
      // Set throttle cookie for 15 minutes
      response.cookies.set(throttleKey, "1", {
        path: "/",
        maxAge: 60 * 15, // 15 minutes
        sameSite: "lax",
      });

      // Silently log to Supabase in background
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        // Non-blocking fetch to Supabase REST
        fetch(`${supabaseUrl}/rest/v1/site_traffic`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            ip_address: ip,
            country_code: countryCode,
            page_route: pathname,
            session_id: sessionId,
          }),
        }).catch((err) => {
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

