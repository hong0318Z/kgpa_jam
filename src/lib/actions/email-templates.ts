"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { EMAIL_TEMPLATE_DEFAULTS } from "@/lib/email-templates/registry";
import type { ActionResult } from "@/lib/actions/auth";

export async function getEmailTemplate(key: string) {
  const row = await prisma.emailTemplate.findUnique({ where: { key } });
  if (row) return { subject: row.subject, bodyHtml: row.bodyHtml };
  return EMAIL_TEMPLATE_DEFAULTS[key];
}

export async function updateEmailTemplate(
  key: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const subject = String(formData.get("subject") ?? "").trim();
  const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();
  if (!subject || !bodyHtml) {
    return { error: "제목과 본문을 모두 입력해 주세요." };
  }

  await prisma.emailTemplate.upsert({
    where: { key },
    update: { subject, bodyHtml, updatedById: session.user.id },
    create: { key, subject, bodyHtml, updatedById: session.user.id },
  });

  await logAudit({
    actorId: session.user.id,
    action: "EMAIL_TEMPLATE_UPDATED",
    targetType: "EmailTemplate",
    targetId: key,
  });

  revalidatePath("/admin/mail");
  return { success: "저장되었습니다." };
}

export async function resetEmailTemplate(key: string) {
  const session = await requireRole(ADMIN_ROLES);

  await prisma.emailTemplate.deleteMany({ where: { key } });

  await logAudit({
    actorId: session.user.id,
    action: "EMAIL_TEMPLATE_UPDATED",
    targetType: "EmailTemplate",
    targetId: key,
    metadata: { reset: true },
  });

  revalidatePath("/admin/mail");
}
