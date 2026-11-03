import { prisma } from "@iamcooked/db";
import { adminIncidentPatchSchema, cuidParamSchema } from "@iamcooked/validators";
import { requireAdmin } from "@/lib/auth-utils";
import {
  apiError,
  apiSuccess,
  isPrismaNotFound,
  parseJsonBody,
  validationError,
} from "@/lib/api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError("FORBIDDEN", "Admin access required.", 403);
  }

  const { id } = await params;
  const idParsed = cuidParamSchema.safeParse(id);
  if (!idParsed.success) {
    return validationError(idParsed.error);
  }

  const bodyParsed = await parseJsonBody(request, adminIncidentPatchSchema);
  if (!bodyParsed.ok) return bodyParsed.response;

  try {
    const incident = await prisma.incident.update({
      where: { id },
      data: bodyParsed.data,
    });
    return apiSuccess(incident);
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return apiError("NOT_FOUND", "Incident not found.", 404);
    }
    throw error;
  }
}
