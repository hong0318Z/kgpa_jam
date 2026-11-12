"use server";

import path from "path";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { saveUploadedFile, saveUploadedImage, deleteStoredFile } from "@/lib/storage";
import { invalidatePosterThumbnail } from "@/lib/poster-thumb";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

const KEYNOTE_FILE_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function revalidateConference(volumeId: string) {
  revalidatePath("/conference");
  revalidatePath(`/journal/${volumeId}`);
  revalidatePath("/admin/volumes");
}

// ── 축사 ──────────────────────────────────────────────

export async function addGreeting(
  volumeId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const name = String(formData.get("name") ?? "").trim();
  const org = String(formData.get("org") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const photo = formData.get("photo");

  if (!name || !body) return { error: "성명과 축사 내용을 입력해 주세요." };

  const data: {
    volumeId: string;
    name: string;
    org: string | null;
    body: string;
    photoStoredPath?: string;
    photoMimeType?: string;
  } = { volumeId, name, org: org || null, body };

  if (photo instanceof File && photo.size > 0) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
      return { error: "사진은 JPG, PNG, WEBP만 업로드할 수 있습니다." };
    }
    const saved = await saveUploadedImage("conference-greetings", photo);
    data.photoStoredPath = saved.storedPath;
    data.photoMimeType = saved.mimeType;
  }

  await prisma.conferenceGreeting.create({ data });
  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: volumeId,
    metadata: { greetingAdded: name },
  });
  revalidateConference(volumeId);
  return { success: "축사가 등록되었습니다." };
}

export async function deleteGreeting(id: string): Promise<{ error?: string }> {
  const session = await requireRole(ADMIN_ROLES);
  const greeting = await prisma.conferenceGreeting.findUnique({ where: { id } });
  if (!greeting) return { error: "이미 삭제되었습니다." };

  await prisma.conferenceGreeting.delete({ where: { id } });
  if (greeting.photoStoredPath) await deleteStoredFile(greeting.photoStoredPath);

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: greeting.volumeId,
    metadata: { greetingDeleted: greeting.name },
  });
  revalidateConference(greeting.volumeId);
  return {};
}

// ── 특강/키노트 ──────────────────────────────────────────

export async function addKeynote(
  volumeId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const title = String(formData.get("title") ?? "").trim();
  const speaker = String(formData.get("speaker") ?? "").trim();
  const timeLabel = String(formData.get("timeLabel") ?? "").trim();
  const file = formData.get("file");

  if (!title || !speaker) return { error: "제목과 발표자를 입력해 주세요." };

  const data: {
    volumeId: string;
    title: string;
    speaker: string;
    timeLabel: string | null;
    storedPath?: string;
    originalName?: string;
    mimeType?: string;
  } = { volumeId, title, speaker, timeLabel: timeLabel || null };

  if (file instanceof File && file.size > 0) {
    const ext = path.extname(file.name).toLowerCase();
    const mimeType = KEYNOTE_FILE_EXT[ext];
    if (!mimeType) return { error: "발표자료는 PDF, PPT, PPTX만 업로드할 수 있습니다." };
    if (file.size > 100 * 1024 * 1024) return { error: "파일 크기는 100MB를 초과할 수 없습니다." };
    const saved = await saveUploadedFile(`volumes/${volumeId}/keynotes`, file);
    data.storedPath = saved.storedPath;
    data.originalName = saved.originalName;
    data.mimeType = mimeType;
  }

  await prisma.conferenceKeynote.create({ data });
  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: volumeId,
    metadata: { keynoteAdded: title },
  });
  revalidateConference(volumeId);
  return { success: "특강이 등록되었습니다." };
}

export async function deleteKeynote(id: string): Promise<{ error?: string }> {
  const session = await requireRole(ADMIN_ROLES);
  const keynote = await prisma.conferenceKeynote.findUnique({ where: { id } });
  if (!keynote) return { error: "이미 삭제되었습니다." };

  await prisma.conferenceKeynote.delete({ where: { id } });
  if (keynote.storedPath) {
    await deleteStoredFile(keynote.storedPath);
    await invalidatePosterThumbnail(keynote.id);
  }

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: keynote.volumeId,
    metadata: { keynoteDeleted: keynote.title },
  });
  revalidateConference(keynote.volumeId);
  return {};
}

// ── 현장 스케치 ──────────────────────────────────────────

export async function addPhoto(
  volumeId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const caption = String(formData.get("caption") ?? "").trim();
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) return { error: "사진을 첨부해 주세요." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "JPG, PNG, WEBP 사진만 업로드할 수 있습니다." };
  }

  const saved = await saveUploadedImage("conference-photos", file);
  await prisma.conferencePhoto.create({
    data: { volumeId, caption: caption || null, ...saved },
  });

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: volumeId,
    metadata: { photoAdded: true },
  });
  revalidateConference(volumeId);
  return { success: "사진이 등록되었습니다." };
}

export async function deletePhoto(id: string): Promise<{ error?: string }> {
  const session = await requireRole(ADMIN_ROLES);
  const photo = await prisma.conferencePhoto.findUnique({ where: { id } });
  if (!photo) return { error: "이미 삭제되었습니다." };

  await prisma.conferencePhoto.delete({ where: { id } });
  await deleteStoredFile(photo.storedPath);

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: photo.volumeId,
  });
  revalidateConference(photo.volumeId);
  return {};
}

// ── 히어로 정보(장소/주최) ──────────────────────────────────

export async function updateVolumeHero(
  volumeId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const location = String(formData.get("location") ?? "").trim();
  const host = String(formData.get("host") ?? "").trim();

  await prisma.volume.update({
    where: { id: volumeId },
    data: { location: location || null, host: host || null },
  });

  await logAudit({
    actorId: session.user.id,
    action: "VOLUME_UPDATED",
    targetType: "Volume",
    targetId: volumeId,
    metadata: { location: location || null, host: host || null },
  });
  revalidateConference(volumeId);
  return { success: "저장되었습니다." };
}
