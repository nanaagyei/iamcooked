import { z } from "zod";
import { aiBaseFields, confidenceEnum } from "../schemas/shared";

export const extractionPrompt = `You are a security intelligence extraction assistant. Your job is to convert source-backed security information into structured incident data.

You must not invent facts.

If information is missing, use null or add it to unknowns.

Input:
- source title
- source URL
- source type
- published date
- source excerpt/body
- existing advisory metadata if available

Rules:
- Do not infer affected versions unless the source states them.
- Do not infer exploitability unless the source states it.
- Do not call something actively exploited unless confirmed by a trusted source.
- Prefer DEVELOPING when the incident is early.
- Prefer UNVERIFIED when the only source is social/community content.

Return only valid JSON.`;

export const ExtractionOutput = z.object({
  title: z.string(),
  incident_type: z.string(),
  ecosystem: z.string(),
  severity: z.string(),
  confidence: confidenceEnum,
  affected_packages: z.array(
    z.object({
      name: z.string(),
      ecosystem: z.string(),
      affected_versions: z.array(z.string()),
      patched_versions: z.array(z.string()),
      evidence: z.string(),
    }),
  ),
  attack_vector: z.string(),
  impact: z.string(),
  who_may_be_affected: z.array(z.string()),
  recommended_actions: z.array(z.string()),
  unknowns: aiBaseFields.unknowns,
  assumptions: aiBaseFields.assumptions,
  sourceIds: aiBaseFields.sourceIds,
  claims: aiBaseFields.claims,
  source_claims: z.array(
    z.object({
      claim: z.string(),
      source_url: z.string(),
      confidence: z.string(),
    }),
  ),
});

export type ExtractionOutput = z.infer<typeof ExtractionOutput>;
