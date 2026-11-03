import { describe, it, expect } from "vitest";
import { calculateRiskScore, getRiskLevel } from "../scoring";

describe("risk scoring", () => {
  it("caps score at 100", () => {
    const score = calculateRiskScore({
      hasKnownVulnerability: true,
      severity: "CRITICAL",
      inCisaKev: true,
      isDirectDependency: true,
      isTransitiveDependency: false,
      isKnownMalicious: true,
      hasRecentSupplyChainIncident: true,
      hasPatchAvailable: false,
    });
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThan(70);
  });

  it("maps risk levels", () => {
    expect(getRiskLevel(95)).toBe("CRITICAL");
    expect(getRiskLevel(0)).toBe("NONE");
  });
});
