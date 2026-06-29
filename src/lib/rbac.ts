import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";

export const ADMIN_ROLES: Role[] = ["EDITOR", "CHIEF_EDITOR", "ADMIN"];

export class ForbiddenError extends Error {
  status = 403;
}

export class UnauthorizedError extends Error {
  status = 401;
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError("권한이 없습니다.");
  }
  return session;
}

export function requireOwnership(userId: string, resourceOwnerId: string) {
  if (userId !== resourceOwnerId) {
    throw new ForbiddenError("본인 소유의 자원만 접근할 수 있습니다.");
  }
}
