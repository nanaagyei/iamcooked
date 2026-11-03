import { z } from "zod";
import { aiBaseFields, confidenceEnum } from "../schemas/shared";

export const remediationPrompt = `Generate a user-specific remediation plan based on scan findings.

Input:
- project dependencies
- affected package
- installed version
- affected version range
- patched version
- advisory data
- incident data
- confidence
- sources

Rules:
- Do not recommend token rotation unless the incident suggests possible credential exposure or malicious install behavior.
- Do not recommend deleting lockfiles unless necessary.
- Provide commands only when safe and broadly applicable.
- Label manual review steps clearly.

Return only valid JSON.`;

export const RemediationOutput = z.object({
  risk_summary: z.string(),
  priority: z.string(),
  actions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      command: z.string(),
      urgency: z.string(),
      requires_rotation: z.boolean(),
      requires_redeploy: z.boolean(),
    }),
  ),
  beginner_explanation: z.string(),
  technical_notes: z.string(),
  confidence: confidenceEnum,
  unknowns: aiBaseFields.unknowns,
  assumptions: aiBaseFields.assumptions,
  sourceIds: aiBaseFields.sourceIds,
  claims: aiBaseFields.claims,
});

export type RemediationOutput = z.infer<typeof RemediationOutput>;
