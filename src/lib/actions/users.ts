"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/client";

export async function changeUserRole(userId: string, role: Role) {
  const session = await requireRole(["EDITOR"]);

  await prisma.user.update({ where: { id: userId }, data: { role } });

  await logAudit({
    actorId: session.user.id,
    action: "USER_ROLE_CHANGED",
    targetType: "User",
    targetId: userId,
    metadata: { role },
  });

  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const session = await requireRole(["EDITOR"]);

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
