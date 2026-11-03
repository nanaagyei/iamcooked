import { prisma } from "@iamcooked/db";
import { newsletterSubscribeSchema } from "@iamcooked/validators";
import { auth } from "@/lib/auth";
import { apiError, apiSuccess, parseJsonBody } from "@/lib/api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60_000;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`newsletter:${ip}`, RATE_LIMIT, RATE_LIMIT_WINDOW))) {
    return apiError("RATE_LIMITED", "Too many requests. Please try again later.", 429);
  }

  const parsed = await parseJsonBody(request, newsletterSubscribeSchema);
  if (!parsed.ok) return parsed.response;

  const { email, interests, frequency } = parsed.data;
  const session = await auth();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const subscription = await prisma.newsletterSubscription.upsert({
    where: { email },
    create: {
      email,
      interests,
      frequency,
      userId: session?.user?.id ?? null,
    },
    update: { interests, frequency, userId: session?.user?.id ?? undefined },
  });

  const resendKey = process.env.RESEND_API_KEY;
  let emailSent = false;

  if (resendKey && resendKey !== "re-placeholder") {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "iamcooked <newsletter@iamcooked.dev>",
        to: [email],
        subject: "Welcome to iamcooked — you're subscribed",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px;">Welcome to iamcooked</h1>
            <p style="font-size: 16px; color: #5C646B; line-height: 1.6; margin: 0 0 24px;">
              You're now subscribed to ${(frequency ?? "WEEKLY").toLowerCase()} security briefs.
            </p>
            <p style="font-size: 14px; color: #5C646B; margin: 0;">
              Scan your project at <a href="${appUrl}/scan">${appUrl}/scan</a>
            </p>
            <hr style="border: none; border-top: 1px solid #26303A; margin: 24px 0;" />
            <p style="font-size: 12px; color: #A8B0B8; margin: 0;">
              <a href="${appUrl}/api/newsletter/unsubscribe?token=${subscription.unsubscribeToken}">Unsubscribe</a>
            </p>
          </div>
        `,
      });
      emailSent = true;
    } catch (err) {
      console.error("Resend send failed:", err);
    }
  }

  return apiSuccess({
    success: true,
    message: emailSent
      ? "Subscribed! Check your email for a welcome message."
      : "Subscribed! You'll receive security briefs at this address.",
    interests,
    frequency,
  });
}
