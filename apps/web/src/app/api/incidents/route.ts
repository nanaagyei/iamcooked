import { incidentsQuerySchema } from "@iamcooked/validators";
import { getPublishedIncidents } from "@/lib/db/queries";
import { apiSuccess, validationError } from "@/lib/api-error";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = incidentsQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { page, limit, q, severity, ecosystem, type, package: pkg } = parsed.data;
  const offset = (page - 1) * limit;

  const { incidents, total } = await getPublishedIncidents({
    severity,
    ecosystem,
    incidentType: type,
    search: q ?? pkg,
    limit,
    offset,
  });

  return apiSuccess({
    incidents,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
