import { prisma } from "@iamcooked/db";
import { cuidParamSchema } from "@iamcooked/validators";
import { requireAdmin } from "@/lib/auth-utils";
import { apiError, apiSuccess } from "@/lib/api-error";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError("FORBIDDEN", "Admin access required.", 403);
  }

  const { id } = await params;
  const idParsed = cuidParamSchema.safeParse(id);
  if (!idParsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid incident id.", 400);
  }

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: { sources: true },
  });

  if (!incident) {
    return apiError("NOT_FOUND", "Incident not found.", 404);
  }

  if (incident.sources.length < 2) {
    return apiError(
      "INSUFFICIENT_SOURCES",
      "Incident needs at least 2 sources before publishing.",
      400,
    );
  }

  if (
    (incident.severity === "CRITICAL" || incident.severity === "HIGH") &&
    incident.confidence === "UNVERIFIED"
  ) {
    return apiError(
      "UNVERIFIED_CRITICAL",
      "Critical or high severity incidents cannot be published with UNVERIFIED confidence.",
      400,
    );
  }

  const updated = await prisma.incident.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  return apiSuccess(updated);
}
