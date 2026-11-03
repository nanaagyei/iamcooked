import { z } from "zod";

export const confidenceEnum = z.enum([
  "Confirmed",
  "Likely",
  "Developing",
  "Unverified",
  "Disputed",
]);

export const claimSchema = z.object({
  claim: z.string(),
  source_url: z.string().optional(),
  confidence: z.string().optional(),
});

export const aiBaseFields = {
  confidence: confidenceEnum,
  unknowns: z.array(z.string()),
  assumptions: z.array(z.string()).default([]),
  sourceIds: z.array(z.string()),
  claims: z.array(claimSchema).default([]),
};

export type ConfidenceLabel = z.infer<typeof confidenceEnum>;
