"use server";

import path from "path";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { saveUploadedImage } from "@/lib/storage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

export async function uploadNoticeImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireRole(ADMIN_ROLES);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "이미지 파일을 선택해 주세요." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "이미지 파일만 업로드할 수 있습니다." };
  }

  const { storedPath } = await saveUploadedImage("notice-images", file);
  return { url: `/api/notice-images/${path.basename(storedPath)}` };
}

export async function createNotice(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isPinned = formData.get("isPinned") === "on";

  if (!title || !content) {
    return { error: "제목과 내용을 입력해 주세요." };
  }

  const notice = await prisma.notice.create({
    data: { title, content, isPinned, authorId: session.user.id },
  });

  await logAudit({
    actorId: session.user.id,
    action: "NOTICE_CREATED",
    targetType: "Notice",
    targetId: notice.id,
    metadata: { title },
  });

  redirect("/notices");
}

export async function deleteNotice(noticeId: string) {
  const session = await requireRole(ADMIN_ROLES);

  await prisma.notice.delete({ where: { id: noticeId } });

  await logAudit({
    actorId: session.user.id,
    action: "NOTICE_DELETED",
    targetType: "Notice",
    targetId: noticeId,
  });

  revalidatePath("/notices");
}
