import { prisma } from "@iamcooked/db";
import { getSessionUser } from "./auth-utils";

export async function canAccessScanReport(
  reportId: string,
  accessToken?: string | null,
): Promise<boolean> {
  const report = await prisma.scanReport.findUnique({
    where: { id: reportId },
    select: { userId: true, accessToken: true },
  });

  if (!report) return false;

  if (accessToken && report.accessToken === accessToken) {
    return true;
  }

  const user = await getSessionUser();
  if (user && report.userId && report.userId === user.id) {
    return true;
  }

  return false;
}
