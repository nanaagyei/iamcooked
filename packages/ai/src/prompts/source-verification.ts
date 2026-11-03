import { z } from "zod";
import { aiBaseFields, claimSchema, confidenceEnum } from "../schemas/shared";

export const sourceVerificationPrompt = `You verify security incident claims against provided source excerpts.

Rules:
- Mark claims as verified only when directly supported by the source text.
- Mark claims as disputed when sources contradict each other.
- Mark claims as unsupported when they cannot be found in any source.
- Do not invent new claims.
- Prefer Unverified when evidence is thin.

Return only valid JSON.`;

export const SourceVerificationOutput = z.object({
  verified_claims: z.array(claimSchema),
  disputed_claims: z.array(claimSchema),
  unsupported_claims: z.array(claimSchema),
  summary: z.string(),
  recommended_actions: z.array(z.string()),
  confidence: confidenceEnum,
  unknowns: aiBaseFields.unknowns,
  assumptions: aiBaseFields.assumptions,
  sourceIds: aiBaseFields.sourceIds,
});

export type SourceVerificationOutput = z.infer<typeof SourceVerificationOutput>;
