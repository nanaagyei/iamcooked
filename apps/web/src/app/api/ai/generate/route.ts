import {
  generateStructured,
  verifyClaims,
  extractionPrompt,
  ExtractionOutput,
  beginnerTldrPrompt,
  BeginnerTldrOutput,
  technicalSummaryPrompt,
  TechnicalSummaryOutput,
  sourceVerificationPrompt,
  SourceVerificationOutput,
  digestSummaryPrompt,
  DigestSummaryOutput,
  isAiConfigured,
} from "@iamcooked/ai";
import { aiGenerateSchema } from "@iamcooked/validators";
import { requireAdmin } from "@/lib/auth-utils";
import { apiError, apiSuccess, parseJsonBody } from "@/lib/api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recordAiGeneration, mapConfidenceToDb } from "@/lib/ai-audit";
import { buildIncidentClaimContext } from "@/lib/ai-context";

const AI_RATE_LIMIT = 30;
const AI_RATE_WINDOW = 60_000;

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError("FORBIDDEN", "Admin access required.", 403);
  }

  const ip = getClientIp(request);
  if (!(await checkRateLimit(`ai-generate:${ip}`, AI_RATE_LIMIT, AI_RATE_WINDOW))) {
    return apiError("RATE_LIMITED", "Too many AI generation requests.", 429);
  }

  if (!isAiConfigured()) {
    return apiError("AI_NOT_CONFIGURED", "No AI provider API keys are configured.", 500);
  }

  const parsed = await parseJsonBody(request, aiGenerateSchema);
  if (!parsed.ok) return parsed.response;

  const { type } = parsed.data;

  try {
    if (type === "incident-extraction") {
      const { input, incidentId } = parsed.data;
      const userPrompt = `Title: ${input.title}\nURL: ${input.url}\nSource type: ${input.sourceType}\n\nExcerpt:\n${input.excerpt}`;
      const result = await generateStructured(extractionPrompt, userPrompt, ExtractionOutput);
      const claimContext = incidentId
        ? await buildIncidentClaimContext(incidentId)
        : { sourceExcerpts: [input.excerpt], packageNames: [] as string[] };
      const verified = verifyClaims(result.data, claimContext);

      await recordAiGeneration({
        type: "INCIDENT_EXTRACTION",
        provider: result.provider,
        model: result.model,
        input: parsed.data,
        output: verified.sanitizedOutput,
        valid: verified.valid,
        violations: verified.violations,
        incidentId,
        createdById: admin.id,
      });

      return apiSuccess({
        ...verified.sanitizedOutput,
        violations: verified.violations,
        confidenceDb: mapConfidenceToDb(String(verified.sanitizedOutput.confidence)),
      });
    }

    if (type === "beginner-tldr") {
      const { input, incidentId } = parsed.data;
      const userPrompt = `Title: ${input.title}\nSeverity: ${input.severity}\nTechnical Details: ${input.technicalSummary}\nAffected Packages: ${input.packages?.join(", ") ?? "Unknown"}`;
      const result = await generateStructured(beginnerTldrPrompt, userPrompt, BeginnerTldrOutput);
      const claimContext = incidentId ? await buildIncidentClaimContext(incidentId) : {};
      const verified = verifyClaims(result.data, claimContext);

      await recordAiGeneration({
        type: "BEGINNER_TLDR",
        provider: result.provider,
        model: result.model,
        input: parsed.data,
        output: verified.sanitizedOutput,
        valid: verified.valid,
        violations: verified.violations,
        incidentId,
        createdById: admin.id,
      });

      return apiSuccess({
        ...verified.sanitizedOutput,
        beginnerTldr: verified.sanitizedOutput.beginner_tldr,
        violations: verified.violations,
      });
    }

    if (type === "technical-summary") {
      const { input, incidentId } = parsed.data;
      const userPrompt = `Title: ${input.title}\nSeverity: ${input.severity}\nTechnical Details: ${input.technicalSummary ?? "N/A"}\nAffected Packages: ${input.packages?.join(", ") ?? "Unknown"}\n\nSources:\n${(input.sourceExcerpts ?? []).join("\n---\n")}`;
      const result = await generateStructured(technicalSummaryPrompt, userPrompt, TechnicalSummaryOutput);
      const claimContext = incidentId
        ? await buildIncidentClaimContext(incidentId)
        : {
            sourceExcerpts: input.sourceExcerpts ?? [],
            packageNames: input.packages ?? [],
          };
      const verified = verifyClaims(result.data, claimContext);

      await recordAiGeneration({
        type: "TECHNICAL_SUMMARY",
        provider: result.provider,
        model: result.model,
        input: parsed.data,
        output: verified.sanitizedOutput,
        valid: verified.valid,
        violations: verified.violations,
        incidentId,
        createdById: admin.id,
      });

      return apiSuccess({
        ...verified.sanitizedOutput,
        technicalSummary: verified.sanitizedOutput.summary,
        violations: verified.violations,
      });
    }

    if (type === "source-verification") {
      const { input, incidentId } = parsed.data;
      const userPrompt = `Incident: ${input.title}\n\nClaims to verify:\n${input.claims.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nSource excerpts:\n${input.sourceExcerpts.join("\n---\n")}`;
      const result = await generateStructured(
        sourceVerificationPrompt,
        userPrompt,
        SourceVerificationOutput,
      );
      const claimContext = await buildIncidentClaimContext(incidentId);
      const verified = verifyClaims(result.data, claimContext);

      await recordAiGeneration({
        type: "SOURCE_VERIFICATION",
        provider: result.provider,
        model: result.model,
        input: parsed.data,
        output: verified.sanitizedOutput,
        valid: verified.valid,
        violations: verified.violations,
        incidentId,
        createdById: admin.id,
      });

      return apiSuccess({
        ...verified.sanitizedOutput,
        violations: verified.violations,
      });
    }

    const { input } = parsed.data;
    const userPrompt = `Weekly incidents:\n${input.incidents.map((i) => `- ${i.title}: ${i.beginnerTldr}`).join("\n")}`;
    const result = await generateStructured(digestSummaryPrompt, userPrompt, DigestSummaryOutput);

    await recordAiGeneration({
      type: "DIGEST_SUMMARY",
      provider: result.provider,
      model: result.model,
      input: parsed.data,
      output: result.data,
      valid: true,
      createdById: admin.id,
    });

    return apiSuccess(result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("AI_NOT_CONFIGURED") || message.includes("API key")) {
      return apiError("AI_NOT_CONFIGURED", "AI provider is not configured.", 500);
    }

    if (message.includes("parse") || message.includes("schema")) {
      return apiError("AI_PARSE_ERROR", "Failed to parse AI response.", 500);
    }

    return apiError("AI_GENERATION_FAILED", "AI generation failed.", 500);
  }
}

export async function GET() {
  return apiError("METHOD_NOT_ALLOWED", "Use POST.", 405);
}
