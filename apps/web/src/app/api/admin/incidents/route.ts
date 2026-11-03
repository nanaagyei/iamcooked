import { prisma } from "@iamcooked/db";
import { adminIncidentCreateSchema } from "@iamcooked/validators";
import { requireAdmin } from "@/lib/auth-utils";
import { apiError, apiSuccess, parseJsonBody } from "@/lib/api-error";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError("FORBIDDEN", "Admin access required.", 403);
  }

  const incidents = await prisma.incident.findMany({
    where: { status: { in: ["DRAFT", "NEEDS_REVIEW", "PUBLISHED"] } },
    include: {
      sources: { include: { source: true } },
      packages: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return apiSuccess({ incidents });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError("FORBIDDEN", "Admin access required.", 403);
  }

  const parsed = await parseJsonBody(request, adminIncidentCreateSchema);
  if (!parsed.ok) return parsed.response;

  const incident = await prisma.incident.create({
    data: { ...parsed.data, status: "DRAFT" },
  });

  return apiSuccess(incident, 201);
}
