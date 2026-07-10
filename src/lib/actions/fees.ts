"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

const SETTINGS_ID = "singleton";

export async function getFeeSettings() {
  return prisma.feeSettings.findUnique({ where: { id: SETTINGS_ID } });
}

function toIntOrNull(value: FormDataEntryValue | null): number | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export async function updateFeeSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const data = {
    bankName: String(formData.get("bankName") ?? "").trim() || null,
    bankAccountNumber: String(formData.get("bankAccountNumber") ?? "").trim() || null,
    bankAccountHolder: String(formData.get("bankAccountHolder") ?? "").trim() || null,
    reviewPayoutPerReview: toIntOrNull(formData.get("reviewPayoutPerReview")),
    authorReviewFeePerSubmission: toIntOrNull(formData.get("authorReviewFeePerSubmission")),
    publicationFeePerPage: toIntOrNull(formData.get("publicationFeePerPage")),
    publicationFeeFlat: toIntOrNull(formData.get("publicationFeeFlat")),
    urgentPublicationFeeExtra: toIntOrNull(formData.get("urgentPublicationFeeExtra")),
  };

  await prisma.feeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { ...data, updatedById: session.user.id },
    create: { id: SETTINGS_ID, ...data, updatedById: session.user.id },
  });

  await logAudit({
    actorId: session.user.id,
    action: "FEE_SETTINGS_UPDATED",
    targetType: "FeeSettings",
    targetId: SETTINGS_ID,
  });

  revalidatePath("/admin/fees");
  return { success: "저장되었습니다." };
}
