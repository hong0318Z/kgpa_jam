"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

export async function createNotice(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(["EDITOR"]);

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
  const session = await requireRole(["EDITOR"]);

  await prisma.notice.delete({ where: { id: noticeId } });

  await logAudit({
    actorId: session.user.id,
    action: "NOTICE_DELETED",
    targetType: "Notice",
    targetId: noticeId,
  });

  revalidatePath("/notices");
}
