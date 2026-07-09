"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { SETTINGS_ID } from "@/lib/settings";

export async function setMaintenanceMode(maintenanceMode: boolean) {
  const session = await requireRole(["ADMIN"]);

  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, maintenanceMode, updatedById: session.user.id },
    update: { maintenanceMode, updatedById: session.user.id },
  });

  await logAudit({
    actorId: session.user.id,
    action: "MAINTENANCE_MODE_CHANGED",
    metadata: { maintenanceMode },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}
