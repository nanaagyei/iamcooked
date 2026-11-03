import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../rate-limit";

describe("rate-limit in-memory fallback", () => {
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
});
