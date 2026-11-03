import { isAiConfigured, resolveProvider } from "@iamcooked/ai";
import { requireAdmin } from "@/lib/auth-utils";
import { apiError, apiSuccess } from "@/lib/api-error";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError("FORBIDDEN", "Admin access required.", 403);
  }

  const provider = resolveProvider();

  return apiSuccess({
    configured: isAiConfigured(),
    providers: {
      openai: provider === "openai",
      anthropic: provider === "anthropic",
    },
  });
}
