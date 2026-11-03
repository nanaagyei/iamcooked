import { prisma } from "@iamcooked/db";
import { apiError } from "@/lib/api-error";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return apiError("MISSING_TOKEN", "Unsubscribe token required.", 400);
  }

  const sub = await prisma.newsletterSubscription.findUnique({
    where: { unsubscribeToken: token },
  });

  if (!sub) {
    return apiError("NOT_FOUND", "Subscription not found.", 404);
  }

  await prisma.newsletterSubscription.delete({ where: { id: sub.id } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return Response.redirect(`${appUrl}/?unsubscribed=1`);
}
