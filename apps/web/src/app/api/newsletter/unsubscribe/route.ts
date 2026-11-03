import { prisma } from "@iamcooked/db";
import { apiError, apiSuccess } from "@/lib/api-error";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * GET shows a confirmation page; the destructive action only runs on POST
 * to avoid CSRF via email-preview / embedded GET requests.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return apiError("MISSING_TOKEN", "Unsubscribe token required.", 400);
  }

  const sub = await prisma.newsletterSubscription.findUnique({
    where: { unsubscribeToken: token },
    select: { id: true, email: true },
  });

  if (!sub) {
    return apiError("NOT_FOUND", "Subscription not found.", 404);
  }

  const safeToken = escapeAttr(token);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unsubscribe — iamcooked</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 28rem; margin: 4rem auto; padding: 0 1rem; color: #0f172a; }
    button { background: #0f172a; color: #fff; border: 0; border-radius: 0.5rem; padding: 0.75rem 1.25rem; font-size: 0.95rem; cursor: pointer; }
    p { line-height: 1.5; color: #475569; }
  </style>
</head>
<body>
  <h1>Unsubscribe</h1>
  <p>Confirm you want to stop receiving iamcooked security digests.</p>
  <form method="POST" action="/api/newsletter/unsubscribe">
    <input type="hidden" name="token" value="${safeToken}" />
    <button type="submit">Confirm unsubscribe</button>
  </form>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  let token: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as { token?: unknown };
      token = typeof body.token === "string" ? body.token : null;
    } catch {
      return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
    }
  } else {
    try {
      const form = await request.formData();
      const value = form.get("token");
      token = typeof value === "string" ? value : null;
    } catch {
      const { searchParams } = new URL(request.url);
      token = searchParams.get("token");
    }
  }

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
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return apiSuccess({ success: true, unsubscribed: true });
  }

  return Response.redirect(`${appUrl}/?unsubscribed=1`, 303);
}
