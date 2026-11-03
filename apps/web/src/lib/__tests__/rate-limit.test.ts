import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp } from "../rate-limit";

describe("rate-limit in-memory fallback", () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAllowMemory = process.env.RATE_LIMIT_ALLOW_MEMORY;
  const originalVercel = process.env.VERCEL;
  const originalTrustProxy = process.env.TRUST_PROXY;

  afterEach(() => {
    process.env.VERCEL_ENV = originalVercelEnv;
    process.env.NODE_ENV = originalNodeEnv;
    process.env.RATE_LIMIT_ALLOW_MEMORY = originalAllowMemory;
    process.env.VERCEL = originalVercel;
    process.env.TRUST_PROXY = originalTrustProxy;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("allows requests under the limit", async () => {
    const key = `test:${Date.now()}`;
    expect(await checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(await checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(await checkRateLimit(key, 3, 60_000)).toBe(true);
  });

  it("blocks requests over the limit", async () => {
    const key = `test-block:${Date.now()}`;
    expect(await checkRateLimit(key, 2, 60_000)).toBe(true);
    expect(await checkRateLimit(key, 2, 60_000)).toBe(true);
    expect(await checkRateLimit(key, 2, 60_000)).toBe(false);
  });

  it("fails closed in production without Upstash", async () => {
    process.env.VERCEL_ENV = "production";
    delete process.env.RATE_LIMIT_ALLOW_MEMORY;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    expect(await checkRateLimit(`prod:${Date.now()}`, 10, 60_000)).toBe(false);
  });

  it("ignores forwarded IP headers without a trusted proxy", () => {
    delete process.env.VERCEL;
    delete process.env.TRUST_PROXY;
    const request = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    expect(getClientIp(request)).toBe("unknown");
  });

  it("trusts forwarded IP headers on Vercel", () => {
    process.env.VERCEL = "1";
    const request = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("1.2.3.4");
  });
});
