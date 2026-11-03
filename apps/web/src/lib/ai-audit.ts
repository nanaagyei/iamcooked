import { createHash } from "crypto";
import { prisma } from "@iamcooked/db";
import type { AiGenerationType } from "@prisma/client";

export function hashAiInput(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export async function recordAiGeneration(params: {
  type: AiGenerationType;
  provider: string;
  model: string;
  input: unknown;
  output: unknown;
  valid: boolean;
  violations?: string[];
  incidentId?: string;
  scanReportId?: string;
  createdById?: string;
}) {
  return prisma.aiGeneration.create({
    data: {
      type: params.type,
      provider: params.provider,
      model: params.model,
      inputHash: hashAiInput(params.input),
      output: params.output as object,
      valid: params.valid,
      violations: params.violations?.length ? params.violations : undefined,
      incidentId: params.incidentId,
      scanReportId: params.scanReportId,
      createdById: params.createdById,
    },
  });
}

export function mapConfidenceToDb(
  label: string,
): "CONFIRMED" | "LIKELY" | "DEVELOPING" | "UNVERIFIED" | "DISPUTED" {
  switch (label.toLowerCase()) {
    case "confirmed":
      return "CONFIRMED";
    case "likely":
      return "LIKELY";
    case "developing":
      return "DEVELOPING";
    case "disputed":
      return "DISPUTED";
    default:
      return "UNVERIFIED";
  }
}
