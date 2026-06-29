"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";
import type { VolumeStatus } from "@/generated/prisma/client";

export async function createVolume(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const label = String(formData.get("label") ?? "").trim();
  const callStartDate = String(formData.get("callStartDate") ?? "");
  const callEndDate = String(formData.get("callEndDate") ?? "");
  const plannedPublishDate = String(formData.get("plannedPublishDate") ?? "");

  if (!label || !callStartDate || !callEndDate || !plannedPublishDate) {
    return { error: "모든 항목을 입력해 주세요." };
  }

  const volume = await prisma.volume.create({
    data: {
      label,
      callStartDate: new Date(callStartDate),
      callEndDate: new Date(callEndDate),
      plannedPublishDate: new Date(plannedPublishDate),
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_CREATED",
    targetType: "Volume",
    targetId: volume.id,
    metadata: { label },
  });

  redirect("/admin/volumes");
}

export async function updateVolumeStatus(volumeId: string, status: VolumeStatus) {
  const session = await requireRole(ADMIN_ROLES);

  await prisma.volume.update({ where: { id: volumeId }, data: { status } });

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: volumeId,
    metadata: { status },
  });

  revalidatePath("/admin/volumes");
}
