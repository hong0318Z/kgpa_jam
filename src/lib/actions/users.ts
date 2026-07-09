"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/client";
import { sendMail } from "@/lib/mail";
import { welcomeEmailHtml } from "@/lib/email-templates/welcome";

export async function changeUserRole(userId: string, role: Role) {
  const session = await requireRole(["ADMIN"]);

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.user.update({ where: { id: userId }, data: { role } });

  await logAudit({
    actorId: session.user.id,
    action: "USER_ROLE_CHANGED",
    targetType: "User",
    targetId: userId,
    metadata: { from: target.role, to: role },
  });

  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const session = await requireRole(ADMIN_ROLES);

  await prisma.user.update({ where: { id: userId }, data: { isActive } });

  await logAudit({
    actorId: session.user.id,
    action: "USER_ROLE_CHANGED",
    targetType: "User",
    targetId: userId,
    metadata: { isActive },
  });

  revalidatePath("/admin/users");
}

export async function bulkChangeRole(userIds: string[], role: Role) {
  const session = await requireRole(["ADMIN"]);
  if (userIds.length === 0) return;

  await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { role } });

  await logAudit({
    actorId: session.user.id,
    action: "USER_ROLE_CHANGED",
    metadata: { userIds, to: role, bulk: true, count: userIds.length },
  });

  revalidatePath("/admin/users");
}

export async function bulkSetActive(userIds: string[], isActive: boolean) {
  const session = await requireRole(ADMIN_ROLES);
  if (userIds.length === 0) return;

  await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { isActive } });

  await logAudit({
    actorId: session.user.id,
    action: "USER_ROLE_CHANGED",
    metadata: { isActive, bulk: true, count: userIds.length },
  });

  revalidatePath("/admin/users");
}

export async function sendWelcomeEmail(userId: string): Promise<{ error?: string }> {
  const session = await requireRole(ADMIN_ROLES);

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  try {
    await sendMail({
      to: target.email,
      subject: "[한국게임정책학회] 「인터랙티브미디어저널」 회원가입을 환영합니다",
      html: welcomeEmailHtml({
        name: target.name,
        loginUrl: `${process.env.NEXTAUTH_URL ?? ""}/login`,
      }),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "메일 발송에 실패했습니다." };
  }

  await logAudit({
    actorId: session.user.id,
    action: "WELCOME_EMAIL_SENT",
    targetType: "User",
    targetId: userId,
    metadata: { email: target.email },
  });

  return {};
}

export async function resetPassword(userId: string) {
  const session = await requireRole(["ADMIN"]);

  const passwordHash = await bcrypt.hash("123456", 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: true },
  });

  await logAudit({
    actorId: session.user.id,
    action: "PASSWORD_RESET",
    targetType: "User",
    targetId: userId,
  });

  revalidatePath("/admin/users");
}
