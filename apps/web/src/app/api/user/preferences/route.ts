import { prisma } from "@iamcooked/db";
import { userPreferencesPatchSchema } from "@iamcooked/validators";
import { requireAuth } from "@/lib/auth-utils";
import { apiError, apiSuccess, parseJsonBody } from "@/lib/api-error";

export async function GET() {
  const user = await requireAuth();
  if (!user?.id) {
    return apiError("UNAUTHORIZED", "Sign in required.", 401);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, subscriptions: true },
  });

  const sub = dbUser?.subscriptions[0];
  return apiSuccess({
    email: dbUser?.email,
    frequency: sub?.frequency ?? "WEEKLY",
    interests: (sub?.interests as string[]) ?? ["npm"],
  });
}

export async function PATCH(request: Request) {
  const user = await requireAuth();
  if (!user?.id) {
    return apiError("UNAUTHORIZED", "Sign in required.", 401);
  }

  const parsed = await parseJsonBody(request, userPreferencesPatchSchema);
  if (!parsed.ok) return parsed.response;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true },
  });

  if (!dbUser?.email) {
    return apiError("NOT_FOUND", "User not found.", 404);
  }

  const sub = await prisma.newsletterSubscription.upsert({
    where: { email: dbUser.email },
    create: {
      email: dbUser.email,
      userId: user.id,
      frequency: parsed.data.frequency ?? "WEEKLY",
      interests: parsed.data.interests ?? ["npm"],
    },
    update: {
      frequency: parsed.data.frequency,
      interests: parsed.data.interests,
    },
  });

  return apiSuccess(sub);
}
