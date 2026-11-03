import { describe, it, expect } from "vitest";
import {
  ExtractionOutput,
  BeginnerTldrOutput,
  TechnicalSummaryOutput,
  RemediationOutput,
  SourceVerificationOutput,
  DigestSummaryOutput,
} from "../prompts";

describe("AI output schemas", () => {
  it("accepts valid extraction output", () => {
    const result = ExtractionOutput.safeParse({
      title: "Test incident",
      incident_type: "CVE",
      ecosystem: "NPM",
      severity: "HIGH",
      confidence: "Developing",
      affected_packages: [],
      attack_vector: "network",
      impact: "RCE",
      who_may_be_affected: ["npm users"],
      recommended_actions: ["Update package"],
      unknowns: [],
      assumptions: [],
      sourceIds: ["src-1"],
      claims: [],
      source_claims: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects extraction without confidence", () => {
    const result = ExtractionOutput.safeParse({
      title: "Test",
      incident_type: "CVE",
      ecosystem: "NPM",
      severity: "HIGH",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid beginner TLDR output", () => {
    const result = BeginnerTldrOutput.safeParse({
      beginner_tldr: "A package was compromised.",
      why_it_matters: "Secrets may leak.",
      who_may_be_affected: ["Users of pkg-x"],
      what_to_do_next: ["Rotate tokens"],
      terms_explained: [{ term: "CVE", explanation: "Public vulnerability ID" }],
      confidence: "Likely",
      unknowns: [],
      assumptions: [],
      sourceIds: [],
      claims: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid technical summary output", () => {
    const result = TechnicalSummaryOutput.safeParse({
      summary: "Technical details here.",
      cves: ["CVE-2024-1234"],
      affectedVersions: ["1.0.0"],
      patchedVersions: ["1.0.1"],
      attackVector: "network",
      exploitability: "high",
      indicatorsOfCompromise: [],
      confidence: "Confirmed",
      unknowns: [],
      assumptions: [],
      sourceIds: [],
      claims: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid remediation output", () => {
    const result = RemediationOutput.safeParse({
      risk_summary: "Two packages need updates.",
      priority: "high",
      actions: [
        {
          title: "Update lodash",
          description: "Patch available",
          command: "npm update lodash",
          urgency: "immediate",
          requires_rotation: false,
          requires_redeploy: true,
        },
      ],
      beginner_explanation: "Update these packages.",
      technical_notes: "See advisory.",
      confidence: "Confirmed",
      unknowns: [],
      assumptions: [],
      sourceIds: [],
      claims: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid source verification output", () => {
    const result = SourceVerificationOutput.safeParse({
      verified_claims: [{ claim: "Package was compromised" }],
      disputed_claims: [],
      unsupported_claims: [],
      summary: "Most claims verified.",
      recommended_actions: ["Review sources"],
      confidence: "Likely",
      unknowns: [],
      assumptions: [],
      sourceIds: ["src-1"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid digest summary output", () => {
    const result = DigestSummaryOutput.safeParse({
      subject_line: "Weekly brief",
      intro: "This week saw supply-chain activity.",
      incident_highlights: [{ title: "Incident A", highlight: "Package compromised" }],
      confidence: "Confirmed",
      unknowns: [],
      assumptions: [],
      sourceIds: [],
    });
    expect(result.success).toBe(true);
  });
});
