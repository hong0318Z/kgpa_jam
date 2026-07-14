"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { SETTINGS_ID } from "@/lib/settings";
import { saveUploadedImage, deleteStoredFile } from "@/lib/storage";
import type { ActionResult } from "@/lib/actions/auth";

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

export async function updateOgSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(["ADMIN"]);

  const ogTitle = String(formData.get("ogTitle") ?? "").trim();
  const ogDescription = String(formData.get("ogDescription") ?? "").trim();
  const file = formData.get("ogImage");

  const data: {
    ogTitle: string | null;
    ogDescription: string | null;
    updatedById: string;
    ogImageStoredPath?: string;
    ogImageMimeType?: string;
    ogImageSizeBytes?: number;
  } = {
    ogTitle: ogTitle || null,
    ogDescription: ogDescription || null,
    updatedById: session.user.id,
  };

  if (file instanceof File && file.size > 0) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return { error: "JPG, PNG, WEBP 이미지만 업로드할 수 있습니다." };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { error: "이미지 크기는 10MB를 초과할 수 없습니다." };
    }

    const existing = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (existing?.ogImageStoredPath) {
      await deleteStoredFile(existing.ogImageStoredPath);
    }

    const saved = await saveUploadedImage("site-og", file);
    data.ogImageStoredPath = saved.storedPath;
    data.ogImageMimeType = saved.mimeType;
    data.ogImageSizeBytes = saved.sizeBytes;
  }

  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });

  await logAudit({
    actorId: session.user.id,
    action: "SITE_OG_SETTINGS_UPDATED",
    metadata: { ogTitle: ogTitle || null, imageChanged: !!data.ogImageStoredPath },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: "미리보기 설정이 저장되었습니다." };
}

export async function resetOgSettings(): Promise<{ error?: string }> {
  const session = await requireRole(["ADMIN"]);

  const existing = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing?.ogImageStoredPath) {
    await deleteStoredFile(existing.ogImageStoredPath);
  }

  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, updatedById: session.user.id },
    update: {
      ogTitle: null,
      ogDescription: null,
      ogImageStoredPath: null,
      ogImageMimeType: null,
      ogImageSizeBytes: null,
      updatedById: session.user.id,
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: "SITE_OG_SETTINGS_UPDATED",
    metadata: { reset: true },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return {};
}
