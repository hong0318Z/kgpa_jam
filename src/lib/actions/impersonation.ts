"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, requireSession } from "@/lib/rbac";
import { updateSession, STOP_IMPERSONATION_MARKER } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function startImpersonation(testUserId: string) {
  const session = await requireRole(["ADMIN"]);

  const target = await prisma.user.findUnique({ where: { id: testUserId } });
  if (!target || !target.isTestAccount) {
    redirect("/forbidden");
  }

  await updateSession({ user: { id: testUserId } });
  await logAudit({
    actorId: session.user.id,
    action: "IMPERSONATION_STARTED",
    targetType: "User",
    targetId: target.id,
    metadata: { name: target.name, role: target.role },
  });
  redirect("/");
}

export async function stopImpersonation() {
  const session = await requireSession();
  const adminId = session.user.impersonatedByAdminId;

  await updateSession({ user: { id: STOP_IMPERSONATION_MARKER } });

  if (adminId) {
    await logAudit({
      actorId: adminId,
      action: "IMPERSONATION_STOPPED",
      targetType: "User",
      targetId: session.user.id,
      metadata: { name: session.user.name, role: session.user.role },
    });
  }
  redirect("/admin/users");
}
