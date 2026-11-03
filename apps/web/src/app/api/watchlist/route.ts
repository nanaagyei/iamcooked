import { prisma } from "@iamcooked/db";
import { cuidParamSchema, watchlistCreateSchema } from "@iamcooked/validators";
import { auth } from "@/lib/auth";
import { apiError, apiSuccess, parseJsonBody, validationError } from "@/lib/api-error";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Sign in required.", 401);
  }

  const items = await prisma.watchedPackage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const packageNames = items.map((i) => i.packageName);
  const relatedIncidents =
    packageNames.length > 0
      ? await prisma.incident.findMany({
          where: {
            status: "PUBLISHED",
            packages: { some: { packageName: { in: packageNames } } },
          },
          select: {
            id: true,
            slug: true,
            title: true,
            severity: true,
            packages: { select: { packageName: true } },
          },
          take: 20,
        })
      : [];

  return apiSuccess({ items, relatedIncidents });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Sign in required.", 401);
  }

  const parsed = await parseJsonBody(request, watchlistCreateSchema);
  if (!parsed.ok) return parsed.response;

  const { packageName, ecosystem = "NPM" } = parsed.data;

  const item = await prisma.watchedPackage.upsert({
    where: {
      userId_packageName_ecosystem: {
        userId: session.user.id,
        packageName,
        ecosystem,
      },
    },
    create: {
      userId: session.user.id,
      packageName,
      ecosystem,
    },
    update: {},
  });

  return apiSuccess({ item });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Sign in required.", 401);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const idParsed = cuidParamSchema.safeParse(id);
  if (!idParsed.success) {
    return validationError(idParsed.error);
  }

  await prisma.watchedPackage.deleteMany({
    where: { id: idParsed.data, userId: session.user.id },
  });

  return apiSuccess({ ok: true });
}
