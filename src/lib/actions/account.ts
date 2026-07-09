"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireSession } from "@/lib/rbac";
import { signOut } from "@/lib/auth";
import type { ActionResult } from "@/lib/actions/auth";

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
