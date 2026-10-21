"use server";

import path from "path";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveUploadedFile, saveUploadedImage, deleteStoredFile } from "@/lib/storage";
import type { ActionResult } from "@/lib/actions/auth";
import type { VolumeStatus, ConferenceFormat } from "@/generated/prisma/client";
import { CONFERENCE_FORMATS } from "@/lib/labels";

function parseFormats(formData: FormData): ConferenceFormat[] {
  return formData
    .getAll("conferenceFormats")
    .map(String)
    .filter((f): f is ConferenceFormat => (CONFERENCE_FORMATS as readonly string[]).includes(f));
}

const ALLOWED_EXT = [".pdf"];
const INFO_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type InfoImageResult =
  | { error: string }
  | { data: Record<string, string | number | null> };

async function buildInfoImageData(
  formData: FormData,
  current: { infoImageStoredPath: string | null } | null,
): Promise<InfoImageResult> {
  const file = formData.get("infoImage");
  const remove = formData.get("removeInfoImage") === "on";

  if (file instanceof File && file.size > 0) {
    if (!INFO_IMAGE_TYPES.includes(file.type)) {
      return { error: "안내 이미지는 JPG, PNG, WEBP만 업로드할 수 있습니다." };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { error: "안내 이미지는 10MB를 초과할 수 없습니다." };
    }
    if (current?.infoImageStoredPath) await deleteStoredFile(current.infoImageStoredPath);
    const saved = await saveUploadedImage("volume-info", file);
    return {
      data: {
        infoImageStoredPath: saved.storedPath,
        infoImageMimeType: saved.mimeType,
        infoImageSizeBytes: saved.sizeBytes,
      },
    };
  }
  if (remove && current?.infoImageStoredPath) {
    await deleteStoredFile(current.infoImageStoredPath);
    return {
      data: { infoImageStoredPath: null, infoImageMimeType: null, infoImageSizeBytes: null },
    };
  }
  return { data: {} };
}

export async function createVolume(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const label = String(formData.get("label") ?? "").trim();
  const callStartDate = String(formData.get("callStartDate") ?? "");
  const callEndDate = String(formData.get("callEndDate") ?? "");
  const plannedPublishDate = String(formData.get("plannedPublishDate") ?? "");
  const type = formData.get("type") === "CONFERENCE" ? "CONFERENCE" : "JOURNAL";
  if (type === "CONFERENCE" && parseFormats(formData).length === 0) {
    return { error: "학술대회는 접수 형식(포스터/논문/작품)을 하나 이상 선택해 주세요." };
  }

  if (!label || !callStartDate || !callEndDate || !plannedPublishDate) {
    return { error: "모든 항목을 입력해 주세요." };
  }

  const infoText = String(formData.get("infoText") ?? "").trim();
  const image = await buildInfoImageData(formData, null);
  if ("error" in image) return { error: image.error };

  const volume = await prisma.volume.create({
    data: {
      ...image.data,
      infoText: infoText || null,
      label,
      callStartDate: new Date(callStartDate),
      callEndDate: new Date(callEndDate),
      plannedPublishDate: new Date(plannedPublishDate),
      type,
      ...(type === "CONFERENCE" ? { conferenceFormats: parseFormats(formData) } : {}),
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

export async function updateVolumeDates(
  volumeId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const label = String(formData.get("label") ?? "").trim();
  const callStartDate = String(formData.get("callStartDate") ?? "");
  const callEndDate = String(formData.get("callEndDate") ?? "");
  const plannedPublishDate = String(formData.get("plannedPublishDate") ?? "");

  if (!label || !callStartDate || !callEndDate || !plannedPublishDate) {
    return { error: "호 이름, 모집기간, 발간예정일을 모두 입력해 주세요." };
  }
  const existing = await prisma.volume.findUnique({ where: { id: volumeId } });
  if (!existing) return { error: "존재하지 않는 호입니다." };
  const formats = parseFormats(formData);
  if (existing.type === "CONFERENCE" && formats.length === 0) {
    return { error: "접수 형식(포스터/논문/작품)을 하나 이상 선택해 주세요." };
  }
  if (new Date(callStartDate) > new Date(callEndDate)) {
    return { error: "모집 시작일이 종료일보다 늦을 수 없습니다." };
  }

  const infoText = String(formData.get("infoText") ?? "").trim();
  const image = await buildInfoImageData(formData, existing);
  if ("error" in image) return { error: image.error };

  await prisma.volume.update({
    where: { id: volumeId },
    data: {
      ...image.data,
      infoText: infoText || null,
      label,
      callStartDate: new Date(callStartDate),
      callEndDate: new Date(callEndDate),
      plannedPublishDate: new Date(plannedPublishDate),
      ...(existing.type === "CONFERENCE" ? { conferenceFormats: formats } : {}),
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: volumeId,
    metadata: { label, callStartDate, callEndDate, plannedPublishDate, formats },
  });

  revalidatePath("/admin/volumes");
  revalidatePath("/journal");
  revalidatePath(`/journal/${volumeId}`);
  revalidatePath("/conference");
  revalidatePath("/");
  return { success: "저장되었습니다." };
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

export async function deleteVolume(volumeId: string): Promise<{ error?: string }> {
  const session = await requireRole(ADMIN_ROLES);

  const volume = await prisma.volume.findUnique({
    where: { id: volumeId },
    include: { _count: { select: { submissions: true } } },
  });
  if (!volume) {
    return { error: "이미 삭제된 발행 호입니다." };
  }
  if (volume._count.submissions > 0) {
    return { error: "투고가 있는 발행 호는 삭제할 수 없습니다." };
  }

  if (volume.compiledFileStoredPath) {
    await deleteStoredFile(volume.compiledFileStoredPath);
  }
  if (volume.infoImageStoredPath) {
    await deleteStoredFile(volume.infoImageStoredPath);
  }

  await prisma.volume.delete({ where: { id: volumeId } });

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_DELETED",
    targetType: "Volume",
    targetId: volumeId,
    metadata: { label: volume.label },
  });

  revalidatePath("/admin/volumes");
  revalidatePath("/journal");
  return {};
}
