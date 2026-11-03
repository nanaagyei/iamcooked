import { z } from "zod";
import { aiBaseFields, confidenceEnum } from "../schemas/shared";

export const digestSummaryPrompt = `Generate a weekly security digest intro for developers.

Rules:
- Use ONLY the incident titles and TLDRs provided in the input.
- Do not invent new incidents, CVEs, packages, or versions.
- Keep tone calm, practical, and non-alarmist.
- The intro should summarize the week's themes in 2-3 sentences.

Return only valid JSON.`;

export const DigestSummaryOutput = z.object({
  subject_line: z.string(),
  intro: z.string(),
  incident_highlights: z.array(
    z.object({
      title: z.string(),
      highlight: z.string(),
    }),
  ),
  confidence: confidenceEnum,
  unknowns: aiBaseFields.unknowns,
  assumptions: aiBaseFields.assumptions,
  sourceIds: aiBaseFields.sourceIds,
});

export type DigestSummaryOutput = z.infer<typeof DigestSummaryOutput>;
