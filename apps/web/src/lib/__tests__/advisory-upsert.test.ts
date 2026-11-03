import { describe, it, expect } from "vitest";
import { isVersionAffected } from "../advisory-upsert";

describe("isVersionAffected", () => {
  it("matches installed version in affected range", () => {
    expect(isVersionAffected("1.2.3", [">=1.0.0 <2.0.0"], [])).toBe(true);
  });

  it("excludes patched versions", () => {
    expect(isVersionAffected("1.2.4", [">=1.0.0 <2.0.0"], ["1.2.4"])).toBe(false);
  });

  it("returns true when no version constraints exist", () => {
    expect(isVersionAffected(null, null, null)).toBe(true);
  });

  it("returns false when version is invalid and ranges exist", () => {
    expect(isVersionAffected("not-a-version", ["1.2.3"], [])).toBe(false);
  });
});
