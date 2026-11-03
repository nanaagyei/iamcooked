import { prisma } from "@iamcooked/db";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { apiError, apiSuccess, validationError } from "@/lib/api-error";

const claimSchema = z.object({
  scans: z
    .array(
      z.object({
        scanReportId: z.string().min(1),
        accessToken: z.string().min(1),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Sign in required.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  let claimed = 0;
  for (const scan of parsed.data.scans) {
    const report = await prisma.scanReport.findFirst({
      where: {
        id: scan.scanReportId,
        accessToken: scan.accessToken,
        userId: null,
      },
    });

    if (!report) continue;

    await prisma.scanReport.update({
      where: { id: report.id },
      data: { userId: session.user.id },
    });
    claimed++;
  }

  return apiSuccess({ claimed });
}
