import { cronDigestQuerySchema } from "@iamcooked/validators";
import { sendWeeklyDigest, sendCriticalAlerts } from "@iamcooked/sources";
import { apiError, apiSuccess, validationError } from "@/lib/api-error";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return apiError("UNAUTHORIZED", "Invalid cron secret.", 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = cronDigestQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    if (parsed.data.type === "critical") {
      const result = await sendCriticalAlerts();
      return apiSuccess({ success: true, ...result });
    }
    const result = await sendWeeklyDigest();
    return apiSuccess({ success: true, ...result });
  } catch (err) {
    console.error("Cron digest failed:", err);
    return apiError("DIGEST_FAILED", "Digest job failed.", 500);
  }
}
