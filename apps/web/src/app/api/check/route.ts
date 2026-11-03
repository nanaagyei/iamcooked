import { OsvClient, analyzeDependencies } from "@iamcooked/core";
import { isInKev } from "@iamcooked/sources";
import { packageCheckSchema } from "@iamcooked/validators";
import { apiError, apiSuccess, parseJsonBody } from "@/lib/api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const osv = new OsvClient({ baseUrl: process.env["OSV_API_BASE_URL"], userAgent: "iamcooked-web" });

/**
 * Stateless package check used by the MCP checker and Tool Watch version lookups.
 * Accepts only names + versions (never config files), stores nothing.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`check:${ip}`, 30, 60_000))) {
    return apiError("RATE_LIMITED", "Too many checks. Please wait a minute and try again.", 429);
  }

  const parsed = await parseJsonBody(request, packageCheckSchema, { maxBytes: 64 * 1024 });
  if (!parsed.ok) return parsed.response;

  try {
    const result = await analyzeDependencies(
      parsed.data.packages.map((p) => ({
        ecosystem: p.ecosystem,
        name: p.name,
        version: p.version,
        direct: p.direct ?? true,
        sourceFile: "check",
        dependencyPath: p.via ? [p.via] : undefined,
      })),
      {
        osv,
        isKev: async (cve) => {
          try {
            return await isInKev(cve);
          } catch {
            return false;
          }
        },
      },
    );
    return apiSuccess({
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      verdict: result.verdict,
      counts: result.counts,
      findings: result.findings.map((f) => ({
        id: f.id,
        cve: f.cve,
        kind: f.kind,
        ecosystem: f.ecosystem,
        packageName: f.packageName,
        installedVersion: f.installedVersion,
        severity: f.severity,
        cvssScore: f.cvssScore,
        summary: f.summary,
        fixedVersion: f.fixedVersion,
        fixCommand: f.fixCommand,
        fixInstruction: f.fixInstruction,
        inCisaKev: f.inCisaKev,
        published: f.published,
        url: f.url,
        via: f.via,
      })),
    });
  } catch (err) {
    console.error("Package check failed:", err);
    return apiError("CHECK_FAILED", "Could not reach the vulnerability database. Please try again.", 502);
  }
}
