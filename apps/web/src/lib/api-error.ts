import { NextResponse } from "next/server";
import type { ZodSchema, ZodError } from "zod";

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status },
  );
}

export function apiSuccess<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function validationError(error: ZodError): NextResponse<ApiErrorBody> {
  return apiError(
    "VALIDATION_ERROR",
    error.issues[0]?.message ?? "Invalid input.",
    400,
    error.flatten(),
  );
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse<ApiErrorBody> }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: apiError("INVALID_JSON", "Request body must be valid JSON.", 400) };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, response: validationError(parsed.error) };
  }

  return { ok: true, data: parsed.data };
}

export function isPrismaNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  );
}
