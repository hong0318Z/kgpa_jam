"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { sendMail } from "@/lib/mail";
import { getEmailTemplate } from "@/lib/actions/email-templates";
import { wrapEmailShell } from "@/lib/email-templates/welcome";
import type { ActionResult } from "@/lib/actions/auth";

const CODE_TTL_MS = 10 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestPasswordResetCode(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "이메일을 입력해 주세요." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.passwordResetCode.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetCode.create({
      data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    });

    // 메일 발송은 응답을 지연시키지 않도록 완료를 기다리지 않는다.
    void (async () => {
      try {
        const template = await getEmailTemplate("password_reset_code");
        const fill = (s: string) => s.replaceAll("{{code}}", code);
        await sendMail({
          to: user.email,
          subject: fill(template.subject),
          html: wrapEmailShell(fill(template.bodyHtml)),
          templateKey: "password_reset_code",
        });
      } catch (e) {
        console.error("[mail] password_reset_code send failed:", e);
      }
    })();
  }

  // 이메일 존재 여부와 무관하게 동일한 안내 메시지를 반환한다 (계정 존재 여부 노출 방지).
  return { success: "입력하신 이메일이 가입되어 있다면 인증번호를 발송했습니다." };
}

export async function resetPasswordWithCode(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const newPasswordConfirm = String(formData.get("newPasswordConfirm") ?? "");

  if (!email || !code || !newPassword) {
    return { error: "모든 항목을 입력해 주세요." };
  }
  if (newPassword.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (newPassword !== newPasswordConfirm) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "인증번호가 올바르지 않거나 만료되었습니다." };
  }

  const candidates = await prisma.passwordResetCode.findMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  let matched: (typeof candidates)[number] | null = null;
  for (const candidate of candidates) {
    if (await bcrypt.compare(code, candidate.codeHash)) {
      matched = candidate;
      break;
    }
  }
  if (!matched) {
    return { error: "인증번호가 올바르지 않거나 만료되었습니다." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false },
    }),
    prisma.passwordResetCode.update({ where: { id: matched.id }, data: { usedAt: new Date() } }),
  ]);

  await logAudit({
    actorId: user.id,
    action: "PASSWORD_RESET",
    targetType: "User",
    targetId: user.id,
    metadata: { via: "email_code" },
  });

  return { success: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요." };
}
