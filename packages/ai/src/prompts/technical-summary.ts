import { z } from "zod";
import { aiBaseFields, confidenceEnum } from "../schemas/shared";

export const technicalSummaryPrompt = `Generate a technical summary of a security incident. Include package names, version ranges, attack vector, exploitability, indicators of compromise if available, remediation steps, and references.

Rules:
- Never invent affected versions. Only include versions from the source.
- Never invent package names.
- Do not claim a user is affected without dependency evidence.
- Prefer DEVELOPING when information is still emerging.
- Prefer UNVERIFIED when the only source is social/community content.

Return only valid JSON.`;

export const TechnicalSummaryOutput = z.object({
  summary: z.string(),
  cves: z.array(z.string()),
  affectedVersions: z.array(z.string()),
  patchedVersions: z.array(z.string()),
  attackVector: z.string(),
  exploitability: z.string(),
  indicatorsOfCompromise: z.array(z.string()),
  confidence: confidenceEnum,
  unknowns: aiBaseFields.unknowns,
  assumptions: aiBaseFields.assumptions,
  sourceIds: aiBaseFields.sourceIds,
  claims: aiBaseFields.claims,
});

export type TechnicalSummaryOutput = z.infer<typeof TechnicalSummaryOutput>;
