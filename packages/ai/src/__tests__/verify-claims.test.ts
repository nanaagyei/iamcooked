import { describe, it, expect } from "vitest";
import { verifyClaims } from "../verify-claims";

describe("verifyClaims", () => {
  it("passes when CVE is in context", () => {
    const result = verifyClaims(
      {
        summary: "Affected by CVE-2024-1234",
        confidence: "Confirmed",
      },
      {
        cveIds: ["CVE-2024-1234"],
        sourceExcerpts: ["CVE-2024-1234 affects lodash"],
      },
    );
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("flags unknown CVE and downgrades confidence", () => {
    const result = verifyClaims(
      {
        summary: "Also see CVE-2099-9999",
        confidence: "Confirmed",
      },
      {
        cveIds: ["CVE-2024-1234"],
        sourceExcerpts: ["CVE-2024-1234 only"],
      },
    );
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.includes("CVE-2099-9999"))).toBe(true);
    expect(result.sanitizedOutput.confidence).toBe("Unverified");
  });

  it("flags unknown package names", () => {
    const result = verifyClaims(
      {
        summary: "The evil-package was malicious",
        confidence: "Likely",
      },
      {
        packageNames: ["lodash"],
        sourceExcerpts: ["lodash vulnerability"],
      },
    );
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.includes("evil-package"))).toBe(true);
  });
});
