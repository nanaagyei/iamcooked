import { slugParamSchema } from "@iamcooked/validators";
import { getIncidentBySlug } from "@/lib/db/queries";
import { apiError, apiSuccess } from "@/lib/api-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const slugParsed = slugParamSchema.safeParse(slug);
  if (!slugParsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid incident slug.", 400);
  }

  const incident = await getIncidentBySlug(slugParsed.data);

  if (!incident) {
    return apiError("NOT_FOUND", "Incident not found.", 404);
  }

  return apiSuccess(incident);
}
