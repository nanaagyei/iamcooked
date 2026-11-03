"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createFixTask } from "@/lib/db/queries";

export async function createFixTaskAction(input: {
  packageName: string;
  fromVersion?: string | null;
  toVersion?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Not signed in" };
  }

  await createFixTask(session.user.id, {
    packageName: input.packageName,
    fromVersion: input.fromVersion,
    toVersion: input.toVersion,
    title: `Patch ${input.packageName}${input.toVersion ? ` → ${input.toVersion}` : ""}`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/dependencies");
  return { ok: true as const };
}
