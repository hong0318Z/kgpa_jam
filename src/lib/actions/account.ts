"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireSession } from "@/lib/rbac";
import { signOut } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

export async function updateProfile(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const affiliation = String(formData.get("affiliation") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!affiliation || !phone) {
    return { error: "소속과 연락처를 입력해 주세요." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { affiliation, position: position || null, phone },
  });

  await logAudit({
    actorId: session.user.id,
    action: "USER_PROFILE_UPDATED",
    targetType: "User",
    targetId: session.user.id,
    metadata: { affiliation, position: position || null },
  });

  revalidatePath("/account");
  return { success: "정보가 저장되었습니다." };
}

export async function updatePreferredFields(fields: string[]) {
  const session = await requireSession();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { preferredFields: fields },
  });

  revalidatePath("/reviews");
}

export async function updateReviewerBankAccount(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const bankName = String(formData.get("bankName") ?? "").trim();
  const bankAccountNumber = String(formData.get("bankAccountNumber") ?? "").trim();
  const bankAccountHolder = String(formData.get("bankAccountHolder") ?? "").trim();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      reviewerBankName: bankName || null,
      reviewerBankAccountNumber: bankAccountNumber || null,
      reviewerBankAccountHolder: bankAccountHolder || null,
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: "REVIEWER_BANK_ACCOUNT_UPDATED",
    targetType: "User",
    targetId: session.user.id,
    metadata: { bankName: bankName || null, bankAccountHolder: bankAccountHolder || null },
  });

  revalidatePath("/reviews");
  return { success: "심사비 지급 계좌가 저장되었습니다." };
}

export async function changePassword(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const newPasswordConfirm = String(formData.get("newPasswordConfirm") ?? "");

  if (!currentPassword || !newPassword) {
    return { error: "현재 비밀번호와 새 비밀번호를 모두 입력해 주세요." };
  }
  if (newPassword.length < 8) {
    return { error: "새 비밀번호는 8자 이상이어야 합니다." };
  }
  if (newPassword !== newPasswordConfirm) {
    return { error: "새 비밀번호가 일치하지 않습니다." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (!user.passwordHash) {
    return { error: "구글 계정으로 로그인 중이므로 비밀번호를 변경할 수 없습니다." };
  }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "현재 비밀번호가 일치하지 않습니다." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  await logAudit({
    actorId: user.id,
    action: "PASSWORD_CHANGED",
    targetType: "User",
    targetId: user.id,
  });

  await signOut({ redirectTo: "/login" });
  return {};
}

export async function withdrawAccount(): Promise<{ error?: string }> {
  const session = await requireSession();

  const activeSubmissionCount = await prisma.submission.count({
    where: {
      authorId: session.user.id,
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED"] },
    },
  });
  if (activeSubmissionCount > 0) {
    return { error: "진행 중인 투고가 있어 탈퇴할 수 없습니다. 투고를 취소하거나 완료한 후 다시 시도해 주세요." };
  }

  const activeReviewCount = await prisma.reviewAssignment.count({
    where: {
      reviewerId: session.user.id,
      status: { in: ["ASSIGNED", "IN_PROGRESS"] },
    },
  });
  if (activeReviewCount > 0) {
    return { error: "진행 중인 심사가 있어 탈퇴할 수 없습니다. 심사를 완료한 후 다시 시도해 주세요." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      email: `withdrawn-${session.user.id}@withdrawn.local`,
      name: "탈퇴한 사용자",
      passwordHash: null,
      affiliation: null,
      position: null,
      phone: null,
      isActive: false,
      preferredFields: [],
      reviewerBankName: null,
      reviewerBankAccountNumber: null,
      reviewerBankAccountHolder: null,
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: "USER_WITHDRAWN",
    targetType: "User",
    targetId: session.user.id,
  });

  await signOut({ redirectTo: "/" });
  return {};
}
