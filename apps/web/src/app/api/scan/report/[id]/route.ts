import { prisma } from "@iamcooked/db";
import { cuidParamSchema } from "@iamcooked/validators";
import { apiError, apiSuccess } from "@/lib/api-error";
import { canAccessScanReport } from "@/lib/scan-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idParsed = cuidParamSchema.safeParse(id);
  if (!idParsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid report id.", 400);
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const allowed = await canAccessScanReport(id, token);
  if (!allowed) {
    return apiError("FORBIDDEN", "You do not have access to this scan report.", 403);
  }

  const report = await prisma.scanReport.findUnique({
    where: { id },
    include: {
      findings: {
        include: {
          incident: { select: { id: true, slug: true, title: true, severity: true } },
          advisory: { select: { id: true, externalId: true, summary: true, severity: true } },
        },
      },
    },
  });

  if (!report) {
    return apiError("NOT_FOUND", "Scan report not found.", 404);
  }

  const { accessToken: _accessToken, ...publicReport } = report;
  return apiSuccess(publicReport);
}
