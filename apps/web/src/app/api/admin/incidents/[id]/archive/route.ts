import { prisma } from "@iamcooked/db";
import { cuidParamSchema } from "@iamcooked/validators";
import { requireAdmin } from "@/lib/auth-utils";
import { apiError, apiSuccess, isPrismaNotFound } from "@/lib/api-error";

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

  try {
    const updated = await prisma.incident.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    return apiSuccess(updated);
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return apiError("NOT_FOUND", "Incident not found.", 404);
    }
    throw error;
  }
}
