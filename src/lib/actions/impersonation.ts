"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, requireSession } from "@/lib/rbac";
import { updateSession, STOP_IMPERSONATION_MARKER } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function startImpersonation(targetUserId: string) {
  const session = await requireRole(["ADMIN"]);

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target || !(target.isTestAccount || target.role === "REVIEWER")) {
    redirect("/forbidden");
  }

  await updateSession({ user: { id: targetUserId } });
  await logAudit({
    actorId: target.id,
    action: "LOGIN",
    targetType: "User",
    targetId: target.id,
  });
  redirect("/");
}

export async function stopImpersonation() {
  await requireSession();
  await updateSession({ user: { id: STOP_IMPERSONATION_MARKER } });
  redirect("/admin/users");
}
