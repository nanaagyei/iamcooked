import { z } from "zod";
import { aiBaseFields, confidenceEnum } from "../schemas/shared";

export const beginnerTldrPrompt = `Generate a plain-English explanation of a security incident for AI-assisted builders and non-security experts.

Tone:
- calm
- direct
- helpful
- non-alarmist
- practical

Must Explain:
- what happened
- why it matters
- who may be affected
- what to do next

Avoid:
- fearmongering
- unexplained acronyms
- vague advice
- overconfidence
- unsupported claims

Return only valid JSON.`;

export const BeginnerTldrOutput = z.object({
  beginner_tldr: z.string(),
  why_it_matters: z.string(),
  who_may_be_affected: z.array(z.string()),
  what_to_do_next: z.array(z.string()),
  terms_explained: z.array(
    z.object({
      term: z.string(),
      explanation: z.string(),
    }),
  ),
  confidence: confidenceEnum,
  unknowns: aiBaseFields.unknowns,
  assumptions: aiBaseFields.assumptions,
  sourceIds: aiBaseFields.sourceIds,
  claims: aiBaseFields.claims,
});

export type BeginnerTldrOutput = z.infer<typeof BeginnerTldrOutput>;
