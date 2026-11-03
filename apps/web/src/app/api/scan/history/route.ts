import { prisma } from "@iamcooked/db";
import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-error";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Sign in required.", 401);
  }

  const scans = await prisma.scanReport.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { findings: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return apiSuccess({
    scans: scans.map((s) => ({
      id: s.id,
      accessToken: s.accessToken,
      uploadFileName: s.uploadFileName,
      ecosystem: s.ecosystem,
      riskScore: s.riskScore,
      riskLevel: s.riskLevel,
      findingCount: s._count.findings,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}
