"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/client";

export async function changeUserRole(userId: string, role: Role) {
  const session = await requireRole(["ADMIN"]);

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.user.update({ where: { id: userId }, data: { role } });

  await logAudit({
    actorId: session.user.id,
    action: "USER_ROLE_CHANGED",
    targetType: "User",
    targetId: userId,
    metadata: { from: target.role, to: role },
  });

  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const session = await requireRole(ADMIN_ROLES);

  await prisma.user.update({ where: { id: userId }, data: { isActive } });

  await logAudit({
    actorId: session.user.id,
    action: "USER_ROLE_CHANGED",
    targetType: "User",
    targetId: userId,
    metadata: { isActive },
  });

  revalidatePath("/admin/users");
}

export async function resetPassword(userId: string) {
  const session = await requireRole(["ADMIN"]);

  const passwordHash = await bcrypt.hash("123456", 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: true },
  });

  await logAudit({
    actorId: session.user.id,
    action: "PASSWORD_RESET",
    targetType: "User",
    targetId: userId,
  });

  revalidatePath("/admin/users");
}
