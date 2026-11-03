import { prisma } from "@iamcooked/db";
import { auth } from "./auth";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}

export async function isAdminEmail(email: string): Promise<boolean> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });

  if (!dbUser) return null;

  const adminByRole = dbUser.role === "ADMIN";
  const adminByEmail = await isAdminEmail(dbUser.email);

  if (!adminByRole && !adminByEmail) return null;

  if (!adminByRole && adminByEmail) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: "ADMIN" },
    });
  }

  return { id: dbUser.id, email: dbUser.email, role: "ADMIN" as const };
}
