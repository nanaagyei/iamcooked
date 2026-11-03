import { prisma } from "@iamcooked/db";
import {
  generateStructured,
  verifyClaims,
  remediationPrompt,
  RemediationOutput,
  isAiConfigured,
} from "@iamcooked/ai";
import { aiRemediationSchema } from "@iamcooked/validators";
import { apiError, apiSuccess, parseJsonBody } from "@/lib/api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { canAccessScanReport } from "@/lib/scan-auth";
import { recordAiGeneration } from "@/lib/ai-audit";
import { buildScanRemediationContext } from "@/lib/ai-context";

const REMEDIATION_RATE_LIMIT = 5;
const REMEDIATION_RATE_WINDOW = 60_000;

export const maxDuration = 60;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`ai-remediation:${ip}`, REMEDIATION_RATE_LIMIT, REMEDIATION_RATE_WINDOW))) {
    return apiError("RATE_LIMITED", "Too many remediation requests. Please try again later.", 429);
  }

  if (!isAiConfigured()) {
    return apiError("AI_NOT_CONFIGURED", "Set OPENAI_API_KEY or ANTHROPIC_API_KEY to generate action plans.", 503);
  }

  const parsed = await parseJsonBody(request, aiRemediationSchema);
  if (!parsed.ok) return parsed.response;

  const { scanReportId, scanAccessToken, regenerate } = parsed.data;

  const allowed = await canAccessScanReport(scanReportId, scanAccessToken);
  if (!allowed) {
    return apiError("FORBIDDEN", "Invalid scan report access.", 403);
  }

  if (!(await checkRateLimit(`ai-remediation:report:${scanReportId}`, REMEDIATION_RATE_LIMIT, REMEDIATION_RATE_WINDOW))) {
    return apiError("RATE_LIMITED", "Too many requests for this report.", 429);
  }

  const context = await buildScanRemediationContext(scanReportId);
  if (!context) {
    return apiError("NOT_FOUND", "Scan report not found.", 404);
  }

  const { report, findings, claimContext } = context;

  if (findings.length === 0) {
    return apiError("NO_FINDINGS", "No findings to remediate.", 400);
  }

  if (report.remediationPlan && !regenerate) {
    return apiSuccess({
      cached: true,
      generatedAt: report.remediationGeneratedAt,
      plan: report.remediationPlan,
    });
  }

  const userPrompt = `Scan report risk: ${report.riskScore}/100 (${report.riskLevel})\nEcosystem: ${report.ecosystem}\n\nFindings:\n${JSON.stringify(findings, null, 2)}`;

  try {
    const result = await generateStructured(remediationPrompt, userPrompt, RemediationOutput);
    const verified = verifyClaims(result.data, claimContext);

    await recordAiGeneration({
      type: "REMEDIATION",
      provider: result.provider,
      model: result.model,
      input: { scanReportId, findingCount: findings.length },
      output: verified.sanitizedOutput,
      valid: verified.valid,
      violations: verified.violations,
      scanReportId,
    });

    const updated = await prisma.scanReport.update({
      where: { id: scanReportId },
      data: {
        remediationPlan: verified.sanitizedOutput as object,
        remediationGeneratedAt: new Date(),
      },
    });

    return apiSuccess({
      cached: false,
      generatedAt: updated.remediationGeneratedAt,
      plan: verified.sanitizedOutput,
      violations: verified.violations,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("AI_NOT_CONFIGURED")) {
      return apiError("AI_NOT_CONFIGURED", "AI provider is not configured.", 503);
    }
    return apiError("AI_GENERATION_FAILED", "Failed to generate remediation plan.", 500);
  }
}
