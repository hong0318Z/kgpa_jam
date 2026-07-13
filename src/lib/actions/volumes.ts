"use server";

import path from "path";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveUploadedFile, deleteStoredFile } from "@/lib/storage";
import type { ActionResult } from "@/lib/actions/auth";
import type { VolumeStatus } from "@/generated/prisma/client";

const ALLOWED_EXT = [".pdf"];

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

export async function uploadCompiledVolumeFile(
  volumeId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "파일을 첨부해 주세요." };
  }
  if (!ALLOWED_EXT.includes(path.extname(file.name).toLowerCase())) {
    return { error: "PDF 파일만 업로드할 수 있습니다." };
  }
  if (file.size > 100 * 1024 * 1024) {
    return { error: "파일 크기는 100MB를 초과할 수 없습니다." };
  }

  const volume = await prisma.volume.findUniqueOrThrow({ where: { id: volumeId } });
  if (volume.compiledFileStoredPath) {
    await deleteStoredFile(volume.compiledFileStoredPath);
  }

  const saved = await saveUploadedFile(`volumes/${volumeId}`, file);
  await prisma.volume.update({
    where: { id: volumeId },
    data: {
      compiledFileStoredPath: saved.storedPath,
      compiledFileOriginalName: saved.originalName,
      compiledFileMimeType: saved.mimeType,
      compiledFileSizeBytes: saved.sizeBytes,
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: volumeId,
    metadata: { compiledFileUploaded: saved.originalName },
  });

  revalidatePath("/admin/volumes");
  revalidatePath("/journal");
  revalidatePath(`/journal/${volumeId}`);
  return { success: "합본 파일이 업로드되었습니다." };
}
