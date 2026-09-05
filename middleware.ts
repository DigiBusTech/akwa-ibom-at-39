import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to submission and API routes
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/quiz/submit")
  ) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const key = `req_${ip}_${request.nextUrl.pathname}`;
    // Allow up to 30 requests per minute per IP for API endpoints
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
};
