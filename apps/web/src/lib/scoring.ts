export interface RiskFactors {
  hasKnownVulnerability: boolean;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  inCisaKev: boolean;
  isDirectDependency: boolean;
  isTransitiveDependency: boolean;
  isKnownMalicious: boolean;
  hasRecentSupplyChainIncident: boolean;
  hasPatchAvailable: boolean;
}

export function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;

  if (factors.hasKnownVulnerability) score += 20;
  if (factors.severity === "CRITICAL") score += 30;
  if (factors.severity === "HIGH") score += 20;
  if (factors.severity === "MEDIUM") score += 10;
  if (factors.inCisaKev) score += 30;
  if (factors.isDirectDependency) score += 15;
  if (factors.isTransitiveDependency) score += 5;
  if (factors.isKnownMalicious) score += 40;
  if (factors.hasRecentSupplyChainIncident) score += 25;
  if (factors.hasPatchAvailable) score -= 5;
  if (!factors.hasPatchAvailable) score += 10;

  return Math.min(score, 100);
}

export function getRiskLevel(
  score: number,
): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" {
  if (score >= 90) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  if (score >= 10) return "LOW";
  return "NONE";
}
