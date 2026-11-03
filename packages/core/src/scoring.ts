export interface RiskFactors {
  hasKnownVulnerability: boolean;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  inCisaKev: boolean;
  isDirectDependency: boolean;
  isTransitiveDependency: boolean;
  isKnownMalicious: boolean;
  hasRecentSupplyChainIncident: boolean;
  hasPatchAvailable: boolean;
  /** Only used during development (devDependencies / dev groups). */
  isDevOnly?: boolean;
}

export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";

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
  // Dev-only deps don't ship to users — but malware runs at install time, so it's never discounted.
  if (factors.isDevOnly && !factors.isKnownMalicious) score -= 15;

  return Math.max(0, Math.min(score, 100));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 90) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  if (score >= 10) return "LOW";
  return "NONE";
}

/** Aggregate a project score from individual finding scores (mean of the worst 10). */
export function aggregateRiskScore(scores: number[]): number {
  const top = [...scores].sort((a, b) => b - a).slice(0, 10);
  if (top.length === 0) return 0;
  return Math.min(100, Math.round(top.reduce((a, b) => a + b, 0) / top.length));
}

export type CookedTone = "safe" | "low" | "medium" | "high" | "critical";

export interface CookedVerdict {
  label: string;
  blurb: string;
  tone: CookedTone;
}

/**
 * Maps a 0-100 risk score to a playful "am I cooked?" verdict.
 * The real score still drives everything underneath.
 */
export function getCookedVerdict(score: number): CookedVerdict {
  if (score >= 80) {
    return {
      label: "Burnt to a crisp",
      blurb: "Reachable critical issues in your stack. Fix these before anything else.",
      tone: "critical",
    };
  }
  if (score >= 55) {
    return {
      label: "Well done",
      blurb: "Some serious findings are live. Worth a focused afternoon of patching.",
      tone: "high",
    };
  }
  if (score >= 30) {
    return {
      label: "Getting toasty",
      blurb: "A few things to clean up, none of them on fire. You've got time.",
      tone: "medium",
    };
  }
  if (score > 0) {
    return {
      label: "Lightly toasted",
      blurb: "Minor stuff only. Knock it out whenever you touch the deps next.",
      tone: "low",
    };
  }
  return {
    label: "Not cooked",
    blurb: "Nothing risky in what we can see. Keep shipping.",
    tone: "safe",
  };
}
