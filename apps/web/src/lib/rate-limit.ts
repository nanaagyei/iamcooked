import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const limiterCache = new Map<string, Ratelimit>();
let redis: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  if (!redis) {
    redis = new Redis({ url, token });
  }
  return redis;
}

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    limiter = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "iamcooked",
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

function checkInMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview")
  );
}

/**
 * Client IP for rate limiting.
 * Only trust forwarded headers behind Vercel / an explicitly trusted proxy.
 */
export function getClientIp(request: Request): string {
  const trustProxy = Boolean(process.env.VERCEL) || process.env.TRUST_PROXY === "1";
  if (!trustProxy) {
    return "unknown";
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

/**
 * Returns true when the request is allowed.
 * In production, fails closed unless Upstash Redis is configured
 * (in-memory maps are per-instance and ineffective on serverless).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const upstashLimiter = getUpstashLimiter(limit, windowMs);
  if (upstashLimiter) {
    const result = await upstashLimiter.limit(key);
    return result.success;
  }

  if (isProductionRuntime() && process.env.RATE_LIMIT_ALLOW_MEMORY !== "1") {
    console.error(
      "[rate-limit] Upstash Redis is required in production; denying request.",
    );
    return false;
  }

  return checkInMemoryRateLimit(key, limit, windowMs);
}
