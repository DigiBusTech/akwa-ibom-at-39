/**
 * Lightweight, zero-dependency Rate Limiter with Sliding Window Counter.
 * Seamlessly checks in-memory window, and optionally falls back to Upstash Redis REST
 * if environment credentials (UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN) are configured.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up stale memory records every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 60_000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 300_000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier (e.g. IP address or action key).
 * @param identifier Unique key (e.g. `quiz_submit_${ip}`)
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds (default: 60,000ms = 1 min)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. If Upstash Redis credentials are provided, use Upstash REST API
  if (restUrl && restToken && !restUrl.includes("placeholder")) {
    try {
      const now = Date.now();
      const clearBefore = now - windowMs;
      const key = `ratelimit:${identifier}`;

      // Pipeline execution via Upstash REST: ZREMRANGEBYSCORE, ZADD, ZCARD, EXPIRE
      const pipelineRes = await fetch(`${restUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${restToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["ZREMRANGEBYSCORE", key, 0, clearBefore],
          ["ZADD", key, now, `${now}-${Math.random()}`],
          ["ZCARD", key],
          ["EXPIRE", key, Math.ceil(windowMs / 1000)],
        ]),
        cache: "no-store",
      });

      if (pipelineRes.ok) {
        const results = await pipelineRes.json();
        const count = results[2]?.result ?? 1;
        const remaining = Math.max(0, limit - count);
        return {
          success: count <= limit,
          limit,
          remaining,
          reset: Math.ceil((now + windowMs) / 1000),
        };
      }
    } catch (e) {
      console.warn("Upstash rate limit check encountered error, using in-memory fallback:", e);
    }
  }

  // 2. High-performance In-Memory Sliding Window
  const now = Date.now();
  let record = memoryStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(identifier, record);
  }

  // Purge expired timestamps outside the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = Math.ceil((oldestTimestamp + windowMs) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTime,
    };
  }

  // Record current request
  record.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: Math.ceil((now + windowMs) / 1000),
  };
}
