import { prisma } from "@iamcooked/db";
import { sanitizeStoredText } from "@iamcooked/validators";
import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { processLockfileScan } from "@/lib/scan-processor";
import { createOpaqueToken } from "@/lib/tokens";
import { parseLockfile, detectLockfileType } from "@iamcooked/scanner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SCAN_RATE_LIMIT = 10;
const SCAN_RATE_WINDOW = 60_000;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`scan:${ip}`, SCAN_RATE_LIMIT, SCAN_RATE_WINDOW))) {
    return apiError(
      "RATE_LIMITED",
      "Too many scan requests. Please wait a minute and try again.",
      429,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError("INVALID_FORM_DATA", "Request must be multipart/form-data.", 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return apiError("MISSING_FILE", "No file provided. Upload a lockfile.", 400);
  }

  if (file.size === 0) {
    return apiError("EMPTY_FILE", "The uploaded file is empty.", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return apiError(
      "FILE_TOO_LARGE",
      `File size exceeds the 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
      400,
    );
  }

  const lockfileType = detectLockfileType(file.name);
  if (!lockfileType) {
    return apiError(
      "UNSUPPORTED_FORMAT",
      `Unsupported file "${file.name}". Upload package-lock.json, pnpm-lock.yaml, or yarn.lock.`,
      400,
    );
  }

  let content: string;
  try {
    content = await file.text();
  } catch {
    return apiError("READ_ERROR", "Failed to read the uploaded file.", 500);
  }

  const parseResult = parseLockfile(file.name, content);

  if ("message" in parseResult) {
    const errorCodes: Record<string, number> = {
      UNSUPPORTED_EXTENSION: 400,
      PARSE_ERROR: 400,
      EMPTY_FILE: 400,
      FILE_TOO_LARGE: 400,
    };
    return apiError(
      parseResult.type,
      parseResult.message,
      errorCodes[parseResult.type] ?? 400,
    );
  }

  const deps = parseResult.dependencies;
  const ecosystem = deps[0]?.ecosystem ?? "NPM";

  let processed;
  try {
    processed = await processLockfileScan(deps);
  } catch (err) {
    console.error("Scan processing failed:", err);
    return apiError(
      "SCAN_FAILED",
      "Failed to analyze dependencies. Please try again later.",
      500,
    );
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const scanReport = await prisma.scanReport.create({
    data: {
      userId,
      accessToken: createOpaqueToken(),
      uploadFileName: file.name,
      ecosystem: ecosystem as "NPM",
      riskScore: processed.riskScore,
      riskLevel: processed.riskLevel,
      summary: `${processed.dependencyCount} dependencies scanned. Found ${processed.findings.length} findings.`,
      findings: {
        create: processed.findings.map((f) => ({
          packageName: f.packageName,
          installedVersion: f.installedVersion,
          findingType: f.findingType,
          severity: f.severity,
          confidence: f.confidence,
          explanation: sanitizeStoredText(f.explanation),
          incidentId: f.incidentId,
          advisoryId: f.advisoryId,
          actionItems: f.actionItems as object | undefined,
        })),
      },
    },
  });

  return apiSuccess({
    scanReportId: scanReport.id,
    accessToken: scanReport.accessToken,
    riskLevel: scanReport.riskLevel,
    riskScore: scanReport.riskScore,
    findingCount: processed.findings.length,
    ecosystem,
    dependencyCount: processed.dependencyCount,
    parsedAt: scanReport.createdAt.toISOString(),
    fileName: file.name,
  });
}
